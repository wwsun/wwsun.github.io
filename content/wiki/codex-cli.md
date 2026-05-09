---
title: Codex-CLI
tags:
description: 未命名
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
