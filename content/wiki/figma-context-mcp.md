---
title: Figma-Context-MCP
date: 2026-03-31 11:00:00
tags:
  - mcp
draft: false
description: Figma-Context-MCP是一个基于 Model Context Protocol (MCP) 的服务器，旨在让 AI 编程助手直接访问 Figma 设计数据。
source: https://github.com/GLips/Figma-Context-MCP
---

**Figma-Context-MCP**是一个基于 Model Context Protocol (MCP) 的服务器，旨在让 AI 编程助手（如 Cursor、Claude Desktop 等）能够直接访问 Figma 设计数据。

## 一、项目数据

| 指标        | 数值                  |
| ----------- | --------------------- |
| ⭐ Stars    | 13.9K                 |
| 📦 NPM 包名 | `figma-developer-mcp` |
| 🔤 主要语言 | TypeScript (99%)      |
| 📄 许可证   | MIT                   |
| 🏢 所属公司 | Framelink.ai          |

---

## 二、核心功能与特性

### 1. 主要功能

```
┌─────────────────────────────────────────────────────────────────┐
│                     Figma-Context-MCP 架构                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────────┐ │
│  │   AI 编辑器   │────▶│  MCP Server  │────▶│   Figma API     │ │
│  │ (Cursor等)   │     │              │     │                 │ │
│  └──────────────┘     └──────────────┘     └─────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│                       ┌──────────────┐                          │
│                       │ 数据简化处理  │                          │
│                       │  & 转换      │                          │
│                       └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

1. **设计数据提取**：从 Figma API 获取文件、节点、布局信息
2. **数据简化**：在返回给 AI 之前，简化和转换 Figma API 响应
3. **图像处理**：支持下载和处理 PNG/SVG 图像资源
4. **MCP 协议支持**：通过标准 MCP 协议与 AI 客户端通信

### 2. 关键特性

| 特性                    | 说明                                                    |
| ----------------------- | ------------------------------------------------------- |
| 🎯 **专为 Cursor 优化** | 针对 Cursor IDE 的 Agent 模式特别设计                   |
| 🧹 **智能数据简化**     | 只返回最相关的布局和样式信息，减少 Token 消耗           |
| 🖼️ **图像资源处理**     | 支持下载、裁剪、处理 PNG 和 SVG                         |
| 🔐 **双认证方式**       | 支持 Personal Access Token 和 OAuth                     |
| 🚀 **多模式运行**       | 支持 stdio 模式（本地工具）和 HTTP/SSE 模式（远程服务） |
| 📦 **零安装使用**       | 通过 `npx` 直接运行，无需全局安装                       |

---

## 三、技术架构

### 1. 项目结构

```
src/
├── cli.ts                    # 命令行接口
├── config.ts                 # 配置管理
├── index.ts                  # 主入口（导出提取器类型）
├── server.ts                 # MCP 服务器实现
├── bin.ts                    # 可执行文件入口
├── mcp/
│   ├── index.ts             # MCP 服务器创建
│   └── tools/               # MCP 工具定义
├── services/
│   └── figma.ts             # Figma API 服务封装
├── extractors/              # 数据提取器（核心逻辑）
│   ├── index.ts
│   ├── types.ts
│   ├── layout-extractor.ts
│   ├── text-extractor.ts
│   ├── visuals-extractor.ts
│   └── component-extractor.ts
├── transformers/            # 数据转换逻辑
├── utils/                   # 工具函数
│   ├── logger.ts
│   ├── image-processing.ts
│   └── fetch-with-retry.ts
└── tests/                   # 测试文件
```

### 2. 核心技术栈

| 类别          | 技术                                |
| ------------- | ----------------------------------- |
| **运行时**    | Node.js 18+                         |
| **语言**      | TypeScript 5.7+                     |
| **MCP SDK**   | `@modelcontextprotocol/sdk` v1.27.1 |
| **Figma API** | `@figma/rest-api-spec` v0.33.0      |
| **HTTP 服务** | Express 5.2.1                       |
| **图像处理**  | jimp 1.6.0                          |
| **构建工具**  | tsup                                |
| **测试**      | vitest                              |
| **包管理**    | pnpm                                |

### 3. 关键设计模式

#### 提取器模式（Extractor Pattern）

```typescript
// 灵活的提取器系统，支持多种数据提取策略
export type ExtractorFn = (node: Node, context: TraversalContext) => void

