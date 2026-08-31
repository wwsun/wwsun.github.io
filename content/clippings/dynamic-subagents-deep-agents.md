---
title: Deep Agents 引入动态子智能体——用代码编排替代工具调用
description: LangChain 的 Deep Agents 推出动态子智能体，通过编程式编排（代码循环/分支/并发）替代工具调用式调度，实现大规模、确定性的智能体协同
tags:
  - clippings
  - ai-agent
  - langchain
  - deep-agents
  - subagent
  - orchestration
  - rlm
source: https://www.langchain.com/blog/introducing-dynamic-subagents-in-deep-agents
created: 2026-07-07
---

## Deep Agents 引入动态子智能体——用代码编排替代工具调用

> 原文：[Introducing Dynamic Subagents in Deep Agents](https://www.langchain.com/blog/introducing-dynamic-subagents-in-deep-agents) 作者：LangChain 团队 日期：~2026-06-24

当智能体承担更宏大的任务时，它们面临两个困难：

1. 大规模下可靠地完成工作
2. 管理自己的上下文窗口

我们一直在试验如何应对这些挑战，方案我们称之为**动态子智能体（Dynamic Subagents）**：与其通过通用的工具调用来分发子智能体任务，智能体编写一个短脚本来驱动子智能体的执行。这意味着模型可以依赖它擅长的代码模式（循环、分支或并发）来编写适合当前任务的编排逻辑。

## 为什么需要动态子智能体？

Deep Agents 已经支持[子智能体](https://docs.langchain.com/oss/python/deepagents/subagents)。它们隔离上下文、让主智能体委派离散的工作单元、将中间结果排除在主上下文窗口之外。那为什么还需要动态子智能体？

普通子智能体由主模型直接调用，一次一个。小规模下这能工作。但当需要生成数百个子智能体，或编排逻辑是条件式或多阶段的时候，这种方式就会崩。

动态子智能体通过**编程式编排**来解决这个问题。智能体不再逐轮进行工具调用，而是编写一个短脚本来编排和调用子智能体，并在轻量级解释器中运行。

典型示例：一份 300 页的文档，每页一个子智能体。相比调用子智能体工具 300 次，智能体只需写一个循环：

```js
const results = await Promise.all(
  pages.map((page) =>
    task({ description: `Summarize page ${page.number}`, subagentType: "summarizer" }),
  ),
)
```

这解锁了基于工具调用的编排无法可靠提供的两件事：

**大规模确定性的覆盖。** 没有结构约束时，智能体会对范围做主观判断——检查 500 项中的 75 项就认为完成了。分发循环不会这样。覆盖变成了一种结构性保证，而非提示词工程问题。

**可靠的复杂编排。** 将编排写成代码比让模型以工具调用序列的方式复现它更可靠，尤其是在扇出+合成、多阶段流水线或条件分支等场景。

这与 [Claude Code 的工作流](https://code.claude.com/docs/en/workflows)和[递归语言模型（RLM）](https://arxiv.org/abs/2512.24601)背后的理念相同：模型写代码，代码再分发更多智能体。

## 快速上手

动态子智能体需要两样东西：用于分发工作的[子智能体](https://docs.langchain.com/oss/python/deepagents/subagents)，以及一个[代码解释器](https://docs.langchain.com/oss/python/deepagents/interpreters)——一个安全、轻量级的运行时，模型在其中编写和执行编排代码。Deep Agents 包含一个基于 QuickJS 的可选代码解释器。使用时，安装 QuickJS 中间件包，然后通过 `create_deep_agent` 的 `middleware` 参数传入 `CodeInterpreterMiddleware`。

```bash
pip install -U "deepagents[quickjs]"
```

```python
from deepagents import create_deep_agent
from langchain_quickjs import CodeInterpreterMiddleware

agent = create_deep_agent(
    model="openai:gpt-5.5",
    middleware=[CodeInterpreterMiddleware()],
)
```

Deep Agents 内置了一个通用[子智能体](https://docs.langchain.com/oss/python/deepagents/subagents)，已有一个通用子智能体配置文件可用于工作流。针对专门的工作流，可以配置[自定义子智能体](https://docs.langchain.com/oss/python/deepagents/subagents#custom-subagents)，拥有自己的名称、描述和系统提示词：名称和描述是智能体知道该选择哪个角色的依据。

要触发动态子智能体，用 `"workflow"` 这个词提示你的智能体：

```python
result = await agent.ainvoke({
    "messages": [{"role": "user", "content": "Run a workflow that reviews every file in src/routes/ and summarizes the top risks."}]
})
```

### 与编码智能体配合使用

尝试动态子智能体最快的方式是使用 `dcode`——我们基于 Deep Agent 构建的终端编码智能体。它默认就启用了代码解释器，无需任何配置——动态子智能体开箱即用。

安装：

```bash
curl -LsSf https://langch.in/dcode | bash
```

运行：

```bash
dcode
```

要触发动态子智能体，只需要求一个"**workflow**"。智能体不会自己逐项执行工作，也不会用原生 task 工具管理子智能体的扇出——而是写一个编排脚本，调用内置的 `task()` 全局函数，并在代码解释器中执行。例如："run a **workflow** to review every file in src/ for SQL injection."

子智能体生成时，`dcode` 会在动态子智能体面板中实时显示它们，按分发批次分组到不同阶段。

你可以在工具选择中通过 ACP（如 Zed）使用它。

## 工作原理

智能体获得一个 [`eval` 工具](https://docs.langchain.com/oss/python/deepagents/interpreters)。它编写 JavaScript，在解释器内部安全地执行。当配置了[子智能体](https://docs.langchain.com/oss/python/deepagents/subagents)时，解释器暴露一个内置的 `task()` 全局函数，用于从代码中分发它们。根据手头任务，模型写不同的代码——循环、分支、`Promise.all`——解释器确定性地运行它们。

`task()` 接受 `description`、`subagentType` 和可选的 `responseSchema`——提供 schema 时，结果已经是类型化的对象，可以直接过滤或传递给下一步。

```js
const result = await task({
  description: "Review src/auth/login.ts for security issues.",
  subagentType: "reviewer",
  responseSchema: {
    type: "object",
    properties: {
      severity: { type: "string", enum: ["high", "medium", "low"] },
      issues: { type: "array", items: { type: "string" } },
    },
  },
})

const critical = result.severity === "high" ? result.issues : []
critical // 模型看到最后一行
```

更多信息见文档中的[编程式子智能体](https://docs.langchain.com/oss/python/deepagents/programmatic-subagents)和[解释器](https://docs.langchain.com/oss/python/deepagents/interpreters)。

## 六种常见编排模式

Anthropic 的[动态工作流](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code)普及了一套用于并行智能体工作的编排模式。它们不是你可以开启的开关，而是工作中自然浮现的形态，智能体会随任务变化而切换到不同的模式。

| 模式       | 形态                               | 何时使用                   |
| ---------- | ---------------------------------- | -------------------------- |
| 分类并执行 | 按类型将每项路由给专属专家         | 混合输入需要不同处理方式   |
| 扇出并合成 | 对不同项并行执行相同工作，然后合并 | 独立单元，生成一份综合报告 |
| 对抗验证   | 先发现，再独立验证，仅保留通过者   | 误报代价高昂               |
| 生成并筛选 | 生成多个方案，评分，保留最优       | 探索选项优于一次命中       |
| 锦标赛     | 两两对决评判，胜者晋级             | 主观或相对标准             |
| 循环至穷尽 | 反复遍历直到某一轮无新发现         | 范围未知，追求完备性       |

下面深入每个模式在 Deep Agents 中的工作方式，附有实时追踪链接。我们也制作了一段讲解这六种模式的视频，可在[这里](https://www.youtube.com/watch?v=5AkdMangfNk)观看。

### 1. 分类并执行

先对项目进行分类，然后每个项目由基于其分类的专属子智能体处理。这让混合输入中不同项目能获得不同专家的处理。

**用例：** 工单分类、错误日志、用户反馈，或任何需要根据类型进行不同处理的批量项目。

**示例：** 支持工单积压处理。智能体读取工单并将其分类为 bug、功能请求或问题。bug 交给 `bug-investigator`，功能请求交给 `feature-analyst`，问题交给 `support-responder`。最终输出按类别分组的摘要。

> 查看追踪：[LangSmith Trace](https://smith.langchain.com/public/20b1da82-de4a-4de4-ae20-6097c059cd94/r)

### 2. 扇出并合成

智能体对许多项目并行分发同类型的工作，然后合并结果。

**用例：** 目录级代码审查、批量文档分析、日志文件处理、对多个服务运行相同检查。

**示例：** 对源码树进行逐文件安全审查。智能体发现 `src/` 下的每个 TypeScript 文件，并为每个文件并行分发一个安全审查器。然后将结果合并为一份优先级排序的报告，包含严重等级和需修改的代码行。

> 查看追踪：[LangSmith Trace](https://smith.langchain.com/public/d80cdf1a-37fc-4823-8500-417fe624fe3e/r)

### 3. 对抗验证

两轮模式。第一轮产生发现结果。第二轮将每个发现交给独立的验证器，只有获得一致同意的发现才被保留。当置信度比速度更重要时，这能减少误报。

**用例：** 误报代价高昂的安全审计、合规检查、任何需要高置信度的审查。

**示例：** 不可接受误报的安全审计。审计器广泛扫描潜在漏洞，然后每个发现被交给一个独立的验证器——验证器全新阅读代码并返回 CONFIRMED 或 REFUTED 判定。只有被确认的发现进入最终报告。

> 查看追踪：[LangSmith Trace](https://smith.langchain.com/public/6f47c6c5-34ee-454e-9ffe-bf23e4a619e6/r)

### 4. 生成并筛选

多个子智能体对同一问题生成独立方案。智能体在代码中比较、评分和筛选结果，仅保留最优。

**用例：** 架构方案、重构策略、内容变体，任何在提交前探索多个选项能产生更好结果的任务。

**示例：** 竞争性的限流器重新设计方案排名。智能体使用 `architect` 产出 `rate-limiter.ts` 的多个独立重新设计方案，每个写入独立文件以免互相覆盖。然后在突发流量下的正确性、多实例支持和复杂度三个维度上评分。最强方案胜出，并附上理由。

> 查看追踪：[LangSmith Trace](https://smith.langchain.com/public/fbecf524-e8c5-4db4-930f-4a82b22d5d59/r)

### 5. 锦标赛

变体方案由一个裁判子智能体两两比较，胜者晋级淘汰轮。

**用例：** 主观标准下的优化、风格选择、在竞争方案中选择最佳实现。

**示例：** 对混乱的 `createOrder` 处理器多个重写方案的两两淘汰赛。多位写手各生成一个侧重不同维度的候选重写方案，然后 `judge` 将它们两两比对，逐轮晋级，直到冠军脱颖而出。最终返回裁判的推理过程。

> 查看追踪：[LangSmith Trace](https://smith.langchain.com/public/f89bcdb7-57be-4a3e-a290-36dbdaaa4294/r)

### 6. 循环至穷尽

智能体运行一个发现循环，对已发现的结果去重，直到不再出现新结果。当工作范围无法预先确定时很有用。

**用例：** 穷举搜索、死代码检测、依赖审计、任何追求完备性而非固定数量结果的扫描。

**示例：** 基于轮次的安全扫描。智能体运行一轮扫描，在代码中检查发现的内容，仅当上一轮出现新问题时才启动下一轮。当某轮不再有新发现时停止。最终报告整合发现和扫描轮次数。

> 查看追踪：[LangSmith Trace](https://smith.langchain.com/public/f93dd802-76c4-41c3-80af-16ce9d10a1a2/r)

## 结论

动态子智能体是赋予智能体更多自主性和更高可靠性的方式。代码处理覆盖范围和中间上下文，模型仍负责需要判断力的工作。以上模式是起点。实践中，智能体会根据任务需求组合和混合使用它们。

这是递归语言模型（RLM）理念的最简形式。一个智能体写代码，代码再分发更多智能体。这就是一个智能体递归地调用自身——不受上下文窗口限制，也不被固定工作流框住。智能体可以将问题分解到任意深度，再以任何适合的形态重新组合碎片。上述编排模式只是可能的早期一瞥，但随着模型编码能力的提升，天花板还会不断升高。

[动态子智能体](https://docs.langchain.com/oss/python/deepagents/dynamic-subagents)就是 Deep Agents 今天交到你手中的实现。从给你的智能体添加一个代码解释器开始，或者直接使用开箱即用的 [`dcode`](https://docs.langchain.com/oss/python/deepagents/code/overview)。

---

> **译者注**：动态子智能体的核心思想非常简洁且强大——与其让 LLM 逐轮工具调用来编排多个子智能体（容易出错、受上下文窗口限制），不如让模型 **写一段代码** 来做编排，然后在沙盒解释器中确定性地执行。这本质上是一种将"不可靠的 LLM 推理"转化为"可靠的程序执行"的策略——模型擅长写代码（训练数据多），解释器擅长确定性地执行代码。这和 Claude Code 的 dynamic workflows、RLM 论文的思路一脉相承，值得在 Agent 工程中深入应用。六种编排模式的命名和分类也很有参考价值，尤其是"扇出并合成"和"对抗验证"在实际工程中会非常实用。
