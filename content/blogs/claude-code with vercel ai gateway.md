---
title: Claude Code with Vercel AI Gateway
tags:
  - vercel
  - claude-code
draft: false
description: AI Gateway 提供了与 Anthropic 兼容的 API 端点，以便您可以通过统一网关使用 Claude Code。
source: https://vercel.com/docs/agent-resources/coding-agents/claude-code
---
add to `~/.zshrc`

```
export ANTHROPIC_BASE_URL="https://ai-gateway.vercel.sh"
export ANTHROPIC_AUTH_TOKEN="your-ai-gateway-api-key"
export ANTHROPIC_API_KEY=""
```

model list
https://vercel.com/wwsuns-projects/~/ai-gateway/models?providers=anthropic&capabilities=text
