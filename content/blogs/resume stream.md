---
title: Vercel AI SDK Resume Stream 原理
tags:
  - vercel
  - llm
  - stream
draft: false
description: 深入探讨 Vercel AI SDK 的流恢复机制（Resume Stream），解决流数据不可恢复和状态丢失的核心问题，提升 AI 应用的可靠性与用户体验。
source: https://github.com/vercel/resumable-stream
---

流（Stream）是短暂的 — 一旦数据流过就消失了。这导致两个核心问题：

1. **无法恢复**: 如果连接断开，已发送的流数据无法重新获取
2. **状态丢失**: 客户端无法从中断点继续接收数据

## Resume Stream 解决方案

Vercel AI SDK 提供了流恢复机制，允许在连接中断后从中断点继续流式传输。

### 核心原理

```
Client                    Server
  |                         |
  |---- 1. 请求流数据 -------->|
  |<--- 2. 流式响应 (chunk 1-5) |
  |     [连接中断]            |
  |                         |
  |---- 3. 重连请求 --------->|
  |     (携带 last seen ID)   |
  |<--- 4. 从 chunk 6 继续 ----|
```

### 实现要点

1. **消息 ID**: 每个 chunk 都有唯一标识
2. **客户端存储**: 记录最后接收的消息 ID
3. **服务端缓存**: 保留最近的流数据用于重传
4. **重连协商**: 重连时告知服务端从何处恢复

### 代码示例

```typescript
import { streamText } from "ai"

const result = streamText({
  model: openai("gpt-4o"),
  prompt: "Hello",
  // 启用恢复功能
  experimental_resume: {
    // 上次接收的最后消息 ID
    lastMessageId: previousLastMessageId,
  },
})
```

## 优势

- **可靠性**: 网络抖动不会导致数据丢失
- **用户体验**: 长文本生成不会因为断网而失败
- **资源节约**: 无需重新生成已完成的内容

---

_来源: Vercel AI SDK 文档_
