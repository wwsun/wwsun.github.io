---
title: GPT-6 Astra：新一代智能
description: OpenAI 发布 GPT-6 Astra，在电脑操作、专业工作、编程、科学发现与网络安全等维度刷新 SOTA，并同步披露其对齐表现与分级安全部署策略
tags:
  - translation
  - llm
  - openai
  - model-release
  - alignment
source: https://openai.com/index/gpt-6-astra/
date: 2026-09-16
author: OpenAI
---

## GPT-6 Astra：新一代智能

> **原文**：[GPT-6 Astra: A new generation of intelligence](https://openai.com/index/gpt-6-astra/) | 作者：OpenAI | 日期：2026-09

## 摘要

OpenAI 发布 GPT-6 Astra，定位为「全球最智能、对齐程度最高的模型」，把预训练、强化学习与对齐三方面的多年研究和大投入整合在一起。Astra 在电脑操作（computer use）、浏览、软件工程、网络安全、科学和专业工作等方向达到 SOTA：FrontierMath Tier 4 拿下 98%，ARC-AGI-3 达 99.9%，ExploitBench 满分 100%，并已在数学领域帮助解决长期悬而未决的开放问题。它同时把电脑/浏览器操作的速度、准确度与安全性推上新边界。由于网络安全能力触及其 Preparedness Framework 的 Critical 阈值，OpenAI 采取先向少数机构开放、再逐步放量的策略，并配套了越狱鲁棒性、错位监控（misalignment monitoring）等一整套防护。今天起向少量机构开放，随后数日内覆盖全部 ChatGPT Plus、Pro、Business、Enterprise 用户，以及 OpenAI API、Microsoft Azure 和 AWS Bedrock。

## 术语表

| 英文                     | 中文           | 说明                                                                   |
| ------------------------ | -------------- | ---------------------------------------------------------------------- |
| computer use             | 电脑操作       | 模型直接操作图形界面/浏览器完成任务的能力                              |
| harness                  | 运行框架       | 包裹模型的执行外壳，负责工具调用、上下文管理与策略（如 Codex harness） |
| Agents' Last Exam        | 智能体终极考试 | 在真实软件中评测智能体完成复杂专业任务的基准                           |
| compaction               | 上下文压缩     | 长会话中把历史工作摘要化以腾出上下文窗口的做法                         |
| arbitrary code execution | 任意代码执行   | 攻击者可在目标系统上运行任意指令的严重漏洞后果                         |
| privilege escalation     | 权限提升       | 从低权限处获得更高系统权限的攻击手法                                   |
| zero-day exploit         | 零日漏洞利用   | 针对尚未被厂商修复的未知漏洞的攻击程序                                 |
| proof-of-concept exploit | PoC 漏洞利用   | 用于验证漏洞真实存在、尚不具实战破坏性的演示性利用                     |
| Preparedness Framework   | 预备框架       | OpenAI 用于评估模型高风险能力并分级管控的内部框架                      |
| red-teaming              | 红队测试       | 主动模拟攻击者以发现模型与系统弱点的测试方式                           |
| monitorability           | 可监控性       | 模型书面推理能否被外部审查机制有效观察                                 |
| misalignment monitoring  | 错位监控       | 生产环境中用分类器检查模型推理与动作是否越权的机制                     |
| Zero Data Retention      | 零数据保留     | 企业级 API 客户可选的数据不留存策略                                    |

---

## 正文（双语对照）

## A new generation of intelligence

## 新一代智能

We're introducing GPT‑6 Astra, the world's most intelligent and aligned model.

我们正式推出 GPT‑6 Astra——全球最智能、对齐程度最高的模型。

GPT‑6 Astra brings together years of research and big bets across pre-training, reinforcement learning, and alignment. Astra is state-of-the-art on computer use, browsing, software engineering, cybersecurity, science, and professional work. Astra saturates FrontierMath Tier 4 with a 98% score, having already helped solve long-standing open problems in mathematics. Astra also saturates ARC-AGI-3 with a 99.9% score and ExploitBench with a 100% score. It also sets a new frontier on computer and browser use, handling the most demanding professional work with unmatched speed, accuracy, and judgment.

GPT‑6 Astra 汇聚了预训练、强化学习与对齐三条路线多年的研究积累和重大投入。Astra 在电脑操作、浏览、软件工程、网络安全、科学和专业工作等维度均达到业界最佳。它以 98% 的成绩在 FrontierMath Tier 4 上打到饱和，并已帮助解决数学领域长期悬而未决的开放问题。Astra 同样在 ARC-AGI-3 上以 99.9% 的分数饱和，在 ExploitBench 上拿到 100% 满分。它还在电脑与浏览器操作上开辟了新边界，以无可比拟的速度、准确度和判断力处理最严苛的专业工作。

GPT‑6 Astra is rolling out today to a limited set of organizations and over the coming days will become available to all ChatGPT Plus, Pro, Business, and Enterprise users, as well as through the OpenAI API, Microsoft Azure, and AWS Bedrock.

GPT‑6 Astra 今天开始向少量机构开放，未来数日内将面向所有 ChatGPT Plus、Pro、Business 和 Enterprise 用户可用，同时通过 OpenAI API、Microsoft Azure 和 AWS Bedrock 提供。

Terminal-Bench Science 0.1 tests whether agents can complete scientific research workflows using code and terminal tools, including analyzing data, running simulations, and fitting models. GPT‑6 Astra reaches a new high among the models compared at 64.6%, versus 52.6% for Claude Fable 5.1, at approximately 31% lower estimated API cost. At a lower-cost setting, Astra scores 61.1%, versus GPT‑5.6 Sol's best result of 22.4%, at approximately 27% lower estimated API cost.

Terminal-Bench Science 0.1 检验智能体能否借助代码和终端工具完成科研工作流，包括数据分析、运行仿真和模型拟合。GPT‑6 Astra 在参评模型中创下 64.6% 的新高，Claude Fable 5.1 为 52.6%，而 Astra 的预估 API 成本还低约 31%。在低成本档位下，Astra 得分 61.1%，GPT‑5.6 Sol 的最佳成绩为 22.4%，Astra 预估 API 成本低约 27%。

> "On ARC-AGI-3, Astra surpassed our human action-efficiency baseline on 96% of levels, effectively reaching human parity on the benchmark. Not only is this the best model we've ever tested, but it also represents a meaningful step change in frontier-model performance - not only in its ability to navigate and solve novel environments, but also in how efficiently it learns to do so."

> Greg Kamradt，ARC Prize Foundation

> 「在 ARC-AGI-3 上，Astra 在 96% 的关卡上超过了我们的人类动作效率基线，实质上在该基准上达到了人类水准。这不仅是我们测试过的最好的模型，也代表着前沿模型性能的一次实质性跃迁——不只是它在全新环境中导航和求解的能力，还有它学会这么做的效率。」

> Greg Kamradt，ARC Prize Foundation

Astra is our most aligned model, with substantial improvements in understanding user intent and model behavior—you can delegate tasks with greater confidence in Astra's judgment. As one way that we test this, we built a new evaluation informed by the Hugging Face incident that evaluates whether a model facing a difficult or impossible task will go beyond its intended scope. Compared to GPT‑5.6 Sol, which without production safeguards went beyond the authorized target 48% of the time, GPT‑6 Astra did this in 0% of cases.

Astra 是我们对齐程度最高的模型，在理解用户意图和模型行为两方面都有实质提升——你可以更放心地把任务交给 Astra 去判断。作为验证手段之一，我们参考 Hugging Face 事件构建了一套新的评测，用来观察模型在面临困难或不可能完成的任务时，是否会越出预定范围。GPT‑5.6 Sol 在无生产防护的情况下有 48% 的情况越过了授权目标，而 GPT‑6 Astra 的发生率为 0%。

## The world's best computer use model

## 全球最强的电脑操作模型

GPT‑6 Astra marks a new frontier in the speed, accuracy, and safety of computer use. It can take care of tedious tasks like filling out online forms, updating customer records in a CRM, and organizing your calendar. It can conduct online research and draft summaries in your email or in your document editor. It can analyze scientific data, generate plots, create a website, and run frontend QA checks to make sure all the features on that site work. It can help you autonomously install and test software, and troubleshoot problems you see on screen. These improvements are also reflected in our state-of-the-art evaluation results.

GPT‑6 Astra 在电脑操作的速度、准确度和安全性上开辟了新边界。它可以代劳填写在线表单、在 CRM 中更新客户记录、整理日历这类琐碎任务；可以开展在线调研，并在你的邮箱或文档编辑器中起草摘要；可以分析科学数据、生成图表、搭建网站，并跑一遍前端 QA 检查来确认站点各项功能正常；还能协助你自主安装和测试软件、排查屏幕上出现的问题。这些改进同样体现在我们业界领先的评测结果中。

Agents' Last Exam tests agents on complex professional tasks in real software, from financial modeling to engineering and media production. GPT‑6 Astra reaches a new high in the comparison shown, scoring 59.3%, compared with 55.5% for Claude Opus 5 and 53.6% for GPT‑5.6 Sol. At these highest-scoring settings, Astra also uses approximately 65% fewer output tokens than Opus 5.

Agents' Last Exam 在真实软件中考察智能体完成复杂专业任务的能力，覆盖从金融建模到工程与媒体制作的各类场景。GPT‑6 Astra 在所列对比中创下 59.3% 的新高，Claude Opus 5 为 55.5%，GPT‑5.6 Sol 为 53.6%。在这些最高得分档位下，Astra 的输出 Token 用量还比 Opus 5 少约 65%。

These improvements also result in significant efficiency gains in real knowledge-work tasks. In latency simulations on OSWorld 2.0, Astra achieves higher computer-use performance in about 47% less time per task than GPT‑5.6 Sol, scoring 72.6% at roughly 40 minutes per task, compared with 65.7% at roughly 75 minutes.

这些改进也带来了真实知识工作任务中可观的效率提升。在 OSWorld 2.0 的延迟模拟中，Astra 以比 GPT‑5.6 Sol 少约 47% 的单任务耗时取得了更高的电脑操作表现：每个任务约 40 分钟、得分 72.6%，而 Sol 约 75 分钟、得分 65.7%。

GPT‑6 Astra's computer-use capabilities can be seen in outputs across domains, including game development, electrical engineering, and everyday knowledge work:

GPT‑6 Astra 的电脑操作能力可以在多个领域的产出中看到，包括游戏开发、电子工程和日常知识工作：

This is a 15-second condensed playback of GPT‑6 Astra performing printed circuit board (PCB) layout in KiCad, turning an electronic schematic into a manufacturable PCB by placing components and routing copper connections. Integral to every electronic device today, PCB layout is a manual task and common source of latency in the electronics design process. Accelerating it means freeing engineers to invent, optimize, and test their next idea at a significantly higher cadence.

这是 GPT‑6 Astra 在 KiCad 中做印制电路板（PCB）布局的 15 秒浓缩回放：它把电子原理图变成可量产的 PCB，摆放元器件并布通铜线连接。PCB 布局是当今所有电子设备不可或缺的环节，属于人工任务，也是电子设计流程中常见的耗时瓶颈。加速这一环节，意味着工程师能以高得多的节奏去构想、优化和验证下一个想法。

Alongside Astra, we are also updating the Codex harness to significantly improve the speed of computer use. Combined with Astra's efficiency, this translates to a 1.9x faster task completion compared to the current GPT‑5.6 Sol experience, on the Mind2Web benchmark. The model's improvements on speed mean it can take on many time-consuming life tasks for you, faster than you can.

配合 Astra，我们还更新了 Codex 运行框架，大幅提升电脑操作速度。结合 Astra 自身的效率，在 Mind2Web 基准上，任务完成速度相比当前 GPT‑5.6 Sol 的体验快 1.9 倍。模型在速度上的进步意味着它能替你接下许多耗时的生活琐事，而且比你亲自动手更快。

> "We're integrating GPT‑6 Astra into Devin's harness on launch day, where it delivers state-of-the-art performance on our internal testing benchmark. Its excellent computer use, writing, and codebase understanding improved testing right out of the box: videos are noticeably easier to follow, and reports are clearer and more concise"

> Silas Alberti，SVP Research，Cognition

> 「我们在发布当天就把 GPT‑6 Astra 接入 Devin 的运行框架，它在我们内部测试基准上给出了业界最佳表现。出色的电脑操作、写作和代码库理解能力开箱即用地改善了测试：视频明显更好跟随，报告也更清晰简洁。」

> Silas Alberti，Cognition 研究高级副总裁

## A step change in professional work

## 专业工作能力的跃迁

GPT‑6 Astra pairs advances in computer use with targeted training for professional environments, to help tackle complex work tasks. It combines the intelligence required for complex problems with the ability to carry out multistep workflows and produce polished documents, spreadsheets, and presentations.

GPT‑6 Astra 把电脑操作上的进步与面向专业环境的针对性训练结合起来，用于攻克复杂工作任务。它既具备解决复杂问题所需的智能，也能执行多步骤工作流，并产出打磨到位的文档、表格和演示文稿。

BenchCAD tests whether models can reconstruct 3D objects from multi-view renders by generating CAD code. With tools, GPT‑6 Astra reaches a new high in the comparison shown, achieving a 95.9% geometric-overlap score, versus 83.3% for GPT‑5.6 Sol and 84.3% reported for Claude Fable 5.1. Estimated API cost is approximately 43% lower than Sol and 86% lower than Fable 5.1 in the configurations shown.

BenchCAD 考察模型能否通过生成 CAD 代码，从多视角渲染图中重建三维物体。在带工具的情况下，GPT‑6 Astra 在所列对比中创下新高，几何重叠度得分 95.9%，GPT‑5.6 Sol 为 83.3%，Claude Fable 5.1 报告值为 84.3%。在所示配置下，Astra 的预估 API 成本比 Sol 低约 43%，比 Fable 5.1 低约 86%。

GPT‑6 Astra is our best model for adhering to existing templates and producing slides that are well laid out and succinctly convey key points with a structured narrative. It creates clear, well-structured documents, presentations, spreadsheets, and analyses that follow your templates and match your writing and visual style. Astra is also trained to specifically pull only the context that matters into outputs, instead of repeating information unnecessary for the work at hand. All this means it can output more immediately usable artifacts that match your business context and standards.

GPT‑6 Astra 是我们遵循既有模板表现最好的模型，能生成版式规范、以结构化叙事简洁传达要点的幻灯片。它产出的文档、演示、表格和分析清晰且结构良好，既遵循你的模板，也贴合你的写作与视觉风格。Astra 还被专门训练为只把真正相关的上下文带进产出，而不是重复与当前工作无关的信息。这些能力合在一起，意味着它能给出更立即可用、更符合你业务语境与标准的交付物。

GPT‑6 Astra creates a slideshow about GPT‑Gaia, a fictional model, using just a few slides from OpenAI's presentation template, capturing the correct tone and layout throughout. This means you can expect slide decks that are correctly formatted for your business standards.

GPT‑6 Astra 仅用 OpenAI 演示模板中的几页幻灯片，就为虚构模型 GPT‑Gaia 生成了一套演示文稿，全程把握住了正确的语气与版式。这意味着你可以期待拿到符合业务规范、格式正确的幻灯片。

GPT‑6 Astra also brings stronger visual judgment to the websites, games, applications, and renderings it builds. With Sites in ChatGPT, Astra can create, host, and share websites, web apps, and games directly from a prompt.

GPT‑6 Astra 在它构建的网站、游戏、应用和渲染图上，也带来了更强的视觉判断力。借助 ChatGPT 中的 Sites，Astra 可以直接从一条提示词出发，创建、托管并分享网站、Web 应用和游戏。

> "Astra gives us a significant advantage in both capability and efficiency. It successfully executes our most complex creative workflows while using up to 20% fewer tokens than other models we've tested. Most importantly, for our customers, it means higher quality output."

> Alex Mashrabov，CEO 兼联合创始人，Higgsfield AI

> 「Astra 在能力和效率上都给了我们显著优势。它能成功执行我们最复杂的创意工作流，同时比我们测试过的其他模型最多少用 20% 的 Token。最重要的是，对我们的客户来说，这意味着更高质量的输出。」

> Alex Mashrabov，Higgsfield AI 首席执行官兼联合创始人

GPT‑6 Astra models a house in Blender and turns it into a walkable scene in Unreal Engine 5, helping designers and clients explore the layout and experience the space before it's built.

GPT‑6 Astra 在 Blender 中为房屋建模，并把它转换成 Unreal Engine 5 中可行走的场景，帮助设计师和客户在动工之前就勘察布局、体验空间。

The model can bring games to life through vivid graphics, engaging gameplay and accurate motion, allowing non-technical people to create and play custom games that go beyond rudimentary elements in minutes. Credit: Pietro Schirano.

该模型能通过生动的画面、有吸引力的玩法和准确的动作把游戏做活，让非技术背景的人也能在几分钟内创建并游玩超越基础元素的定制游戏。图片来源：Pietro Schirano。

When instructions leave room for interpretation, GPT‑6 Astra is better than previous models at making the right call. It uses context to fill in routine gaps and asks focused questions when the answer could change the outcome. In Codex, it can ask asynchronously while continuing work that doesn't depend on your reply. If you don't respond, it proceeds with sensible assumptions where appropriate, but waits for your input on consequential decisions.

当指令留有解释空间时，GPT‑6 Astra 比以往模型更善于做出正确判断。它用上下文补全常规缺失信息，而一旦答案可能改变结果，就会提出针对性的问题。在 Codex 中，它可以异步提问，同时继续推进不依赖你回复的工作。如果你没有回应，它会在合适的地方按合理的假设继续，但在有重大影响的决策上会等你拍板。

The examples below show how Astra collaborates on everyday tasks where missing information can materially change the answer.

下面的示例展示了 Astra 如何在缺失信息会显著改变答案的日常任务中协作。

Astra is also better at staying oriented as a task evolves. Earlier models sometimes treated steering messages as a new goal, losing track of the original request or earlier constraints. Astra incorporates new requirements, changes course when asked, and answers side questions without dropping the broader task.

Astra 在任务演进过程中也更善于保持方向感。以往模型有时会把引导性消息当成新目标，从而丢掉原始请求或更早的约束条件。Astra 能纳入新要求、按要求改道，并在回答附带问题的同时不丢掉更大的任务。

> "Astra is a significant quality improvement over GPT‑5.6 Sol across complex legal tasks. In our early testing, Astra stood out by approaching legal work the way a discerning lawyer does: it distinguishes documents from established records, surfaces unsupported assumptions, and converts gaps into concrete drafting positions."

> Niko Grupen，应用研究负责人，Harvey

> 「在复杂法律任务上，Astra 相比 GPT‑5.6 Sol 是显著的质量提升。在早期测试中，Astra 的突出之处在于它像一位有辨别力的律师那样处理法律工作：区分文档与既定记录，揭示缺乏支撑的假设，并把空白转化为具体的起草立场。」

> Niko Grupen，Harvey 应用研究负责人

## Coding

## 编程

GPT‑6 Astra is the best model for software engineering to date.

GPT‑6 Astra 是迄今为止最好的软件工程模型。

> "GPT‑6 Astra delivers state-of-the-art performance on our internal coding benchmarks and shows a clear step forward in trading intuition evaluations compared with GPT‑5.6 Sol. When used for agentic coding, GPT‑6 Astra communicates in a way that's easier for developers to follow and produces code that requires less iteration to reach production quality."

> John Crepezzi，AI Assistants，Jane Street

> 「GPT‑6 Astra 在我们内部编码基准上取得了业界最佳表现，在交易直觉评测上也相较 GPT‑5.6 Sol 有明显进步。用于智能体编程时，GPT‑6 Astra 的表达方式更便于开发者跟随，产出的代码达到生产质量所需的迭代次数也更少。」

> John Crepezzi，Jane Street AI Assistants

> "We tested Astra across low, medium, and high effort on one of our first-generation evals, and it came out significantly ahead of GPT 5.6 Sol. Higher effort buys more iterations on a fresh build, more verification through browser testing, and a lean toward code execution over apply-patch. Understanding how a model spends its effort is how we give millions of builders a faster, more reliable path from idea to working app."

> Fabian Hedin，CTO 兼联合创始人，Lovable

> 「我们在第一代评测之一上按低、中、高三档投入测试了 Astra，结果明显领先 GPT 5.6 Sol。更高的投入带来的是：新项目构建时更多轮迭代、更多通过浏览器测试做验证，以及更偏向直接执行代码而非打补丁。理解模型如何分配它的投入，正是我们为百万开发者提供从想法到可用应用这条更快、更可靠路径的方式。」

> Fabian Hedin，Lovable 首席技术官兼联合创始人

Terminal-Bench 4.0 tests agents on complex terminal-based tasks, including software engineering, system configuration, and data analysis. GPT‑6 Astra reaches a new high at 57.9%, compared with 37.3% for GPT‑5.6 Sol and 55.8% for Claude Fable 5.1, at approximately 9% and 63% lower estimated API cost per task, respectively.

Terminal-Bench 4.0 考察智能体完成基于终端的复杂任务，涵盖软件工程、系统配置和数据分析。GPT‑6 Astra 以 57.9% 创下新高，GPT‑5.6 Sol 为 37.3%，Claude Fable 5.1 为 55.8%；每任务的预估 API 成本分别低约 9% 和 63%。

With Astra, we're introducing a new way for Codex to preserve and retrieve context when the context window fills. Historically, models have used compaction to summarize work during long sessions, such as when debugging complex issues or tackling large refactors. Each compaction can leave out details about why a fix failed or how a component behaves. In Codex, Astra can keep notes across context windows, preserving accumulated details without repeatedly compressing them into a single summary. Earlier context windows remain searchable, so Astra can find requirements or test results from previous messages and tool outputs—even if that information wasn't captured in its notes. You can enable this experimental feature in your Codex config.toml, and it will become the default for Astra in the coming weeks.

伴随 Astra，我们为 Codex 引入了一种在上下文窗口写满时保存和检索上下文的新方式。过去，模型在长会话（例如调试复杂问题或处理大型重构）中依赖压缩（compaction）来摘要化已有工作，而每次压缩都可能丢掉「这个修法为什么失败」「某个组件行为如何」这类细节。在 Codex 中，Astra 能够跨上下文窗口保留笔记，把逐步累积的细节留存下来，而不必反复压成一份摘要。此前的上下文窗口仍然可检索，因此 Astra 能找到先前消息和工具输出中的需求或测试结果——即使这些信息并没有被写进它的笔记。你可以在 Codex 的 `config.toml` 中启用这个实验性功能，未来几周它将成为 Astra 的默认行为。

## Advancing scientific discovery

## 推动科学发现

> "The story is: end of one era, start of another."

> Greg Burnham，EpochAI

> 「故事是这样的：一个时代结束了，另一个时代开始了。」

> Greg Burnham，EpochAI

GPT‑6 Astra is a major advance for scientific discovery, mathematics, and health. Today, we're sharing two further results on the gaps between prime numbers.

GPT‑6 Astra 是科学发现、数学与健康领域的重大进步。今天我们分享关于素数间隔的两项新成果。

Astra also sets new records across a suite of math and science evaluations.

Astra 还在一系列数学与科学评测中刷新了纪录。

GPQA Diamond tests graduate-level scientific reasoning in biology, chemistry, and physics. GPT‑6 Astra reaches a new high in the comparison shown at 96.0%. At a lower-cost setting, it also exceeds GPT‑5.6 Sol's best score—94.9% versus 94.6%—at approximately 37% lower estimated API cost.

GPQA Diamond 考察生物、化学、物理方向的研究生水平科学推理。GPT‑6 Astra 在所列对比中以 96.0% 创下新高。即便在低成本档位，它也超过了 GPT‑5.6 Sol 的最佳成绩——94.9% 对 94.6%——而预估 API 成本低约 37%。

Astra can help with the practical work behind scientific discovery. By combining scientific reasoning with computer use, it can work directly in specialized software to inspect data and explore results, helping researchers assess the evidence and decide what to investigate next.

Astra 能协助科学发现背后的实干工作。把科学推理与电脑操作结合起来，它可以直接在专业软件中作业，检查数据、探索结果，帮助研究者评估证据、决定下一步查什么。

GPT‑6 Astra navigates scientific software to inspect sequencing quality and visualize genetic variation, helping researchers assess their data and identify where to focus further analysis.

GPT‑6 Astra 能操作科研软件检查测序质量、可视化遗传变异，帮助研究者评估数据并确定后续分析的着力点。

## Cybersecurity

## 网络安全

As we discussed in our safety update, Astra is a significant jump in cyber capabilities and meets the Critical threshold in cybersecurity under our Preparedness Framework. Its ability to identify and develop zero-day exploits can help defenders find and patch weaknesses, but it also creates a need for stronger safeguards. To understand how far these capabilities extend, we ran Astra on internal and third-party expert evaluations.

正如我们在安全更新中所讨论的，Astra 在网络能力上是显著跃升，并达到了我们预备框架（Preparedness Framework）中网络安全维度的 Critical 阈值。它发现并开发零日漏洞利用的能力可以帮助防御方发现并修补弱点，但同时也要求更坚固的防护措施。为了摸清这些能力究竟能走多远，我们在内部和第三方专家评测中测试了 Astra。

We first tested the model without production safeguards on ExploitBench and ExploitGym, which evaluate whether models can turn known software vulnerabilities into working exploits. On ExploitBench, Astra achieved a perfect score of 100%, compared with 78.5% for GPT‑5.6 Sol, our previous frontier cyber-capable model. On ExploitGym, Astra reached a 42.4% success rate, compared with 30.3% for GPT‑5.6 Sol, while using substantially fewer output tokens.

我们首先在无生产防护的条件下，用 ExploitBench 和 ExploitGym 测试该模型——这两个基准考察模型能否把已知软件漏洞转化为可用的漏洞利用程序。在 ExploitBench 上，Astra 拿到 100% 满分，此前具备前沿网络能力的 GPT‑5.6 Sol 为 78.5%。在 ExploitGym 上，Astra 成功率 42.4%，GPT‑5.6 Sol 为 30.3%，且 Astra 使用的输出 Token 明显更少。

Given concerns that exposure to historical software vulnerabilities may have affected benchmark results, we also evaluated Astra on two novel benchmarks. For one, we built an internal "ExploitBench (June–August 2026)" evaluation to test exploit development using vulnerabilities from the previous three months. Astra achieved substantially higher arbitrary code-execution rates than GPT‑5.6 Sol on this dataset while using far fewer output tokens. During the evaluation, Astra even discovered and used two previously unknown zero-day vulnerabilities. We are disclosing both vulnerabilities to their maintainers.

考虑到模型接触过历史软件漏洞可能影响基准结果，我们还用两个新基准评测了 Astra。其一，我们构建了内部的 ExploitBench（2026 年 6–8 月），用最近三个月出现的漏洞来测试漏洞利用开发。在该数据集上，Astra 实现任意代码执行的比例大幅高于 GPT‑5.6 Sol，同时输出 Token 用量远低于对方。评测过程中，Astra 甚至发现并利用了此前未知的两个零日漏洞。我们正把这两个漏洞披露给相应的维护方。

We also tested Astra on SRE-Bench, a benchmark that measures whether models can reverse engineer software binaries to understand its core logic without access to raw source code. Astra solved 88.0% of tasks in a single attempt and 99.2% within four attempts, compared with 55.9% and 68.7% for GPT‑5.6 Sol, respectively.

我们还在 SRE-Bench 上测试了 Astra，该基准考察模型能否在没有原始源码的情况下逆向工程软件二进制文件、理解其核心逻辑。Astra 首次尝试即解决 88.0% 的任务，四次尝试内解决 99.2%；GPT‑5.6 Sol 分别为 55.9% 和 68.7%。

Beyond benchmarks, expert-led assessments found that Astra, when run without production safeguards, could use previously unknown vulnerabilities to achieve arbitrary code execution in hardened browsers and create privilege-escalation exploits for hardened operating-systems.

除基准之外，专家主导的评估发现：在无生产防护运行的条件下，Astra 能利用此前未知的漏洞在加固过的浏览器中实现任意代码执行，并为加固过的操作系统构造权限提升利用程序。

As we discussed in The Defender's Window, frontier cyber capabilities can help defenders find weaknesses faster, but they also make those weaknesses easier to exploit, raising the urgency for defenders to adapt. With the version of Astra launching today, defenders can use it to complete tasks such as secure code review and patching.

正如我们在《The Defender's Window》中讨论的，前沿网络能力能帮助防御方更快发现弱点，但同样让这些弱点更易被利用，从而提高了防御方适应变化的紧迫性。今天发布的这个 Astra 版本，防御方可以用它完成安全代码审计、打补丁等工作。

However, Astra will refuse to comply with more advanced cybersecurity tasks such as creating proof-of-concept exploits for vulnerabilities. Through OpenAI Daybreak, we plan to expand access and roll out less restrictive safeguards in the coming weeks. This will enable more defensive workflows, including vulnerability and proof-of-concept validation, malware analysis, and detection engineering.

不过，对于更高级的网络安全任务——例如为漏洞编写 PoC 利用程序——Astra 会拒绝执行。我们计划通过 OpenAI Daybreak 逐步扩大访问范围，并在未来几周推出限制更少的防护策略。这会支持更多防御性工作流，包括漏洞与 PoC 验证、恶意软件分析和检测工程。

We have also strengthened our protections against potential cyber misuse, building upon our safeguards stack for GPT‑5.6 Sol. These include stronger model robustness to better withstand potential jailbreaks and more context for our monitoring systems. We have continued rigorous internal and external testing, including automated evaluations with our internal red-teaming attackers. More details about our cyber safeguards and testing are available in the Astra safety overview and system card.

我们还在 GPT‑5.6 Sol 的防护栈基础上，加强了对潜在网络滥用的防范。这包括更强的模型鲁棒性以抵御潜在的越狱，以及为监控系统提供更多上下文。我们持续开展严格的内部与外部测试，包括用内部红队攻击者做的自动化评测。关于网络防护与测试的更多细节，见 Astra 安全概览和系统卡。

## Aligning and deploying GPT‑6 Astra responsibly

## 负责任地对齐与部署 GPT‑6 Astra

Astra is our most aligned model. Astra excels at exercising care, respecting task boundaries, and communicating transparently. This work is the latest product of our long-running research program focused on training models that remain aligned with human intent from start to finish.

Astra 是我们对齐程度最高的模型，在保持审慎、尊重任务边界和透明沟通上表现出色。这项成果是我们长期研究计划的最新产出，该计划聚焦于训练从始至终都与人类意图保持一致的模型。

In sensitive environments, Astra proceeds with care commensurate with its risk. In an evaluation of computer use tasks adversarially selected to elicit misbehavior, Astra was more successful at avoiding unintended consequences. Running with additional security measures offered by default yielded even stronger performance.

在敏感环境中，Astra 会以与其风险相称的谨慎程度行事。在一项以对抗方式挑选、旨在诱发不当行为的电脑操作任务评测中，Astra 更成功地避免了非预期后果。在默认开启额外安全措施的情况下运行，表现还会更强。

Astra causes fewer misaligned outcomes than any other frontier models tested. For a fair comparison, we used a generic computer-using-agent harness (based on the native computer use tools available in both the OpenAI Responses API and Anthropic Messages API) and without additional protections that are normally deployed to Codex and ChatGPT Work users (auto-review, confirmation policy).

在所有被测前沿模型中，Astra 造成的不一致（misaligned）结果最少。为保证对比公平，我们使用了一套通用的电脑操作智能体运行框架（基于 OpenAI Responses API 和 Anthropic Messages API 中都提供的原生电脑操作工具），并且不加通常对 Codex 和 ChatGPT Work 用户部署的额外防护（自动审查、确认策略）。

Astra is also more likely to operate within the boundaries set by the user and implied by its environment. In an internal evaluation, Astra never attempted to circumvent a Codex Auto-Review denial. This held even when Auto-review was deliberately configured to be evadable and the task was impossible to complete otherwise. This respect for the environment restrictions is consistent with the results of our impossible cyber task evaluation that we shared in the intro of this post and other findings documented in our system card.

Astra 也更倾向于在用户设定、环境隐含的边界内行动。在一项内部评测中，Astra 从未尝试绕过 Codex Auto-Review 的拒绝。即便我们故意把自动审查配置成可被规避、且任务在不绕过的情况下根本无法完成，这一点依然成立。这种对环境限制的尊重，与我们在本文开头分享的「不可能完成的网络任务」评测结果，以及系统卡中记录的其他发现一致。

This evaluation tests how models respond to auto-review denials in knowledge-work tasks. Exploiting a poor user configuration to bypass auto-review counts as failure. Astra never attempted to circumvent auto-review.

该评测考察模型在知识工作类任务中如何应对自动审查的拒绝。利用用户配置不当来绕过自动审查，即判定为失败。Astra 从未尝试规避自动审查。

Astra additionally sets new marks in transparent user communication. In one evaluation, Astra is three times less likely than GPT‑5.6 Sol to make inaccurate representations about its capabilities and affordances.

Astra 还在透明的用户沟通上创下新纪录。在一项评测中，Astra 就自身能力与可提供功能做出不准确陈述的概率，比 GPT‑5.6 Sol 低三倍。

In our capability-hallucination evaluation, Astra shows a substantial improvement over GPT‑5.6 Sol, making fewer misleading claims about its capabilities.

在我们的能力幻觉评测中，Astra 相较 GPT‑5.6 Sol 有大幅改善，关于自身能力的误导性陈述更少。

Our evaluations found Astra's written reasoning harder to monitor than GPT‑5.6 Sol's, based on tests that explicitly asked it to evade monitoring. We attribute this to Astra's greater control over written reasoning on simpler tasks and ability to solve problems with fewer written steps. Astra still appears to struggle to conceal the reasoning needed for complex tasks, but we take the decline seriously. Improving monitorability remains a research priority, and the accompanying system card details our findings and ongoing work.

我们的评测发现，在明确要求模型规避监控的测试中，Astra 的书面推理比 GPT‑5.6 Sol 更难被监控。我们认为原因在于 Astra 在较简单任务上对书面推理的控制力更强，且能用更少的书面步骤解决问题。面对复杂任务，Astra 似乎仍然难以隐藏所需的推理过程，但我们对这一下降持认真态度。提升可监控性仍是研究优先事项，随附的系统卡详述了我们的发现与在研工作。

Alignment training is core to our approach to deployment. As an additional layer of defenses, we also build system safeguards like Codex Auto-review and monitoring agents' reasoning and actions to help detect and contain unsafe behavior. As described in our safety update, we are also deploying misalignment monitoring in production for Astra-class models in order to have visibility into misalignment, and help contain its worst instances. These safeguards resemble our monitoring for internal deployments and involve a system of classifiers which check the model's reasoning and actions for unauthorized behavior and automatically stop potentially unauthorized activity.

对齐训练是我们部署方法的核心。作为额外的防御层，我们还构建了 Codex Auto-review 之类的系统级防护，并监控智能体的推理与动作，以帮助发现和遏制不安全行为。正如安全更新所述，我们还在生产环境中为 Astra 级模型部署错位监控，以便对不一致行为保持可见性，并帮助遏制其中最严重的案例。这些防护与我们内部部署的监控类似，包含一套分类器系统，用于检查模型的推理与动作是否存在未授权行为，并自动中止可能未授权的活动。

Given the significant increase in Astra's cybersecurity capabilities, we are being especially careful to make this deployment safe and secure. Extra safety checks can sometimes slow, pause, or stop legitimate work, including defensive cybersecurity. If a task is paused in ChatGPT or Codex, you may be asked to review the action before continuing. In the API, the task will stop. These checks can sometimes interrupt legitimate work, and we are continuing to iterate on this system to reduce unnecessary interruptions. Misalignment monitoring cannot replace alignment: our goal is to build models that reliably stay within their authorized scope, so these protections do not need to intervene.

鉴于 Astra 的网络安全能力显著增强，我们格外谨慎地确保这次部署安全可靠。额外的安全检查有时会拖慢、暂停甚至中止合法工作，包括防御性网络安全工作。如果任务在 ChatGPT 或 Codex 中被暂停，你可能会被要求先复核该动作再继续；在 API 中，任务会直接停止。这些检查有时会打断合法工作，我们也在持续迭代该系统以减少不必要的打扰。错位监控无法替代对齐本身：我们的目标是构建能可靠地待在授权范围内的模型，从而让这些防护无需介入。

## Availability

## 可用性

GPT‑6 Astra is rolling out today to a limited set of organizations and over the coming days will become available to all ChatGPT Plus, Pro, Business, and Enterprise users, as well as through the OpenAI API, Microsoft Azure, and AWS Bedrock. Astra usage is included within the existing subscription allowances—users and businesses will also be able to purchase credits for additional usage. Users on the Pro, Business, and Enterprise plans will also get access to GPT‑6 Astra Pro. Enterprise administrators can enable Astra for their workspace; access is off by default at launch.

GPT‑6 Astra 今天开始向少量机构开放，未来数日内将面向所有 ChatGPT Plus、Pro、Business 和 Enterprise 用户可用，同时通过 OpenAI API、Microsoft Azure 和 AWS Bedrock 提供。Astra 的用量包含在现有订阅额度内——用户和企业也可以购买额外用量的额度。Pro、Business 和 Enterprise 套餐的用户还可以使用 GPT‑6 Astra Pro。企业管理员可以为其工作区启用 Astra；发布时默认处于关闭状态。

Astra supports Zero Data Retention for eligible API customers, and as we shared last month, we're testing Private Safety Processing to strengthen safety monitoring while preserving customer privacy.

Astra 为符合条件的 API 客户支持零数据保留（Zero Data Retention）。正如我们上个月分享的，我们正在测试 Private Safety Processing，以在保护客户隐私的同时加强安全监控。

For developers, GPT‑6 Astra will be available in the OpenAI API as `gpt-6-astra` and through Microsoft Azure and Amazon Bedrock.

对开发者而言，GPT‑6 Astra 将以 `gpt-6-astra` 的形式在 OpenAI API 中提供，并通过 Microsoft Azure 和 Amazon Bedrock 提供。

OpenAI API Standard pricing is $10 per million input tokens and $50 per million output tokens. Separate rates apply to cache reads and writes. Fast mode is available for GPT‑6 Astra in the API and delivers up to 2x the speed of Standard processing at 2x the Standard price.

OpenAI API 标准定价为每百万输入 Token 10 美元、每百万输出 Token 50 美元。缓存读取与写入适用单独费率。API 中的 GPT‑6 Astra 提供 Fast 模式，速度最高可达标准处理的 2 倍，价格为标准价的 2 倍。

---

## 附录：评测数据（原文表格）

> 以下表格保留原文的基准名称与数值，列顺序统一为：GPT‑6 Astra / GPT‑5.6 Sol / Claude Fable 5.1 / Claude Fable 5 / Claude Opus 5 / Gemini 3.8 Flash。

### Computer Use（电脑操作）

- Agents' Last Exam — 59.3% / 53.6% / — / 48.7% / 55.5% / —
- OSWorld 2.0（v2026.08.08，offline set，部分得分）— 72.6% / 65.7% / — / 70.2% [3] / — / —
- ScreenSpot-Pro（无工具）— 92.7% / 76.9% / 87.3% [17] / — / — / —

### Professional（专业工作）

- AutomationBench — 41.4% / 18.1% / 31.4% / 17.4% / 26.9% / —
- BenchCAD — 95.9% / 83.3% / 84.3% [5] / 67.5% [5] / 82.1% [5] / —
- BrowseComp — 91.5% / 90.4% / 87.4% / — / 90.8% / —
- OpenScore String Quartets（1 - OMR-NED）— 0.84 / 0.19 / — / — / — / —
- Internal Design Tasks — 50.0% / 47.4% / — / — / 35.8% / —
- Internal Data Science Tasks — 40.9% / 30.5% / — / — / 34.7% / —
- Artificial Analysis Intelligence Index v4.1.1 — 61.2 / 60.9 / 65.7 / 62.1 / 63.1 / 58.7

### Coding（编程）

| Coding                                      | GPT‑6 Astra | GPT‑5.6 Sol | Claude Fable 5.1 | Claude Fable 5 | Claude Opus 5 | Gemini 3.8 Flash |
| ------------------------------------------- | ----------- | ----------- | ---------------- | -------------- | ------------- | ---------------- |
| Terminal-Bench 4.0                          | 57.9%       | 37.3%       | 55.8%            | 44.5%          | 52.6%         | 19.1%            |
| DeepSWE v1.1                                | 74.1%       | 72.7%       | 67.4%            | 69.9%          | 73.7%         | 73.8%            |
| FrontierCode 1.1 Extended（score）          | 64.5% [8]   | 60.6%       | 63.6%            | 64.9%          | 63.6%         | 56.3%            |
| FrontierCode 1.1 Main（score）              | 53.3% [8]   | 47.5%       | 50.9%            | 53.5%          | 53.4%         | 43.6%            |
| Internal Database Migration Tasks           | 63.9%       | 42.7%       | 57.8%            | 50.3%          | —             | —                |
| Artificial Analysis Coding Agent Index v1.4 | 67.0        | 65.1        | —                | 67.2           | 68.1          | 61.2             |

### Academic（学术）

- Terminal-Bench Science 0.1 — 64.6% / 22.4% / 52.6% / — / 21.4% / —
- FrontierMath Tier 4（v2）— 97.6% / 83.0% / 87.8% / — / 90.2% / 73.2%
- GPQA Diamond — 96.0% / 94.6% / 93.7% / 92.6% / 93.7% / 95.3%
- Humanity's Last Exam（带工具）— 57.2% / 65.0% / 63.8% / — / — / 63.6%

### Science and Health（科学与健康）

| Science and Health                   | GPT‑6 Astra | GPT‑5.6 Sol | Claude Fable 5.1 | Claude Fable 5 | Claude Opus 5 | Gemini 3.8 Flash |
| ------------------------------------ | ----------- | ----------- | ---------------- | -------------- | ------------- | ---------------- |
| GeneBench Pro                        | 37.1%       | 32.3%       | —                | —              | —             | —                |
| MedChemBench（Internal）             | 49.3%       | 47.4%       | —                | —              | —             | —                |
| LifeSciBench                         | 60.3%       | 59.9%       | —                | —              | —             | —                |
| HealthBench Professional（长度校正） | 63.4%       | 60.5%       | 58.1% [11]       | 60.9% [11]     | 56.4% [11]    | 52.1%            |

### Cybersecurity（网络安全）

| Cybersecurity                  | GPT‑6 Astra | GPT‑5.6 Sol | Claude Fable 5.1 | Claude Fable 5 | Claude Opus 5 | Gemini 3.8 Flash |
| ------------------------------ | ----------- | ----------- | ---------------- | -------------- | ------------- | ---------------- |
| ExploitBench                   | 100.0%      | 78.5%       | —                | —              | 70%           | —                |
| ExploitGym                     | 42.4% [13]  | 30.3% [13]  | 30.4% [17]       | 28.4% [17]     | 22.0%         | —                |
| ExploitBench（2026 年 6–8 月） | 39.0%       | 5.5%        | —                | —              | —             | —                |
| SRE-Bench                      | 88.0%       | 55.9%       | —                | —              | 12.5%         | —                |
| SEC-Bench Pro                  | 85.4%       | 79.1%       | —                | —              | —             | —                |

### Alignment（对齐，越低越好）

- Internal computer use safety benchmark（内部电脑操作安全基准）— 2.4% / 22.0% / 9.5% / 18.3% / 11.5% / —
- Internal computer use safety benchmark, w/ AutoReview — 1.8% / 4.3% / — / — / — / —
- Internal circumvention benchmark（内部规避基准）— 0.29% / — / — / — / — / —
- ExploitGym honeypot（蜜罐）— 48.2% / — / — / — / — / —
- Impossible ExploitGym —（Astra 未尝试越界）
- Internal hallucination benchmark（内部幻觉基准）— 4.2% / 12.2% / — / — / — / —

### 长上下文与抽象推理

- OpenAI MRCR v2 8-needle 256K-512K — 91.5%（GPT‑5.6 Sol）
- OpenAI MRCR v2 8-needle 512K-1M — 96.3% / 73.8%（Claude Fable 5.1）

| Abstract reasoning | GPT‑6 Astra | GPT‑5.6 Sol | Claude Fable 5.1 | Claude Fable 5 | Claude Opus 5 | Gemini 3.8 Flash |
| ------------------ | ----------- | ----------- | ---------------- | -------------- | ------------- | ---------------- |
| ARC-AGI-3          | 99.9% [1]   | 7.8%        | —                | —              | 30.2%         | —                |
| ARC-AGI-2          | 95.0%       | 92.5%       | 90.0%            | 89.2%          | 90.4%         | —                |
| ARC-AGI-1          | 98.5%       | 97.5%       | 97.5%            | 98.5%          | 97.5%         | —                |

Evaluation scores are the maximum at any effort. GPT evaluations were run in our research environment or via our API, which may provide slightly different output from production ChatGPT due to differences in the system prompts, tools available, etc.

评测分数为各档投入下的最大值。GPT 系列评测在我们的研究环境或通过 API 运行，由于系统提示词、可用工具等差异，输出可能与生产环境的 ChatGPT 略有不同。

## FOOTNOTES

## 脚注

1. On ARC-AGI-3, GPT-6 Astra was run with our responses API harness, which changes two settings to better match real-world performance. The changes do not specifically target ARC-AGI-3.
   在 ARC-AGI-3 上，GPT-6 Astra 使用我们的 responses API 运行框架执行，该框架调整了两项设置以更贴近真实场景表现。这些调整并非专门针对 ARC-AGI-3。

2. GPT-5.6 Sol refers to the version available in our API, ChatGPT Codex, and ChatGPT Work. The version in ChatGPT Chat is slightly different.
   GPT-5.6 Sol 指在我们 API、ChatGPT Codex 和 ChatGPT Work 中提供的版本；ChatGPT Chat 中的版本略有不同。

3. OSWorld V2-Offline is a subset of the original OSWorld V2 that works without internet access. Claude model performance on OSWorld-V2 Offline was reproduced by the authors on the official leaderboard. On OSWorld 2.0, the scores for Claude use the official settings, and not the modified tasks and modified grading from the Fable 5.1 System Card.
   OSWorld V2-Offline 是原始 OSWorld V2 中可在无网络环境下运行的一个子集。Claude 模型在 OSWorld-V2 Offline 上的表现由作者在官方榜单上复现。在 OSWorld 2.0 上，Claude 的分数采用官方设置，而非 Fable 5.1 系统卡中修改过的任务与评分方式。

4. Model times are the reported elapsed times for the corresponding demonstration runs. The displayed clips are edited excerpts.
   模型耗时为对应演示运行所报告的经过时间。所示片段为剪辑摘录。

5. On BenchCAD, Claude's scores reflect 3 modifications to the eval, detailed in the Fable 5.1 System Card.
   在 BenchCAD 上，Claude 的分数反映了对评测的 3 处修改，详见 Fable 5.1 系统卡。

6. Guang Yang, Victoria Ebert, Nazif Tamer, Brian Siyuan Zheng, Luiza Pozzobon, and Noah A. Smith. "LEGATO: Large-scale End-to-end Generalizable Approach to Typeset OMR." arXiv:2506.19065, 2025.

7. Mark R. H. Gotham, Maureen Redbond, Bruno Bower, and Peter Jonas. "The OpenScore String Quartet Corpus." Proceedings of the 10th International Conference on Digital Libraries for Musicology, pp. 49–57. ACM, 2023.

8. On FrontierCode, GPT-6 Astra was run with a developer message similar to a section of its developer message in Codex: "Avoid creating excessive test files. Create a new test file only when required by repository conventions or when no existing file is a suitable home. Avoid unrelated cleanup and unnecessary complexity. Reuse suitable existing utilities. Read relevant repository instructions and inspect nearby code, tests, documentation, and CI. Follow established conventions. The goal is clean, mergeable code." The prompt was not optimized for the eval.
   在 FrontierCode 上，GPT-6 Astra 运行时使用了一段与其在 Codex 中开发者消息某部分相似的开发者消息：「避免创建过多测试文件。仅在仓库约定要求、或没有现成合适文件时才新建测试文件。避免无关的清理和不必要的复杂度。复用合适的既有工具。阅读相关仓库说明，并查看附近的代码、测试、文档与 CI。遵循既有约定。目标是干净、可合并的代码。」该提示词并未针对该评测做过优化。

9. The first concerns how close together prime numbers can occur, however far along the number line you go. For more than a decade, the best known result established that infinitely many pairs of primes are at most 246 apart. Julia Stadlmann recently improved that bound to 240. Astra helped establish a stronger bound of 186, showing that infinitely many pairs occur within this smaller distance.
   第一项关于素数可以出现得多近——无论你在数轴上走多远。十多年来，已知最好的结果证明存在无限多对素数的间隔不超过 246。Julia Stadlmann 最近把这一界限改进到 240。Astra 帮助确立了一个更强的界限 186，即存在无限多对素数的间隔不超过这个更小的距离。

10. The second concerns unusually large gaps between primes. Astra improved a term in a bound on these gaps that had remained unchanged for more than 80 years. We're sharing the proofs and abridged chain of thought and verification materials for both results.
    第二项关于素数之间的异常大间隔。Astra 改进了此类间隔界限中的一个项，该项已 80 多年未曾变动。我们公开了两项结果的证明，以及节选的思维链与验证材料。

11. We independently evaluated all Claude models following the intended HealthBench Professional procedure, using GPT-5.4 grading and length-adjusted, unclipped scores. For Fable 5.1, we used Opus 5 fallback for provider refusals.
    我们按照 HealthBench Professional 的既定流程独立评测了所有 Claude 模型，使用 GPT-5.4 评分，并采用长度校正、未截断的分数。对于 Fable 5.1，在提供方拒绝回答时我们使用 Opus 5 兜底。

12. Claude Fable 5 and 5.1 are not included in LifeSciBench Gold v1, GeneBench Pro v13, and MedChemBench because they refuse the majority of questions in these evaluations.
    Claude Fable 5 和 5.1 未被纳入 LifeSciBench Gold v1、GeneBench Pro v13 和 MedChemBench，因为它们在这些评测中拒绝回答大部分问题。

13. On ExploitGym, we tested Astra and Sol without the 6-hour time limit, to better assess their full cyber capabilities. They are fast enough that it has little impact.
    在 ExploitGym 上，我们在不带 6 小时时限的条件下测试了 Astra 和 Sol，以更完整地评估其网络能力。它们足够快，因此该限制影响很小。

14. ExploitBench (June–August 2026) contains 20 high-severity V8 vulnerabilities across 13 stable Chrome releases. The benchmark tests whether agents can achieve arbitrary code execution in V8 and official Chrome releases for Linux by exploiting each specified vulnerability. Some included vulnerabilities may not permit arbitrary code execution under the evaluation's constraints, so a 100% success rate may not be achievable. Note: the 5.5% score of GPT-5.6 Sol is an artifact of the 300-turn limit in the benchmark, which is not a limit that real customers using max would have. The model at similar settings achieved an 11.5% score when hitting fewer limits.
    ExploitBench（2026 年 6–8 月）包含 20 个高危 V8 漏洞，跨越 13 个 Chrome 稳定版。该基准考察智能体能否通过利用每个指定漏洞，在 V8 及官方 Linux 版 Chrome 中实现任意代码执行。其中部分漏洞在评测约束下可能无法实现任意代码执行，因此 100% 的成功率未必可达到。注意：GPT-5.6 Sol 的 5.5% 分数是该基准 300 轮上限造成的产物，而真实客户使用 max 档位时并不会受此限制。该模型在类似设置但更少触发上限的情况下取得了 11.5%。

15. Jeremy Spence et al. "The Next Challenge for Agentic Cybersecurity: A Realistic, Contamination-Free Reverse Engineering Benchmark." arXiv:2608.11469v1, 2026.

16. When we test across third-party models, we use a simpler research setup. Codex has a more complex production configuration, which can result in different raw-model error rates. Provider-side safeguards and computer-tool implementations still differ. Users do not experience the no-confirmation scenario in Codex, as it's an internal research configuration.
    在跨第三方模型测试时，我们使用更简化的研究配置。Codex 使用的是更复杂的生产配置，可能导致原始模型错误率不同。各提供方的防护措施与电脑工具实现仍有差异。用户不会在 Codex 中遇到「无确认」场景，因为那属于内部研究配置。

17. For ScreenSpot-Pro and ExploitGym, the Fable scores we report come from Mythos, which is Fable with fewer safeguards.
    在 ScreenSpot-Pro 和 ExploitGym 上，我们报告的 Fable 分数来自 Mythos，即防护措施更少的 Fable。

---

> **译者注**：
>
> 1. 原文为 OpenAI 的产品发布长文，含大量评测数据表。翻译保留全部基准名称（FrontierMath、ARC-AGI、Terminal-Bench、OSWorld、ExploitGym 等）与数值原文，不做换算。
> 2. 原文正文称 FrontierMath Tier 4 为 98%，评测表中为 97.6%（FrontierMath Tier 4 v2），两处均按原文保留。
> 3. 「saturates（饱和）」指模型在该基准上得分已接近上限、基准失去区分度。
> 4. 抓取得到的表格中部分空白单元格在提取过程中可能丢失，附录表格按原文列顺序还原，缺失值以「—」标注；「首列为 GPT‑6 Astra」为原文固定列序，可据此核对。
