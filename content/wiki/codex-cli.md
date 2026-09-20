---
title: Codex-CLI
tags:
  - codex
  - cli
description: OpenAI Codex CLI 配置与使用指南，涵盖 yolo 模式、审批策略与沙箱安全配置。
source:
---

## yolo

```
codex --yolo
```

config.toml

```toml
approval_policy = "never"
sandbox_mode = "danger-full-access"
trusted-workspace = true # Required for persistent access in newer versions
[sandbox_workspace_write]
network_access = true

```

https://developers.openai.com/codex/agent-approvals-security#network-access-
