---
title: 2026 年让你删掉旧代码的 10 个 React 特性
description: 作者逐一实测 React 19.3 与浏览器新特性，列出 10 个可以删除的老旧 React 代码模式
tags:
  - translation
  - react
  - frontend
  - react-server-components
source: https://blog.logrocket.com/react-2026-features-delete-old-code/
date: 2026-10-16
author: Chizaram Ken
---

## 2026 年让你删掉旧代码的 10 个 React 特性

> **原文**：[10 React features that let you delete old code in 2026](https://blog.logrocket.com/react-2026-features-delete-old-code/) | 作者：Chizaram Ken | 日期：2026-10-09

## 📝 摘要

有些代码是 React 开发者凭肌肉记忆写出来的：mounted 标志、只透传一个 prop 的 Provider、纯为放 ref 而存在的包裹 `<div>`。作者挑选十种这类模式，在 React 19.3 / Next.js 16.3.8 / Node 26.10.0 与 Chrome 154、Firefox 157、Safari 26.6.2 上各做「旧写法 / 新写法」两版实测，说明每一项替代了什么、实测数据如何、今天能否用。结论：七项只需升级 React 19.3；最安全的删除发生在 React 内部或服务端；但删之前要读细则——`onReset` 在返回错误时也会触发、React 会停止等待慢图、`sibling-index()` 会统计所有同级元素。

## 📋 术语表

| 英文                    | 中文             | 说明                                                 |
| ----------------------- | ---------------- | ---------------------------------------------------- |
| React Server Components | React 服务端组件 | 在服务端渲染、不打包到客户端的组件                   |
| mounted flag            | mounted 标志     | 用 useState/useEffect 判断是否已在浏览器挂载的老写法 |
| Suspense                | Suspense         | React 的异步边界/加载态组件                          |
| Fragment                | Fragment         | 不产生额外 DOM 节点的容器                            |
| ViewTransition          | ViewTransition   | React 的视图过渡组件                                 |
| popover                 | popover          | 原生弹出层 API（showPopover / hidePopover）          |
| CSS anchor positioning  | CSS 锚点定位     | 用 CSS 将元素相对锚点定位                            |
| Baseline                | Baseline         | Web 平台特性的跨浏览器可用性基线                     |
| sibling-index()         | sibling-index()  | CSS 计算同级序号的函数                               |
| field-sizing            | field-sizing     | CSS 属性，让表单控件按内容自适应尺寸                 |
| scrollHeight            | scrollHeight     | 元素内容的整体高度                                   |

---

## 正文（双语对照）

There is a kind of code every React developer writes from muscle memory: a mounted flag, a Provider that passes along a single prop, and the wrapper `<div>` that exists mainly to give a ref somewhere to live.

有些代码，是每个 React 开发者都会凭肌肉记忆写出来的：一个 mounted 标志、一个只为透传单个 prop 的 Provider，以及一个主要是给 ref 找个落脚点的包裹 `<div>`。

In 2026, a lot of that code became optional. React 19.3 shipped on September 9 and retired several of these patterns, while the browser took care of a few more. The problem is that the news is scattered across release notes, changelogs, and a single newsletter issue.

到了 2026 年，这类代码很多都变成了可选项。React 19.3 于 9 月 9 日发布，淘汰了其中若干模式，而浏览器又替我们解决了一些。问题在于，这些消息散落在发布说明、changelog 和某一期 newsletter 里。

So I picked ten patterns and built each one twice: once the old way and once the new way. I tested them on a MacBook M4 with React 19.3.0, Next.js 16.3.8, Node 26.10.0, Chrome 154, Firefox 157, and Safari 26.6.2. Here's the GitHub repo.

于是，我挑选了十个模式，每个都做了两版：一版用旧写法，一版用新写法。测试环境为 MacBook M4，React 19.3.0、Next.js 16.3.8、Node 26.10.0、Chrome 154、Firefox 157、Safari 26.6.2。GitHub 仓库在此。

For each one, I'll show you what it replaces, what I measured, and whether you can use it today. Most of the results were good. One was surprising enough to make me rethink my own list.

每一项我都会说明：它替代了什么、我测到了什么、以及你今天能不能用。多数结果都不错，还有一项意外到让我重新审视了自己的清单。

### 1. 在 React Server Components 中直接使用 context

Server Components can't create context. Previously, you'd need a `'use client'` file to export the context, along with a `UserProvider` component whose only job was to pass a prop into it.

Server Component 无法创建 context。以前，你需要一个 `'use client'` 文件来导出 context，还得配一个 `UserProvider` 组件——它唯一的职责就是把一个 prop 传进去。

With React 19.3, a Server Component can render the context directly:

在 React 19.3 中，Server Component 可以直接渲染 context：

```tsx
// user-context.tsx
"use client"
export const UserContext = createContext<User | null>(null)

// page.tsx (Server Component)
export default async function Page() {
  const user = await getUser()
  return (
    <UserContext value={user}>
      <UserCard />
    </UserContext>
  )
}
```

The wrapper is gone. In my test, I removed 10 lines and an entire component, and the client child could still read the user with `useContext`.

包裹层没了。在我的测试里，我删掉了 10 行代码和一整个组件，而客户端子组件依然能用 `useContext` 读到 user。

One rule still applies, though: the context itself must be created in a `'use client'` file. I tried calling `createContext` from a server file, and the build stopped with an error: "You're importing a module that depends on `createContext` into a React Server Component module."

但有一条规则仍然适用：context 本身必须在 `'use client'` 文件里创建。我试过在服务端文件里调用 `createContext`，构建直接报错："You're importing a module that depends on `createContext` into a React Server Component module."

Verdict: Use it now. It runs on the server, so there's no browser runtime to break.

结论：现在就能用。它跑在服务端，没有浏览器运行时可以出问题。

### 2. 用 Suspense 取代 mounted 标志

You should be familiar with this one. A component needs the browser, so you add `useState(false)`, flip it inside `useEffect`, and return a loading line until then.

这个你应该很熟悉。某个组件需要浏览器环境，于是你加个 `useState(false)`，在 `useEffect` 里把它翻转，在此之前先返回一行 loading。

The flag exists because the server can't run browser code. Suspense now does the swap that the effect used to do.

这个标志的存在，是因为服务端跑不了浏览器代码。如今，Suspense 接替了这个 effect 原先做的切换。

```tsx
function TimezoneContent() {
  use(browser())
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return <p>{timeZone}</p>
}

;<Suspense fallback={<p>Loading timezone...</p>}>
  <TimezoneContent />
</Suspense>
```

`use(browser())` suspends on the server and does nothing in the browser. I opened the server HTML, and the fallback text was there, as expected.

`use(browser())` 在服务端会挂起，在浏览器里则什么都不做。我打开服务端渲染的 HTML，fallback 文案如预期地出现了。

To be honest about the numbers. You don't save lines. With the Suspense boundary, the new version is a little longer. What you delete is the state, the effect, and the hidden `if (!mounted)` branch. The loading state now lives in Suspense, where React already knows what to do with it.

把数字说清楚：你并没有省下行数。加上 Suspense 边界后，新版反而略长一点。你删掉的是 state、effect，还有那个隐藏的 `if (!mounted)` 分支。加载状态现在住在 Suspense 里，而 React 早就知道该怎么处理它。

Verdict: Use it now.

结论：现在就能用。

### 3. 用 React Fragment ref 取代包裹 `<div>`

You want to observe a group of cards, or move focus to the first input in a group. A ref needs one DOM node, so you add a `<div>`. The `<div>` breaks your flex layout, so you add `display: contents`. Now you have a hack sitting on top of a hack.

你想观察一组卡片，或把焦点移到一组里的第一个 input。ref 需要一个 DOM 节点，于是你加了个 `<div>`。`<div>` 又破坏了你 flex 布局，于是你再加个 `display: contents`。现在你得到一个「hack 摞 hack」的局面。

```tsx
const fragmentRef = useRef<React.FragmentInstance>(null)

;<Fragment ref={fragmentRef}>
  {items.map((name) => (
    <Card key={name} name={name} />
  ))}
</Fragment>

// inside an effect
fragmentRef.current.observeUsing(observer)
```

Fragment refs are stable in 19.3. The ref gives you a `FragmentInstance` with `observeUsing()`, `focus()`, and `focusLast()`. My observer setup went from about 8 lines to 2, and the extra DOM node disappeared. One thing to watch: the type is `React.FragmentInstance`, and its methods come from `@types/react-dom`.

Fragment ref 在 19.3 中已稳定。这个 ref 会给你一个 `FragmentInstance`，带有 `observeUsing()`、`focus()` 和 `focusLast()`。我的 observer 初始化从约 8 行缩到 2 行，多出来的那个 DOM 节点也消失了。有一点要注意：类型是 `React.FragmentInstance`，它的方法来自 `@types/react-dom`。

Verdict: Use it now.

结论：现在就能用。

### 4. 用事件 props 取代全屏 useEffect

Tracking fullscreen meant a `useEffect`, two `document.addEventListener` calls, two matching removals, and a ref. In my test that was 15 lines wrapped around two lines of real logic.

要跟踪全屏状态，意味着一个 `useEffect`、两次 `document.addEventListener`、两次对应的移除，外加一个 ref。在我的测试里，那是用 15 行代码包着两行真正的逻辑。

```tsx
<div
  onFullscreenChange={(e) =>
    setIsFullscreen(document.fullscreenElement === e.currentTarget)
  }
  onFullscreenError={(e) => setError(`Fullscreen error: ${e.type}`)}
>
```

React 19.3 adds both as event props. Fifteen lines became six. The catch is TypeScript. `@types/react@19.3.0` doesn't know these props yet, so the build complains until you add a type assertion.

React 19.3 把这两个都以事件 props 的形式加了进来。15 行变成了 6 行。麻烦在于 TypeScript：`@types/react@19.3.0` 还不认识这些 props，所以在加上类型断言之前，构建会一直报错。

Verdict: Use it now, and expect to argue with the types for a while.

结论：现在就能用，但预计要跟类型较劲一阵子。

### 5. 用 onReset 取代表单重置 useEffect

When a form action succeeds, React clears the uncontrolled fields for you. It does not clear your own state. So a character counter stays at 12/280 above an empty box, and you write an effect to fix it:

当表单 action 执行成功时，React 会替你清空非受控字段，但不会清空你自己的 state。于是输入框已空，顶上的字数统计却还停在 12/280，你就得写个 effect 来修：

```tsx
useEffect(() => {
  if (state.success) {
    setCharCount(0)
  }
}, [state])
```

React 19.3 now fires `onReset` when it resets a form after an action. The effect becomes one prop:

React 19.3 现在会在 action 之后重置表单时触发 `onReset`。于是那个 effect 变成了一个 prop：

```tsx
<form action={formAction} onReset={() => setCharCount(0)}>
```

I posted a comment, and the counter went from 12/280 back to 0/280. That is five lines gone, counting the `useEffect` import.

我发了一条评论，字数统计从 12/280 变回了 0/280。算上 `useEffect` 的 import，这省掉了 5 行。

One surprise. I made the action return `{ success: false }` without throwing. React still reset the form, and `onReset` still fired, so the counter cleared on a failed post. The old `if (state.success)` check would have kept it.

有个意外：我让 action 在不抛异常的情况下返回 `{ success: false }`。React 依然重置了表单，`onReset` 也照常触发，于是一次失败的提交把字数清掉了。而旧的 `if (state.success)` 判断本会保住它。

Verdict: Use it now. Remember that it also fires when your action returns an error.

结论：现在就能用。记住：当你的 action 返回错误时它也会触发。

### 6. 去掉 resize 里的 requestAnimationFrame 节流

Most `useWindowSize` hooks wrap `setState` in `requestAnimationFrame`, with a ref and a cleanup to cancel it. That is six extra lines.

大多数 `useWindowSize` hook 会用 `requestAnimationFrame` 包住 `setState`，再加一个 ref 和取消用的 cleanup。这多出 6 行。

The 19.3 changelog has a quiet entry: `react-dom` now batches updates from `resize` events until the next frame. So I removed the throttle:

19.3 的 changelog 里有一条不起眼的记录：`react-dom` 现在会把 `resize` 事件带来的更新批处理到下一帧。于是我去掉了节流：

```tsx
const handleResize = () => {
  setSize({ width: window.innerWidth, height: window.innerHeight })
}
```

Then I dragged the window edge on both pages in Chrome 154 and counted renders. With the throttle, the page rendered 386 times. Without it, 408. That is a gap of about 6%, from a test I ran by hand. On 19.3, those six lines buy you almost nothing.

接着我在 Chrome 154 里拖动两个页面的窗口边缘，数渲染次数。有节流时渲染了 386 次，没有时 408 次。差额约 6%——这是手工跑出来的结果。在 19.3 上，那 6 行几乎没换来什么。

Verdict: Use it now.

结论：现在就能用。

### 7. 用 ViewTransition + Suspense 取代 loaded 标志

Confession first. This slot was meant for React's `<img>` preloading, which got a new docs page this year. I server-rendered an image on React 19.0, 19.1, 19.2, and 19.3. All four already add the preload link. The docs are new, but the feature is not, so it lost its seat.

先坦白一件事。这个位置本来是留给 React 的 `<img>` 预加载的——它今年有了新的文档页。我在 React 19.0、19.1、19.2、19.3 上分别做了服务端渲染图片，四个版本都已经会加上 preload 链接。文档是新的，特性却不是，所以它被淘汰出局。

Its replacement is still about images. To stop an image from popping in half-loaded, you hold a flag:

顶替它的东西还是跟图片有关。为了防止图片半加载就突然蹦出来，你会拿一个标志位兜着：

```tsx
const [loaded, setLoaded] = useState(false)

{
  !loaded && <Skeleton />
}
;<img onLoad={() => setLoaded(true)} style={{ display: loaded ? "block" : "none" }} />
```

In React 19.3, an image inside `<ViewTransition>` can trigger Suspense while it loads:

在 React 19.3 中，`<ViewTransition>` 里的图片可以在加载过程中触发 Suspense：

```tsx
<ViewTransition>
  <Suspense fallback={<Skeleton />}>
    <Profile />
  </Suspense>
</ViewTransition>
```

Make the state update inside `startTransition`. I delayed the image by 1.5 seconds. Both versions showed the skeleton at 0.5 seconds and the image at 2 seconds. The new one did it without the flag, the handler, or the style switch. That is seven lines gone.

记得把 state 更新放进 `startTransition` 里。我把图片延迟了 1.5 秒：两版都在 0.5 秒时显示骨架屏、2 秒时显示图片。新版省掉了标志位、事件处理器和 style 切换，一共少 7 行。

Now the limit. I delayed the image by 15 seconds. After 2 seconds, the skeleton was gone, and the `<img>` was on the page, still loading. React waits for a while, then stops. The docs say this is on purpose, so a slow image can't block the update forever.

再看限制。我把图片延迟了 15 秒：2 秒后骨架屏就消失了，`<img>` 已经出现在页面上、仍在加载。React 等一阵子就不等了。文档说这是有意为之，这样一张慢图就不会永远阻塞更新。

Verdict: Use it now for images that load fast. Keep the flag where a slow image must never show an empty box.

结论：加载快的图片现在就可用；如果一张慢图绝不能出现空白框，那就继续保留标志位。

### 8. 用 CSS 锚点定位取代 Floating UI

Placing a tooltip has always needed JavaScript. Measure the button, measure the tooltip, flip it when it hits the edge, and repeat on scroll.

放置一个 tooltip 一直离不开 JavaScript：测量按钮、测量 tooltip、碰到边缘就翻转、滚动时还要重复。

The loop exists because JavaScript can't see a layout until it measures it. CSS anchor positioning moves that work into the layout engine.

这个循环的存在，是因为 JavaScript 不测量就看不见布局。CSS 锚点定位把这份工作搬进了布局引擎。

```tsx
const ref = useRef<HTMLDivElement>(null);
<button
  style={{ anchorName: '--tip' } as React.CSSProperties}
  onMouseEnter={() => ref.current?.showPopover()}
  onMouseLeave={() => ref.current?.hidePopover()}
>
  Hover me
</button>
<div ref={ref} popover="manual" className="tooltip"
  style={{ positionAnchor: '--tip' } as React.CSSProperties}>
  Tooltip text
</div>
```

A fair warning about the date: CSS anchor positioning did not ship in 2026. Chrome has had it since version 125. What happened in 2026 is that Firefox 147 shipped it in January. That made it safe to use in every major browser.

关于时间线要先说清楚：CSS 锚点定位并不是 2026 年才落地的。Chrome 从 125 版起就有了。2026 年发生的是 Firefox 147 在 1 月支持了它，这才让它可以在所有主流浏览器里放心使用。

`position-try-fallbacks: flip-block` does the job of Floating UI's `flip()`. CSS places the tooltip, but it does not open it. You still write two mouse handlers that call `showPopover()` and `hidePopover()`.

`position-try-fallbacks: flip-block` 干的是 Floating UI 里 `flip()` 的活。CSS 负责摆放 tooltip，但不负责打开它——你仍然要写两个鼠标事件处理器来调用 `showPopover()` 和 `hidePopover()`。

To be honest about the numbers again. My Floating UI file, with a tooltip and a dropdown, was 93 lines. The CSS anchor version is 75 lines of React plus a 35-line CSS file. That is 18 fewer lines of React but 110 lines in total, so you write more code, not less. The win is the 8.8 KB library you no longer ship.

再把数字说清楚：我那个带 tooltip 和下拉的 Floating UI 文件是 93 行；CSS 锚点版是 75 行 React 加一个 35 行 CSS 文件。React 少了 18 行，但总数变成 110 行——也就是说你写的代码更多，而不是更少。真正的好处是不再打包那个 8.8 KB 的库。

Verdict: Use it now for simple cases. Keep Floating UI if you need arrows or virtual anchors.

结论：简单场景现在就能用；如果你需要箭头或虚拟锚点，就继续用 Floating UI。

### 9. 用 CSS 取代 textarea 自动增高 JavaScript

A `textarea` that grows as you type is a small feature with an annoying implementation. You hold a ref, reset the height, then set it to `scrollHeight` on every change:

让 `textarea` 随输入增高，是个实现起来很烦的小功能。你要拿一个 ref，先把高度重置，再在每次变化时把它设为 `scrollHeight`：

```tsx
useLayoutEffect(() => {
  const el = textareaRef.current
  if (!el) return
  el.style.height = "auto"
  el.style.height = el.scrollHeight + "px"
}, [value])
```

`field-sizing: content` reached every major browser on June 16, 2026, when Firefox 152 shipped it. Now the whole thing is CSS:

`field-sizing: content` 于 2026 年 6 月 16 日随 Firefox 152 发布而进入所有主流浏览器。现在整套东西都可以用 CSS 搞定：

```css
textarea {
  field-sizing: content;
  min-height: 3lh;
  max-height: 10lh;
}
```

I typed ten lines into both versions in Chrome 154. The old one grew from 72px to 256px. The new one grew from 72px to 240px, then stopped and scrolled, because `max-height: 10lh` caps it at ten lines. Loading a draft from code resized both, and deleting the text shrank both back to 72px.

我在 Chrome 154 里往两版各输入了十行。旧版从 72px 长到 256px；新版从 72px 长到 240px 后就停住并变为滚动，因为 `max-height: 10lh` 把它卡在十行。用代码载入草稿时两版都会重新调整尺寸，删掉文字后两版又都缩回 72px。

The two are not pixel-identical. The same draft measured 136px the old way and 138px the new way, so check any tight layout.

两者并非像素级一致：同一份草稿，旧写法量得 136px，新写法 138px。所以对紧凑的布局要格外留意。

The effect was four lines in my test. If you use `react-textarea-autosize` instead, that is 1.7 KB gzipped, you can drop.

在我的测试里那个 effect 是 4 行。如果你用的是 `react-textarea-autosize`，那还能再省掉 1.7 KB（gzip 后）的体积。

Verdict: Use it now.

结论：现在就能用。

### 10. 用 sibling-index() 取代 React 列表索引

A staggered list animation needs each item to know its position. CSS could not count, so React did it:

交错动画需要每个列表项知道自己的位置。CSS 不会计数，于是 React 代劳：

```tsx
{items.map((item, i) => (
  <li key={item} style={{ '--i': i } as React.CSSProperties}>{item}</li>
))}
li { animation-delay: calc(var(--i) * 60ms); }
```

`sibling-index()` became Baseline in August 2026, when Firefox 154 shipped it. CSS can count now:

`sibling-index()` 于 2026 年 8 月随 Firefox 154 发布成为 Baseline。CSS 现在会计数了：

```tsx
{items.map((item) => <li key={item}>{item}</li>)}
li { animation-delay: calc((sibling-index() - 1) * 60ms); }
```

In Chrome 154, both versions gave the same delays for five items: 0s, 0.06s, 0.12s, 0.18s, and 0.24s. Adding an item at the top updated both.

在 Chrome 154 中，五个条目在两版里得到的延迟相同：0s、0.06s、0.12s、0.18s、0.24s。在顶部插入一项，两版都会更新。

Concerns: `sibling-index()` counts every element sibling, not only your list items. I put a heading inside the list container as its first child, and every delay moved up by 60ms. The `.map()` index did not care. Keep your items in a container that holds nothing else.

要注意：`sibling-index()` 统计的是所有同级元素，而不只是你的列表项。我在列表容器里放了个 heading 当第一个子元素，结果所有延迟都往后推了 60ms；而 `.map()` 的索引则不受影响。所以请把列表项放在一个不含其他内容的容器里。

This is the smallest delete here. You lose the index argument, the inline style, and the `as React.CSSProperties` cast.

这是本文里最小的一处删除：你省掉了 index 参数、内联 style，以及那个 `as React.CSSProperties` 断言。

Verdict: Use it now, in a clean container.

结论：在一个干净的容器里，现在就能用。

### 今天就能用上的 React 2026 特性

| #   | 特性                          | 取代了什么                   | 现在可用？               | 删除行数 |
| --- | ----------------------------- | ---------------------------- | ------------------------ | -------- |
| 1   | Server Component 里的 context | Provider 包裹层              | 是                       | 10       |
| 2   | `use(browser())`              | mounted 标志                 | 是                       | 0        |
| 3   | Fragment ref                  | 包裹 `<div ref>`             | 是                       | 约 6     |
| 4   | 全屏事件 props                | `useEffect` 监听器           | 是（类型滞后）           | 9        |
| 5   | action 之后的 `onReset`       | 重置 `useEffect`             | 是（返回错误时也会触发） | 5        |
| 6   | resize 批处理                 | `requestAnimationFrame` 节流 | 是                       | 6        |
| 7   | `<ViewTransition>` 图片等待   | loaded 标志                  | 是（限快图）             | 7        |
| 8   | 锚点定位                      | Floating UI（简单场景）      | 是                       | 18       |
| 9   | `field-sizing: content`       | textarea 自动增高 effect     | 是                       | 4        |
| 10  | `sibling-index()`             | 传入 CSS 的索引              | 是（需干净容器）         | 3        |

Added up, that is over 60 lines across ten small demos.

加起来，这十个小 demo 一共删掉 60 多行。

### 核心要点：可以删掉的 React 代码

- Seven of these arrive with one upgrade to React 19.3. That is the cheapest win here
  —— 其中七项只需升级到 React 19.3 就能获得。这是这里最划算的收益
- The safest deletes run inside React or on the server: Provider wrappers, mounted flags, and wrapper divs
  —— 最安全的删除发生在 React 内部或服务端：Provider 包裹层、mounted 标志、包裹 `<div>`
- Read the fine print before you delete. `onReset` fires on returned errors, React stops waiting for slow images, and `sibling-index()` counts every sibling
  —— 删之前先读细则。`onReset` 在返回错误时也会触发、React 会停止等待慢图、`sibling-index()` 会统计所有同级元素
- New docs are not new features. Test a list like this one before you trust it, including mine
  —— 新文档不等于新特性。在相信任何这样一份清单（包括我这份）之前，先自己测一遍

### 结论

None of these ten made a keynote. They are small, and that is the point. Each one removes code you only wrote because the platform had a gap. Start with the three safe ones this week: delete a Provider wrapper, a mounted flag, and a wrapper div. Then delete the textarea effect. It is four lines, and you will not miss them.

这十项没有一项上过发布会的主舞台。它们都很小，而这正是重点。每一项删掉的，都是仅仅因为平台存在缺口你才写的代码。这周就从最安全的三项开始：删掉一个 Provider 包裹层、一个 mounted 标志、一个包裹 `<div>`。然后再删掉那个 textarea 的 effect——就 4 行，你不会想它们的。

---

> **译者注**：文中「Verdict」统一译为「结论」；「Baseline」保留原文，指 Web 平台特性的跨浏览器可用性基线。原文内嵌的广告与相关文章推荐已略去。
