---
title: deno sandbox
date: 2026-02-06 14:34:45
tags:
draft: false
description: deno sandbox
source: https://deno.com/blog/introducing-deno-sandbox
---
[[Deno]] Sandbox 为您提供轻量级 Linux 微型虚拟机（运行在 Deno 部署云中），以深度防御的安全机制运行不可信代码。您可以通过我们的 JavaScript 或 Python SDK 以编程方式创建它们，且启动时间不到一秒。您还可以通过 SSH、HTTP 与它们交互，甚至直接在沙箱中打开 VS Code 窗口。

```js
import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create();
await sandbox.sh`ls -lh /`;
```

https://deno.com/deploy/sandbox
