---
title: Claude Agent Adaptive Thinking
tags:
  - agent
  - claude
  - sdk
  - reasoning
  - thinking
description: Claude adaptive thinking 的中文整理、迁移建议与 TypeScript 示例
source: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
---

`adaptive thinking` 是 Claude 4 系列里更推荐的思考模式。它不再要求你手工分配 `budget_tokens`，而是让模型根据请求复杂度决定是否进入 extended thinking，以及要投入多少思考预算。

这篇笔记建议和 [[claude-agent-effort]] 一起看：前者解决“要不要思考、思考多少”，后者解决“整体出手有多保守或激进”。

> [!note] 一句话总结
> 新模型优先使用 `thinking: { type: "adaptive" }`，再用 `output_config.effort` 调整思考深度；除非你必须精确控制延迟和 token 预算，否则不要再默认选择 `budget_tokens` 模式。

> [!info] 数据保留
> 官方文档说明，此功能可用于 Zero Data Retention（ZDR）场景；如果你的组织启用了 ZDR，相关请求数据会在 API 返回后不保留。

## 核心结论

- Adaptive thinking 是 Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 4.6 的推荐做法。
- Claude Mythos Preview 默认就是 adaptive thinking；当 `thinking` 未设置时会自动启用。
- 在 Claude Opus 4.7 上，adaptive thinking 是唯一受支持的 thinking 模式；`thinking: { type: "enabled", budget_tokens: N }` 会直接被拒绝。
- 在 Claude Opus 4.6 和 Claude Sonnet 4.6 上，`budget_tokens` 方案仍可用，但已被官方标记为废弃，不再推荐作为新配置。
- Adaptive 模式会自动开启 interleaved thinking，因此尤其适合需要工具调用和多步规划的 agent 工作流。

## 支持模型

| 模型                    | 支持情况 | 备注                                                       |
| ----------------------- | -------- | ---------------------------------------------------------- |
| `claude-mythos-preview` | 支持     | 默认启用 adaptive；不支持 `thinking: { type: "disabled" }` |
| `claude-opus-4-7`       | 支持     | 只有 adaptive 可用；若使用手工 `enabled` 模式会返回 400    |
| `claude-opus-4-6`       | 支持     | 推荐 adaptive；手工 `budget_tokens` 已废弃                 |
| `claude-sonnet-4-6`     | 支持     | 推荐 adaptive；手工 `budget_tokens` 已废弃                 |

> [!warning] 兼容性提醒
> Sonnet 4.5、Opus 4.5 及更老模型不支持 adaptive thinking。这些模型仍需要 `thinking: { type: "enabled", budget_tokens: N }`。

## 工作方式

在 adaptive 模式下，是否思考不再是强制的，而是由 Claude 根据任务复杂度自行判断：

- 默认 `effort` 为 `high`，这时 Claude 几乎总会思考。
- 当 `effort` 降到 `medium` 或 `low` 时，简单问题可能会直接跳过 thinking，以换取更低延迟。
- 由于 adaptive 自带 interleaved thinking，Claude 可以在工具调用之间继续思考，这一点对 agent 场景非常重要。

## TypeScript 示例

### 最小可用示例

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const response = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 16000,
  thinking: {
    type: "adaptive",
  },
  messages: [
    {
      role: "user",
      content: "解释为什么两个偶数相加一定还是偶数。",
    },
  ],
})

