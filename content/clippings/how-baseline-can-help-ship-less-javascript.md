---
title: Baseline 如何帮你减少 JavaScript 打包量
description: 一个实用的依赖审计指南——审查你的 node_modules，找出那些浏览器已经原生支持的功能，从而减少 JS 打包体积
tags:
  - javascript
  - baseline
  - web-platform
  - bundle-size
  - frontend
  - performance
  - clippings
source: https://www.smashingmagazine.com/2026/08/how-baseline-can-help-ship-less-javascript/
original_author: Jad Joubran
original_date: 2026-08
---

## 概述

大多数人在安装依赖后就不再回头看它。它能用、测试通过，就过了。但 Web 平台也在不断演进，令人惊讶的是，你 `package.json` 里许多库的功能现在已经被浏览器原生支持了。

在一个典型的中型 JavaScript 应用中，你通常能找到大约 60KB 到 90KB（minified + gzipped）的依赖，这些功能现在浏览器自己就能处理。日期和数字格式化、HTTP 请求、模态框、工具提示、深拷贝、数组分组——这些几年前确实是缺口，但现在很多已经不再是了。

这些库之所以一直存在，不是因为懒惰。而是大多数团队不会按 Baseline 的节奏重新审计依赖，或者根本不知道浏览器发布特性有多快。你会跑 `npm audit` 检查安全漏洞，但"这个库做的是不是浏览器已经能做到的事？"这个问题很少被问起。所以库就一直留着了。

本文将带你一起做一次审计。先把依赖按类别分组来分析，因为优化点往往集中出现。然后做打包体积计算，构建一个可复用的决策框架，并诚实面对那些平台还无法替代的场景。读完你将有一个可在自己 `package.json` 上重复使用的流程。

## "Baseline" 到底是什么意思

在开始删除之前，先快速回顾一下 Baseline 是什么。如果你已经熟悉可以跳过。

Baseline 是 WebDX 社区组的项目，用通俗的方式告诉你一个 Web 特性在所有主流浏览器（Chrome、Edge、Firefox、Safari）上的安全性。特性有三种状态：

- **Limited availability**（有限可用）：特性尚未在所有主流引擎中发布，依赖它时需要 fallback。
- **Baseline Newly available**（新近可用）：特性刚在所有主流引擎中落地，使用最新浏览器的用户可用，但野生的旧设备可能还没有。
- **Baseline Widely available**（广泛可用）：特性在所有主流引擎中存在 30 个月以上，此时可以放心使用，无需过多顾虑。

Newly 和 Widely 之间这 30 个月的间隔对审计很重要。Widely available 的特性通常可以直接替换库。Newly available 的特性需要先确认你的用户受众，或者做好特性检测后再替换。文中会对这两种情况区别对待。

你可以在 webstatus.dev 查找任何特性、在 MDN 上每个参考页面顶部都有 Baseline 徽标，或通过 `web-features` npm 包以程序化方式查询。后面会在实际项目审计中用到这三种方式。

## 删除前的决策框架

听到"浏览器现在能做这个了"就迫不及待删库是很诱人的，但不要急。一个看起来零成本的替换可能悄悄影响一部分用户，或者让你在不知不觉中丢掉了某些依赖的功能。

所以在替换任何库之前，先问三个问题：

**1. 替换方案对我的受众 Basline 安全吗？**

不是抽象的"这个特性是否 Baseline"，而是"对我的实际用户安全吗"。如果原生特性是 Widely available，答案通常是肯定的。如果只是 Newly available，需要检查你的分析数据或 `browserslist` 配置，看看有多少用户会被遗漏。一个所有人都在最新浏览器上的 B2B 后台，跟一个有大量旧 Android 设备的公网站点，情况完全不同。

**2. 替换的实际成本是多少？**

移除一个库不总是免费的。有时原生特性还不够广泛，你需要使用 polyfill。如果 polyfill 比你要删的库还大，你就反而把包体变大了——除非你条件加载。后面 Temporal 的案例会看到这点。

**3. 平台特性是否覆盖我真实的使用场景？**

库通常比表面上类似的原生特性做得更多。`axios` 不仅仅是自动 JSON 解析的 `fetch`，它还有拦截器、请求取消和重试。如果你在用这些功能，直接换到 `fetch` 就得自己重新实现。在假定可以直接替换之前，先检查你实际用到了什么。

## 分类 1：国际化（收益最大的一类）

