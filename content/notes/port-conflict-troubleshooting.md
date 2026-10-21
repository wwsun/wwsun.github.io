---
title: 本地开发端口冲突排查与解决
date: 2026-10-21
description: 本地开发服务端口被占用（如 3000、7001、8080）时的查询与进程查杀排障方案
tags:
  - cli
  - dev-tools
  - troubleshooting
---

在本地启动开发服务时，经常会遇到端口已被占用的错误（例如 `listen EADDRINUSE: address already in use :::7001`）。可以通过以下几种方式排查与解决：

## 1. 查找并终止占用端口的进程（推荐）

通过 `lsof` 查找占用特定端口的进程 PID：

```bash
# 查找占用 7001 端口的进程（替换为您实际冲突的端口号）
lsof -i :7001
```

输出通常包含 `COMMAND`, `PID`, `USER`, `NODE` 等信息。确认无误后通过信号强制终止该进程：

```bash
# 终止该进程（替换 <PID> 为实际进程ID）
kill -9 <PID>
```

## 2. 检查后台失控的开发服务器

最常见的情况是之前启动的 Node / Vite / Next.js 开发服务器在后台失联或终端异常退出后未正确清理：

```bash
# 检查所有处于运行状态的 node 进程
ps aux | grep -i node

# 或检查 npm/pnpm 相关进程
ps aux | grep -i npm
```

找到僵尸或失控的 node 进程后直接通过 `kill -9 <PID>` 终止即可。
