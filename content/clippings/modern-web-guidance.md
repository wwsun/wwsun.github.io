---
title: 如何用 Modern Web Guidance 阻止 AI 编码智能体写出过时代码
description: Google Chrome 团队推出的 Modern Web Guidance，通过注入专家审核的现代 Web 标准指导，让 AI 智能体生成符合 2025 年浏览器能力的代码
tags:
  - clippings
  - ai-coding-agent
  - web-development
  - modern-web-guidance
  - browser-api
  - css
  - google-chrome
source: https://www.freecodecamp.org/news/how-to-stop-your-ai-coding-agent-from-writing-outdated-code-with-modern-web-guidance/
created: 2026-07-07
---

## 如何用 Modern Web Guidance 阻止 AI 编码智能体写出过时代码

> 原文：[How to Stop Your AI Coding Agent from Writing Outdated Code with Modern Web Guidance](https://www.freecodecamp.org/news/how-to-stop-your-ai-coding-agent-from-writing-outdated-code-with-modern-web-guidance/) 作者：Ophy Boamah 来源：freeCodeCamp

AI 编码智能体可以帮开发者节省大量时间——直到你打开输出文件，发现它们写的代码仿佛还停留在 2019 年。

比如让智能体构建一个 tooltip。HTML 看起来很精致，CSS 过渡动画流畅，`aria-describedby` 的关联也正确。然后你看到 JavaScript：一个 `js-hidden` 类切换系统、一个 `dismissAllTooltips()` 函数、触摸事件处理器、点击外部检测，以及整整一套交互管理层，用来弥补 CSS 无法单独完成的事情。

智能体没有坏。它只是在调用训练数据中占主导地位的模式，尽管浏览器早已提供了更好的方案。

**Modern Web Guidance (MWG)** 是 Google Chrome 团队的开源解决方案。它将专家审核的、平台感知的指导直接注入 AI 智能体的上下文，引导它生成符合现代、可访问、高性能 Web 标准的代码。

在本文中，你将了解为什么 Modern Web Guidance 能解决"遗留代码"问题，以及如何将其集成到你的工作流中，持续获得最新代码。

### 目录

- [为什么 AI 智能体默认使用过时模式？](#为什么-ai-智能体默认使用过时模式)
- [什么是 Modern Web Guidance？](#什么是-modern-web-guidance)
- [如何安装 Modern Web Guidance](#如何安装-modern-web-guidance)
- [安装 Modern Web Guidance 后：实际变化](#安装-modern-web-guidance-后实际变化)
- [Modern Web Guidance 不负责的事情](#modern-web-guidance-不负责的事情)
- [结论](#结论)

## 为什么 AI 智能体默认使用过时模式？

每个大语言模型（LLM）都从 Web 中学习，而 Web 正在以极快的速度演进。新的浏览器 API 在出现数年之后，才能积累足够的教程、Stack Overflow 答案和真实代码库，从而有意义地出现在训练数据中。

实际结果是：即使模型在训练中知道某个现代 API 存在，它见过旧方法数千次、新方法寥寥几次。因此当它生成代码时，过时模式胜出——不是因为模型无知，而是因为过时方法的训练信号更强。

提示词并不能完全解决这个问题。告诉智能体"使用现代 API"只是略微推动一下方向，但它无法提供模型自信地写出生产级现代代码所需的密集的、经过专家验证的实现模式。你必须在每次会话、每个功能中粘贴文档，且永无止境。

以下是问题的实际表现。为了获得真实输出，我在未安装 Modern Web Guidance 的情况下，让 Antigravity IDE 分别构建两个组件。

### 之前：Tooltip 组件

**提示词**："构建一个悬停时出现在按钮上方的 tooltip 组件。"

HTML 还算合理。CSS 用 `position: absolute` 处理定位、动画化透明度，甚至正确配置了 `role="tooltip"` 和 `aria-describedby`。然后你看到 JavaScript：

```js
// ❌ 安装 MWG 之前 —— 一整套用 JS 构建的交互管理层
document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll(".tooltip-container")

  containers.forEach((container) => {
    const trigger = container.querySelector(".tooltip-trigger")
    const tooltip = container.querySelector(".tooltip-content")

    const forceHide = () => tooltip.classList.add("js-hidden")
    const resetVisibility = () => tooltip.classList.remove("js-hidden")

    // Escape 键关闭
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        forceHide()
        e.preventDefault()
      }
    })

    trigger.addEventListener("blur", resetVisibility)
    container.addEventListener("mouseleave", resetVisibility)
    container.addEventListener("mouseenter", resetVisibility)

    // 触摸处理
    trigger.addEventListener(
      "touchstart",
      (e) => {
        const isVisible =
          !tooltip.classList.contains("js-hidden") &&
          getComputedStyle(tooltip).visibility === "visible"
        if (isVisible) {
          forceHide()
        } else {
          dismissAllTooltips()
          resetVisibility()
        }
      },
      { passive: true },
    )
  })

  function dismissAllTooltips() {
    document.querySelectorAll(".tooltip-content").forEach((t) => t.classList.add("js-hidden"))
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".tooltip-container")) {
      document.querySelectorAll(".tooltip-content").forEach((t) => t.classList.remove("js-hidden"))
    }
  })
})
```

问题不在于上面的代码错了——不，它能工作。问题在于它揭示的设计：因为 CSS 的 `:hover` 和 `:focus-within` 选择器无法处理 Escape 关闭、触摸切换或点击外部检测，智能体不得不构建一套平行的 JavaScript 系统来管理 tooltip 状态。可见性现在分散在两个必须保持同步的系统中。`js-hidden` 类专门存在，为了让 JavaScript 能覆盖 CSS。

如果你好奇，可以跳到后面[安装 Modern Web Guidance 之后的 Tooltip 代码](#之后-tooltip-组件)。

接下来看智能体在没有 Modern Web Guidance 的情况下如何构建 toast 通知。

### 之前：带退出动画的 Toast 通知

**提示词**："构建一个 toast 通知系统，通知在移除之前淡出。"

```js
// ❌ 安装 MWG 之前 —— JavaScript 掌控整个动画生命周期
const dismissToast = (toast) => {
  if (toast.classList.contains("toast-fade-out")) return

  // 1. 应用淡出类触发 CSS 过渡
  toast.classList.add("toast-fade-out")

  // 2. 等待过渡完成，然后从 DOM 移除
  const handleUnmount = (e) => {
    if (e.propertyName === "opacity" || e.propertyName === "transform") {
      toast.removeEventListener("transitionend", handleUnmount)
      toast.remove()
    }
  }
  toast.addEventListener("transitionend", handleUnmount)

  // 3. 后备方案：防止 transitionend 未触发
  setTimeout(() => {
    if (toast.parentNode) toast.remove()
  }, 400)
}

// 4 秒后自动关闭
autoDismissTimer = setTimeout(() => {
  dismissToast(toast)
}, 4000)
```

审视以上代码：这种模式极其常见，而且它确实能工作。但请注意有多少 JavaScript 专门用来解决一个本质上是动画时序的问题。

智能体添加一个 CSS 类来启动过渡，然后用 `transitionend` 判断何时移除元素，再加一个 `setTimeout` 作为 `transitionend` 不触发的后备方案，再加另一个 `setTimeout` 实现自动关闭。

JavaScript 和 CSS 深深纠缠在一起。修改 CSS 中的过渡时长，你还得同步修改 JavaScript 中的 timeout 值。

如果你好奇，可以跳到后面[安装 Modern Web Guidance 之后的 Toast 代码](#之后-带退出动画的-toast-通知)。

两个示例呈现了同一种模式：智能体写 JavaScript 来弥补它不知道浏览器已经原生支持的功能。

## 什么是 Modern Web Guidance？

[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) 是一个由 Google Chrome 团队和 Microsoft Edge 团队支持的开源项目。与其指望模型知道现代平台提供了什么能力，不如给它一份结构化的、经过专家验证的参考文件，将常见的开发场景映射到正确的解决方案。

它以 **Agent Skill** 的形式发布——一个位于项目中的 `SKILL.md` 文件，在你生成代码之前被编码智能体读取。可以把它想象成一份项目专属的说明书，教智能体哪些现代 API 存在以及何时使用。这个 Skill 将概率分布向现代平台方案倾斜，其效果是单行提示词指令无法比拟的。

底层机制分三步工作：

1. 智能体因为任务是 Web 相关的而激活 Skill。
2. 智能体运行 `modern-web-guidance search "<query>"`——使用离线 TensorFlow.js 模型的本地语义搜索。无需 API Key，无需网络调用。
3. 智能体通过 `modern-web-guidance retrieve <guide-id>` 获取匹配的指南，将针对性的模式、陷阱和降级策略直接注入上下文窗口。

提供两个 Skill 包。`modern-web-guidance` 涵盖现代浏览器 API、CSS 布局系统、性能、可访问性和内置 AI API。这是大多数开发者需要的。

`chrome-extensions` 涵盖 Manifest V3、后台 worker 和 Chrome Web Store 发布。[早期评测显示](https://developer.chrome.com/docs/modern-web-guidance/get-started#how_is_accuracy_ensured)，安装后智能体对现代最佳实践的遵循度提升了 **37 个百分点**。

### 如何安装 Modern Web Guidance

通用路径（适用于任何智能体）：

```bash
npx modern-web-guidance@latest install
```

这会运行一个交互式向导，检测你的编码智能体，询问你想要哪些 Skill 包，并将 `SKILL.md` 文件自动放到正确位置。CLI 是完全离线自包含的：无外部依赖、无 API Key。

**Claude Code**：

```bash
# 1. 添加市场源
/plugin marketplace add GoogleChrome/modern-web-guidance

# 2. 安装插件
/plugin install modern-web-guidance@googlechrome

# 3. 重载插件
/reload-plugins
```

安装后验证 `.claude/skills/` 存在于项目根目录并包含 Skill 文件。这是 Claude Code 读取 Skill 的位置。

**Cursor**：

Modern Web Guidance 已在 Skill Marketplace 中列出。搜索 `modern-web-guidance` 并点击安装，无需 CLI 步骤。

**GitHub Copilot CLI**：

```bash
# 1. 添加市场源
/plugin marketplace add GoogleChrome/modern-web-guidance

# 2. 安装插件
/plugin install modern-web-guidance@googlechrome
```

**Vercel Agent Skills**：

```bash
npx skills add GoogleChrome/modern-web-guidance
```

**Google Antigravity**：

应用内一键安装。

## 安装 Modern Web Guidance 后：实际变化

[前面](#为什么-ai-智能体默认使用过时模式)我们看到了未安装 Modern Web Guidance 时 Tooltip 和 Toast 通知两个组件的输出。用同样的提示词重新运行，这一次安装了 Modern Web Guidance，智能体使用了完全不同的工具。

### 之后：Tooltip 组件

有了 Modern Web Guidance，同样的 tooltip 提示词不再产生任何 JavaScript。智能体转而使用两个协同工作的 API：`popover="hint"` 实现原生的悬停/聚焦触发可见性，`interestfor`（Interest Invokers API）在 HTML 中以声明式方式将触发器与目标关联。

```html
<!-- ✅ 安装 MWG 之后 —— 声明式 HTML，零 JavaScript -->
<div class="tooltip-wrapper">
  <button id="btn-deploy" class="btn-trigger" interestfor="tooltip-deploy">Deploy App</button>
  <div popover="hint" id="tooltip-deploy" class="tooltip-content">
    Instantly push code changes live
  </div>
</div>
```

```css
/* 锚点定位将布局关联到触发器 */
#btn-deploy {
  anchor-name: --tooltip-deploy;
}

#tooltip-deploy {
  position-anchor: --tooltip-deploy;
}

.tooltip-content[popover] {
  position: absolute;
  bottom: anchor(top);
  left: anchor(center);
  transform: translateX(-50%) translateY(8px);

  opacity: 0;
  transition:
    opacity 0.2s ease,
    display 0.2s allow-discrete,
    overlay 0.2s allow-discrete;
}

.tooltip-content[popover]:popover-open {
  opacity: 1;
  transform: translateX(-50%) translateY(-12px);
}

@starting-style {
  .tooltip-content[popover]:popover-open {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
}
```

`js-hidden` 类消失了。`dismissAllTooltips()` 函数消失了。`touchstart` 处理器消失了。点击外部检测消失了。

`popover="hint"` 原生提供轻量关闭行为，浏览器处理悬停意图、焦点管理、Escape 关闭和触摸语义，无需一行 JavaScript。`@starting-style` 定义进入动画的初始状态，`allow-discrete` 处理退出动画，因此过渡的两个方向完全由 CSS 掌控。

> **浏览器兼容性说明**：Interest Invokers API（`interestfor`）目前在 Chrome 中通过 flag 可用，有 polyfill 在 `unpkg.com/interestfor`。CSS Anchor Positioning 是 Baseline 2025。智能体输出中也包含了 polyfill 加载代码。请查看 [caniuse.com/css-anchor-positioning](https://caniuse.com/css-anchor-positioning)，根据你的浏览器支持需求评估后上线。

值得注意：这里使用的两个 API 中，CSS Anchor Positioning 已在稳定版浏览器中发布，而 `interestfor` 更偏实验性。polyfill 可以覆盖它，但应把它看作平台未来的方向，而非今天不做测试就直接上线的方案。

### 之后：带退出动画的 Toast 通知

安装了 Modern Web Guidance 后，同样的 toast 提示词生成的是 `popover="manual"` 元素，而非类切换的 `<div>`。浏览器的 Top Layer 原生处理渲染和层叠上下文。

```js
// ✅ 安装 MWG 之后 —— 浏览器处理显示/隐藏，JS 仅处理自动关闭计时
const createToast = (type) => {
  const toast = document.createElement("div")
  toast.setAttribute("popover", "manual")
  toast.className = `toast toast-${type}`

  toast.innerHTML = `
    <div class="toast-icon">...</div>
    <div class="toast-content">...</div>
    <button
      popovertarget="${toastId}"
      popovertargetaction="hide"
      class="toast-close"
      aria-label="Dismiss notification"
    >&times;</button>
  `

  container.appendChild(toast)
  toast.showPopover() // 原生触发 @starting-style 进入动画

  // 自动关闭
  const autoDismissTimer = setTimeout(() => {
    if (toast.matches(":popover-open")) toast.hidePopover()
  }, 4000)

  // 退出过渡完成后从 DOM 移除
  toast.addEventListener("beforetoggle", (event) => {
    if (event.newState === "closed") {
      clearTimeout(autoDismissTimer)
      toast.addEventListener("transitionend", () => toast.remove(), { once: true })
      setTimeout(() => {
        if (toast.parentNode) toast.remove()
      }, 500) // 后备
    }
  })
}
```

```css
/* ✅ CSS 掌控进入和退出两个方向的动画 */
.toast[popover] {
  opacity: 0;
  transform: translateX(60px) scale(0.95);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    display 0.3s allow-discrete,
    overlay 0.3s allow-discrete;
}

.toast[popover]:popover-open {
  opacity: 1;
  transform: translateX(0) scale(1);
}

@starting-style {
  .toast[popover]:popover-open {
    opacity: 0;
    transform: translateX(60px) scale(0.95);
  }
}
```

手动关闭按钮现在使用 `popovertarget` 和 `popovertargetaction="hide"`——声明式 HTML 绑定，无需点击处理器。`showPopover()` 原生触发 `@starting-style` 进入动画。`hidePopover()` 通过 `allow-discrete` 触发 CSS 退出过渡。

JavaScript 现在只负责两件事：调度自动关闭的 timeout，以及在退出过渡完成后将元素从 DOM 中移除。之前需要 `transitionend` 监听器、CSS 类切换和同步时序的动画协调工作全部消失，因为浏览器本身接管了。

## Modern Web Guidance 不负责的事情

Modern Web Guidance 改变了智能体在首次尝试时写出的代码。它不能取代代码审查，实际使用中有两个摩擦点反复出现。

### 1. 前沿技术的断崖

Modern Web Guidance 默认使用最新的 Baseline 特性。`@starting-style`、`transition-behavior: allow-discrete`、CSS Anchor Positioning 和 Interest Invokers API 都是正确的，但其中一些太新了，今天用于生产需要 polyfill。智能体会在输出中包含这些 polyfill 的导入。

你仍然需要根据实际的浏览器支持需求验证所使用的特性。一个初次接触 `interestfor` 或 `position-anchor` 的初级开发者需要查找这些概念，因为 Modern Web Guidance 默认你希望得到最现代、最正确的答案，而不是最熟悉的答案。

### 2. CSS 封装性的取舍

当 Modern Web Guidance 引导智能体将内联样式或 `dangerouslySetInnerHTML` 中的 keyframe 移至全局样式表时（出于安全和 hydration 考虑），它破坏了组件级别的封装性。之后删除该组件，你的全局 CSS 文件中会留下孤儿样式。从架构角度看这个决定是正确的，但你仍然需要手动命名空间化这些类并追踪依赖关系。

37 个百分点的最佳实践遵循度提升是真实的，但更好将 Modern Web Guidance 理解为**提升默认天花板**，而非取代人类的判断力。把它想象成赋予你的智能体一种"持续阅读最新 Web 文档的开发者"的习惯。

## 结论

问题从来不是 AI 编码智能体不擅长 Web 开发。问题是它们基于过时的平台图景工作——这张图景由训练数据塑造，反映的是 2020 年代初期的 Web，而非今天浏览器已有的能力。

Modern Web Guidance 更新了这张图景。仅 tooltip 的前后对比就说明了一切：智能体从一个包含触摸处理器和点击外部检测的 `js-hidden` 状态机，变成了两个 HTML 属性和一块 CSS。JavaScript 交互层没有被重构，而是变成了**不必要的**。

你的智能体写出的代码，只能和它训练时的 Web 一样新。Modern Web Guidance 缩小了这个差距。

我在自己的项目上进行了这个实验的完整案例研究，包含原始 diff，可以在这里阅读：[ophyboamah.com/blog](https://www.ophyboamah.com/blog/i-installed-modern-web-guidance-in-my-projects-heres-what-actually-changed)。

相关资源：

- [Modern Web Guidance 官方文档](https://developer.chrome.com/docs/modern-web-guidance)
- [Modern Web Guidance 视频介绍 - Chrome for Developers](https://www.youtube.com/watch?v=bo3i0FzDUYo)
- [Modern Web Guidance 开源仓库](https://github.com/GoogleChrome/modern-web-guidance)（接受贡献）

---

> **译者注**：Modern Web Guidance 是一个很有意思的思路——它不试图微调模型、不依赖更好的提示词，而是通过一个简单的 `SKILL.md` 文件将最新的 Web 平台知识注入 AI 编码智能体的上下文。这本质上是一种 **RAG（检索增强生成）在编码智能体场景中的轻量化应用**。文章中最震撼的对比是 tooltip 组件：安装前需要 40+ 行 JavaScript 维护一个状态机，安装后变成零 JS 的声明式 HTML + CSS。这不仅仅是代码量的减少，而是让浏览器去做它本应做的事。
