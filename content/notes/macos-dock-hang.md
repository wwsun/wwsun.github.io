---
title: macOS Dock 假死无响应处理
date: 2026-10-21
description: Dock 进程假死导致鼠标悬浮转圈、点击无响应时的强制重启方法
tags:
  - macos
  - troubleshooting
---

## 现象

鼠标悬浮到 Dock 上时光标持续转圈（spinning cursor），点击任何 Dock 图标都无响应。

## 根因

Dock 进程假死（hung），不是崩溃也不是死循环（CPU 占用为 0%），而是阻塞/等待状态。
这种情况下普通的 `killall Dock`（发送 SIGTERM）对它无效——进程依然存活，`ps aux` 里看到的
还是同一个旧 PID、旧启动时间，没有被重启。

## 解决步骤

1. 确认是否为假死状态：

```bash
ps aux | grep -i "[D]ock"
```

观察 `/System/Library/CoreServices/Dock.app/Contents/MacOS/Dock` 主进程的启动时间和 CPU
占用。如果执行过 `killall Dock` 之后，这个 PID 和启动时间完全没变化，说明 SIGTERM 被忽略了。

2. 找到 Dock 主进程及其 XPC 辅助进程的 PID（通常包括 `Dock.app/Contents/MacOS/Dock`、
   `DockHelper.xpc`、`com.apple.dock.extra.xpc`），用强制信号杀掉：

```bash
kill -9 <Dock主进程PID> <DockHelper.xpc PID> <com.apple.dock.extra.xpc PID>
```

3. launchd 会自动重新拉起 Dock 进程。再执行一次 `ps aux | grep -i "[D]ock"` 确认 PID 和
   启动时间已经是全新的，即代表恢复成功。

> [!warning] killall Dock 对假死进程无效
> `killall Dock` 发送的是 SIGTERM，进程假死时不会响应；必须用 `kill -9` 强制杀掉主进程
> 和相关 XPC 辅助进程，才能让 launchd 重新拉起。
