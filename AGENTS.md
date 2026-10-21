# AGENTS.md

本仓库是 **Weiwei Sun 的网络日志**，基于 **Quartz v5** 构建，通过 **Obsidian** 管理。

## 该做

- 使用简体中文（`zh-CN`）撰写内容，保持表达紧凑、客观、清晰
- 新建或更新笔记时参考 `templates/default.md`，确保包含完整的 YAML frontmatter（`title`、`tags`、`description`，可选 `source`）
- 内部链接统一使用最短路径的 `[[Wiki-link]]` 格式（如 `[[我的笔记]]`），新建内容前先检索 `content/` 下可关联的已有笔记
- 使用 Obsidian 风格 Callout（如 `> [!note]`、`> [!warning]`）
- 文件名使用描述性、URL 友好的短横线格式（如 `my-new-post.md`）
- 笔记 `tags` 使用小写英文短横线格式（如 `ai-agent`），新增或修改后运行 `npm run sync-tags` 更新 `content/tags.json`
- 修改 `quartz/` 代码后运行单文件格式化与 `npm run check` 验证类型和构建完整性

## 不该做

- 禁止在未明确授权时修改 `quartz/` 核心逻辑
- 禁止在 `public/` 或 `dist/` 目录创建或修改文件
- 禁止在未明确授权时重命名或删除已有内容文件（避免破坏现有 `[[Wiki-link]]`）
- 禁止在 Markdown 可表达的场景下使用复杂 HTML
- 禁止在标题或正文中使用 emoji（除非明确要求）

## 关键入口与内容约定

- **站点与插件配置**：`quartz.config.yaml` 声明 Quartz v5 站点信息、插件管道与页面布局
- **笔记模板**：`templates/default.md` 定义标准 Frontmatter 结构：
  ```yaml
  ---
  title: "笔记标题"
  tags:
    - tag-name
  description: 内容描述
  source: 可选，关联的外部链接
  ---
  ```
- **内容目录（`content/`）**：
  - `blog/`：原创长文与深度文章
  - `clippings/`：经优化的网络剪报与译文
  - `learning/`：体系化专题学习与模拟实验笔记
  - `notes/`：通用知识库（技术词条、工具手册）、实践笔记、提示词模板、读书笔记与配置备忘（文件名统一使用 `foo-bar.md` 格式）
  - `assets/`：图片等静态媒体资源
  - `*.base`：Obsidian Bases 数据视图配置文件
  - `tags.json`：全站标签汇总索引，由 `scripts/sync-tags.ts` 自动生成
- **目录索引（`index.md`）**：`content/` 各子目录通过 `index.md` 提供目录定位与导读说明；文章列表由 Quartz 根据元数据动态渲染，无需在 `index.md` 中手动维护全量链接
- **知识库问答流程**：回答基于知识库的问题时，先定位 `content/` 对应子目录并阅读其 `index.md`，再读取相关笔记页面后综合做答
- **项目内置技能（`.agents/skills/`）**：涵盖知识库维护（`vault-manager`）、资料精读与学习入库（`read-and-learn`）、博客写作（`write-blog`）、专题模拟学习（`learn-with-simulation`）、Obsidian 语法/视图（`obsidian-markdown`、`obsidian-bases`、`json-canvas`）等专用工作流

### Tag 规范

- 一律使用小写英文单词，多个单词用短横线连接（如 `ai-agent`、`prompt-engineering`）
- 禁止中文、空格、大小写混写与 `/` 层级写法（如 `配置/macOS`、`AI/Agent` 均不合规）
- 层级语义拆分为独立 tag（如 `css/tailwindcss` → `css` + `tailwindcss`）
- 优先复用 `content/tags.json` 中已有的 tag，避免同义或大小写重复

## 命令

```bash
# 单文件格式化（推荐，比全量快）
npx prettier --write content/path/to/file.md

# 单文件测试
npx tsx --test quartz/path/to/file.test.ts

# 类型检查与构建完整性验证
npm run check

# 同步全站标签至 content/tags.json
npm run sync-tags

# 全量单元测试
npm test

# 本地预览（支持热重载）
npm start

# 同步安装配置中的社区插件
npm run install-plugins

# 全量格式化（仅在大批量改动后）
npm run format

# 同步并部署（触发线上部署，谨慎使用）
npx quartz sync
```

注意：日常改动优先执行单文件格式化与验证命令。

## 工具链与提交规范

- **Node.js**：要求 Node.js `>= 22`（`npm >= 10.9.2`），使用 `fnm` 管理版本
- **Git 提交**：遵循 Conventional Commits 规范（如 `feat:`, `fix:`, `docs:`, `chore:`）

## 安全与权限

**无需提示，可直接执行：**

- 读取文件、列出目录
- 单文件 `prettier` 格式化
- `npm run sync-tags`
- `tsc --noEmit` / `npm run check` 验证
- 单文件或全量单元测试（`npm test`）

**执行前需征得确认：**

- `npx quartz sync`（触发部署）
- 修改 `quartz/` 核心逻辑
- 删除或重命名已有内容文件
- 安装依赖或批量覆盖多个文件
