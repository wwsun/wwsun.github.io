---
title: 使用 Vercel Sandbox 运行 Claude Agent SDK
tags:
  - claude
  - sandbox
  - vercel
draft: false
description: >-
  Claude Agent SDK 是一个长期运行的进程，用于执行命令、管理文件并维护对话状态。由于 SDK 会代表 AI 代理运行 shell
  命令和修改文件，因此将其隔离在沙盒容器中非常重要。这可以防止代理访问您的生产系统、消耗无限资源或干扰其他进程。
source: "https://vercel.com/kb/guide/using-vercel-sandbox-claude-agent-sdk"
date: 2026-03-31T06:02:38.824Z
---

[Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) 是一个长期运行的进程，用于执行命令、管理文件并维护对话状态。由于 SDK 会代表 AI 代理运行 shell 命令和修改文件，因此将其隔离在沙盒容器中非常重要。这可以防止代理访问您的生产系统、消耗无限资源或干扰其他进程。

SDK 在运行前需要安装特定的运行时依赖：

- **Claude Code CLI**: 执行命令并管理开发环境
- **Anthropic SDK**: 为 Claude Code 提供 API 客户端

[Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) 提供了一个临时空间，具有安全性、依赖项自定义、资源限制和隔离功能。

本文介绍如何在 Vercel Sandbox 中安装 Claude Agent 依赖项，并在构建代理应用程序之前验证它们是否正常工作。

---

## 先决条件

在开始之前，请确保您已具备以下条件：

- 在您的机器上安装了 Vercel CLI。如果没有，请使用以下命令安装：
  ```bash
  npm install -g vercel
  ```
