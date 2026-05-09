---
title: OpenCLI
date: 2026-03-31 11:00:00
tags:
  - cli
  - ai-agent
draft: false
description: OpenCLI 是一个革命性的 CLI 工具，能够让任何网站、Electron 应用或本地工具成为你的 CLI。
source: https://github.com/jackwener/opencli
---

**OpenCLI** 是一个革命性的 CLI 工具，其核心使命是：

> **让任何网站、Electron 应用或本地工具成为你的 CLI**

### 项目数据

| 指标        | 数值                 |
| ----------- | -------------------- |
| ⭐ Stars    | 6.5K                 |
| 🍴 Forks    | 528                  |
| 📦 NPM 包名 | `@jackwener/opencli` |
| 🔤 主要语言 | TypeScript           |
| 📄 许可证   | Apache-2.0           |
| 🏢 维护者   | jackwener            |

### 核心定位

- **Universal CLI Hub**：通用 CLI 中心和 AI 原生运行时
- **AI-Native**：专为 AI Agent 设计，支持通过 `AGENT.md` 自动发现和学习工具
- **Zero Risk**：复用 Chrome 登录态，凭证永不离开浏览器

---

## 二、核心功能与特性

### 1. 主要能力

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OpenCLI 架构                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐     ┌──────────────┐     ┌─────────────────┐   │
│   │   AI Agent   │────▶│   OpenCLI    │────▶│  Chrome Browser │   │
│   │  (Cursor等)  │     │   Runtime    │     │  (CDP Bridge)   │   │
│   └──────────────┘     └──────────────┘     └─────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    Adapter Registry                         │  │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │  │
│   │  │  YAML    │ │   TS     │ │  Built-in│ │  External CLI  │ │  │
│   │  │ Adapters │ │ Adapters │ │ Commands │ │   (gh/docker)  │ │  │
│   │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. 核心特性

| 特性                     | 说明                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| 🌐 **网站转 CLI**        | 将任何网站（Bilibili、知乎、小红书、Twitter 等）转为 CLI 命令       |
| 🖥️ **Electron 应用控制** | 支持控制 Cursor、ChatGPT、Notion 等桌面应用                         |
| 🔒 **账号安全**          | 复用 Chrome 登录态，凭证不离开浏览器                                |
| 🤖 **AI Agent 就绪**     | `explore` 发现 API，`synthesize` 生成适配器，`cascade` 查找认证策略 |
| 🔧 **自修复设置**        | `opencli doctor` 诊断并自动启动守护进程、扩展和浏览器连接           |
| 📦 **动态加载器**        | 将 `.ts` 或 `.yaml` 适配器放入 `clis/` 文件夹自动注册               |
| ⚙️ **双引擎架构**        | 支持 YAML 声明式数据管道和浏览器运行时 TypeScript 注入              |

---

## 三、技术架构

### 1. 项目结构

```
opencli/
├── src/
│   ├── main.ts           # 主入口
│   ├── cli.ts            # CLI 命令处理
│   ├── discovery.ts      # 适配器发现
│   ├── completion.ts     # 自动补全
│   ├── hooks.ts          # 生命周期钩子
│   └── clis/             # 内置适配器
│       ├── bilibili.yaml
│       ├── zhihu.yaml
│       ├── twitter.ts
│       └── ...
├── extension/            # Chrome 浏览器扩展
├── scripts/              # 构建脚本
├── tests/                # 测试文件
└── docs/                 # 文档
```

### 2. 核心技术栈

| 类别                 | 技术               |
| -------------------- | ------------------ |
| **运行时**           | Node.js >= 20.0.0  |
| **语言**             | TypeScript 5.0+    |
| **CLI 框架**         | Commander.js       |
| **配置解析**         | js-yaml            |
| **WebSocket**        | ws (用于 CDP 通信) |
| **HTML 转 Markdown** | Turndown           |
| **文档**             | VitePress          |
| **测试**             | Vitest             |

### 3. 关键架构组件

#### Browser Bridge 架构

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│   OpenCLI CLI   │ ◄────────────────► │ Chrome Extension │
│   (Node.js)     │    (CDP Protocol)  │ (Content Script) │
└─────────────────┘                    └──────────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Target Website│
                                       │ (Logged in)   │
                                       └──────────────┘
```

#### 双引擎架构

- **YAML 声明式**：定义数据提取管道，适合结构化数据
- **TypeScript 运行时**：浏览器注入脚本，适合复杂交互

---

## 四、使用方法

### 1. 安装

```bash
# 全局安装
npm install -g @jackwener/opencli

# 设置（配置浏览器扩展）
opencli setup
```

### 2. 基本使用

```bash
# 查看所有命令
opencli list

# 查看 YAML 格式
opencli list -f yaml

