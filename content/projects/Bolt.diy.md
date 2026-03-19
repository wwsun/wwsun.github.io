---
title: Bolt.diy 代码学习
tags:
  - github
draft: true
description: bolt.diy 是一个完全在浏览器中运行的 AI 驱动全栈 Web 开发环境。它是 Bolt.new 的官方开源版本，其主要区别在于它允许用户为每个提示词选择自己的 LLM 提供商和模型。
source: https://github.com/stackblitz-labs/bolt.diy#
---

本文档是对 `bolt.diy` 项目的深度技术调研与学习指南。该项目是一个基于浏览器端 WebContainer 技术和多种 LLM 模型驱动的 AI 智能代理，旨在实现“从自然语言到可运行应用”的全自动化流程。

---

## 1. 项目核心价值与愿景

`bolt.diy` 不仅仅是一个聊天机器人，它是一个运行在浏览器内的 **全栈开发环境**。通过结合 LLM 的推理能力与 WebContainer 的沙箱执行能力，它实现了：

- **即时原型开发**: 无需本地环境配置。
- **Local-first 体验**: 响应极快，数据主要留存在用户本地。
- **高度可扩展**: 支持接入几乎所有主流 LLM 供应商，并集成 MCP 协议。

---

## 2. 核心架构设计

### 2.1 整体架构拓扑

```text
[ 用户浏览器 ]
      |
      | (HTTP/SSE)
      v
[ Remix Server (Cloudflare Pages) ] <------> [ LLM Providers (Anthropic/OpenAI/...) ]
      |
      | (Streaming Response)
      v
[ 前端 Parser ] ----> [ Action Runner ] ----> [ WebContainer (Node.js API) ]
                                |                     |
                                v                     v
                        [ 终端 / 编辑器 ]        [ 实时预览 / 侧边栏 ]
```

### 2.2 端到端工作流：从 Prompt 到代码执行

1.  **指令接收**: 用户输入自然语言指令。
2.  **上下文构建**: 系统通过 `selectContext` 和 `createSummary` 自动筛选相关文件，并结合当前文件系统状态构建 LLM 上下文。
3.  **LLM 推理**: 后端调用 Vercel AI SDK，LLM 返回带有结构化标签（如 `<boltArtifact>`）的消息流。
4.  **流式解析**: 前端 `enhanced-message-parser.ts` 实时拦截并解析 XML 标签，提取出具体的 `Action`（如 `shell`, `file`）。
5.  **沙箱执行**: `action-runner.ts` 将 Action 下发给 WebContainer 运行，实现文件的自动创建、依赖安装和热更新。
6.  **反馈闭环**: WebContainer 的实时预览窗口通过 Service Worker 拦截请求，展示最新的应用状态。

---

## 3. 技术栈深度实现

### 3.1 前端与 UI 系统

- **Remix (React)**: 核心框架，负责路由分发、SSR（在特定环境下）以及复杂的消息流管理。
- **UnoCSS**: 原子化 CSS，确保 UI 在复杂交互下依然保持极高的渲染性能。
- **Radix UI & Framer Motion**: 提供无障碍组件基础与流畅的动效。

### 3.2 WebContainer 运行时

- **核心组件**: `@webcontainer/api`。
- **原理**: 在浏览器 Tab 中运行一个微型的 Node.js 运行时，利用 SharedArrayBuffer 和 Web Workers 实现隔离的执行环境。
- **关键功能**:
  - **内存文件系统**: 极速读写，与编辑器双向同步。
  - **虚拟终端**: 通过 `xterm.js` 提供接近原生的命令行体验。

### 3.3 AI 集成与 MCP 协议

- **Vercel AI SDK**: 统一了不同供应商的流式输出接口。
- **多模型适配**: 深度集成 Anthropic (Claude 3.5), Google (Gemini 2.0), DeepSeek 等。
- **MCP (Model Context Protocol)**: 实现 MCP 客户端，允许 LLM 动态调用外部工具（如搜索、数据库访问等），极大扩展了 AI 的能力边界。

---

## 4. 数据模型与持久化体系

`bolt.diy` 采用 **Local-first (本地优先)** 的设计理念，确保数据的私密性与低延迟。

### 4.1 存储分层结构

| 存储层级         | 实现技术              | 存储内容                                   | 优势                         |
| :--------------- | :-------------------- | :----------------------------------------- | :--------------------------- |
| **持久化大容量** | IndexedDB (`dexie`)   | 聊天历史、文件系统快照、Git 对象           | 容量大，支持事务，刷新不丢失 |
| **轻量配置**     | LocalStorage          | 用户偏好（主题）、选中的模型、临时 API Key | 读取简单，同步响应           |
| **运行时状态**   | Zustand & Nano Stores | 当前消息流、编辑器内容、UI 交互状态        | 高性能响应式同步             |
| **桌面增强**     | Electron Store        | 系统级配置、跨窗口同步数据                 | 突破浏览器存储限制           |

### 4.2 浏览器内 Git 系统

- **Isomorphic-Git**: 纯 JS 实现的 Git 库。
- **机制**: 将所有 `.git` 文件夹下的数据持久化在 IndexedDB 中，使用户能在浏览器内进行 Commit, Branch 等操作，实现完整的代码版本管理。

---

## 5. 核心模块解析

### 5.1 解析器 (Message Parser)

连接 AI 语言与机器指令的桥梁。它使用状态机处理 LLM 的流式输出，能够处理不完整的 XML 标签，确保 UI 能在 LLM 回答的过程中实时更新代码。

### 5.2 LLM 服务层 (`app/lib/.server/llm/`)

- **流恢复 (Stream Recovery)**: 针对网络波动导致的 SSE 中断，实现了重试机制。
- **上下文压缩**: 自动识别并总结过长的对话，确保核心指令不因 Context Window 限制而丢失。

---

## 6. 安全、部署与扩展建议

### 6.1 安全机制

- **CSP & Cross-Origin Isolation**: 严格配置安全头，以支持 WebContainer 所需的 SharedArrayBuffer。
- **API Key 安全**: 建议密钥仅存在于本地，不经过中心化服务器。

### 6.2 部署建议

- **生产/多人环境**: 推荐集成 **Supabase** 作为后端，解决 IndexedDB 易被浏览器清理的问题，并提供跨设备同步。
- **边缘计算**: 完美适配 Cloudflare Pages 和 D1/KV。

### 6.3 扩展方向

- **自定义 MCP Server**: 根据业务需求编写 MCP 插件，让 AI 能访问企业内部 API。
- **Docker 容器化**: 对于需要更重运行环境的场景，可将 WebContainer 替换为远程 Docker 容器。