- 本地安装了 Node.js 22 或更高版本
- 一个 [Vercel 项目](https://vercel.com/docs/projects) 用于链接您的沙盒

---

## 1. 项目设置

为您的项目创建一个新目录并设置所需的文件：

```bash
mkdir claude-sandbox-demo
cd claude-sandbox-demo
npm init -y
npm install @vercel/sandbox ms
npm install -D @types/ms @types/node
```

您安装的包：

- `"@vercel/sandbox"`: Vercel 用于创建和管理沙盒的 SDK
- `ms`: 用于处理时间持续时间的辅助工具
- TypeScript 支持的类型定义

更新您的 `package.json` 以通过添加 `"type": "module"` 启用 ES 模块：

```json
{
  "name": "claude-sandbox-demo",
  "type": "module",
  "dependencies": {
    "@vercel/sandbox": "^1.0.2",
    "ms": "^2.1.3"
  },
  "devDependencies": {
    "@types/ms": "^2.1.0",
    "@types/node": "^24.10.0"
  }
}
```

创建一个 `tsconfig.json` 文件用于 TypeScript 配置：

```json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "types": ["node"]
  }
}
```

将您的项目链接到 Vercel：

```bash
vercel link
```

此命令将您的本地项目连接到新的或现有的 Vercel 项目，这是沙盒身份验证所必需的。

---

## 2. 设置身份验证

为了安全地将您的 Vercel 部署与沙盒连接，您可以使用自动随项目创建的 [Vercel OIDC 令牌](https://vercel.com/docs/oidc)。将身份验证令牌拉取到您本地的 `.env.local` 文件中：

```bash
vercel env pull
```

这将创建一个包含 `VERCEL_OIDC_TOKEN` 的 `.env.local` 文件，Vercel Sandbox SDK 使用该令牌进行身份验证。OIDC 令牌在 12 小时后过期，因此如果您需要长时间开发，则需要再次运行 `vercel env pull`。

---

## 3. 创建安装脚本

创建一个名为 `claude-sandbox.ts` 的新文件，用于设置 Vercel Sandbox、安装 Claude Code CLI 和 Anthropic SDK，并验证安装：

```typescript
import ms from "ms"
import { Sandbox } from "@vercel/sandbox"

async function main() {
  const sandbox = await Sandbox.create({
    resources: { vcpus: 4 },
    // 超时时间（毫秒）：ms('10m') = 600000
    // 默认为 5 分钟。Pro/Enterprise 最大为 5 小时，Hobby 为 45 分钟。
    timeout: ms("10m"),
    runtime: "node22",
  })

  console.log(`Sandbox created: ${sandbox.sandboxId}`)

  console.log(`Installing Claude Code CLI...`)
  // 全局安装 Claude Code CLI
  const installCLI = await sandbox.runCommand({
    cmd: "npm",
    args: ["install", "-g", "@anthropic-ai/claude-code"],
    stderr: process.stderr,
    stdout: process.stdout,
    sudo: true,
  })

  if (installCLI.exitCode != 0) {
    console.log("installing Claude Code CLI failed")
    process.exit(1)
  }

  console.log(`✓ Claude Code CLI installed`)

  console.log(`Installing Anthropic SDK...`)
  // 在工作目录中安装 @anthropic-ai/sdk
  const installSDK = await sandbox.runCommand({
    cmd: "npm",
    args: ["install", "@anthropic-ai/sdk"],
    stderr: process.stderr,
    stdout: process.stdout,
  })

  if (installSDK.exitCode != 0) {
    console.log("installing Anthropic SDK failed")
    process.exit(1)
  }

  console.log(`✓ Anthropic SDK installed`)

  console.log(`Verifying SDK connection...`)
  // 创建一个简单的脚本来验证 SDK 是否可以导入
  const verifyScript = `
import Anthropic from '@anthropic-ai/sdk';
console.log('SDK imported successfully');
console.log('Anthropic SDK version:', Anthropic.VERSION);
console.log('SDK is ready to use');
`

  await sandbox.writeFiles([
    {
      path: "/vercel/sandbox/verify.mjs",
      content: Buffer.from(verifyScript),
    },
  ])

  // 运行验证脚本
  const verifyRun = await sandbox.runCommand({
    cmd: "node",
    args: ["verify.mjs"],
    stderr: process.stderr,
    stdout: process.stdout,
  })

  if (verifyRun.exitCode != 0) {
    console.log("SDK verification failed")
    process.exit(1)
  }

  console.log(`✓ Anthropic SDK is properly connected`)
  console.log(`\\nSuccess! Both Claude Code CLI and Anthropic SDK are installed and ready to use.`)

  // 停止沙盒
  await sandbox.stop()
  console.log(`Sandbox stopped`)
}

main().catch(console.error)
```

### 脚本的作用

- 创建一个具有 4 个 vCPU 和 10 分钟超时的沙盒
- 使用 `sudo` 全局安装 Claude Code CLI 以获取系统级访问权限
- 在工作目录中安装 Anthropic SDK
- 使用 `writeFiles()` 和 Buffer 将验证脚本写入沙盒文件系统
- 运行验证以确认 SDK 已正确连接
- 完成后停止沙盒

### 脚本参考信息

- 使用 `sandbox.sandboxId` 访问唯一的沙盒标识符
- 使用 `!= 0` 检查退出代码以判断命令是否失败
- 使用 `writeFiles()`，它接受一个文件对象数组，其中 `content` 为 Buffer
- 将输出流式传输到 `process.stderr` 和 `process.stdout` 以获取实时反馈

---

## 4. 运行验证

使用 `.env.local` 中的环境变量运行您的脚本：

```bash
node --env-file .env.local --experimental-strip-types ./claude-sandbox.ts
```

输出应类似于以下内容：

```
Sandbox created: sbx_abc123...
Installing Claude Code CLI...
✓ Claude Code CLI installed
Installing Anthropic SDK...
✓ Anthropic SDK installed
Verifying SDK connection...
SDK imported successfully
Anthropic SDK version: 1.2.3
SDK is ready to use
✓ Anthropic SDK is properly connected
Success! Both Claude Code CLI and Anthropic SDK are installed and ready to use.
Sandbox stopped
```

要在 Vercel 仪表板中监控您的[沙盒](https://vercel.com/d?to=%2F%5Bteam%5D%2F%5Bproject%5D%2Fai%2Fsandbox&title=Go+to+your+project+sandboxes)：

- 导航到 [vercel.com](http://vercel.com) 上的您的项目
- 点击 Observability 标签
- 点击左侧边栏中的 Sandboxes
- 查看沙盒历史记录、命令执行和资源使用情况

脚本在验证完成后会自动停止沙盒，但您也可以根据需要手动从仪表板停止沙盒。

---

## 最佳实践

### 始终停止沙盒

当您的工作完成时，始终调用 `sandbox.stop()` 以避免不必要的费用：

```typescript
try {
  // 您的沙盒操作
} finally {
  await sandbox.stop()
  console.log("Sandbox stopped")
}
```

### 设置适当的超时时间

根据您的安装需求配置超时时间。对于简单的依赖项安装，通常 5-10 分钟就足够了：

```typescript
const sandbox = await Sandbox.create({
  timeout: ms("10m"), // 10 分钟用于安装
  // 最大：Pro/Enterprise 为 5 小时，Hobby 为 45 分钟
})
```

---

## 下一步

现在您已验证 Claude Code CLI 和 Anthropic SDK 在 Vercel Sandbox 中可以正常工作，您可以：

- **添加 API 身份验证**: 设置您的 Anthropic API 密钥以启用代理执行
- **构建 AI 功能**: 使用验证过的设置构建 AI 驱动的代码生成或分析工具
- **扩展到生产环境**: 部署基于沙盒的 AI 应用程序

---

## 结论

您已成功在 Vercel Sandbox 中安装 Claude Code CLI 和 Anthropic SDK，并验证它们已正确连接。此设置确认您的部署环境可以支持 Claude 的 Agent SDK。

### 相关文档

- [Vercel Sandbox 文档](https://vercel.com/docs/vercel-sandbox)
- [Vercel SDK 文档](https://vercel.com/docs/vercel-sandbox/sdk-reference)
- [托管 Claude Agent 指南](https://docs.claude.com/en/api/agent-sdk/hosting)
- [Claude Agent SDK 文档](https://docs.anthropic.com/en/api/agent-sdk) - 了解构建 AI 代理