# 公共 API（无需浏览器）
opencli hackernews top --limit 5

# 浏览器命令（需登录）
opencli bilibili hot --limit 5
opencli zhihu hot -f json
opencli twitter trending -f yaml
```

### 3. 为 AI Agent 配置

在 `AGENT.md` 或 `.cursorrules` 中添加：

```markdown
## 工具使用

当需要与外部网站交互时，使用 OpenCLI：

1. 运行 `opencli list` 发现可用工具
2. 使用 `opencli <tool> <command>` 执行操作
3. 支持 `-f json` 或 `-f yaml` 获取结构化输出

例如：

- 获取 Bilibili 热门：`opencli bilibili hot --limit 10 -f json`
- 搜索 Twitter：`opencli twitter search "AI news" -f json`
```

---

## 五、内置命令列表

### 支持的平台（部分）

| 平台            | 命令                                                           | 模式     |
| --------------- | -------------------------------------------------------------- | -------- |
| **twitter**     | trending, bookmarks, profile, search, timeline, post, reply... | Browser  |
| **reddit**      | hot, frontpage, search, subreddit, upvote, save...             | Browser  |
| **cursor**      | status, send, read, composer, model, screenshot...             | Desktop  |
| **bilibili**    | hot, search, me, favorite, history, feed...                    | Browser  |
| **codex**       | status, send, read, extract-diff, ask...                       | Desktop  |
| **notion**      | status, search, read, new, write, export...                    | Desktop  |
| **xiaohongshu** | search, notifications, feed, user, publish...                  | Browser  |
| **zhihu**       | hot, search, question, download                                | Browser  |
| **youtube**     | search, video, transcript                                      | Browser  |
| **hackernews**  | top, new, best, ask, show, jobs                                | Public   |
| **douban**      | search, top250, subject, reviews                               | Browser  |
| **github**      | 通过外部 CLI                                                   | External |

---

## 六、核心代码解析

### 1. 主入口 (main.ts)

```typescript
#!/usr/bin/env node
/**
 * opencli — Make any website your CLI. AI-powered.
 */

import { discoverClis, discoverPlugins } from "./discovery.js"
import { runCli } from "./cli.js"

const BUILTIN_CLIS = path.resolve(__dirname, "clis")
const USER_CLIS = path.join(os.homedir(), ".opencli", "clis")

// 发现内置和用户自定义适配器
await discoverClis(BUILTIN_CLIS, USER_CLIS)
await discoverPlugins()

// 运行 CLI
runCli(BUILTIN_CLIS, USER_CLIS)
```

### 2. Adapter 示例 (YAML)

```yaml
# bilibili.yaml
name: bilibili
description: Bilibili video platform
commands:
  hot:
    description: Get hot videos
    params:
      limit:
        type: number
        default: 10
    output: json
    # 定义如何提取数据
    extractor:
      url: https://www.bilibili.com
      selector: .video-card
      fields:
        title: .title
        author: .author
        views: .play-count
```

### 3. Adapter 示例 (TypeScript)

```typescript
// twitter.ts
export default {
  name: "twitter",
  commands: {
    async search({ query, limit = 10 }, { page }) {
      await page.goto(`https://twitter.com/search?q=${encodeURIComponent(query)}`)
      const tweets = await page.$$eval("article", (articles) =>
        articles.slice(0, limit).map((a) => ({
          text: a.innerText,
          author: a.querySelector('[data-testid="User-Names"]')?.innerText,
        })),
      )
      return { tweets }
    },
  },
}
```

---

## 七、竞品对比

### 与同类工具的比较

| 工具            | 方法                   | 最佳场景                               |
| --------------- | ---------------------- | -------------------------------------- |
| **opencli**     | 预构建适配器 (YAML/TS) | 确定性站点命令、广泛平台覆盖、桌面应用 |
| **Browser-Use** | LLM 驱动浏览器控制     | 通用 AI 浏览器自动化                   |
| **Crawl4AI**    | 异步网络爬虫           | 大规模数据爬取                         |
| **Firecrawl**   | 爬取 API / 自托管      | 干净的 Markdown 提取                   |
| **Stagehand**   | AI 浏览器框架          | 开发者友好的浏览器自动化               |

### OpenCLI 的优势场景

#### 1. 定时批量数据提取 ✅

```bash
# 每小时获取 Bilibili 热门
opencli bilibili hot -f json
```

- **优势**：一个命令，结构化 JSON 输出，零运行成本
- **对比**：Browser-Use 每次运行需要 LLM 推理，慢且贵

#### 2. AI Agent 站点操作 ✅

```bash
# Agent 搜索 Twitter
opencli twitter search "AI news" -f json
```

- **优势**：确定性命令，秒级响应，Agent 省 Token

#### 3. 认证操作 ✅

- **优势**：复用 Chrome 登录态，无需 OAuth 或 API Key
- **对比**：其他工具需要手动管理凭证

#### 4. 桌面应用控制 ✅

- **优势**：唯一支持控制 Electron 应用的 CLI 工具
- **支持**：Cursor、ChatGPT、Notion、Antigravity 等

#### 5. 探索未知网站 ❌

- **劣势**：仅适用于有预构建适配器的站点
- **建议**：使用 Browser-Use 或 Stagehand

---

## 八、开发指南

### 1. 本地开发

```bash
# 克隆仓库
git clone git@github.com:jackwener/opencli.git
cd opencli

