---
created: 2025-12-17 21:10
url: https://github.com/Schniz/fnm
tags:
  - nodejs
---
fast node manager

## 命令速查

| 命令 | 说明 |
|------|------|
| `fnm install <version>` | 安装版本 |
| `fnm use <version>` | 切换版本 |
| `fnm default <version>` | 设置默认 |
| `fnm uninstall <version>` | 卸载版本 |
| `fnm ls` | 列出已安装 |
| `fnm ls-remote` | 列出可安装 |
| `fnm current` | 当前版本 |
| `fnm exec --using=<v>` | 用指定版本执行命令 |
| `fnm alias <v> <name>` | 创建别名 |
| `fnm which <version>` | 查看安装路径 |


如果你想保留 `nvm` 的命令习惯，可以在 `~/.zshrc` 中添加：

```bash
alias nvm="fnm"
```

## 安装

```bash
brew intall fnm
```

## Node 版本安装与卸载

```bash
# 安装最新 LTS 版本
fnm install --lts

# 安装指定版本
fnm install 20
fnm install 20.10.0
fnm install 18

# 安装最新版本
fnm install latest

# 卸载指定版本
fnm uninstall 18
```

---

## 版本切换

```bash
# 切换到指定版本（当前 shell）
fnm use 20
fnm use 18.17.0

# 使用 .nvmrc 或 .node-version 中指定的版本
fnm use

# 设置系统默认版本
fnm default 20

# 使用系统安装的 Node（非 fnm 管理的）
fnm use system
```

---

## 查看版本

```bash
# 查看当前使用的版本
fnm current

# 列出已安装的所有版本
fnm ls

# 列出所有可安装的远程版本
fnm ls-remote

# 只列出 LTS 版本
fnm ls-remote --lts
```

---

## 别名管理

```bash
# 设置默认版本（别名 default）
fnm default 20

# 创建自定义别名
fnm alias 20 my-project

# 使用别名
fnm use my-project

# 删除别名
fnm unalias my-project
```

---

## 环境与配置

```bash
# 查看 fnm 版本
fnm -V
fnm --version

# 查看当前环境变量设置
fnm env

# 查看帮助
fnm --help
fnm install --help
```

---

## 实用技巧

### 快速安装并切换
```bash
fnm install 20 && fnm use 20
```

### 运行特定版本（不切换）
```bash
fnm exec --using=18 node -v
fnm exec --using=18 npm install
```

### 查看 Node 安装路径
```bash
fnm which 20
# 输出: /Users/you/Library/Application Support/fnm/node-versions/v20.x.x/installation/bin/node
```

---

## .nvmrc / .node-version 文件

在项目根目录创建版本文件：

```bash
# 创建 .nvmrc（兼容 nvm）
echo "20" > .nvmrc

# 或创建 .node-version
echo "20" > .node-version
```

配置了 `--use-on-cd` 后，进入目录会自动切换版本。


