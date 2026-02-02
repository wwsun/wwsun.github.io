---
title: Orchestrating multiple agents
source: https://openai.github.io/openai-agents-js/guides/multi-agent/
author:
  - "[[OpenAI Agents SDK]]"
published: 
created: 2025-07-25
description: Coordinate the flow between several agents
tags:
  - clippings
  - agent
---

编排是指应用程序中代理的流程。哪些代理运行，按什么顺序运行，以及它们如何决定接下来发生什么？编排代理主要有两种方式：

1. 允许 LLM 做决策：这使用 LLM 的智能来规划、推理，并根据此决定采取什么步骤。
2. 通过代码编排：通过你的代码确定代理的流程。

你可以混合搭配这些模式。每种模式都有各自的权衡，如下所述。

## 通过 LLM 进行编排

智能体是一个配备了指令、工具和交接功能的 LLM。这意味着面对开放式任务时，LLM 可以自主规划如何处理任务，使用工具来执行操作和获取数据，并使用交接功能将任务委托给子智能体。例如，一个研究智能体可以配备如下工具：

- 网络搜索功能，用于在线查找信息
- 文件搜索和检索功能，用于搜索专有数据和连接
- 计算机使用来在计算机上执行操作
- 执行代码进行数据分析
- 移交给专门的代理，这些代理擅长规划、报告撰写等任务。

当任务是开放性的且您希望依赖 LLM 的智能时，这种模式非常有效。这里最重要的策略是：

1. 投入精力制作优质的提示词。明确说明有哪些工具可用，如何使用它们，以及必须在什么参数范围内操作。
2. 监控您的应用并持续迭代。观察哪里出现问题，并改进您的提示词。
3. 允许代理进行自我反思和改进。例如，在循环中运行它，让它自我批评；或者，提供错误消息并让它进行改进。
4. 使用专门擅长单一任务的代理，而不是使用期望在任何事情上都表现良好的通用代理。
5. Invest in [evals](https://platform.openai.com/docs/guides/evals). This lets you train your agents to improve and get better at tasks.  这让您能够训练您的代理来改进并在任务中表现得更好。

## 通过代码进行编排

虽然通过 LLM 进行编排功能强大，但通过代码进行编排会使任务在速度、成本和性能方面更加确定和可预测。这里的常见模式包括：

- 使用[结构化输出](https://platform.openai.com/docs/guides/structured-outputs)生成格式良好的数据，您可以通过代码检查这些数据。例如，您可以要求代理将任务分类为几个类别，然后根据类别选择下一个代理。
- 通过将一个代理的输出转换为下一个代理的输入来链接多个代理。您可以将写博客文章这样的任务分解为一系列步骤——进行研究、写大纲、写博客文章、进行批评，然后改进它。
- 在 `while` 循环中运行执行任务的代理和评估并提供反馈的代理，直到评估者说输出通过了某些标准。
- 并行运行多个代理，例如通过 JavaScript 原语如 `Promise.all` 。这对于提高速度很有用，当您有多个彼此不依赖的任务时。

你可以参考一些例子 [`examples/agent-patterns`](https://github.com/openai/openai-agents-js/tree/main/examples/agent-patterns). 