# 安装依赖
npm install

# 构建
npm run build

# 链接全局
npm link

# 测试
npm test
```

### 2. 创建自定义 Adapter

```typescript
// ~/.opencli/clis/my-site.ts
export default {
  name: "my-site",
  description: "My custom site",
  commands: {
    async fetch({ url }, { page }) {
      await page.goto(url)
      const data = await page.evaluate(() => {
        // 自定义提取逻辑
        return document.title
      })
      return { title: data }
    },
  },
}
```

### 3. 调试

```bash
# 诊断问题
opencli doctor

# 测试实时浏览器连接
opencli doctor --live

# 自动修复配置
opencli doctor --fix
```

---

## 九、应用场景

### 1. 数据管道

```bash
# 获取多平台数据并处理
opencli bilibili hot -f json | jq '.[] | {title, author}'
opencli hackernews top -f json | jq '.[] | {title, url}'
```

### 2. AI Agent 工具集成

```javascript
// Agent 可以使用 OpenCLI 作为工具
const result = await exec(`opencli twitter search "${query}" -f json`)
const tweets = JSON.parse(result)
```

### 3. 自动化脚本

```bash
#!/bin/bash
# daily-report.sh
opencli zhihu hot -f json > zhihu.json
opencli bilibili hot -f json > bilibili.json
opencli hackernews top -f json > hn.json
```

### 4. Electron 应用自动化

```bash
# 控制 Cursor IDE
opencli cursor status
opencli cursor send "Generate a React component"
```

---

## 十、优缺点分析

### 优势 ✅

1. **零 Token 成本** - 运行时无 LLM 调用，运行 10,000 次不花钱
2. **确定性输出** - 相同命令，相同输出模式，可管道、可脚本化
3. **广泛覆盖** - 50+ 站点，涵盖全球和中国平台
4. **桌面应用支持** - 唯一支持 Electron 应用 CLI 化的工具
5. **安全** - 凭证复用 Chrome，不存储或传输
6. **AI 原生** - 专为 Agent 设计，支持自动发现和学习

### 劣势 ⚠️

1. **预构建限制** - 仅支持有适配器的站点，无法处理任意网站
2. **浏览器依赖** - 需要 Chrome 运行并登录
3. **扩展安装** - 需要安装 Chrome 扩展
4. **Node.js 版本** - 需要 >= 20.0.0

---

## 十一、总结与建议

### 核心价值

OpenCLI 解决了 AI Agent 与网站/桌面应用集成的核心问题：

1. **标准化接口** - 将任意网站转为标准 CLI 命令
2. **零成本运行** - 无需 LLM 推理，确定性执行
3. **安全认证** - 复用现有浏览器登录态
4. **AI 友好** - 结构化输出（JSON/YAML），易于 Agent 解析

### 适用场景

| 场景          | 推荐度     | 说明                   |
| ------------- | ---------- | ---------------------- |
| 定时数据采集  | ⭐⭐⭐⭐⭐ | 最佳场景               |
| AI Agent 工具 | ⭐⭐⭐⭐⭐ | 省 Token，速度快       |
| 自动化工作流  | ⭐⭐⭐⭐   | Cron/CI 友好           |
| 桌面应用控制  | ⭐⭐⭐⭐⭐ | 独家能力               |
| 探索未知网站  | ⭐⭐       | 不适合，用 Browser-Use |

### 使用建议

1. **作为 Agent 工具集** - 配置 `AGENT.md` 让 AI 自动发现
2. **数据管道** - 结合 `jq` 进行数据处理
3. **定时任务** - 使用 Cron 定时抓取数据
4. **Electron 自动化** - 控制 Cursor、Notion 等工具

---

## 参考链接

- **GitHub**: https://github.com/jackwener/opencli
- **NPM**: https://www.npmjs.com/package/@jackwener/opencli
- **对比文档**: https://github.com/jackwener/opencli/blob/main/docs/comparison.md
- **中文文档**: https://github.com/jackwener/opencli/blob/main/README.zh-CN.md

---

_报告生成时间：2026-03-25_  
_调研工具：OpenClaw + ai-search_
