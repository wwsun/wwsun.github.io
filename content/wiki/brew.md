---
title: brew
date: 2026-02-02
tags:
  - status/seed
  - type/post
draft: true
description: brew 命令使用指南
---
## 1 基本使用

### 1.2 搜索包

```bash
brew search <包名>

```

例：`brew search node`

### 1.3 安装包

```bash
brew install <包名>

```

例：`brew install node`（Node.js）

### 1.4 查看已安装包

```bash
brew list

```

### 1.5 升级包

```bash
brew upgrade <包名>

```

或全部升级：

```bash
brew upgrade

```

### 1.6 卸载包

```bash
brew uninstall <包名>

```

### 1.7 查看包信息

```bash
brew info <包名>

```

---

## 2. 常用 Web 开发相关工具

- node, nvm, yarn
- git
- mysql, postgresql, redis, mongodb（数据库）
- nginx, httpd（web server）
- imagemagick（图片处理）
- openssl（安全相关）
- wget, curl（网络工具）

例：`brew install redis`

---

## 3. 服务管理（重要！）

很多服务（数据库、web server）可以用 brew services 管理：

### 3.1 启动服务

```bash
brew services start <包名>

```

例：`brew services start redis`

### 3.2 停止服务

```bash
brew services stop <包名>`

```

### 3.3 查看所有服务状态

```bash
brew services list

```

---

## 4. 管理 Cask 应用（GUI 应用）

安装 GUI 应用（如 Chrome、VSCode）：

```bash
brew install --cask <应用名>

```

例：`brew install --cask visual-studio-code`

---

## 5. 清理与维护

### 5.1 清理无用文件

```bash
brew cleanup

```

### 5.2 检查问题

```bash
brew doctor

```

---

## 6. 软件源加速

国内开发者建议更换 brew 源，加快下载速度（如清华、中科大等镜像）。

---

## 7. 进阶技巧

- **brew update**：更新 Homebrew 本身
- **brew pin <包名>**：锁定某个包的版本
- **brew uninstall --cask <应用名>**：卸载 cask 应用

---

## 8. 常见问题排查

- brew doctor 查看诊断
- brew outdated 查看哪些包需要升级

---

## 总结

**重点掌握：**

- 安装、升级、卸载包
- 服务的启动与停止
- 安装 GUI 应用
- 常用 web 开发依赖的安装

这些是 web 开发日常用到的 brew 方式，熟练掌握能极大提升你的工作效率！

如有具体需求包或场景，可以继续追问！