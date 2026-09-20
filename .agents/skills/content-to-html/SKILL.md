---
name: content-to-html
description: 将结构化的文字内容（如开发计划、版本更新、项目路线图、技术分享提纲、Change Log 等）转化为一个精美的单文件 HTML 静态页面。页面固定采用亮色主题、紧凑排版和高对比度文字，专为截屏分享和社交媒体传播进行优化。当用户说"帮我做成 HTML 页面"、"制作一个可以截图分享的页面"、"生成一个好看的版本计划页"、"把这份内容做成精美的展示页" 时触发。也适用于用户粘贴技术文档、Markdown 大纲、待办清单、Sprint 规划时说"帮我可视化一下"或"做成好看的格式"。
---

# Content to HTML — 截屏分享页生成指南

本 skill 将各类结构化文字内容（项目计划、版本路线图、技术分享提纲、Changelog 等）渲染为**单文件可截屏 HTML 页面**。页面固定采用以下设计策略：

- **亮色主题（Light Theme）**：柔和的浅灰白背景，深色高对比文字，确保在任何屏幕截图中清晰可辨
- **紧凑排版**：减少不必要留白，让单屏展示更多信息，降低接收方浏览负担
- **截屏优化**：字重、行高和间距经过调校，专为静态画面（而非滚动浏览）设计

---

## 设计系统（固定参数，不要随意更改）

使用以下 CSS 变量作为基础。这套参数经过验证适合截屏分享，请直接沿用：

```css
:root {
  --bg: #f8fafc;
  --bg-card: rgba(255, 255, 255, 0.8);
  --border: rgba(0, 0, 0, 0.07);
  --text-primary: #0f172a; /* Slate 900 - 高对比标题 */
  --text-secondary: #334155; /* Slate 700 - 正文，比 Slate 600 更深，截图更清晰 */
  --accent: #3b82f6; /* 现代蓝 - 标签/高亮 */
  --accent-alt: #8b5cf6; /* 紫色 - 次强调 */
  --accent-green: #10b981; /* 翡翠绿 - 完成状态 */
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
  --radius: 14px;
  --radius-sm: 8px;
}
```

字体使用 Google Fonts，三个层级各司其职：

```css
/* 标题 */
font-family: "Outfit", sans-serif; /* 几何感、辨识度强 */
/* 正文 */
font-family: "Plus Jakarta Sans", sans-serif; /* 可读性强 */
/* 技术术语/代码/角标 */
font-family: "JetBrains Mono", monospace; /* 区分技术内容 */
```

---

## 页面结构

所有内容都应输出为**单个 `.html` 文件**，内联所有样式和脚本，无需外部图片。

典型结构如下（根据内容自行裁减）：

```html
<header>
  <!-- Phase badge + 主标题 + 右侧进度环（可选） -->
</header>

<section class="goal-section">
  <!-- 核心目标/背景说明（一段话） -->
</section>

<div class="content-grid">
  <!-- 多个 <article class="card"> 展示分组内容 -->
</div>

<footer>
  <!-- 版本号 + 生成日期，增强截图的专业感 -->
</footer>
```

---

## 卡片与任务列表

这是最常用的内容单元：

```html
<article class="card">
  <div class="card-header">
    <span class="card-id mono">01</span>
    <h3 class="card-title">分组标题</h3>
  </div>
  <ul class="task-list">
    <li class="task-item">
      <div class="check-box"></div>
      <!-- 未完成：空方框 -->
      <div class="task-content">任务描述</div>
    </li>
    <li class="task-item done">
      <div class="check-box checked">✓</div>
      <!-- 已完成 -->
      <div class="task-content">已完成的任务</div>
    </li>
  </ul>
</article>
```

卡片左侧竖条颜色在 `--accent`（蓝）和 `--accent-alt`（紫）之间交替，通过 `.card.alternate::before` 实现。

---

## 排版规范（截屏优化关键）