这是通常能找到最多 KB 冗余的分类——这些功能对应的原生 API 已经是 Widely available 了。浏览器在 `Intl` 命名空间下提供了一整套格式化工具，许多小而流行的库变得不再必要。

常见可替换项目：

- `timeago.js`（1 KB gz）→ `Intl.RelativeTimeFormat`
- `pluralize`（2.3 KB gz）→ `Intl.PluralRules`
- `numeral`（3.9 KB gz）→ `Intl.NumberFormat`
- `humanize-duration`（6.6 KB gz）→ `Intl.DurationFormat`
- 列表拼接辅助函数 → `Intl.ListFormat`

### 相对时间

`timeago.js` 用来把时间戳转成"3 小时前"。`Intl.RelativeTimeFormat` 做同样的事，且是 Baseline Widely available。

```js
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

rtf.format(-1, "day") // "yesterday"
rtf.format(3, "hour") // "in 3 hours"
rtf.format(-2, "week") // "2 weeks ago"
```

`numeric: "auto"` 选项很不错：在语言有对应词汇时会给出"yesterday"而不是"1 day ago"。你传入数字和单位，它会返回本地化字符串。

你可能注意到 `timeago.js` 做了一件事这个代码片段没有做的：自动选择合适的单位。给定一个日期，`timeago.js` 决定说"秒"还是"天"。`Intl.RelativeTimeFormat` 需要你来做这部分。写几行算术（计算差值，找到能用的最大单位），有了这个辅助函数就不再需要这个库了。

### 数字、货币和列表

`Intl.NumberFormat` 覆盖了大多数数字格式化库的功能：千位分隔符、货币、百分比和紧凑表示法。

```js
new Intl.NumberFormat("en-US").format(1234567.89)
// "1,234,567.89"

new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234.5)
// "$1,234.50"

new Intl.NumberFormat("en", { notation: "compact" }).format(1200000)
// "1.2M"
```

`Intl.ListFormat`（Widely available）处理"把数组拼成句子"的问题，包括 Oxford 逗号，这正是人们常写繁琐辅助函数处理的事情：

```js
const lf = new Intl.ListFormat("en", { style: "long", type: "conjunction" })

lf.format(["Alice", "Bob", "Carol"])
// "Alice, Bob, and Carol"
```

### 一个注意事项：时长

`humanize-duration` 把毫秒数转成"1 小时 30 分钟"。平台对应的是 `Intl.DurationFormat`：

```js
const df = new Intl.DurationFormat("en", { style: "long" })

df.format({ hours: 1, minutes: 30 })
// "1 hour, 30 minutes"
```

需要留意的是 `Intl.DurationFormat` 目前只是 Baseline Newly available，而非 Widely available。它在 2025 年 3 月才在所有主流引擎落地，预计 2027 年达到 Widely available。所以对于广受众的应用，这个替换不满足问题 1，除非先查流量或加 fallback。对于现代浏览器的内部工具来说今天就能用。对于有旧设备的公网站点，再等一年或用特性检测守卫。

### 这一分类的数学

如果你的应用用了上述全套（`humanize-duration`、`timeago.js`、`pluralize`、`numeral`），大约 14 KB gzipped 的依赖，大部分现在就可以用 Widely available 的 API 替换。国际化分类通常是整个审计里最容易拿到的收益。

## 分类 2：HTTP 客户端

这个分类需要更细致地分析。常用的浏览器 HTTP 库是 `axios`（17 KB gz）和 `superagent`（19 KB gz）。对于大多数请求，`fetch` 加 `AbortController` 能满足需求，两者都是 Widely available。

一个基础 GET 请求：

```js
// axios
const { data } = await axios.get("/api/users")

// fetch
const res = await fetch("/api/users")
const data = await res.json()
```

多出来的一行（`res.json()`）是 `fetch` 显式处理的体现，而 `axios` 是隐式的。这就是这一分类的通病：`fetch` 默认做更少的事，你需要自己决定要不要它不做的那部分。

### 超时

`axios` 有 `timeout` 选项。`fetch` 有 `AbortSignal.timeout()`：

```js
const res = await fetch("/api/users", {
  signal: AbortSignal.timeout(5000), // 5 秒后中止
})
```

### fetch 不能替代 axios 的地方

问题 3 在这里最起作用，具体差距如下：

