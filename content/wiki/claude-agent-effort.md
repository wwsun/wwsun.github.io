---
title: Claude Agent Effort
tags:
  - agent
  - claude
  - sdk
  - reasoning
description: Claude Agent SDK 中 effort 参数的中文翻译整理与选型建议
source: https://platform.claude.com/docs/en/build-with-claude/effort
---

`effort` 用来控制 Claude 在回答时愿意消耗多少 token，本质上是在“回答更充分”与“更省 token、更低延迟”之间做权衡。它是一个行为信号，不是硬性的 token 上限；同一个任务在 `low` 和 `high` 下都可能思考，但高档位通常会更愿意展开推理、调用工具和补充解释。

这篇文档主要适用于 Claude Agent SDK / Messages API 场景，也和 [[claude-agent-sandbox]]、[[claude-code]] 这类 agent 化工作流直接相关。

> [!note] 一句话总结
> 默认不写 `effort` 就等于 `high`。如果你在做复杂编码或 agent 工作流，`high` 往上调；如果你在做高并发、低时延或简单任务，优先考虑 `medium` 或 `low`。

## 核心结论

- `effort` 已经是受支持模型上的通用参数，不需要 beta header。
- 它影响的是**整个响应的 token 开销**，不仅影响文字解释，还会影响工具调用、函数参数，以及开启 extended thinking 时的思考消耗。
- 它不依赖 thinking 才能生效；即便不开 thinking，`effort` 也会影响回答长度和工具使用倾向。
- 对 Claude Opus 4.6 和 Claude Sonnet 4.6 来说，`effort` 已取代 `budget_tokens` 成为推荐的思考深度控制方式；`budget_tokens` 虽仍可用，但已经被标记为废弃，未来会移除。

## 支持情况

文档指出，`effort` 当前支持 Claude Mythos Preview、Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 4.6，以及 Claude Opus 4.5。

其中：

- `max` 仅在 Claude Mythos Preview、Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 4.6 上可用。
- `xhigh` 仅在 Claude Opus 4.7 上可用。

## effort 档位翻译

| 档位     | 中文理解                      | 适合场景                                                  |
| -------- | ----------------------------- | --------------------------------------------------------- |
| `max`    | 不设 token 节制，追求最高能力 | 极难推理、最深入分析、真正接近能力上限的问题              |
| `xhigh`  | 长周期高强度工作模式          | 超过 30 分钟的 agent/coding 任务，且 token 预算可达百万级 |
| `high`   | 高能力模式，也是默认值        | 复杂推理、困难编码、agent 任务                            |
| `medium` | 平衡模式                      | 想兼顾速度、成本和质量的常规 agent 工作流                 |
| `low`    | 最节省模式                    | 简单任务、子代理、高吞吐、低时延场景                      |

> [!tip] 默认行为
> `effort: "high"` 与完全省略 `effort` 的行为完全一致。

## 原理与影响

较低的 `effort` 通常会让 Claude 更克制地花 token，因此更可能：

- 合并多步操作，减少工具调用次数。
- 直接执行，不写太多前置说明。
- 在完成后只给简短确认，而不是长篇总结。

较高的 `effort` 则更可能：

- 做更多工具调用与探索。
- 先讲计划，再开始行动。
- 输出更详细的修改总结和解释。
- 在代码里补充更完整的注释。

这也是 `effort` 比单纯控制 thinking token 更实用的地方，因为它能影响**工具调用本身**，而不仅仅是“脑内思考”部分。

## 各模型建议

### Claude Sonnet 4.6

文档建议对 Sonnet 4.6 **显式设置** `effort`，避免默认 `high` 带来意料之外的时延。

- `medium`：推荐作为多数应用的默认值，适合 agentic coding、重工具工作流、代码生成。
- `low`：适合高吞吐或时延敏感场景，尤其是聊天、非编码类任务。
- `high`：适合确实需要 Sonnet 4.6 尽可能聪明的时候。
- `max`：只在不限制 token 花费、追求绝对最高能力时使用。

