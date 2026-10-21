---
title: fd 快速上手指南
date: 2026-10-21
description: 快速、友好的文件搜索工具，find 的现代化替代品
tags:
  - cli
  - dev-tools
  - rust
source: https://github.com/sharkdp/fd
---

## 概述

`fd` 是一个用 Rust 编写的命令行文件搜索工具，是 `find` 的现代化替代品。它更快、更直观，默认行为更符合日常使用习惯。

- **官方仓库**: [sharkdp/fd](https://github.com/sharkdp/fd)
- **中文文档**: [cha0ran/fd-zh](https://github.com/cha0ran/fd-zh)
- **安装**: `brew install fd` / `apt install fd-find` / `cargo install fd-find`

## 核心设计理念

- **直觉优先**：`fd PATTERN` 相当于 `find -iname '*PATTERN*'`，更符合人的思考方式
- **智能大小写**：默认不区分大小写，模式中含大写字母时自动切换为大小写敏感
- **安全默认**：默认忽略隐藏文件、遵守 `.gitignore`
- **高性能**：并行遍历目录，Rust 正则引擎，比 `find` 快 5-9 倍

## 基本用法

### 简单搜索

```bash
fd PATTERN              # 递归搜索当前目录
fd PATTERN /path        # 在指定目录搜索
fd                      # 无参数列出所有文件（类似 ls -R）
```

### 搜索模式

```bash
fd '正则表达式'          # 默认正则（最强大）
fd -g 'glob_pattern'    # Glob 通配符模式
fd -g libc.so           # 精确匹配文件名
fd -e md                # 按扩展名过滤
fd -e rs mod            # 扩展名 + 搜索词组合
fd -t f                 # 按类型过滤: f=文件 d=目录 l=符号链接 x=可执行 e=空
```

### 高级过滤

```bash
fd -H                   # 包含隐藏文件
fd -I                   # 不遵守 .gitignore
fd -HI                  # 什么都不过滤
fd -p                   # 匹配完整路径
fd -d 3                 # 限制最大深度
fd -E '.git'            # 排除指定目录/文件
fd -L                   # 跟踪符号链接
```

## ⭐ 命令执行（-x / -X）

这是 fd 区别于 find 的核心特性。

### 并行执行 `-x`

每个搜索结果启动一个独立进程，并行运行：

```bash
fd -e zip -x unzip                     # 找到所有 zip 并行解压
fd -e h -e cpp -x clang-format -i     # 格式化所有 C/C++ 源文件
fd -tf -x md5sum > checksums.txt       # 并行计算所有文件校验和
fd -e jpg -x convert {} {.}.png        # 批量转换 jpg 到 png
```

### 批量执行 `-X`

所有结果作为一次命令的参数：

```bash
fd -g '*.py' -X vim                    # 用 vim 一次性打开所有匹配文件
fd -e cpp -e h -X rg 'TODO'           # 在所有 C++ 源文件中 grep TODO
fd -X ls -lhd --color=always          # 等同于 fd -l
fd -H '^\.DS_Store$' -tf -X rm        # 一次性删除所有 .DS_Store
```

### 占位符语法

| 占位符 | 含义           | 示例                         |
| ------ | -------------- | ---------------------------- |
| `{}`   | 完整路径       | `documents/images/party.jpg` |
| `{.}`  | 无扩展名路径   | `documents/images/party`     |
| `{/}`  | 仅文件名       | `party.jpg`                  |
| `{//}` | 父目录         | `documents/images`           |
| `{/.}` | 无扩展名文件名 | `party`                      |

### 并行度控制

```bash
fd -x command -j 4     # 最多 4 个并行任务
fd -x command -j 1     # 串行执行
```

## 与 find 的对比

| 操作            | `find`                   | `fd`             |
| --------------- | ------------------------ | ---------------- |
| 搜索模式        | `find -iname '*foo*'`    | `fd foo`         |
| 区分大小写      | `find -name 'Foo'`       | `fd Foo`（自动） |
| 忽略隐藏文件    | 需要 `-not -path '*/.*'` | 默认行为         |
| 忽略 .gitignore | 不支持                   | 默认行为         |
| 扩展名过滤      | `find -name '*.md'`      | `fd -e md`       |
| 并行执行        | 需配合 `xargs -P`        | `fd -x` 内置     |
| 正则搜索        | `find -regex`            | 默认行为         |

## 工具组合

### 配合 fzf（模糊查找器）

```bash
export FZF_DEFAULT_COMMAND='fd --type file --follow --hidden --exclude .git'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
```

### 配合 ripgrep（内容搜索）

```bash
fd -e cpp -e h -X rg 'std::cout'    # 在 C++ 文件中搜索内容
```

### 配合 xargs

```bash
fd -0 -e rs | xargs -0 wc -l        # NULL 分隔，安全处理含空格文件名
```

### 输出为树状结构

```bash
fd | as-tree                        # 需要安装 as-tree
```

## 排除与忽略

### 临时排除

```bash
fd -E '.git' -E 'node_modules' -E '*.bak'
```

### 永久排除（.fdignore）

在项目或 `~/.config/fd/ignore` 中创建 `.fdignore` 文件，语法同 `.gitignore`：

```
.git/
node_modules/
*.bak
```

## 常见场景速查

```bash
# 找到项目中所有 Markdown 文件
fd -e md

# 列出 src 目录下所有 TypeScript 文件
fd -e ts src/

# 查找最近修改的日志文件
fd -e log --changed-within 1day

# 查找大文件（>100MB）
fd -S +100m

# 精确匹配文件名
fd -g package.json

# 搜索完整路径（而不只是文件名）
fd -p 'src/components/.*\.tsx$'

# 批量重命名（需配合其他工具）
fd -e jpg -x mv {} {.}.webp
```

## 安装方式

```bash
# macOS
brew install fd

# Ubuntu/Debian
sudo apt install fd-find
# 注意：二进制名为 fdfind，建议创建别名
ln -s $(which fdfind) ~/.local/bin/fd

# Arch Linux
pacman -S fd

# 通过 Rust
cargo install fd-find

# 通过 npm
npm install -g fd-find
```

## 注意事项

- fd 默认不搜索隐藏目录/文件，搜不到时先用 `-H` 试试
- 正则表达式特殊字符（`[]`、`^`、`$` 等）在 shell 中也会被转义，建议用**单引号**包裹：`fd '^[A-Z].*$'`
- 模式以 `-` 开头时需加 `--`：`fd -- '-pattern'`
- Shell alias 和函数不能直接通过 `fd -x` 执行，需通过 `bash -c` 包装
- Ubuntu/Debian 的包名是 `fd-find`，二进制名为 `fdfind`
