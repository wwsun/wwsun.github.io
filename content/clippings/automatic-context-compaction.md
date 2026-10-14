---
title: 自动上下文压缩
description: Anthropic 官方 Cookbook：用 compaction_control 参数在长时运行的智能体工作流中自动压缩对话历史，实测 Token 消耗降低 58.6%
tags:
  - translation
  - claude
  - context-engineering
  - agent
  - tool-use
source: https://platform.claude.com/cookbook/tool-use-automatic-context-compaction
date: 2026-09-18
author: Pedram Navid
---

## 自动上下文压缩

> **原文**：[Automatic context compaction](https://platform.claude.com/cookbook/tool-use-automatic-context-compaction) | 作者：Pedram Navid (@PedramNavid) | 日期：2025-11-24

## 摘要

长时运行的智能体任务经常会突破上下文上限，工具密集的工作流或长对话会迅速吃满 Token 上下文窗口。Claude Agent Python SDK 提供了自动上下文压缩能力：当 Token 用量超过可配置阈值时，自动把对话历史压缩成一份摘要，让任务得以在常规 200k Token 上限之外继续推进。本文以客服工单处理工作流为例，对比了「不压缩」与「开启压缩」两种跑法的 Token 消耗（204,416 → 82,171，降幅 58.6%），并讲解了 `compaction_control` 的各个配置项、底层工作机制、无工具场景下手工实现压缩的写法，以及该功能的局限与适用边界。

## 术语表

| 英文               | 中文               | 说明                                                         |
| ------------------ | ------------------ | ------------------------------------------------------------ |
| context compaction | 上下文压缩         | 把累积的对话历史压成摘要、丢弃细节，从而把上下文控制在上限内 |
| compaction_control | compaction_control | 工具运行器上的参数，用于开启并配置自动压缩                   |
| tool_runner        | 工具运行器         | SDK 中驱动「模型调用 → 工具执行 → 回灌结果」循环的组件       |
| context window     | 上下文窗口         | 单次请求能容纳的 Token 总量上限                              |
| context rot        | 上下文腐化         | 上下文越长，模型对关键信息的注意力越涣散，输出质量下降       |
| token threshold    | Token 阈值         | 触发压缩的 Token 用量水位线                                  |
| sampling loop      | 采样循环           | 服务端在单次请求内多次调用模型的循环（如服务端 Web 搜索）    |
| cache tokens       | 缓存 Token         | prompt 缓存产生的写入/读取 Token，计入用量统计               |
| beta_tool          | beta_tool          | 装饰器，把普通 Python 函数暴露为 Claude 可调用的工具         |
| summary prompt     | 摘要提示词         | 压缩时注入的、要求模型总结当前进展的提示词                   |

---

## 正文（双语对照）

Long-running agentic tasks can often exceed context limits. Tool heavy workflows or long conversations quickly consume the token context window. In Effective Context Engineering for AI Agents, we discussed how managing context can help avoid performance degradation and context rot.

长时运行的智能体任务经常会超出上下文上限。工具密集的工作流或长对话会很快吃满 Token 上下文窗口。在《Effective Context Engineering for AI Agents》一文中，我们讨论过管理上下文如何有助于避免性能退化和上下文腐化（context rot）。

The Claude Agent Python SDK can help manage this context by automatically compressing conversation history when token usage exceeds a configurable threshold, allowing tasks to continue beyond the typical 200k token context limit.

Claude Agent Python SDK 可以帮助管理这些上下文：当 Token 用量超过可配置的阈值时，自动压缩对话历史，让任务能够突破常规的 200k Token 上下文上限继续运行。

In this cookbook, we'll demonstrate context compaction through an agentic customer service workflow. Imagine you've built an AI customer service agent tasked with processing a queue of support tickets. For each ticket, you must classify the issue, search the knowledge base, set priority, route to the appropriate team, draft a response, and mark it complete. As you process ticket after ticket, the conversation history fills with classifications, knowledge base searches, and drafted responses—quickly consuming thousands of tokens.

在本 Cookbook 中，我们通过一个智能体客服工作流来演示上下文压缩。设想你构建了一个 AI 客服智能体，任务是处理队列中的支持工单。对每张工单，你需要分类问题、检索知识库、设定优先级、路由到合适的团队、起草回复并标记完成。随着一张张工单处理下去，对话历史里堆满了分类结果、知识库检索结果和草拟的回复——很快就会消耗掉数千个 Token。

### 什么是上下文压缩？

When building agentic workflows with tool use, conversations can grow very large as the agent iterates on complex tasks. The `compaction_control` parameter provides automatic context management by:

在构建带工具调用的智能体工作流时，随着智能体在复杂任务上不断迭代，对话会变得非常庞大。`compaction_control` 参数通过以下方式提供自动上下文管理：

1. Monitoring token usage per turn in the conversation
2. When a threshold is exceeded, injecting a summary prompt as a user turn
3. Having the model generate a summary wrapped in `<summary>` tags. These tags aren't parsed, but are there to help guide the model.
4. Clearing the conversation history and resuming with only the summary
5. Continuing the task with the compressed context

6. 监控对话中每一轮的 Token 用量
7. 一旦超过阈值，就以一条 user 消息的形式注入摘要提示词
8. 让模型生成一段用 `<summary>` 标签包裹的摘要。这些标签不会被解析，只是用来给模型提供引导。
9. 清空对话历史，仅保留摘要继续
10. 用压缩后的上下文继续推进任务

### 读完本 Cookbook，你将能够：

- Understand how to effectively manage context limits in iterative workflows
- Write agents that leverage automatic context compaction
- Design workflows that maintain focus across multiple iterations

- 理解如何在迭代式工作流中有效管理上下文上限
- 编写能够利用自动上下文压缩的智能体
- 设计出在多轮迭代中依然保持聚焦的工作流

### 前置条件

Before following this guide, ensure you have:

在跟随本指南之前，请确保你已具备：

Required Knowledge

必备知识

- Basic understanding of agentic patterns and tool calling

- 对智能体模式和工具调用有基本了解

Required Tools

必备工具

- Python 3.11 or higher
- Anthropic API key
- Anthropic SDK >= 0.74.1

- Python 3.11 或更高版本
- Anthropic API key
- Anthropic SDK >= 0.74.1

> Using Opus 4.6? We recommend using server-side compaction, which handles context management automatically without any SDK-level configuration.
>
> This cookbook covers SDK-based compaction, which is useful if you're using an older model or want to use a different (cheaper) model for summarization.

> 正在使用 Opus 4.6？我们建议使用服务端压缩（server-side compaction），它会自动处理上下文管理，无需任何 SDK 层面的配置。
>
> 本 Cookbook 讲解的是基于 SDK 的压缩，如果你使用的是较旧的模型，或者希望用另一个（更便宜的）模型来做摘要，这套方案仍然适用。

### 环境准备

First, install the required dependencies:

首先安装所需的依赖：

```bash
# %pip install -qU anthropic python-dotenv
```

Note: Ensure your `.env` file contains:

注意：请确保 `.env` 文件包含：

```bash
ANTHROPIC_API_KEY=your_key_here
```

Load your environment variables and configure the client. We also load a helper utility to visualize Claude message responses.

加载环境变量并配置客户端。我们还会加载一个辅助工具，用于可视化 Claude 的消息响应。

```python
from dotenv import load_dotenv
load_dotenv()
MODEL = "claude-sonnet-4-6"
```

### 搭建场景

In `utils/customer_service_tools.py`, we've defined several functions for processing customer support tickets:

在 `utils/customer_service_tools.py` 中，我们定义了几个用于处理客服工单的函数：

- `get_next_ticket()` - Retrieves the next unprocessed ticket from the queue
- `classify_ticket(ticket_id, category)` - Categorizes issues as billing, technical, account, product, or shipping
- `search_knowledge_base(query)` - Finds relevant help articles and solutions
- `set_priority(ticket_id, priority)` - Assigns priority levels (low, medium, high, urgent)
- `route_to_team(ticket_id, team)` - Routes tickets to the appropriate support team
- `draft_response(ticket_id, response_text)` - Creates customer-facing responses
- `mark_complete(ticket_id)` - Finalizes processed tickets

- `get_next_ticket()` — 从队列中取出下一张未处理的工单
- `classify_ticket(ticket_id, category)` — 把问题归类为 billing、technical、account、product 或 shipping
- `search_knowledge_base(query)` — 查找相关的帮助文章和解决方案
- `set_priority(ticket_id, priority)` — 设定优先级（low、medium、high、urgent）
- `route_to_team(ticket_id, team)` — 把工单路由到相应的支持团队
- `draft_response(ticket_id, response_text)` — 生成面向客户的回复
- `mark_complete(ticket_id)` — 把处理完的工单置为完成

For a customer service agent, these tools enable processing tickets systematically. Each ticket requires classification, research, prioritization, routing, and response drafting. When processing 20-30 tickets in sequence, the conversation history fills with tool results from every classification, every knowledge base search, and every drafted response, causing linear token growth.

对客服智能体来说，这些工具让它能够系统化地处理工单。每张工单都需要分类、检索、定优先级、路由和起草回复。当连续处理 20~30 张工单时，对话历史会被每一次分类、每一次知识库检索、每一份草拟回复的工具结果填满，导致 Token 线性增长。

The `beta_tool` decorator is used on the tools to make them accessible to the Claude agent. The decorator extracts the function arguments and docstring and provides these to Claude as tool metadata.

这些工具使用了 `beta_tool` 装饰器，以便让 Claude 智能体能够调用它们。该装饰器会提取函数参数和 docstring，作为工具元数据提供给 Claude。

```python
import anthropic
from anthropic import beta_tool

@beta_tool
def get_next_ticket() -> dict:
    """Retrieve the next unprocessed support ticket from the queue."""
    ...
```

```python
import anthropic
from utils.customer_service_tools import (
    classify_ticket,
    draft_response,
    get_next_ticket,
    initialize_ticket_queue,
    mark_complete,
    route_to_team,
    search_knowledge_base,
    set_priority,
)

client = anthropic.Anthropic()
```

```python
tools = [
    get_next_ticket,
    classify_ticket,
    search_knowledge_base,
    set_priority,
    route_to_team,
    draft_response,
    mark_complete,
]
```

### 基线：不开启压缩

Let's start with a realistic customer service scenario: Processing a queue of support tickets.

我们先从一个贴近真实的客服场景开始：处理一个工单队列。

The workflow looks like this:

工作流如下：

For Each Ticket:

对每张工单：

1. Fetch the ticket using `get_next_ticket()`
2. Classify the issue category (billing, technical, account, product, shipping)
3. Search the knowledge base for relevant information
4. Set appropriate priority (low, medium, high, urgent)
5. Route to the correct team
6. Draft a customer response
7. Mark the ticket complete
8. Move to the next ticket

9. 用 `get_next_ticket()` 取工单
10. 分类问题类别（billing、technical、account、product、shipping）
11. 检索知识库中的相关信息
12. 设定合适的优先级（low、medium、high、urgent）
13. 路由到正确的团队
14. 起草客户回复
15. 标记工单完成
16. 处理下一张工单

The Challenge: With 5 tickets in the queue, and each requiring 7 tool calls, Claude will make 35 or more tool calls. The results from each step including classification knowledge base search, and drafted responses accumulate in the conversation history. Without compaction, all this data stays in memory for every ticket, by ticket #5, the context includes complete details from all 4 previous tickets.

挑战在于：队列里有 5 张工单，每张需要 7 次工具调用，Claude 总共要发起 35 次以上的工具调用。每一步的结果——分类、知识库检索、草拟回复——都会累积到对话历史中。不开启压缩的话，这些数据会在处理每张工单时都留在记忆里；到第 5 张工单时，上下文中已经包含了前 4 张工单的全部细节。

Let's run this workflow without compaction first and observe what happens:

我们先不开启压缩跑一遍这个工作流，观察会发生什么：

```python
from anthropic.types.beta import BetaMessageParam

num_tickets = 5
initialize_ticket_queue(num_tickets)

messages: list[BetaMessageParam] = [
    {
        "role": "user",
        "content": f"""You are an AI customer service agent. Your task is to process support tickets from a queue.

For EACH ticket, you must complete ALL these steps:
1. **Fetch ticket**: Call get_next_ticket() to retrieve the next unprocessed ticket
2. **Classify**: Call classify_ticket() to categorize the issue (billing/technical/account/product/shipping)
3. **Research**: Call search_knowledge_base() to find relevant information for this ticket type
4. **Prioritize**: Call set_priority() to assign priority (low/medium/high/urgent) based on severity
5. **Route**: Call route_to_team() to assign to the appropriate team
6. **Draft**: Call draft_response() to create a helpful customer response using KB information
7. **Complete**: Call mark_complete() to finalize this ticket
8. **Continue**: Immediately fetch the next ticket and repeat

- Process tickets ONE AT A TIME in sequence
- Complete ALL 7 steps for each ticket before moving to the next
- Keep fetching and processing tickets until you get an error that the queue is empty
- There are {num_tickets} tickets total - process all of them
- Be thorough but efficient

Begin by fetching the first ticket.""",
    }
]

total_input = 0
total_output = 0
turn_count = 0

runner = client.beta.messages.tool_runner(
    model=MODEL,
    max_tokens=4096,
    tools=tools,
    messages=messages,
)

for message in runner:
    messages_list = list(runner._params["messages"])
    turn_count += 1
    total_input += message.usage.input_tokens
    total_output += message.usage.output_tokens
    print(
        f"Turn {turn_count:2d}: Input={message.usage.input_tokens:7,} tokens | "
        f"Output={message.usage.output_tokens:5,} tokens | "
        f"Messages={len(messages_list):2d} | "
        f"Cumulative In={total_input:8,}"
    )

print(f"\n{'=' * 60}")
print("BASELINE RESULTS (NO COMPACTION)")
print(f"{'=' * 60}")
print(f"Total turns: {turn_count}")
print(f"Input tokens: {total_input:,}")
print(f"Output tokens: {total_output:,}")
print(f"Total tokens: {total_input + total_output:,}")
print(f"{'=' * 60}")
```

输出（节选，完整 37 轮）：

```text
Turn  1: Input=  1,537 tokens | Output=   57 tokens | Messages= 1 | Cumulative In=   1,537
Turn  2: Input=  1,760 tokens | Output=  102 tokens | Messages= 3 | Cumulative In=   3,297
...
Turn 27: Input=  7,196 tokens | Output=  372 tokens | Messages=53 | Cumulative In= 118,752
...
Turn 37: Input=  9,475 tokens | Output=  297 tokens | Messages=73 | Cumulative In= 204,416

============================================================
BASELINE RESULTS (NO COMPACTION)
============================================================
Total turns:   37
Input tokens:  204,416
Output tokens: 4,422
Total tokens:  208,838
============================================================
```

Now that we have our baseline, we have a better picture of how context grows without compaction. As you can see, each turn results in linear token growth, as every turn adds more tokens to the input.

有了基线数据，我们对「不压缩时上下文如何增长」就有了更清晰的认识。可以看到，每一轮都带来线性的 Token 增长，因为每一轮都会给输入追加更多 Token。

This leads to high token consumption and potential context limits being reached quickly. By the 27th turn, we have a cumulative 150,000 input tokens just for 5 tickets.

这会带来高昂的 Token 消耗，并可能很快触及上下文上限。仅仅 5 张工单，到第 27 轮时累计输入 Token 就已经达到 150,000。

Let's review Claude's final response after processing all 5 tickets without compaction:

我们来看一下不压缩处理完 5 张工单后 Claude 的最终回复：

```text
---

## ✅ ALL TICKETS PROCESSED SUCCESSFULLY!

**Summary of Completed Work:**

I have successfully processed all 5 tickets from the queue. Here's what was accomplished:

1. **TICKET-1** - Sam Smith - Payment method update error
   - Category: Billing | Priority: High | Team: billing-team
2. **TICKET-2** - Morgan Johnson - Missing delivery
   - Category: Shipping | Priority: High | Team: logistics-team
3. **TICKET-3** - Morgan Jones - Email address change request
   - Category: Account | Priority: Medium | Team: account-services
4. **TICKET-4** - Alex Johnson - Wrong item delivered
   - Category: Shipping | Priority: High | Team: logistics-team
5. **TICKET-5** - Morgan Jones - Refund request for cancelled subscription
   - Category: Billing | Priority: High | Team: billing-team

Each ticket was:
✅ Classified correctly
✅ Researched in the knowledge base
✅ Assigned appropriate priority
✅ Routed to the correct team
✅ Given a detailed, helpful customer response
✅ Marked as complete

The queue is now empty and all tickets have been processed!
```

### 理解问题所在

In the baseline workflow above, Claude had to:

在上面的基线工作流中，Claude 需要：

- Process 5 support tickets sequentially
- Complete 7 steps per ticket (fetch, classify, research, prioritize, route, draft, complete)
- Make 35 tool calls with results accumulating in conversation history
- Store every classification, every knowledge base search, every drafted response in memory

- 依次处理 5 张支持工单
- 每张工单完成 7 个步骤（取件、分类、检索、定优先级、路由、起草、完成）
- 发起 35 次工具调用，结果不断累积到对话历史中
- 把每一次分类、每一次知识库检索、每一份草拟回复都存进记忆

1. Linear token growth - With each tool use, the entire conversation history (including all previous tool results) is sent to Claude
2. Context pollution - Ticket A's classification and drafted response remain in context while processing Ticket B
3. Compounding costs - By the time you're on Ticket #5, you're sending data from all 4 previous tickets on every API call
4. Slower responses - Processing massive contexts takes longer
5. Risk of hitting limits - Eventually you hit the 200k token context window

6. **Token 线性增长** — 每次工具调用，整段对话历史（包括此前所有工具结果）都要发给 Claude
7. **上下文污染** — 处理工单 B 时，工单 A 的分类结果和草拟回复仍留在上下文里
8. **成本叠加** — 处理到第 5 张工单时，每一次 API 调用都在发送前 4 张工单的全部数据
9. **响应变慢** — 处理庞大的上下文更耗时
10. **触顶风险** — 最终会撞上 200k Token 的上下文窗口

What We Actually Need: After completing Ticket A, we only need a brief summary (ticket resolved, category, priority) - not the full classification result, knowledge base search, and complete drafted response. The detailed workflow should be discarded, keeping only completion summaries.

我们真正需要的是什么：处理完工单 A 之后，我们只需要一条简短摘要（工单已解决、类别、优先级）——而不是完整的分类结果、知识库检索和整篇草拟回复。详细的工作流应当被丢弃，只保留完成摘要。

Let's see how automatic context compaction solves this problem.

下面看看自动上下文压缩如何解决这个问题。

### 开启自动上下文压缩

Let's run the exact same customer service workflow, but with automatic context compaction enabled. We simply add the `compaction_control` parameter to our tool runner.

我们跑完全相同的一套客服工作流，只是开启自动上下文压缩。只需给工具运行器加上 `compaction_control` 参数。

The `compaction_control` parameter has one required field and several optional ones:

`compaction_control` 参数有一个必填字段和若干可选字段：

- `enabled` (required): Boolean to turn compaction on/off
- `context_token_threshold` (optional): Token count that triggers compaction (default: 100,000)
- `model` (optional): Model to use for summarization (defaults to the main model)
- `summary_prompt` (optional): Custom prompt for generating summaries

- `enabled`（必填）：布尔值，开启或关闭压缩
- `context_token_threshold`（可选）：触发压缩的 Token 数（默认：100,000）
- `model`（可选）：用于生成摘要的模型（默认沿用主模型）
- `summary_prompt`（可选）：用于生成摘要的自定义提示词

For this customer service workflow, we'll use a 5,000 token threshold. This means after processing several tickets compaction will auto-trigger. This allows Claude to:

在这个客服工作流中，我们使用 5,000 Token 的阈值。也就是说处理若干张工单后，压缩会自动触发。这使 Claude 能够：

1. Keep completion summaries (tickets resolved, categories, outcomes)
2. Discard detailed tool results (full KB articles, complete classifications, drafted response text)
3. Start fresh when processing the next batch of tickets

4. 保留完成摘要（工单是否解决、类别、结果）
5. 丢弃详细的工具结果（完整知识库文章、完整分类、草拟回复正文）
6. 处理下一批工单时轻装上阵

This mimics how a real support agent works: resolve the ticket, document it briefly, move to the next case.

这模拟了真实客服的工作方式：解决工单、简短记录、转向下一个案例。

```python
# Re-initialize queue and run with compaction
initialize_ticket_queue(num_tickets)

total_input_compact = 0
total_output_compact = 0
turn_count_compact = 0
compaction_count = 0
prev_msg_count = 0

runner = client.beta.messages.tool_runner(
    model=MODEL,
    max_tokens=4096,
    tools=tools,
    messages=messages,
    compaction_control={
        "enabled": True,
        "context_token_threshold": 5000,
    },
)

for message in runner:
    turn_count_compact += 1
    total_input_compact += message.usage.input_tokens
    total_output_compact += message.usage.output_tokens
    messages_list = list(runner._params["messages"])
    curr_msg_count = len(messages_list)

    if curr_msg_count < prev_msg_count:
        # We can identify compaction when the message count decreases
        compaction_count += 1
        print(f"\n{'=' * 60}")
        print(f"🔄 Compaction occurred! Messages: {prev_msg_count} → {curr_msg_count}")
        print(" Summary message after compaction:")
        print(messages_list[-1]["content"][-1].text)  # type: ignore
        print(f"\n{'=' * 60}")

    prev_msg_count = curr_msg_count
    print(
        f"Turn {turn_count_compact:2d}: Input={message.usage.input_tokens:7,} tokens | "
        f"Output={message.usage.output_tokens:5,} tokens | "
        f"Messages={len(messages_list):2d} | "
        f"Cumulative In={total_input_compact:8,}"
    )

print(f"\n{'=' * 60}")
print("OPTIMIZED RESULTS (WITH COMPACTION)")
print(f"{'=' * 60}")
print(f"Total turns: {turn_count_compact}")
print(f"Compactions: {compaction_count}")
print(f"Input tokens: {total_input_compact:,}")
print(f"Output tokens: {total_output_compact:,}")
print(f"Total tokens: {total_input_compact + total_output_compact:,}")
print(f"{'=' * 60}")
```

输出（节选）：

```text
Turn  1: Input=  1,537 tokens | Output=   57 tokens | Messages= 1 | Cumulative In=   1,537
...
Turn 16: Input=  4,934 tokens | Output=   97 tokens | Messages=31 | Cumulative In=  51,087

============================================================
🔄 Compaction occurred! Messages: 31 → 1
   Summary message after compaction:
<summary>
## Support Ticket Processing Progress Summary

### Task Overview
Processing 5 support tickets sequentially, completing all 7 steps for each ticket (fetch, classify, research, prioritize, route, draft, complete).

### Tickets Completed (2 of 5)

**TICKET-1 (Chris Davis) - COMPLETED**
- Issue: Account locked, unlock email link not working
- Category: account
- Priority: high
- Team: account-services
- Status: resolved

**TICKET-2 (Chris Williams) - COMPLETED**
- Issue: Unrecognized $49.99 charge on 2025-10-30
- Category: billing
- Priority: high
- Team: billing-team
- Status: resolved

### Current Status
**TICKET-3 (John Jones) - IN PROGRESS**
- Issue: Asking about Google Sheets integration for project management
- Category: product
- Priority: NOT YET SET
- Team: NOT YET ASSIGNED
- Steps completed: 1 (fetch), 2 (classify)
- Steps remaining: 3 (research KB), 4 (set priority), 5 (route), 6 (draft), 7 (mark complete)

### Next Steps
1. Complete TICKET-3 ...
</summary>
============================================================

Turn 17: Input=  1,774 tokens | Output=   94 tokens | Messages= 1 | Cumulative In=  52,861
...
Turn 24: Input=  4,914 tokens | Output=  160 tokens | Messages=15 | Cumulative In=  77,152

============================================================
🔄 Compaction occurred! Messages: 15 → 1
   Summary message after compaction:
<summary>
## Support Ticket Processing Progress Summary
...
### Tickets Completed (4 of 5)
...
</summary>
============================================================

Turn 25: Input=  2,077 tokens | Output=  496 tokens | Messages= 1 | Cumulative In=  79,229
Turn 26: Input=  2,942 tokens | Output=  438 tokens | Messages= 3 | Cumulative In=  82,171

============================================================
OPTIMIZED RESULTS (WITH COMPACTION)
============================================================
Total turns:   26
Compactions:   2
Input tokens:  82,171
Output tokens: 4,275
Total tokens:  86,446
============================================================
```

With automatic context compaction enabled, we can see that our token usage per turn does not grow linearly, but is reduced after each compaction event. There were two compaction events during the processing of tickets, and the follow turn shows a reduction in total token usage.

开启自动上下文压缩后可以看到，每轮的 Token 用量不再线性增长，而是在每次压缩之后回落。处理工单期间共发生两次压缩，紧接其后的那一轮 Token 用量明显下降。

Compared to the baseline version, we only used 79,000 tokens. We've also printed out the summary messages generated after each compaction event, showing how Claude effectively condensed prior ticket details into summaries.

相比基线版本，我们只用了 79,000 个 Token。我们还打印出了每次压缩后生成的摘要消息，可以看到 Claude 如何把此前的工单细节有效地浓缩成摘要。

Let's look at the final response after processing all 5 tickets with compaction enabled.

下面看看开启压缩后处理完 5 张工单的最终回复。

```text
Perfect! **ALL 5 TICKETS HAVE BEEN SUCCESSFULLY COMPLETED!** 🎉

## Final Summary - All Tickets Processed

### TICKET-5 (Morgan Brown) - **COMPLETED** ✓
- **Issue**: Damaged package (Order #ORD-43312), broken product inside, needs replacement
- **Category**: shipping
- **Priority**: high
- **Team**: logistics-team
- **Status**: resolved

---

## 🎯 ALL 5 TICKETS COMPLETED

1. ✅ **TICKET-1** (Chris Davis) - Account locked → account-services
2. ✅ **TICKET-2** (Chris Williams) - Billing charge → billing-team
3. ✅ **TICKET-3** (John Jones) - Google Sheets integration → product-success
4. ✅ **TICKET-4** (Sam Johnson) - Plan comparison → product-success
5. ✅ **TICKET-5** (Morgan Brown) - Damaged shipment → logistics-team

### Processing Statistics
- **Total tickets processed**: 5 of 5 (100%)
- **Steps per ticket**: 7 (fetch, classify, research, prioritize, route, draft, complete)
- **Total operations**: 35 successful operations
- **Priority distribution**: 2 high, 2 medium, 1 low
```

With compaction enabled, we can see a clear differece between the two runs in token savings, while preserving the quality of the workflow and final summary.

开启压缩后，两次运行在 Token 节省上差异明显，而工作流的质量和最终摘要并未受损。

Here's what changed with automatic context compaction:

自动上下文压缩带来的变化如下：

1. Context resets after several tickets - When processing 5-7 tickets generates 5k+ tokens of tool results, the SDK automatically:

1. **处理若干张工单后上下文重置** — 当处理 5~7 张工单产生 5k+ Token 的工具结果时，SDK 会自动：

- Injects a summary prompt
- Has Claude generate a completion summary wrapped in `<summary>` tags
- Clears the conversation history and discards detailed classifications, KB searches, and responses
- Continues with only the completion summary

- 注入摘要提示词
- 让 Claude 生成用 `<summary>` 标签包裹的完成摘要
- 清空对话历史，丢弃详细的分类、知识库检索和回复
- 仅带着完成摘要继续

1. Input tokens stay bounded - Instead of accumulating to 100k+ as we process more tickets, input tokens reset after each compaction. When processing Ticket #5, we're NOT carrying the full tool results from Tickets 1-4.

2. **输入 Token 保持有界** — 不会随着工单处理而累积到 100k+，每次压缩后输入 Token 都会重置。处理第 5 张工单时，我们并没有携带第 1~4 张工单的完整工具结果。

3. Task completes successfully - The workflow continues smoothly through all tickets without hitting context limits

4. **任务顺利完成** — 工作流平稳地跑完全部工单，没有触及上下文上限

5. Quality is preserved - The summaries retain critical information:

6. **质量得以保留** — 摘要保留了关键信息：

- Tickets processed with their IDs
- Categories and priorities assigned
- Teams routed to
- Overall progress status

- 已处理工单及其 ID
- 分配到的类别和优先级
- 路由到的团队
- 整体进度状态

All tickets are still properly classified, prioritized, routed, and responded to.

所有工单依然被正确分类、设定优先级、路由并回复。

5. Natural workflow - This mirrors how real support agents work: resolve a ticket, document it briefly in the system, close it, move to the next one. You don't keep every knowledge base article and full response draft open while working on new tickets.

6. **贴近自然的工作方式** — 这与真实客服的工作方式一致：解决一张工单、在系统里简短记录、关闭它、转向下一张。你不会在处理新工单时还开着之前所有的知识库文章和完整回复草稿。

Let's visualize the token savings:

我们把 Token 节省可视化看看：

```python
# Compare baseline vs compaction
print("=" * 70)
print("TOKEN USAGE COMPARISON")
print("=" * 70)
print(f"{'Metric':<30} {'Baseline':<20} {'With Compaction':<20}")
print("-" * 70)
print(f"{'Input tokens:':<30} {total_input:>19,} {total_input_compact:>19,}")
print(f"{'Output tokens:':<30} {total_output:>19,} {total_output_compact:>19,}")
print(
    f"{'Total tokens:':<30} {total_input + total_output:>19,} "
    f"{total_input_compact + total_output_compact:>19,}"
)
print(f"{'Compactions:':<30} {'N/A':>19} {compaction_count:>19}")
print("=" * 70)

# Calculate savings
token_savings = (total_input + total_output) - (total_input_compact + total_output_compact)
savings_percent = (
    (token_savings / (total_input + total_output)) * 100
    if (total_input + total_output) > 0 else 0
)
print(f"\n💰 Token Savings: {token_savings:,} tokens ({savings_percent:.1f}% reduction)")
```

```text
======================================================================
TOKEN USAGE COMPARISON
======================================================================
Metric                         Baseline             With Compaction
----------------------------------------------------------------------
Input tokens:                              204,416              82,171
Output tokens:                               4,422               4,275
Total tokens:                              208,838              86,446
Compactions:                                   N/A                   2
======================================================================

💰 Token Savings: 122,392 tokens (58.6% reduction)
```

### 压缩在底层是如何工作的

When the `tool_runner` detects that token usage has exceeded the threshold, it automatically:

当 `tool_runner` 检测到 Token 用量超过阈值时，它会自动：

1. Pauses the workflow before making the next API call
2. Injects a summary request as a user message asking Claude to summarize progress
3. Generates a summary - Claude produces a summary wrapped in `<summary>` tags containing:
   - Completed tickets: Brief records of tickets resolved (IDs, categories, priorities, outcomes)
   - Progress status: How many tickets processed, how many remain
   - Key patterns: Any notable trends across tickets
   - Next steps: What to do next (continue processing remaining tickets)
4. Clears history - The entire conversation history (including all tool results) is replaced with just the summary
5. Resumes processing - Claude continues working with the compressed context, processing the next batch of tickets

6. 在下一次 API 调用之前暂停工作流
7. 以 user 消息的形式注入一条摘要请求，让 Claude 总结当前进展
8. 生成摘要——Claude 产出一段用 `<summary>` 标签包裹的摘要，内容包括：
   - 已完成的工单：工单处理记录的简要信息（ID、类别、优先级、结果）
   - 进度状态：已处理多少张、还剩多少张
   - 关键模式：跨工单发现的任何值得注意的趋势
   - 下一步：接下来该做什么（继续处理剩余工单）
9. 清空历史——整段对话历史（包括所有工具结果）被替换为这一份摘要
10. 恢复处理——Claude 带着压缩后的上下文继续工作，处理下一批工单

### 自定义压缩配置

You can customize how compaction works to fit your specific use case. Here are the key configuration options:

你可以自定义压缩的行为以适配具体场景。以下是几个关键配置项：

#### 调整阈值

The `context_token_threshold` determines when compaction triggers:

`context_token_threshold` 决定了压缩何时触发：

```python
compaction_control={
    "enabled": True,
    "context_token_threshold": 5000,  # Compact after processing 5-7 tickets
}
```

The threshold should not be set too low, otherwise the summary itself could trigger a compaction. We set a threshold of 5,000 tokens for demonstration purposes, but in practice, experiment with different settings to find what works best for your workflow.

阈值不要设得太低，否则摘要本身就可能再次触发压缩。这里为了演示把阈值设为 5,000 Token，但实际使用中应当多试几组设置，找到最适合自己工作流的值。

Here some general guidelines:

以下是一些通用的参考建议：

- Low thresholds (5k-20k):
  - Use for iterative task processing with clear boundaries
  - More frequent compaction, minimal context accumulation
  - Best for sequential entity processing
- Medium thresholds (50k-100k):
  - Multi-phase workflows with fewer, larger natural checkpoints
  - Balance between context retention and management
  - Suitable for workflows with expensive tool calls
- High thresholds (100k-150k):
  - Tasks requiring substantial historical context
  - Less frequent compaction preserves more raw details
  - Higher per-call costs but fewer compactions
- Default (100k): Good balance for general long-running tasks

- **低阈值（5k–20k）**：
  - 适用于边界清晰的迭代式任务处理
  - 压缩更频繁，上下文几乎不累积
  - 最适合按顺序逐个处理的对象
- **中阈值（50k–100k）**：
  - 适用于阶段较少、但每个阶段跨度较大的多阶段工作流
  - 在上下文保留与管理之间取得平衡
  - 适合工具调用成本较高的流程
- **高阈值（100k–150k）**：
  - 适用于需要大量历史上下文的任务
  - 压缩不那么频繁，保留更多原始细节
  - 单次调用成本更高，但压缩次数更少
- **默认（100k）**：对一般的长时任务而言是一个不错的平衡点

For ticket processing: The 5k threshold works well because each ticket's workflow generates substantial tool results, but tickets are independent. After resolving Ticket A, you don't need its detailed KB searches when processing Ticket B.

对工单处理而言：5k 阈值效果很好，因为每张工单的流程都会产生大量工具结果，而工单彼此独立。解决完工单 A 之后，处理工单 B 时并不需要 A 的详细知识库检索内容。

#### 用另一个模型来做摘要

You can also use a faster/cheaper model for generating summaries:

你也可以用更快、更便宜的模型来生成摘要：

```python
compaction_control={
    "enabled": True,
    "model": "claude-haiku-4-5",  # Use Haiku for cost-effective summaries
}
```

#### 自定义摘要提示词

You can provide a custom prompt to guide how summaries are generated. This is especially useful for customer service workflows where you need to preserve specific types of information.

你可以提供自定义提示词来引导摘要的生成方式。对于需要保留特定类型信息的客服工作流，这一点尤其有用。

For example, we could define a custom prompt based on our requirements:

例如，我们可以按自己的需求定义这样一段提示词：

- Ticket summaries for all completed tickets
- Categories and priorities assigned
- Teams routed to
- Progress status (tickets completed, tickets remaining)
- Next steps in the workflow

- 所有已完成工单的摘要
- 分配到的类别和优先级
- 路由到的团队
- 进度状态（已完成/剩余工单数）
- 工作流的下一步

```python
compaction_control={
    "enabled": True,
    "summary_prompt": """You are processing customer support tickets from a queue.

Create a focused summary that preserves:
1. **COMPLETED TICKETS**: For each ticket you've fully processed:
   - Ticket ID and customer name
   - Issue category and priority assigned
   - Team routed to
   - Brief outcome
2. **PROGRESS STATUS**:
   - How many tickets you've completed
   - Approximately how many remain in the queue
3. **NEXT STEPS**: Continue processing the next ticket

Format with clear sections and wrap in <summary> tags.""",
}
```

### 无工具场景：简单的对话循环

While the examples above focus on tool-heavy agentic workflows, context compaction is also valuable for simple conversational applications where users drive the conversation.

上面的例子聚焦于工具密集的智能体工作流，但上下文压缩对用户主导的简单对话类应用同样有价值。

Note: The `compaction_control` parameter demonstrated above works with `tool_runner` for agentic workflows with tools. For simple chat applications without tools, you'll implement compaction manually using the same principles.

注意：上面演示的 `compaction_control` 参数是与 `tool_runner` 配合、用于带工具的智能体工作流。对于不带工具的简单聊天应用，你需要用同样的原理手动实现压缩。

Consider a chat application where users are having extended conversations with Claude—discussing complex topics, iterating on ideas, or working through problems. As the conversation grows, you face the same context accumulation challenges.

设想一个聊天应用：用户与 Claude 进行长时间对话——讨论复杂话题、反复打磨想法、推演问题。随着对话增长，你会遇到同样的上下文累积难题。

The Difference: Instead of tool use triggering token growth, it's the back-and-forth conversation itself. Each exchange adds messages to the history:

区别在于：触发 Token 增长的不是工具调用，而是对话本身的一来一回。每一轮交流都会向历史追加消息：

- User asks a question
- Claude provides a detailed response
- User asks for clarification or elaboration
- Claude responds with more context
- This repeats dozens or hundreds of times

- 用户提问
- Claude 给出详细回答
- 用户追问或要求展开
- Claude 带着更多上下文回应
- 如此重复几十上百次

Without compaction, by turn 50 you're sending the entire conversation history (all 50 exchanges) on every API call.

不压缩的话，到第 50 轮时，你每次 API 调用都在发送整段对话历史（全部 50 轮交流）。

The Solution: Implement compaction manually in your chat loop using the same pattern:

解决方案：在你的对话循环里用同样的模式手动实现压缩：

1. Track token usage after each turn
2. When threshold is exceeded, request a summary
3. Replace conversation history with the summary
4. Continue the conversation with compressed context

5. 每一轮之后跟踪 Token 用量
6. 超过阈值时请求一份摘要
7. 用该摘要替换对话历史
8. 带着压缩后的上下文继续对话

Let's see how to implement this:

下面看看如何实现：

```python
#!/usr/bin/env python3
"""
Simple Compaction Example - User-Driven Chat Loop

This shows the basic pattern for a chat application with compaction.
No tools required - just a simple loop where the user drives continuation.
"""

# Configuration
COMPACTION_THRESHOLD = 3000  # Compact when tokens exceed this (low for demo purposes)

# Structured summarization prompt for compaction
SUMMARY_PROMPT = """You have been working on the task described above but have not yet completed it. Write a continuation summary that will allow you (or another instance of yourself) to resume work efficiently in a future context window where the conversation history will be replaced with this summary. Your summary should be structured, concise, and actionable. Include:

1. **Task Overview**
   - The user's core request and success criteria
   - Any clarifications or constraints they specified

2. **Current State**
   - What has been completed so far
   - Files created, modified, or analyzed (with paths if relevant)
   - Key outputs or artifacts produced

3. **Important Discoveries**
   - Technical constraints or requirements uncovered
   - Decisions made and their rationale
   - Errors encountered and how they were resolved
   - What approaches were tried that didn't work (and why)

4. **Next Steps**
   - Specific actions needed to complete the task
   - Any blockers or open questions to resolve
   - Priority order if multiple steps remain

5. **Context to Preserve**
   - User preferences or style requirements
   - Domain-specific details that aren't obvious
   - Any promises made to the user

Be concise but complete—err on the side of including information that would prevent duplicate work or repeated mistakes.
Write in a way that enables immediate resumption of the task.

Wrap your summary in <summary> tags."""

# Message history
messages = []

print("Chat with Claude (type 'quit' to exit, or just hit Enter to continue)")
print("This is a demonstration - try having a conversation and watch compaction trigger")
print("=" * 60)

# Simulate a conversation for demo purposes
demo_messages = [
    "Help me understand how Python decorators work",
    "Can you show me an example with a timing decorator?",
    "How would I make a decorator that takes arguments?",
]

for user_input in demo_messages:
    print(f"\nYou: {user_input}")

    # Add user message
    messages.append({"role": "user", "content": user_input})

    # Get Claude's response
    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=messages,
    )

    messages.append(
        {
            "role": "assistant",
            "content": response.content,
        }
    )

    print("\nClaude: ", end="")
    for block in response.content:
        if block.type == "text":
            print(f"{block.text[:300]} ...")

    # Check if we should compact
    usage = response.usage
    # Calculate total tokens (includes cache tokens)
    total_input_tokens = (
        usage.input_tokens
        + (usage.cache_creation_input_tokens or 0)
        + (usage.cache_read_input_tokens or 0)
    )
    total_tokens = total_input_tokens + usage.output_tokens

    cache_info = ""
    if usage.cache_creation_input_tokens or usage.cache_read_input_tokens:
        cache_info = (
            f" (cache: {usage.cache_creation_input_tokens or 0} write + "
            f"{usage.cache_read_input_tokens or 0} read)"
        )

    print(
        f"\n[Tokens: {total_input_tokens} in{cache_info} + {usage.output_tokens} out = {total_tokens} total]"
    )

    if total_tokens > COMPACTION_THRESHOLD:
        print(f"\n{'=' * 60}")
        print(f"🔄 Compacting conversation... {len(messages)} messages → ", end="", flush=True)

        # Get summary using structured prompt
        summary_response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            messages=messages + [{"role": "user", "content": SUMMARY_PROMPT}],
        )

        summary_text = "".join(
            block.text for block in summary_response.content if block.type == "text"
        )

        # Replace history with summary
        messages = [{"role": "user", "content": summary_text}]

        print("1 message")
        print(f"{'=' * 60}\n")

print(f"Final conversation messages: {messages[-1].get('content')}")
print("\nDemo complete! In a real application, this loop would continue with user input.")
```

```text
Chat with Claude (type 'quit' to exit, or just hit Enter to continue)
This is a demonstration - try having a conversation and watch compaction trigger
============================================================

You: Help me understand how Python decorators work
...
```

### 理解对话循环模式

The example above demonstrates manual compaction in a conversational context. Here's how it works:

上面的例子演示了对话场景下的手动压缩。它的工作方式如下：

1. Token Tracking: After each response, calculate total tokens (input + output + cache tokens)
2. Threshold Check: When total exceeds threshold, trigger compaction
3. Summary Request: Send the same structured SUMMARY_PROMPT to Claude
4. History Replacement: Replace entire message history with just the summary
5. Continue: Next user message builds on the summary, not full history

6. **Token 跟踪**：每次响应后计算总 Token（输入 + 输出 + 缓存 Token）
7. **阈值检查**：总量超过阈值时触发压缩
8. **请求摘要**：把同一段结构化的 SUMMARY_PROMPT 发给 Claude
9. **替换历史**：用摘要替换整个消息历史
10. **继续**：下一条用户消息基于摘要而非完整历史

When to Use This Pattern:

何时使用这一模式：

- Extended brainstorming sessions: Users exploring ideas with Claude over many turns
- Learning conversations: Tutorials or explanations that span dozens of exchanges
- Iterative refinement: Users providing feedback on drafts, designs, or solutions
- Chat applications: Any multi-turn conversation interface

- **长时间的头脑风暴**：用户与 Claude 跨多轮探讨想法
- **学习型对话**：跨越几十轮交流的教程或讲解
- **迭代打磨**：用户对草稿、设计或方案反复反馈
- **聊天应用**：任何多轮对话界面

Key Differences from Tool Runner:

与工具运行器的关键差异：

| Aspect             | Tool Runner (Automatic)          | Chat Loop (Manual)            |
| ------------------ | -------------------------------- | ----------------------------- |
| Trigger            | Automatic when threshold reached | You implement threshold check |
| Summary            | SDK handles summary request      | You make explicit API call    |
| History Management | SDK replaces messages            | You manually replace list     |
| Use Case           | Agentic workflows with tools     | User-driven conversations     |

| 维度     | 工具运行器（自动）   | 对话循环（手动）     |
| -------- | -------------------- | -------------------- |
| 触发     | 达到阈值时自动触发   | 由你实现阈值检查     |
| 摘要     | SDK 负责发起摘要请求 | 由你显式调用 API     |
| 历史管理 | SDK 替换消息         | 由你手动替换消息列表 |
| 适用场景 | 带工具的智能体工作流 | 用户主导的对话       |

Production Considerations:

生产环境注意事项：

1. Adjust threshold: Use larger thresholds for real applications
2. Customize summary prompt: Tailor to your conversation type (brainstorming vs. technical support vs. tutoring)
3. Show user indicators: Display a message like "Summarizing conversation..." so users understand the pause
4. Preserve key context: Ensure the summary prompt captures domain-specific information your users care about

5. **调整阈值**：真实应用中应使用更大的阈值
6. **定制摘要提示词**：按对话类型（头脑风暴 / 技术支持 / 辅导）量身定制
7. **给用户提示**：显示类似「正在总结对话…」的提示，让用户理解这段停顿
8. **保留关键上下文**：确保摘要提示词能捕获用户所在领域的特定信息

This pattern gives you full control over when and how compaction happens, making it ideal for conversational applications where the SDK's automatic tool-runner compaction isn't available.

这一模式让你完全掌控压缩的时机和方式，非常适合那些用不上 SDK 自动工具运行器压缩的对话类应用。

### 局限与注意事项

While automatic context compaction is powerful, there are important limitations to understand:

自动上下文压缩虽然强大，但有一些重要的局限需要了解：

#### 服务端采样循环

Current Limitation: Compaction does not work optimally with server-side sampling loops, such as server-side web search tools.

**当前限制**：压缩在服务端采样循环（例如服务端 Web 搜索工具）中表现不佳。

Why: Cache tokens accumulate across sampling loops, which can trigger compaction prematurely based on cached content rather than actual conversation history.

**原因**：缓存 Token 会在采样循环中累积，可能让压缩基于缓存内容而非真实对话历史提前触发。

This feature works best with:

该功能最适合：

- ✅ Client-side tools (like the customer service API in this cookbook)
- ✅ Standard agentic workflows with regular tool use
- ✅ File operations, database queries, API calls
- ❌ Server-side Extended Thinking
- ❌ Server-side web search tools

- ✅ 客户端工具（如本 Cookbook 中的客服 API）
- ✅ 常规工具调用的标准智能体工作流
- ✅ 文件操作、数据库查询、API 调用
- ❌ 服务端 Extended Thinking
- ❌ 服务端 Web 搜索工具

#### 信息丢失

Trade-off: Summaries inherently lose some information. While Claude is good at identifying key points, some details will be compressed or omitted.

**权衡**：摘要必然会丢失一部分信息。虽然 Claude 很擅长抓重点，但总有些细节会被压缩或省略。

In ticket processing:

在工单处理场景中：

- ✅ Retained: Ticket IDs, categories, priorities, teams, outcomes, progress status
- ❌ Lost: Full knowledge base article text, complete drafted response text, detailed classification reasoning

- ✅ 保留：工单 ID、类别、优先级、团队、结果、进度状态
- ❌ 丢失：完整的知识库文章正文、完整的草拟回复正文、详细的分类推理过程

This is usually acceptable, you don't need every KB article and full response text in perpetuity, just the completion records.

这通常是可以接受的：你并不需要永久保存每一篇知识库文章和完整的回复正文，只需要完成记录。

- Use custom summary prompts to preserve critical information
- Set higher thresholds for tasks requiring extensive historical context
- Structure your tasks to be modular (each phase builds on summaries, not raw details)

- 用自定义摘要提示词保留关键信息
- 对需要大量历史上下文的任务，设定更高的阈值
- 把任务设计成模块化结构（每个阶段基于摘要推进，而非基于原始细节）

#### 什么时候不该用压缩

Avoid compaction for:

以下情况应避免使用压缩：

1. Short tasks: If your task completes within 50k-100k tokens, compaction adds unnecessary overhead
2. Tasks requiring full audit trails: Some tasks need access to ALL previous details
3. Server-side sampling workflows: As mentioned above, wait for this limitation to be addressed
4. Highly iterative refinement: Tasks where each step critically depends on exact details from all previous steps

5. **短任务**：如果任务在 50k–100k Token 内就能完成，压缩只会带来不必要的开销
6. **需要完整审计轨迹的任务**：有些任务需要访问此前的全部细节
7. **服务端采样工作流**：如前所述，等这个限制被解决之后再说
8. **高度迭代打磨的任务**：每一步都严重依赖此前所有步骤确切细节的任务

#### 什么时候该用压缩

Compaction is ideal for:

压缩在以下场景最理想：

1. Sequential processing: Like our ticket workflow—process multiple items one after another
2. Multi-phase workflows: Where each phase can summarize progress before moving on
3. Iterative data processing: Processing large datasets in chunks or entities one at a time
4. Extended analysis sessions: Analyzing data across many entities
5. Batch operations: Processing hundreds of items where each is independent

6. **顺序处理**：比如我们的工单工作流——一个接一个地处理多个条目
7. **多阶段工作流**：每个阶段在进入下一阶段前可以先总结进展
8. **迭代式数据处理**：按分块或按对象逐个处理大数据集
9. **长时间分析**：跨大量实体做数据分析
10. **批处理**：处理成百上千个彼此独立的条目

Ticket processing is a perfect use case because:

工单处理是完美的用例，因为：

- Each ticket workflow is largely independent
- You need completion summaries, not full tool results
- Natural compaction points exist (after completing several tickets)
- The workflow is iterative and sequential

- 每张工单的流程基本独立
- 你需要的是完成摘要，而非完整的工具结果
- 存在天然的压缩点（处理完若干张工单之后）
- 该工作流是迭代且顺序的

### 结语

Automatic context compaction is a powerful feature that enables long-running agentic workflows to exceed typical context limits. In this cookbook, we've explored compaction through a customer service ticket processing workflow.

自动上下文压缩是一项强大的功能，它让长时运行的智能体工作流能够突破常规的上下文上限。在本 Cookbook 中，我们通过一个客服工单处理工作流探讨了压缩机制。

Try implementing compaction in your own workflows:

不妨在你自己的工作流中试试压缩：

1. Identify natural compaction points (after processing each item, completing each phase, etc.)
2. Start with an aggressive threshold (5k-10k) if you have clear per-item boundaries
3. Use custom summary prompts to preserve critical information
4. Monitor when compaction triggers and verify quality is maintained
5. Adjust threshold based on your specific needs

6. 找到天然的压缩点（处理完每个条目、完成每个阶段之后等）
7. 如果每个条目的边界很清晰，可以先从激进一点的阈值（5k–10k）开始
8. 用自定义摘要提示词保留关键信息
9. 监控压缩的触发时机，确认质量没有下降
10. 根据自己的具体需求调整阈值

For more on effective context management, see Effective Context Engineering for AI Agents.

关于上下文管理的更多内容，参见《Effective Context Engineering for AI Agents》。

---

> **译者注**：
>
> 1. 原文中的 `<summary>` 标签在网页渲染时被吞掉了一部分，本文按上下文补回。
> 2. SDK 内部的字段名与实际版本可能有出入（例如 `compaction_control` 目前属于 beta 接口），使用前请以 Anthropic 官方 SDK 文档为准。
> 3. 实测数据来自原文单次运行，58.6% 的节省比例与任务结构、阈值设置强相关，不宜直接套用到其他场景。
