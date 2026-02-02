---
created: 2026-01-05 13:55
url: https://docs.bigmodel.cn/cn/coding-plan/overview
tags:
---
## Claude Code

```
# 编辑或新增 Claude Code 配置文件 `~/.claude/settings.json`
# 新增或修改里面的 env 字段
# 注意替换里面的 `your_zhipu_api_key` 为您上一步获取到的 API Key
{
    "env": {
        "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "API_TIMEOUT_MS": "3000000",
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
    }
}
```

https://docs.bigmodel.cn/cn/coding-plan/tool/claude

