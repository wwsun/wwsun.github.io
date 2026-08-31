---
title: 将会话持久化到外部存储 — Claude Agent SDK
description: Claude Agent SDK SessionStore 接口的中文翻译，介绍如何将会话转录镜像到 S3、Redis、Postgres 等外部后端
tags:
  - claude-agent-sdk
  - clippings
  - session-storage
  - typescript
source: https://code.claude.com/docs/en/agent-sdk/session-storage
---

## 概述

默认情况下，SDK 将会话转录写入本地文件系统 `~/.claude/projects/` 下的 JSONL 文件。通过 `SessionStore` 适配器，你可以将这些转录镜像到自己的后端（如 S3、Redis 或数据库），使在一台主机上创建的会话可以在另一台主机上恢复。

使用会话存储的常见原因：

- **多主机部署。** 无服务器函数、自动扩缩容的 worker 和 CI runner 不共享文件系统。共享存储让任何副本都能恢复任意会话。
- **持久性。** 本地容器是临时的。由 S3 或数据库支持的存储在重启和重新部署后依然存在。
- **合规与审计。** 将转录保留在你已管理的存储中，使用你自己的保留规则、加密和访问控制。

## `SessionStore` 接口

`SessionStore` 是一个包含两个必需方法（`append` 和 `load`）和三个可选方法的对象。SDK 在查询期间调用 `append` 写入转录条目，在恢复时调用 `load` 读取它们。

`SessionKey` 定位一个转录。`projectKey` 是工作目录的稳定、文件系统安全的编码，`sessionId` 是会话 UUID，`subpath` 在条目属于子智能体转录或附属文件（而非主对话）时设置。将 `subpath` 视为不透明的键后缀；它遵循磁盘布局，例如 `subagents/agent-<id>`。当 `subpath` 为 undefined 时，键指向主转录。

| 方法           | 必需 | 调用时机                                                                                                                                          |
| -------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `append`       | 是   | 每批转录条目写入本地后调用。条目是 JSON 安全对象，在本地 JSONL 中每行一个。                                                                       |
| `load`         | 是   | 子进程生成前调用一次，当设置了 `resume` 时。如果会话未知，返回 `null`。                                                                           |
| `listSessions` | 否   | 由 `listSessions({ sessionStore })` 以及带 `continue: true` 的 `query()`/`startup()` 调用。如果未定义，这些调用会抛出异常。                       |
| `delete`       | 否   | 由 `deleteSession({ sessionStore })` 调用。删除主键（无 `subpath`）时必须级联删除该会话的所有子键。如果未定义，删除为无操作，适合同步追加的后端。 |
| `listSubkeys`  | 否   | 在恢复期间调用，用于发现子智能体转录。如果未定义，只恢复主转录。                                                                                  |

## 快速开始

SDK 内置了一个 `InMemorySessionStore` 用于开发和测试。下面的示例运行一个附带存储的查询，从结果消息中捕获会话 ID，然后在第二次 `query()` 调用中从存储恢复。第二次调用传入相同的存储实例加上 `resume`，因此 SDK 从存储而不是本地文件系统加载转录：

## 编写自己的适配器

针对你的后端实现 `append` 和 `load`。如果你希望 `listSessions()`、`deleteSession()` 和子智能体恢复能够针对存储工作，还需要添加 `listSessions`、`delete` 和 `listSubkeys`。

传递给 `append` 的条目类型为 `SessionStoreEntry`（`{ type: string; ... }` 对象）。将它们视为不透明的 JSON 安全值：按顺序持久化它们，并从 `load` 以相同顺序返回它们。`load` 必须返回与追加时深度相等的条目；不需要字节相等的序列化，所以像 Postgres `jsonb` 这样会重新排列对象键的后端是没问题的。

## 参考实现

TypeScript SDK 仓库在 [`examples/session-stores/`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores) 下包含了可运行的 S3、Redis 和 Postgres 参考适配器。它们没有发布到 npm；将你需要的 `src/` 文件复制到项目中并安装相应的后端客户端。

| 适配器                                                                                                                         | 后端客户端           | 存储模型                                                           |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------------------------------------------------------ |
| [`S3SessionStore`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores/s3)             | `@aws-sdk/client-s3` | 每次 `append()` 一个 JSONL part 文件；`load()` 列出、排序并拼接。  |
| [`RedisSessionStore`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores/redis)       | `ioredis`            | 每个转录对应一个 `RPUSH`/`LRANGE` 列表，加上一个有序集合会话索引。 |
| [`PostgresSessionStore`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores/postgres) | `pg`                 | 在 `jsonb` 表中每条记录一行，按 `BIGSERIAL` 排序。                 |

每个适配器接收一个预配置的客户端实例，因此你可以控制凭证、TLS、区域和连接池。例如，使用 S3：

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk"
import { S3Client } from "@aws-sdk/client-s3"
import { S3SessionStore } from "./S3SessionStore" // 从 examples/session-stores/s3 复制

const store = new S3SessionStore({
  bucket: "my-claude-sessions",
  prefix: "transcripts",
  client: new S3Client({ region: "us-east-1" }),
})

