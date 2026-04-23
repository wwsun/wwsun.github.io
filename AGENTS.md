# AGENTS.md

本仓库是 **Weiwei Sun 的网络日志与个人知识库**，基于 **Quartz v4** 构建，通过 **Obsidian** 管理。这是一个以内容为核心的知识库，笔记之间高度互联。

## 角色与使命

作为 AI Agent，你的使命是帮助扩展和维护这个知识库，重点关注：

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

- 不在 `public/` 或 `dist/` 目录创建文件
- Markdown 可以表达的内容不使用复杂 HTML
- 不删除或覆盖已有笔记，除非明确要求
- 不擅自重命名文件（会破坏现有 Wiki-links）

## 目录结构

- **`content/`**：网志核心内容，按类别组织
  - `blog/`：原创长文与深度文章
  - `books/`：读书笔记与摘要
  - `clippings/`：经优化的网络剪报与译文
  - `financial/`: 投资理财相关的笔记
  - `notes/`：笔记、零散思考、备忘录与配置
  - `parenting/`: 儿童教育相关的笔记
  - `projects/`：开源项目/代码仓库调研笔记
  - `prompts/`: 提示词相关的笔记
  - `speech/`: 演讲稿
  - `wiki/`：常青笔记与结构化知识
  - `assets/`：媒体文件（图片等）
- **`quartz.config.ts`**：站点配置（标题、语言、插件）
- **`quartz.layout.ts`**：布局定义（页眉、页脚、侧边栏）
- **`.agents/skills/`**：AI 代理自定义技能
- **`.obsidian/`**：本地 Obsidian 配置

## 内容规范

### 1. 语言与风格

- **语言**：主要语言为**简体中文（`zh-CN`）**
- **风格**：专业、有洞察力、表达清晰，避免废话

### 2. 内容约定

- 使用 Obsidian 兼容的 Markdown 语法
- **内部链接**：始终使用 `[[链接]]` 进行内部导航，使用最短路径（如 `[[我的笔记]]`）
- **Callouts**：使用 Obsidian 风格的 callout：`> [!note]`、`> [!warning]` 等
- **Frontmatter**：每篇新笔记应包含标准 YAML frontmatter：
  ```yaml
  ---
  title: "笔记标题"
  tags:
    - 分类/标签
  description: 内容描述
  source: 可选，关联的外部链接
  ---
  ```
- 每一个事实性断言都要标明来源：`[Source: filename.md]`

### 3. 文件组织

- 使用描述性、URL 友好的文件名（如 `my-new-post.md`）
- 保持内容路径与现有笔记结构一致

### 4. 内容索引

`content/` 子目录中统一使用 `index.md` 列出所有的页面，并给每个页面写一句话简介。

## 工作流与自动化

### 技能

- **`content-metadata-curator`**：自动管理 frontmatter（标题、日期、摘要）
- **`clipping-post-optimizer`**：清理标题、对齐脚注、同步超链接（用于剪报）
- **`obsidian-markdown`**：处理 Obsidian 专属语法（wikilinks、callouts）
- **`obsidian-bases` / `json-canvas`**：管理 Obsidian 特殊视图与画布文件
- **`write-blog`**：按项目规范在 `content/blog/` 下起草并创建博客文章

### 日常维护

- 在 `content/` 子目录中添加新的文件后，需要及时更新该目录中的 `index.md`
- 在 `quartz/` 中进行重大改动后运行 `npm run format` 保持风格一致
- 运行 `npm run check` 验证链接、类型与构建完整性

### Query workflow

当回答问题时：

1. 先定位 `content/` 中的具体子目录，然后读取该子目录中的 `index.md` 找到相关页面
2. 读取所有相关 wiki 页面
3. 综合答案

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
