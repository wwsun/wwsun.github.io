# Claude Code 项目配置

## Skills

本项目在 `.agents/skills/` 目录下提供了以下自定义 skills，使用时通过 Skill 工具调用：

- **json-canvas** (`.agents/skills/json-canvas/SKILL.md`)：创建和编辑 JSON Canvas 文件（`.canvas`），用于 Obsidian 画布、思维导图和流程图。
- **obsidian-bases** (`.agents/skills/obsidian-bases/SKILL.md`)：创建和编辑 Obsidian Bases（`.base` 文件），包含视图、过滤器、公式和汇总配置。
- **obsidian-markdown** (`.agents/skills/obsidian-markdown/SKILL.md`)：创建和编辑 Obsidian Flavored Markdown，包含 wikilinks、callouts、embeds、frontmatter 等 Obsidian 特有语法。
- **clipping-post-optimizer** (`.agents/skills/clipping-post-optimizer/SKILL.md`)：优化 `content/clippings/` 目录下的译文文件，清理标题冗余英文，对齐脚注格式，同步超链接。

## 使用规则

- 处理 `.canvas` 文件时，优先使用 `json-canvas` skill
- 处理 `.base` 文件时，优先使用 `obsidian-bases` skill
- 处理 Obsidian Markdown 文件时，优先使用 `obsidian-markdown` skill
- 优化 `content/clippings/` 下的译文时，优先使用 `clipping-post-optimizer` skill
