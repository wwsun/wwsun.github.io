---
title: OpenCode 2.0
description: OpenCode 2.0 发布公告——统一后台服务、全新 API、Code Mode、后台子智能体、插件体系与 SDK
tags:
  - translation
  - ai-agent
  - coding-agent
  - developer-tools
source: https://anoma.ly/notes/opencode-2-0/
date: 2026-10-16
author: Anomaly
---

## OpenCode 2.0

> **原文**：[OpenCode 2.0](https://anoma.ly/notes/opencode-2-0/) | 来源：anoma.ly

## 📝 摘要

OpenCode 2.0 是一次大幅重构，基于数百万日活用户的使用经验，目标是打造能灵活适配智能体各种需求的体系。核心变化：服务端默认以单一后台进程运行，TUI / Web / 桌面端共享同一中央进程；从零重写 API，并让 OpenCode 能感知并调用自身 API；引入 Code Mode（内置极简 JS 解释器，把 MCP 服务端 / OpenAPI 端点转为可调用的函数，一次往返完成多步工具调用）；新增后台子智能体与后台 shell 命令；将几乎所有功能改为内部插件实现（80+），并支持全量热重载；提供 @opencode/sdk 以便作为库嵌入。升级需注意三处破坏性变更。

## 📋 术语表

| 英文                 | 中文              | 说明                                        |
| -------------------- | ----------------- | ------------------------------------------- |
| harness              | 编排框架 / 驾驭层 | 承载并编排智能体的基础设施层                |
| client/server model  | 客户端/服务端模型 | 前端与核心逻辑分离的架构                    |
| TUI                  | 终端用户界面      | Terminal User Interface                     |
| git worktree         | git 工作树        | 同一仓库下的多个独立工作目录                |
| codemode / Code Mode | 代码模式          | 让智能体直接编写脚本调用工具的机制          |
| MCP                  | 模型上下文协议    | Model Context Protocol，工具/上下文接入协议 |
| OpenAPI              | OpenAPI           | REST API 描述规范                           |
| subagent             | 子智能体          | 由主智能体派生出的执行单元                  |
| Durable Objects      | Durable Objects   | Cloudflare 的持久化有状态计算单元           |
| hot-reload           | 热重载            | 不重启进程即可加载新代码                    |
| Effect               | Effect            | TypeScript 函数式效果系统（库名，保留原文） |
| round trip           | 往返              | 一次请求-响应交互                           |

---

## 正文（双语对照）

OpenCode 2.0 is a major overhaul. It draws on millions of daily users' experience to deliver a system that can flex to everything an agent needs to be. There are quite a lot of new features, performance improvements, and bug fixes but here are some of the more impactful user-facing changes.

OpenCode 2.0 是一次大改版。它汲取了数百万日活用户的使用经验，打造出一个能灵活适配智能体所需一切的体系。新特性、性能优化与缺陷修复数量可观，下文列出其中对用户影响最大的几项。

### The Service

From the beginning OpenCode adopted a client/server model. However, this was not something it took advantage of by default and was mostly used by power users.

OpenCode 从一开始就采用了客户端/服务端模型。但默认情况下它并未真正利用这一点，主要是高级用户在用。

In 2.0 this server now automatically runs as a single background process on your machine. When you open up a TUI, the web interface or the desktop app they're all talking to the same central process.

在 2.0 中，这个服务端现在会作为单个后台进程自动运行在你的机器上。无论你打开 TUI、Web 界面还是桌面应用，它们都在与同一个中央进程通信。

If you're using the programmatic client `@opencode/client` to make your own scripts, they will autodiscover the local service and just work. This is particularly useful for scheduled tasks. You can also call it via CLI by using `opencode api` commands.

如果你用编程客户端 `@opencode/client` 编写自己的脚本，它们会自动发现本地服务并直接可用——这对定时任务尤其有用。你也可以通过 CLI，用 `opencode api` 相关命令来调用它。

You can expose it to other hosts and run `/pair` or `opencode pair` to connect it to other applications. We have native apps in the works that take advantage of this flow.

你还可以把它暴露给其他主机，运行 `/pair` 或 `opencode pair` 即可将其连接到别的应用。我们正在开发利用这一流程的原生应用。

### The API

The old API grew haphazardly as we and the world collectively learned what agents are and should be. It was bad.

旧的 API 是在我们和整个世界共同摸索「智能体是什么、应该是什么」的过程中杂乱生长起来的。它很糟糕。

We started from scratch and examined all the weird use cases across the millions of users who use OpenCode every day. It now supports nearly anything you need to be able to do.

我们从零重写，并逐一考察了每天使用 OpenCode 的数百万用户那些千奇百怪的使用场景。如今它几乎支持你需要做的一切。

OpenCode is also aware of its own API and will call it to do useful things like moving the current session into a git worktree when starting new work.

OpenCode 还「知道」自己的 API，会主动调用它来完成一些有用的事，比如在开始新工作时把当前会话迁入一个 git worktree。

> （原文示例：用户让 OpenCode「在新的 worktree 里开始限流上传」，OpenCode 依次调用自身 API ——
> `opencode.worktree_create [name=rate-limit]`、`opencode.session_rename`、`opencode.session_move`；
> 以及「停掉卡住的会话、隔离该测试、关掉已完成的标签页」时调用
> `opencode.session_list` / `session_context` / `session_interrupt` / `session_prompt` / `tab_close`。）

We've also shipped a new client package `@opencode/client` that contains clients for vanilla JavaScript as well as Effect.

我们还发布了新的客户端包 `@opencode/client`，其中既有原生 JavaScript 客户端，也有 Effect 客户端。

```ts
// review.ts
import { OpenCode } from "@opencode/client"
import { Service } from "@opencode/client/service"

const endpoint = await Service.ensure()
const client = OpenCode.make({
  baseUrl: endpoint.url,
  headers: Service.headers(endpoint),
})

const session = await client.session.create({
  location: { directory: process.cwd() },
})

await client.session.prompt({
  sessionID: session.id,
  text: "Review the current changes",
})
```

### Code Mode

The models love to write code and OpenCode 2.0 takes advantage of that more than any other coding agent. We've built a minimal JavaScript interpreter in the `@opencode/codemode` package.

模型酷爱写代码，而 OpenCode 2.0 比其他任何编程智能体都更充分地利用了这一点。我们在 `@opencode/codemode` 包里实现了一个极简的 JavaScript 解释器。

> （原文示例：用户让 OpenCode「把 GitHub 上的 bug 提到 Linear」，Code Mode 中用脚本一次完成 ——
> 先 `search({ query: "list github issues" })` 与 `search({ query: "create linear issue" })`，
> 再用 `tools.github.list_issues(...)` 拉取 issue，`tools.linear.save_issue(...)` 逐个建单，
> 返回 `["OC-412", "OC-413", "OC-414"]`。）

This package ingests MCP servers or OpenAPI endpoints, converting them into functions that the agent can call in a script. It can run these scripts natively without the complexity of Node.js VMs or embedding complicated solutions like QuickJS.

这个包会读取 MCP 服务端或 OpenAPI 端点，把它们转换成智能体可在脚本中调用的函数。它能原生运行这些脚本，既没有 Node.js 虚拟机那样的复杂性，也不必嵌入 QuickJS 这类复杂方案。

This lets your agent write scripts that can do things like call a tool, map over the results and call another tool. Single round trip instead of calling them one at a time.

这让智能体可以编写脚本，完成诸如「调用工具 → 遍历结果 → 再调用另一个工具」这类操作——一次往返搞定，而不必逐个调用。

All MCP servers in 2.0 are opted into codemode by default. This means you can add a thousand of them with minimal context bloat and your agent will discover and compose them to get things done.

2.0 中所有 MCP 服务端默认都启用 codemode。这意味着你哪怕加了一千个，上下文膨胀也极小，智能体会自行发现并组合它们来完成任务。

### Background Tasks

The latest batch of models are incredibly good at orchestration and it is important for harnesses to let them express the full extent of that capability.

最新一批模型在编排方面强得惊人，而编排框架让它们充分发挥这项能力十分重要。

> （原文示例：用户说「起一个后台 fable 子智能体来审查这段代码」，主智能体继续接受指令，
> 后台并行跑 `bun test`（148 个用例通过）与 `bun run build`，并按 `ctrl+b` 把运行中的工作转入后台。）

First, we've added background subagents. This allows the primary agent to kick off some work to another one while it continues.

首先，我们加入了后台子智能体。主智能体可以把一些工作甩给另一个智能体，同时自己继续干活。

This happens automatically but you can also trigger it manually - even with a different model. It lets you do things like "spawn a background fable subagent to review this code" while you keep prompting.

这个过程会自动发生，但你也可以手动触发——甚至可以指定不同的模型。它让你能一边继续下指令，一边说「起一个后台 fable 子智能体来审查这段代码」。

Second, we've added background shell commands. The shell tool can be invoked asynchronously so long-running work does not have to block the primary agent. It'll be notified when things are complete.

其次，我们加入了后台 shell 命令。shell 工具可以异步调用，这样耗时很长的工作就不必阻塞主智能体；完成时它会收到通知。

If any foreground shell command or subagent takes longer than you expect, you can hit a hotkey to move them to the background so you can keep prompting.

如果任何前台 shell 命令或子智能体耗时超出预期，你可以按一个热键把它们挪到后台，从而继续下指令。

### Plugins

Although OpenCode 1.0 had a plugin system, it never got the attention it needed. To correct that, we forced ourselves to implement nearly every OpenCode 2.0 feature as an internal plugin and there are now 80+ of them. This guarantees that the Plugin API stays well maintained.

尽管 OpenCode 1.0 就有插件系统，但它一直没得到应有的重视。为纠正这一点，我们强迫自己把 OpenCode 2.0 的几乎所有功能都以内部插件的形式实现，如今已有 80 多个。这保证了 Plugin API 始终得到良好维护。

We've also promoted TUI plugins from experimental to stable. Since it is all powered by OpenTUI, you can build nearly anything. Here is an example of something useless.

我们还将 TUI 插件从实验性提升为稳定。由于一切都由 OpenTUI 驱动，你几乎能构建任何东西。这里有一个「没什么用」的示例。

We also spent quite a lot of time ensuring everything in OpenCode 2.0 can be hot-reloaded. So it can write a plugin for itself mid-session and use it right away - we covered the design of this in a previous blogpost.

我们还花了大量时间确保 OpenCode 2.0 里的一切都能热重载。因此它能在会话进行中给自己写一个插件并立刻使用——我们在此前的一篇博客里讲过这套设计。

You can ask OpenCode to build whatever plugin you want and it knows how to. But if you do want to read the docs, they are available here.

你可以让 OpenCode 构建你想要的任何插件，它知道该怎么做。如果你确实想读文档，可以在这里找到。

### The SDK

OpenCode can also now be used as a library with the `@opencode/sdk` package. This is the exact same code that powers our CLI.

现在 OpenCode 还可以通过 `@opencode/sdk` 包当作库来使用。这正是驱动我们 CLI 的同一份代码。

This means you can strip it down and make your own flavor of OpenCode that runs on a server or in specialized environments like Durable Objects. And then you can connect to it from any OpenCode client since it speaks the standard OpenCode server protocol.

这意味着你可以把它裁剪一番，做出你自己的 OpenCode 版本，跑在服务器上或像 Durable Objects 这样的专用环境里。之后你可以用任何 OpenCode 客户端连接它，因为它说的是标准的 OpenCode 服务端协议。

It also has an optional Effect-based API.

它还提供了一个可选的、基于 Effect 的 API。

This one is still in development as things are shifting but you can already use it.

这一项仍在开发中、还在变动，但你已经可以用了。

### Upgrading

To upgrade the CLI, make sure you're on the latest 1.x release, then run `opencode upgrade --major`.

升级 CLI：请先确保你在最新的 1.x 版本上，然后运行 `opencode upgrade --major`。

To upgrade your desktop app, download the latest here.

升级桌面应用：在此处下载最新版。

There are some breaking changes.

有一些破坏性变更：

- 1.0 plugins will not work in 2.0
  —— 1.0 的插件在 2.0 中无法使用
- Server API is completely different
  —— 服务端 API 完全不同
- `tui.json` config is moved to json
  —— `tui.json` 配置迁移到 json

There are a lot of other changes but they are backwards compatible. It is worth pointing OpenCode at this doc so it can migrate things for you.

还有许多其他改动，但它们向后兼容。值得把这份文档喂给 OpenCode，让它替你完成迁移。

---

> **译者注**：本文配有多处交互式演示（终端 / Web / 桌面端界面、会话面板、抽屉锁密码小游戏等），为纯视觉/交互组件，翻译中以方括号括注概括其内容，未逐字复刻。
