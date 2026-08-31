---
title: Effort 参数：控制 Claude 的 Token 消耗与响应深度
description: Anthropic Claude API 的 effort 参数完整中文翻译，涵盖 5 个努力级别、各模型推荐配置、与 thinking 的协作关系及最佳实践。
tags:
  - clippings
  - claude
  - api
  - effort
  - token-optimization
  - prompt-engineering
source: https://platform.claude.com/docs/en/build-with-claude/effort
created: 2026-07-27
---

## Effort 参数：控制 Claude 的 Token 消耗与响应深度

> 原文：[Effort](https://platform.claude.com/docs/en/build-with-claude/effort) 来源：Anthropic Claude Platform Docs

通过 `effort` 参数控制 Claude 响应时消耗的 Token 数量，在响应深度和 Token 效率之间做出权衡。

> 关于零数据保留（ZDR）如何适用于此功能，请参阅 [API 和数据保留](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)。

`effort` 参数允许你控制 Claude 响应请求时消耗多少 Token。你可以在单一模型上权衡响应深度和 Token 效率。`effort` 参数在以下模型上可用，无需 beta header。

`effort` 参数支持的模型：Claude Fable 5、Claude Mythos 5、Claude Opus 5、Claude Opus 4.8、Claude Mythos Preview、Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 5、Claude Sonnet 4.6 和 Claude Opus 4.5。

> 关于 effort 如何与 thinking 交互以及该选用哪个控制参数，请参阅 [Thinking 与 Effort](https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-and-effort)。在支持自适应 thinking 的情况下，effort 是控制思考深度的推荐方式。

## Effort 的工作原理

默认情况下，Claude 使用 **high（高）** 努力级别，消耗所需的 Token 以获得出色结果。你可以将努力级别提升到 `max` 以获得绝对最高能力，或降低它以更加保守地使用 Token，在优化速度和成本的同时接受一定程度的能力下降。

将 `effort` 设置为 `"high"` 与完全省略 `effort` 参数的行为完全一致。

`effort` 参数影响响应中的**所有 Token**，包括：

- 文本回复和解释
- 工具调用和函数参数
- 思考过程（当启用时）

这种方式有两大优势：

1. 它不需要启用 thinking。
2. 它可以影响所有 Token 消耗，包括工具调用。例如，较低的 effort 意味着 Claude 会进行更少的工具调用。这为你提供了更大的效率控制力度。

### 努力级别

| 级别     | 描述                                                                                                                                       | 典型用例                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `max`    | 绝对最高能力，无 Token 消耗限制。Claude Fable 5、Mythos 5、Opus 5、Opus 4.8、Mythos Preview、Opus 4.7、Opus 4.6、Sonnet 5、Sonnet 4.6 可用 | 需要最深度推理和最透彻分析的任务                                   |
| `xhigh`  | 面向长周期工作的扩展能力。Claude Fable 5、Mythos 5、Opus 5、Opus 4.8、Opus 4.7、Sonnet 5 可用                                              | 长时间运行的智能体和编码任务（超过 30 分钟），Token 预算达百万级别 |
| `high`   | 高能力。等同于不设置参数                                                                                                                   | 复杂推理、困难的编码问题、智能体任务                               |
| `medium` | 平衡方案，适度节省 Token                                                                                                                   | 需要平衡速度、成本和性能的智能体任务                               |
| `low`    | 最高效率。大幅节省 Token，部分能力下降                                                                                                     | 需要最快速度和最低成本的简单任务，如子智能体                       |

`xhigh` 是较新的级别；部分支持 `max` 的模型尚不支持 `xhigh`。

Effort 是一个**行为信号**，而非严格的 Token 预算。在较低努力级别下，Claude 在遇到足够困难的问题时仍会思考，但相比同一问题在更高努力级别下，思考会更少。

### Claude Sonnet 5 推荐努力级别

Claude Sonnet 5 在 Claude API 和 Claude Code 上默认为 `high`。

- **High effort（默认）：** 适用于复杂推理、编码和智能体任务，质量优先于速度或成本。
- **Xhigh effort：** 用于最困难的编码和智能体任务。参考 [Prompting Claude Sonnet 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5#calibrating-effort-and-thinking-depth)。
- **Medium effort：** 从默认级别降低以节约成本。相当于 Claude Sonnet 4.6 的 high 努力级别。
- **Low effort：** 用于高吞吐量或延迟敏感的工作负载。适用于需要更快响应的聊天和非编码场景。
- **Max effort：** 用于需要绝对最高能力且无 Token 约束的任务。

### Claude Sonnet 4.6 推荐努力级别

Sonnet 4.6 默认为 `high`。在使用 Sonnet 4.6 时显式设置 effort 以避免意外的延迟：

- **Medium effort（推荐默认值）：** 对于大多数应用，这是速度、成本和性能的最佳平衡。适用于智能体编码、工具密集型工作流和代码生成。
- **Low effort：** 用于高吞吐量或延迟敏感的工作负载。适用于优先追求更快响应的聊天和非编码场景。
- **High effort：** 用于复杂推理和质量优先于速度或成本的任务。
- **Max effort：** 用于需要绝对最高能力且无 Token 约束的任务。

### Claude Opus 4.7 推荐努力级别

**编码和智能体用例从 `xhigh` 开始**，对大多数智能敏感型工作负载，`high` 是最低要求。降至 `medium` 用于成本敏感型工作负载，仅在你的评估显示 `xhigh` 仍有可测量的提升空间时才升到 `max`。

API 默认值为 `high`。要使用 `xhigh`，请显式设置 `effort`；你传入的值将覆盖默认值。

| Effort   | Claude Opus 4.7 使用指南                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `low`    | 高效，但最适合短小、范围有限的任务。如果任务有多个部分，将 `low` 与显式检查清单搭配使用                                                    |
| `medium` | 适用于你需要良好结果同时降低成本的常规工作流                                                                                               |
| `high`   | 需要平衡智能和 Token 消耗的高级用例。通常这是质量和 Token 效率之间的最佳平衡点                                                             |
| `xhigh`  | 编码和智能体工作的推荐起点，也适用于探索性任务如重复工具调用、详细网页搜索和知识库搜索。预期 Token 使用量明显高于 `high`                   |
| `max`    | 保留给真正的前沿问题。在大多数工作负载上，`max` 会大幅增加成本而质量提升相对较小；在某些结构化输出或不那么智能敏感的任务上可能导致过度思考 |

Claude Opus 4.7 比 Opus 4.6 更严格地遵守努力级别，尤其在 `low` 和 `medium` 下。在较低努力级别下，模型会将工作范围限制在所要求的内容内，而不是做出超出要求的事情。如果观察到 Opus 4.7 在复杂问题上推理深度不足，应提高 effort 而非通过提示词绕过它。如果因延迟必须保持低 effort，可添加针对性指导，如 "此任务涉及多步骤推理。请在回答前仔细思考。"

在 `xhigh` 或 `max` 努力级别下运行 Claude Opus 4.7 时，请设置较大的 `max_tokens`，以便模型有足够空间在子智能体和工具调用中进行思考和行动。从 64k Token 开始并根据需要调整是一个合理的默认值。

### Claude Opus 4.8 推荐努力级别

Claude Opus 4.7 的指南同样适用于 Opus 4.8。**编码和智能体用例从 `xhigh` 开始**，大多数其他智能敏感型工作负载使用 `high`，仅在评估确认较低级别能保持质量时才降到 `medium` 或 `low`。

API 默认值为 `high`。请显式设置 `effort` 以使用不同级别。

在 `xhigh` 或 `max` 努力级别下运行 Claude Opus 4.8 时，请设置较大的 `max_tokens`。从 64k Token 开始调整是合理的默认值。

### Claude Opus 5 推荐努力级别

Claude Opus 5 支持全部五个努力级别。**从默认的 `high` 开始**，基于你的评估进行调整：升级到 `xhigh` 用于高要求的编码和智能体工作，或升到 `max` 当任务值得无约束的 Token 消耗；在评估确认质量得以保持的情况下，可大胆使用 `low` 和 `medium` 作为 Token 成本和响应时间的主要控制手段。如果你从早期模型继承了 effort 设置，请基于评估重新进行 effort 扫描，而非直接复用。

Effort 控制思考量，而非可见的回复长度：在 Claude Opus 5 上，更改 effort 并不会可靠地缩短回复，因此应改为[通过提示词控制长度](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5#response-length-and-verbosity)。

API 默认值为 `high`。请显式设置 `effort` 以使用不同级别。

在 Claude Opus 5 上，`xhigh` 或 `max` 努力级别下无法禁用 thinking：在这些级别设置 `thinking: {"type": "disabled"}` 的请求将返回 400 错误。参见 [Effort 与 Thinking 的交互](#effort-与-thinking-的交互)。

在 `xhigh` 或 `max` 努力级别下运行 Claude Opus 5 时，请设置较大的 `max_tokens`。从 64k Token 开始调整是合理的默认值。

### Claude Fable 5 推荐努力级别

Effort 是 Claude Fable 5 上权衡智能、延迟和成本的主要控制手段。**大多数任务从默认的 `high` 开始**，对最能力敏感的工作负载使用 `xhigh`，对常规工作降至 `medium` 或 `low`。Claude Fable 5 在较低 effort 设置下仍表现良好，常常超过之前模型 `xhigh` 的性能。在 `high` 和 `xhigh` 下，设置较大的 `max_tokens`：它是总输出（思考 + 回复文本）的硬性限制。参见[成本控制](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost#cost-control)。

如果任务完成但耗时超出必要，或希望获得更快、更具交互性的工作方式，降低 effort。同样的建议适用于 Claude Mythos 5。更完整的指南请参阅 [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5)。

## 基本用法

```bash cURL
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-opus-5",
    "max_tokens": 4096,
    "messages": [{
      "role": "user",
      "content": "分析微服务和单体架构之间的权衡"
    }],
    "output_config": {
      "effort": "medium"
    }
  }'
```

```python Python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-5",
    max_tokens=4096,
    messages=[
        {
            "role": "user",
            "content": "分析微服务和单体架构之间的权衡",
        }
    ],
    output_config={"effort": "medium"},
)

for block in response.content:
    if block.type == "text":
        print(block.text)
```

```typescript TypeScript
const client = new Anthropic()

const response = await client.messages.create({
  model: "claude-opus-5",
  max_tokens: 4096,
  messages: [
    {
      role: "user",
      content: "分析微服务和单体架构之间的权衡",
    },
  ],
  output_config: {
    effort: "medium",
  },
})

const textBlock = response.content.find(
  (block): block is Anthropic.TextBlock => block.type === "text",
)
console.log(textBlock?.text)
```

## 何时调整 effort 参数

- 使用 **max effort** 当你需要绝对最高能力且无约束时：最透彻的推理和最深入的分析。Claude 4.6 及更新模型和 Claude Mythos Preview 可用。
- 使用 **xhigh effort** 用于需要扩展探索的高级编码和复杂智能体工作，如重复工具调用和详细搜索。Claude Fable 5、Mythos 5、Opus 5、Opus 4.8、Opus 4.7 和 Sonnet 5 可用。
- 使用 **high effort**（默认值）用于复杂推理、精细分析、困难的编码问题，或任何质量优先于速度或成本的任务。
- 使用 **medium effort** 作为平衡选项，当你希望获得扎实性能但不想付出 high effort 的全部 Token 开销时。
- 使用 **low effort** 当你优化速度或成本时（因为 Claude 用更少的 Token 回复）。例如，简单分类任务、快速查找，或边际质量提升无法证明额外延迟或开销合理的高吞吐量场景。

## Effort 与工具使用

当使用工具时，effort 参数同时影响工具调用周围的解释和工具调用本身。较低努力级别倾向于：

- 将多个操作合并为更少的工具调用
- 进行更少的工具调用
- 直接行动，无前言铺垫
- 完成后使用简洁的确认消息

较高努力级别可能：

- 进行更多的工具调用
- 在行动前解释计划
- 提供详细的变更摘要
- 包含更全面的代码注释

## Effort 与 Thinking 的交互

`thinking` 参数控制 Claude 是否在回答前以 [thinking blocks](https://platform.claude.com/docs/en/build-with-claude/thinking) 进行思考；`effort` 参数控制 Claude 在整个响应中投入多少工作量，在自适应模式下包括思考的频率和深度。不要将 `adaptive` 作为 `effort` 值传递：`adaptive` 是 thinking 模式，而非 effort 级别。

在较高努力级别下，Claude 在大多数请求上都会思考且篇幅更长；在较低级别下，对于更简单的问题可以完全跳过思考。关于这两个控制参数如何协作的完整指南，请参见 [Thinking 与 Effort](https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-and-effort)。

在 Claude Opus 4.5（唯一支持 effort 的扩展思考专用模型）上，effort 与 [`budget_tokens`](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) 配合使用：为你的任务设置努力级别，然后根据任务需要的推理深度设置 thinking Token 预算。

关于各模型 thinking 可用性，请参见[模型配置表](https://platform.claude.com/docs/en/build-with-claude/thinking-troubleshooting#supported-models)。Effort 可以在有或没有 thinking 的情况下工作；参见 [Effort 的工作原理](#effort-的工作原理)。

## 在对话中间更改 effort

`output_config.effort` 是请求级别的设置：每个请求携带自己的值，因此要在对话的后续部分以不同 effort 级别运行，只需在下一次请求上设置新值。Effort 级别应用于整个请求。由于 effort 会影响渲染后的提示词，在请求之间更改它会使得之前轮次的缓存前缀失效；如果你在长会话中依赖[提示词缓存](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)，请在开始时选择一个 effort 级别并保持不变。

## 最佳实践

1. **显式设置 effort：** API 默认为 `high`，但正确的起点取决于你的模型和工作负载。
2. **对速度敏感或简单任务使用 low：** 当延迟重要或任务简单时，low effort 可以显著减少响应时间和成本。
3. **测试你的用例：** Effort 级别的影响因任务类型而异。在部署前评估在你的具体用例上的表现。
4. **考虑动态 effort：** 根据任务复杂度调整 effort。简单查询可能适合 low effort，而智能体编码和复杂推理则受益于 high effort。在同一对话中变化 effort 之前请参阅下一条。
5. **在缓存的对话中保持 effort 不变：** 在请求之间更改 effort 值会使[提示词缓存](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)失效，因此应在不同工作负载间变化 effort，而非在依赖缓存命中的对话内变化。参见 [Thinking 与提示词缓存](https://platform.claude.com/docs/en/build-with-claude/thinking#thinking-and-prompt-caching)。

---

> **译者注**：`effort` 是 Anthropic 在 Claude 5 代模型中引入的关键成本控制机制。它的核心哲学是——用一个简单的五级参数替代过去分散在各处的 Token 预算、thinking budget、提示词压缩等优化手段。对于国内开发者来说，最实用的 takeaway 是：Opus 5 从 `high` 开始、Sonnet 5 保持默认 `high`、走成本优化路线用 `medium`；如果你在用 Opus 4.7/4.8 做编码智能体，直接上 `xhigh`。另外务必注意：effort 和 prompt caching 互斥——改了 effort 缓存就失效，长会话建议一开始就定好级别。
