---
title: sdkman
tags:
  - jdk
draft: false
description: 未命名
source: https://sdkman.io/
---

关于 SDKMAN!，对于从 Node.js 环境转向 Java 生态的开发者来说，其核心定位和使用逻辑与 `nvm` 非常相似。它是基于 Shell 环境变量动态修改来实现版本隔离的。

以下是你必须掌握的核心概念和高频命令。

## 你一定要知道的核心概念

1.  **Candidate（候选者）不仅限于 Java**
    SDKMAN 称它管理的软件为 Candidate。除了 Java (JDK)，它也是安装和管理 Java 构建工具（Maven, Gradle）、框架 CLI（Spring Boot CLI, Micronaut）以及其他 JVM 语言（Kotlin, Scala）的标准工具。

2.  **Java 发行版（Vendor）后缀机制**
    与 Node.js 主要是官方单一版本不同，JDK 是一个标准，由多家厂商提供实现（如 Eclipse Temurin, Amazon Corretto, Azul Zulu, Oracle 等）。SDKMAN 通过版本号后面的后缀来严格区分它们。例如：
    - `17.0.10-tem` 代表 Eclipse Temurin (最常用的开源免费版本，推荐)。
    - `17.0.10-amzn` 代表 Amazon Corretto。
      如果你在安装时不指定正确的后缀，安装将会失败。

3.  **`use` 与 `default` 的作用域差异（最易踩坑）**
    - **临时作用域**：影响当前终端窗口（Session），一旦关闭终端，设置失效。这对于你在 CLI 中运行 `gemini-cli` 临时测试某个版本非常有用。
    - **全局作用域**：影响所有新打开的终端。这决定了你的操作系统的基础环境。

## 你一定要知道的 8 个核心命令

#### 1. 探索与查询

- **`sdk list java`**
  **必须掌握**。这是一个交互式列表，列出所有厂商、所有状态（本地已安装会标记为 `installed`）的 Java 版本。你需要通过这个列表来查找你想安装的确切版本字符串（即 Identifier 列）。
  _(按 `q` 退出该列表，按空格翻页)_

- **`sdk current java`**
  查看当前终端环境正在使用的 Java 版本及其具体发行商。

#### 2. 安装与卸载

- **`sdk install java <版本号>`**
  例如：`sdk install java 21.0.2-tem`。安装完毕后，SDKMAN 通常会询问你是否将其设置为默认版本。

- **`sdk uninstall java <版本号>`**
  清理不再使用的特定 JDK 版本，释放磁盘空间。

#### 3. 版本切换

- **`sdk use java <版本号>`**
  例如：`sdk use java 21.0.2-tem`。**仅在当前终端窗口**临时将 JDK 切换到 21。你的 IDE 或其他终端窗口不受影响。

- **`sdk default java <版本号>`**
  例如：`sdk default java 17.0.10-tem`。设置系统的**全局默认**版本。当你新开一个终端时，会默认加载这个版本。

#### 4. 项目级隔离（完美契合 AI Agent 自动化流程）

- **`sdk env init`**
  在当前项目根目录生成一个 `.sdkmanrc` 文件。你可以打开这个文件，将里面的 `java=...` 修改为该项目所需的特定版本（例如 `java=21.0.2-tem`）。

- **`sdk env`**
  当你在终端中进入包含 `.sdkmanrc` 的目录时，运行此命令，SDKMAN 会自动读取文件并将当前终端环境切换到指定的 JDK 版本。
  _(提示：你可以通过修改 `~/.sdkman/etc/config` 文件，将 `sdkman_auto_env` 设置为 `true`，这样每次 `cd` 进该目录时，甚至不需要敲 `sdk env` 命令，环境就会自动切换。)_

---

习惯了前端 TypeScript 或 Node.js 的版本管理机制后，使用 SDKMAN! 管理 Java 环境会非常自然。它的核心思路与 `nvm` 以及 `.nvmrc` 几乎完全一致。

## 日常使用

### 1. 查找并安装具体的 JDK 发行版

与 Node.js 主要是官方维护不同，Java 是一种规范，有多个厂商（Vendor）提供实现。推荐使用 **Eclipse Temurin**（后缀为 `tem`），它是目前最主流、免费且开源的发行版。

首先，查看当前可用的具体版本号：

```bash
sdk list java
```

在列表中找到带有 `tem` 后缀的 17 和 21 的最新版本标识符（例如 `17.0.10-tem` 和 `21.0.2-tem`）。

然后，分别安装它们：

```bash
sdk install java 17.0.10-tem
sdk install java 21.0.2-tem
```

_注意：安装过程中，SDKMAN! 会询问是否将刚安装的版本设置为默认版本，你可以根据提示输入 `Y` 或 `N`。_

### 2. 设置日常主要使用的默认版本

既然你的主要开发环境是 JDK 17，你需要将其设置为全局默认。这类似于使用 `nvm alias default`。

```bash
sdk default java 17.0.10-tem
```

设置完成后，你每次新开一个终端窗口，执行 `java -version` 都会默认指向 JDK 17。IntelliJ IDEA 也可以统一配置指向这个默认路径（`~/.sdkman/candidates/java/current`）。

### 3. 在需要使用 JDK 21 的场景进行切换

**场景一：临时手动测试**
如果你只是想在当前终端验证一下 JDK 21 的编译或执行情况，不希望影响全局，使用 `use` 命令：

```bash
sdk use java 21.0.2-tem
```

该命令只对当前终端窗口有效，关闭后即失效。

**场景二：项目级别固化（针对 gemini-cli 自动化）**
对于特定需要 JDK 21 的项目，为了让 agent 在后台自动编译时能够识别正确的版本，你需要利用项目级的环境配置，这与前端项目中的 `.nvmrc` 异曲同工。

1. 进入需要使用 JDK 21 的项目根目录。
2. 初始化环境文件：
   ```bash
   sdk env init
   ```
3. 这会生成一个 `.sdkmanrc` 文件。打开并编辑它，指定版本：
   ```text
   java=21.0.2-tem
   ```
4. 开启自动切换功能。编辑 `~/.sdkman/etc/config` 文件，找到并修改以下配置：
   ```text
   sdkman_auto_env=true
   ```

如果不开启自动切换的，进入包含 `.sdkmanrc` 文件

### 4. 让 JAVA_HOME 动态指向 SDKMAN 当前选中版本

修改 `.zshrc` 文件

```
# SDKMAN - Java/Kotlin/Scala 版本管理（延迟加载）
export SDKMAN_DIR="$HOME/.sdkman"

if [[ -s "$SDKMAN_DIR/bin/sdkman-init.sh" ]]; then

  # 直接从符号链接读取 JAVA_HOME，无需初始化 SDKMAN
  export JAVA_HOME="$SDKMAN_DIR/candidates/java/current"

  # 延迟加载：首次调用 sdk 时才真正初始化
  sdk() {
    unset -f sdk
    source "$SDKMAN_DIR/bin/sdkman-init.sh"
    sdk "$@"
  }

fi
```
