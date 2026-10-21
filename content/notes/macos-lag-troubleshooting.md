---
title: macOS 系统卡顿与高负载排查（CursorUIViewService 与 Spotlight）
date: 2026-10-21
description: CursorUIViewService 死循环跑满单核与 Spotlight 高频扫描代码仓库导致 macOS 打字掉帧、高负载风扇狂转的诊断与根治方案
tags:
  - macos
  - performance
  - troubleshooting
---

## 现象

- 打字、切换输入法、切换窗口时明显掉帧卡顿
- 开机或日常开发时风扇狂转，系统 Load Average 居高不下
- 32GB 内存无 Swap 压力，且 CPU 无过热降频

## 根因

1. **`CursorUIViewService` 死循环 Bug**：
   `/System/Library/PrivateFrameworks/TextInputUIMacHelper.framework/Versions/A/XPCServices/CursorUIViewService.xpc` 负责渲染 macOS 新版输入法/大小写锁定光标浮标，存在已知死循环 Bug，持续跑满单核（约 98.8% CPU）并泄漏内存至 530MB+，联动 `WindowServer` 占用升高，直接拖慢所有编辑器光标响应与键盘输入。
2. **Spotlight 聚光灯与安全软件联动高频扫描**：
   Spotlight（`mds`、`mds_stores` 及 20+ 个 `mdworker_shared` 进程）在开机或文件变动时高频扫描代码仓库目录（如 `~/projj` 下的海量 `node_modules` 与构建产物），导致磁盘随机读写 IOPS 高达 2600~3000 tps，同时触发公司安全软件（千丈 `Qzhddr`）实时文件拦截钩子，使内核态 CPU（`sys`）高达 20%+。

## 快速诊断命令

1. 检查平均负载与 CPU/内存前排进程：

```bash
uptime
ps -Ao pid,pcpu,pmem,rss,comm -r | head -n 16
```

2. 检查内存压力与 Swap：

```bash
memory_pressure | head -n 25
sysctl vm.swapusage
```

3. 检查 CPU 过热降频：

```bash
pmset -g therm
```

4. 检查磁盘 IOPS 与高 Pageins 进程：

```bash
iostat -d -c 2 -w 1
top -l 2 -n 15 -o pageins -stats pid,command,cpu,pageins,faults,state
```

## 解决步骤

### 1. 解决 `CursorUIViewService` 死循环

- **立即恢复**（强制杀掉进程，由系统自动拉起）：

```bash
killall -9 CursorUIViewService
```

- **根治方案**（关闭 macOS 新版输入法光标浮标）：

```bash
sudo mkdir -p /Library/Preferences/FeatureFlags/Domain
sudo defaults write /Library/Preferences/FeatureFlags/Domain/UIKit.plist redesigned_text_cursor -dict-add Enabled -bool NO
```

> [!warning] 生效条件
> 修改 `UIKit.plist` FeatureFlag 后，需**注销当前用户或重启系统**才会彻底生效。

### 2. 解决 Spotlight 与安全软件高频扫描

打开 macOS「系统设置 → 聚焦 (Spotlight) → 聚焦隐私」，将代码仓库与各类包管理缓存目录加入排除列表：

- 代码仓库根目录：`~/projj`
- 包管理与构建缓存目录：
  - `~/.local/share/fnm`
  - `~/.npm`
  - `~/.pnpm-store`
  - `~/.m2`
  - `~/.gradle`

> [!tip] 为什么排除 Spotlight 能降低安全软件占用
> 排除海量小文件目录后，`mdworker_shared` 不再高频打开成千上万个文件，从而避免了频繁触发千丈（`Qzhddr`）的内核态文件监控钩子，磁盘 IOPS 与 `sys` CPU 占用会同步回落。
