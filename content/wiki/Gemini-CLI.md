---
created: 2026-01-28 16:06
source: https://github.com/google-gemini/gemini-cli
tags:
  - google
  - gemini
  - npm
---
https://geminicli.com/


## Gemini Tips

https://github.com/addyosmani/gemini-cli-tips

## 配额

Google AI Pro
- 每天 1500 次
- 每分钟 120 次

每日配额通常在**太平洋时间午夜**（北京时间约 16:00）重置。

https://developers.google.com/gemini-code-assist/resources/quotas?hl=zh-cn

## Skills

https://geminicli.com/docs/cli/skills/

- user skills `~/.gemini/skills/`
- workspace skills `.gemini/skills/`

```
# List all discovered skills

gemini skills list
```

## Global GEMINI.md

`~/.gemini/GEMINI.md`

```markdown
# Global Context

## Core Directions

1. **Language**: Always respond in Simplified Chinese.
2. **Planning**: Describe your plan and wait for approval before writing any code.
3. **Clarification**: If requirements are unclear, ask clarifying questions before writing code.
```

## MCP

`~/.gemini/settings.json`

```json
"mcpServers": {
  "myserver": {
    "command": "python3",
    "args": ["-m", "my_mcp_server", "--port", "8080"],
    "cwd": "./mcp_tools/python",
    "timeout": 15000
  }
}
```

## Memory

**使用 `/memory`：**

* `/memory add "<文本>"` - 向记忆添加事实或注释（持久化上下文）。这会立即用新条目更新 `GEMINI.md`。
* `/memory show` - 显示记忆的完整内容（即当前加载的组合上下文文件）。
* `/memory refresh` - 从磁盘重新加载上下文（如果您在 Gemini CLI 之外手动编辑了 `GEMINI.md` 文件，或者多人正在协作，这很有用）。

因为记忆存储在 Markdown 中，您也可以手动编辑 `GEMINI.md` 文件来整理或组织信息。`/memory` 命令只是为了在对话期间方便使用，所以您不必离开 CLI。

**专业技巧：** 此功能非常适合"决策日志"。如果您在聊天期间决定了一种方法或规则（例如，要使用的某个库，或商定的代码风格），请将其添加到记忆中。AI 将在未来的会话中遵循它。