for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text)
  }
}
```

> [!tip] 想看到 thinking 文本
> 在 Opus 4.7 和 Mythos Preview 上，`thinking.display` 默认是 `"omitted"`。如果你希望在响应里拿到 thinking 摘要，需要显式设置 `display: "summarized"`。

### 配合 effort 参数使用

`effort` 是对“思考强度”的软指导，不是硬 token 上限。最常见的组合是 adaptive + effort：

| 档位     | 含义           | 说明                                                |
| -------- | -------------- | --------------------------------------------------- |
| `max`    | 不限制思考深度 | Mythos Preview、Opus 4.7、Opus 4.6、Sonnet 4.6 可用 |
| `xhigh`  | 很深的思考     | 仅 Opus 4.7 可用                                    |
| `high`   | 深度思考       | 默认值                                              |
| `medium` | 中等思考       | 简单请求可能跳过 thinking                           |
| `low`    | 最保守         | 更看重速度和成本                                    |

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const response = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 16000,
  thinking: {
    type: "adaptive",
  },
  output_config: {
    effort: "medium",
  },
  messages: [
    {
      role: "user",
      content: "法国的首都是什么？",
    },
  ],
})

for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text)
  }
}
```

### 流式输出

Adaptive thinking 与 streaming 可以直接配合使用；thinking 内容会和文本一样以事件流形式返回。

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const stream = await client.messages.stream({
  model: "claude-opus-4-7",
  max_tokens: 16000,
  thinking: {
    type: "adaptive",
    display: "summarized",
  },
  messages: [
    {
      role: "user",
      content: "求 1071 和 462 的最大公约数，并解释你的推导过程。",
    },
  ],
})

for await (const event of stream) {
  if (event.type === "content_block_delta") {
    if (event.delta.type === "thinking_delta") {
      process.stdout.write(event.delta.thinking)
    } else if (event.delta.type === "text_delta") {
      process.stdout.write(event.delta.text)
    }
  }
}
```

## Adaptive、Manual、Disabled 的区别

| 模式     | 配置方式                                          | 适用范围                                                       | 适合什么场景                                            |
| -------- | ------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| Adaptive | `thinking: { type: "adaptive" }`                  | Mythos Preview、Opus 4.7、Opus 4.6、Sonnet 4.6                 | 让 Claude 自己判断何时思考，最适合 agent 和通用生产场景 |
| Manual   | `thinking: { type: "enabled", budget_tokens: N }` | 除 Opus 4.7 外的多数旧模型；在 Opus 4.6 和 Sonnet 4.6 上已废弃 | 需要精确限制 thinking token 预算                        |
| Disabled | 省略 `thinking` 或传 `{ type: "disabled" }`       | 除 Mythos Preview 外可用                                       | 不需要 extended thinking，希望延迟最低                  |

> [!note] 模式迁移建议
> 如果你正在维护 Opus 4.6 或 Sonnet 4.6 的旧配置，优先把 `budget_tokens` 迁移成 `adaptive + effort`。如果你已经升级到 Opus 4.7，这一步不是“建议”，而是必须做。

> [!info] Interleaved thinking 差异
> Adaptive 模式下，Mythos Preview、Opus 4.7、Opus 4.6、Sonnet 4.6 都会自动启用 interleaved thinking。手工 thinking 在 Sonnet 4.6 仍可通过 beta header 使用 interleaved thinking，但在 Opus 4.6 的 manual 模式下不可用。

## 重要注意事项

### 1. 对话校验规则更宽松

Adaptive 模式下，前一轮 assistant 消息不必再以 thinking block 开头；这一点比 manual 模式更灵活。

### 2. Prompt caching 会受 thinking 模式切换影响

连续使用 `adaptive` 模式时，消息级的 prompt cache 断点可以延续；但如果在 `adaptive` 与 `enabled` / `disabled` 之间来回切换，消息级缓存断点会失效。系统提示词和工具定义的缓存不受这个影响。

### 3. 可以用提示词调整“是否常思考”

官方明确提到，adaptive 的触发频率是可提示的。如果 Claude 思考得太频繁或太保守，可以在 system prompt 里加引导，告诉它只有在多步推理真的能提升结果质量时才启用 thinking。

> [!warning] 调优风险
> 如果你用提示词强行降低 thinking 频率，可能会损害复杂任务上的质量。更稳妥的做法通常是先调低 `effort`，再观察真实任务上的效果。

### 4. 成本控制仍然要靠 `max_tokens`

`max_tokens` 是总输出上限，包含 thinking 和最终回答两部分。`effort` 只是在这个上限之内，软性引导 Claude 愿意分配多少思考预算。

- 在 `high`、`xhigh`、`max` 下，Claude 更容易消耗大量 thinking tokens。
- 如果响应里频繁出现 `stop_reason: "max_tokens"`，说明总预算太紧了。
- 这时通常有两个方向：增大 `max_tokens`，或者降低 `effort`。

## Thinking Block 的展示方式

### summarized 与 omitted

`thinking.display` 用来控制 API 响应里如何返回 thinking 文本：

- `"summarized"`：返回摘要后的 thinking 内容。
- `"omitted"`：仍会返回 thinking block，但 `thinking` 字段为空，只保留签名信息用于多轮上下文延续。

默认值因模型而异：

- Opus 4.6、Sonnet 4.6 以及更早的 Claude 4 模型，默认是 `"summarized"`。
- Opus 4.7 和 Mythos Preview，默认是 `"omitted"`。

```typescript
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

