---
title: 拆解 Codex 智能体循环
description: A technical deep dive into the Codex agent loop, explaining how Codex CLI orchestrates models, tools, prompts, and performance using the Responses API.
source: https://openai.com/index/unrolling-the-codex-agent-loop/
author:
  - "[[Michael Bolin]]"
tags:
  - clippings
  - codex
  - agent
---

[Codex CLI ](https://developers.openai.com/codex/cli) 是我们的跨平台本地软件智能体，旨在安全、高效地在您的机器上运行，并生成高质量、可靠的软件变更。自 4 月份首次发布该 CLI 以来，我们在如何构建世界级软件智能体方面积累了海量经验。为了深入探讨这些见解，本篇是系列文章的第一篇，我们将探索 Codex 运作的各个方面以及辛苦换来的教训。（若想更细致地了解 Codex CLI 是如何构建的，请查看我们的开源代码仓库：https://github.com/openai/codex。如果您想了解更多，我们设计决策中的许多细节都记录在 GitHub 的 issue 和 pull request 中。）

首先，我们将重点关注智能体循环（agent loop），它是 Codex CLI 的核心逻辑，负责编排用户、模型以及模型为执行实质性软件工作而调用的工具之间的交互。我们希望这篇文章能让您清晰地了解我们的智能体（或称“外壳”）在利用大语言模型（LLM）时所扮演的角色。

在我们深入探讨之前，请先简单说明一下术语：在 OpenAI，“Codex” 包含了一系列软件智能体产品，包括 Codex CLI、Codex Cloud 和 Codex VS Code 扩展。本文重点介绍 Codex 驱动（harness），它提供了支撑所有 Codex 体验的核心智能体循环和执行逻辑，并通 Codex CLI 呈现。为了叙述方便，我们将交替使用 “Codex” 和 “Codex CLI” 这两个术语。

## 智能体循环


每个 AI 智能体的核心都是所谓的“智能体循环”。智能体循环的简化示意图如下所示：

![[codex-agent-loop.png]]

首先，智能体获取用户的输入（input），并将其包含在为模型准备的一组文本指令中，这些指令被称为提示词（prompt）。

下一步是通过向模型发送指令并要求其生成响应来查询模型，这一过程被称为推理（inference）。在推理过程中，文本提示词首先被转换为一系列输入 [Token ⁠](https://platform.openai.com/docs/concepts#tokens)——即索引到模型词汇表中的整数。然后，这些 Token 被用于对模型进行采样，从而产生一系列新的输出 Token。

输出 Token 被转换回文本，成为模型的响应。由于 Token 是增量生成的，这种转换可以在模型运行时进行，这就是为什么许多基于大语言模型（LLM）的应用会显示流式输出。在实践中，推理通常被封装在处理文本的 API 之后，从而抽象掉了 Token 化的细节。

作为推理步骤的结果，模型要么 (1) 对用户的原始输入生成最终响应，要么 (2) 请求一个预期由智能体执行的工具调用（例如，“运行 `ls` 并报告输出”）。在第 (2) 种情况下，智能体执行工具调用并将其输出附加到原始提示词中。该输出用于生成一个新的输入，用于重新查询模型；然后智能体可以考虑这些新信息并再次尝试。

这个过程会不断重复，直到模型停止发出工具调用，而是为用户生成一条消息（在 OpenAI 模型中被称为助手消息）。在许多情况下，这条消息会直接回答用户的原始请求，但也可能是给用户的一个后续问题。

由于智能体可以执行修改本地环境的工具调用，其“输出”并不局限于助手消息。在许多情况下，软件智能体的主要输出是它在您的机器上编写或编辑的代码。尽管如此，每一轮对话总是以一条助手消息结束——例如“我添加了您要求的 `architecture.md` ”——这标志着智能体循环中的终止状态。从智能体的角度来看，它的工作已经完成，控制权回到了用户手中。

图中显示的从用户输入到智能体响应的过程被称为一轮对话（在 Codex 中称为一个线程）。尽管这一轮对话可能包含**模型推理和工具调用**之间的多次迭代。每当您向现有对话发送新消息时，对话历史记录都会作为新一轮提示词的一部分包含在内，其中包括前几轮的消息和工具调用：

![[codex-multi-turn-agent-loop.png]]

这意味着随着对话的增长，用于模型采样的提示词长度也会随之增加。这一长度至关重要，因为每个模型都有一个上下文窗口，即单次推理调用所能使用的最大 Token 数量。请注意，该窗口同时包含输入和输出 Token。正如你所能想象的，智能体可能会决定在单轮对话中进行数百次工具调用，这可能会耗尽上下文窗口。因此，上下文窗口管理是智能体的众多职责之一。现在，让我们深入了解 Codex 是如何运行智能体循环的。

## 模型推理

Codex CLI 向 [Responses API ⁠](https://platform.openai.com/docs/api-reference/responses) 发送 HTTP 请求以运行模型推理。我们将探讨信息如何流经 Codex，它利用 Responses API 来驱动智能体循环。

Codex CLI 使用的 Responses API 端点是 [可配置的 ⁠](https://developers.openai.com/codex/config-advanced#custom-model-providers)，因此它可以与任何 [实现了 Responses API 的端点 ⁠](https://www.openresponses.org/) 配合使用：

- 当在 Codex CLI 中 [使用 ChatGPT 登录 ⁠](https://github.com/openai/codex/blob/d886a8646cb8d3671c3029d08ae8f13fa6536899/codex-rs/core/src/model_provider_info.rs#L141) 时，它将 `https://chatgpt.com/backend-api/codex/responses` 用作端点。
- 当 [使用 API 密钥认证 ⁠](https://github.com/openai/codex/blob/d886a8646cb8d3671c3029d08ae8f13fa6536899/codex-rs/core/src/model_provider_info.rs#L143) 与 OpenAI 托管的模型时，它使用 `https://api.openai.com/v1/responses` 作为端点。
- 当使用 `--oss` 运行 Codex CLI 以配合 [ollama 0.13.4+ ⁠](https://github.com/openai/codex/pull/8798) 或 [LM Studio 0.3.39+ ⁠](https://lmstudio.ai/blog/openresponses) 使用 [gpt-oss ⁠](https://openai.com/index/introducing-gpt-oss/) 时，它默认使用在您计算机上本地运行的 `http://localhost:11434/v1/responses` 。
- Codex CLI 可以与由 Azure 等云服务提供商托管的 Responses API 配合使用。

让我们探索 Codex 如何为对话中的首次推理调用创建提示词。

作为最终用户，当你查询 Responses API 时，你不需要逐字指定用于对模型进行采样的提示词。相反，你只需在查询中指定各种输入类型，Responses API 服务器会决定如何将这些信息组织成旨在供模型处理的提示词。你可以将提示词看作是一个“项目列表”；本节将解释你的查询是如何转换为该列表的。

在初始提示词中，列表中的每一项都与一个角色相关联。 `role` 指示相关内容应具有的权重，且为以下值之一（按优先级降序排列）： `system` 、 `developer` 、 `user` 、 `assistant`。

- [`instructions` ⁠](https://platform.openai.com/docs/api-reference/responses/create#responses_create-instructions)：插入到模型上下文中的系统（或开发者）消息。
- [`tools` ⁠](https://platform.openai.com/docs/api-reference/responses/create#responses_create-tools)：模型在生成响应时可能调用的工具列表。
- [`input` ⁠](https://platform.openai.com/docs/api-reference/responses/create#responses_create-input)：给模型的文本、图像或文件输入列表。

在 Codex 中，如果指定了， `instructions` 字段将从 `~/.codex/config.toml` 中的 [`model_instructions_file` ⁠](https://github.com/openai/codex/blob/338f2d634b2360ef3c899cac7e61a22c6b49c94f/codex-rs/core/src/config/mod.rs#L1474-L1483) 读取；否则，将使用 [与模型关联的 `base_instructions` ⁠](https://github.com/openai/codex/blob/338f2d634b2360ef3c899cac7e61a22c6b49c94f/codex-rs/core/src/codex.rs#L279-L288)。特定于模型的指令存储在 Codex 仓库中，并捆绑到 CLI 中（例如 [`gpt-5.2-codex_prompt.md` ⁠](https://github.com/openai/codex/blob/e958d0337e98f6398771917867d7de689dab3b7a/codex-rs/core/gpt-5.2-codex_prompt.md)）。

`tools` 字段是符合 Responses API 定义的架构的工具定义列表。对于 Codex，这包括 Codex CLI 提供的工具、Responses API 提供且应提供给 Codex 的工具，以及用户提供的工具（通常通过 MCP 服务器）：

```json
[
  // Codex's default shell tool for spawning new processes locally.
  {
    "type": "function",
    "name": "shell",
    "description": "Runs a shell command and returns its output...",
    "strict": false,
    "parameters": {
      "type": "object",
      "properties": {
        "command": {"type": "array", "description": "The command to execute", ...},
        "workdir": {"description": "The working directory...", ...},
        "timeout_ms": {"description": "The timeout for the command...", ...},
        ...
      },
      "required": ["command"],
    }
  },
  // Codex's built-in plan tool.
  {
    "type": "function",
    "name": "update_plan",
    "description": "Updates the task plan...",
    "strict": false,
    "parameters": {
      "type": "object",
      "properties": {"plan":..., "explanation":...},
      "required": ["plan"]
    }
  },
  {
    "type": "web_search",
    "external_web_access": false
  },
  // MCP server for getting weather as configured in the
  // user's ~/.codex/config.toml.
  {
    "type": "function",
    "name": "mcp__weather__get-forecast",
    "description": "Get weather alerts for a US state",
    "strict": false,
    "parameters": {
      "type": "object",
      "properties": {"latitude": {...}, "longitude": {...}},
      "required": ["latitude", "longitude"]
    }
  }
]
```

最后，JSON 负载的 `input` 字段是一个项目列表。Codex 在添加用户消息之前，会 [将以下项目插入到 `input` 中 ⁠](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/codex.rs#L1387-L1415)：

1\. 一条带有 `role=developer` 的消息，描述了仅适用于 `tools` 部分中定义的 Codex 提供的 `*shell*` 工具的沙箱。也就是说，其他工具（例如由 MCP 服务器提供的工具）不受 Codex 沙箱保护，并负责执行其自身的护栏。

该消息是基于模板构建的，其中的关键内容源自 Codex CLI 中内置的 Markdown 片段，例如 [`workspace_write.md` ⁠](https://github.com/openai/codex/blob/1fc72c647fd52e3e73d4309c3b568d4d5fe012b5/codex-rs/protocol/src/prompts/permissions/sandbox_mode/workspace_write.md) 和 [`on_request.md` ⁠](https://github.com/openai/codex/blob/1fc72c647fd52e3e73d4309c3b568d4d5fe012b5/codex-rs/protocol/src/prompts/permissions/approval_policy/on_request.md)：

```text
<permissions instructions>
  - description of the sandbox explaining file permissions and network access
  - instructions for when to ask the user for permissions to run a shell command
  - list of folders writable by Codex, if any
</permissions instructions>
```

2\. （可选）一条带有 `role=developer` 的消息，其内容是从用户的 `config.toml` 文件中读取的 `developer_instructions` 值。

3\. （可选）一条带有 `role=user` 的消息，其内容为“用户指令”，这些指令并非源自单个文件，而是 [汇总自多个来源 ⁠](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/project_doc.rs#L37-L42)。通常，更具体的指令会出现在后面：

- `$CODEX_HOME` 中 `AGENTS.override.md` 和 `AGENTS.md` 的内容。
- 在限制范围内（默认为 32 KiB），从 `cwd` 的 Git/项目根目录（如果存在）到 `cwd` 本身，检查其中的每个文件夹：添加 `AGENTS.override.md`、`AGENTS.md` 或 `project_doc_fallback_filenames in config.toml` 指定的任何文件名的内容。
- 如果已配置任何 [技能 ⁠](https://developers.openai.com/codex/skills/)：
  - 关于技能的简短前言。
  - 每个技能的 [技能元数据 ⁠](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/skills/model.rs#L6-L13)。
  - 关于 [如何使用技能 ⁠](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/skills/render.rs#L20) 的章节。

4\. 一条带有 `role=user` 的消息，描述了智能体当前运行的本地环境。这 [指定了当前工作目录和用户的 Shell ⁠](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/environment_context.rs#L51-L71)：

```text
<environment_context>
  <cwd>/Users/mbolin/code/codex5</cwd>
  <shell>zsh</shell>
</environment_context>
```

一旦 Codex 完成了上述所有计算来初始化 `input` ，它就会附加用户消息以开始对话。

前面的示例侧重于每条消息的内容，但请注意， `input` 的每个元素都是一个具有 `type`、[`role` ⁠](https://www.reddit.com/r/OpenAI/comments/1hgxcgi/what_is_the_purpose_of_the_new_developer_role_in/) 和 `content` 的 JSON 对象，如下所示：

```json
{
  "type": "message",
  "role": "user",
  "content": [
    {
      "type": "input_text",
      "text": "Add an architecture diagram to the README.md"
    }
  ]
}
```

一旦 Codex 构建好要发送到 Responses API 的完整 JSON 负载，它就会根据 `~/.codex/config.toml` 中 Responses API 端点的配置方式，发出带有 `Authorization` 标头的 HTTP POST 请求（如果指定了额外的 HTTP 标头和查询参数，也会一并添加）。

当 OpenAI Responses API 服务器收到请求时，它会使用 JSON 按如下方式推导模型的提示词（当然，Responses API 的自定义实现可能会做出不同的选择）：

![[Pasted image 20260211172829.png]]

如你所见，提示词中前三项的顺序是由服务器而非客户端决定的。即便如此，在这三项中，只有系统消息的内容也由服务器控制，因为 `tools` 和 `instructions` 是由客户端决定的。紧随其后的是来自 JSON 负载的 `input` ，以此完成提示词。

现在我们有了提示词，可以开始对模型进行采样了。

发送到 Responses API 的此 HTTP 请求启动了 Codex 对话的第一“轮”。服务器以服务器发送事件 ([SSE ⁠](https://en.wikipedia.org/wiki/Server-sent_events)) 流进行回复。每个事件的 `data` 是一个带有以 `"type"` 开头的 `"type"` 的 JSON 负载，可能如下所示（完整的事件列表可以在我们的 [API 文档 ⁠](https://platform.openai.com/docs/api-reference/responses-streaming) 中找到）：

```text
data: {"type":"response.reasoning_summary_text.delta","delta":"ah ", ...}
data: {"type":"response.reasoning_summary_text.delta","delta":"ha!", ...}
data: {"type":"response.reasoning_summary_text.done", "item_id":...}
data: {"type":"response.output_item.added", "item":{...}}
data: {"type":"response.output_text.delta", "delta":"forty-", ...}
data: {"type":"response.output_text.delta", "delta":"two!", ...}
data: {"type":"response.completed","response":{...}}
```

Codex [消费事件流 ⁠](https://github.com/openai/codex/blob/2a68b74b9bf16b64e285495c1b149d7d6ac8bdf4/codex-rs/codex-api/src/sse/responses.rs#L334-L342)，并将其重新发布为可供客户端使用的内部事件对象。像 `response.output_text.delta` 这样的事件用于支持 UI 中的流式传输，而像 `response.output_item.added` 这样的其他事件则被转换为对象，并追加到 `input` 中，用于后续的 Responses API 调用。

假设对 Responses API 的第一次请求包含两个 `response.output_item.done` 事件：一个带有 `type=reasoning` ，另一个带有 `type=function_call` 。当我们使用工具调用的响应再次查询模型时，这些事件必须体现在 JSON 的 `input` 字段中：

```javascript
[
  /* ... original 5 items from the input array ... */
  {
    "type": "reasoning",
    "summary": [
      "type": "summary_text",
      "text": "**Adding an architecture diagram for README.md**\n\nI need to..."
    ],
    "encrypted_content": "gAAAAABpaDWNMxMeLw..."
  },
  {
    "type": "function_call",
    "name": "shell",
    "arguments": "{\"command\":\"cat README.md\",\"workdir\":\"/Users/mbolin/code/codex5\"}",
    "call_id": "call_8675309..."
  },
  {
    "type": "function_call_output",
    "call_id": "call_8675309...",
    "output": "<p align=\"center\"><code>npm i -g @openai/codex</code>..."
  }
]
```

作为后续查询的一部分，用于对模型进行采样的最终提示词如下所示：

![[Pasted image 20260211172854.png]]

特别要注意的是，旧提示词正是新提示词的前缀。这是有意为之的，因为这使得后续请求更加高效，因为它让我们能够利用提示词缓存（我们将在下一节关于性能的内容中讨论这一点）。

回顾我们关于智能体循环的第一张图表，我们看到在推理和工具调用之间可能会有多次迭代。提示词可能会持续增长，直到我们最终收到一条助手消息，这标志着该轮次的结束：

```text
data: {"type":"response.output_text.done","text": "I added a diagram to explain...", ...}
data: {"type":"response.completed","response":{...}}
```

在 Codex CLI 中，我们将助手消息呈现给用户，并将焦点置于编辑器上，以向用户示意现在轮到他们继续对话了。如果用户做出响应，则上一轮的助手消息以及用户的新消息都必须附加到 Responses API 请求中的 `input` ，以开启新的一轮：

![[Pasted image 20260211172907.png]]

让我们来看看这种不断增长的提示词对性能意味着什么。

## 性能考量


你可能会问自己：“等等，在对话过程中发送给 Responses API 的 JSON 数量，智能体循环难道不是呈二次方增长吗？”你说得没错。虽然 Responses API 确实支持一个可选的 [`previous_response_id` ⁠](https://platform.openai.com/docs/api-reference/responses/create#responses_create-previous_response_id) 参数来缓解这个问题，但 Codex 目前并未使用它，这主要是为了保持请求完全无状态，并支持零数据保留 (ZDR) 配置。

避免使用 `previous_response_id` 简化了 Responses API 提供商的工作，因为它确保了每个请求都是无状态的。这也使得支持选择 [零数据保留 (ZDR) ⁠](https://platform.openai.com/docs/guides/migrate-to-responses#4-decide-when-to-use-statefulness) 的客户变得简单直接，因为存储支持 `previous_response_id` 所需的数据会与 ZDR 产生冲突。请注意，ZDR 客户并不会牺牲从前几轮对话的专有推理消息中获益的能力，因为相关的 `encrypted_content` 可以在服务器上进行解密。（OpenAI 会保留 ZDR 客户的解密密钥，但不会保留其数据。）有关 Codex 支持 ZDR 的相关更改，请参阅 PR [#642 ⁠](https://github.com/openai/codex/pull/642) 和 [#1641 ⁠](https://github.com/openai/codex/pull/1641)。

通常，模型采样的成本在网络流量成本中占据主导地位，这使得采样成为我们优化效率的主要目标。这就是为什么提示词缓存如此重要的原因，因为它使我们能够重用之前推理调用的计算结果。当缓存命中时，模型采样的复杂度是线性的，而不是二次方的。我们的 [提示词缓存 ⁠](https://platform.openai.com/docs/guides/prompt-caching#structuring-prompts) 文档对此进行了更详细的说明：

_只有在提示词中出现精确的前缀匹配时，才可能实现缓存命中。为了实现缓存收益，请将指令和示例等静态内容放在提示词的开头，并将变量内容（如用户特定信息）放在末尾。这也适用于图像和工具，它们在请求之间必须保持一致。_

考虑到这一点，让我们来看看在 Codex 中哪些类型的操作可能会导致“缓存未命中”：

Codex 团队在 Codex CLI 中引入可能损害提示词缓存的新功能时必须保持谨慎。例如，我们最初对 MCP 工具的支持引入了一个 [错误，即我们未能以一致的顺序枚举工具 ⁠](https://github.com/openai/codex/pull/2611)，从而导致缓存未命中。请注意，MCP 工具可能特别棘手，因为 MCP 服务器可以通过 [`notifications/tools/list_changed` ⁠](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#list-changed-notification) 通知即时更改它们提供的工具列表。在漫长的对话过程中响应此通知可能会导致代价高昂的缓存未命中。

在可能的情况下，我们通过向 `input` 追加一条新消息来反映更改，而不是修改之前的消息，以此来处理对话过程中发生的配置更改：

- 如果沙盒配置或审批模式发生变化，我们会 [插入 ⁠](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/codex.rs#L1037-L1057) 一条新的 `role=developer` 消息，其格式与原始 `<permissions instructions>` 项相同。
- 如果当前工作目录发生变化，我们会 [插入 ⁠](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/codex.rs#L1017-L1035) 一条新的 `role=user` 消息，其格式与原始 `<environment_context>` 相同。

我们竭尽全力确保缓存命中以提升性能。我们还必须管理另一个关键资源：上下文窗口。

我们避免耗尽上下文窗口的通用策略是，一旦 Token 数量超过某个阈值，就对对话进行压缩。具体来说，我们用一个新的、更短的、具有对话代表性的项目列表替换 `input` ，使智能体能够在理解迄今为止发生的事情的情况下继续工作。压缩的早期 [实现 ⁠](https://github.com/openai/codex/pull/1527) 要求用户手动调用 `/compact` 命令，该命令将使用现有对话加上自定义的 [总结 ⁠](https://github.com/openai/codex/blob/e2c994e32a31415e87070bef28ed698968d2e549/SUMMARY.md) 指令来查询 Responses API。Codex 将包含总结的生成助手消息作为后续对话轮次的 [新 `input` ⁠](https://github.com/openai/codex/blob/e2c994e32a31415e87070bef28ed698968d2e549/codex-rs/core/src/codex.rs#L1424)。

自那时起，Responses API 已演进为支持一个特殊的 [/responses/compact 端点 ⁠](https://platform.openai.com/docs/guides/conversation-state#compaction-advanced)，能够更高效地执行压缩。它返回 [一个项目列表 ⁠](https://platform.openai.com/docs/api-reference/responses/compacted-object)，可用于替代之前的 `input` 以继续对话，同时释放上下文窗口。该列表包含一个特殊的 `type=compaction` 项目，其中带有一个不透明的 `encrypted_content` 项目，用以保留模型对原始对话的潜在理解。现在，当超过 [`auto_compact_limit` ⁠](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/codex.rs#L2558-L2560) 时，Codex 会自动使用该端点来压缩对话。

## 接下来

我们已经介绍了 Codex 智能体循环，并详细讲解了 Codex 在查询模型时如何构建和管理其上下文。在此过程中，我们强调了适用于任何在 Responses API 之上构建智能体循环的开发者的实际考量和最佳实践。

虽然智能体循环为 Codex 奠定了基础，但这仅仅是个开始。在接下来的文章中，我们将深入探讨 CLI 的架构，探索工具使用的实现方式，并近距离观察 Codex 的沙箱模型。
