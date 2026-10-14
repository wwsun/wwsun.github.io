---
title: "eza: 现代化的 ls 替代品"
tags:
  - CLI
  - Rust
  - 工具
description: eza 是一款现代化的 ls 替代品，内置图标、Git 状态集成和树状视图，显著提升开发者的终端体验。
source: https://github.com/eza-community/eza
---

`eza` 是 `exa` 的现代分支和继任者，是一款使用 Rust 编写的 `ls` 替代品。它不仅在视觉上提供了丰富的色彩和文件图标，还深度集成了 Git 状态，并原生支持目录树状展示，是终端环境的必备效率利器。

## 安装

macOS 使用 Homebrew 安装：

```bash
brew install eza
```

为了获得最佳视觉体验，建议安装并配置 Nerd Fonts 字体（在终端偏好设置中选择）。

## 常用命令别名

为了不改变原有的肌肉记忆，建议在 `~/.zshrc` 或 `~/.bashrc` 中配置别名：

```bash
alias ls='eza --icons'
alias ll='eza --icons -lh'
alias la='eza --icons -lah'
alias lt='eza --icons --tree'
```

## 核心使用技巧

### 1. 基础列表查看

`eza` 最基本的改进是默认带有丰富的色彩，并可通过 `--icons` 开启图标：

```bash
# 列表形式展示，包含图标
eza -l --icons

# 展示所有文件（包括隐藏文件）
eza -la --icons
```

### 2. Git 状态集成

对于开发者来说，这是最实用的功能。它能在列表视图中直接显示文件的 Git 修改状态：

```bash
eza -l --git
```

**状态说明**：

- `N`: 新增 (New)
- `M`: 修改 (Modified)
- `D`: 删除 (Deleted)

### 3. 树状视图

替代传统的 `tree` 命令，`eza` 内置了强大的树状视图，同样支持颜色、图标和按层级控制：

```bash
# 以树状视图展示
eza --tree

# 限制树状视图的层级（如只展示 2 层）
eza --tree --level=2

# 树状视图结合列表视图（极其强大）
eza -l --tree --level=2
```

### 4. 高级过滤与排序

可以利用 `eza` 快速找到关注的文件：

```bash
# 仅列出目录
eza -D
# 仅列出文件
eza -f

# 按文件大小倒序排列
eza -l --sort=size --reverse

# 按修改时间排列，最新修改的在最下面
eza -l --sort=time --reverse
```

## 进阶配置与技巧

### 忽略特定目录

在查看带有 `node_modules` 或 `.git` 的前端或后端项目时，你可能想在树状视图中忽略这些庞然大物：

```bash
eza --tree -I "node_modules|.git"
```

### 与其他工具结合使用

> [!tip] 组合建议
> `eza` 专注于**列出文件**和**目录浏览**。
> 如果需要进行深度搜索，建议组合使用：
>
> - `eza`：日常目录浏览与状态查看
> - [[fd]]：按名称或属性快速搜索文件
> - [[ripgrep]]：基于正则在文件内部搜索文本内容
>
> 这三者构成了现代终端的铁三角。