### Claude Opus 4.7

文档对 Opus 4.7 的建议更明确：**编码和 agent 场景优先从 `xhigh` 起步**，而大多数对智能度敏感的任务至少应从 `high` 开始。

- `low`：适合短小、边界清晰的任务；如果任务有多个部分，最好显式给检查清单。
- `medium`：适合“想降成本但还要保持不错效果”的通用工作流。
- `high`：适合高级场景，通常是质量与 token 效率的甜点位。
- `xhigh`：最推荐的编码/agent 起点，尤其适合反复工具调用、细致检索、知识库搜索等探索型任务。
- `max`：只留给真正的前沿难题；很多任务在 `xhigh` 之上只会显著增成本，但收益不大，甚至可能因为“过度思考”影响结构化输出类任务。

文档还特别强调，Opus 4.7 比 Opus 4.6 更严格遵守 `effort` 档位，尤其是在 `low` 和 `medium` 下。也就是说，如果你感觉回答偏浅，不要只靠提示词补救，优先先把 `effort` 调高。

如果 Opus 4.7 跑在 `xhigh` 或 `max`，文档建议给较大的 `max_tokens`，默认可从 64k 起步，再按评测结果调优，给模型留出跨工具和跨子代理行动的空间。

## 与 thinking 的关系

- Claude Mythos Preview 默认使用 adaptive thinking，不能显式禁用 thinking；`effort` 直接控制思考深度。
- Claude Opus 4.7 推荐使用 `thinking: { type: "adaptive" }`，并由 `effort` 控制深度；手工指定 `budget_tokens` 的 extended thinking 已不再支持。
- Claude Opus 4.6 也推荐 adaptive thinking；`budget_tokens` 还能用，但已废弃。
- Claude Sonnet 4.6 中，`effort` 也用于控制 thinking 深度；手工 thinking 的 interleaved mode 还能工作，但已废弃。
- Claude Opus 4.5 和其他 Claude 4 模型仍主要依赖手工 thinking，即 `thinking: { type: "enabled", budget_tokens: N }`；此时 `effort` 与 thinking token 预算会同时发挥作用。

对于 `high`、`xhigh`、`max` 这些较高档位，文档总体上都认为 Claude 会“几乎总是”进行较深思考；在较低档位下，简单问题有可能跳过思考。

## 推荐用法

一个最基础的调用方式如下，重点是在 `output_config` 里指定 `effort`：

```json
{
  "model": "claude-opus-4-7",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "Analyze the trade-offs between microservices and monolithic architectures"
    }
  ],
  "output_config": {
    "effort": "medium"
  }
}
```

## 实战选型建议

如果只是想快速决定怎么配，可以直接按下面的经验法则走：

1. 简单问答、分类、抽取、低价值子任务，先用 `low`。
2. 常规 agent 工作流、代码生成、工具较多但希望控成本，先用 `medium`。
3. 复杂编码、难调试、复杂推理、主代理执行关键任务，先用 `high`。
4. Opus 4.7 的深度探索型 coding / agent 任务，优先试 `xhigh`。
5. 只有在评测明确证明还有提升空间时，才把 `xhigh` 再抬到 `max`。

> [!tip] 更适合落地的理解
> `effort` 更像“Claude 做事时的出手阔绰程度”，而不是一个死板的 token 配额器。你要控制的不只是它“想多久”，还包括它“会不会多找资料、会不会多调工具、会不会多解释一步”。

## 最佳实践总结

- 显式设置 `effort`，不要完全依赖默认值。
- 面向时延敏感或简单任务时，优先尝试 `low`。
- 在自己的真实任务上做评测，因为不同任务对 `effort` 的敏感度差异很大。
- 可以根据任务复杂度动态切换 `effort`：简单查询用低档，复杂推理和 agentic coding 用高档。