- **`fetch` 不会在 HTTP 错误时 reject。** `404` 或 `500` 是 resolved promise，不是 rejection。你需要自己检查 `res.ok`。`axios` 对任何非 2xx 状态码都 reject。
- **没有拦截器。** 如果你依赖 `axios` 拦截器来统一附加认证令牌或处理 401，`fetch` 没有等价物。你需要封装自己的函数或类来实现相同行为。
- **没有自动重试。** `axios`（配合插件）可以重试失败请求。用 `fetch` 的话，这部分代码得自己写。
- **没有上传进度。** `fetch` 仍然无法以第一优先级方式报告上传进度。如果你有带进度条的文件上传功能，那有充分理由保留库。

作者个人在互动式在线课程中重度依赖拦截器，多年来通过一个基于 `fetch` 的自定义 class 解决了这个问题，已为数百万用户提供服务且非常成功。

这些都不是难以重建的，而且大多数应用只用其中一两个。但这也正是你不应该盲目做查找替换的分类。先看看你实际如何使用 HTTP 客户端。如果只是简单的 GET 和 POST，用一层薄 `fetch` 封装替换 `axios` 能节省约 17 KB gzipped。

## 分类 3：UI 原语

这个分类有一些最令人满意的替换，因为平台特性不仅匹配了库，而且通常比团队手写的方案更易访问。

这里涉及的库：模态对话框（如 `a11y-dialog`，1.8 KB gz）、工具提示和弹出框库（`tippy.js`，14 KB gz，内嵌 Popper 做定位）、`focus-trap`（6.6 KB gz）、`body-scroll-lock`（1.3 KB gz）。它们被三个平台特性替代：`<dialog>` 元素、Popover API 和 CSS anchor positioning。

### `<dialog>` 元素

大量模态框相关代码是用来解决无障碍问题的：将焦点锁定在模态框内、按 Escape 关闭、关闭后将焦点恢复到之前的元素、渲染在所有内容之上。`<dialog>` 元素（Widely available）替你做了所有这些。

```html
<dialog id="confirm">
  <form method="dialog">
    <p>Delete this file?</p>
    <button value="cancel">Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
```

```js
const dialog = document.querySelector("#confirm")

dialog.showModal() // 焦点移入，背景变 inert，Escape 关闭

dialog.addEventListener("close", () => {
  console.log(dialog.returnValue) // "cancel" or "delete"
})
```

调用 `showModal()` 做了 `focus-trap` 被安装来做的事：焦点移入对话框，页面其余部分变为 inert 导致无法 Tab 出去，Escape 关闭，焦点恢复到打开它的元素。对话框渲染在浏览器的 Top layer 中，所以你不需要跟 `z-index` 较劲。你还可以用 `::backdrop` 伪元素来样式化遮罩层。

这一个元素就可以替换你的模态框库和 `focus-trap`。它自己没处理的一件事是锁定背景滚动——以前是 `body-scroll-lock` 做的。现在用一行 CSS 即可：

```css
body:has(dialog:modal) {
  overflow: hidden;
}
```

为什么用 `dialog:modal` 而不是 `dialog[open]`？因为调用 `show()` 时 `open` 属性就会被设置，但此时对话框不是真正的模态框，你不应该锁定滚动。`:modal` 伪类只有在对话框真正模态时（即调用 `showModal()`）才为 true。

所以三个库折叠成了一个元素加一条 CSS 规则。

### Popover API 和 Anchor Positioning

对于那些不是完整模态框的东西（下拉菜单、工具提示、`tippy.js` 处理的小型浮动面板），Popover API 提供了轻量关闭行为、Top layer 渲染和 Escape 关闭，完全不需要 JavaScript：

```html
<button popovertarget="menu" id="options">Options</button>

<div id="menu" popover>
  <!-- menu content -->
</div>
```

点击按钮切换 popover。点击外部关闭它。它是 Baseline Newly available（自 2025 年 1 月）。

工具提示库做的另一半工作是定位：把浮动元素固定到触发器上并在超出视口时翻转。这是 Popper（内嵌在 `tippy.js` 中）处理的事情，现在它变成了名为 anchor positioning 的 CSS 特性。下面把同一个 `#menu` popover 精确固定在其触发按钮下方：

```css
#options {
  anchor-name: --trigger;
}

.tooltip {
  position-anchor: --trigger;
  position-area: top;
  margin: 0;
}
```

Anchor positioning 是本文中最新的特性。它在 2026 年 1 月变为 Baseline Newly available，当时 Firefox 147 发布了它（Chrome 自 125 版本就有了，Safari 自 26 版本）。由于它这么新，这明显是问题 1 的场景：对现代用户群体友好，但要检查你的流量数据，并注意一些更高级的部分（如 position-try fallbacks）在各个版本中支持不均衡。为旧浏览器保留合理的 fallback。

