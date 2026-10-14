---
title: "Design System 设计系统"
tags:
  - wiki
  - design
  - quartz
description: "wwsun.github.io 站点设计系统规范与组件展厅，包含设计原则、Design Tokens、排版标尺及 UI 组件全景展示。"
source: "https://github.com/wwsun/wwsun.github.io"
---

本文档是本知识库与数字花园（Digital Garden）的官方设计系统（Design System）规范。它既是一份指导内容创作与前端样式演进的工程参考，也是一个可在本站直接预览的活体组件展厅（Living Styleguide）。

---

## 1. 设计原则

本站的设计哲学围绕**“以阅读者与内容为核心”**构建：

1. **内容优先（Content-First）**：排版与布局为长文沉浸阅读服务，剔除任何喧宾夺主的装饰性元素。
2. **中英双语可读性（Bilingual Ergonomics）**：针对中文特有的方块字符密度与拉丁字母的混合排版进行专项微调，消除负字距对中文字形的挤压，采用 1.8 黄金舒适行高。
3. **高对比度与无障碍（WCAG AA）**：所有交互链接与正文配色严格满足 WCAG AA（对比度大于 4.5:1）标准，并在夜间模式下提供柔和舒适的深灰背景，减轻视觉疲劳。
4. **Token 驱动的一致性（Token-Driven）**：所有色彩、间距、字号与圆角均由标准化 CSS 变量（`--ds-*`）统一分发，保证全站体验连贯。

---

## 2. Design Tokens 速查

### 色彩语义代币（Color Tokens）

| 代币名称                    | 浅色模式（Light）           | 深色模式（Dark）            | 语义与应用场景                 |
| :-------------------------- | :-------------------------- | :-------------------------- | :----------------------------- |
| `--ds-color-bg-canvas`      | `#ffffff`                   | `#0d1117`                   | 页面最底层画布背景             |
| `--ds-color-bg-surface`     | `#ffffff`                   | `#161b22`                   | 卡片、容器与弹层表面背景       |
| `--ds-color-bg-muted`       | `#f6f8fa`                   | `#161b22`                   | 次级灰色区块背景               |
| `--ds-color-bg-hover`       | `rgba(208, 215, 222, 0.32)` | `rgba(110, 118, 129, 0.16)` | 悬停互动底色                   |
| `--ds-color-text-primary`   | `#1f2328`                   | `#f0f6fc`                   | 主要正文与标题                 |
| `--ds-color-text-secondary` | `#57606a`                   | `#9198a1`                   | 辅助文本、文章描述与简介       |
| `--ds-color-text-muted`     | `#6e7781`                   | `#768390`                   | 日期、元数据与弱提示           |
| `--ds-color-text-link`      | `#0969da`                   | `#6ab0ff`                   | 页面交互链接（WCAG 5:1 / 7:1） |
| `--ds-color-border-default` | `#d0d7de`                   | `#30363d`                   | 标准容器边框与分割线           |
| `--ds-color-border-hover`   | `#0969da`                   | `#6ab0ff`                   | 交互元素激活/聚焦边框          |

### 排版与字阶标尺（Typography Scale）

| 标尺代币         | 计算值 (rem / px) | 对应元素 / 语义角色              | 行高设定                       |
| :--------------- | :---------------- | :------------------------------- | :----------------------------- |
| `--ds-text-xs`   | `0.75rem` (12px)  | 标签徽章、元信息辅助说明         | `1.2`                          |
| `--ds-text-sm`   | `0.875rem` (14px) | 列表发布日期、内联代码、表格内容 | `1.4`                          |
| `--ds-text-base` | `1.00rem` (16px)  | 文章正文基准字号                 | `1.8` (`--ds-leading-relaxed`) |
| `--ds-text-lg`   | `1.125rem` (18px) | 首页 Hero 导语、小节导读         | `1.6`                          |
| `--ds-text-xl`   | `1.25rem` (20px)  | 四级标题 H4                      | `1.35`                         |
| `--ds-text-2xl`  | `1.50rem` (24px)  | 三级标题 H3                      | `1.3`                          |
| `--ds-text-3xl`  | `1.875rem` (30px) | 二级标题 H2                      | `1.25`                         |
| `--ds-text-4xl`  | `2.25rem` (36px)  | 一级标题 H1 / 页面主标题         | `1.2`                          |

### 空间与形状标尺（Spacing & Radii）

- **间距网格**：4px / 8px 基础网格系统
  - `--ds-space-1`: 4px（紧密微距）
  - `--ds-space-2`: 8px（条目间隙、标签间距）
  - `--ds-space-3`: 12px（小内边距）
  - `--ds-space-4`: 16px（标准外边距、容器内衬）
  - `--ds-space-6`: 24px（段落组区块间距）
  - `--ds-space-8`: 32px（章节间距）
