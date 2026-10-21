---
title: macOS 磁盘分析与清理指南
date: 2026-10-21
description: macOS 快速磁盘分析与定向瘦身实操 SOP，涵盖高频占用秒级探查、APFS 本地快照回收、Docker/Colima 及项目构建缓存清理
tags:
  - macos
  - cli
  - dev-tools
---

针对开发环境下 macOS 磁盘空间不足的分析与清理实操指南。提供秒级定位方法与分级清理命令，避免全盘低效扫描。

## 极速分析方案

常规 `du -sh` 全盘递归扫描会因为 `node_modules`、包管理器缓存和聊天软件中的海量小文件导致遍历超时。日常推荐采用以下秒级定位方式：

- **系统内置 Spotlight 元数据（0 耗时）**：
  - 打开「系统设置」->「通用」->「储存空间」。
  - 查看彩色分布条确定主要占用类型（文稿、开发者、系统数据）。
  - 点击「文稿」右侧感叹号，在「大文件」标签页下直接筛选出超过 100MB / 1GB 的孤立大文件。
- **并发工具多核扫描**：
  - 使用 `gdu` 替代传统单线程 `du`：`brew install gdu && gdu ~`。
- **高频大户点对点探测**：
  - 跳过全盘遍历，直接检查已知的核心缓存目录（Colima、下载、微信、包缓存）。

## 高优先级清理项（P0 / P1）

按收益与风险分层，优先执行见效快、无业务副作用的操作：

- **APFS 本地时间机器快照（P0）**：
  - **现象**：已删除大文件但“系统数据”依然居高不下，空间未释放。
  - **原因**：本地时间机器快照将删除块锁定在可清除空间中。
  - **操作**：执行平滑回收命令 `sudo tmutil thinlocalsnapshots / 32212254720 4`。
- **Docker / Colima 镜像与构建缓存（P0）**：
  - **现象**：虚拟机虚拟磁盘膨胀（通常在 `~/.colima` 占用 20GB+）。
  - **操作**：
    - 启动服务后清理未引用资源：`colima start && docker system prune -a --volumes -f`。
    - 若需彻底缩容磁盘镜像，直接重建实例：`colima stop && colima delete && colima start`。
- **历史项目闲置 `node_modules`（P0）**：
  - **现象**：`~/projj` 或开发目录沉淀几十个旧项目的依赖库，占用数十 GB。
  - **操作**：运行 `npx npkill -d ~/projj`，按修改时间排序，使用空格键交互式删除长期不用的依赖包。
- **Homebrew 历史缓存与旧版本（P0）**：
  - **操作**：`brew cleanup --prune=all -s && rm -rf $(brew --cache)`。
- **包管理器全局缓存（P1）**：
  - **pnpm**：`pnpm store prune`（清理未被硬链接引用的存储块）。
  - **npm**：`npm cache clean --force`。
- **Xcode 派生数据与旧模拟器（P1）**：
  - **DerivedData**：`rm -rf ~/Library/Developer/Xcode/DerivedData/*`。
  - **模拟器缓存**：`xcrun simctl erase all`。
- **下载目录与废纸篓（P1）**：
  - **下载目录**：排查 `~/Downloads` 中残留的 `.dmg`、`.pkg`、`.iso` 等大文件。
  - **废纸篓**：`rm -rf ~/.Trash/*`。

> [!TIP] 需要手动确认的大户
>
> - **微信 / 办公软件**：`~/Library/Containers/com.tencent.xinWeChat` 包含海量聊天图片与视频。切勿直接在终端 `rm -rf`，应在微信「设置 - 通用 - 存储空间」中通过官方界面按需清理。
> - **iOS 本地备份**：检查 `~/Library/Application Support/MobileSync/Backup`，若不需要整机本地镜像可直接删除旧设备目录。

## 常用一键清理速查脚本

复制以下命令可在终端一键清理主要无风险缓存：

```bash
# 1. 缩减并回收 APFS 本地快照
sudo tmutil thinlocalsnapshots / 32212254720 4

# 2. 清理 Homebrew 安装包缓存与历史版本
brew cleanup --prune=all -s
rm -rf $(brew --cache)

# 3. 清理 Docker/Colima 容器与 BuildKit 缓存
docker system prune -a --volumes -f

# 4. 清理前端包管理器全局孤立包
pnpm store prune 2>/dev/null
npm cache clean --force 2>/dev/null

# 5. 清理 Xcode 派生构建产物（若有）
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null

# 6. 清理应用运行日志
rm -rf ~/Library/Logs/* 2>/dev/null
```

## 日常空间维护建议

- **工作区依赖定期瘦身**：每个月跑一次 `npx npkill -d ~/projj`，保持代码区依赖轻量。
- **避免 BuildKit 无限制膨胀**：定期对 Docker 运行 `docker system prune -f`。
- **添加快捷别名**：可在 `~/.zshrc` 中配置别名命令，例如：
  - `alias clean-brew="brew cleanup --prune=all -s"`
  - `alias clean-docker="docker system prune -f"`
  - `alias clean-pnpm="pnpm store prune"`
