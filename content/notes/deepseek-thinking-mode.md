---
title: DeepSeek 思考模式与 API 调用规范
tags:
  - deepseek
  - reasoning-model
  - prompt-engineering
  - agent
description: 详解 DeepSeek 思考模式在不同 SDK 协议下的控制参数映射、输入输出参数兼容性、无工具与有工具场景下的多轮上下文拼接机制以及 400 避坑实践。
source: https://api-docs.deepseek.com/guides/thinking_mode
---

> [!note] 核心结论
> DeepSeek 思考模式在 API 层面将思维链解耦为独立的 `reasoning_content` 字段。在无工具的常规对话中，历史思考链无需也不应拼入后续上下文；但在包含工具调用（Tools）的 Agent 循环中，**所有历史轮次的 `reasoning_content` 必须严格全量回传**，否则服务端断言失败直接抛出 HTTP 400 Bad Request。可与 [[reasoning-model]]、[[claude-agent-adaptive-thinking]] 对照阅读。

## 核心要点与机制

### 1. 运行场景与上下文流转规则

思考模式依据请求是否携带 `tools` 参数，呈现截然不同的上下文生命周期：

| 交互场景                           | 模型输出字段                       | 历史消息回传要求                               | 服务端行为与考量                                                  |
| :--------------------------------- | :--------------------------------- | :--------------------------------------------- | :---------------------------------------------------------------- |
| **普通多轮对话**（无 `tools`）     | `reasoning_content` + `content`    | **仅回传 `content`**；丢弃 `reasoning_content` | 服务端会自动忽略传入的历史思考链，防止 Prompt 冗余与思维定势。    |
| **Agent 工具调用**（携带 `tools`） | `reasoning_content` + `tool_calls` | **必须完整保留并回传 `reasoning_content`**     | 维持多步推演与工具决策的上下文连贯；缺失任意一轮即触发 400 错误。 |

### 2. 跨生态 SDK 参数控制映射

DeepSeek 思考模式默认开启（强度为 `high`），支持主流客户端生态参数映射：

| 控制维度     | OpenAI SDK 协议                                | Anthropic 协议                         | Responses API 协议                           |
| :----------- | :--------------------------------------------- | :------------------------------------- | :------------------------------------------- |
| **开关控制** | `extra_body={"thinking": {"type": "enabled"}}` | `{"thinking": {"type": "enabled"}}`    | `{"reasoning": {"effort": "none/low/high"}}` |
| **思考强度** | `reasoning_effort="low/high/max"`              | `{"output_config": {"effort": "..."}}` | `{"reasoning": {"effort": "..."}}`           |

> [!important] 强度映射规则
> 客户端传入的 `minimal`/`low` 映射为底层低强度思考；`medium`/`high`/`xhigh` 统一对齐到标准 `high`；`max`/`ultra` 映射到极限算力 `max`。

### 3. 生成参数兼容性与失效矩阵

- **完全失效参数**：`temperature`、`presence_penalty`、`frequency_penalty` 在思考模式下会被底层静默忽略，传入不会报错但无任何影响。
- **`top_p` 差异化钳位**：
  - `deepseek-flash`：仅思考模式下生效，有效区间被强制钳位在 `[0.95, 1.0]`；非思考模式固定为 1.0。
  - `deepseek-v4-pro`：思考模式下忽略用户传入的 `top_p`（有 tools 内部固定 0.95，无 tools 固定 1.0）；仅非思考模式生效。

## 实践启示 / 避坑清单

1. **规避 HTTP 400 校验陷阱**：主流 Agent 框架往往只将 `role: assistant` 的 `content` 和 `tool_calls` 推入历史。在对接 DeepSeek 时，必须确保中间件将 `reasoning_content` 原样保留在 message 字典中回传。
2. **OpenAI SDK 传参语法**：在官方 OpenAI Python/Node SDK 中，`thinking` 不是标准 ChatCompletion 字段，必须写入 `extra_body`，而 `reasoning_effort` 可直接作为顶层参数传递。
3. **流式消费折叠处理**：在 Web/终端流式输出中，监听 delta 中的 `reasoning_content` 片段独立渲染为可折叠面板，最终回答仅渲染 `content`，保障阅读信噪比。
4. **拒绝手动回传常规思考**：普通问答对话中若强行将上一轮的思考过程拼入 user 或 assistant 提示词，不仅平白增加 token 计费，还会劣化模型的发散理解能力。