- **圆角规范**：
  - `--ds-radius-sm`: 4px（内联代码、小标签）
  - `--ds-radius-md`: 6px（按钮、输入框、引用块侧边）
  - `--ds-radius-lg`: 8px（内容卡片、弹层）
  - `--ds-radius-full`: 9999px（药丸标签胶囊）
- **列宽黄金标尺**：`--ds-reading-max-width: 44rem`。在宽屏视口下限制单行中文文本在 35~45 字符区间，极大提升沉浸阅读体验并降低扫读疲劳。

---

## 3. 基础排版展示

### 标题层次与正文

# 一级标题 Heading 1

## 二级标题 Heading 2

### 三级标题 Heading 3

#### 四级标题 Heading 4

##### 五级标题 Heading 5

###### 六级标题 Heading 6

这是一段标准文章正文段落。我们采用了系统默认优先的 CJK 字体栈，中文由 `PingFang SC`、`Microsoft YaHei` 和 `Noto Sans CJK SC` 兜底，拉丁文字优先使用 `Inter` 和 `system-ui`。在正文长文阅读时，行高固定为 `1.8`，让多行中文之间留有充分的呼吸空间。

这是同一段落内的**加粗文字（Bold）**、_斜体文字（Italic）_、~~删除线（Strikethrough）~~ 以及带有高对比度下划线的 [外部链接示例](https://github.com) 和 [[Wiki]] 内部双向链接。

### 引用块（Blockquote）

> 这是一段基础块级引用。引用块左侧配有主题色强调边框，背景使用轻量半透明衬底，右侧边缘微弧，适合用于摘抄观点、名人名言与延伸注解。
>
> 引用块支持多段落，段落间保持和谐的垂直韵律。

---

## 4. Obsidian Callout 变体展厅

本站原生集成 Obsidian 风格的 Callout 提示框，支持根据类型自动渲染语义色彩：

> [!note] 笔记（Note）
> 用于一般的补充背景信息、实现细节或说明说明。

> [!tip] 技巧与提示（Tip）
> 用于给出最佳实践、排版技巧、效率建议或使用诀窍。

> [!info] 信息提示（Info）
> 用于中性展示重要的背景知识、系统状态或参考信息。

> [!important] 重要事项（Important）
> 强调核心需求、关键步骤或不可遗漏的重要约定。

> [!warning] 警告（Warning）
> 提醒潜在问题、不兼容改动、版本过时或需要谨慎操作的事项。

> [!danger] 危险（Danger / Caution）
> 用于高风险操作、可能导致数据丢失或严重错误的安全警告。

> [!example] 示范案例（Example）
> 包含具体的演示步骤、示例代码或模式参考。

> [!quote] 引用摘要（Quote）
> 引用自外部书籍、文献或作者原文的正式引用。

---

## 5. 数据表格与代码块

### 格式化表格

| 特性维度     | 旧版结构                   | Design System 现代化架构                           |
| :----------- | :------------------------- | :------------------------------------------------- |
| **组织模式** | 4100+ 行单体 `custom.scss` | 模块化解耦（`tokens`, `typography`, `components`） |
| **配色管理** | 硬编码十六进制值散落       | 统一语义代币与双模式映射                           |
| **中文适配** | 依赖浏览器无序兜底         | 显式 CJK 字体栈 + 44rem 列宽限制                   |
| **可维护性** | 牵一发而动全身             | 职责分明，按模块独立演进                           |

### 内联代码与语法高亮

正文中可以无缝使用内联代码，例如 `const tokens = useDesignTokens()` 或 `quartz.config.yaml`。对于多行代码块，系统配备等宽字体栈与语义语法高亮：

```typescript
// 示例：Design Tokens 接口定义
interface DesignTokens {
  colors: {
    bgCanvas: string
    textPrimary: string
    textLink: string
    accent: string
  }
  typography: {
    sansFont: string
    monoFont: string
    lineHeightBody: number
    maxWidthContent: string
  }
}

export function getSystemTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("saved-theme") === "dark" ? "dark" : "light"
}
```

---

## 6. 内容创作与维护指南

为维护本站视觉的一致性，在新建或编辑笔记时请遵循以下规范：

1. **元数据规范**：所有新建笔记必须包含合法的 YAML Frontmatter，填写 `title`、`tags` 与 `description`。
2. **内链格式**：跨文档引用统一使用最短路径格式的双向链接，例如 `[[Index]]` 或 `[[Wiki]]`。
3. **样式扩展**：如需新增或微调全站样式，请编辑 `quartz/styles/design-system/` 下的对应分模块，切勿在页面内滥用内联样式或大段 HTML 标签。
