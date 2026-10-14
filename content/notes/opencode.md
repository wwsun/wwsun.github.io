---
title: OpenCode
created: 2026-01-12 19:46
source: https://github.com/anomalyco/opencode
tags:
  - agent
  - ai-coding
description: "Plan mode 用于分析代码结构与规划设计，Build mode 用于让 AI 写新功能、修 Bug 和重构代码。"
---

## 切换 thinking effort

使用快捷键 `Ctrl + T` 可以在不同的思考等级（如 Low、Medium、High）之间快速循环切换。

## Config

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "*": "allow",
    "bash": {
      "rm *": "ask",
      "rm -rf *": "deny",
      "git push --force*": "deny",
      "git reset --hard*": "ask",
      "git clean *": "ask",
      "chmod *": "ask",
      "sudo *": "deny",
      "*": "allow"
    },
    "external_directory": "allow"
  },
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

## 自定义 command

https://opencode.ai/docs/commands/

Create `.opencode/commands/test.md`:

```md
---
description: Run tests with coverage
agent: build
model: anthropic/claude-3-5-sonnet-20241022
---

Run the full test suite with coverage report and show any failures.
Focus on the failing tests and suggest fixes.
```

## Plan vs Build

Plan mode:

- 分析代码结构，但**不要改动**
- 让 AI 做规划和设计
- 代码审查
- 理解陌生代码库

Build mode:

- 让 AI 写新功能
- 让 AI 修 Bug
- 让 AI 重构代码
- 让 AI 创建/修改文件

![[open-code-plan-vs-build.png]]

https://learnopencode.com/3-workflow/01-plan-build.html
