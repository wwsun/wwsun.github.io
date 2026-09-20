---
title: Agent Loop 的工作原理
description: 深入解析 Agent SDK 的智能体循环机制，涵盖消息类型、工具执行、上下文窗口、权限控制等核心架构。
tags:
  - clippings
  - agent-sdk
  - claude-code
  - agent-loop
source: https://code.claude.com/docs/en/agent-sdk/agent-loop
created: 2026-07-06
---

## Agent Loop 的工作原理

> 原文：[How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop) 来源：Claude Code Docs

Agent SDK 让你可以将 Claude Code 的自主智能体循环嵌入到自己的应用中。这个 SDK 是独立包，提供对工具、权限、费用限制和输出的编程式控制，无需安装 Claude Code CLI。

当你启动一个智能体时，SDK 会运行与驱动 Claude Code 相同的[执行循环](https://code.claude.com/docs/en/how-claude-code-works#the-agentic-loop)：Claude 评估你的提示词，调用工具执行操作，接收结果，然后重复，直到任务完成。本页解释循环内部发生的一切，帮助你高效构建、调试和优化智能体。

## 循环速览

每个智能体会话都遵循相同的循环：

![Agent Loop 图示](https://mintcdn.com/claude-code/ikqp3_70mqIahteV/images/agent-loop-diagram.svg?fit=max&auto=format&n=ikqp3_70mqIahteV&q=85&s=1c6e8f28d80dba14a7287419656f1237)

1. **接收提示词。** Claude 接收你的提示词，连同系统提示词、工具定义和对话历史。SDK 生成一个 `SystemMessage`，子类型为 `"init"`，包含会话元数据。
2. **评估与响应。** Claude 评估当前状态并决定如何推进。它可以回复文本、请求一个或多个工具调用，或两者兼有。SDK 生成一个 `AssistantMessage`，包含文本和任何工具调用请求。
3. **执行工具。** SDK 运行每个被请求的工具并收集结果。每组工具结果会反馈给 Claude 用于下一个决策。你可以使用[钩子（hooks）](https://code.claude.com/docs/en/agent-sdk/hooks)在工具运行之前拦截、修改或阻止工具调用。
4. **重复。** 步骤 2 和 3 循环重复。每个完整循环为一个 turn。Claude 持续调用工具并处理结果，直到产生一个不含工具调用的响应。
5. **返回结果。** SDK 生成最终的 `AssistantMessage`（仅含文本响应，无工具调用），随后是 `ResultMessage`，包含最终文本、Token 用量、费用和会话 ID。

简单问题（"这里有哪些文件？"）可能只需要一两个 turn，调用 `Glob` 然后回复结果。复杂任务（"重构授权模块并更新测试"）可能会链式调用几十个工具调用跨越多个 turn，Claude 会在每个结果的基础上调整策略。

## Turn 与消息

一个 turn 是循环内的一次往返：Claude 生成包含工具调用的输出，SDK 执行这些工具，结果自动反馈给 Claude。此过程不会把控制权交还给你的代码。Turn 持续进行，直到 Claude 生成不含工具调用的输出，此时循环结束，最终结果被交付。

以提示词"修复 auth.ts 中的失败测试"为例，看看完整会话可能是怎样的：

首先，SDK 将你的提示词发送给 Claude，生成一个 `SystemMessage`（包含会话元数据）。然后循环开始：

1. **Turn 1：** Claude 调用 `Bash` 执行 `npm test`。SDK 生成包含工具调用的 `AssistantMessage`，执行命令，然后生成 `UserMessage`（包含输出：三个失败）。
2. **Turn 2：** Claude 调用 `Read` 读取 `auth.ts` 和 `auth.test.ts`。SDK 返回文件内容并生成 `AssistantMessage`。
3. **Turn 3：** Claude 调用 `Edit` 修复 `auth.ts`，然后调用 `Bash` 重新执行 `npm test`。三个测试全部通过。SDK 生成 `AssistantMessage`。
4. **最终 Turn：** Claude 生成仅文本、无工具调用的响应："已修复授权 bug，三个测试现在全部通过。"SDK 生成最终的 `AssistantMessage` 并附上此文本，然后是 `ResultMessage`，包含相同文本、费用和用量。

总共四个 turn：三个有工具调用，一个仅文本的最终响应。

你可以用 `max_turns` / `maxTurns` 来限制循环，它仅统计工具调用 turn。例如，上面的循环中 `max_turns=2` 会在编辑步骤前停止。你也可以使用 `max_budget_usd` / `maxBudgetUsd` 基于费用阈值来限制 turn。

不加限制时，循环会持续运行直到 Claude 自行完成——这对范围明确的任务没问题，但对开放式提示词（"改进这个代码库"）可能运行很长时间。在生产智能体中设置预算是个好习惯。

## 消息类型

循环运行时，SDK 生成消息流。每条消息都有类型字段，告诉你它来自循环的哪个阶段。五种核心类型：

- **`SystemMessage`：** 会话生命周期事件。`subtype` 字段区分：
  - `"init"`：首条消息，包含会话元数据
  - `"compact_boundary"`：在[上下文压缩](https://code.claude.com/docs/en/agent-sdk/agent-loop#automatic-compaction)后触发
  - `"informational"`：循环中的纯文本状态横幅
  - `"worker_shutting_down"`：由于宿主机退出或远程控制断开，循环将在当前 turn 后结束

  在 TypeScript 中，除 `"init"` 外的每个子类型都是 [`SDKMessage` 联合类型](https://code.claude.com/docs/en/agent-sdk/typescript#sdkmessage)中的独立类型，而非 `SDKSystemMessage` 的子类型。

- **`AssistantMessage`：** 在每次 Claude 响应后发出，包括最终的纯文本响应。包含该 turn 的文本内容块和工具调用块。
- **`UserMessage`：** 在每次工具执行后发出，包含发送回 Claude 的工具结果内容。也会在循环中流式传输的用户输入时发出。
- **`StreamEvent`：** 仅在启用部分消息时发出。包含原始 API 流式事件（文本增量、工具输入块）。参见[流式响应](https://code.claude.com/docs/en/agent-sdk/streaming-output)。
- **`ResultMessage`：** 标记智能体循环的结束。包含最终文本结果、Token 用量、费用和会话 ID。通过 `subtype` 字段判断任务是成功还是触发了限制。少量尾部系统事件（如 `prompt_suggestion`）可能在其后到达，因此应迭代流直到完成，而非在结果上中断。参见[处理结果](https://code.claude.com/docs/en/agent-sdk/agent-loop#handle-the-result)。

这五种类型覆盖了两个 SDK 的完整智能体循环生命周期。TypeScript SDK 还会生成额外的可观测事件（钩子事件、工具进度、速率限制、任务通知），提供更多细节但不是驱动循环所必需的。

### 处理消息

你处理哪些消息取决于你在构建什么：

- **仅最终结果：** 处理 `ResultMessage` 获取输出、费用以及任务是成功还是触发了限制。
- **进度更新：** 处理 `AssistantMessage` 查看 Claude 每个 turn 在做什么，包括调用了哪些工具。
- **实时流式：** 启用部分消息（Python 中为 `include_partial_messages`，TypeScript 中为 `includePartialMessages`）以实时获取 `StreamEvent` 消息。参见[实时流式响应](https://code.claude.com/docs/en/agent-sdk/streaming-output)。

如何检查消息类型取决于 SDK：

- **Python：** 使用 `isinstance()` 对照从 `claude_agent_sdk` 导入的类（例如 `isinstance(message, ResultMessage)`）。
- **TypeScript：** 检查 `type` 字符串字段（例如 `message.type === "result"`）。`AssistantMessage` 和 `UserMessage` 将原始 API 消息包装在 `.message` 字段中，因此内容块在 `message.message.content` 而不是 `message.content`。

## 工具执行

工具赋予智能体采取行动的能力。没有工具，Claude 只能回复文本。有了工具，Claude 可以读取文件、运行命令、搜索代码并和外部服务交互。

### 内置工具

SDK 包含驱动 Claude Code 的同类工具：

| 类别         | 工具                                                            | 功能                                       |
| ------------ | --------------------------------------------------------------- | ------------------------------------------ |
| **文件操作** | `Read`、`Edit`、`Write`                                         | 读取、修改和创建文件                       |
| **搜索**     | `Glob`、`Grep`                                                  | 按模式查找文件，用正则搜索内容             |
| **执行**     | `Bash`                                                          | 运行 Shell 命令、脚本、Git 操作            |
| **Web**      | `WebSearch`、`WebFetch`                                         | 搜索网页、抓取和解析页面                   |
| **发现**     | `ToolSearch`                                                    | 动态发现并按需加载工具，而非预加载全部     |
| **编排**     | `Agent`、`Skill`、`AskUserQuestion`、`TaskCreate`、`TaskUpdate` | 创建子智能体、调用技能、询问用户、追踪任务 |

除了内置工具，你还可以：

- **连接外部服务**通过 [MCP 服务器](https://code.claude.com/docs/en/agent-sdk/mcp)（数据库、浏览器、API）
- **定义自定义工具**通过[自定义工具处理器](https://code.claude.com/docs/en/agent-sdk/custom-tools)
- **加载项目技能**通过[设置来源](https://code.claude.com/docs/en/agent-sdk/claude-code-features)实现可复用工作流

### 工具权限

Claude 根据任务决定调用哪些工具，但你控制这些调用是否被允许执行。你可以自动批准特定工具、完全阻止其他工具或要求全部审批。三个选项协同工作决定了什么可以运行：

- **`allowed_tools` / `allowedTools`** 自动批准列表中的工具。一个只读智能体将 `["Read", "Glob", "Grep"]` 放入允许列表后，这些工具无需提示即可运行。未列出的工具仍可用但需要权限。
- **`disallowed_tools` / `disallowedTools`** 阻止列表中的工具，不受其他设置影响。参见[权限](https://code.claude.com/docs/en/agent-sdk/permissions)了解工具运行前规则的检查顺序。
- **`permission_mode` / `permissionMode`** 控制未被允许或拒绝规则覆盖的工具如何处理。参见[权限模式](https://code.claude.com/docs/en/agent-sdk/agent-loop#permission-mode)了解可用模式。

你还可以用规则（如 `"Bash(npm *)"`）限定单个工具的范围，只允许特定命令。参见[权限](https://code.claude.com/docs/en/agent-sdk/permissions)了解完整规则语法。当工具被拒绝时，Claude 会收到拒绝消息作为工具结果，通常会尝试其他方式或报告无法继续。

### 并行工具执行

当 Claude 在单个 turn 中请求多个工具调用时，两个 SDK 都可以根据工具类型并发或顺序执行它们。只读工具（如 `Read`、`Glob`、`Grep` 和标记为只读的 MCP 工具）可以并发执行。修改状态的工具（如 `Edit`、`Write` 和 `Bash`）顺序执行以避免冲突。自定义工具默认顺序执行。要为自定义工具启用并行执行，在其注解中设置 `readOnlyHint`。[TypeScript](https://code.claude.com/docs/en/agent-sdk/typescript#tool) 和 [Python](https://code.claude.com/docs/en/agent-sdk/python#tool) SDK 都使用来自 MCP SDK 的此字段名。

## 控制循环运行方式

你可以限制循环的 turn 数、费用、Claude 的推理深度以及工具是否需要运行前审批。这些都是 [`ClaudeAgentOptions`](https://code.claude.com/docs/en/agent-sdk/python#claudeagentoptions)（Python）/ [`Options`](https://code.claude.com/docs/en/agent-sdk/typescript#options)（TypeScript）上的字段。

### Turn 与预算

| 选项                                          | 控制内容               | 默认值 |
| --------------------------------------------- | ---------------------- | ------ |
| 最大 Turn（`max_turns` / `maxTurns`）         | 工具调用往返的最大次数 | 无限制 |
| 最大预算（`max_budget_usd` / `maxBudgetUsd`） | 停止前的最大费用       | 无限制 |

当任一限制被触发时，SDK 返回一个带有对应错误子类型的 `ResultMessage`（`error_max_turns` 或 `error_max_budget_usd`）。参见[处理结果](https://code.claude.com/docs/en/agent-sdk/agent-loop#handle-the-result)了解如何检查这些子类型，以及 [`ClaudeAgentOptions`](https://code.claude.com/docs/en/agent-sdk/python#claudeagentoptions) / [`Options`](https://code.claude.com/docs/en/agent-sdk/typescript#options) 了解语法。

### 努力级别

`effort` 选项控制 Claude 投入多少推理深度。低努力级别每次 turn 使用更少的 Token，降低费用。并非所有模型都支持 effort 参数。参见 [Effort](https://platform.claude.com/docs/en/build-with-claude/effort) 了解哪些模型支持。

| 级别       | 行为               | 适用场景                                                       |
| ---------- | ------------------ | -------------------------------------------------------------- |
| `"low"`    | 最少推理，快速响应 | 文件查找、列举目录                                             |
| `"medium"` | 平衡推理           | 日常编辑、标准任务                                             |
| `"high"`   | 深入分析           | 重构、调试                                                     |
| `"xhigh"`  | 扩展推理深度       | 编程和智能体任务；推荐在 Fable 5、Opus 4.7+ 和 Sonnet 5 上使用 |
| `"max"`    | 最大推理深度       | 需要深度分析的多步骤问题                                       |

如果不设置 `effort`，两个 SDK 都会留空该参数，由模型自行决定默认行为。

对简单、范围明确的任务（如列举文件或单个 grep）使用较低级别以减少费用和延迟。在顶层的 `query()` 选项中为整个会话设置 `effort`，或通过 [`AgentDefinition`](https://code.claude.com/docs/en/agent-sdk/subagents#agentdefinition-configuration) 上的 `effort` 字段为每个子智能体覆盖会话级别的设置。

### 权限模式

权限模式选项（Python 中为 `permission_mode`，TypeScript 中为 `permissionMode`）控制智能体在使用工具前是否请求批准：

| 模式                      | 行为                                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"default"`               | 不被允许规则覆盖的工具触发你的批准回调；没有回调等同于拒绝                                                                                                                                                                                                                                                                                      |
| `"acceptEdits"`           | 自动批准文件编辑和常用文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等）；其他 Bash 命令遵循默认规则                                                                                                                                                                                                                                               |
| `"plan"`                  | Claude 探索和规划但不编辑源文件；文件编辑绝不自动批准，通过 `canUseTool` 回调提示                                                                                                                                                                                                                                                               |
| `"dontAsk"`               | 绝不提示。被[权限规则](https://code.claude.com/docs/en/settings#permission-settings)预先批准的工具可运行，其他全部拒绝                                                                                                                                                                                                                          |
| `"auto"`（仅 TypeScript） | 使用模型分类器批准或拒绝每个工具调用。参见[自动模式](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode)了解可用性和行为                                                                                                                                                                                         |
| `"bypassPermissions"`     | 不经询问运行所有允许的工具，除非有明确的 [`ask` 规则](https://code.claude.com/docs/en/settings#permission-settings)匹配；参见[权限评估方式](https://code.claude.com/docs/en/agent-sdk/permissions#how-permissions-are-evaluated)了解 ask 规则在优先级中的位置。在 Unix 上以 root 运行时不可用。仅在智能体行为不影响你关心的系统的隔离环境中使用 |

对于交互式应用，使用 `"default"` 配合工具批准回调来呈现审批提示。对于开发机上的自主智能体，`"acceptEdits"` 自动批准文件编辑和常用文件系统命令（`mkdir`、`touch`、`mv`、`cp` 等），同时其他 `Bash` 命令仍需通过允许规则。将 `"bypassPermissions"` 保留给 CI、容器或其他隔离环境。参见[权限](https://code.claude.com/docs/en/agent-sdk/permissions)了解完整详情。

### 模型

如果不设置 `model`，SDK 使用 Claude Code 的默认值，取决于你的认证方式和订阅。显式设置（例如 `model="claude-sonnet-5"`）以固定特定模型，或使用更小的模型实现更快、更便宜的智能体。参见[模型](https://platform.claude.com/docs/en/about-claude/models)了解可用 ID。

## 上下文窗口

上下文窗口是会话期间 Claude 可用的信息总量，在会话的 turn 之间不会重置。所有内容都会累积：系统提示词、工具定义、对话历史、工具输入和工具输出。跨 turn 保持不变的内容（系统提示词、工具定义、CLAUDE.md）会自动进行[提示词缓存（prompt caching）](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)，为重复前缀降低费用和延迟。

### 什么消耗上下文

以下是 SDK 中各组件如何影响上下文：

| 来源               | 加载时机                                                                                          | 影响                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **系统提示词**     | 每次请求                                                                                          | 较小的固定成本，始终存在                                                                                                                                                                                                                                                                                                  |
| **CLAUDE.md 文件** | 会话开始，通过 [`settingSources`](https://code.claude.com/docs/en/agent-sdk/claude-code-features) | 每次请求都包含完整内容（但已被缓存，仅首次请求支付完整成本）                                                                                                                                                                                                                                                              |
| **工具定义**       | 每次请求；MCP schema 默认延迟加载                                                                 | 内置工具 schema 每次请求加载。[工具搜索](https://code.claude.com/docs/en/agent-sdk/mcp#mcp-tool-search)默认延迟 MCP 工具 schema，在 Google Cloud Agent Platform 或非官方 `ANTHROPIC_BASE_URL` 下回退为预加载。参见[配置工具搜索](https://code.claude.com/docs/en/agent-sdk/tool-search#configure-tool-search)了解完整矩阵 |
| **对话历史**       | 随 turn 累积                                                                                      | 随着每次 turn 增长：提示词、响应、工具输入、工具输出                                                                                                                                                                                                                                                                      |
| **技能描述**       | 会话开始，通过设置来源                                                                            | 简短摘要；完整内容仅在调用时加载                                                                                                                                                                                                                                                                                          |

大型工具输出消耗大量上下文。读取大文件或运行带详细输出的命令，单个 turn 就能消耗数千 Token。上下文跨 turn 累积，因此具有大量工具调用的长会话比短会话累积的上下文显著更多。

### 自动压缩

当上下文窗口接近极限时，SDK 会自动压缩对话：它总结较早的历史以释放空间，同时保留最近的交流和关键决策。SDK 会在流中发出 `type: "system"`、`subtype: "compact_boundary"` 的消息（Python 中为 `SystemMessage`；TypeScript 中为独立的 `SDKCompactBoundaryMessage` 类型）。压缩会用摘要替代较早的消息，因此对话早期的特定指示可能不会保留。持久规则应放在 CLAUDE.md 中（通过 [`settingSources`](https://code.claude.com/docs/en/agent-sdk/claude-code-features) 加载），而不是初始提示词中，因为 CLAUDE.md 内容在每次请求时都会被重新注入。

你可以通过多种方式自定义压缩行为：

- **CLAUDE.md 中的摘要指令：** 压缩器像其他上下文一样读取你的 CLAUDE.md，因此你可以在其中包含一个段落告诉它摘要时要保留什么。段落标题是自由格式的（非固定字符串）；压缩器根据意图匹配。
- **`PreCompact` 钩子：** 在压缩发生前运行自定义逻辑，例如归档完整转录。钩子接收 `trigger` 字段（`manual` 或 `auto`）。参见[钩子](https://code.claude.com/docs/en/agent-sdk/hooks)。
- **手动压缩：** 发送 `/compact` 作为提示词字符串来按需触发压缩。以这种方式发送的命令是 SDK 输入，不是仅 CLI 的快捷方式。参见[SDK 中的命令](https://code.claude.com/docs/en/agent-sdk/slash-commands)。

示例 — CLAUDE.md 中的摘要指令：

在项目的 CLAUDE.md 中添加一个段落告诉压缩器要保留什么。标题名称不特殊，使用任何清晰标签即可。

```
# 摘要指令

当摘要此对话时，始终保留：
- 当前任务目标和验收标准
- 已读取或修改的文件路径
- 测试结果和错误消息
- 已做出的决策及其理由
```

### 保持上下文高效

长运行智能体的几条策略：

- **使用子智能体处理子任务。** 每个子智能体从全新对话开始（无先前消息历史，但会加载自己的系统提示词和项目级上下文如 CLAUDE.md）。它看不到父级的 turn，只有其最终响应作为工具结果返回给父级。主智能体的上下文仅增长该摘要，而非完整子任务转录。参见[子智能体继承什么](https://code.claude.com/docs/en/agent-sdk/subagents#what-subagents-inherit)了解详情。
- **有选择地使用工具。** 每个工具定义都占用上下文空间。使用 [`AgentDefinition`](https://code.claude.com/docs/en/agent-sdk/subagents#agentdefinition-configuration) 上的 `tools` 字段将子智能体限定到它们所需的最小工具集。
- **关注 MCP 服务器成本。** [MCP 工具搜索](https://code.claude.com/docs/en/agent-sdk/mcp#mcp-tool-search)默认延迟 MCP 工具 schema 并按需加载。当工具搜索关闭、在 Google Cloud Agent Platform 上或使用非官方 `ANTHROPIC_BASE_URL` 时，每个 MCP 服务器都将其所有工具 schema 添加到每次请求中，因此拥有大量工具的几个服务器可能在智能体做任何工作之前就消耗大量上下文。
- **对日常任务使用较低努力级别。** 对于只需要读取文件或列举目录的智能体，将 [effort](https://code.claude.com/docs/en/agent-sdk/agent-loop#effort-level) 设为 `"low"`。这减少 Token 用量和费用。

有关每个功能上下文成本的详细分解，参见[理解上下文成本](https://code.claude.com/docs/en/features-overview#understand-context-costs)。

## 会话与连续性

SDK 的每次交互都会创建或继续一个会话。从 `ResultMessage.session_id`（两个 SDK 均可用）获取会话 ID 以供后续恢复。TypeScript SDK 还在初始 `SystemMessage` 上将其作为直接字段暴露；Python 中嵌套在 `SystemMessage.data` 中。恢复时，前面 turn 的完整上下文会被还原：已读取的文件、已执行的分析和已采取的行动。你也可以 fork 一个会话以分支到不同方案而不修改原始会话。参见[会话管理](https://code.claude.com/docs/en/agent-sdk/sessions)了解恢复、继续和 fork 模式的完整指南。

## 处理结果

当循环结束时，`ResultMessage` 告诉你发生了什么并给出输出。`subtype` 字段（两个 SDK 均可用）是检查终止状态的主要方式。

| 结果子类型                            | 发生了什么                                                                                               | `result` 字段可用？ |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------- |
| `success`                             | Claude 正常完成任务                                                                                      | 是                  |
| `error_max_turns`                     | 在完成前达到 `maxTurns` 限制                                                                             | 否                  |
| `error_max_budget_usd`                | 在完成前达到 `maxBudgetUsd` 限制                                                                         | 否                  |
| `error_during_execution`              | 错误中断了循环（例如 API 失败或请求被取消）                                                              | 否                  |
| `error_max_structured_output_retries` | 在配置的重试限制内未产生有效的结构化输出：每次尝试均未通过验证，或模型回退已撤回完成的输出且没有成功重试 | 否                  |

`result` 字段（最终文本输出）仅存在于 `success` 变体上，因此读取前务必先检查子类型。所有结果子类型都携带 `total_cost_usd`、`usage`、`num_turns` 和 `session_id`，因此你可以在错误后追踪费用并恢复。Python 中 `total_cost_usd` 和 `usage` 类型为可选，在某些错误路径上可能为 `None`，格式化前需进行 guard 处理。参见[追踪成本和用量](https://code.claude.com/docs/en/agent-sdk/cost-tracking)了解解读 `usage` 字段的详情。

结果还包含 `stop_reason` 字段（TypeScript 中为 `string | null`，Python 中为 `str | None`），指示模型在最终 turn 停止生成的原因。常见值为 `end_turn`（模型正常完成）、`max_tokens`（达到输出 Token 限制）和 `refusal`（模型拒绝了请求）。在错误结果子类型上，`stop_reason` 携带循环结束前最后一次助手响应的值。检测拒绝时，检查 `stop_reason === "refusal"`（TypeScript）或 `stop_reason == "refusal"`（Python）。参见 [`SDKResultMessage`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkresultmessage)（TypeScript）或 [`ResultMessage`](https://code.claude.com/docs/en/agent-sdk/python#resultmessage)（Python）了解完整类型。

## 钩子（Hooks）

[钩子](https://code.claude.com/docs/en/agent-sdk/hooks)是在循环特定点触发的回调：工具运行前、工具返回后、智能体完成时等。一些常用钩子：

| 钩子                             | 触发时机             | 常见用途               |
| -------------------------------- | -------------------- | ---------------------- |
| `PreToolUse`                     | 工具执行前           | 验证输入、阻止危险命令 |
| `PostToolUse`                    | 工具返回后           | 审计输出、触发副作用   |
| `UserPromptSubmit`               | 提示词发送时         | 向提示词注入额外上下文 |
| `Stop`                           | 智能体完成时         | 验证结果、保存会话状态 |
| `SubagentStart` / `SubagentStop` | 子智能体创建或完成时 | 追踪和聚合并行任务结果 |
| `PreCompact`                     | 上下文压缩前         | 摘要前归档完整转录     |

钩子在你的应用进程中运行，不在智能体的上下文窗口内，因此不消耗上下文。钩子也可以短路循环：一个 `PreToolUse` 钩子拒绝工具调用会阻止其执行，Claude 会收到拒绝消息。两个 SDK 都支持上述所有事件。TypeScript SDK 包含 Python 尚不支持的额外事件。参见[用钩子控制执行](https://code.claude.com/docs/en/agent-sdk/hooks)了解完整事件列表、各 SDK 可用性和完整回调 API。

## 综合示例

以下示例将本页的核心概念组合成一个修复失败测试的智能体。它配置了允许的工具（自动批准以便智能体自主运行）、项目设置以及 turn 和推理努力的安全限制。循环运行时，它捕获会话 ID 以备可能的恢复，处理最终结果，并打印总费用。由于单次 `query()` 调用在生成错误结果后会引发异常，因此循环用 try 块包裹，使脚本在触达限制时干净退出。

## 下一步

现在你理解了循环，以下是按构建目标分类的后续方向：

- **还没运行过智能体？** 从[快速入门](https://code.claude.com/docs/en/agent-sdk/quickstart)开始，安装 SDK 并查看完整示例端到端运行。
- **准备集成到项目？**[加载 CLAUDE.md、技能和文件系统钩子](https://code.claude.com/docs/en/agent-sdk/claude-code-features)，让智能体自动遵循你的项目约定。
- **构建交互式 UI？** 启用[流式输出](https://code.claude.com/docs/en/agent-sdk/streaming-output)，在循环运行时显示实时文本和工具调用。
- **需要更严格的控制？** 用[权限](https://code.claude.com/docs/en/agent-sdk/permissions)锁定工具访问，用[钩子](https://code.claude.com/docs/en/agent-sdk/hooks)审计、阻止或转换工具调用。
- **运行长时或昂贵任务？** 将隔离工作分流到[子智能体](https://code.claude.com/docs/en/agent-sdk/subagents)，保持主上下文精简。

更广泛的智能体循环概念（非 SDK 特定）参见 [Claude Code 的工作原理](https://code.claude.com/docs/en/how-claude-code-works)。

---

> **译者注**：本文详细介绍了 Agent SDK 的核心——智能体循环的工作原理，从消息生命周期、工具执行到上下文管理和权限控制。理解这个循环是高效使用 SDK 构建自主智能体的基础。文中大量内部链接指向 SDK 的各功能文档，建议按需深入阅读。
