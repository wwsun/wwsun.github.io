---
title: Claude Code Router
created: 2025-12-18 09:31
source: https://github.com/musistudio/claude-code-router
tags:
  - claude-code
  - cli
description: Claude Code 的第三方路由代理工具，支持将 API 请求转发至多个 LLM 提供商，实现模型切换与成本优化。
---

## install

```bash
npm install -g @anthropic-ai/claude-code

npm install -g @musistudio/claude-code-router
```

## Commands

```bash
# Start Claude Code using the router:
ccr code

# Restart Claude Code
ccr restart

# UI Mode
ccr ui
```

## Config

`~/.claude-code-router/config.json`

## Unable to connect to Anthropic services

在 `~/.claude.json` 中加入

```json
{
  "hasCompletedOnboarding": true
}
```