for await (const message of query({
  prompt: "Hello!",
  options: { sessionStore: store },
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result)
  }
}

// 稍后，可能在另一台主机上：
for await (const message of query({
  prompt: "Continue where we left off",
  options: { sessionStore: store, resume: "previous-session-id" },
})) {
  // ...
}
```

### 验证你的适配器

两个 SDK 都提供了一致性测试套件，用于断言 `append`、`load` 以及可选方法必须满足的行为契约。可选方法的测试在未实现这些方法时会自动跳过。

在 TypeScript 中，将 [`shared/conformance.ts`](https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/examples/session-stores/shared/conformance.ts) 从示例目录复制到测试套件中。在 Python 中，测试套件内置在包中：

```python
import pytest
from claude_agent_sdk.testing import run_session_store_conformance

@pytest.mark.asyncio
async def test_my_store_conformance():
    await run_session_store_conformance(MyRedisStore)
```

## 行为说明

### 双写架构

存储是镜像，而非替代品。Claude Code 子进程始终首先写入本地磁盘；SDK 然后将每批数据转发给 `append()`。如果你希望本地副本是临时的，可以在 `options.env` 中将 `CLAUDE_CONFIG_DIR` 指向临时目录。由于镜像依赖于本地写入，`sessionStore` 不能与 `persistSession: false` 同时使用；如果同时设置两者，SDK 会抛出异常。与 `enableFileCheckpointing` 同时使用也会抛出异常，因为文件历史备份 blob 是直接写入本地磁盘的，不会镜像到存储。

### 镜像写入是尽力而为的

如果 `append()` 被拒绝或超时，错误会被记录，迭代器中会发出 `{ type: "system", subtype: "mirror_error" }` 消息，查询会继续。本地转录已经在磁盘上持久化，所以存储故障不会中断智能体或丢失本地数据。失败的批次不会重试，因此如果你需要检测存储数据丢失，需要监控 `mirror_error`。

### `getSessionMessages` 返回压缩后的链

`getSessionMessages({ sessionStore })` 返回智能体在恢复时会看到的消息链。自动压缩后，较早的轮次会被摘要替换，因此一个存储了 503 条原始记录的会话可能只从 `getSessionMessages` 返回 18 条消息。要获取完整的原始历史记录（包括压缩前的轮次和元数据条目），可以直接调用 `store.load(key)`。

### `forkSession` 不是字节拷贝

`forkSession({ sessionStore })` 读取源条目，重写每个 `sessionId` 字段并重新映射消息 UUID，然后以新键追加转换后的条目。适配器级别的复制或 `CopyObject` 快捷方式会产生仍然引用旧会话 ID 的转录，因此 SDK 不使用这种方式。

### 子智能体转录

子智能体转录以 `subpath: "subagents/agent-<id>"` 镜像。`listSubagents({ sessionStore })` 要求适配器实现 `listSubkeys`；`getSubagentMessages({ sessionStore })` 在可用时使用它，但在未定义时回退到直接子路径。恢复也会调用 `listSubkeys` 来恢复子智能体文件；没有它，只有主转录会被重建。

### 保留策略

SDK 永远不会自行从你的存储中删除数据。保留是适配器的责任：根据你的合规要求实现 TTL、S3 生命周期策略或定时清理。`CLAUDE_CONFIG_DIR` 下的本地转录由 `cleanupPeriodDays` 设置独立清理。

## 支持的函数

以下 SDK 函数接受 `sessionStore` 选项，并在提供时针对存储（而非本地文件系统）操作：

- [`query()`](https://code.claude.com/docs/en/agent-sdk/typescript#query)
- [`startup()`](https://code.claude.com/docs/en/agent-sdk/typescript#startup)
- [`listSessions()`](https://code.claude.com/docs/en/agent-sdk/typescript#listsessions)
- [`getSessionInfo()`](https://code.claude.com/docs/en/agent-sdk/typescript#getsessioninfo)
- [`getSessionMessages()`](https://code.claude.com/docs/en/agent-sdk/typescript#getsessionmessages)
- [`renameSession()`](https://code.claude.com/docs/en/agent-sdk/typescript#renamesession)
- [`tagSession()`](https://code.claude.com/docs/en/agent-sdk/typescript#tagsession)
- [`deleteSession()`](https://code.claude.com/docs/en/agent-sdk/typescript)
- [`forkSession()`](https://code.claude.com/docs/en/agent-sdk/typescript)
- [`listSubagents()`](https://code.claude.com/docs/en/agent-sdk/typescript)
- [`getSubagentMessages()`](https://code.claude.com/docs/en/agent-sdk/typescript)

## 相关文档

- [使用会话](https://code.claude.com/docs/en/agent-sdk/sessions)：无需自定义存储即可继续、恢复和分叉
- [托管 SDK](https://code.claude.com/docs/en/agent-sdk/hosting)：多主机环境的部署模式
- [TypeScript `Options`](https://code.claude.com/docs/en/agent-sdk/typescript#options)：完整选项参考
- [`examples/session-stores/`](https://github.com/anthropics/claude-agent-sdk-typescript/tree/main/examples/session-stores)：可运行的 S3、Redis 和 Postgres 参考适配器
