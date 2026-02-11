---
title: Codex SDK
tags:
  - codex
draft: false
description: Codex SDK 官方 TypeScript 开发指南
source: https://github.com/openai/codex/blob/main/sdk/typescript/README.md
---
将 Codex 智能体集成到你的工作流和应用程序中。

TypeScript SDK 封装了绑定的 `codex` 二进制文件。它会启动 CLI 并通过 stdin/stdout 交换 JSONL 事件。

## 安装

```bash
npm install @openai/codex-sdk
```

需要 Node.js 18+ 环境。

## 快速上手

```typescript
import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread = codex.startThread();
const turn = await thread.run("Diagnose the test failure and propose a fix");

console.log(turn.finalResponse);
console.log(turn.items);
```

在同一个 `Thread` 实例上重复调用 `run()` 即可继续对话。

```typescript
const nextTurn = await thread.run("Implement the fix");
```

## 流式响应

`run()` 会缓存事件直到本轮对话结束。如果你需要对中间过程（如工具调用、流式响应和文件更改通知）做出反应，请改用 `runStreamed()`，它会返回一个包含结构化事件的异步生成器。

```typescript
const { events } = await thread.runStreamed("Diagnose the test failure and propose a fix");

for await (const event of events) {
  switch (event.type) {
    case "item.completed":
      console.log("item", event.item);
      break;
    case "turn.completed":
      console.log("usage", event.usage);
      break;
  }
}
```

## 结构化输出

Codex 智能体可以根据指定的 Schema 生成 JSON 响应。你可以为每轮对话以普通 JSON 对象的形式提供 Schema。

```typescript
const schema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    status: { type: "string", enum: ["ok", "action_required"] },
  },
  required: ["summary", "status"],
  additionalProperties: false,
} as const;

const turn = await thread.run("Summarize repository status", { outputSchema: schema });
console.log(turn.finalResponse);
```

你也可以使用 [`zod-to-json-schema`](https://www.npmjs.com/package/zod-to-json-schema) 包，从 [Zod schema](https://github.com/colinhacks/zod) 创建 JSON Schema，并将 `target` 设置为 `"openAi"`。

```typescript
const schema = z.object({
  summary: z.string(),
  status: z.enum(["ok", "action_required"]),
});

const turn = await thread.run("Summarize repository status", {
  outputSchema: zodToJsonSchema(schema, { target: "openAi" }),
});
console.log(turn.finalResponse);
```

## 附加图像

当你需要在文本旁包含图像时，请提供结构化的输入项。文本项会被连接到最终的提示词中，而图像项则通过 `--image` 参数传递给 Codex CLI。

```typescript
const turn = await thread.run([
  { type: "text", text: "Describe these screenshots" },
  { type: "local_image", path: "./ui.png" },
  { type: "local_image", path: "./diagram.jpg" },
]);
```

## 恢复现有线程

线程持久化存储在 `~/.codex/sessions` 中。如果你丢失了内存中的 `Thread` 对象，可以使用 `resumeThread()` 重新构建它并继续操作。

```typescript
const savedThreadId = process.env.CODEX_THREAD_ID!;
const thread = codex.resumeThread(savedThreadId);
await thread.run("Implement the fix");
```

## 工作目录控制

默认情况下，Codex 在当前工作目录下运行。为了避免不可恢复的错误，Codex 要求工作目录必须是一个 Git 仓库。你可以通过在创建线程时传递 `skipGitRepoCheck` 选项来跳过 Git 仓库检查。

```typescript
const thread = codex.startThread({
  workingDirectory: "/path/to/project",
  skipGitRepoCheck: true,
});
```

## 控制 Codex CLI 环境

默认情况下，Codex CLI 继承自 Node.js 的进程环境。在实例化 `Codex` 客户端时提供可选的 `env` 参数，可以完全控制 CLI 接收到的变量——这对于像 Electron 应用这样的沙箱宿主非常有用。

```typescript
const codex = new Codex({
  env: {
    PATH: "/usr/local/bin",
  },
});
```

SDK 仍会在你提供的环境之上注入其所需的变量（例如 `OPENAI_BASE_URL` 和 `CODEX_API_KEY`）。

## 传递 `--config` 配置覆盖

使用 `config` 选项可以提供额外的 Codex CLI 配置覆盖。SDK 接受一个 JSON 对象，将其扁平化为点分隔路径，并在将其作为重复的 `--config key=value` 标志传递之前，将值序列化为 TOML 字面量。

```typescript
const codex = new Codex({
  config: {
    show_raw_agent_reasoning: true,
    sandbox_workspace_write: { network_access: true },
  },
});
```

线程选项在设置重叠时仍具有优先权，因为它们在这些全局覆盖之后才发出。