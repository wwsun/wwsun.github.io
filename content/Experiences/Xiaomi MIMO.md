---
created: 2026-01-05 13:51
url: https://platform.xiaomimimo.com/#/docs/integration/claude-code
tags:
---
## API

- OpenAI API 兼容 `https://api.xiaomimimo.com/v1/chat/completions`
- Anthropic API 兼容 `https://api.xiaomimimo.com/anthropic/v1/messages`

## Claude Code 配置

1. 在`~/.claude.json` 中，加入设置 `"hasCompletedOnboarding": true`，以跳过登录步骤。    
2. 编辑或创建 Claude Code 的配置文件，路径为 `~/.claude/settings.json`，在该文件中添加或更新 `env` 字段，需要将 `$MIMO_API_KEY` 替换为从 [控制台-API Keys](https://platform.xiaomimimo.com/#/console/api-keys) 获取的 API Key。

```
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.xiaomimimo.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "$MIMO_API_KEY",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "mimo-v2-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "mimo-v2-flash",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "mimo-v2-flash"
  }
}

```