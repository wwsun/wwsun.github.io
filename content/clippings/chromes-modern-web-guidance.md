---
title: 如何使用 Chrome 现代 Web 指南防止 AI 编程智能体编写遗留前端代码
description: Chrome 团队推出的 Modern Web Guidance 将现代 Web 平台指南嵌入 AI 编程工作流，帮助智能体优先选择原生 HTML/CSS/浏览器 API 而非过时的依赖方案
tags:
  - clippings
  - ai
  - frontend
  - browser-apis
  - coding-agents
source: https://blog.logrocket.com/chromes-modern-web-guidance-prevent-ai-coding-agents/
created: 2026-07-28
author: Emmanuel John
---

## 如何使用 Chrome 现代 Web 指南防止 AI 编程智能体编写遗留前端代码

> **原文**：[How to use Chrome's Modern Web Guidance to prevent AI agents from writing legacy frontend code](https://blog.logrocket.com/chromes-modern-web-guidance-prevent-ai-coding-agents/) | 作者：Emmanuel John | 日期：2026-07-22

## 📝 摘要

AI 编程智能体在解决现代前端问题时，往往会默认使用过时的模式——加 JS 依赖、老旧的浏览器 API、多余的库。Chrome 团队推出的 Modern Web Guidance 通过在 AI 编码工作流中嵌入现代 Web 平台指南、浏览器兼容性数据和最佳实践来解决这一问题。文章通过对比两个任务管理 App 的实现（一个使用标准 AI 智能体，另一个启用 Modern Web Guidance），展示了后者如何用原生 `<dialog>`、CSS 锚点定位、Container Queries 和 `scheduler.yield()` 替代第三方库，从而产出更简洁、更现代的前端代码。

## 📋 术语表

| 英文                           | 中文              | 说明                                                                 |
| ------------------------------ | ----------------- | -------------------------------------------------------------------- |
| Modern Web Guidance            | 现代 Web 指南     | Chrome 团队推出的智能体技能集，嵌入现代 Web 平台指南到 AI 编码工作流 |
| AI coding agents               | AI 编程智能体     | 辅助编写代码的 AI 工具，如 Gemini CLI、Claude Code、Copilot CLI 等   |
| Baseline                       | Baseline          | Web 平台特性兼容性基准，由 Chrome 推动的标准                         |
| CSS Anchor Positioning         | CSS 锚点定位      | 允许一个元素基于另一个元素定位的 CSS 新特性                          |
| Container Queries              | 容器查询          | 基于父容器尺寸而非视口宽度进行响应式布局的 CSS 特性                  |
| `<dialog>`                     | `<dialog>` 元素   | 原生 HTML 对话框元素，支持模态和顶层行为                             |
| Popover API                    | 弹出框 API        | 浏览器原生弹出框能力，无需 JavaScript 实现                           |
| scheduler.yield()              | scheduler.yield() | 将主线程控制权交还给浏览器的调度 API                                 |
| INP                            | 交互到下次绘制    | Interaction to Next Paint，衡量交互响应性的性能指标                  |
| progressive enhancement        | 渐进增强          | 先保证基本功能，再对高级浏览器增强体验的策略                         |
| top layer                      | 顶层              | 浏览器渲染中位于所有元素之上的特殊层级，用于 dialog、popover 等      |
| retrieval-augmented generation | 检索增强生成      | 结合信息检索与文本生成的技术，简称 RAG                               |

---

## 正文（双语对照）

AI coding agents are useful, but they have a familiar failure mode: They often solve modern frontend problems with legacy patterns.

AI 编程智能体很有用，但它们有一个常见的失败模式：常常用过时的模式来解决现代前端问题。

Ask an agent to build a modal, tooltip, responsive card layout, or long-running search interaction, and it may reach for extra JavaScript, older browser APIs, or another dependency. Sometimes that is the right tradeoff. But often, the browser can already solve the problem with native HTML, CSS, or platform APIs.

让智能体构建一个模态框、提示工具、响应式卡片布局或长时间运行的搜索交互，它可能会求助于额外的 JavaScript、旧版浏览器 API 或另一个依赖。有时这是合理的取舍。但很多时候，浏览器本身已经可以通过原生 HTML、CSS 或平台 API 来解决问题。

That gap exists because the web platform changes faster than model training data. New features ship, syntax changes, browser support improves, and best practices evolve. A model may not know the feature exists, or it may know about the feature but use outdated syntax or recommend fallbacks your project does not need.

这个差距存在的原因是 Web 平台的演进速度超过了模型训练数据的更新速度。新特性不断发布，语法变化，浏览器支持改善，最佳实践也在演进。模型可能根本不知道某个特性存在，或者知道这个特性却使用了过时的语法，或推荐了项目并不需要的回退方案。

Chrome's Modern Web Guidance is designed to close that gap. It is a set of agent skills from the Chrome team that embeds modern web platform guidance, browser compatibility data, and best practices directly into AI coding workflows. Instead of relying only on the model's training data, your agent can retrieve relevant guidance before it writes code.

Chrome 的现代 Web 指南正是为了弥合这一差距而设计的。它是 Chrome 团队推出的一组智能体技能，将现代 Web 平台指南、浏览器兼容性数据和最佳实践直接嵌入到 AI 编码工作流中。与其仅依赖模型的训练数据，智能体可以在编写代码之前检索相关的指南。

In this article, we'll set up Modern Web Guidance, configure a browser support target, and compare two generated task manager apps: one built with a standard AI coding agent and one built with Modern Web Guidance enabled. The goal is not to prove that native APIs are always better than libraries. It is to show how better guidance can help agents choose simpler, more current frontend solutions when the platform already supports them.

在本文中，我们将设置现代 Web 指南，配置浏览器支持目标，并对比两个生成的任务管理应用：一个使用标准 AI 编程智能体构建，另一个启用了现代 Web 指南。目的不是要证明原生 API 总是优于第三方库，而是要展示更好的指南如何帮助智能体在平台已经支持的情况下选择更简单、更现代的前端方案。

## 前提条件

To follow along, you'll need:

你需要准备：

- Node.js 18 or later

- Node.js 18 或更高版本

- A supported AI coding agent, such as Antigravity, Gemini CLI, Claude Code, Copilot CLI, or another tool that supports agent skills

- 一个支持的 AI 编程智能体，如 Antigravity、Gemini CLI、Claude Code、Copilot CLI 或其他支持智能体技能的工具

- A frontend project to test against. This article uses a React/Next.js project, but the guidance itself is not React-specific

- 一个用于测试的前端项目。本文使用 React/Next.js 项目，但指南本身不依赖 React

## 为什么 AI 编程智能体生成的是遗留 Web 代码

Large language models have a basic limitation: Their knowledge has a cutoff date. Even when an agent can search or retrieve documentation, it may still default to familiar patterns from its training data unless the workflow explicitly tells it to check modern platform guidance.

大型语言模型有一个基本限制：它们的知识有截止日期。即使智能体可以搜索或检索文档，它仍然可能默认采用训练数据中的熟悉模式，除非工作流明确告诉它要检查现代平台指南。

This creates two common failure modes:

这导致了两种常见的失败模式：

- The agent does not know a newer browser feature exists. For example, it may install a tooltip library instead of considering CSS Anchor Positioning or the Popover API.

- 智能体不知道某个更新的浏览器特性已经存在。例如，它可能会安装一个提示工具库，而不是考虑 CSS 锚点定位或弹出框 API。

- The agent knows the feature exists, but uses the wrong syntax or support assumptions. This can lead to broken attributes, incomplete fallbacks, or code that works only in a narrow browser target.

- 智能体知道该特性存在，但使用了错误的语法或兼容性假设。这可能导致属性损坏、回退方案不完整，或代码只在很窄的浏览器范围内才能正常工作。

Legacy code has real costs. It can increase bundle size, add maintenance overhead, introduce more failure points, and make performance harder to reason about. Over time, those small choices accumulate into a frontend that is more complex than it needs to be.

遗留代码有真实的代价。它会增加包体积、增加维护负担、引入更多故障点，并使性能难以推理。随着时间的推移，这些微小的选择会累积成一个比实际需要更复杂的前端。

You might assume that retrieval-augmented generation (RAG) solves this. RAG can help, but it still pushes a lot of work onto the developer. You have to find the right documentation, keep it current, and make sure the model can reason over it correctly for each task.

你可能会认为检索增强生成（RAG）可以解决这个问题。RAG 确实有帮助，但它仍然将大量工作推给了开发者。你需要找到正确的文档，保持其最新，并确保模型能够针对每个任务正确地对其进行推理。

Modern Web Guidance takes a more structured approach. It packages expert-curated guidance into skills that an agent can discover and retrieve as part of its normal coding loop.

现代 Web 指南采用了一种更具结构化的方法。它将专家精心策划的指南打包成技能，智能体可以在其正常的编码循环中发现和检索这些技能。

At a high level, it helps agents:

在高层次上，它帮助智能体：

- Avoid outdated frontend patterns

- 避免过时的前端模式

- Prefer native HTML, CSS, and browser APIs when they are a good fit

- 在合适的情况下优先使用原生 HTML、CSS 和浏览器 API

- Apply accessibility and UI guidance more consistently

- 更一致地应用无障碍和 UI 指南

- Consider performance metrics such as Interaction to Next Paint (INP) and Largest Contentful Paint (LCP)

- 考虑性能指标，如交互到下次绘制（INP）和最大内容绘制（LCP）

- Follow security best practices around areas such as Content Security Policy (CSP), cookies, and cross-origin isolation

- 遵循安全最佳实践，涉及内容安全策略（CSP）、Cookie 和跨源隔离等领域

- Match recommendations to the project's declared browser support target

- 将建议与项目声明的浏览器支持目标相匹配

## 现代 Web 指南在实践中改变了什么

Without Modern Web Guidance, an agent may treat a native browser feature as an edge case and solve the problem with a dependency. With Modern Web Guidance, the same agent is more likely to ask: "Can the platform do this already?"

没有现代 Web 指南时，智能体可能将原生浏览器特性视为例外情况，通过加依赖来解决问题。有了现代 Web 指南，同一个智能体更可能问："平台是否已经支持这个功能？"

That difference matters because it changes the default decision path. The agent can still choose a library when browser support, product requirements, or team constraints make that the better option. But the library is no longer the automatic first answer.

这种差异很重要，因为它改变了默认的决策路径。当浏览器支持、产品需求或团队约束使第三方库成为更好的选择时，智能体仍然可以选择库。但库不再是最先想到的自动答案。

Modern Web Guidance covers several areas of frontend development:

现代 Web 指南覆盖了前端开发的多个领域：

| Discipline           | What the agent can retrieve guidance on                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| User experience      | View Transitions, entry and exit animations, scroll-driven effects, and native interaction patterns      |
| CSS layout           | Container queries, `subgrid`, anchor positioning, intrinsic sizing, and modern color spaces like `oklch` |
| Performance          | INP diagnostics, `scheduler.yield()`, background task scheduling, and image/resource prioritization      |
| Forms and UI         | Native `<dialog>`, the Popover API, form validation states, and accessible UI behavior                   |
| Accessibility        | Focus management, semantic HTML, accessible errors, keyboard behavior, and ARIA usage                    |
| Security and privacy | CSP, cookies, cross-origin isolation, data minimization, and safer defaults                              |
| Built-in AI          | On-device translation, summarization, and language detection APIs where available                        |

| 领域       | 智能体可检索的指南内容                                             |
| ---------- | ------------------------------------------------------------------ |
| 用户体验   | 视图过渡、进场和退场动画、滚动驱动效果以及原生交互模式             |
| CSS 布局   | 容器查询、`subgrid`、锚点定位、固有尺寸以及 `oklch` 等现代色彩空间 |
| 性能       | INP 诊断、`scheduler.yield()`、后台任务调度以及图片/资源优先级管理 |
| 表单与 UI  | 原生 `<dialog>`、弹出框 API、表单验证状态以及无障碍 UI 行为        |
| 无障碍     | 焦点管理、语义化 HTML、无障碍错误提示、键盘行为以及 ARIA 使用      |
| 安全与隐私 | CSP、Cookie、跨源隔离、数据最小化以及更安全的默认配置              |
| 内置 AI    | 设备端翻译、摘要生成和语言检测 API（在可用的情况下）               |

Chrome's documentation describes Modern Web Guidance as an early preview, so treat it as a fast-moving tool rather than a static reference. That makes the installation and update path important.

Chrome 的文档将现代 Web 指南描述为早期预览版，因此将其视为一个快速迭代的工具，而非静态参考。这使得安装和更新路径变得重要。

## 设置现代 Web 指南

The recommended installation path is the `modern-web-guidance` CLI, which installs the skill files and keeps them updated.

推荐的安装方式是通过 `modern-web-guidance` CLI，它会安装技能文件并保持更新。

Open your terminal and run:

打开终端并运行：

```bash
npx modern-web-guidance@latest install
```

The installer guides you through setup and lets you choose where the skills should be available. Depending on your workflow, you can install the guidance globally or into a specific project.

安装程序会引导你完成设置，并让你选择技能文件应放置的位置。根据你的工作流程，你可以全局安装指南或安装到特定项目中。

A project-level install is a good default when you want the guidance to travel with one codebase. A global install is useful if you want the same guidance available across multiple projects and agents on your machine.

当你希望指南随某个代码库一起使用时，项目级别安装是一个不错的默认选择。如果你希望同一指南在机器上的多个项目和智能体之间可用，全局安装则更为实用。

### 直接安装到特定智能体中

You can also install Modern Web Guidance directly for specific coding agents.

你也可以直接将现代 Web 指南安装到特定的编程智能体中。

For Gemini CLI, run:

对于 Gemini CLI，运行：

```bash
gemini extensions install https://github.com/GoogleChrome/modern-web-guidance --auto-update
```

For Antigravity CLI, run:

对于 Antigravity CLI，运行：

```bash
agy plugin install https://github.com/GoogleChrome/modern-web-guidance
```

For Claude Code, add the marketplace, install the plugin, and reload plugins:

对于 Claude Code，添加市场、安装插件并重载插件：

```bash
/plugin marketplace add GoogleChrome/modern-web-guidance
/plugin install modern-web-guidance@googlechrome
/reload-plugins
```

For Copilot CLI, add the marketplace and install the plugin:

对于 Copilot CLI，添加市场并安装插件：

```bash
/plugin marketplace add GoogleChrome/modern-web-guidance
/plugin install modern-web-guidance@googlechrome
```

For GitHub CLI, run:

对于 GitHub CLI，运行：

```bash
gh skill install GoogleChrome/modern-web-guidance
```

For Vercel Skills, run:

对于 Vercel Skills，运行：

```bash
npx skills add GoogleChrome/modern-web-guidance
```

The exact install path depends on the agent, but the result is the same: Your coding agent gains access to a skill that can search and retrieve modern web platform guidance before implementing a task.

具体的安装路径取决于智能体，但结果是相同的：你的编程智能体获得了一个可以在实现任务之前搜索和检索现代 Web 平台指南的技能。

## 验证安装

After installation, confirm that the skill is available to your agent. Depending on your install method, you may see generated skill files in your project or user-level agent configuration directory.

安装完成后，确认该技能对你的智能体可用。根据你的安装方式，你可能会在项目目录或用户级智能体配置目录中看到生成的技能文件。

Modern Web Guidance also exposes CLI commands you can use to explore the guide library directly. For example, you can search for guidance on animating a dialog modal:

现代 Web 指南还暴露了 CLI 命令，你可以直接用它们来探索指南库。例如，你可以搜索如何为对话框模态框添加动画效果的指南：

```bash
npx modern-web-guidance@latest search "animate a dialog modal backdrop"
```

Then retrieve a specific guide by ID:

然后通过 ID 检索特定的指南：

```bash
npx modern-web-guidance@latest retrieve "animate-to-from-top-layer"
```

This is useful even before you wire the skill into an agent. It lets you inspect the guidance your agent will receive and verify that the relevant use cases exist for the feature you are building.

即使在你将技能接入智能体之前，这也很有用。它可以让你检查智能体将收到的指南内容，并确认相关用例对你正在构建的特性确实适用。

## 设置 Baseline 目标

Modern Web Guidance is most useful when it knows what browsers your project supports. Otherwise, it has to be conservative.

当现代 Web 指南知道你的项目支持哪些浏览器时，它最为有用。否则，它只能保守行事。

By default, Modern Web Guidance targets Baseline Widely available. That means the agent will usually include progressive enhancement patterns, fallbacks, or conditional loading where a feature is not broadly supported.

默认情况下，现代 Web 指南以 Baseline Widely available 为目标。这意味着智能体通常会在某个特性未被广泛支持时，引入渐进增强模式、回退方案或条件加载。

If your project targets a newer browser set, declare that explicitly in your agent instruction file, such as `AGENTS.md`, `CLAUDE.md`, or `.gemini/GEMINI.md`:

如果你的项目针对更新的浏览器集合，请在你的智能体指令文件（如 `AGENTS.md`、`CLAUDE.md` 或 `.gemini/GEMINI.md`）中明确声明：

```plaintext
This project's Baseline target is Baseline 2024.
本项目的 Baseline 目标是 Baseline 2024。
```

You can also add project-specific support context:

你还可以添加项目特定的支持上下文：

```plaintext
# Browser support target
# 浏览器支持目标

This project's Baseline target is Baseline 2024.
本项目的 Baseline 目标是 Baseline 2024。
Prefer native browser APIs when they meet this target.
优先选择满足此目标的原生浏览器 API。
Use progressive enhancement for newer or limited-availability features.
对较新或可用性有限的特性使用渐进增强。
```

This helps the agent decide when it can use a modern feature directly and when it should include a fallback. For example, an internal dashboard locked to recent Chromium browsers can make different choices than a public consumer app that needs broad Safari and Firefox support.

这有助于智能体决定何时可以直接使用现代特性，以及何时需要包含回退方案。例如，一个锁定在最新 Chromium 浏览器的内部仪表盘，与一个需要广泛支持 Safari 和 Firefox 的面向公众的应用，可以做出不同的选择。

The important part is that the browser target becomes part of the agent's context. Without it, the agent may either over-polyfill or use a feature too aggressively.

关键在于浏览器目标成为智能体上下文的一部分。没有它，智能体可能会过度引入 polyfill，或者过于激进地使用某个特性。

## 在示例应用中测试现代 Web 指南

To see what Modern Web Guidance changes in practice, I created two copies of the same initialized Next.js project:

为了观察现代 Web 指南在实践中带来的变化，我创建了同一个 Next.js 项目的两份副本：

- `taskmanager1`: Built without Modern Web Guidance
- `taskmanager2`: Built with Modern Web Guidance enabled

- `taskmanager1`：未启用现代 Web 指南构建
- `taskmanager2`：启用了现代 Web 指南构建

I used Gemini CLI with the same model settings in both environments and gave both agents the same prompt:

在两个环境中都使用相同的模型设置的 Gemini CLI，并给两个智能体相同的提示词：

```plaintext
Build a Task Manager app. It should have:

构建一个任务管理应用，应包含以下功能：

- A modal for adding tasks with smooth entrance and exit animations.
- Task cards that stack vertically in a sidebar but show full details in the main area.
- A search bar that filters 2,000 tasks without lagging the UI.
- A Help tooltip tethered to the Status icon that flips if it hits the viewport edge.

- 一个用于添加任务的模态框，具有平滑的进出动画
- 任务卡片在侧边栏中纵向堆叠，但在主区域显示完整详情
- 一个搜索栏，可以过滤 2000 条任务而不让 UI 卡顿
- 一个绑定在状态图标上的帮助提示工具，到达视口边缘时自动翻转
```

The same prompt was run against two copies of the project: one without Modern Web Guidance and one with the skill enabled.

同一个提示词在两个项目副本上运行：一个没有现代 Web 指南，另一个启用了该技能。

The most interesting difference was not just the final code. It was the agent's decision process.

最有趣的差异不仅仅是最终的代码，而是智能体的决策过程。

Without Modern Web Guidance, the agent treated UI complexity as a signal to add libraries. With Modern Web Guidance installed, the agent added a research step to look for relevant browser-native patterns before implementing the feature.

没有现代 Web 指南时，智能体将 UI 复杂性视为添加库的信号。安装了现代 Web 指南后，智能体在实现功能之前增加了一个研究步骤，先查找相关的浏览器原生模式。

With Modern Web Guidance enabled, the agent retrieved relevant platform guidance before choosing an implementation approach.

启用现代 Web 指南后，智能体在选择实现方案之前先检索了相关的平台指南。

## 结果对比

Here is how the two builds differed:

以下是两个构建版本的差异：

| Feature         | `taskmanager1` without guidance                                                         | `taskmanager2` with guidance                                                  |
| --------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Modal animation | Used a custom modal implementation with JavaScript state and transition timing          | Used native `<dialog>` with modern CSS entry/exit animation patterns          |
| Task cards      | Used media queries, which made the layout dependent on viewport width                   | Used CSS Container Queries, so cards adapted to the sidebar container         |
| Search filter   | Used React memoization and timer-based logic, but still relied on synchronous filtering | Used `scheduler.yield()` to break work into chunks and keep the UI responsive |
| Help tooltip    | Used a floating UI dependency for positioning and edge flipping                         | Used CSS Anchor Positioning where supported by the project target             |

| 特性         | `taskmanager1`（无指南）                                 | `taskmanager2`（有指南）                              |
| ------------ | -------------------------------------------------------- | ----------------------------------------------------- |
| 模态框动画   | 使用自定义模态框实现，通过 JavaScript 状态和过渡时间控制 | 使用原生 `<dialog>` 配合现代 CSS 进出动画模式         |
| 任务卡片     | 使用媒体查询，布局依赖于视口宽度                         | 使用 CSS 容器查询，卡片适配侧边栏容器                 |
| 搜索过滤     | 使用 React 记忆化和基于定时器的逻辑，但仍依赖同步过滤    | 使用 `scheduler.yield()` 将工作拆分为块，保持 UI 响应 |
| 帮助提示工具 | 使用浮动 UI 依赖库处理定位和边缘翻转                     | 在项目支持的浏览器范围内使用 CSS 锚点定位             |

The biggest change was dependency pressure. In `taskmanager1`, the agent added extra JavaScript to solve UI interactions that the browser can increasingly handle on its own. In `taskmanager2`, the agent used the Modern Web Guidance skill to identify native equivalents and avoid additional UI positioning and animation packages for these features.

最大的变化在于依赖压力。在 `taskmanager1` 中，智能体添加了额外的 JavaScript 来解决浏览器本身已经越来越能自主处理的 UI 交互。在 `taskmanager2` 中，智能体利用现代 Web 指南技能识别出原生等效方案，避免了为这些功能引入额外的 UI 定位和动画包。

That does not mean every app should remove every UI dependency. Libraries still matter when you need broader browser support, mature accessibility abstractions, complex design-system behavior, or consistent cross-framework APIs. The point is that the agent made a more informed tradeoff.

这并不意味着每个应用都应该移除所有 UI 依赖。当你需要更广泛的浏览器支持、成熟的无障碍抽象、复杂的设计系统行为或一致的跨框架 API 时，库仍然很重要。关键在于智能体做出了更有信息量的取舍。

## 代码对比：提示工具定位

The tooltip requirement asked for a Help tooltip tethered to the Status icon that flips when it reaches the viewport edge.

提示工具的需求是：一个绑定在状态图标上的帮助提示工具，在到达视口边缘时自动翻转。

### 未使用现代 Web 指南

The unguided agent installed a positioning library and wrote a hook-based component:

无指南的智能体安装了一个定位库，并编写了一个基于 Hook 的组件：

```javascript
import { useFloating, flip, shift, offset } from "@floating-ui/react"

export function StatusTooltip({ children }) {
  const { refs, floatingStyles } = useFloating({
    placement: "top",
    middleware: [offset(10), flip(), shift()],
  })

  return (
    <>
      <div ref={refs.setReference} className="status-icon">
        i
      </div>
      <div ref={refs.setFloating} style={floatingStyles} className="tooltip">
        {children}
      </div>
    </>
  )
}
```

This is not inherently wrong. Floating UI is a strong option when you need robust positioning across browsers and complex interactions. But for a simple tooltip in a modern-browser target, it may be more than the feature requires.

这本身没有错。当需要在各种浏览器中实现稳健的定位和复杂交互时，Floating UI 是一个强有力的选择。但对于一个在现代浏览器目标下的简单提示工具来说，这可能超出了功能所需。

### 使用现代 Web 指南

The guided agent recognized CSS Anchor Positioning as a possible fit. A simplified version looks like this:

有指南的智能体识别出 CSS 锚点定位可能适用于此场景。简化版代码如下：

```javascript
export function StatusTooltip({ children }) {
  return (
    <>
      <div className="status-icon">i</div>
      <div className="tooltip" role="tooltip">
        {children}
      </div>
    </>
  )
}
```

```css
.status-icon {
  anchor-name: --status-icon;
}

.tooltip {
  position: absolute;
  position-anchor: --status-icon;
  position-area: top;
  position-try-fallbacks: flip-block;
  margin-bottom: 10px;
}
```

The implementation moves positioning work out of JavaScript and into CSS. That makes the code smaller and easier to inspect. However, this is also where the Baseline target matters. If your app needs browsers that do not fully support CSS Anchor Positioning, you still need a progressive enhancement strategy or a library fallback.

这个实现将定位工作从 JavaScript 移到了 CSS 中。这使得代码更少、更易于检查。然而，这也正是 Baseline 目标的重要性所在。如果你的应用需要支持不完全支持 CSS 锚点定位的浏览器，你仍然需要渐进增强策略或库回退方案。

## 代码对比：模态框动画

The modal requirement asked for smooth entrance and exit animations. The two builds solved that at different layers of the stack.

模态框的需求要求平滑的进出动画。两个构建在不同层面解决了这个问题。

### 未使用现代 Web 指南

The unguided agent used `createPortal`, a `shouldRender` flag, and a `setTimeout` to keep the modal mounted long enough for the exit animation to finish:

无指南的智能体使用了 `createPortal`、一个 `shouldRender` 标志和 `setTimeout` 来保持模态框挂载足够长时间以完成退出动画：

```javascript
export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'auto';
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return createPortal(
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
      <div
        className={`${styles.modal} ${isOpen ? styles.open : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
```

The fragile part is the `300` millisecond timer. The JavaScript timeout and the CSS transition duration have to stay in sync manually. If someone changes the animation duration in CSS, the JavaScript can fall out of sync.

脆弱的地方在于那个 `300` 毫秒的定时器。JavaScript 的超时时间和 CSS 过渡时长必须手动保持同步。如果有人更改了 CSS 中的动画时长，JavaScript 就可能失同步。

### 使用现代 Web 指南

The guided version used the native `<dialog>` element and let the browser handle top-layer behavior. In React, you still need a small amount of JavaScript to open and close the dialog, but you no longer need a custom render timer or portal layer:

有指南的版本使用了原生 `<dialog>` 元素，让浏览器处理顶层行为。在 React 中，你仍然需要少量 JavaScript 来打开和关闭对话框，但不再需要自定义渲染定时器或 portal 层：

```javascript
import { useEffect, useRef } from 'react';

export function TaskModal({ open, onClose, children }: TaskModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={dialogRef} onClose={onClose}>
      <form method="dialog">
        {children}
        <button type="submit">Create task</button>
        <button type="button" onClick={() => dialogRef.current?.close()}>
          Cancel
        </button>
      </form>
    </dialog>
  );
}
```

Then CSS handles the entry and exit animation:

然后由 CSS 处理进出动画：

```css
dialog {
  opacity: 0;
  transform: scale(0.96);
  transition:
    display 0.4s,
    overlay 0.4s,
    opacity 0.4s ease,
    transform 0.4s ease;
  transition-behavior: allow-discrete;
}

dialog[open] {
  opacity: 1;
  transform: scale(1);
}

@starting-style {
  dialog[open] {
    opacity: 0;
    transform: scale(0.96);
  }
}

dialog::backdrop {
  background: rgb(0 0 0 / 40%);
}
```

There is no render timeout to maintain. The browser's top layer handles important modal behavior, including focus handling and backdrop rendering. You should still test keyboard behavior, focus return, and screen reader output, but the implementation starts from a stronger native primitive.

没有需要维护的渲染超时。浏览器的顶层处理了重要的模态行为，包括焦点处理和背景遮罩渲染。你仍然应该测试键盘行为、焦点返回和屏幕阅读器输出，但实现从一个更强大的原生原语出发。

## 代码对比：搜索性能

The prompt asked for a search bar that filters 2,000 tasks without lagging the UI. This is an INP problem: if a synchronous loop blocks the main thread, the browser cannot respond to input or paint the next frame until the work finishes.

提示词要求一个搜索栏，可以过滤 2000 条任务而不让 UI 卡顿。这是一个 INP 问题：如果同步循环阻塞了主线程，浏览器在任务完成之前无法响应输入或绘制下一帧。

### 未使用现代 Web 指南

The unguided agent wrapped the filter in `useMemo`:

无指南的智能体将过滤逻辑包装在 `useMemo` 中：

```javascript
const filteredTasks = useMemo(() => {
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )
}, [tasks, searchTerm])
```

`useMemo` avoids unnecessary recalculation across renders, but it does not make the filtering work non-blocking. When `searchTerm` changes, the full filter still runs synchronously on the main thread. This is one of the React patterns that quietly kills performance at scale.

`useMemo` 避免了跨渲染的不必要重计算，但它并没有让过滤工作变成非阻塞的。当 `searchTerm` 变化时，完整的过滤逻辑仍然在主线程上同步运行。这是 React 中悄悄拖垮大规模性能的模式之一。

### 使用现代 Web 指南

The guided agent used `scheduler.yield()` to break the loop into smaller chunks. That gives the browser a chance to handle user input and paint between batches:

有指南的智能体使用 `scheduler.yield()` 将循环拆分为更小的块。这让浏览器有机会在批次之间处理用户输入和绘制：

```javascript
useEffect(() => {
  let cancelled = false;

  const filterTasks = async () => {
    setIsFiltering(true);

    const query = searchQuery.toLowerCase();
    const results: Task[] = [];

    for (let index = 0; index < tasks.length; index++) {
      if (index > 0 && index % 50 === 0) {
        if ('scheduler' in window && 'yield' in window.scheduler) {
          await window.scheduler.yield();
        } else {
          await new Promise(requestAnimationFrame);
        }
      }

      const task = tasks[index];
      const title = task.title.toLowerCase();
      const description = task.description.toLowerCase();

      if (title.includes(query) || description.includes(query)) {
        results.push(task);
      }
    }

    if (!cancelled) {
      setFilteredTasks(results);
      setIsFiltering(false);
    }
  };

  filterTasks();

  return () => {
    cancelled = true;
  };
}, [searchQuery, tasks]);
```

The important change is not just the API choice. The agent reasoned about the interaction as a responsiveness problem rather than a React rendering problem. That led to a different implementation strategy: split long work so the browser can keep responding.

重要的变化不仅仅是 API 的选择。智能体将交互视为响应性问题而非 React 渲染问题来推理。这导致了不同的实现策略：拆分长任务，让浏览器能够持续响应。

For production, you would still test this with realistic data and devices. For very large datasets, server-side search, indexing, virtualization, or a Web Worker may be more appropriate. But for this demo, Modern Web Guidance moved the agent toward the right performance question.

对于生产环境，你仍然需要用真实数据和设备测试。对于非常大的数据集，服务端搜索、索引、虚拟化或 Web Worker 可能更为合适。但对于这个演示，现代 Web 指南将智能体引向了正确的性能问题。

## 哪些地方仍然需要开发者的判断

Modern Web Guidance improves the agent's starting point, but it does not remove the need for review. The guidance can help an agent discover modern browser features, but you still need to validate whether those choices fit your product.

现代 Web 指南改善了智能体的起点，但它并没有消除审查的必要性。指南可以帮助智能体发现现代浏览器特性，但你仍然需要验证这些选择是否适合你的产品。

Before shipping AI-generated frontend code, review the following:

在发布 AI 生成的前端代码之前，请审查以下内容：

| Question                                         | Why it matters                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Does this match our browser support target?      | A native API may be appropriate for an internal Chrome-only app but risky for a broad public audience.      |
| Is the fallback strategy clear?                  | Newer features often need progressive enhancement or conditional loading.                                   |
| Is the accessibility behavior complete?          | Native elements help, but you still need to test keyboard behavior, focus order, labels, and announcements. |
| Did the agent reduce complexity or just move it? | A smaller dependency list is only useful if the resulting code is easier to maintain.                       |
| Did we test the actual user path?                | Generated code can look modern while still failing in edge cases.                                           |

| 问题                                   | 为什么重要                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------- |
| 这符合我们的浏览器支持目标吗？         | 原生 API 可能适合仅限 Chrome 的内部应用，但对广泛的公众受众来说可能风险较高 |
| 回退策略是否清晰？                     | 较新的特性通常需要渐进增强或条件加载                                        |
| 无障碍行为是否完整？                   | 原生元素有帮助，但你仍然需要测试键盘行为、焦点顺序、标签和提示              |
| 智能体是降低了复杂度还是只是转移了它？ | 减少依赖列表只有在生成的代码更易于维护时才有意义                            |
| 我们测试了实际的用户路径吗？           | 生成的代码可能看起来现代，但在边缘情况下仍可能失败                          |

This is the right mental model: Modern Web Guidance helps the agent ask better questions. It does not replace code review, browser testing, or product-specific tradeoff decisions.

正确的思维方式是：现代 Web 指南帮助智能体提出更好的问题。它不能替代代码审查、浏览器测试或特定于产品的取舍决策。

## 结论

AI coding agents are only as good as the context they use. Without current web platform guidance, they often reach for familiar solutions: extra dependencies, JavaScript-heavy UI code, or older patterns that made sense before newer browser APIs were available.

AI 编程智能体的表现取决于它们使用的上下文。没有最新的 Web 平台指南，它们往往会采用熟悉的解决方案：额外的依赖、大量 JavaScript 的 UI 代码，或在新浏览器 API 可用之前合理的旧模式。

Chrome's Modern Web Guidance gives those agents a more current decision path. In the task manager demo, that changed the output in concrete ways: The agent used native `<dialog>` patterns for modal behavior, CSS Container Queries for component-level responsiveness, CSS Anchor Positioning for the tooltip, and `scheduler.yield()` to keep filtering responsive. The result was not just less code. It was a different default: check what the browser can do first, then add a dependency only when the project actually needs one.

Chrome 的现代 Web 指南为这些智能体提供了一条更现代的决策路径。在任务管理应用的演示中，这在具体层面上改变了输出结果：智能体使用了原生 `<dialog>` 模式处理模态行为、CSS 容器查询实现组件级响应式、CSS 锚点定位处理提示工具，以及 `scheduler.yield()` 保持过滤的响应性。结果不仅仅是代码更少，而是一种不同的默认策略：先检查浏览器能做什么，只在项目确实需要时才添加依赖。

The main takeaway is not that native APIs should always replace libraries. The takeaway is that AI-generated code needs modern constraints. Install the guidance, declare your Baseline target, and review the output against your real browser support, accessibility, and performance requirements.

核心启示不是原生 API 应该总是替代库，而是 AI 生成的代码需要现代的约束条件。安装指南，声明你的 Baseline 目标，并对照真实的浏览器支持、无障碍和性能需求来审查输出。

You can explore the source code for both demo applications below:

你可以在下方找到两个演示应用的源代码：

- taskmanager1: The implementation generated without Modern Web Guidance
- taskmanager2: The implementation generated with Modern Web Guidance enabled

- taskmanager1：未启用现代 Web 指南生成的实现
- taskmanager2：启用现代 Web 指南生成的实现

---

> **译者注**：Chrome 的 Modern Web Guidance 本质上是一套"AI 时代的浏览器最佳实践提示词工程"，它让智能体在写代码之前先查"是不是浏览器已经提供了原生方案"。这对前端开发者很有启发：与其让 AI 自由发挥，不如给它结构化约束（Baseline 目标、浏览器兼容矩阵），从而让 AI 产出更现代、更简洁的代码。
