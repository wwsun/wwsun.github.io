---
title: 查找并清理进程占用
tags:
draft: false
description: 未命名
source:
---

查找占用 3000 端口的进程 PID

```bash
lsof -ti:3000

# OUT: 99740
```

查看进程详情

```bash
ps -p 99740 -o pid,ppid,command
```

杀进程

```bash
# -9 - 信号编号，代表 SIGKILL 信号，强制终止
kill -9 99740
```
