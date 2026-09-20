---
title: 为 Claude Agent SDK 添加持久化记忆
description: Mem0 解析 Claude Agent SDK 的会话状态边界，并展示如何通过外部记忆层实现跨会话的用户个性化上下文
tags:
  - clippings
  - ai-agent
  - memory
  - claude-agent-sdk
  - mem0
source: https://mem0.ai/blog/persistent-memory-for-claude-agents-sdk
created: 2026-07-07
---

## 为 Claude Agent SDK 添加持久化记忆

> 原文：[Persistent Memory for Claude Agents SDK](https://mem0.ai/blog/persistent-memory-for-claude-agents-sdk) 作者：Mem0 团队

Claude Agent SDK 是开源的（`github.com/anthropics/claude-agent-sdk-python`），为开发者提供了驱动 Claude Code 的同一套智能体循环的程序化访问能力。在单个会话（session）内，SDK 会记录智能体所做的一切。

但在跨会话场景中，这些状态并不会自动为每个用户保留。理解这条边界，是构建"能记住"的智能体的起点。

### Claude Agent SDK 是什么

SDK（`pip install claude-agent-sdk` / `npm install @anthropic-ai/claude-agent-sdk`）将 Claude 的智能体能力封装为可编程的 Python 和 TypeScript 接口。它在开发者自己的进程中运行智能体循环，让团队完全掌控执行环境、工具权限和会话处理。

SDK 内置了一套智能体可自主调用的工具，按用途分组：

- **文件与代码**：`Read`、`Write`、`Edit`、`Glob`、`Grep`
- **执行**：`Bash`
- **Web**：`WebSearch`、`WebFetch`
- **交互**：`Monitor`、`AskUserQuestion`

开发者通过 `ClaudeAgentOptions(allowed_tools=[...])` 选择每次调用可用的工具。智能体循环会自动处理工具执行，无需开发者编写编排代码。

SDK 支持在智能体生命周期关键节点触发的钩子（hooks）：

- **工具事件**：`PreToolUse`、`PostToolUse`、`PostToolUseFailure`
- **智能体生命周期**：`Stop`、`SubagentStart`、`SubagentStop`、`PreCompact`
- **会话事件**：`UserPromptSubmit`、`Notification`、`PermissionRequest`

子智能体（Subagents）允许主智能体派生专门的子智能体，通过 `AgentDefinition(description=..., prompt=..., tools=[...])` 定义。MCP 服务器则通过 Model Context Protocol 将智能体连接到外部系统。

### 会话状态的工作原理

SDK 通过 `SessionStore` 接口追踪会话内的对话历史。一次运行中发生的一切——用户提示词、每一次工具调用、每一次工具结果、每一次模型响应——都会累积为会话状态。智能体拥有当前会话中所有上下文的完整视野：它读过的文件、做过的分析、达成的决策，全部可追溯。

内置实现是 `InMemorySessionStore`。SDK 明确标注这不适合生产环境，因为进程退出时所有会话状态都会丢失。生产部署需要开发者基于持久化存储实现 `SessionStore` 协议；SDK 提供了文件存储、Redis、PostgreSQL 和 S3 的示例实现。

会话连续性通过 `resume` 选项实现。每次运行结束时，`ResultMessage` 会返回一个会话 ID。将该 ID 传入下一次调用，就能从上次断点无缝恢复对话。

在单个会话内，智能体不会重复读取已检查过的文件，不会重复已执行的分析，也不会在任务中途丢失推理链。会话状态在这方面处理得很好。

### 会话状态覆盖不了什么

会话状态以会话 ID 为键，而不是以触发的人为键。SDK 的会话模型中没有用户身份层。两个开发者使用同一个智能体时，各自的状态累加在不同的会话中，但任何一个会话都不知道另一个开发者的偏好、模式或历史。

更重要的是，同一用户的不同会话之间状态不互通。开发者在周一告诉智能体：偏好函数级 docstring，不喜欢行内注释。智能体在这次会话中会一直遵守这个规则。周二，开发者新建一个会话——那个偏好消失了，智能体对此毫无记录。

![Session State vs Persistent Memory](https://framerusercontent.com/images/zNFUiNNiD8VeSD6QTdS9HK6fiKs.png)

这并非 SDK 设计缺陷。会话状态的设计目标是"记录一次运行中发生的事"，而不是"跨运行构建用户画像"。这两者是不同的关注点，SDK 刻意只解决其中一种。

### 规模化场景下的缺口

会话状态与持久化用户上下文之间的边界，在实际部署中很快会暴露出来。

一个编程智能体部署到整个工程团队：开发者 A 偏好类型标注和 dataclass，开发者 B 偏好最简注释和直接命名。这两种偏好都没有被存储，每个会话都是白板开局。即便用了好几个月，智能体也无法适应不同开发者的风格。

一个开发者日复一日用同一个智能体做代码审查：到第三周，智能体对这位开发者的代码风格、项目约定、常关注的循环问题依然毫无积累。每个会话都像初次见面。

缺失的核心是：**跨会话持久保存、并在每次新会话开始时自动检索的用户专属上下文**。

**会话状态 vs. 持久化用户记忆**

| 维度           | SDK 会话状态                    | 持久化用户记忆         |
| -------------- | ------------------------------- | ---------------------- |
| 作用范围       | 单会话、单进程                  | 跨会话、跨进程         |
| 用户区分       | 无，以会话 ID 为键              | 通过用户标识区分       |
| 内置持久化     | 否（默认 InMemorySessionStore） | 是（外部存储）         |
| 进程退出后存活 | 仅当接入自定义 SessionStore     | 是                     |
| 检索方式       | 加载完整会话上下文              | 相关性排序的语义搜索   |
| 最佳适用场景   | 运行内连续性                    | 跨会话的用户专属上下文 |

### 局限性

可插拔的 `SessionStore` 模型将运维负担推给了开发者。接入 Redis 或 PostgreSQL 会话存储需要的基础设施工作超出了 SDK 本身的范围。内置的 `InMemorySessionStore` 在开发和测试阶段够用，但如果不注意这个区分，生产环境就会出问题。

添加持久化记忆层会在会话启动和结束时引入延迟；搜索和检索都是网络调用。对于时延敏感的应用，这笔开销需要衡量并做好预算。

用户专属记忆的质量取决于产生它的交互质量。模糊或低信息量的对话产生的是低质量的存储上下文。当用户的偏好在跨会话中发生变化时，没有自动机制来处理矛盾；这需要在应用层面解决。

### Mem0 的定位

Mem0 提供了一个与 SDK 会话状态并行的持久化、用户专属记忆层。每次智能体运行结束时，相关对话内容以用户标识为键进行存储。下一次运行开始时，最相关的已存储上下文被检索出来，在智能体开始工作前注入到提示词中。

![Mem0 Architecture](https://framerusercontent.com/images/nK0VDaNvoZuC3T1NTfBHu2DEtrs.png)

SDK 的会话处理保持不变。Mem0 从外部包裹它，添加了会话状态本身不具备的用户身份和跨会话持久化能力。每个用户的上下文随时间推移愈加完整，底层智能体循环无需任何改动。

### 总结

Claude Agent SDK 在会话状态方面表现良好：在单次运行中，智能体对自己所做的一切了如指掌。但它缺少一个机制来构建"跨会话持久保存并持续增长的"用户专属上下文。Mem0 正是填补这一空白的层——将"每个会话都像初见的"无状态智能体，转变为"与用户相处越久、表现越好"的真正个性化智能体。

---

> **译者注**：Mem0 是一个开源的智能记忆层，专为大语言模型和 AI 智能体设计，提供跨会话的长期、个性化、上下文感知交互能力。免费 API Key 可在 [app.mem0.ai](https://app.mem0.ai/?utm_source=mem0_blog&utm_medium=kw_blog&utm_campaign=how-memory-works-claude-agents-sdk&utm_content=how-memory-works-claude-agents-sdk) 获取；智能体用户可通过 `mem0 init --agent --json` 注册；开源代码在 [GitHub](https://github.com/mem0ai/mem0)。
