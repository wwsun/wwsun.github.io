---
description: 本文将对 Codex 智能体循环进行深度技术剖析，阐述 Codex CLI 如何利用 Responses API 来协调模型、工具、提示，并优化整体性能。
source: https://openai.com/zh-Hans-CN/index/unrolling-the-codex-agent-loop/
author:
  - "[[Michael Bolin]]"
created: 2026-02-06
tags:
  - clippings
  - codex
  - openai
---
[Codex CLI ⁠ （在新窗口中打开）](https://developers.openai.com/codex/cli) 是我们打造的跨平台本地软件智能体，其设计宗旨是在您的计算机上安全、高效地运行，并交付高质量、可靠的软件变更。 [自四月首次发布该 CLI 以来 ⁠](https://openai.com/zh-Hans-CN/index/introducing-o3-and-o4-mini/) ，我们在构建先进软件智能体方面积累了丰富经验。为分享这些收获与思考，我们推出了本系列文章。作为开篇之作，本文将深入解析 Codex 的运作机制与核心原理，并分享我们在实践中积累的经验。（如需详细了解 Codex CLI 的底层实现细节，请查看我们的开源仓库： [https://github.com/openai/codex ⁠ （在新窗口中打开）](https://github.com/openai/codex) 。我们的许多设计决策细节都记录在 GitHub 的议题（Issues）和拉取请求中，可供深入查阅。）

首先，我们将聚焦于 *智能体循环* —这是 Codex CLI 的核心逻辑，负责协调用户、模型以及模型为执行任务所调用的工具三者之间的交互。希望本文能帮助您全面理解我们的智能体（或称“运行框架”）在运用大语言模型（LLM）时所发挥的关键作用。

在深入之前，先简单说明一下术语：在 OpenAI，“Codex”是指一系列软件智能体产品，包括 Codex CLI、Codex Cloud 和 Codex VS Code 扩展。本文重点探讨 Codex 的 *运行框架* 。它提供了核心的智能体循环与执行逻辑，是所有 Codex 体验的基石，并通过 Codex CLI 对外提供。为行文简洁，下文将交替使用“Codex”与“Codex CLI”。

## 智能体循环

对任何一个 AI 智能体来说，其核心都是一套称为“智能体循环”的运行机制。其简化示意如下图所示：

![[Pasted image 20260206151150.png]]


==首先，智能体接收用户 *输入* ，并将其整合为一系列为可供模型使用的文本指令，这一系列指令称为 *提示* 。

==接着，智能体将指令发送给模型，并要求模型生成响应，这个过程称为 *推理* 。== 在推理过程中，文本提示首先被转换为一串输入 [Token ⁠ （在新窗口中打开）](https://platform.openai.com/docs/concepts#tokens) — 这些 Token 是用于索引模型词汇表的整数值。随后，这些 Token 被用于对模型进行采样，从而生成一串新的输出 Token。

输出 Token 会转换回文本作为模型响应。由于 Token 是逐次生成的，转换过程可以与模型运行同步进行，因此许多大语言模型应用能实现流式输出。实际应用中，推理过程通常封装在一个处理文本的 API 内部，从而对使用者隐藏了 Token 化的细节。

==推理步骤完成后，模型可能产生两种结果：(1) 生成对用户原始输入的最终响应；或 (2) 请求智能体执行一次 *工具调用* （例如，“运行 `ls` 命令并返回结果”）。若是情况 (2)，智能体则执行所请求的工具调用，并将工具执行的结果追加到原始提示中。工具的输出结果将用于生成新的输入，并再次提交给模型；智能体基于这个更新后的上下文，开始新一轮推理。==

==此过程循环往复，直至模型不再发起工具调用，转而生成一条面向用户的消息（在 OpenAI 模型中称为 *助手消息* ）。== 多数情况下，此消息会直接回应用户的初始请求，但也可能是一个向用户提出的追问。

由于智能体能够执行会修改本地环境的工具调用，因此其“输出”并不局限于助手消息本身。在许多场景下，软件智能体最主要的“输出”，其实是它在您计算机上直接编写或修改的代码。然而，每一轮交互最终都会由一条助手消息来结束，例如“您要求的 `architecture.md` 文件已添加”，这标志着智能体循环达到终止状态。从智能体的视角来看，其任务已告完成，控制权也随之交还给用户。

图中所示的从 *用户输入* 到 *智能体响应* 的完整过程，被称为一次对话 *轮次* （在 Codex 中也称为一个 *对话线程* ）。需要注意的是，一次 *对话轮次* 可能包含 **模型推理** 与 **工具调用** 之间的多次循环迭代。每当您向既有对话发送新消息时，包括之前所有轮次的消息与工具调用在内的完整对话历史，都会被纳入新轮次的提示中：

![标题为“Multi-turn agent loop”的图示，展示 AI 智能体如何迭代地接收用户输入、生成行动、咨询工具、更新状态并返回结果。图示包含带标签的步骤、箭头以及展示智能体推理循环的示例工具输出。](https://images.ctfassets.net/kftzwdyauwt9/7E3hMjLsKIV8DTg2YcChYl/be5f33a8e4d2aa1134b82d898be90ce7/oai_Unrolling_the_Codex_agent_loop_Multi-turn_agent_loop_desktop-dark.svg?w=640&q=80)

标题为“Multi-turn agent loop”的图示，展示 AI 智能体如何迭代地接收用户输入、生成行动、咨询工具、更新状态并返回结果。图示包含带标签的步骤、箭头以及展示智能体推理循环的示例工具输出。

这意味着，随着对话的推进，用于模型采样的提示也会越来越长。。提示长度至关重要，因为每个模型都有一个 *上下文窗口* ，即其单次推理调用所能处理的最大 Token 数。需要注意，此窗口的容量同时涵盖了输入 *与* 输出 Token。可以想象，智能体在单轮交互中可能发起数百次工具调用，因此存在耗尽上下文窗口的风险。正因如此， *上下文窗口管理* 便成了智能体的核心职责之一。现在，让我们深入 Codex 内部，看其如何运行智能体循环。

## 模型推理

接下来，我们探讨 Codex 如何为对话中的第一次推理调用创建提示。

#### 构建初始提示

在初始提示中，列表内的每个项目都关联一个角色。 `角色` 决定了其关联内容的权重优先级，取值如下（按优先级降序排列）： `system` 、 `developer` 、 `user` 、 `assistant` 。

- [`instructions` ⁠ （在新窗口中打开）](https://platform.openai.com/docs/api-reference/responses/create#responses_create-instructions) ：插入到模型上下文中的系统（或开发者）消息
- [`tools` ⁠ （在新窗口中打开）](https://platform.openai.com/docs/api-reference/responses/create#responses_create-tools) ：模型在生成响应时可能调用的工具列表
- [`input` ⁠ （在新窗口中打开）](https://platform.openai.com/docs/api-reference/responses/create#responses_create-input) ：提供给模型的文本、图像或文件输入列表

在 Codex 中， `instructions` 字段的内容来源如下：若在 `~/.codex/config.toml` 中指定了 [`model_instructions_file` ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/338f2d634b2360ef3c899cac7e61a22c6b49c94f/codex-rs/core/src/config/mod.rs#L1474-L1483) [， 则从中读取；否则，使用与模型绑定的 `base_instructions` ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/338f2d634b2360ef3c899cac7e61a22c6b49c94f/codex-rs/core/src/codex.rs#L279-L288) 。 这些模型特定的指令存放在 Codex 代码仓库中，并随 CLI 打包发布（例如 [`gpt-5.2-codex_prompt.md` ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/e958d0337e98f6398771917867d7de689dab3b7a/codex-rs/core/gpt-5.2-codex_prompt.md) ）。

#### JavaScript

`  ``` 1[2  // Codex's default shell tool for spawning new processes locally.3  {4    "type": "function",5    "name": "shell",6    "description": "Runs a shell command and returns its output...",7    "strict": false,8    "parameters": {9      "type": "object",10      "properties": {11        "command": {"type": "array", "description": "The command to execute", ...},12        "workdir": {"description": "The working directory...", ...},13        "timeout_ms": {"description": "The timeout for the command...", ...},14        ...15      },16      "required": ["command"],17    }18  }19 20  // Codex's built-in plan tool.21  {22    "type": "function",23    "name": "update_plan",24    "description": "Updates the task plan...",25    "strict": false,26    "parameters": {27      "type": "object",28      "properties": {"plan":..., "explanation":...},29      "required": ["plan"]30    }31  },32 34  {35    "type": "web_search",36    "external_web_access": false37  },38 39  // MCP server for getting weather as configured in the40  // user's ~/.codex/config.toml.41  {42    "type": "function",43    "name": "mcp__weather__get-forecast",44    "description": "Get weather alerts for a US state",45    "strict": false,46    "parameters": {47      "type": "object",48      "properties": {"latitude": {...}, "longitude": {...}},49      "required": ["latitude", "longitude"]50    }51  }52] ```  `

最后，JSON 负载中的 `input` 字段本身也是一个项目列表。在添加用户消息之前，Codex 会先 [将以下项目插入 ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/codex.rs#L1387-L1415) `input` ：

1.一条 `role=developer` 的消息，用于描述沙盒权限。此沙盒 *仅适用于在* `*tools*` 部分定义的、由 Codex 提供的 `shell` 工具。也就是说，其他工具（例如来自 MCP 服务器的工具）不受 Codex 沙盒限制，需自行负责执行其防护措施。

该消息基于一个模板构建，其关键内容来自打包到 Codex CLI 中的 Markdown 代码片段，例如 [`workspace_write.md` ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/1fc72c647fd52e3e73d4309c3b568d4d5fe012b5/codex-rs/protocol/src/prompts/permissions/sandbox_mode/workspace_write.md) 和 [`on_request.md` ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/1fc72c647fd52e3e73d4309c3b568d4d5fe012b5/codex-rs/protocol/src/prompts/permissions/approval_policy/on_request.md) ：

#### 纯文本

`  ``` 1<permissions instructions>2  - description of the sandbox explaining file permissions and network access3  - instructions for when to ask the user for permissions to run a shell command4  - list of folders writable by Codex, if any5</permissions instructions> ```  `

（可选）一条 `role=developer` 的消息，其内容是从用户 `config.toml` 文件中读取的 `developer_instructions` 值。

（可选）一条 `role=user` 的消息，其内容为“用户指令”，这些指令并非源自单一文件，而是 [从多个来源聚合而来 ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/project_doc.rs#L37-L42) 。通常，更具体的指令会出现在更靠后的位置：

- `$CODEX_HOME` 目录中 `AGENTS.override.md` 和 `AGENTS.md` 的内容。
- 受大小限制（默认 32 KiB），从 `cwd` 的 Git/项目根目录（如果存在）开始，向上逐级检查每个目录，直至 `cwd` 本身：添加 `AGENTS.override.md` 、 `AGENTS.md` 、或 config.toml 中由 `project_doc_fallback_filenames` 指定的任何文件的内容
- 如果已配置任何 [技能 ⁠ （在新窗口中打开）](https://developers.openai.com/codex/skills/) ：
	- 一段关于技能的简短前言
	- 每个技能的 [技能元数据 ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/skills/model.rs#L6-L13)
	- 一个关于 [如何使用技能 ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/skills/render.rs#L20) 的章节

4\. 一条 `role=user` 的消息，描述智能体当前运行的本地环境。该消息会 [指定当前工作目录和用户的 shell ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/environment_context.rs#L51-L71) ：

#### 纯文本

`  ``` 1<environment_context>2  <cwd>/Users/mbolin/code/codex5</cwd>3  <shell>zsh</shell>4</environment_context> ```  `

当 Codex 根据前述计算对 `input` 进行初始化后，就会将用户消息追加进去，从而开始一轮新的对话。

前面的示例侧重于每条消息的内容，但请注意， `input` 中的每个元素都是一个 JSON 对象，包含 `type` 、 [`role` ⁠ （在新窗口中打开）](https://www.reddit.com/r/OpenAI/comments/1hgxcgi/what_is_the_purpose_of_the_new_developer_role_in/) 和 `content` 字段，如下所示：

#### JSON

`  ``` 1{2  "type": "message",3  "role": "user",4  "content": [5    {6      "type": "input_text",7      "text": "Add an architecture diagram to the README.md"8    }9  ]10} ```  `

![展示 AI 智能体循环中单一步骤的快照图。用户请求输入模型，模型生成一个思考、一个带工具名称的行动和一个工具输入。该图突出了工具被调用之前的这个中间推理步骤。](https://images.ctfassets.net/kftzwdyauwt9/2CNhKAWCXaUoKJM9P2aJIV/9e5c05009e2f7500115f74e9747a3b4e/oai_Unrolling_the_Codex_agent_loop_Snapshot_1_desktop-dark.svg?w=640&q=80)

展示 AI 智能体循环中单一步骤的快照图。用户请求输入模型，模型生成一个思考、一个带工具名称的行动和一个工具输入。该图突出了工具被调用之前的这个中间推理步骤。

如您所见，提示中前三个项目的顺序由服务器决定，而非客户端。也就是说，在这三个项目中，只有 *system message* 的内容也由服务器控制，因为 `tools` 和 `instructions` 由客户端决定。之后，来自 JSON 负载的 `input` 会紧随其后，从而完成整个提示的构建。

现在，我们已准备好提示，可以对模型进行采样了。

#### 第一轮对话

#### 纯文本

`  ``` 1data: {"type":"response.reasoning_summary_text.delta","delta":"ah ", ...}2data: {"type":"response.reasoning_summary_text.delta","delta":"ha!", ...}3data: {"type":"response.reasoning_summary_text.done", "item_id":...}4data: {"type":"response.output_item.added", "item":{...}}5data: {"type":"response.output_text.delta", "delta":"forty-", ...}6data: {"type":"response.output_text.delta", "delta":"two!", ...}7data: {"type":"response.completed","response":{...}} ```  `

#### JavaScript

`  ``` 1[2  /* ... original 5 items from the input array ... */3  {4    "type": "reasoning",5    "summary": [6      "type": "summary_text",7      "text": "**Adding an architecture diagram for README.md**\n\nI need to..."8    ],9    "encrypted_content": "gAAAAABpaDWNMxMeLw..."10  },11  {12    "type": "function_call",13    "name": "shell",14    "arguments": "{\"command\":\"cat README.md\",\"workdir\":\"/Users/mbolin/code/codex5\"}",15    "call_id": "call_8675309..."16  },17  {18    "type": "function_call_output",19    "call_id": "call_8675309...",20    "output": "<p align=\"center\"><code>npm i -g @openai/codex</code>..."21  }22] ```  `

那么，用于在后续查询中对模型进行采样的提示将如下所示：

![标题为“Snapshot 2”的示意图，展示了一次工具调用后的 AI 智能体。模型接收工具观测结果，并产生新的思考和行动。箭头连接输入、观测和输出，以展示智能体如何迭代其推理循环。](https://images.ctfassets.net/kftzwdyauwt9/673WKbsll8u4bAMZRosFJN/d8442bf08cb913a9b950d2ba6a9afc00/oai_EngBlog_Unrolling_the_Codex_agent_loop_Snapshot_2_desktop-dark.svg?w=640&q=80)

标题为“Snapshot 2”的示意图，展示了一次工具调用后的 AI 智能体。模型接收工具观测结果，并产生新的思考和行动。箭头连接输入、观测和输出，以展示智能体如何迭代其推理循环。

需要特别注意的是，旧提示是新提示的 *精确前缀* 。这是有意为之的，因为这样可以显著提升后续请求的效率，让我们得以充分利用 *提示缓存* （详见下一节“性能”部分）。

回顾智能体循环的第一张示意图，我们可以看到推理和工具调用之间可能发生多次迭代。提示可能会持续增长，直到我们最终收到一条助手消息，标志该轮对话结束：

#### 纯文本

`  ``` 1data: {"type":"response.output_text.done","text": "I added a diagram to explain...", ...}2data: {"type":"response.completed","response":{...}} ```  `

![标题为“Snapshot 3”的示意图，展示了 AI 智能体循环的最终阶段。收到工具结果后，模型生成一个总结性思考，并向用户返回最终答案。箭头说明了从工具输出到完成响应的过渡。](https://images.ctfassets.net/kftzwdyauwt9/6bSJRa6ldqZk0nvgbWYVte/34cd13125ff2bdf33d97dd62810268a2/oai_EngBlog_Unrolling_the_Codex_agent_loop_Snapshot_3_desktop-dark.svg?w=640&q=80)

标题为“Snapshot 3”的示意图，展示了 AI 智能体循环的最终阶段。收到工具结果后，模型生成一个总结性思考，并向用户返回最终答案。箭头说明了从工具输出到完成响应的过渡。

接下来，我们分析这个不断增长的提示会对性能产生什么样的影响。

#### 性能考量

通常，模型采样的成本远高于网络流量成本，因此采样成为我们提升效率的主要目标。正因如此，提示缓存才至关重要，它使我们能够重用先前推理调用中的计算。一旦命中缓存， *模型采样的开销就会从二次复杂度降为线性复杂度* 。我们的 [提示缓存 ⁠ （在新窗口中打开）](https://platform.openai.com/docs/guides/prompt-caching#structuring-prompts) 文档有更详细的说明：

*缓存命中仅在提示内部存在精确的前缀匹配时才可能发生。为实现缓存优势，请将指令和示例等静态内容置于提示开头，而将用户特定信息等可变内容置于提示末尾。这也适用于图像和工具，它们在各次请求间必须完全相同。*

考虑到这一点，让我们看看哪些类型的操作可能导致 Codex 发生“缓存未命中”：

Codex 团队在 Codex CLI 中引入可能损害提示缓存的新功能时，必须非常谨慎。例如，我们最初对 MCP 工具的支持曾引入一个 [未能以固定顺序枚举工具的 bug ⁠ （在新窗口中打开）](https://github.com/openai/codex/pull/2611) ，导致缓存未命中。请注意，MCP 工具可能尤其棘手，因为 MCP 服务器可以通过 [`notifications/tools/list_changed` ⁠ （在新窗口中打开）](https://modelcontextprotocol.io/specification/2025-11-25/server/tools#list-changed-notification) 通知动态更改其提供的工具列表。在长对话中途响应此通知，可能导致代价高昂的缓存未命中。

在可能的情况下，我们通过向 `input` 追加一条 *新* 消息（而非修改之前的消息）来处理对话中发生的配置更改：

- 如果沙盒配置或审批模式发生变化，我们 [插入 ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/codex.rs#L1037-L1057) 一条新的 `role=developer` 消息，其格式与原始的 `<permissions instructions>` 项目相同。
- 如果当前工作目录发生变化，我们 [插入 ⁠ （在新窗口中打开）](https://github.com/openai/codex/blob/99f47d6e9a3546c14c43af99c7a58fa6bd130548/codex-rs/core/src/codex.rs#L1017-L1035) 一条新的 `role=user` 消息，其格式与原始的 `<environment_context>` 相同。

我们竭尽全力确保缓存命中以提升性能。我们还需管理另一个关键资源：上下文窗口。

## 下期预告

虽然智能体循环为 Codex 奠定了基础，但这仅仅是个开始。在接下来的文章中，我们将深入探讨 CLI 的架构、研究工具使用的实现方式，并仔细审视 Codex 的沙盒模型。

## 继续阅读

[查看全部](https://openai.com/news/engineering/)

![Codex harness > card image](https://images.ctfassets.net/kftzwdyauwt9/1ySMLVHmxPk6E4hDn2Elef/4993bb3eafa6bca34f1de8c65f48bf9d/OAI_Unlocking_the_Codex_harness_Art_Card_1x1.png?w=3840&q=90&fm=webp)[

Unlocking the Codex harness: how we built the App Server

工程

](https://openai.com/index/unlocking-the-codex-harness/)

![kepler > card image](https://images.ctfassets.net/kftzwdyauwt9/2o8MnY1LncoqZZlWmDgJgL/1d0e33ec08b3fdd636fc698309abc39f/oai_in-house_data_agent_Art_Card_1x1.png?w=3840&q=90&fm=webp)[

Inside OpenAI’s in-house data agent

工程

](https://openai.com/zh-Hans-CN/index/inside-our-in-house-data-agent/)

![PostgreSQL > card image](https://images.ctfassets.net/kftzwdyauwt9/5gJQfL8q0oYa97MjNb3itL/88b41c66fc39b0a96fa28bf48e1e3d8c/oai-scaling-postgresql-to-power-800-million-chatgpt-users-artcard-1x1.png?w=3840&q=90&fm=webp)[

将 PostgreSQL 扩展至支持 8 亿 ChatGPT 用户

工程

](https://openai.com/zh-Hans-CN/index/scaling-postgresql/)