export const allExtractors = [
  layoutExtractor, // 提取布局信息
  textExtractor, // 提取文本内容
  visualsExtractor, // 提取视觉样式
  componentExtractor, // 提取组件信息
]

// 预定义提取器组合
export const layoutAndText = [layoutExtractor, textExtractor]
export const contentOnly = [textExtractor]
export const visualsOnly = [visualsExtractor]
```

#### Unix 哲学

- 工具应该只做一件事，参数尽可能少
- 避免在工具参数中暴露过多配置项
- 项目级配置通过命令行参数设置

---

## 四、使用方式

### 1. 快速开始

```bash
# 无需安装，直接使用 npx
npx figma-developer-mcp --figma-api-key=YOUR_FIGMA_API_KEY
```

### 2. Cursor 配置

**MacOS/Linux:**

```json
{
  "mcpServers": {
    "Framelink MCP for Figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

**Windows:**

```json
{
  "mcpServers": {
    "Framelink MCP for Figma": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "figma-developer-mcp", "--figma-api-key=YOUR-KEY", "--stdio"]
    }
  }
}
```

### 3. 使用流程

1. 在 Cursor 中打开 Agent 模式
2. 粘贴 Figma 文件/框架/组链接
3. 让 Cursor 实现设计
4. Cursor 自动获取 Figma 元数据并生成代码

---

## 五、核心代码解析

### 1. FigmaService - Figma API 封装

```typescript
export class FigmaService {
  private readonly apiKey: string
  private readonly oauthToken: string
  private readonly useOAuth: boolean
  private readonly baseUrl = "https://api.figma.com/v1"

  constructor({ figmaApiKey, figmaOAuthToken, useOAuth }: FigmaAuthOptions) {
    this.apiKey = figmaApiKey || ""
    this.oauthToken = figmaOAuthToken || ""
    this.useOAuth = !!useOAuth && !!this.oauthToken
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.useOAuth) {
      return { Authorization: `Bearer ${this.oauthToken}` }
    } else {
      return { "X-Figma-Token": this.apiKey }
    }
  }

  // 主要方法
  async getRawFile(fileKey: string, depth?: number): Promise<GetFileResponse>
  async getRawNode(fileKey: string, nodeId: string, depth?: number): Promise<GetFileNodesResponse>
  async downloadImages(
    fileKey: string,
    localPath: string,
    items: ImageItem[],
  ): Promise<ImageProcessingResult[]>
  async getImageFillUrls(fileKey: string): Promise<Record<string, string>>
}
```

### 2. 服务器模式

```typescript
// 支持两种运行模式
export async function startServer(): Promise<void> {
  const config = getServerConfig()

  if (config.isStdioMode) {
    // stdio 模式 - 作为本地工具运行
    const server = createServer(config.auth, serverOptions)
    const transport = new StdioServerTransport()
    await server.connect(transport)
  } else {
    // HTTP 模式 - 作为远程服务运行
    await startHttpServer(config.host, config.port, createMcpServer)
  }
}

// HTTP 服务器支持 StreamableHTTP
// 同时兼容旧版 SSE 端点
```

---

## 六、数据简化策略

项目核心优势在于**智能数据简化**，在将 Figma API 数据返回给 AI 之前，会：

1. **过滤无关字段** - 只保留布局和样式相关信息
2. **转换复杂结构** - 将 Figma 嵌套结构转换为更易理解的格式
3. **提取关键元数据** - 位置、尺寸、颜色、字体等
4. **图像资源处理** - 下载并优化图像资源

这种简化策略的优势：

- ✅ 减少 Token 消耗
- ✅ 提高 AI 理解和准确性
- ✅ 响应更相关
- ✅ 比粘贴截图方式效果好得多

---

## 七、竞品与生态

### 1. 相关项目对比

| 项目                         | 特点                            | 关系        |
| ---------------------------- | ------------------------------- | ----------- |
| **Figma-Context-MCP** (本项) | 官方维护，数据简化，Cursor 优化 | ⭐ 主流方案 |
| tianmuji/Figma-Context-MCP   | 添加位置信息增强，支持布局推断  | Fork        |
| tercumantanumut/...          | 30+ 专业工具，设计系统追踪      | 扩展 Fork   |
| Microsoft Amplifier          | 微软的 MCP Agent 框架           | 类似理念    |

### 2. Fork 趋势

从搜索结果可以看出，该项目已被多次 Fork 并扩展：

- 添加位置信息以支持更好的布局推断
- 扩展设计系统追踪功能
- 添加组件库管理功能

---

## 八、开发指南

### 1. 本地开发

```bash
# 克隆仓库
git clone https://github.com/GLips/Figma-Context-MCP.git
cd Figma-Context-MCP

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 添加 FIGMA_API_KEY

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

### 2. 开发规范

- **TypeScript**: 所有代码使用 TypeScript
- **代码格式**: Prettier + ESLint
- **测试**: Vitest
- **Git Hooks**: Lefthook 进行代码检查
- **提交规范**: 遵循常规提交格式

---

## 九、应用场景

### 1. 设计到代码（Design-to-Code）

```
Figma 设计 → MCP Server → Cursor Agent → 生成 React/Vue/Angular 代码
```

### 2. 设计系统同步

- 提取设计 Token
- 同步颜色、字体、间距
- 生成 CSS Variables

### 3. 资产导出

- 批量导出图标
- 下载优化后的图像
- 生成组件截图

---

## 十、优缺点分析

### 优势 ✅

1. **高 Stars 认可度** - 13.9K Stars 证明其受欢迎程度
2. **官方 Figma API** - 使用官方 API，稳定可靠
3. **智能数据简化** - 核心竞争优势，显著提升 AI 效果
4. **多模式支持** - stdio 和 HTTP 两种运行模式
5. **零安装使用** - npx 直接运行，降低使用门槛
6. **双认证支持** - PAT 和 OAuth 都支持
7. **活跃维护** - 持续更新，社区活跃

### 劣势 ⚠️

1. **Figma Token 依赖** - 需要用户自己创建和管理 Figma API Token
2. **仅支持 Cursor 优化** - 虽然可在其他 MCP 客户端使用，但主要优化 Cursor
3. **无可视化界面** - 纯 CLI 工具，无 GUI
4. **复杂设计处理有限** - 对于非常复杂的 Figma 文件可能效果有限

---

## 十一、总结与建议

### 核心价值

Figma-Context-MCP 解决了 AI 编程助手与 Figma 设计之间的**数据鸿沟**问题，让 AI 能够：

- 直接读取设计数据而非仅看截图
- 理解布局、样式、组件关系
- 生成更准确、更符合设计的代码

### 适用场景

| 场景         | 推荐度     | 说明         |
| ------------ | ---------- | ------------ |
| 快速原型开发 | ⭐⭐⭐⭐⭐ | 最佳场景     |
| 设计系统建设 | ⭐⭐⭐⭐   | 有效辅助     |
| 复杂交互实现 | ⭐⭐⭐     | 需要人工调整 |
| 遗留项目迁移 | ⭐⭐       | 需要适配     |

### 使用建议

1. **配合 Cursor Agent 模式使用** - 效果最佳
2. **准备好 Figma API Token** - 提前在 Figma 账户设置中创建
3. **从简单设计开始** - 逐步测试复杂设计
4. **结合人工审查** - AI 生成代码后仍需人工检查调整
5. **关注官方文档** - https://www.framelink.ai/docs

---

## 参考链接

- **GitHub**: https://github.com/GLips/Figma-Context-MCP
- **NPM**: https://www.npmjs.com/package/figma-developer-mcp
- **文档**: https://www.framelink.ai/docs
- **演示视频**: https://youtu.be/6G9yb-LrEqg
- **Discord**: https://framelink.ai/discord
- **MCP 协议**: https://modelcontextprotocol.io

---

_报告生成时间：2026-03-25_  
_调研工具：OpenClaw + ai-search_
