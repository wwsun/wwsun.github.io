# Gemini CLI Project Context: Weiwei Sun's Weblog

> [!important]
> 核心存储库指南、项目结构、内容标准和创作规范，请**优先参考 [[AGENTS.md]]**。

## Gemini CLI Specifics

### Skill Activation

本项目在 `.agents/skills/` 中提供了多个自定义 Skill。在执行相关任务前，请优先使用 `activate_skill` 加载其指令：

- **`content-metadata-curator`**: 自动化管理 Markdown 的 Frontmatter 元数据。
- **`clipping-post-optimizer`**: 优化 `content/clippings/` 中的译文剪报。
- **`obsidian-markdown`**: 处理 Obsidian 特有的 Markdown 语法（wikilinks, callouts）。
- **`obsidian-bases`**: 管理 `.base` 文件（Obsidian 视图配置）。
- **`json-canvas`**: 管理 `.canvas` 文件（Obsidian 视觉画布）。

### Workflow Guidelines (Implementation)

- **Research**: 使用 `grep_search` 确保笔记不重复，并寻找相关内容进行交叉链接。
- **Action**:
  - 对于内容更新，优先使用 `replace` 进行精准编辑。
  - 对于新笔记，使用 `write_file`。
- **Validation**: 遵循 `AGENTS.md` 中的维护标准，在完成更改后运行相关的验证命令。

### Tool Preferences

- **`save_memory`**: 仅用于存储全局用户偏好，**禁止**存储项目特定的事实。
- **`ask_user`**: 仅在存在严重歧义或需要高层决策时使用。
- **`run_shell_command`**: 在执行修改文件系统的敏感命令（如 `git` 提交）前，请务必简要说明。