这些参数直接影响截图质量，理解背后的道理有助于维持平衡：

| 元素          | 推荐值          | 原因                         |
| ------------- | --------------- | ---------------------------- |
| 容器内边距    | `2rem 1.5rem`   | 减少留白，让截图内容更充实   |
| Header 下边距 | `3rem`          | 适度分隔，但不浪费空间       |
| 卡片内边距    | `1.5rem`        | 内容可呼吸但不臃肿           |
| 卡片间距      | `1.5rem`        | 紧凑网格                     |
| 正文字号      | `0.95rem`       | 足够大可截图，但不会撑散布局 |
| 正文字重      | `500` (Medium)  | 边缘锐利，截图压缩后不发虚   |
| 正文行高      | `1.4`           | 密度和可读性的平衡点         |
| 任务项间距    | `0.75rem`       | 高密度列表                   |
| 标题字号      | `2.5rem ~ 3rem` | 单屏展示时占位合理           |

---

## 动态进度环（可选）

如果内容包含任务清单，可在 Header 右侧放置进度环，计算完成百分比：

```javascript
const total = document.querySelectorAll(".task-item").length
const done = document.querySelectorAll(".task-item.done").length
const pct = total > 0 ? Math.round((done / total) * 100) : 0
// 用 SVG stroke-dashoffset 动画更新圆环
```

**注意**：对于静态展示，进度值直接基于 HTML 中的 `.done` class 计算，不需要点击交互和 localStorage。

---

## 入场动画

使用 Intersection Observer 实现卡片的交错淡入，让截屏前的页面加载更有质感：

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add("visible"), i * 80)
    }
  })
})
document.querySelectorAll(".staggered").forEach((el) => observer.observe(el))
```

对应 CSS：

```css
.staggered {
  opacity: 0;
  transform: translateY(16px);
  transition: all 0.5s ease;
}
.staggered.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 专业页脚

截图页应包含页脚，增加可追溯性和专业感：

```html
<footer>
  <span class="mono">CONTENT TITLE / PHASE/VERSION</span>
  <span>生成于 YYYY-MM-DD</span>
</footer>
```

---

## 工作流程

接到内容后按以下步骤执行：

1. **理解内容结构**：识别顶层标题（版本/阶段号、目标），中层（功能分组），底层（具体任务项）
2. **决定网格布局**：内容 ≤ 3 组用 2 列；≥ 4 组用 `minmax(320px, 1fr)` 自适应
3. **标记状态**：带 `[x]` 的任务加 `done` class，带 `[ ]` 的不加
4. **生成文件**：输出到用户当前项目目录下，文件名格式建议 `v-[内容标识]-[版本].html`（如 `v-plan-0415.html`）
5. **告知用户**：提示用户在浏览器中打开文件，或直接用浏览器截全屏

---

## 常见内容类型参考

| 内容类型                  | 典型输入形式                      | 页面特点              |
| ------------------------- | --------------------------------- | --------------------- |
| 版本开发计划              | Markdown 任务列表，按功能模块分组 | 进度环 + 任务矩阵卡片 |
| Sprint 路线图             | 时间轴 + 里程碑                   | 横向时间轴布局        |
| Changelog / Release Notes | 版本号 + 变更列表                 | 竖向时间线            |
| 技术分享提纲              | 章节标题 + 要点                   | 大字号章节 + 要点卡片 |
| 竞品/方案对比             | 维度 × 产品矩阵                   | 横向对比表格          |

---

## 约束（始终遵守）

- 输出始终为**单个 HTML 文件**，所有样式内联，不引用本地图片
- 主题固定为**亮色**，不提供深色模式切换
- 布局优先**紧凑**：宁可信息稠密，也不要留白过多
- **无持久化**：不使用 localStorage，不需要可勾选功能
- 背景图案/纹理效果要**克制**，截图清晰优先于视觉炫技
