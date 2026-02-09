---
description: 在这篇文章中，我们将重点介绍我们构建 Claude Agent SDK 的原因、如何使用它构建你自己的智能体，并分享我们团队在实际部署中总结出的最佳实践。
source: https://baoyu.io/translations/building-agents-with-the-claude-agent-sdk
author:
  - "[[@AnthropicAI]]"
created: 2025-12-15
tags:
  - clippings
  - claude-code
  - agent
---
原文： [Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

去年，我们与客户一起分享了 [构建高效智能体](https://www.anthropic.com/engineering/building-effective-agents) 的经验。从那时起，我们发布了 [Claude Code](https://www.anthropic.com/claude-code) ，这是一个智能体编码解决方案，最初是我们为提高 Anthropic 内部开发效率而构建的。

在过去的几个月里，Claude Code 已经远远超出了一个编码工具的范畴。在 Anthropic，我们一直在 [使用它](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code) 进行深度研究、视频创作和记笔记，以及其他无数非编码应用。事实上，它已经开始为我们几乎所有主要的智能体循环 (agent loops) 提供动力。

换句话说，驱动 Claude Code 的智能体框架（即 Claude Code SDK）也同样能驱动许多其他类型的智能体。为了体现这一更广阔的愿景，我们正在将 Claude Code SDK 更名为 Claude Agent SDK。

在这篇文章中，我们将重点介绍我们构建 Claude Agent SDK 的原因、如何使用它构建你自己的智能体，并分享我们团队在实际部署中总结出的最佳实践。

## 给 Claude 一台电脑

Claude Code 背后的 [关键设计原则](https://www.youtube.com/watch?v=vLIDHi-1PVU) 是，Claude 需要程序员每天使用的相同工具。它需要能够在代码库中找到合适的文件、编写和编辑文件、检查代码 (**即“linting”，指使用自动化工具检查代码中的风格错误、潜在 bug 等**)、运行代码、调试、再编辑，有时还需要迭代执行这些操作，直到代码成功运行。

我们发现，通过让 Claude 访问用户的电脑（通过终端），它就拥有了像程序员一样编写代码所需的一切。

但这也使得 Claude Code 中的 Claude 在处理 *非* 编码任务时同样高效。通过赋予它运行 bash 命令、编辑文件、创建文件和搜索文件的工具，Claude 可以读取 CSV 文件、搜索网页、构建可视化图表、解释指标数据，以及处理各种其他数字工作——简而言之，就是创建能使用计算机的通用智能体。Claude Agent SDK 背后的关键设计原则，就是给你的智能体一台电脑，让他们像人类一样工作。

## 创造新型智能体

我们相信，给 Claude 一台电脑，能让我们构建出比以往更强大的智能体。例如，使用我们的 SDK，开发者可以构建：

- **金融智能体** ：构建能够理解你的投资组合和目标，并通过访问外部 API、存储数据和运行代码进行计算来帮你评估投资的智能体。
- **个人助理智能体** ：构建能够帮你预订旅行、管理日历、安排会议、整理简报等的智能体，它通过连接你的内部数据源并跨应用程序跟踪上下文来实现。
- **客户支持智能体** ：构建能够处理高度模糊用户请求（如客户服务工单）的智能体，它通过收集和审查用户数据、连接外部 API、回复用户消息，并在需要时将问题上报给人工客服。
- **深度研究智能体** ：构建能够在大型文档集中进行全面研究的智能体，它通过搜索文件系统、分析和综合来自多个来源的信息、跨文件交叉引用数据，并生成详细报告。

以及更多。从核心上讲，SDK 为你提供了构建智能体所需的基础模块 (**(即“primitives”，可以理解为最基础的“积木”或“零件”)**)，以实现你试图自动化的任何工作流程。

## 构建你的智能体循环

在 Claude Code 中，Claude 通常在一个特定的反馈循环中运行：收集上下文 -> 采取行动 -> 验证工作 -> 重复。

![[claude-agent-sdk-loop.png]]

==智能体通常在一个特定的反馈循环中运行：收集上下文 -> 采取行动 -> 验证工作 -> 重复。==

这为我们思考其他智能体及其应具备的能力提供了一个有用的框架。为了说明这一点，我们将以如何在 Claude Agent SDK 中构建一个电子邮件智能体为例，逐步讲解。

## 收集上下文

在开发智能体时，你不能只给它一个提示：它需要能够获取和更新自己的上下文。以下是 SDK 中的功能如何提供帮助。

文件系统代表了 *可以* 被拉入模型上下文的信息。

当 Claude 遇到大型文件（如日志或用户上传的文件）时，它会决定使用 `grep` 和 `tail` 这样的 bash 脚本，以哪种方式将它们加载到上下文中。本质上，智能体的文件夹和文件结构成为一种上下文工程 (Context Engineering) 的形式。

我们的电子邮件智能体可能会将以前的对话存储在一个名为“Conversations”的文件夹中。这样，当被问及相关问题时，它就可以搜索这些对话以获取上下文。

![](https://baoyu.io/uploads/2025-11-10-d5e3b46900277431b86467fdc308b64e61edd740-2292x623.webp)

[语义搜索 (Semantic search)](https://www.anthropic.com/news/contextual-retrieval) 通常比智能体搜索（agentic search）更快，但准确性较低，更难维护，透明度也较差。它涉及将相关上下文“分块” (chunking)，将这些块“嵌入” (embedding) 为向量 (vectors)，然后通过查询这些向量来搜索概念。鉴于其局限性，我们建议从智能体搜索开始，只有在你需要更快的结果或更多变化时才添加语义搜索。

### 子智能体

Claude Agent SDK 默认支持子智能体 (subagents)。 [子智能体](https://docs.claude.com/en/api/agent-sdk/subagents) 之所以有用，主要有两个原因。首先，它们支持并行处理 (parallelization)：你可以启动多个子智能体同时处理不同任务。其次，它们有助于管理上下文：子智能体使用自己隔离的上下文窗口，只将相关信息（而不是它们的全部上下文）发送回协调者。这使得它们非常适合处理需要从大量信息中筛选有用信息的任务。

在设计我们的电子邮件智能体时，我们可能会赋予它一个“搜索子智能体”的能力。然后，该电子邮件智能体可以并行启动多个搜索子智能体——每个子智能体针对你的电子邮件历史记录运行不同的查询——并让它们只返回相关的摘要，而不是完整的邮件线程。

### 压缩

当智能体长时间运行时，上下文维护变得至关重要。Claude Agent SDK 的压缩 (compaction) 功能会在上下文接近极限时自动总结以前的消息，这样你的智能体就不会耗尽上下文。这是基于 Claude Code 的 `/compact` 斜杠命令构建的。

## 采取行动

收集上下文后，你会希望给你的智能体灵活的行动方式。

### 工具

[工具 (Tools)](https://www.anthropic.com/engineering/writing-tools-for-agents) 是智能体执行任务的主要构建模块。工具在 Claude 的上下文窗口中非常显眼，使其成为 Claude 在决定如何完成任务时会优先考虑的行动。这意味着你应该谨慎设计你的工具，以最大限度地提高上下文效率。你可以在我们的博客文章 [《为智能体编写有效的工具——在智能体的帮助下》](https://www.anthropic.com/engineering/writing-tools-for-agents) 中看到更多最佳实践。

[[为智能体编写高效工具]]

因此，你的工具应该是你希望智能体采取的主要行动。在 Claude Agent SDK 中学习如何制作 [自定义工具](https://docs.claude.com/en/api/agent-sdk/custom-tools) 。

对于我们的电子邮件智能体，我们可能会定义像 “ `fetchInbox` ” (获取收件箱) 或 “ `searchEmails` ” (搜索邮件) 这样的工具，作为智能体的首要、最频繁的行动。

### Bash 和脚本

Bash 是一种有用的通用工具，允许智能体使用电脑灵活地完成工作。

在我们的电子邮件智能体中，用户的重要信息可能存储在附件中。Claude 可以编写代码来下载 PDF，将其转换为文本，并在其中搜索有用的信息，如下图所示：

![](https://baoyu.io/uploads/2025-11-10-e2a32595e35164f46c054dc003197e622ca95180-2292x623.webp)

### 代码生成

Claude Agent SDK 非常擅长代码生成——这是有充分理由的。代码是精确的、可组合的、可无限重用的，这使其成为需要可靠执行复杂操作的智能体的理想输出。

在构建智能体时，请思考：哪些任务通过代码来表达会受益？通常，这个问题的答案能解锁强大的能力。

例如，我们最近在 [Claude.AI](http://claude.ai/redirect/website.v1.0d6ad30c-d223-41a6-b606-a77d8ecd138b) 中推出的 [文件创建功能](https://www.anthropic.com/news/create-files) 就完全依赖于代码生成。Claude 编写 Python 脚本来创建 Excel 电子表格、PowerPoint 演示文稿和 Word 文档，确保了格式的一致性和复杂的功能，而这些是很难通过其他方式实现的。

在我们的电子邮件智能体中，我们可能希望允许用户为收到的邮件创建规则。为实现这一点，我们可以编写代码以在该事件发生时运行：

![](https://baoyu.io/uploads/2025-11-10-180c83cc0f6f0ea26e18cbfbc59040cab6767b55-2292x1290.webp)

### MCPs

[模型上下文协议 (Model Context Protocol, MCP)](https://modelcontextprotocol.io/) 提供了与外部服务的标准化集成，自动处理身份验证和 API 调用。这意味着你可以将你的智能体连接到 Slack、GitHub、Google Drive 或 Asana 等工具，而无需自己编写自定义集成代码或管理 OAuth 流程。

对于我们的电子邮件智能体，我们可能想要 `搜索 Slack 消息` 来了解团队的上下文，或者 `检查 Asana 任务` 来看是否已有人被指派处理客户请求。有了 MCP 服务器，这些集成开箱即用——你的智能体只需调用像 `search_slack_messages` 或 `get_asana_tasks` 这样的工具，MCP 就会处理剩下的事情。

不断增长的 [MCP 生态系统](https://github.com/modelcontextprotocol/servers) 意味着，随着预构建集成的出现，你可以迅速为你的智能体添加新功能，让你能专注于智能体本身的行为。

## 验证你的工作

Claude Code SDK 通过评估其工作来完成智能体循环。能够检查和改进自己产出的智能体在根本上更可靠——它们在错误累积之前就及时发现、在偏离轨道时自我纠正，并在迭代中变得更好。

关键是给 Claude 评估其工作的具体方法。以下是我们发现有效的三种方法：

### 定义规则

最好的反馈形式是为产出提供明确定义的规则，然后解释哪些规则失败了以及为什么失败。

[代码检查 (Code linting)](https://stackoverflow.com/questions/8503559/what-is-linting) 是一种优秀的基于规则的反馈形式。反馈越深入越好。例如，生成 TypeScript 并对其进行检查通常比生成纯 JavaScript 更好，因为它为你提供了更多层次的反馈。

在生成电子邮件时，你可能希望 Claude 检查电子邮件地址是否有效（如果无效，则抛出错误），并检查用户以前是否给他们发送过电子邮件（如果是，则抛出警告）。

当使用智能体完成视觉任务（如 UI 生成或测试）时，视觉反馈（以屏幕截图或渲染图的形式）会很有帮助。例如，如果发送一封带有 HTML 格式的电子邮件，你可以截取生成的电子邮件的屏幕截图，并将其提供给模型进行视觉验证和迭代改进。然后，模型将检查视觉输出是否与要求相符。

例如：

- **布局** - 元素位置是否正确？间距是否合适？
- **样式** - 颜色、字体和格式是否按预期显示？
- **内容层次** - 信息是否以正确的顺序和适当的重点呈现？
- **响应性** - 是否看起来排版混乱或拥挤？（尽管单个屏幕截图的视口信息有限）

使用像 Playwright 这样的 MCP 服务器，你可以自动化这个视觉反馈循环——截取渲染的 HTML 屏幕截图、捕捉不同的视口大小，甚至测试交互元素——所有这些都在你的智能体工作流中完成。

![Claude 正在对智能体生成的电子邮件正文提供视觉反馈。](https://baoyu.io/uploads/2025-11-10-5ea7f3d8652778dc5e2db0cc33a846db5f1a5fb8-2292x2293.webp)

来自大语言模型 (LLM) 的视觉反馈可以为你的智能体提供有益的指导。

### 大语言模型作为评判者

你也可以让另一个大语言模型 (LLM) 根据模糊规则 (**(即“fuzzy rules”，指那些非精确的、定性的、更接近人类直觉的规则)**) 来“评判”你的智能体的输出。这通常不是一种非常稳健的方法，并且可能会有严重的延迟代价，但对于那些性能的任何提升都值得付出成本的应用来说，这可能是有帮助的。

我们的电子邮件智能体可能会有一个单独的子智能体来评判其草稿的 *语气* ，看它们是否与用户以前的消息风格相符。

## 测试和改进你的智能体

在运行了几次智能体循环之后，我们建议你测试你的智能体，并确保它为执行任务做好了充分准备。改进智能体的最佳方法是仔细查看其输出，尤其是失败的案例，并设身处地地为它着想：它是否有合适的 [工具](https://www.anthropic.com/engineering/writing-tools-for-agents) 来完成工作？

在评估你的智能体是否准备好完成其工作时，还可以问以下几个问题：

- 如果你的智能体误解了任务，它是否可能缺少关键信息？你能否改变搜索 API 的结构，使其更容易找到所需信息？
- 如果你的智能体在某项任务上屡次失败，你是否可以在工具调用中添加一个正式规则来识别和修复这个失败？
- 如果你的智能体无法修复其错误，你是否可以给它更多有用或有创意的工具，用不同的方法来解决问题？
- 如果你的智能体在添加功能时性能出现波动，请根据客户使用情况构建一个有代表性的测试集，以进行程序化评估 (evals) **(即“evaluation”，在机器学习中特指用于测试和衡量模型性能的标准化数据集和流程)** 。

## 开始使用

Claude Agent SDK 通过让 Claude 访问一台可以编写文件、运行命令和迭代工作的计算机，使构建自主智能体变得更加容易。

牢记智能体循环（收集上下文、采取行动、验证工作），你就可以构建可靠、易于部署和迭代的智能体。

你今天就可以 [开始使用](https://docs.claude.com/en/api/agent-sdk/overview) Claude Agent SDK。对于已经在使用该 SDK 进行构建的开发者，我们建议按照 [本指南](https://docs.claude.com/en/docs/claude-code/sdk/migration-guide) 迁移到最新版本。

## 致谢

本文由 Thariq Shihipar 撰写，Molly Vorwerck、Suzanne Wang、Alex Isken、Cat Wu、Keir Bradwell、Alexander Bricken 和 Ashwin Bhat 提供了笔记和编辑。

---

原文链接: [https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

---
