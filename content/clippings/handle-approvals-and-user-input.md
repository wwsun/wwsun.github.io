---
title: 处理审批与用户输入 — Claude Agent SDK
description: Claude Agent SDK 的 canUseTool 回调与 AskUserQuestion 工具完整指南，涵盖权限审批与澄清问题的检测、响应与实现。
tags:
  - clippings
  - claude-agent-sdk
  - agent
  - permissions
source: https://code.claude.com/docs/en/agent-sdk/user-input
created: 2026-08-26
author: Anthropic
---

## 处理审批与用户输入 — Claude Agent SDK

> **原文**：[Handle approvals and user input](https://code.claude.com/docs/en/agent-sdk/user-input) | 作者：Anthropic | 日期：2026-08

## 📝 摘要

本文是 Claude Agent SDK 官方文档中关于「用户输入」的一篇。文章讲解 SDK 如何把 Claude 的审批请求和澄清问题暴露给用户，再将其决定返回给 SDK。Claude 会在两种情况下请求用户输入：需要权限使用某个工具（如删除文件、运行命令），以及产生澄清问题（通过 `AskUserQuestion` 工具）。两者都会触发你传入的 `canUseTool` 回调，执行会暂停直到回调返回。文章详细介绍了如何检测这两种请求、如何返回允许/拒绝的响应（包括修改输入、记住权限规则、引导替代方案、完全重定向），以及 `AskUserQuestion` 澄清问题的字段格式、多选题、自由文本输入和完整实现示例，最后列出限制和其他获取用户输入的方式（流式输入、自定义工具）。

## 📋 术语表

| 英文                         | 中文                 | 说明                                               |
| ---------------------------- | -------------------- | -------------------------------------------------- |
| canUseTool                   | canUseTool 回调      | 查询选项中传入的回调，Claude 需要用户输入时触发    |
| AskUserQuestion              | AskUserQuestion 工具 | Claude 用于向用户提出澄清问题的内置工具            |
| permission rule              | 权限规则             | 决定工具调用是否自动批准的规则                     |
| permission mode              | 权限模式             | 如 acceptEdits、bypassPermissions、plan 等模式     |
| PermissionResultAllow        | 允许结果             | 回调返回的「允许」响应类型                         |
| PermissionResultDeny         | 拒绝结果             | 回调返回的「拒绝」响应类型                         |
| updatedInput / updated_input | 修改后的输入         | 允许时可选返回的、经过修改的工具输入               |
| updatedPermissions           | 更新权限             | 回显建议的权限规则，让后续匹配调用跳过询问         |
| suggestions                  | 建议项               | 回调第三个参数携带的、可避免重复询问的权限更新建议 |
| PreToolUse                   | PreToolUse 钩子      | 在其余流程之前执行、可允许/拒绝/修改请求的钩子     |
| multiSelect                  | 多选                 | 是否允许用户选择多个选项                           |
| streaming input              | 流式输入             | 在任务中途向 Claude 发送新指令的能力               |

---

## 正文（双语对照）

While working on a task, Claude sometimes needs to check in with users. It might need permission before deleting files, or need to ask which database to use for a new project. Your application needs to surface these requests to users so Claude can continue with their input.

在任务执行过程中，Claude 有时需要与用户确认。它可能需要在删除文件之前获得许可，或者需要询问新项目该使用哪个数据库。你的应用程序需要把这些请求呈现给用户，Claude 才能根据用户的输入继续工作。

Claude requests user input in two situations: when it needs **permission to use a tool** (like deleting files or running commands), and when it has **clarifying questions** (via the `AskUserQuestion` tool). Both trigger your `canUseTool` callback, which pauses execution until you return a response. This is different from normal conversation turns where Claude finishes and waits for your next message.

Claude 在两种情况下会请求用户输入：当它需要**使用某个工具的权限**（比如删除文件或运行命令），以及当它产生了**澄清问题**（通过 `AskUserQuestion` 工具）。两者都会触发你的 `canUseTool` 回调，执行会暂停，直到你返回一个响应。这与正常的对话轮次不同——正常轮次中 Claude 完成任务后等待你的下一条消息。

For clarifying questions, Claude generates the questions and options. Your role is to present them to users and return their selections. You can't add your own questions to this flow; if you need to ask users something yourself, do that separately in your application logic.

对于澄清问题，问题和选项由 Claude 生成。你的角色是把它们呈现给用户并返回用户的选择。你不能在此流程中追加自己的问题；如果需要自己向用户提问，请在应用程序逻辑中单独处理。

The callback can stay pending indefinitely. Execution remains paused until your callback returns, and the SDK only cancels the wait when the query itself is cancelled. If a user might take longer to respond than your process can reasonably stay running, return the [`defer` hook decision](/docs/en/hooks#defer-a-tool-call-for-later), which lets the process exit and resume later from the persisted session.

回调可以无限期地保持挂起状态。执行会一直暂停，直到你的回调返回，SDK 只有在查询本身被取消时才会取消等待。如果用户可能需要比进程合理存续时间更久才响应，请返回 [`defer` 钩子决策](/docs/en/hooks#defer-a-tool-call-for-later)，它允许进程退出，之后从持久化的会话中恢复。

## Detect when Claude needs input

## 检测 Claude 何时需要输入

Pass a `canUseTool` callback in your query options. The callback fires whenever Claude needs user input, receiving the tool name and input as arguments:

在查询选项中传入一个 `canUseTool` 回调。每当 Claude 需要用户输入时，回调就会触发，并接收工具名称和输入作为参数：

```python Python
from claude_agent_sdk import ClaudeAgentOptions

async def handle_tool_request(tool_name, input_data, context):
    # Prompt user and return allow or deny
    ...

options = ClaudeAgentOptions(can_use_tool=handle_tool_request)
```

```typescript TypeScript
async function handleToolRequest(toolName, input, options) {
  // options includes { signal: AbortSignal, suggestions?: PermissionUpdate[] }
  // Prompt user and return allow or deny
}

const options = { canUseTool: handleToolRequest }
```

The callback fires in two cases:

回调在两种情况下触发：

1. **Tool needs approval**: Claude wants to use a tool that isn't auto-approved by a [permission rule](/docs/en/agent-sdk/permissions) or permission mode. Check `tool_name` for the tool (e.g., `"Bash"`, `"Write"`).
2. **Claude asks a question**: Claude calls the `AskUserQuestion` tool. Check if `tool_name == "AskUserQuestion"` to handle it differently. If you specify a `tools` array, include `AskUserQuestion` for this to work. See [Handle clarifying questions](#handle-clarifying-questions) for details.

3. **工具需要审批**：Claude 想使用一个未被[权限规则](/docs/en/agent-sdk/permissions)或权限模式自动批准的工具。检查 `tool_name` 来判断是哪个工具（例如 `"Bash"`、`"Write"`）。
4. **Claude 提问**：Claude 调用了 `AskUserQuestion` 工具。检查 `tool_name == "AskUserQuestion"` 来区别处理。如果你指定了 `tools` 数组，需要把 `AskUserQuestion` 包含进去才能生效。详见[处理澄清问题](#handle-clarifying-questions)。

The callback never fires for auto-approved tools. Any approval earlier in the permission evaluation flow, an allow rule or a mode like `acceptEdits` or `bypassPermissions`, resolves the call before `canUseTool` is consulted. If you list a tool bare in `allowed_tools`, a `canUseTool` check for that tool runs only when the evaluation flow routes the call back to a prompt, such as an ask rule or `plan` mode. For logic that must apply to every tool call, use a `PreToolUse` hook, which executes before the rest of the flow and can allow, deny, or modify requests.

对于自动批准的工具，回调永远不会触发。在权限评估流程中更早出现的任何批准——允许规则或 `acceptEdits`、`bypassPermissions` 等模式——都会在咨询 `canUseTool` 之前就解决该调用。如果你在 `allowed_tools` 中直接列出某个工具，那么仅当评估流程把调用路由回提示（例如 ask 规则或 `plan` 模式）时，才会对该工具执行 `canUseTool` 检查。对于必须应用于每一次工具调用的逻辑，请使用 `PreToolUse` 钩子，它在其余流程之前执行，可以允许、拒绝或修改请求。

An allow rule doesn't pre-approve the actions no mode auto-approves; see How permissions are evaluated for which of them reach the callback and what happens in `dontAsk` and `auto` mode.

允许规则并不会预先批准那些任何模式都不会自动批准的操作；请参阅「权限如何被评估」来了解哪些操作会到达回调，以及在 `dontAsk` 和 `auto` 模式下会发生什么。

You can also use the `PermissionRequest` hook to send external notifications (Slack, email, push) when Claude is waiting for approval.

当 Claude 正在等待审批时，你还可以使用 `PermissionRequest` 钩子来发送外部通知（Slack、邮件、推送）。

## Handle tool approval requests

## 处理工具审批请求

Once you've passed a `canUseTool` callback in your query options, it fires when Claude wants to use a tool that nothing earlier in the permission flow has approved. Your callback receives three arguments:

一旦你在查询选项中传入了 `canUseTool` 回调，当 Claude 想使用一个权限流程中没有任何前置环节批准的工具时，它就会触发。你的回调会接收三个参数：

| Argument                            | Description                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `toolName`                          | The name of the tool Claude wants to use (e.g., `"Bash"`, `"Write"`, `"Edit"`)                                                                                                                                                                                                                                                             |
| `input`                             | The parameters Claude is passing to the tool. Contents vary by tool.                                                                                                                                                                                                                                                                       |
| `options` (TS) / `context` (Python) | Additional context including optional `suggestions` (proposed `PermissionUpdate` entries to avoid re-prompting) and a cancellation signal. In TypeScript, `signal` is an `AbortSignal`; in Python, the signal field is reserved for future use. See [`ToolPermissionContext`](/docs/en/agent-sdk/python#toolpermissioncontext) for Python. |

| 参数                                 | 描述                                                                                                                                                                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `toolName`                           | Claude 想使用的工具名称（例如 `"Bash"`、`"Write"`、`"Edit"`）                                                                                                                                                                                                                        |
| `input`                              | Claude 传递给工具的参数。内容因工具而异。                                                                                                                                                                                                                                            |
| `options`（TS）/ `context`（Python） | 额外上下文，包括可选的 `suggestions`（为避免重复询问而提议的 `PermissionUpdate` 条目）和一个取消信号。在 TypeScript 中，`signal` 是 `AbortSignal`；在 Python 中，signal 字段保留供将来使用。Python 参见 [`ToolPermissionContext`](/docs/en/agent-sdk/python#toolpermissioncontext)。 |

The `input` object contains tool-specific parameters. Common examples:

`input` 对象包含工具特定的参数。常见示例：

| Tool    | Input fields                            |
| ------- | --------------------------------------- |
| `Bash`  | `command`, `description`, `timeout`     |
| `Write` | `file_path`, `content`                  |
| `Edit`  | `file_path`, `old_string`, `new_string` |
| `Read`  | `file_path`, `offset`, `limit`          |

| 工具    | 输入字段                                |
| ------- | --------------------------------------- |
| `Bash`  | `command`、`description`、`timeout`     |
| `Write` | `file_path`、`content`                  |
| `Edit`  | `file_path`、`old_string`、`new_string` |
| `Read`  | `file_path`、`offset`、`limit`          |

See the SDK reference for complete input schemas: [Python](/docs/en/agent-sdk/python#tool-input%2Foutput-types) | [TypeScript](/docs/en/agent-sdk/typescript#tool-input-types).

完整的输入结构参见 SDK 参考：[Python](/docs/en/agent-sdk/python#tool-input%2Foutput-types) | [TypeScript](/docs/en/agent-sdk/typescript#tool-input-types)。

You can display this information to the user so they can decide whether to allow or reject the action, then return the appropriate response.

你可以把这些信息展示给用户，让他们决定是允许还是拒绝该操作，然后返回相应的响应。

The following example asks Claude to create and delete a test file. When Claude attempts each operation, the callback prints the tool request to the terminal and prompts for y/n approval.

下面的示例让 Claude 创建并删除一个测试文件。当 Claude 尝试每个操作时，回调会把工具请求打印到终端，并提示用户输入 y/n 进行审批。

```python Python
import asyncio

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query
from claude_agent_sdk.types import (
    HookMatcher,
    PermissionResultAllow,
    PermissionResultDeny,
    ToolPermissionContext,
)

async def can_use_tool(
    tool_name: str, input_data: dict, context: ToolPermissionContext
) -> PermissionResultAllow | PermissionResultDeny:
    # Display the tool request
    print(f"\nTool: {tool_name}")
    if tool_name == "Bash":
        print(f"Command: {input_data.get('command')}")
        if input_data.get("description"):
            print(f"Description: {input_data.get('description')}")
    else:
        print(f"Input: {input_data}")

    # Get user approval
    response = input("Allow this action? (y/n): ")

    # Return allow or deny based on user's response
    if response.lower() == "y":
        # Allow: tool executes with the original (or modified) input
        return PermissionResultAllow(updated_input=input_data)
    else:
        # Deny: tool doesn't execute, Claude sees the message
        return PermissionResultDeny(message="User denied this action")

# Required workaround: dummy hook keeps the stream open for can_use_tool
async def dummy_hook(input_data, tool_use_id, context):
    return {"continue_": True}

async def prompt_stream():
    yield {
        "type": "user",
        "message": {
            "role": "user",
            "content": "Create a test file in /tmp and then delete it",
        },
    }

async def main():
    async for message in query(
        prompt=prompt_stream(),
        options=ClaudeAgentOptions(
            can_use_tool=can_use_tool,
            hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[dummy_hook])]},
        ),
    ):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)

asyncio.run(main())
```

```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk"
import * as readline from "readline"

// Helper to prompt user for input in the terminal
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    }),
  )
}

for await (const message of query({
  prompt: "Create a test file in /tmp and then delete it",
  options: {
    canUseTool: async (toolName, input) => {
      // Display the tool request
      console.log(`\nTool: ${toolName}`)
      if (toolName === "Bash") {
        console.log(`Command: ${input.command}`)
        if (input.description) console.log(`Description: ${input.description}`)
      } else {
        console.log(`Input: ${JSON.stringify(input, null, 2)}`)
      }

      // Get user approval
      const response = await prompt("Allow this action? (y/n): ")

      // Return allow or deny based on user's response
      if (response.toLowerCase() === "y") {
        // Allow: tool executes with the original (or modified) input
        return { behavior: "allow", updatedInput: input }
      } else {
        // Deny: tool doesn't execute, Claude sees the message
        return { behavior: "deny", message: "User denied this action" }
      }
    },
  },
})) {
  if ("result" in message) console.log(message.result)
}
```

In Python, `can_use_tool` requires streaming mode. When you pass a finite message stream through `query(prompt=generator)` or `ClaudeSDKClient.connect(prompt=async_iterable)`, the SDK closes the input stream after the last message, before the permission callback can be invoked, unless a registered hook or in-process MCP server is keeping it open. The example above keeps it open with a `PreToolUse` hook that returns `{"continue_": True}`. Connecting with no prompt and sending messages through `ClaudeSDKClient.query()` keeps the stream open on its own and needs no hook.

在 Python 中，`can_use_tool` 需要流式模式。当你通过 `query(prompt=generator)` 或 `ClaudeSDKClient.connect(prompt=async_iterable)` 传入一个有限的消息流时，SDK 会在最后一条消息之后关闭输入流，此时权限回调还来不及被调用——除非有一个已注册的钩子或进程内 MCP 服务器让流保持打开。上面的示例通过一个返回 `{"continue_": True}` 的 `PreToolUse` 钩子来保持流打开。不带 prompt 连接、通过 `ClaudeSDKClient.query()` 发送消息则自身就能保持流打开，无需钩子。

This example uses a `y/n` flow where any input other than `y` is treated as a denial. In practice, you might build a richer UI that lets users modify the request, provide feedback, or redirect Claude entirely. See [Respond to tool requests](#respond-to-tool-requests) for all the ways you can respond.

这个示例使用了 `y/n` 流程，任何非 `y` 的输入都会被当作拒绝。实际中，你可能会构建更丰富的 UI，让用户修改请求、提供反馈，或完全重定向 Claude。参见[响应工具请求](#respond-to-tool-requests)了解所有响应方式。

### Respond to tool requests

### 响应工具请求

Your callback returns one of two response types:

你的回调会返回以下两种响应类型之一：

| Response  | Python                                     | TypeScript                            |
| --------- | ------------------------------------------ | ------------------------------------- |
| **Allow** | `PermissionResultAllow(updated_input=...)` | `{ behavior: "allow", updatedInput }` |
| **Deny**  | `PermissionResultDeny(message=...)`        | `{ behavior: "deny", message }`       |

| 响应     | Python                                     | TypeScript                            |
| -------- | ------------------------------------------ | ------------------------------------- |
| **允许** | `PermissionResultAllow(updated_input=...)` | `{ behavior: "allow", updatedInput }` |
| **拒绝** | `PermissionResultDeny(message=...)`        | `{ behavior: "deny", message }`       |

When allowing, the tool runs with the input Claude requested unless you return a modified input, `updatedInput` in TypeScript or `updated_input` in Python. Before v2.1.207, Claude Code rejected an allow result that omitted `updatedInput` and denied the tool call with a validation error.

允许时，工具会以 Claude 请求的输入运行，除非你返回了修改过的输入（TypeScript 中的 `updatedInput` 或 Python 中的 `updated_input`）。在 v2.1.207 之前，Claude Code 会拒绝省略了 `updatedInput` 的允许结果，并以验证错误拒绝该工具调用。

When denying, provide a message explaining why. Claude sees this message and may adjust its approach.

拒绝时，请提供一条消息说明原因。Claude 会看到这条消息，并可能调整它的做法。

```python Python
from claude_agent_sdk.types import PermissionResultAllow, PermissionResultDeny

# Allow the tool to execute
return PermissionResultAllow(updated_input=input_data)

# Block the tool
return PermissionResultDeny(message="User rejected this action")
```

```typescript TypeScript
// Allow the tool to execute
return { behavior: "allow", updatedInput: input }

// Block the tool
return { behavior: "deny", message: "User rejected this action" }
```

Beyond allowing or denying, you can modify the tool's input or provide context that helps Claude adjust its approach:

除了允许或拒绝，你还可以修改工具的输入，或提供帮助 Claude 调整做法的上下文：

- **Approve**: let the tool execute as Claude requested
- **Approve with changes**: modify the input before execution (e.g., sanitize paths, add constraints)
- **Approve and remember**: echo a suggested permission rule back so matching calls skip the prompt next time
- **Reject**: block the tool and tell Claude why
- **Suggest alternative**: block but guide Claude toward what the user wants instead
- **Redirect entirely**: use streaming input to send Claude a completely new instruction

- **批准**：让工具按 Claude 请求的那样执行
- **带修改批准**：在执行前修改输入（例如清理路径、添加约束）
- **批准并记住**：回显一条建议的权限规则，让后续匹配的调用跳过询问
- **拒绝**：阻止工具并告诉 Claude 原因
- **建议替代方案**：阻止，但引导 Claude 转向用户真正想要的
- **完全重定向**：使用流式输入向 Claude 发送一条全新的指令

The `ask_user` and `askUser` helpers in the following snippets stand in for your application's own prompt UI.

下面代码片段中的 `ask_user` 和 `askUser` 辅助函数代表你自己应用程序的提示 UI。

The user approves the action as-is. Pass through the `input` from your callback unchanged and the tool executes exactly as Claude requested.

用户原样批准该操作。原封不动地透传回调中的 `input`，工具就会完全按照 Claude 请求的那样执行。

```python Python
async def can_use_tool(tool_name, input_data, context):
    print(f"Claude wants to use {tool_name}")
    approved = await ask_user("Allow this action?")

    if approved:
        return PermissionResultAllow(updated_input=input_data)
    return PermissionResultDeny(message="User declined")
```

```typescript TypeScript
canUseTool: async (toolName, input) => {
  console.log(`Claude wants to use ${toolName}`)
  const approved = await askUser("Allow this action?")

  if (approved) {
    return { behavior: "allow", updatedInput: input }
  }
  return { behavior: "deny", message: "User declined" }
}
```

The user approves but wants to modify the request first. You can change the input before the tool executes. Claude sees the result but isn't told you changed anything. Useful for sanitizing parameters, adding constraints, or scoping access.

用户批准了，但想先修改请求。你可以在工具执行前修改输入。Claude 会看到结果，但不会被告知你做了任何修改。这对于清理参数、添加约束或限定访问范围很有用。

```python Python
async def can_use_tool(tool_name, input_data, context):
    if tool_name == "Bash":
        # User approved, but scope all commands to sandbox
        sandboxed_input = {**input_data}
        sandboxed_input["command"] = input_data["command"].replace(
            "/tmp", "/tmp/sandbox"
        )
        return PermissionResultAllow(updated_input=sandboxed_input)
    return PermissionResultAllow(updated_input=input_data)
```

```typescript TypeScript
canUseTool: async (toolName, input) => {
  if (toolName === "Bash") {
    // User approved, but scope all commands to sandbox
    const sandboxedInput = {
      ...input,
      command: input.command.replace("/tmp", "/tmp/sandbox"),
    }
    return { behavior: "allow", updatedInput: sandboxedInput }
  }
  return { behavior: "allow", updatedInput: input }
}
```

The user approves and doesn't want to be asked again for this kind of call. The third callback argument carries `suggestions`, an array of ready-made `PermissionUpdate` entries. Echo one back in `updatedPermissions` to apply it. A suggestion with the `localSettings` destination writes the rule to `.claude/settings.local.json` so future sessions skip the prompt for matching calls.

用户批准了，并且不希望这类调用再被询问。第三个回调参数携带 `suggestions`，这是一组现成的 `PermissionUpdate` 条目。在 `updatedPermissions` 中回显其中一个即可应用它。destination 为 `localSettings` 的建议会把规则写入 `.claude/settings.local.json`，这样后续会话中匹配的调用就会跳过询问。

The Python example requires `claude-agent-sdk` 0.1.80 or later.

Python 示例需要 `claude-agent-sdk` 0.1.80 或更高版本。

```python Python
async def can_use_tool(tool_name, input_data, context):
    choice = await ask_user(f"Allow {tool_name}?", ["once", "always", "no"])

    if choice == "always":
        persist = [
            s for s in context.suggestions if s.destination == "localSettings"
        ]
        return PermissionResultAllow(
            updated_input=input_data, updated_permissions=persist
        )
    if choice == "once":
        return PermissionResultAllow(updated_input=input_data)
    return PermissionResultDeny(message="User declined")
```

```typescript TypeScript
canUseTool: async (toolName, input, { suggestions = [] }) => {
  const choice = await askUser(`Allow ${toolName}?`, ["once", "always", "no"])

  if (choice === "always") {
    const persist = suggestions.filter((s) => s.destination === "localSettings")
    return {
      behavior: "allow",
      updatedInput: input,
      updatedPermissions: persist,
    }
  }
  if (choice === "once") {
    return { behavior: "allow", updatedInput: input }
  }
  return { behavior: "deny", message: "User declined" }
}
```

The user doesn't want this action to happen. Block the tool and provide a message explaining why. Claude sees this message and may try a different approach.

用户不希望发生这个操作。阻止工具并提供一条说明原因的消息。Claude 会看到这条消息，并可能尝试不同的做法。

```python Python
async def can_use_tool(tool_name, input_data, context):
    approved = await ask_user(f"Allow {tool_name}?")

    if not approved:
        return PermissionResultDeny(message="User rejected this action")
    return PermissionResultAllow(updated_input=input_data)
```

```typescript TypeScript
canUseTool: async (toolName, input) => {
  const approved = await askUser(`Allow ${toolName}?`)

  if (!approved) {
    return {
      behavior: "deny",
      message: "User rejected this action",
    }
  }
  return { behavior: "allow", updatedInput: input }
}
```

The user doesn't want this specific action, but has a different idea. Block the tool and include guidance in your message. Claude will read this and decide how to proceed based on your feedback.

用户不想要这个具体操作，但有别的想法。阻止工具并在消息中包含引导。Claude 会读取这些信息，并根据你的反馈决定如何继续。

```python Python
async def can_use_tool(tool_name, input_data, context):
    if tool_name == "Bash" and "rm" in input_data.get("command", ""):
        # User doesn't want to delete, suggest archiving instead
        return PermissionResultDeny(
            message="User doesn't want to delete files. They asked if you could compress them into an archive instead."
        )
    return PermissionResultAllow(updated_input=input_data)
```

```typescript TypeScript
canUseTool: async (toolName, input) => {
  if (toolName === "Bash" && input.command.includes("rm")) {
    // User doesn't want to delete, suggest archiving instead
    return {
      behavior: "deny",
      message:
        "User doesn't want to delete files. They asked if you could compress them into an archive instead.",
    }
  }
  return { behavior: "allow", updatedInput: input }
}
```

For a complete change of direction (not just a nudge), use streaming input to send Claude a new instruction directly. This bypasses the current tool request and gives Claude entirely new instructions to follow.

对于方向的彻底改变（而不仅仅是一个提示），请使用流式输入直接向 Claude 发送新指令。这会绕过当前的工具请求，给 Claude 一整套全新的指令去遵循。

## Handle clarifying questions

## 处理澄清问题

When Claude needs more direction on a task with multiple valid approaches, it calls the `AskUserQuestion` tool. This triggers your `canUseTool` callback with `toolName` set to `AskUserQuestion`. The input contains Claude's questions as multiple-choice options, which you display to the user and return their selections.

当 Claude 需要针对一个有多种合理做法的任务获得更多方向时，它会调用 `AskUserQuestion` 工具。这会以 `toolName` 为 `AskUserQuestion` 触发你的 `canUseTool` 回调。输入中包含 Claude 以多选题形式提出的问题，你将其展示给用户并返回用户的选择。

Clarifying questions are especially common in `plan` mode, where Claude explores the codebase and asks questions before proposing a plan. This makes plan mode ideal for interactive workflows where you want Claude to gather requirements before making changes.

澄清问题在 `plan` 模式下尤其常见——在这种模式下，Claude 会探索代码库，并在提出计划之前先提问。这使得 plan 模式非常适合交互式工作流，即你希望 Claude 在做出更改之前先收集需求。

The following steps show how to handle clarifying questions:

以下步骤展示了如何处理澄清问题：

Pass a `canUseTool` callback in your query options. By default, `AskUserQuestion` is available. If you specify a `tools` array to restrict Claude's capabilities (for example, a read-only agent with only `Read`, `Glob`, and `Grep`), include `AskUserQuestion` in that array. Otherwise, Claude won't be able to ask clarifying questions:

在查询选项中传入 `canUseTool` 回调。默认情况下，`AskUserQuestion` 是可用的。如果你指定了 `tools` 数组来限制 Claude 的能力（例如一个只读智能体，只有 `Read`、`Glob` 和 `Grep`），请把 `AskUserQuestion` 包含进该数组。否则，Claude 将无法提出澄清问题：

```python Python
async for message in query(
    prompt="Analyze this codebase",
    options=ClaudeAgentOptions(
        # Include AskUserQuestion in your tools list
        tools=["Read", "Glob", "Grep", "AskUserQuestion"],
        can_use_tool=can_use_tool,
    ),
):
    print(message)
```

```typescript TypeScript
for await (const message of query({
  prompt: "Analyze this codebase",
  options: {
    // Include AskUserQuestion in your tools list
    tools: ["Read", "Glob", "Grep", "AskUserQuestion"],
    canUseTool: async (toolName, input) => {
      // Handle clarifying questions here
    },
  },
})) {
  console.log(message)
}
```

In your callback, check if `toolName` equals `AskUserQuestion` to handle it differently from other tools:

在你的回调中，检查 `toolName` 是否等于 `AskUserQuestion`，以便区别于其他工具来处理：

```python Python
async def can_use_tool(tool_name: str, input_data: dict, context):
    if tool_name == "AskUserQuestion":
        # Your implementation to collect answers from the user
        return await handle_clarifying_questions(input_data)
    # Handle other tools normally
    return await prompt_for_approval(tool_name, input_data)
```

```typescript TypeScript
canUseTool: async (toolName, input) => {
  if (toolName === "AskUserQuestion") {
    // Your implementation to collect answers from the user
    return handleClarifyingQuestions(input)
  }
  // Handle other tools normally
  return promptForApproval(toolName, input)
}
```

The input contains Claude's questions in a `questions` array. Each question has a `question` (the text to display), `options` (the choices), and `multiSelect` (whether multiple selections are allowed):

输入在 `questions` 数组中包含 Claude 的问题。每个问题有 `question`（要展示的文本）、`options`（选项）和 `multiSelect`（是否允许多选）：

```json
{
  "questions": [
    {
      "question": "How should I format the output?",
      "header": "Format",
      "options": [
        { "label": "Summary", "description": "Brief overview" },
        { "label": "Detailed", "description": "Full explanation" }
      ],
      "multiSelect": false
    },
    {
      "question": "Which sections should I include?",
      "header": "Sections",
      "options": [
        { "label": "Introduction", "description": "Opening context" },
        { "label": "Conclusion", "description": "Final summary" }
      ],
      "multiSelect": true
    }
  ]
}
```

See Question format for full field descriptions.

完整的字段说明参见[问题格式](#question-format)。

Present the questions to the user and collect their selections. How you do this depends on your application: a terminal prompt, a web form, a mobile dialog, etc.

把问题呈现给用户并收集他们的选择。具体怎么做取决于你的应用程序：终端提示、Web 表单、移动端对话框等。

Build the `answers` object as a record where each key is the `question` text and each value is the selected option's `label`:

构建 `answers` 对象，它是一个记录（record），每个键是 `question` 文本，每个值是被选中选项的 `label`：

| From the question object                                     | Use as |
| ------------------------------------------------------------ | ------ |
| `question` field (e.g., `"How should I format the output?"`) | Key    |
| Selected option's `label` field (e.g., `"Summary"`)          | Value  |

| 来自问题对象                                                | 用作 |
| ----------------------------------------------------------- | ---- |
| `question` 字段（例如 `"How should I format the output?"`） | 键   |
| 被选中选项的 `label` 字段（例如 `"Summary"`）               | 值   |

For multi-select questions, pass an array of labels or join them with `", "`. If you support free-text input, use the user's custom text as the value.

对于多选问题，传递一个 label 数组或用 `", "` 连接它们。如果你支持自由文本输入，使用用户的自定义文本作为值。

```python Python
return PermissionResultAllow(
    updated_input={
        "questions": input_data.get("questions", []),
        "answers": {
            "How should I format the output?": "Summary",
            "Which sections should I include?": ["Introduction", "Conclusion"],
        },
    }
)
```

```typescript TypeScript
return {
  behavior: "allow",
  updatedInput: {
    questions: input.questions,
    answers: {
      "How should I format the output?": "Summary",
      "Which sections should I include?": "Introduction, Conclusion",
    },
  },
}
```

### Question format

### 问题格式

The input contains Claude's generated questions in a `questions` array. Each question has these fields:

输入在 `questions` 数组中包含 Claude 生成的问题。每个问题有以下字段：

| Field         | Description                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `question`    | The full question text to display                                                                       |
| `header`      | Short label for the question (max 12 characters)                                                        |
| `options`     | Array of 2-4 choices, each with `label` and `description`. TypeScript: optionally `preview` (see below) |
| `multiSelect` | If `true`, users can select multiple options                                                            |

| 字段          | 描述                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------ |
| `question`    | 要展示的完整问题文本                                                                       |
| `header`      | 问题的简短标签（最多 12 个字符）                                                           |
| `options`     | 2-4 个选项的数组，每个都有 `label` 和 `description`。TypeScript 中可选 `preview`（见下文） |
| `multiSelect` | 若为 `true`，用户可以多选                                                                  |

The structure your callback receives:

你的回调收到的结构：

```json
{
  "questions": [
    {
      "question": "How should I format the output?",
      "header": "Format",
      "options": [
        { "label": "Summary", "description": "Brief overview of key points" },
        { "label": "Detailed", "description": "Full explanation with examples" }
      ],
      "multiSelect": false
    }
  ]
}
```

#### Option previews (TypeScript)

#### 选项预览（TypeScript）

`toolConfig.askUserQuestion.previewFormat` adds a `preview` field to each option so your app can show a visual mockup alongside the label. Without this setting, Claude does not generate previews and the field is absent.

`toolConfig.askUserQuestion.previewFormat` 会为每个选项添加一个 `preview` 字段，让你的应用可以在 label 旁展示一个视觉预览。如果不设置，Claude 不会生成预览，该字段也不会出现。

| `previewFormat` | `preview` contains                                                         |
| :-------------- | :------------------------------------------------------------------------- |
| unset (default) | Field is absent. Claude does not generate previews.                        |
| `"markdown"`    | ASCII art and fenced code blocks                                           |
| `"html"`        | A styled fragment (the SDK rejects certain tags before your callback runs) |

| `previewFormat` | `preview` 包含的内容                               |
| :-------------- | :------------------------------------------------- |
| 未设置（默认）  | 字段不存在。Claude 不生成预览。                    |
| `"markdown"`    | ASCII 字符画和围栏代码块                           |
| `"html"`        | 一段带样式的片段（SDK 会在回调运行前拒绝某些标签） |

The format applies to all questions in the session. Claude includes `preview` on options where a visual comparison helps (layout choices, color schemes) and omits it where one wouldn't (yes/no confirmations, text-only choices). Check for `undefined` before rendering.

该格式会应用于会话中的所有问题。Claude 会在视觉对比有帮助的选项上附加 `preview`（如布局选择、配色方案），而在不需要的地方省略（如是/否确认、纯文本选项）。渲染前请检查是否为 `undefined`。

```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk"

for await (const message of query({
  prompt: "Help me choose a card layout",
  options: {
    toolConfig: {
      askUserQuestion: { previewFormat: "html" },
    },
    canUseTool: async (toolName, input) => {
      // input.questions[].options[].preview is an HTML string or undefined
      return { behavior: "allow", updatedInput: input }
    },
  },
})) {
  // ...
}
```

An option with an HTML preview:

一个带 HTML 预览的选项：

```json
{
  "label": "Compact",
  "description": "Title and metric value only",
  "preview": "<div style=\"padding:12px;border:1px solid #ddd;border-radius:8px\"><div style=\"font-size:12px;color:#666\">Active users</div><div style=\"font-size:28px;font-weight:600\">1,284</div></div>"
}
```

### Response format

### 响应格式

Return an `answers` object mapping each question's `question` field to the selected option's `label`:

返回一个 `answers` 对象，把每个问题的 `question` 字段映射到被选中选项的 `label`：

| Field       | Description                                                                          |
| ----------- | ------------------------------------------------------------------------------------ |
| `questions` | Pass through the original questions array (required for tool processing)             |
| `answers`   | Object where keys are question text and values are selected labels                   |
| `response`  | Optional freeform reply the user typed instead of answering the structured questions |

| 字段        | 描述                                                       |
| ----------- | ---------------------------------------------------------- |
| `questions` | 透传原始的问题数组（工具处理所必需）                       |
| `answers`   | 对象，键是问题文本，值是被选中的 label                     |
| `response`  | 可选的自由文本回复，用户不回答结构化问题而是直接输入的内容 |

For multi-select questions, pass an array of labels or join them with `", "`. For per-question free text such as an "Other" option, put the user's text in `answers[question]` as shown in Support free-text input. Set `response` only when your UI lets the user dismiss the question card and type a general reply that isn't an answer to any specific question. When `response` is set, Claude receives "The user responded: …" instead of the per-question answer list.

对于多选问题，传递一个 label 数组或用 `", "` 连接。对于每个问题的自由文本（例如「其他」选项），按[支持自由文本输入](#support-free-text-input)所示，把用户的文本放进 `answers[question]`。只有当你的 UI 允许用户关闭问题卡片并输入一条不属于任何具体问题的通用回复时，才设置 `response`。当设置了 `response` 时，Claude 会收到「用户回复：……」而不是逐题答案列表。

```json
{
  "questions": [
    // ...
  ],
  "answers": {
    "How should I format the output?": "Summary",
    "Which sections should I include?": ["Introduction", "Conclusion"]
  }
}
```

#### Support free-text input

#### 支持自由文本输入

Claude's predefined options won't always cover what users want. To let users type their own answer:

Claude 预定义的选项并不总能覆盖用户想要的内容。要让用户输入自己的答案：

- Display an additional "Other" choice after Claude's options that accepts text input
- Use the user's custom text as the answer value (not the word "Other")

- 在 Claude 的选项之后展示一个额外的「其他」选项，用于接受文本输入
- 使用用户的自定义文本作为答案值（而不是「其他」这个词）

See the complete example below for a full implementation.

完整实现参见下方的[完整示例](#complete-example)。

### Complete example

### 完整示例

Claude asks clarifying questions when it needs user input to proceed. For example, when asked to help decide on a tech stack for a mobile app, Claude might ask about cross-platform vs native, backend preferences, or target platforms. These questions help Claude make decisions that match the user's preferences rather than guessing.

当 Claude 需要用户输入才能继续时，它会提出澄清问题。例如，当被要求帮忙决定一个移动应用的技术栈时，Claude 可能会问跨平台还是原生、后端偏好或目标平台等问题。这些问题帮助 Claude 做出符合用户偏好的决定，而不是靠猜测。

This example handles those questions in a terminal application. Here's what happens at each step:

这个示例在一个终端应用中处理这些问题。每一步发生的事情如下：

1. **Route the request**: The `canUseTool` callback checks if the tool name is `"AskUserQuestion"` and routes to a dedicated handler
2. **Display questions**: The handler loops through the `questions` array and prints each question with numbered options
3. **Collect input**: The user can enter a number to select an option, or type free text directly (e.g., "jquery", "i don't know")
4. **Map answers**: The code checks if input is numeric (uses the option's label) or free text (uses the text directly)
5. **Return to Claude**: The response includes both the original `questions` array and the `answers` mapping

6. **路由请求**：`canUseTool` 回调检查工具名是否为 `"AskUserQuestion"`，并路由到一个专门的处理器
7. **展示问题**：处理器遍历 `questions` 数组，打印每个问题及带编号的选项
8. **收集输入**：用户可以输入数字选择选项，或直接输入自由文本（例如 "jquery"、"i don't know"）
9. **映射答案**：代码判断输入是数字（使用选项的 label）还是自由文本（直接使用文本）
10. **返回给 Claude**：响应同时包含原始的 `questions` 数组和 `answers` 映射

Save the TypeScript version as `ask.ts` and run it with `npx tsx ask.ts`, or save the Python version as `ask.py` and run it with `python ask.py`.

把 TypeScript 版本保存为 `ask.ts` 并用 `npx tsx ask.ts` 运行，或者把 Python 版本保存为 `ask.py` 并用 `python ask.py` 运行。

```python Python
import asyncio

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, query
from claude_agent_sdk.types import HookMatcher, PermissionResultAllow

def parse_response(response: str, options: list) -> str:
    """Parse user input as option number(s) or free text."""
    try:
        indices = [int(s.strip()) - 1 for s in response.split(",")]
        labels = [options[i]["label"] for i in indices if 0 <= i < len(options)]
        return ", ".join(labels) if labels else response
    except ValueError:
        return response

async def handle_ask_user_question(input_data: dict) -> PermissionResultAllow:
    """Display Claude's questions and collect user answers."""
    answers = {}

    for q in input_data.get("questions", []):
        print(f"\n{q['header']}: {q['question']}")

        options = q["options"]
        for i, opt in enumerate(options):
            print(f"  {i + 1}. {opt['label']} - {opt['description']}")
        if q.get("multiSelect"):
            print("  (Enter numbers separated by commas, or type your own answer)")
        else:
            print("  (Enter a number, or type your own answer)")

        response = input("Your choice: ").strip()
        answers[q["question"]] = parse_response(response, options)

    return PermissionResultAllow(
        updated_input={
            "questions": input_data.get("questions", []),
            "answers": answers,
        }
    )

async def can_use_tool(
    tool_name: str, input_data: dict, context
) -> PermissionResultAllow:
    # Route AskUserQuestion to our question handler
    if tool_name == "AskUserQuestion":
        return await handle_ask_user_question(input_data)
    # Auto-approve other tools for this example
    return PermissionResultAllow(updated_input=input_data)

async def prompt_stream():
    yield {
        "type": "user",
        "message": {
            "role": "user",
            "content": "Help me decide on the tech stack for a new mobile app",
        },
    }

# Required workaround: dummy hook keeps the stream open for can_use_tool
async def dummy_hook(input_data, tool_use_id, context):
    return {"continue_": True}

async def main():
    async for message in query(
        prompt=prompt_stream(),
        options=ClaudeAgentOptions(
            can_use_tool=can_use_tool,
            hooks={"PreToolUse": [HookMatcher(matcher=None, hooks=[dummy_hook])]},
        ),
    ):
        if isinstance(message, ResultMessage) and message.subtype == "success":
            print(message.result)

asyncio.run(main())
```

```typescript TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk"
import * as readline from "readline/promises"

// Helper to prompt user for input in the terminal
async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(question)
  rl.close()
  return answer
}

// Parse user input as option number(s) or free text
function parseResponse(response: string, options: any[]): string {
  const indices = response.split(",").map((s) => parseInt(s.trim()) - 1)
  const labels = indices
    .filter((i) => !isNaN(i) && i >= 0 && i < options.length)
    .map((i) => options[i].label)
  return labels.length > 0 ? labels.join(", ") : response
}

// Display Claude's questions and collect user answers
async function handleAskUserQuestion(input: any) {
  const answers: Record<string, string> = {}

  for (const q of input.questions) {
    console.log(`\n${q.header}: ${q.question}`)

    const options = q.options
    options.forEach((opt: any, i: number) => {
      console.log(`  ${i + 1}. ${opt.label} - ${opt.description}`)
    })
    if (q.multiSelect) {
      console.log("  (Enter numbers separated by commas, or type your own answer)")
    } else {
      console.log("  (Enter a number, or type your own answer)")
    }

    const response = (await prompt("Your choice: ")).trim()
    answers[q.question] = parseResponse(response, options)
  }

  // Return the answers to Claude (must include original questions)
  return {
    behavior: "allow",
    updatedInput: { questions: input.questions, answers },
  }
}

async function main() {
  for await (const message of query({
    prompt: "Help me decide on the tech stack for a new mobile app",
    options: {
      canUseTool: async (toolName, input) => {
        // Route AskUserQuestion to our question handler
        if (toolName === "AskUserQuestion") {
          return handleAskUserQuestion(input)
        }
        // Auto-approve other tools for this example
        return { behavior: "allow", updatedInput: input }
      },
    },
  })) {
    if ("result" in message) console.log(message.result)
  }
}

main()
```

## Limitations

## 限制

- **Subagents**: `AskUserQuestion` is not currently available in subagents spawned via the Agent tool
- **Question limits**: each `AskUserQuestion` call supports 1-4 questions with 2-4 options each

- **子智能体**：目前通过 Agent 工具派生的子智能体还不能使用 `AskUserQuestion`
- **问题数量限制**：每次 `AskUserQuestion` 调用支持 1-4 个问题，每个问题 2-4 个选项

## Other ways to get user input

## 获取用户输入的其他方式

The `canUseTool` callback and `AskUserQuestion` tool cover most approval and clarification scenarios, but the SDK offers other ways to get input from users:

`canUseTool` 回调和 `AskUserQuestion` 工具覆盖了大多数审批和澄清场景，但 SDK 还提供了其他获取用户输入的方式：

### Streaming input

### 流式输入

Use streaming input when you need to:

在以下情况下使用流式输入：

- **Interrupt the agent mid-task**: send a cancel signal or change direction while Claude is working
- **Provide additional context**: add information Claude needs without waiting for it to ask
- **Build chat interfaces**: let users send follow-up messages during long-running operations

- **在任务中途打断智能体**：在 Claude 工作时发送取消信号或改变方向
- **提供额外上下文**：无需等待 Claude 询问，直接补充它需要的信息
- **构建聊天界面**：让用户在长时间运行的操作期间发送后续消息

Streaming input is ideal for conversational UIs where users interact with the agent throughout execution, not just at approval checkpoints.

流式输入非常适合对话式 UI——用户在整个执行过程中都能与智能体交互，而不仅仅是在审批检查点。

### Custom tools

### 自定义工具

Use custom tools when you need to:

在以下情况下使用自定义工具：

- **Collect structured input**: build forms, wizards, or multi-step workflows that go beyond `AskUserQuestion`'s multiple-choice format
- **Integrate external approval systems**: connect to existing ticketing, workflow, or approval platforms
- **Implement domain-specific interactions**: create tools tailored to your application's needs, like code review interfaces or deployment checklists

- **收集结构化输入**：构建超越 `AskUserQuestion` 单选格式的表单、向导或多步骤工作流
- **集成外部审批系统**：连接到现有的工单、工作流或审批平台
- **实现领域特定的交互**：创建贴合应用程序需求的工具，比如代码审查界面或部署清单

Custom tools give you full control over the interaction, but require more implementation work than using the built-in `canUseTool` callback.

自定义工具让你完全掌控交互，但相比使用内置的 `canUseTool` 回调需要更多实现工作。

## Related resources

## 相关资源

- [Configure permissions](/docs/en/agent-sdk/permissions): set up permission modes and rules
- [Control execution with hooks](/docs/en/agent-sdk/hooks): run custom code at key points in the agent lifecycle
- [TypeScript SDK reference](/docs/en/agent-sdk/typescript#canusetool): full canUseTool API documentation

- [配置权限](/docs/en/agent-sdk/permissions)：设置权限模式和规则
- [使用钩子控制执行](/docs/en/agent-sdk/hooks)：在智能体生命周期的关键节点运行自定义代码
- [TypeScript SDK 参考](/docs/en/agent-sdk/typescript#canusetool)：完整的 canUseTool API 文档

---

> **译者注**：本文中 `canUseTool`（Python 中为 `can_use_tool`）是 Claude Agent SDK 处理用户输入的核心入口。值得注意的细节：Python 侧 `can_use_tool` 依赖流式模式，且需要用一个 dummy `PreToolUse` 钩子来保持输入流打开，否则有限消息流会在权限回调触发前就被关闭；TypeScript 侧则无需此变通。另外，`AskUserQuestion` 目前不支持在子智能体中调用，构建多层 Agent 时需自行处理澄清逻辑。
