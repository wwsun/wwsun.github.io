# Weiwei Sun's Weblog

探索 AI Agent 与低代码的边界，专注于智能体开发、低代码应用与设计工程化的个人网络日志与双链知识库。

- 在线访问：[https://wwsun.github.io](https://wwsun.github.io)
- RSS 订阅：[https://wwsun.github.io/index.xml](https://wwsun.github.io/index.xml)

## 项目定位

本仓库是 **Weiwei Sun** 的个人技术博客。项目通过 **Obsidian** 进行本地双链笔记管理，结合 **Quartz v5** 静态站点生成器发布为支持全文检索、关系图谱、双向链接与暗色模式的在线知识库，并内置一套 **AI Agent Skills** 辅助日常写作、中英双语网页剪藏、3D 模拟交互学习与知识库治理。

## 内容架构

所有笔记与静态资源均位于 `content/` 目录下：

| 目录 / 文件          | 说明                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `content/blog/`      | 原创深度长文与体系化思考（AI Agent 架构、Claude Code 实践、工程化等） |
| `content/learning/`  | 系统化专题学习产出（结合「知识库 + 低多边形 3D 模拟动画」的交互笔记） |
| `content/clippings/` | 精选业界前沿技术文章、工程规范与中英双语对照译文                      |
| `content/notes/`     | 通用知识卡片、技术词条、工具链手册、提示词模板、读书笔记与实践备忘    |
| `content/assets/`    | 图片与静态媒体资源                                                    |
| `content/*.base`     | Obsidian Bases 数据视图配置文件                                       |
| `content/tags.json`  | 全站标签汇总索引（由 `scripts/sync-tags.ts` 自动扫描生成）            |

## 技术栈

- **静态站点引擎**：[Quartz v5](https://quartz.jzhao.xyz/)（TypeScript + Preact + Unified/Remark/Rehype）
- **内容创作与管理**：[Obsidian](https://obsidian.md/)（支持 Wikilinks、Callouts、Mermaid、KaTeX、Bases、Canvas）
- **样式与构建**：LightningCSS + Sass + esbuild
- **AI 辅助工作流**：内置 `.agents/skills/` 技能集（支持 Claude Code / Codex / OpenCode）

## 快速开始

### 环境要求

- **Node.js**：`>= 22`（推荐使用 `fnm` 管理版本）
- **npm**：`>= 10.9.2`

### 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/wwsun/wwsun.github.io.git
cd wwsun.github.io

# 2. 安装依赖（prebuild 会自动同步社区插件）
npm install

# 3. 启动本地预览服务器（默认 http://localhost:8080，支持热重载）
npm start
```

## 常用命令

```bash
# 本地构建并启动预览服务
npm start

# 同步全站 Frontmatter 标签至 content/tags.json
npm run sync-tags

# 单文件格式化（日常编辑推荐）
npx prettier --write content/path/to/file.md

# 全量代码与文档格式化
npm run format

# TypeScript 类型检查与构建完整性验证
npm run check

# 运行全量单元测试
npm test

# 同步安装 quartz.config.yaml 中声明的社区插件
npm run install-plugins

# 同步并部署站点
npx quartz sync
```

## 写作与维护约定

1. **Frontmatter 规范**：新建笔记参考 `templates/default.md`，必须包含完整的 `title`、`tags`、`description`（外部剪藏或引用需补充 `source`）：
   ```yaml
   ---
   title: "笔记标题"
   tags:
     - 分类/标签
   description: 一句话概括核心内容
   source: https://example.com/optional-source
   ---
   ```
2. **文件命名**：使用描述性、URL 友好的短横线格式（`foo-bar.md`）。
3. **内部链接**：统一使用最短路径的 `[[Wiki-link]]` 格式（如 `[[my-note|显示文本]]`）。
4. **标签同步**：新增或修改笔记 `tags` 后，执行 `npm run sync-tags` 更新标签索引。

## Agent Skills

仓库在 `.agents/skills/` 下沉淀了面向知识库创作与维护的专用技能：

- `write-blog`：原创技术博客构思、起草与润色
- `post-clipping`：网页抓取、中英双语逐段对照翻译与费曼学习复盘
- `learn-with-simulation`：「知识库构建 + 准确性验证 + 低多边形 3D 模拟动画」系统学习工作流
- `vault-manager`：Frontmatter 补全、目录索引同步、断链检查与非语义化附件重命名
- `content-to-html`：将结构化大纲或技术文档转化为适合分享的单文件 HTML 页面
- `critical-thinking-skill`：基于《学会提问》方法论的逻辑与论证审计
- `obsidian-markdown` / `obsidian-bases` / `json-canvas`：Obsidian 专属语法与视图编辑支持
