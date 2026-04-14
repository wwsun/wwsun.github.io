# AI 代理操作指南

本仓库是 **Weiwei Sun 的网络日志**，基于 **Quartz v4** 构建，通过 **Obsidian** 管理。这是一个以内容为核心的知识库，笔记之间高度互联。

## 角色与使命

作为 AI 代理（Gemini CLI、Claude Code 等），你的使命是帮助扩展和维护这个网志，重点关注：

- 创建高质量、结构清晰的 Markdown 内容
- 通过 Wiki-links 确保笔记之间的强连接性
- 维护网志的美观性与技术完整性

## 该做 / 不该做

### 该做

- 内容文件使用标准 YAML frontmatter（title、date、tags）
- 内部链接始终使用 `[[Wiki-link]]` 格式
- 使用 Obsidian callout 语法：`> [!note]`、`> [!warning]` 等
- 文件名使用 URL 友好的短横线格式（如 `my-new-post.md`）
- 新建内容前，检查 `content/` 目录下是否有相关笔记可以链接

### 不该做

- 不修改 `quartz/` 引擎或核心逻辑（除非明确指示）
- 不在 `public/` 或 `dist/` 目录创建文件
- Markdown 可以表达的内容不使用复杂 HTML
- 不删除或覆盖已有笔记，除非明确要求
- 不擅自重命名文件（会破坏现有 Wiki-links）

## 目录结构

- **`content/`**：网志核心内容，按类别组织
  - `blog/`：原创长文与深度文章
  - `notes/`：永久笔记、零散思考、备忘录与配置
  - `wiki/`：常青笔记与结构化知识
  - `clippings/`：经优化的网络剪报与译文
  - `books/`：读书笔记与摘要
  - `projects/`：项目专项研究
  - `assets/`：媒体文件（图片等）
- **`quartz.config.ts`**：站点配置（标题、语言、插件）
- **`quartz.layout.ts`**：布局定义（页眉、页脚、侧边栏）
- **`.agents/skills/`**：AI 代理自定义技能
- **`.obsidian/`**：本地 Obsidian 配置

## 内容规范

### 1. 语言与风格

- **语言**：主要语言为**简体中文（`zh-CN`）**
- **风格**：专业、有洞察力、表达清晰，避免废话

### 2. Markdown 语法（Obsidian）

- **内部链接**：始终使用 `[[链接]]` 进行内部导航，使用最短路径（如 `[[我的笔记]]`）
- **Callouts**：使用 Obsidian 风格的 callout：`> [!note]`、`> [!warning]` 等
- **Frontmatter**：每篇新笔记应包含标准 YAML frontmatter：
  ```yaml
  ---
  title: "笔记标题"
  date: 2026-03-13
  tags:
    - 分类/标签
  ---
  ```

### 3. 文件组织

- 使用描述性、URL 友好的文件名（如 `my-new-post.md`）
- 保持内容路径与现有笔记结构一致

## 工作流与自动化

### 优化技能

- **`content-metadata-curator`**：自动管理 frontmatter（标题、日期、摘要）
- **`clipping-post-optimizer`**：清理标题、对齐脚注、同步超链接（用于剪报）
- **`obsidian-markdown`**：处理 Obsidian 专属语法（wikilinks、callouts）
- **`obsidian-bases` / `json-canvas`**：管理 Obsidian 特殊视图与画布文件
- **`write-blog`**：按项目规范在 `content/blog/` 下起草并创建博客文章

### 日常维护

- 在 `quartz/` 中进行重大改动后运行 `npm run format` 保持风格一致
- 运行 `npm run check` 验证链接、类型与构建完整性

## 禁止事项

- **禁止**修改 `quartz/` 引擎或核心逻辑（除非明确指示）
- **禁止**在 `public/` 或 `dist/` 目录创建文件
- **禁止**在 Markdown 可以表达的情况下使用复杂 HTML
- **禁止**在未明确授权的情况下重命名或删除已有内容文件

## 开发命令

```bash
# 单文件格式化（推荐，比全量快）
npx prettier --write content/path/to/file.md

# 类型检查（不触发构建）
tsc --noEmit

# 链接与构建完整性验证
npm run check

# 本地预览（支持热重载）
npx quartz build --serve

# 同步并部署（谨慎使用）
npx quartz sync

# 全量格式化（仅在大批量改动后）
npm run format
```

> 注意：优先使用单文件操作。`npx quartz sync` 会触发部署，执行前需确认。

## 安全 / 权限

**无需提示，可直接执行：**

- 读取文件、列出目录
- 单文件 prettier 格式化
- `tsc --noEmit` 类型检查
- `npm run check` 验证

**执行前需征得确认：**

- `npx quartz sync`（触发部署）
- 修改 `quartz/` 核心逻辑
- 删除或重命名已有内容文件
- 批量覆盖多个文件

## PR 检查清单

- 提交信息格式：`type: 描述`
  - 常用类型：`docs`（新增内容）、`fix`（修正错误）、`feat`（新特性）、`refactor`
- 内容变更后运行 `npm run check` 确认无断链
- 改动聚焦，每次 PR 只做一件事
- 不提交 `.env` 或本地配置文件