在 `<dialog>`、Popover API 和 anchor positioning 之间，UI 原语分类（工具提示库、模态框库、`focus-trap`、`body-scroll-lock`）加起来大约 24 KB gzipped，而且最终你得到的是比大多数手写方案更好的无障碍默认行为。

## 分类 4：Lodash 工具函数

Lodash 很少再整包引入，但它的单个函数随处可见，要么是完整 `lodash` 包（25 KB gz），要么是单独安装的如 `lodash.clonedeep` 和 `lodash.groupby`。几个最常用的函数现在有了直接的原生等价物。

### 分组

`lodash.groupby` 按某个属性把数组重组成对象。`Object.groupBy` 做完全一样的事：

```js
const products = [
  { name: "Apple", category: "fruit" },
  { name: "Carrot", category: "vegetable" },
  { name: "Banana", category: "fruit" },
]

const grouped = Object.groupBy(products, (product) => product.category)
// {
//   fruit: [{ name: "Apple", ... }, { name: "Banana", ... }],
//   vegetable: [{ name: "Carrot", ... }],
// }
```

还有 `Map.groupBy` 用于想要 `Map` 而非普通对象的场景（键不是字符串时很有用）。两者都是 Baseline Newly available（自 2024 年 3 月），预计 2026 年底达到 Widely available。

### 深拷贝

`lodash.clonedeep` 做对象的深拷贝。`structuredClone` 是平台版本，且是 Widely available：

```js
const original = { user: { name: "Sam", roles: ["admin"] } }

const copy = structuredClone(original)
copy.user.roles.push("editor")

original.user.roles // ["admin"] (未改变)
```

`structuredClone` 正确处理了 `JSON.parse(JSON.stringify(...))` 难以应对的情况：它正确克隆 `Date`、`Map`、`Set`、`ArrayBuffer` 和循环引用。需要知道的一个限制（又回到问题 3）是它不能克隆函数、DOM 节点或类实例——对函数会抛出异常，对类实例会丢弃原型。对于纯数据（大多数人深拷贝的对象），它是一个干净的替换。

### Set 操作

如果你曾经引入过 Lodash 的 `union`、`intersection` 或 `difference` 辅助函数，`Set` 对象现在内置了这些。它们是 Baseline Newly available（自 2024 年 6 月）：

```js
const admins = new Set(["sam", "alex", "jo"])
const editors = new Set(["alex", "kim"])

admins.intersection(editors) // Set { "alex" }
admins.union(editors) // Set { "sam", "alex", "jo", "kim" }
admins.difference(editors) // Set { "sam", "jo" }
```

完整方法集是 `union`、`intersection`、`difference`、`symmetricDifference`、`isSubsetOf`、`isSupersetOf` 和 `isDisjointFrom`。

### 哪些值得保留

不是所有 Lodash 功能都进了平台。`debounce` 和 `throttle` 仍然没有原生的等价物，而且它们确实有用，按需引入 `lodash.debounce` 是合理的。这一分类的重点不是"删掉 Lodash"，而是"停止打包浏览器已经有的那部分"。仅替换 `lodash.clonedeep` 和 `lodash.groupby` 就能省大约 8 KB gzipped，如果你原来为几个函数引入了完整 `lodash`，替换平台覆盖的那些可以让你完全去掉它。

## 分类 5：Temporal——一个暂时不该删库的案例研究

前面每个分类都以"放手删"结尾。这个正好相反，也因此值得包含：它展示了决策框架告诉你"等等"的场景。

`Temporal` 是期待已久的 JavaScript `Date` 替代品，而且确实是一个更好的 API：不可变对象、合理的时区处理、不再有从零开始的月份索引。它在 2026 年 3 月达到 TC39 Stage 4，是 ES2026 规范的一部分。Firefox 139（2025 年）和 Chrome 144（2026 年 1 月）已发布。Safari 尚未在稳定版中发布；它在 Safari Technology Preview 中，预计 2026 年晚些时候稳定支持。

然而 `Temporal` 还不是 Baseline。它仍在 Limited availability 中，因为 Safari 用户还没有它。要在所有浏览器中使用，需要 polyfill——此时数学开始对你不利。

