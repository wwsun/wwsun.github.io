---
title: 最佳 CSS 重构 AI 工具：我实测了 5 款
description: LogRocket 实测 ChatGPT、Claude、Copilot、Cursor、Gemini 五款 AI 工具的 CSS 重构能力，用 7 个精心设计的陷阱揭示 AI 在层叠、层叠上下文与选择器作用域上的系统性盲区。
tags:
  - clippings
  - css
  - ai-coding
  - frontend
  - refactoring
source: https://blog.logrocket.com/ai-tool-refactor-css/
date: 2026-09-04
author: Anna Monus
---

## 最佳 CSS 重构 AI 工具：我实测了 5 款

> **原文**：[Best AI tool for refactoring CSS: I tested 5](https://blog.logrocket.com/ai-tool-refactor-css/) | 作者：Anna Monus | 日期：2026-09-04

## 摘要

重构遗留 CSS 是出了名的高风险操作：一次看似无害的清理——删掉没用的选择器、冗余声明或纯粹为打补丁而写的特异性 hack——就可能悄悄破坏布局，而视觉回归测试未必抓得住。作者把同一个「Refactor this CSS」提示词交给 ChatGPT、Claude、Copilot、Cursor、Gemini 五款工具，并用一个商品卡片组件埋了 7 个刻意设计的 CSS 陷阱。结论相当扎心：**每一个工具都在单文件规模的组件上引入过 bug**。层叠（cascade）是最大的盲区——5 款工具在 hover 阴影冲突上全军覆没；选择器作用域扁平化是另一个共性盲区，只有 Cursor 保留了部分作用域。最终排名 Cursor 第一（14 分），Gemini 垫底（7.5 分），但作者强调真正有价值的不是排名，而是这套固定提示词 + 固定样式表的可复用基准测试。

## 术语表

| 英文                | 中文           | 说明                                                                                                |
| ------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| cascade             | 层叠           | CSS 决定多条规则冲突时谁生效的核心机制，`!important`、特异性、源码顺序共同参与裁决                  |
| specificity         | 特异性         | 选择器的权重分值，类/属性/伪类各计 1 分，是层叠裁决的第一顺位依据                                   |
| stacking context    | 层叠上下文     | 由 `position` + `z-index`、`opacity`、`transform` 等触发的独立层叠作用域，内部 z-index 不与外部竞争 |
| z-index             | z-index        | 层叠层级，仅在同一个层叠上下文内才有可比性                                                          |
| `!important`        | `!important`   | 强制提升声明优先级，可跨源码顺序取胜，但仍是可被讨论的“死重”或“救命稻草”                            |
| vendor prefix       | 厂商前缀       | 如 `-webkit-`，为非标准/实验性属性提供的浏览器前缀写法                                              |
| shorthand/longhand  | 简写 / 长写    | CSS 属性的两种书写形式                                                                              |
| CSS custom property | CSS 自定义属性 | 即 CSS 变量（`--xxx`），用于建立单一数据源                                                          |
| refactor            | 重构           | 在不改变外部行为的前提下调整代码结构；本文的关注点正是“行为是否真的没变”                            |
| regression          | 回归           | 重构后渲染或功能行为发生了非预期的改变                                                              |
| line clamp          | 行数截断       | 用 `-webkit-line-clamp` 等把文本限制在固定行数                                                      |
| agentic tool        | 代理式工具     | 直接在编辑器中就地修改文件的编码助手，区别于聊天式“整表重生成”                                      |

---

## 正文（双语对照）

Refactoring legacy CSS is notoriously risky. What starts as a quick cleanup of unused selectors, redundant declarations, or specificity hacks can quickly break layout alignment in ways visual regression tests fail to catch. As AI coding assistants become a staple in daily frontend workflows, handing off stylesheet cleanup to LLMs feels like the logical next step.

重构遗留 CSS 是出了名的高风险。一开始只是想快速清理一下没用的选择器、冗余声明或特异性 hack，结果却可能很快把布局对齐搞坏，而这种破坏往往连视觉回归测试都抓不住。随着 AI 编码助手成为日常前端工作流的标配，把样式表清理交给 LLM 看起来就是顺理成章的下一步。

“Refactor this CSS.”

This is the prompt I gave five AI tools – ChatGPT, Claude, Copilot, Cursor, and Gemini- to see which AI tool refactors CSS best. For the tests, I created a simple product card component with seven specific, deliberately chosen CSS traps, each testing a different way a refactor can go wrong.

「Refactor this CSS.」（重构这段 CSS。）

这就是我交给 ChatGPT、Claude、Copilot、Cursor 和 Gemini 这五款 AI 工具的提示词，用来检验谁最擅长重构 CSS。测试中我写了一个简单的商品卡片组件，埋了 7 个刻意挑选的 CSS 陷阱，每一个都对应一种重构可能出错的方式。

In this article, we’ll evaluate how these five AI assistants handle cascade order, specificity ties, stacking contexts, and selector scoping across a pass/fail benchmark, explore seven key findings where AI tools introduce visual or functional regressions, and review an overall ranking to determine which tool you can actually trust with your stylesheets.

本文会通过一个通过/失败（pass/fail）基准，评估这五款 AI 助手如何处理层叠顺序、特异性打平（specificity tie）、层叠上下文和选择器作用域，梳理出 AI 工具引入视觉或功能回归的 7 个关键发现，并给出总排名，看看哪款工具真的能把样式表托付给它。

## 测试环境（The test setup）

I used the five AI tools in their free tiers with the default configurations, since that’s what most people reaching for these tools would use; however, the method and example stylesheet can be reused to test any other AI tool, tier, or model:

我使用的是这五款工具的免费额度与默认配置，因为大多数人拿起这些工具时用的就是这个状态。不过测试方法和示例样式表也可以复用到任何其他 AI 工具、套餐或模型上：

| AI tool | Model                   | Type                   |
| ------- | ----------------------- | ---------------------- |
| ChatGPT | GPT-5.5                 | 聊天界面（chat UI）    |
| Claude  | Claude Sonnet 5, Medium | 聊天界面（chat UI）    |
| Copilot | Raptor Mini             | 编码代理（VS Code 内） |
| Cursor  | Composer 2.5 Fast       | 编码代理（独立编辑器） |
| Gemini  | Gemini 3.5 Flash        | 聊天界面（chat UI）    |

All AI tools have access to both the HTML and CSS files.

所有 AI 工具都能访问 HTML 和 CSS 两个文件。

Here’s the HTML:

以下是 HTML：

```html
<div class="card-wrapper">
  <div class="card">
    <div class="card-image-container">
      <img class="card-img" src="..." alt="Product" />
    </div>
    <span class="badge badge-new">New</span>
    <h2 class="card-title">Wireless Headphones Pro</h2>
    <p class="card-description">
      Premium sound with active noise cancellation and 30-hour battery life.
    </p>
    <div class="tags-container">
      <span class="tag">Audio</span>
      <span class="tag">Wireless</span>
      <span class="tag">Premium</span>
    </div>
    <div class="card-footer">
      <button class="btn-primary">Add to Cart</button>
    </div>
  </div>
</div>
```

And here is the CSS:

再看 CSS：

```css
/* CARD COMPONENT */
.card-wrapper .card {
  background: #fff;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.card-wrapper .card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14) !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}

/* IMAGE */
.card .card-image-container {
  position: relative;
  z-index: 2;
}

.card .card-image-container img.card-img {
  width: calc(100% + 40px);
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
  margin: -20px -20px 0;
}

/* BADGE */
.card .badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3 !important;
  background-color: #4caf50;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  display: inline-block;
}

.card .badge.badge-new {
  background-color: #43a047;
}

.promo-active .card .badge {
  background-color: #ff9800 !important;
}

/* TITLE */
.card h2.card-title {
  font-size: 18px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111;
  margin: 8px 0 4px;
  line-height: 1.3;
}

/* BODY TEXT */
.card p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.card p.card-description {
  color: #666666 !important;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* TAGS */
.card .tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.card .tags-container .tag {
  background: #f0f0f0;
  color: #333;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.card .tags-container .tag:hover {
  background-color: #e0e0e0;
}

/* FOOTER */
.card .card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

/* BUTTON */
.card .card-footer .btn-primary {
  display: block;
  width: 100%;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: #1a73e8;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.card .card-footer .btn-primary:hover {
  background-color: #1557b0;
  opacity: 0.95;
}
```

This is what it looks like when rendered in the browser (on hover, it snaps up slightly and a soft shadow appears around it):

它在浏览器里渲染出来是这样（hover 时卡片会微微上浮，周围出现一圈柔和阴影）：

You can find the whole project with the original HTML and CSS files and the five refactored stylesheets in this GitHub repo, and you can check out a live demo here.

包含原始 HTML/CSS 文件以及五份重构后样式表的完整项目，可以在这个 GitHub 仓库里找到，在线 demo 在这里。

## 面向 AI 工具的 7 个 CSS 测试用例

Now, let’s see the seven CSS traps:

下面看看这 7 个 CSS 陷阱：

### 测试 1 — hover 层叠（The hover cascade）

The `.card-wrapper .card:hover` rule contains two `box-shadow` declarations. The first is marked with the `!important` keyword, so it wins despite appearing earlier in the rule:

`.card-wrapper .card:hover` 规则里有两条 `box-shadow` 声明。第一条带 `!important`，因此尽管写在前面的位置，它仍然胜出：

```css
.card-wrapper .card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14) !important;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
  /* ... */
}
```

### 测试 2 — 层叠上下文（The stacking context）

The ‘NEW’ badge sits over the image’s top-left corner, while `.card-image-container` establishes its own stacking context via `position: relative` and `z-index: 2`.

「NEW」徽标压在图片左上角，而 `.card-image-container` 通过 `position: relative` 和 `z-index: 2` 建立了自己的层叠上下文。

The badge’s `z-index: 3 !important` looks like it’s guarding against being overridden by another rule, but, in fact, the `!important` flag is dead weight; nothing else in this file ever contests `z-index` on `.badge`, so removing `!important` changes nothing here:

徽标上的 `z-index: 3 !important` 看起来像是在防止被别的规则覆盖，但实际上这个 `!important` 是死重——文件里没有任何其他规则跟 `.badge` 的 `z-index` 竞争，所以在这里去掉 `!important` 不会有任何变化：

```css
.card-wrapper .card {
  /* ... */
  position: relative;
  z-index: 1;
}

.card .card-image-container {
  position: relative;
  z-index: 2;
}

.card .badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3 !important;
  /* ... */
}
```

However, removing the whole `z-index` declaration from `.card .badge` is a different story. If we stripped out `z-index: 3` entirely, the badge would vanish behind the image.

不过，把整条 `z-index` 声明从 `.card .badge` 里删掉就是另一回事了。如果把 `z-index: 3` 完全去掉，徽标就会被图片遮住。

### 测试 3 — 近似重复的取值（Near-duplicate values）

The `.badge` and `.badge-new` selectors have similar-looking but different green values (`#4caf50` vs `#43a047`), which are Material Design’s adjacent “ Green 500” and “ Green 600” shades. A tool that assumes these are accidental duplicates and merges them introduces a real, if subtle, change:

`.badge` 和 `.badge-new` 两个选择器的绿色取值看起来相似但并不相同（`#4caf50` 对 `#43a047`），它们正是 Material Design 中相邻的「Green 500」和「Green 600」两种色阶。如果某个工具认定这只是重复的意外、把两者合并，就会带来一个真实存在（虽然细微）的行为改变：

```css
.card .badge {
  /* ... */
  background-color: #4caf50;
  /* ... */
}

.card .badge.badge-new {
  background-color: #43a047;
}
```

### 测试 4 — 状态覆盖（The state override）

The `.promo-active .card .badge` selector changes the color of the badge from green to orange. It only applies when another part of the application adds the `.promo-active` class at runtime. Since nothing in the default demo exercises this rule, it’s easy to dismiss as dead code:

`.promo-active .card .badge` 选择器会把徽标从绿色改成橙色。它只在应用的其它部分于运行时加上 `.promo-active` 类时才会生效。由于默认 demo 里没有任何地方触发这条规则，很容易把它当成死代码忽略掉：

```css
.promo-active .card .badge {
  background-color: #ff9800 !important;
}
```

The `!important` here isn’t dead weight the way Test 2’s was because `.promo-active .card .badge` and `.card .badge.badge-new` are tied on specificity (three classes each), as shown by Keegan Street’s Specificity Calculator:

这里的 `!important` 不像测试 2 那样是死重，因为 `.promo-active .card .badge` 和 `.card .badge.badge-new` 的特异性正好打平（各自三个类），如 Keegan Street 的 Specificity Calculator 所示：

Because of this, it’s the `!important` flag, and not specificity, that guarantees the promo color wins. If a tool removes the flag while the tie holds, source order decides instead. Here, that means the promo badge stays green.

正因如此，保证促销色胜出的是 `!important` 标志，而不是特异性。如果某个工具在打平关系仍然存在的情况下删掉了这个标志，那么改由源码顺序裁决。在这里，结果就是促销徽标仍然是绿色。

### 测试 5 — 部分清理（The partial cleanup）

The `.card p.card-description` selector repeats `color` and `font-size` from the generic `.card p` rule, which is genuinely redundant. On the other hand, it also contains the necessary declarations for two-line text truncation, which shouldn’t be cleaned up:

`.card p.card-description` 选择器重复了通用规则 `.card p` 里的 `color` 和 `font-size`，这部分确实是冗余的。但另一方面，它还包含两行文本截断所必需的声明，这些不该被清理掉：

```css
.card p {
  color: #666;
  font-size: 14px;
}

.card p.card-description {
  color: #666666 !important;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 测试 6 — 选择器作用域（The selector scope）

Several selectors are intentionally scoped beneath the `.card` class (e.g., `.card .card-footer .btn-primary`, `.card .tags-container .tag`, `.card .badge`, etc.).

有若干选择器被刻意限制在 `.card` 类之下（例如 `.card .card-footer .btn-primary`、`.card .tags-container .tag`、`.card .badge` 等）。

Flattening them works perfectly in this isolated demo, but these selector names (e.g., `.btn-primary` and `.tag`) are generic enough that in a real, larger codebase they could collide with unrelated global styles once unscoped:

在这个孤立的 demo 里，把作用域扁平化完全没问题；但像 `.btn-primary` 和 `.tag` 这类选择器名过于通用，放到真实的、更大的代码库里，一旦去掉作用域就可能与无关的全局样式撞车：

```css
.card .badge {
  /* ... */
}

.card .tags-container {
  /* ... */
}

/* ... */

.card .card-footer .btn-primary {
  /* ... */
}
```

### 测试 7 — 厂商前缀（Vendor prefixes）

As mentioned in Test 5 above, `.card-description` truncates to two lines using a decade-old, non-standard hack that looks exactly like something an eager cleanup pass would “modernize” away:

如测试 5 所述，`.card-description` 用一个十多年前的非标准 hack 实现两行截断，它看起来恰恰就是那种会被热情的清理流程「现代化」掉的东西：

```css
.card p.card-description {
  /* ... */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

This code shouldn’t be modernized. If a tool swaps it for the newer, unprefixed `line-clamp` property instead of leaving it alone, the truncation breaks because most browsers still only support the `-webkit-` prefixed version.

这段代码不该被现代化。如果某个工具把它换成更新的、无前缀的 `line-clamp` 属性，文本截断就会失效——因为大多数浏览器至今仍只支持带 `-webkit-` 前缀的版本。

## 各 AI 工具在各项测试中的表现

For lack of space, I won’t copy the five refactored stylesheets here; you can find them in the GitHub repo.

限于篇幅，我这里不粘贴那五份重构后的样式表，你可以在 GitHub 仓库里找到。

However, here is a pass/fail matrix of how ChatGPT, Claude, Copilot, Cursor, and Gemini did on the seven refactoring tests:

下面是 ChatGPT、Claude、Copilot、Cursor、Gemini 在这 7 项重构测试上的通过/失败矩阵：

| 测试            | ChatGPT | Claude  | Copilot | Cursor  | Gemini  |
| --------------- | ------- | ------- | ------- | ------- | ------- |
| 1. hover 层叠   | ❌      | ❌      | ❌      | ❌      | ❌      |
| 2. 层叠上下文   | ⚠️ (#1) | ⚠️ (#2) | ⚠️ (#1) | ✅      | ⚠️ (#1) |
| 3. 近似重复取值 | ✅      | ❌      | ✅      | ✅      | ❌      |
| 4. 状态覆盖     | ✅ (#3) | ✅ (#3) | ✅ (#3) | ✅ (#3) | ✅ (#3) |
| 5. 部分清理     | ❌      | ✅      | ✅      | ✅      | ❌      |
| 6. 选择器作用域 | ⚠️      | ⚠️      | ⚠️      | ⚠️ (#4) | ⚠️      |
| 7. 厂商前缀     | ✅      | ✅      | ✅      | ✅      | ✅      |

✅ — 通过　❌ — 回归（渲染行为可证实地发生了变化）　⚠️ — 今天能跑，但只是因为这份文件的特殊性——在更大的代码库里是真实风险

### 通过/失败表脚注

(#1) ChatGPT, Copilot, and Gemini all dropped `z-index: 1` from `.card` itself, keeping only `position: relative`, which alone doesn’t create a stacking context. Safe today only because nothing else on the page uses `z-index`. See Finding II. below.

(#1) ChatGPT、Copilot 和 Gemini 都把 `z-index: 1` 从 `.card` 自身删掉了，只留下 `position: relative`——而仅凭 `position: relative` 并不能创建层叠上下文。今天之所以安全，只是因为页面上没有其他地方用到 `z-index`。详见下文「发现 II」。

(#2) Claude’s refactor carried two separate risks: it dropped `.card`‘s own `z-index` like the three AI tools in Footnote #1, and its badge-vs-image fix relied on markup order rather than an explicit value. See Finding II. below.

(#2) Claude 的重构带来两个彼此独立的风险：它像脚注 #1 里那三款工具一样删掉了 `.card` 自身的 `z-index`；而且它处理「徽标 vs 图片」的办法依赖标记顺序，而非显式取值。详见下文「发现 II」。

(#3) All five tools passed, but most likely by coincidence, not because they recognized the tie in the original selectors. See Finding V. below.

(#3) 五款工具都通过了，但很可能只是碰巧，而不是因为它们识别出了原始选择器之间的特异性打平。详见下文「发现 V」。

(#4) Cursor is the only tool that preserved any scoping at all on Test 6 (the badge family and the top-level `.card` rule). I still marked it ⚠️ because it flattened `.btn-primary` and `.tag` exactly like the other four tools. See Finding III. below.

(#4) Cursor 是唯一在测试 6 里保留了部分作用域的工具（徽标系列以及顶层的 `.card` 规则）。我仍标它为 ⚠️，因为它把 `.btn-primary` 和 `.tag` 扁平化的做法与其他四款工具一模一样。详见下文「发现 III」。

## AI 重构 CSS 结果分析

The findings below aren’t organized one-per-test. While some of them group several tests together, others aren’t tied to any specific test at all. They include my observations during and after reviewing the refactored code.

下面的发现并不是一项测试对应一条。有些发现把几项测试归在一起，还有些则完全不绑定某个具体测试。它们包含我在审查重构代码过程中和之后的观察。

To avoid confusion with the seven tests above (Test 1 – Test 7), they’re numbered with Roman numerals.

为避免与上面 7 项测试（测试 1 – 测试 7）混淆，这些发现用罗马数字编号。

### 发现 I：所有 AI 工具都成功移除了明显的 CSS 冗余

All five AI tools removed the duplicate `font-size` fallback on the title:

五款 AI 工具都删掉了标题上重复的 `font-size` 兜底声明：

```diff
--- original/style.css
+++ (all five outputs, identical here)
  .card-title {
-   font-size: 18px;
    font-size: 1.125rem;
    font-weight: 700;
    ...
  }
```

They also removed the redundant `!important` on `.card-description`‘s color, which was already covered by the plain `.card p` rule one level up.

它们也都移除了 `.card-description` 颜色上那多余的 `!important`——那个声明本来就已经被上一层的普通 `.card p` 规则覆盖了。

Neither is one of the seven designed traps, so there’s no real judgment call available here, just code that’s unambiguously safe to delete. That’s the floor, not a differentiator; every tool cleared it without incident.

这两处都不在 7 个刻意设计的陷阱里，所以这里谈不上什么真正的判断——只是明确安全、可以删掉的代码。这是及格线，不是区分点；每款工具都毫无意外地做到了。

### 发现 II：AI 工具难以理解 CSS 层叠

There’s a good chance the cascade is the hardest concept to understand about CSS. AI tools still got confused by it even in this super simple, single-file CSS demo.

层叠很可能是 CSS 里最难理解的概念。即便在这样一个极其简单、单文件的 CSS demo 里，AI 工具依然被它绕晕了。

Issues with the cascade showed up in two tests: Test 1’s shadow conflict and Test 2’s stacking-context fragility. Both come down to the same underlying skill: correctly reasoning about which rule the browser actually applies, rather than which one looks intended.

层叠相关的问题出现在两项测试里：测试 1 的阴影冲突，以及测试 2 的层叠上下文脆弱性。二者归根结底考验的是同一种底层能力：正确推理出浏览器实际应用了哪条规则，而不是哪条规则看起来是「本来想要的」。

#### hover 层叠（测试 1）—— 一致性的失手

Since `!important` beats a normal declaration regardless of source order, it’s the first box shadow that renders in the original CSS, not the second one:

由于 `!important` 无论源码顺序如何都能压过普通声明，原始 CSS 里真正渲染的是第一条 box-shadow，而不是第二条：

```diff
--- original/style.css
+++ (all five outputs, identical here)
  .card:hover {
-   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14) !important;  /* this one wins in the original */
-   box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);              /* never applies in the original */
+   box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);              /* every tool kept the losing value */
    transform: translateY(-2px);
  }
```

However, Claude, Copilot, Cursor, ChatGPT, and Gemini all kept the value that never actually applied in the source file. This is a genuine regression, not a stylistic difference. The hover shadow changes from a tight 4px/12px blur to a noticeably larger, softer one.

然而，Claude、Copilot、Cursor、ChatGPT 和 Gemini 全都保留了源文件里其实从未生效的那个取值。这是实实在在的回归，不是风格差异。hover 阴影从紧凑的 4px/12px 模糊变成了明显更大、更柔和的阴影。

Four of the five tools also added something the original never had: a `transition` on `.card`, turning the hover state from an instant snap into a smooth animation. Only Claude left it untouched. Whether that counts as a regression depends on what we mean by “refactor”. The added transition doesn’t misrepresent anything in the original file, unlike the shadow value above, but it’s still an unrequested change.

五款工具里有四款还加了原文从来没有的东西：给 `.card` 加了 `transition`，把 hover 从瞬时跳变变成了平滑动画。只有 Claude 没动它。这算不算回归，取决于我们怎么定义「重构」。与上面那个阴影取值不同，这个新增的过渡并没有歪曲原始文件里的任何内容，但它依然是一处未经请求的改动。

#### 层叠上下文（测试 2）—— 五款都通过，但安全性并不等价

None of the five AI tools visually broke the badge-over-image rendering, but two arrived there very differently. Compare Gemini and Claude’s refactoring on the exact same rule:

五款 AI 工具都没有在视觉上破坏「徽标覆盖图片」的渲染，但其中两款到达终点的方式截然不同。对比 Gemini 和 Claude 对同一条规则的重构：

```diff
--- original/style.css
+++ refactors/gemini.css
  .card-image-container {
-   position: relative;
-   z-index: 2;
  }
```

```diff
--- original/style.css
+++ refactors/claude.css
  .card-image-container {
    position: relative;
-   z-index: 2;
  }
```

Gemini removed both `position` and `z-index`, making the element fully static, which guarantees it paints in an earlier phase than the still-positioned badge, so the ordering is structurally safe regardless of what else changes around it.

Gemini 把 `position` 和 `z-index` 都删了，让该元素完全回到静态定位，这就保证它必然比仍处于定位状态的徽标更早绘制，因此无论周围还有什么变化，绘制顺序在结构上都是安全的。

Claude, on the other hand, removed only `z-index` and left `position: relative` behind, so `.card-image-container` and the badge now both have `z-index: auto`, landing them in the same paint phase. This means that their visibility is decided purely by which one comes first in the HTML, with nothing in the CSS pinning that down. Swap the two in the markup, CSS untouched, and the badge disappears behind the image:

而 Claude 只删掉了 `z-index`，留下了 `position: relative`，于是 `.card-image-container` 和徽标现在都是 `z-index: auto`，落到同一个绘制阶段。这意味着谁显示在上面完全由 HTML 中谁在前决定，CSS 里没有任何东西把它钉死。把这两者在标记里换一下位置，CSS 完全不动，徽标就会被图片遮住：

```html
<!-- Today: badge paints on top -->
<div class="card-image-container">...</div>
<span class="badge badge-new">New</span>

<!-- CSS unchanged, markup order swapped: badge is now hidden -->
<span class="badge badge-new">New</span>
<div class="card-image-container">...</div>
```

While a direct swap like this is an unlikely edit in a real-world codebase, a more realistic version of this risk is a third element landing between them later (e.g., a wishlist icon or a second badge) without its own explicit `z-index`, which would shuffle the stacking unpredictably.

虽然这种直接调换在真实代码库里不太可能出现，但更现实的风险版本是：日后有第三个元素插到它们之间（比如收藏图标或第二个徽标），而它没有自己的显式 `z-index`，层叠顺序就会不可预测地被打乱。

ChatGPT, Cursor, and Copilot kept explicit `z-index` values for the badge and image-container — but it was only Cursor that also kept `z-index: 1` on `.card` itself. Without it, `position: relative` alone doesn’t create a stacking context, so ChatGPT, Claude, Copilot, and Gemini all lose the isolation that keeps the product card’s `z-index` values from ever needing to compete with anything outside it. Invisible today, since nothing else on the page uses `z-index`, but it becomes real in the moment when the card sits near any other positioned, z-indexed element.

ChatGPT、Cursor 和 Copilot 为徽标和图片容器保留了显式的 `z-index` 取值——但只有 Cursor 同时保留了 `.card` 自身的 `z-index: 1`。没有它，单靠 `position: relative` 并不能创建层叠上下文，于是 ChatGPT、Claude、Copilot 和 Gemini 都失去了那层隔离——正是这层隔离让商品卡片的 `z-index` 取值永远不需要跟外部任何东西竞争。今天看不出来，因为页面上没有别的地方用 `z-index`；但一旦卡片出现在任何其他定位且带 z-index 的元素附近，问题就成真了。

### 发现 III：扁平化选择器作用域是 AI 的共性盲区（测试 6）

I expected Test 6 to split the field. It didn’t, but that’s a more interesting finding. Every AI tool flattened the selectors the test was designed to catch, for example:

我本以为测试 6 会让这些工具分出高下。结果并没有，但这反而更有意思。每一款 AI 工具都把该测试专门用来捕捉的选择器扁平化了，例如：

```diff
--- original/style.css
+++ (all five outputs, identical here)
- .card .card-footer .btn-primary {
+ .btn-primary {
    display: block;
    width: 100%;
    ...
  }
```

`.tag`, `.card-title`, `.card-footer`, `.card-image-container`, and `.card-img` all got the same treatment from all five tools. In an isolated demo that’s invisible; in a real codebase, `.btn-primary` and `.tag` are exactly the kind of generic names likely to already exist in a global stylesheet, and flattening them out of `.card`‘s scope is a real risk, not a hypothetical one.

`.tag`、`.card-title`、`.card-footer`、`.card-image-container` 和 `.card-img` 都被五款工具做了同样处理。在孤立 demo 里这看不出来；但在真实代码库中，`.btn-primary` 和 `.tag` 恰恰是那种很可能已经存在于全局样式表里的通用命名，把它们从 `.card` 的作用域里扁平化出去是真实风险，不是假设。

The one partial exception is Cursor, which kept the badge family scoped where everyone else flattened it:

唯一的局部例外是 Cursor，它保留了徽标系列的作用域，而其他工具都扁平化了：

```diff
--- original/style.css
+++ (ChatGPT/Gemini/Claude/Copilot — all four flattened this selector; Cursor did not)
- .card .badge {
+ .badge {
    ...
  }
```

It seems Cursor is more cautious than the other four tools, but it’s still not cautious across the board since it preserved the badge family and the top-level `.card` rule but flattened the rest exactly like the other tools.

看起来 Cursor 比其他四款工具更谨慎，但它也并非全程谨慎——它保住了徽标系列和顶层 `.card` 规则，却把其余部分和其它工具一样扁平化了。

### 发现 IV：AI 工具在 CSS 清理中常做出错误假设

Some of the AI tools made assumptions they shouldn’t have. Test 3 caught Claude and Gemini in the act, while Test 5 exposed ChatGPT and Gemini.

有些 AI 工具做了不该做的假设。测试 3 当场逮住了 Claude 和 Gemini，测试 5 则暴露了 ChatGPT 和 Gemini。

#### 近似重复的徽标颜色（测试 3）

`.badge` (`#4caf50`) and `.badge-new` (`#43a047`) are intentionally different shades. Gemini and Claude both merged them into a single value:

`.badge`（`#4caf50`）和 `.badge-new`（`#43a047`）是刻意区分开的两种色阶。Gemini 和 Claude 都把二者合并成了一个取值：

```diff
--- original/style.css
+++ refactors/gemini.css and refactors/claude.css
  .badge {
-   background-color: #4caf50;
+   background-color: #43a047;  /* .badge-new's color, now used for both */
  }
- .badge-new { background-color: #43a047; }
```

This is a regression, just a subtle and latent one. As mentioned above, the two greens are Material Design’s adjacent “Green 500” and “Green 600” shades, close enough that the visual difference is barely perceptible on its own. However, both Gemini and Claude moved `.badge-new`‘s color up into the base `.badge` rule and deleted `.badge-new` entirely, so what used to be two independently adjustable colors is now just one. Change that shade today, and every badge changes with it, whether or not it’s marked `.badge-new`.

这是回归，只是很细微、很隐性。如前所述，这两种绿色是 Material Design 相邻的「Green 500」和「Green 600」，接近到单独看几乎察觉不出差别。但 Gemini 和 Claude 都把 `.badge-new` 的颜色上提到了基础 `.badge` 规则里，并彻底删掉了 `.badge-new`，于是原本两个可以独立调整的颜色现在只剩一个。今天改一下这个色阶，所有徽标都会跟着变，无论它是否标了 `.badge-new`。

ChatGPT, Cursor, and Copilot kept the two values separate.

ChatGPT、Cursor 和 Copilot 则把两个取值保持分开。

#### 部分清理（测试 5）

ChatGPT and Gemini made a similar false assumption, but the other way around. Instead of promoting a specific rule’s value into the general one like in the previous case, they folded the general rule into the specific one, deleting `.card p` and merging its styling directly into `.card-description`:

ChatGPT 和 Gemini 也犯了类似的错误假设，只是方向相反。它们不是像上一种情况那样把具体规则的值提升到通用规则里，而是把通用规则折叠进了具体规则——删掉 `.card p`，把它的样式直接合并进 `.card-description`：

```diff
--- original/style.css
+++ refactors/chatgpt.css and refactors/gemini.css
- .card p {
-   margin-bottom: 12px;
-   color: #666;
-   font-size: 14px;
-   line-height: 1.5;
- }
  .card-description {
+   color: #666;
+   font-size: 14px;
+   line-height: 1.5;
+   margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
```

Cursor, Claude, and Copilot all kept the two rules separate, preserving the original’s actual intent.

Cursor、Claude 和 Copilot 都保持两条规则分开，保住了原始代码的真实意图。

### 发现 V：所有 AI 工具都通过的 CSS 陷阱

There were just two tests every AI tool passed: Test 4 and Test 7. However, in the case of Test 4, this happened with a disclaimer.

只有两项测试是所有 AI 工具都通过的：测试 4 和测试 7。不过测试 4 的通过得打个折扣说明。

#### 状态覆盖（测试 4）

ChatGPT, Claude, Copilot, Cursor, and Gemini all removed the `!important` flag from `.promo-active .card .badge`, and nothing broke as a result, though nothing in any tool’s output suggests that was intentional, rather than a side effect of flattening everything uniformly. In the original file, `.promo-active .card .badge` and `.card .badge.badge-new` are tied on specificity (i.e., three classes each), with `!important` being the only thing guaranteeing the promo color wins.

ChatGPT、Claude、Copilot、Cursor 和 Gemini 都把 `!important` 标志从 `.promo-active .card .badge` 里删掉了，结果什么都没坏——尽管从任何工具的输出里都看不出这是有意为之，而不是「统一扁平化一切」的副作用。在原始文件里，`.promo-active .card .badge` 和 `.card .badge.badge-new` 的特异性打平（即各三个类），`!important` 是保证促销色胜出的唯一因素。

What saved every tool is that none of them left the tie intact. ChatGPT, for instance, flattened `.badge.badge-new` down to a lone `.badge-new`, dropping it from two classes to one, while `.promo-active .badge` keeps two. That’s no longer a tie; `.promo-active .badge` now wins outright, 2 to 1, regardless of file order. The other four tools each did some version of the same thing.

救了所有工具的是：没有一个工具让打平关系原样保留。比如 ChatGPT 把 `.badge.badge-new` 扁平化成了单独的 `.badge-new`，从两个类降到一个类，而 `.promo-active .badge` 仍是两个类。这就不再是打平了；`.promo-active .badge` 现在以 2 比 1 无悬念胜出，与文件顺序无关。其他四款工具也各自做了类似的事。

#### 厂商前缀（测试 7）

Unlike Test 4, Test 7 was a clean pass. All the tools left `.card-description`‘s `-webkit-box` / `-webkit-line-clamp` / `-webkit-box-orient` combination completely untouched, and none offered a newer unprefixed alternative either. This is the one part of the CSS file every AI tool treated as off-limits rather than something to modernize.

与测试 4 不同，测试 7 是一次干净的通过。所有工具都完全没有动 `.card-description` 的 `-webkit-box` / `-webkit-line-clamp` / `-webkit-box-orient` 组合，也没谁提出更新的无前缀替代方案。这是整个 CSS 文件里，所有 AI 工具都视为禁区、而非待现代化改造的部分。

### 发现 VI：AI 工具如何处理 CSS 自定义属性

Three tools — Cursor, Claude, and Copilot — introduced CSS custom properties unprompted. Used well, this is a genuine upgrade. For example, the original CSS hardcodes `-20px` in two separate places for the image’s edge-to-edge bleed, quietly tied to the card’s `20px` padding. Cursor and Claude both caught this and tied the two together:

有三款工具——Cursor、Claude 和 Copilot——未经提示就引入了 CSS 自定义属性。用得好的话，这是实打实的升级。例如，原始 CSS 在两处硬编码了 `-20px` 来实现图片的通栏出血，这其实与卡片 `20px` 的内边距暗暗耦合。Cursor 和 Claude 都发现了这一点，并把二者关联起来：

```diff
--- original/style.css
+++ refactors/cursor.css and refactors/claude.css
  .card-img {
-   width: calc(100% + 40px);
+   width: calc(100% + var(--card-padding) * 2);
    height: 200px;
-   margin: -20px -20px 0;
+   margin: calc(var(--card-padding) * -1) calc(var(--card-padding) * -1) 0;
  }
```

Copilot defined an equivalent `--spacing` variable elsewhere in the same file, then didn’t use it here. This is, however, an inconsistency, not a regression, since the hardcoded values still match the original exactly. It just means Copilot’s token system didn’t actually deliver the single-source-of-truth benefit it was implicitly promising.

Copilot 在同一个文件的别处定义了一个等价的 `--spacing` 变量，却没在这里用上。不过这是不一致，不是回归，因为硬编码的取值与原始版本完全一致。它只说明 Copilot 的 token 体系并没有真正兑现它隐含承诺的「单一数据源」收益。

Beyond that, Copilot also added a rule that didn’t exist anywhere in the source:

除此之外，Copilot 还加了一条源文件里根本不存在的规则：

```diff
--- original/style.css
+++ refactors/copilot.css
+ .card-wrapper {
+   display: flex;
+   justify-content: center;
+   padding: calc(var(--spacing) * 1.5);
+ }
```

This does count as a regression from the original’s rendered output because the card goes from left-aligned by default to centered on the page, a layout change nobody asked for. It reads less like a refactor and more like a small unrequested redesign.

这确实算是对原始渲染结果的回归：卡片从默认左对齐变成了页面居中，一个没人要求的布局改动。它读起来不像重构，更像一次未经请求的小型改版。

### 发现 VII：AI 工具造成了细微的 CSS 样式回归

None of the seven test cases were built to catch this regression. I found it by testing the five demos in a browser, not by reading the CSS. The “Add to Cart” button felt subtly different on hover in three of them, and I couldn’t immediately say why until I went back to the source. The original button hover state is:

7 个测试用例中没有任何一个是为了捕捉这个回归而设计的。我是在浏览器里逐个测试这五份 demo 时发现的，而不是通过阅读 CSS。其中三份的「Add to Cart」按钮在 hover 时感觉有些微妙的不同，我一时说不上来为什么，直到回头去看源码。原始的按钮 hover 状态是：

```css
.btn-primary:hover {
  background-color: #1557b0;
  opacity: 0.95;
}
```

ChatGPT, Gemini, and Claude dropped the `opacity` line entirely:

ChatGPT、Gemini 和 Claude 把 `opacity` 这一行整个删掉了：

```diff
--- original/style.css
+++ refactors/chatgpt.css, refactors/gemini.css, refactors/claude.css
  .btn-primary:hover {
    background-color: #1557b0;
-   opacity: 0.95;
  }
```

Only Cursor and Copilot kept it. It’s a single, easy-to-miss property, but losing it means one less bit of feedback when a user actually hovers over the button.

只有 Cursor 和 Copilot 保留了它。这只是单个容易被忽略的属性，但丢掉它就意味着用户真正把鼠标悬到按钮上时，少了一分反馈。

## 总体结论：哪款 AI 工具的 CSS 重构最好？

Here’s a straight ranking, scored directly from the results above. Each test counts for 2 points (✅), 1 (⚠️), or 0 (❌) — except Claude’s Test 2, split to 0.5 to reflect two compounded risks rather than one (see the footnote below).

下面是直接依据上述结果打分的排名。每项测试计 2 分（✅）、1 分（⚠️）或 0 分（❌）——除了 Claude 的测试 2，拆成 0.5 分，以反映它是两个叠加风险而不是一个（见下方脚注）。

I also added the three findings outside the test suite (Finding I., Finding VI., and Finding VII.), capped at 1 point each, so no single finding can outweigh an actual test result:

我还加入了测试套件之外的三项发现（发现 I、发现 VI、发现 VII），每项上限 1 分，这样任何单项发现都无法压过一项真实的测试结果：

|                         | Cursor | Copilot | ChatGPT | Claude | Gemini |
| ----------------------- | ------ | ------- | ------- | ------ | ------ |
| 测试 1 – hover 层叠     | 0      | 0       | 0       | 0      | 0      |
| 测试 2 – 层叠上下文     | 2      | 1       | 1       | 0.5    | 1      |
| 测试 3 – 近似重复取值   | 2      | 2       | 2       | 0      | 0      |
| 测试 4 – 状态覆盖       | 2      | 2       | 2       | 2      | 2      |
| 测试 5 – 部分清理       | 2      | 2       | 0       | 2      | 0      |
| 测试 6 – 选择器作用域   | 1      | 1       | 1       | 1      | 1      |
| 测试 7 – 厂商前缀       | 2      | 2       | 2       | 2      | 2      |
| 七项测试小计            | 11     | 10      | 8       | 7.5    | 6      |
| 发现 I – 冗余清理       | 1      | 1       | 1       | 1      | 1      |
| 发现 VI – 现代化 (#1)   | 1      | 0       | 0.5     | 1      | 0.5    |
| 发现 VII – hover 透明度 | 1      | 1       | 0       | 0      | 0      |
| 总分                    | 14     | 12      | 9.5     | 9.5    | 7.5    |

(#1) Cursor and Claude earned full points (1.0) by introducing custom properties to fix the padding-coupling issue. Copilot scored 0 after adding an unused variable and introducing an unrequested `.card-wrapper` centering regression. ChatGPT and Gemini received 0.5 as a neutral score for leaving custom properties untouched, since opting not to modernize isn’t the same as modernizing poorly. See Finding VI above for details.

(#1) Cursor 和 Claude 通过引入自定义属性解决了内边距耦合问题，拿到满分（1.0）。Copilot 因为加了一个未使用的变量、又引入了未经请求的 `.card-wrapper` 居中回归，得 0 分。ChatGPT 和 Gemini 没动自定义属性，给 0.5 分的中性分——因为「选择不现代化」和「现代化做得很糟」并不是一回事。详见上文「发现 VI」。

As the scoring table shows, Cursor finished in first place. It was the only tool that avoided unique regressions, failing only Test 1 alongside every other assistant, and one of just two tools that preserved the hover opacity declaration (Finding VII).

从评分表看，Cursor 排名第一。它是唯一没有引入独有回归的工具——只和其他所有助手一样在测试 1 上失手，同时也是仅有的两款保留了 hover 透明度声明的工具之一（发现 VII）。

Copilot trailed Cursor by two points, losing `.card`‘s stacking isolation like ChatGPT and Gemini (Test 2) and stumbling on its custom property implementation (Finding VI).

Copilot 以两分之差紧随 Cursor 之后，它像 ChatGPT 和 Gemini 一样弄丢了 `.card` 的层叠隔离（测试 2），并在自定义属性的实现上栽了跟头（发现 VI）。

ChatGPT and Claude tied overall, though they took different paths to get there. ChatGPT performed slightly better on the seven core test cases (8 vs. 7.5), but Claude’s effective use of custom properties in Finding VI leveled the final score.

ChatGPT 和 Claude 总分并列，但走的是两条不同的路。ChatGPT 在 7 个核心测试用例上表现略好（8 分对 7.5 分），但 Claude 在发现 VI 中对自定义属性的有效运用把最终分数拉平了。

Gemini landed in last place, standing out as the only assistant to fail three of the seven test cases (Test 1, Test 3, and Test 5).

Gemini 垫底，是唯一在 7 个测试用例中失手三项的助手（测试 1、测试 3 和测试 5）。

One clear pattern emerged: the top two spots went to agentic, editor-based coding assistants rather than chat interfaces. That distinction makes sense. Agentic tools edit files directly in place, whereas chat tools regenerate the entire stylesheet from a prompt – a process where it’s much easier to accidentally alter or drop existing properties.

一个清晰的规律浮现出来：前两名都是代理式、基于编辑器的编码助手，而不是聊天界面。这个区分很合理。代理式工具直接在原地编辑文件，而聊天工具是根据提示词重新生成整份样式表——在这个过程中，意外改动或丢失已有属性要容易得多。

However, the main takeaway isn’t the ranking itself. It’s the fact that every single AI tool introduced a bug on a component simple enough to fit inside a single CSS file.

不过，核心结论并不是排名本身，而是一个事实：在简单到能塞进单个 CSS 文件的组件上，每一款 AI 工具都引入了 bug。

AI assistants excel at standard cleanup tasks like removing dead code and deleting redundant declarations. Yet several went beyond their scope; most added an unrequested transition, and Copilot centered a card layout that was never meant to move. While AI can speed up a CSS refactor, developers still need to review the output, spot visual regressions, evaluate unrequested changes, and ensure the CSS cascade continues to resolve as intended.

AI 助手在标准化清理任务上表现出色，比如删除死代码和冗余声明。但有好几款越了界：大多数加了未经请求的 transition，Copilot 则把一个本不该移动的卡片布局居中了。AI 确实能加速 CSS 重构，但开发者仍需要审查输出、发现视觉回归、评估未经请求的改动，并确保 CSS 层叠依然按预期解析。

Ultimately, these seven test cases offer a practical, reusable benchmark. Because the prompt and input stylesheet remain fixed, this test suite can easily evaluate future model releases or new AI coding assistants, giving us a consistent way to measure progress over time.

归根结底，这 7 个测试用例提供了一套实用、可复用的基准。由于提示词和输入样式表是固定的，这套测试可以很方便地评估未来的模型版本或新出现的 AI 编码助手，让我们有了一致的尺度来衡量长期进展。

---

> **译者注**：本文最有价值的不是排名，而是「**固定提示词 + 固定样式表**」这套可复用的基准方法。如果你想复现或扩展，可以注意几点：① 作者的测试集刻意只用单个 CSS 文件、单个组件，排除了工程复杂度这个变量，所以暴露出来的问题基本都能归因到模型对 CSS 语义的理解；② 五款工具在测试 1（`!important` 与源码顺序的层叠裁决）上**全军覆没**，说明「哪条规则实际生效」这种反直觉的推理仍是当前模型的系统性弱项；③ 聊天式工具 vs 代理式编辑器的能力差距（前两名都是 `agentic`）提示我们：把整个文件「重新生成一遍」本身就是一个高风险动作模式。
