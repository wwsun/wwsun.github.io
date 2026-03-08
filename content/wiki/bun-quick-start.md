---
title: Bun 入门指南
tags:
  - bun
  - nodejs
draft: true
description: Bun 入门指南
source: https://bun.com/docs
---

Bun 不仅仅是一个运行时，它是一个集 **运行时、包管理器、打包器、测试运行器** 于一体的全栈工具链。

[[Deno vs Bun]]

## 1. 环境安装与初始化

在 macOS 上，推荐使用官方脚本或 Homebrew：

- **安装命令：** `curl -fsSL https://bun.sh/install | bash` 或 `brew install bun`
- **环境变量：** 确保 `~/.zshrc` 中包含以下内容：

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

```

- **新项目初始化：** `bun init`

---

## 2. 命令对照表 (快速上手)

从 npm/pnpm 切换到 Bun，逻辑几乎是无缝的：

| 功能             | npm / pnpm         | **Bun 替代方案**       |
| ---------------- | ------------------ | ---------------------- |
| **安装依赖**     | `pnpm install`     | `bun install`          |
| **添加包**       | `pnpm add <pkg>`   | `bun add <pkg>`        |
| **临时执行工具** | `npx <pkg>`        | **`bunx <pkg>`**       |
| **运行脚本**     | `pnpm run <name>`  | `bun run <name>`       |
| **热更新开发**   | `nodemon index.js` | `bun --watch index.js` |
| **单元测试**     | `jest` / `vitest`  | `bun test`             |
| **发布包**       | `npm publish`      | `bun publish`          |

---

## 3. 从 Node.js/pnpm 迁移的三部曲

如果你有一个现有的项目，请按照以下步骤操作：

### 第一步：彻底清扫

删除旧的锁定文件和冗余目录，避免符号链接（Symlinks）干扰：

```bash
rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock

```

### 第二步：重建依赖

使用 Bun 生成新的高性能锁定文件：

```bash
bun install

```

### 第三步：瘦身代码

- **环境变量：** 移除 `dotenv` 依赖，Bun 原生支持读取 `.env`。
- **TypeScript：** 移除 `ts-node` 或 `esbuild` 预编译步骤，直接运行 `.ts` 文件。
- **原生 API：** 优先使用 `fetch`、`WebSocket` 等原生 Web API，减少对 `node-fetch` 等第三方库的依赖。

---

## 4. 私有 Registry 与发布配置

针对企业级开发，Bun 提供了灵活的私有库支持。

### 配置 `bunfig.toml`

在项目根目录创建此文件，代替复杂的 `.npmrc`：

```toml
[install.scopes]
"@my-org" = "https://registry.my-company.com" # 针对特定作用域

[publish]
registry = "https://registry.my-company.com"   # 发布地址

```

### 发布到私有库

1. **身份验证：** 推荐设置环境变量 `export BUN_AUTH_TOKEN="your-token"`。
2. **执行发布：** `bun publish`。
3. **安全预览：** 发布前建议运行 `bun publish --dry-run` 检查文件列表。

---

## 5. 为什么选择 Bun？ (核心优势)

- **性能：** 基于 Zig 语言和 JavaScriptCore 引擎，启动速度和执行效率远超 V8。
- **极简：** 无需配置 Babel, Webpack 或 Jest，一切内置。
- **兼容性：** 95% 以上兼容 Node.js 原生模块及 CommonJS/ESM 混用。
