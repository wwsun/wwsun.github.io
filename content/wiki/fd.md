---
title: fd 快速上手指南
created: 2025-12-15 21:15
source: https://github.com/sharkdp/fd
tags:
  - linux
  - find
description: 在 macOS 或 Linux 下，fd 是一个非常高效且现代化的文件查找工具，可以快速查找特定名字的文件或目录。
---

`fd` 是一款现代、快速的 `find` 替代品，语法简单，默认高亮输出，且**自动忽略隐藏文件和 `.gitignore` 中列出的文件**。

## 常用场景速查

### 1. 基础查找

- `fd report`：查找名称包含 "report" 的**文件或目录**
- `fd -t d report`: 查找名称包含 "report" 的**目录**
- `fd -t f report`: 查找名称包含 "report" 的**文件**
- `fd -g "README.md"`：精确匹配完整文件名
- `fd src /path/to/search`：在指定目录下查找

### 2. 按条件过滤

- `fd -t f` / `fd -t d`：仅查找**文件(file)** / **目录(directory)**
- `fd -e pdf`：查找所有 **PDF** 文件（按扩展名筛选，无需写通配符）
- `fd -e xlsx budget`：查找名称包含 "budget" 的 Excel 文件
- `fd report -d 1`：限制搜索层级深度（仅在当前层级查找，不进入子目录）

### 3. 显示隐藏与忽略文件

- `fd -H config`：搜索结果**包含隐藏文件**（如 `.config`）
- `fd -I node_modules`：搜索结果**包含被 `.gitignore` 忽略的文件**
- `fd -HI secret`：关闭所有过滤（包含隐藏与被忽略的文件）

### 4. 批量操作 (`-x`)

使用 `-x` (或 `--exec`) 可以对找到的每个文件执行命令，其中 `{}` 为文件路径占位符：

- `fd -e tmp -x rm {}`：批量删除所有的 `.tmp` 文件
- `fd -e jpg -x mv {} /path/to/backup/`：将所有 `.jpg` 图片移动到备份目录

## 核心参数一览

| 参数 | 完整形式      | 作用说明                                           |
| ---- | ------------- | -------------------------------------------------- |
| `-t` | `--type`      | 指定过滤类型（`f` 文件，`d` 目录，`x` 可执行文件） |
| `-e` | `--extension` | 指定文件扩展名（如 `md`, `png`）                   |
| `-d` | `--max-depth` | 限制向下搜索的目录层级深度                         |
| `-H` | `--hidden`    | 搜索范围包含隐藏文件                               |
| `-I` | `--no-ignore` | 搜索范围包含被 `.gitignore` 忽略的文件             |
| `-g` | `--glob`      | 启用通配符/精确匹配（关闭默认的正则匹配）          |
| `-x` | `--exec`      | 对每一个搜索结果批量执行命令                       |