const response = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 16000,
  thinking: {
    type: "adaptive",
    display: "summarized",
  },
  messages: [
    {
      role: "user",
      content: "对比 monorepo 和 polyrepo 的主要权衡。",
    },
  ],
})

console.log(response.content)
```

> [!note] 一个容易踩坑的点
> 即使你把 `display` 设为 `"omitted"`，thinking token 的计费依然不会减少。它降低的是展示量和首字延迟，不是成本。

### summarized thinking 的含义

Claude 4 系列默认不会把完整 thinking 直接暴露给你，而是返回一个经过摘要的 thinking 版本。这样既保留推理收益，也减少滥用风险。

需要注意的是：

- 实际计费按 Claude 内部生成的完整 thinking tokens 计算。
- 你在响应里看到的 thinking 文本长度，和账单中的 output token 数可能对不上。
- 摘要行为未来可能继续调整，因此不要依赖某种固定的 thinking 文本格式做程序解析。

### thinking encryption

完整 thinking 会以加密形式存到 `signature` 字段里，用来在多轮对话里验证这些 thinking block 的来源是否来自 Claude。

- `signature` 是不透明字段，不应该自行解析。
- 流式响应时，签名会在 thinking block 结束前通过 `signature_delta` 事件追加。
- 如果你需要把 thinking block 回传给下一轮请求，最好原样传回，不要自行篡改。

## 计费理解

开启 thinking 后，成本主要来自三部分：

- 当前请求里 Claude 产生的 thinking tokens。
- 某些模型会保留到上下文中的历史 thinking blocks。
- 正常的文本输出 tokens。

如果使用的是 summarized thinking：

- 账单里的 output tokens 按“完整 thinking”计费。
- 你看到的只是摘要版 thinking。
- 生成摘要本身不会额外收费。

如果使用的是 `display: "omitted"`：

- 账单仍按完整 thinking 计费。
- 响应里看不到 thinking 文本。
- 更适合不打算向用户展示推理过程的后台型系统。

## 最佳实践

- 在新模型上默认使用 adaptive thinking，不要把 manual thinking 当成首选。
- 把 `adaptive` 和 [[claude-agent-effort]] 配合起来看：前者决定“是否思考”，后者决定“思考和行动有多激进”。
- 对 Opus 4.7 来说，如果你希望看到 thinking 内容，记得显式设置 `display: "summarized"`。
- 对延迟敏感场景，先尝试 `effort: "medium"` 或 `effort: "low"`，不要一上来用 `high`。
- 对复杂 agent 工作流，adaptive 往往比固定 `budget_tokens` 更自然，因为它能在工具调用之间持续思考。
- 如果需要稳定缓存命中，不要频繁在 `adaptive`、`enabled`、`disabled` 之间切换。