官方 `@js-temporal/polyfill` 约 44 KB gzipped。有一个较小的不依赖 BigInt 的 polyfill 重 19 KB gzipped。像 `dayjs` 这样的轻量级日期库大约 3 KB gzipped。所以如果你现在把 `dayjs` 换成 `Temporal` 加 polyfill，你不是省了 3 KB，而是大约增加 41 KB，除非你能条件加载 polyfill。

用决策框架过一遍：

- **问题 1（受众）**：Temporal 不是 Baseline。对广受众来说，这影响很多人。
- **问题 2（成本）**：polyfill 是你准备删掉的库的十倍以上体积。替换反而增大包体。
- **问题 3（功能缺口）**：Temporal 实际上是赢家；它比 `dayjs` 做得更多。但在问题 1 和 2 不通过的情况下这并不重要。

结论基本明确：暂时保留 `dayjs`（或 `date-fns`）。重新评估的时机是 Safari 在稳定版发布 Temporal 且它达到 Baseline 后。那时可以原生使用 Temporal 并条件加载 polyfill 给旧浏览器的用户。这是一个记下来、过几个月再检查的特性，不是今天要行动的事。

## 如何在自己项目上执行这个审计

上面的分类是一个起点地图，但你的依赖是独特的。以下是一个可每季度重复执行的流程。

### 步骤 1：列出生产依赖

先列出实际交付给用户的内容：

```bash
npm ls --omit=dev --depth=0
```

### 步骤 2：衡量每个依赖的成本

对于快速的单包数字，Bundlephobia 给出任何 npm 包的 minified + gzipped 大小。对于真实情况（每个依赖在你实际打包中的成本，经过 tree-shaking 和去重后），对构建产物运行 bundle analyzer。`npx source-map-explorer` 适用于大多数打包体系，`npx vite-bundle-visualizer` 适用于 Vite 项目。

### 步骤 3：检查每个替换方案的 Baseline 状态

对于每个候选，找到要替换它的平台特性并检查 Baseline 状态。最快的方式是 webstatus.dev 或特性 MDN 页面上的 Baseline 徽标。

### 步骤 4：执行三个问题

对于每个有平台替换方案的库，回到框架：它对受众 Baseline 安全吗？替换成本是什么？特性覆盖你的实际使用方式吗？大多数决策会落在问题 1（检视特性状态对应你的 `browserslist`）和问题 3（检查你自己的使用方式）。

### 步骤 5：在渐进增强下进行替换

对于 Widely available 的特性，直接替换。对于 Newly available 的，要么确认受众都在现代浏览器上，要么用简单的特性检测守卫新代码并保留 fallback：

```js
if (typeof Intl.DurationFormat === "function") {
  // 使用平台特性
} else {
  // fallback 到库或更简单的格式
}
```

这样对能跑它的用户交付更少的代码，同时不破坏不能跑的用户。

## 总结

把这些分类加起来，数字就很具体了。国际化分类约 14 KB gzipped，HTTP 约 17 KB，UI 原条约 24 KB，Lodash 工具函数 8 KB 或更多（取决于你打包了多少）。对于一个典型的中型应用，加起来大概 60 到 90 KB gzipped 的依赖可以交还给平台。如果同时打包了完整 Lodash 或多个此类库，还能更多（未压缩数字是 2-3 倍，这在 bundle analyzer 中压缩前能看到）。

作者为这些功能选择了相对精简的包，但单个包有的仍可能很重。比如你的对话框包可能单独就重达 50 KB gzipped，具体取决于你用的库。

未来一年值得关注几个特性，它们将开启更多替换机会：

- **Temporal 原生化。** 一旦 Safari 在稳定版发布且达到 Baseline，你就可以同时去掉日期库和 polyfill，把今天的负收益变成真正的收益。
- **CSS anchor positioning 成熟。** 它在 2026 年 1 月成为 Baseline Newly available。随着向 Widely 演进，对广受众去除工具提示和弹出框定位库就会更安全。
- **`Object.groupBy` 系列跨入 Widely available。** 2024 年的这批特性（数组分组、Set 方法）预计在 2026 年底达到 Widely available，届时从"检查受众"变为"直接用"。

这些不是一次性的清理工作。平台持续不断发布新特性，"你需要一个库做这个"和"浏览器能做这个"之间的差距在持续缩小。值得培养的习惯很简单：每季度跑一次审计。列出依赖，检查哪些已经是 Baseline，把能交还的还给平台。

从本文中挑选一个分类，打开你的 `package.json`，看看浏览器已经帮你做了多少。
