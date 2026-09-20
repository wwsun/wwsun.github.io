---
title: 使用会话 — Claude Agent SDK
description: Claude Agent SDK 会话管理的完整指南，涵盖 continue、resume 和 fork 三种模式的选择和使用
tags:
  - claude-agent-sdk
  - clippings
  - sessions
  - typescript
  - python
source: https://code.claude.com/docs/en/agent-sdk/sessions
---

## 概述

会话是 SDK 在智能体工作期间累积的对话历史。它包含你的提示词、智能体发出的每个工具调用、每个工具结果以及每个响应。SDK 会自动将其写入磁盘，以便稍后返回继续。

返回一个会话意味着智能体拥有之前的完整上下文：已读取的文件、已执行的分析、已做出的决策。你可以追问后续问题、从中断中恢复，或者分支出新的方向尝试不同的方法。

本指南涵盖：如何为你的应用选择合适的方式、SDK 自动跟踪会话的接口、如何捕获会话 ID 并手动使用 `resume` 和 `fork`，以及跨主机恢复会话的注意事项。

## 选择合适的方式

你需要多少会话处理能力取决于你的应用形态。当你要发送多个需要共享上下文的提示词时，会话管理就派上用场了。在单次 `query()` 调用中，智能体已经会根据需要执行多轮对话，权限提示和 `AskUserQuestion` 在循环内处理（它们不会结束调用）。

| 你在构建什么                                | 使用方式                                                                                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 一次性任务：单个提示词，无需后续跟进        | 不需要额外处理。一次 `query()` 调用即可。                                                                                                             |
| 单进程中的多轮对话                          | [`ClaudeSDKClient`（Python）或 `continue: true`（TypeScript）](#自动会话管理)。SDK 自动跟踪会话，无需手动处理 ID。                                    |
| 进程重启后从上次中断处继续                  | `continue_conversation=True`（Python）/ `continue: true`（TypeScript）。恢复目录中最近的会话，无需 ID。                                               |
| 恢复特定的历史会话（非最近的）              | 捕获会话 ID 并传给 `resume`。                                                                                                                         |
| 尝试不同方案而不丢失原始会话                | 使用 fork 分叉会话。                                                                                                                                  |
| 无状态任务，不希望写入磁盘（仅 TypeScript） | 设置 [`persistSession: false`](https://code.claude.com/docs/en/agent-sdk/typescript#options)。会话仅在调用期间存在于内存中。Python 始终持久化到磁盘。 |

### Continue、Resume 和 Fork

Continue、Resume 和 Fork 是在 `query()` 上设置的选项字段（Python 中为 [`ClaudeAgentOptions`](https://code.claude.com/docs/en/agent-sdk/python#claudeagentoptions)，TypeScript 中为 [`Options`](https://code.claude.com/docs/en/agent-sdk/typescript#options)）。

**Continue** 和 **Resume** 都会恢复一个已有的会话并追加内容。区别在于它们如何找到那个会话：

- **Continue** 查找当前目录中最近的会话。你不需要跟踪任何东西。适用于你的应用一次只进行一个对话的场景。
- **Resume** 接受一个特定的会话 ID。你需要跟踪这个 ID。适用于你有多个会话（例如多用户应用中每个用户一个会话），或者想恢复非最近会话的场景。

**Fork** 则不同：它会创建一个新的会话，以原始会话的历史副本作为起点。原始会话保持不变。使用 Fork 可以尝试不同的方向，同时保留回退到原始路径的选项。

## 自动会话管理

两个 SDK 都提供了跨调用自动跟踪会话状态的接口，让你无需手动传递 ID。适用于单进程中的多轮对话。

### Python：`ClaudeSDKClient`

[`ClaudeSDKClient`](https://code.claude.com/docs/en/agent-sdk/python#claudesdkclient) 在内部处理会话 ID。每次调用 `client.query()` 都会自动继续同一个会话。调用 [`client.receive_response()`](https://code.claude.com/docs/en/agent-sdk/python#claudesdkclient) 来迭代当前查询的消息。将 client 作为异步上下文管理器使用，以便自动处理连接建立和断开，或者手动调用 `connect()` 和 `disconnect()`。

以下示例对同一个 `client` 运行两个查询。第一个查询要求智能体分析一个模块，第二个要求它重构那个模块。由于两个调用都通过同一个 client 实例，第二个查询拥有第一个查询的完整上下文，无需任何显式的 `resume` 或会话 ID：

```python
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    ResultMessage,
    TextBlock,
)

def print_response(message):
    """仅打印消息中人类可读的部分。"""
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(block.text)
    elif isinstance(message, ResultMessage):
        cost = (
            f"${message.total_cost_usd:.4f}"
            if message.total_cost_usd is not None
            else "N/A"
        )
        print(f"[done: {message.subtype}, cost: {cost}]")

async def main():
    options = ClaudeAgentOptions(
        allowed_tools=["Read", "Edit", "Glob", "Grep"],
    )

    async with ClaudeSDKClient(options=options) as client:
        # 第一个查询：client 内部捕获会话 ID
        await client.query("Analyze the auth module")
        async for message in client.receive_response():
            print_response(message)

        # 第二个查询：自动继续同一会话
        await client.query("Now refactor it to use JWT")
        async for message in client.receive_response():
            print_response(message)

asyncio.run(main())
```

参阅 [Python SDK 参考](https://code.claude.com/docs/en/agent-sdk/python#choosing-between-query-and-claudesdkclient) 了解何时使用 `ClaudeSDKClient` 与独立的 `query()` 函数。

### TypeScript：`continue: true`

TypeScript SDK 没有像 Python 的 `ClaudeSDKClient` 那样的会话持有客户端对象。取而代之的是，在每次后续的 `query()` 调用中传入 `continue: true`，SDK 会自动找到当前目录中最近的会话。无需跟踪 ID。

以下示例进行了两次独立的 `query()` 调用。第一次创建全新会话；第二次设置 `continue: true`，告诉 SDK 找到并恢复磁盘上最近的会话。智能体拥有第一次调用的完整上下文：

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk"

// 第一个查询：创建新会话
for await (const message of query({
  prompt: "Analyze the auth module",
  options: { allowedTools: ["Read", "Glob", "Grep"] },
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result)
  }
}

// 第二个查询：continue: true 恢复最近的会话
for await (const message of query({
  prompt: "Now refactor it to use JWT",
  options: {
    continue: true,
    allowedTools: ["Read", "Edit", "Write", "Glob", "Grep"],
  },
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result)
  }
}
```

## 配合 `query()` 使用会话选项

### 捕获会话 ID

Resume 和 Fork 需要会话 ID。从结果消息的 `session_id` 字段读取（Python 为 [`ResultMessage`](https://code.claude.com/docs/en/agent-sdk/python#resultmessage)，TypeScript 为 [`SDKResultMessage`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkresultmessage)），该字段在每个结果中都会出现，无论成功还是出错。在 TypeScript 中，ID 还可以更早地从初始化 `SystemMessage` 的直接字段获取；在 Python 中它嵌套在 `SystemMessage.data` 中。

### 按 ID 恢复

将会话 ID 传给 `resume` 以返回到特定会话。智能体从会话中断处继续，拥有完整的上下文。恢复的常见原因：

- **跟进已完成的任务。** 智能体已经分析了某些内容，现在你想让它基于该分析执行操作，而无需重新读取文件。
- **从限制中恢复。** 第一次运行以 `error_max_turns` 或 `error_max_budget_usd` 结束（见 [处理结果](https://code.claude.com/docs/en/agent-sdk/agent-loop#handle-the-result)）；以更高的限制值恢复。
- **重启你的进程。** 你在关闭前捕获了 ID，现在想恢复对话。

此示例从 [捕获会话 ID](#捕获会话-id) 中恢复会话并发送一个后续提示词。由于你在恢复，智能体已在上下文中拥有先前的分析：

> 要跨机器或在无服务器环境中恢复会话，需要将会话转录镜像到共享存储，使用 [`SessionStore` 适配器](https://code.claude.com/docs/en/agent-sdk/session-storage)。

### Fork 以探索替代方案

Fork 会创建一个新会话，以原始会话的历史副本为起点，但从该点开始分叉。Fork 会获得自己的会话 ID；原始会话的 ID 和历史保持不变。你最终会拥有两个可以分别恢复的独立会话。

以下示例基于 [捕获会话 ID](#捕获会话-id)：你已经分析了 `session_id` 中的一个 auth 模块，现在想探索 OAuth2 方案而不丢失基于 JWT 的线程。第一个代码块分叉会话并捕获 fork 的 ID（`forked_id`）；第二个代码块恢复原始的 `session_id` 继续 JWT 路径。现在你有了两个会话 ID 指向两个独立的历史记录：

## 跨主机恢复

会话文件在创建它们的主机上是本地的。要在不同主机（CI worker、临时容器、无服务器）上恢复会话，你有两个选择：

- **移动会话文件。** 将第一次运行的 `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` 持久化，并将其恢复到新主机上的相同路径，然后调用 `resume`。`cwd` 必须匹配。
- **不依赖会话恢复。** 将你需要的结果（分析输出、决策、文件差异）捕获为应用状态，并将其传入新会话的提示词。这通常比到处传递转录文件更稳健。

两个 SDK 都提供了列举磁盘上会话和读取其消息的函数：TypeScript 中的 [`listSessions()`](https://code.claude.com/docs/en/agent-sdk/typescript#listsessions) 和 [`getSessionMessages()`](https://code.claude.com/docs/en/agent-sdk/typescript#getsessionmessages)，Python 中的 [`list_sessions()`](https://code.claude.com/docs/en/agent-sdk/python#list_sessions) 和 [`get_session_messages()`](https://code.claude.com/docs/en/agent-sdk/python#get_session_messages)。使用它们来构建自定义的会话选择器、清理逻辑或转录查看器。

两个 SDK 还提供了查找和修改单个会话的函数：Python 中的 [`get_session_info()`](https://code.claude.com/docs/en/agent-sdk/python#get_session_info)、[`rename_session()`](https://code.claude.com/docs/en/agent-sdk/python#rename_session) 和 [`tag_session()`](https://code.claude.com/docs/en/agent-sdk/python#tag_session)，TypeScript 中的 [`getSessionInfo()`](https://code.claude.com/docs/en/agent-sdk/typescript#getsessioninfo)、[`renameSession()`](https://code.claude.com/docs/en/agent-sdk/typescript#renamesession) 和 [`tagSession()`](https://code.claude.com/docs/en/agent-sdk/typescript#tagsession)。使用它们按标签组织会话或为其赋予人类可读的标题。

## 相关文档

- [智能体循环如何工作](https://code.claude.com/docs/en/agent-sdk/agent-loop)：理解会话中的轮次、消息和上下文累积
- [文件快照](https://code.claude.com/docs/en/agent-sdk/file-checkpointing)：快照和回滚智能体在会话中修改的文件
- [Python `ClaudeAgentOptions`](https://code.claude.com/docs/en/agent-sdk/python#claudeagentoptions)：Python 完整会话选项参考
- [TypeScript `Options`](https://code.claude.com/docs/en/agent-sdk/typescript#options)：TypeScript 完整会话选项参考
