---
title: 控制大语言模型的推理强度
description: Sebastian Raschka 深度解析推理模型的训练流程与推理强度（reasoning effort）控制机制，涵盖 DeepSeek-R1、GPT-5.6、Qwen3、Nemotron 3 Ultra 等旗舰模型的实现细节。
tags:
  - clippings
  - llm
  - reasoning-models
  - rlvr
  - inference-scaling
source: https://magazine.sebastianraschka.com/p/controlling-reasoning-effort-in-llms
created: 2026-07-21
---

## 控制大语言模型的推理强度

> 原文：[Controlling Reasoning Effort in LLMs](https://magazine.sebastianraschka.com/p/controlling-reasoning-effort-in-llms) 作者：Sebastian Raschka 日期：2026-07

距 OpenAI 发布 o1 已经快两年了，这款模型普及了基于 LLM 的推理模型概念。大约四个月后，DeepSeek-R1 紧随其后，同时公开了训练此类推理模型的可验证奖励强化学习（RLVR）配方。

上周，OpenAI 发布了 GPT-5.6 模型家族。它包含三种尺寸，每种大约有五到六个推理强度设置。

![GPT 5.6 Sol 模型的不同推理强度设置](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd495118a-85cb-49e5-b71c-8f7e6e07fa12_1999x1237.png)

图 1：GPT 5.6 Sol 模型的不同推理强度设置。（Ultra 的基准数据目前尚未公布，但应与 Max 相近，因为它使用了相似的推理强度，仅通过四个子智能体加速执行。）

推理模型已经站稳脚跟，它们已成为现代模型发布的标准组成部分。

我之前已经写过推理模型的方法论（[Understanding Reasoning LLMs](https://magazine.sebastianraschka.com/p/understanding-reasoning-llms)）以及相关的论文综述（[The State of Reinforcement Learning for LLM Reasoning](https://magazine.sebastianraschka.com/p/the-state-of-llm-reasoning-model-training) 和 [The State of LLM Reasoning Model Inference](https://magazine.sebastianraschka.com/p/state-of-llm-reasoning-and-inference-scaling)）。我甚至写了一本 440 页的新书，讲如何开发推理模型：[Build A Reasoning Model (From Scratch)](https://sebastianraschka.com/books/#build-a-reasoning-model-from-scratch)。

这些资料都聚焦于如何将传统 LLM 转变为推理模型。而本文，我想重点解释如何开发一个**具有多种推理强度模式**的推理模型，就像本文开头那张图展示的那样。

不用担心，本文可以独立阅读。不过上述资料或许对你有益。

### 1. 什么是"推理模型"？

在机器学习或 AI 领域，我们通常不应该"从字面上"理解技术术语。比如，（人工）神经网络并不像人脑的生物神经网络那样工作。

同样，谈到"推理模型"时，我们不应该期望这些模型真的像人类一样推理。在 AI 和 LLM 研究的语境中，"推理模型"指的是**输出中间推理轨迹的模型**——即产生一个中间响应，逐步解决一个问题或任务。

用一张图来说明可能最简单：

![传统 LLM 回答（左）vs 推理模型回答（右）](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcfe5f6a8-8b9e-422f-a8fb-4c3427129d61_1999x1162.png)

图 3：传统 LLM 回答（左）与推理模型回答（右）的对比。

### 2. 推理模型训练：RLVR 与 DeepSeek-R1

本质上，提升（推理）任务性能有两条路径：训练扩展（training scaling）和推理扩展（inference scaling）。

![训练扩展与推理扩展是提升 LLM 和推理模型解决问题能力的两种方式](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4efb291d-6cd3-4fba-ab3a-bac088cb2601_1999x961.png)

图 4：训练扩展和推理扩展是提升 LLM 与推理模型解题能力的两种方式。图表基于 [Learning to reason with LLMs](https://openai.com/index/learning-to-reason-with-llms/)。

#### 2.1 DeepSeek-R1 与 RLVR

简单来说，[DeepSeek-R1](https://arxiv.org/abs/2501.12948) 提出通过可验证奖励强化学习（RLVR）训练 LLM，将其转变为推理模型。RLVR 是一种为可验证数据域提供奖励信号（`0=错误`，`1=正确`）的技术。这里的可验证数据域包括：

- **数学**：可用符号数学检查器（如 SymPy 或 WolframAlpha）验证结果
- **代码**：可用编译器、单元测试或 LeetCode 等集平台验证正确性

![RLVR 训练中的准确性与格式奖励示意](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F874e07b2-d461-4ae5-bbda-f8204ae16420_1999x945.png)

图 5：RLVR 训练中的准确性和格式奖励。

值得注意的是，**推理轨迹本身并不用于训练或更新模型**。DeepSeek-R1 论文报告称，虽然他们尝试过将中间响应信息用于训练，但对模型训练没有帮助，最终未采用。（是否以及如何通过过程奖励模型将中间推理轨迹纳入训练信号，目前仍是活跃的研究领域。）

![RLVR 中忽略中间推理轨迹，仅最终答案和响应格式决定奖励](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa8ffc0b7-2ba0-462e-98a6-734226250175_1999x925.png)

图 6：RLVR 期间忽略中间推理轨迹；只有最终答案和响应格式决定奖励。

仅靠输出奖励进行训练（如图 7 所示）就足以让模型学会如何逐步推理解决问题——也就是说，模型会学习写出中间解释、回溯并自我纠正。这些模型意识到自己犯错并自我纠正的时刻被称为**"Aha 时刻"**。

![Aha 时刻示例：推理模型在中间推理中发现错误并在生成最终答案前纠正](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe934cf9d-40a0-4907-9505-275bbbbb4864_1999x1413.png)

图 7：Aha 时刻示例——推理模型在中间推理中发现错误，并在生成最终答案前进行纠正。

> **补充背景**：DeepSeek-R1 虽然是最知名的论文，但在同一天（2025 年 1 月 22 日）arXiv 上还有一篇 [Kimi K1.5](https://arxiv.org/abs/2501.12599) 论文。此外，"RLVR"一词早在两个月前的 [Tülu 3](https://arxiv.org/abs/2411.15124) 论文中就已提出。

#### 2.2 DeepSeek-R1-Zero：纯强化学习

DeepSeek-R1 之所以最终成为更知名的论文，一个原因是它证明了推理行为可以通过**纯强化学习（RL）**实现。

![DeepSeek-R1-Zero 直接将 RLVR 应用于预训练基础模型，无需监督微调](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f1de0d2-97b8-4222-9cb6-b33e5bb5ad4e_1999x772.png)

图 8：DeepSeek-R1-Zero 直接将 RLVR 应用于预训练基础模型，无需监督微调。

例如，Tülu 3 和 Kimi K1.5 是在监督微调（SFT）模型之上应用强化学习。DeepSeek-R1 也是从 DeepSeek-V3 基础模型的 SFT 检查点开始训练的，同时包含了一个用纯 RLVR 训练的 DeepSeek-R1-Zero 变体。R1-Zero 比 R1 弱，但它证明了 RLVR 足以教会模型生成并使用推理轨迹。

虽然 R1-Zero 更像是一个概念验证模型，但完整的 DeepSeek-R1 推理模型训练流程通常是多阶段的，也更复杂一些：

![更详细的推理模型训练流水线，描绘了各种 DeepSeek-R1 模型](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F918b28a0-01aa-45b0-91ec-21f2624276d6_1999x1508.png)

图 9：更详细的推理模型训练流水线。更多细节参见[Understanding Reasoning LLMs](https://magazine.sebastianraschka.com/p/understanding-reasoning-llms)。

> 顺便一提，如今大多数 LLM 本质上都是推理模型，这意味着它们以类似 DeepSeek-R1 的方式，使用某种形式的 RLVR 进行了训练。

#### 2.3 推理扩展简述

除了通过训练改善推理行为外，提升模型性能的另一个杠杆是**推理计算扩展**。简而言之，这意味着我们在训练完成后、使用过程中花费更多计算来获得更好的答案。

第一，用 RLVR 训练模型本身就隐式地导致了一种推理扩展——因为推理模型在推理期间通常比传统 LLM 输出更多的 Token，这意味着我们花更多计算。

第二，我们可以通过推理强度级别进一步调整输出长度，后面会详细讨论。

第三，还有许多其他的推理扩展技术。一个流行的是**自一致性（self-consistency）**，通常实现为多数投票形式：多次查询模型，通过多数表决选择最终答案。

![自一致性示意：一种流行的推理扩展技术](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5ce7222d-19fb-4578-a9ec-aa60f21d5587_1999x1185.png)

图 10：自一致性示例，一种流行的推理扩展技术。

这既可用于传统 LLM，也可用于推理模型。DeepSeekMath-V2 就是一个好例子——研究者在一个专精数学的推理模型之上应用了极端推理扩展，在具有挑战性的数学奥赛题上达到了 SOTA 水平。

### 3. `<think>` Token 的作用

你可能在之前的"Aha 时刻"图中见过 `<think></think>` Token。

![推理模型中的常见格式 Token](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fec1eeb79-6e2d-4236-a9e4-fdd6b61517e5_1999x1236.png)

图 12：推理模型中的常见格式 Token。

这些 `<think>` 和 `</think>` 标签**对推理能力而言是装饰性的**。它们不会让模型"推理"，也不是实现良好推理性能的必需条件。不用这些分隔符训练同样的模型，很可能达到相近的基准性能。

`<think>` 标签或 Token 的主要目的是**标记推理轨迹的起止位置**，以便训练流水线或用户界面能将其与最终答案分离，并可选择对用户隐藏（ChatGPT 或 Codex 等 UI 通常这样做）。

核心要点：`<think>` Token 不是在赋予模型"思考"或推理的能力。此外，字面字符串 `<think>` 和 `</think>` 也没有什么特别之处——换一对分隔符也能起到相同作用。

**实现方式**：通常是在 RLVR 阶段加入格式奖励。除了根据答案正确性奖励模型外，还额外为使用 `<think>` Token 提供奖励，从而鼓励模型使用它们。在 DeepSeek-R1 中，总奖励的计算方式为：

```python
R_total = R_accuracy + R_format
```

其中格式奖励是一个基于简单规则的检查，鼓励模型将推理放在 `<think>推理轨迹</think>` 中。

### 4. 推理的开关：第一代推理模型 vs 混合模型

第一代推理模型是**专用推理模型**。这意味着有一个 DeepSeek-V3 基础模型和一个独立的 DeepSeek-R1 推理模型。不管提示是什么，R1 通常输出非常冗长的响应，消耗大量 Token，即使是简单提示也是如此。它也没有内置选项来关闭推理模式。

![推理模型即使对最简单的提示也非常冗长](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2f980538-0730-4518-a685-d1574cd78b7a_1999x1271.png)

图 13：推理模型即使对最简单的提示也非常冗长。

后来的模型，如 Qwen3 等，尝试了**混合方法**——同一个模型可以按需表现为常规指令微调模型或推理模型。

> 注：有些模型开发者称此为"思考模式"（thinking mode），另一些称为"推理模式"（reasoning mode），两个术语指向同一行为。

在 Qwen3 中，通过分词器的 `enable_thinking=True` 或 `enable_thinking=False` 来处理。底层实现：设置 `enable_thinking=False` 本质上是在助手响应的开头添加一个空的 `<think></think>` 部分，以关闭 Qwen3 的推理（"思考"）模式。

![Qwen3 0.6B 推理模型在 thinking=False 和 thinking=True 下的响应](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbbaa28da-a17e-462b-88d3-4c28ac863ef6_1999x1224.png)

图 14：Qwen3 0.6B 推理模型在 `thinking=False` 和 `thinking=True` 下的响应。（左侧界面中空的 `<think></think>` 标签是隐藏的，因为它们是修改后的输入提示的一部分，而非生成的答案。）

#### Qwen3 如何实现这种开关？

根据 [Qwen3 技术报告](https://arxiv.org/abs/2505.09388)，这种开关行为主要通过在长链思维 SFT 和推理 RL 训练完成后，添加一个**"思考模式融合"（Thinking Mode Fusion）**阶段来引入。

在此额外 SFT 阶段中，模型同时看到思考和非思考的样本：

- `/think: <think>{推理}</think>{答案}`
- `/no_think: <think></think>{答案}`

思考是默认行为，所以 `/think` 可以省略。后续的通用 RL 阶段进一步强化这种模式和格式遵循。这些 `/think` 和 `/no_think` 标志是"软开关"。而前面提到的 `enable_thinking=False` 设置在底层强制添加空的 `<think></think>`，作为"硬开关"。

本质上，分词器并不向查询中添加 `/no_think`，而是直接在助手响应的开头填入空的 `<think></think>` 部分。模型只看到生成后的 Token 并直接继续回答。

### 5. 推理强度等级：GPT-5.6 及旗舰模型的实现

本节概述不同推理强度切换是如何实现的，这些设置在 GPT 5 等模型中引入，如今几乎每个旗舰模型都有。

具体来说，文章开头的图展示了 Codex GPT 5.6 界面，用户可以选择多个推理"强度"设置。

![GPT-5.6 暴露六个推理强度设置，从 Light 到 Ultra](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1b0330fd-e315-4207-b0eb-2dc4aa358619_1999x1035.png)

图 16：GPT-5.6 暴露六个推理强度设置，从 Light 到 Ultra。

#### 5.1 OpenAI 的做法

虽然 OpenAI 没有公开推理强度设置的实现细节，但通过其开源的 gpt-oss 模型，我们知道 OpenAI 是通过**系统提示**来控制推理强度设置（`"Reasoning effort: low/medium/high"`），该提示被添加在每个提示前。

![gpt-oss 聊天模板将推理强度插入系统消息中](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe3224bad-f1e2-4707-8839-3076527e594e_1999x690.png)

图 17：gpt-oss 聊天模板将选定的推理强度插入系统消息，然后发送给同一个模型。

推理强度直接影响响应的长度和准确性：

![gpt-oss 模型在不同推理强度下的响应长度和质量](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F955e50d8-530d-46ad-b61a-eee878028992_1999x818.png)

图 18：gpt-oss 模型在不同推理强度下的响应长度和质量（来自模型卡片的注释图）。

强度级别似乎与 Token 使用量直接相关，而 Token 使用量又与准确性相关。可能在"高"之上还能设置更强的强度，但性能到某个点会饱和。GPT 5.6 Sol 模型更清楚地展示了这种饱和现象——增加推理预算到某个点后会变得不经济。

![推理强度同时增加 API 成本和编码智能体性能，在最高 GPT-5.6 设置下收益递减](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcbee0ac2-1321-4d44-bda1-a0b5fc078f19_1999x1223.png)

图 19：推理强度同时增加 API 成本和编码智能体性能，在最高 GPT-5.6 设置下收益递减。图基于 Artificial Analysis Coding Agent Index v1.1。

另一个最新的数据点是本周 Thinking Machine Labs 新发布的[开源 Inkling 模型](https://sebastianraschka.com/blog/2026/inkling-architecture-benchmark-notes.html)：

![增加 Inkling 的推理强度级别通常增加生成 Token 数和基准性能，更高强度下收益递减或不均匀](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3dfb81aa-5ae7-4038-b8e5-f0b7a950f15e_1999x1032.png)

图 20：增加 Inkling 的强度级别通常增加生成 Token 数和基准性能，在更高强度下收益递减或不均匀。图来自 [Inkling 发布博客](https://thinkingmachines.ai/news/introducing-inkling/)。

#### 5.2 训练期间如何实现推理强度控制？

在推理时，推理强度级别可以简单通过系统提示来控制（ChatGPT UI 大概就是将菜单选项映射为系统提示）。然而，这对任意模型不直接有效，需要对训练流水线做特定修改。

有两种典型实现方式：

**方式一：在 RLVR 中使用不同长度惩罚**。当使用不同系统提示时应用不同的长度惩罚。例如，"Reasoning effort: low"时使用高长度惩罚，"Reasoning effort: high"时使用温和或零惩罚。

**方式二：RLVR 之后通过 SFT 微调**。核心 RLVR 阶段后，在 SFT 训练中，提示与展现目标推理量的目标响应配对（目标响应可由人类编写、由另一个模型生成，或生成后筛选）。

![推理强度条件化的 RLVR 和 SFT 示意（这是可能的实现方式，并非 OpenAI 训练流水线的确认描述）](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff059bb1a-d06d-4a8b-81b3-5c78c5fa0551_1999x1169.png)

图 21：推理强度条件化的 RLVR 和 SFT 说明。

在此 SFT 阶段，模型直接从训练样本中学习强度标签与目标推理长度之间的关联。基于 RL 的实现则将强度标签和预算感知的奖励放在 RLVR 阶段内。两种方法也可以结合，我怀疑 gpt-oss 和 GPT 5.6 都采用了这种组合。

#### 5.3 Inkling：连续推理强度值

刚刚发布的 Inkling 技术报告给出了一个虽小但相对具体的强度级别训练示例。

![Inkling 在 0.2 到 0.99 之间扫描连续推理强度值；更高强度通常产生更长响应和更高基准分数](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6a88041-747e-494a-aacd-d4c6f7925b94_1999x987.png)

图 22：Inkling 在 0.2 到 0.99 之间扫描连续推理强度值；更高强度通常产生更长响应和更高基准分数。

在大规模 RL 期间，他们对每个样本做了两件事：

1. 在系统消息中指定所需的推理强度级别
2. 调整每个生成 Token 的成本

概念上，奖励函数大致如下：设 _e_ 为请求的推理强度级别，λ(e) 控制 Token 惩罚。

- 低强度使用较大的每 Token 成本，鼓励更短的推理轨迹
- 高强度使用较小的每 Token 成本，允许模型花费更多 Token

在推理时，Inkling 接收类似 `Thinking effort level: 0.8` 的系统消息，并相应调整其 Token 使用量。Inkling 与 gpt-oss、GPT-5.6 等模型的区别在于：推理强度标签是 0 到 1 之间的**连续值**，而非 low/medium/high 这样的有序标签。

这将 Inkling 的推理强度条件化主要放在推理 RL 阶段，而不仅仅是在后续的 SFT 阶段。

#### 5.4 两种扩展轴：模型选择 vs 推理强度

回到之前"2.3 推理扩展简述"部分——我将扩展分为训练计算扩展和推理时扩展。GPT-5.6 界面漂亮地展示了这种区别：

- **左侧**：选择 Luna、Terra 或 Sol 改变的是模型本身。粗略类比，这对应于训练计算扩展。这些都是独立训练的模型。
- **右侧**：保持模型不变，只改变推理强度。这是推理时扩展。模型权重不变，但模型可以在答案上花费更少或更多的 Token。

![模型选择和推理强度菜单对应两个不同的扩展轴](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffe3daa10-2327-4fa4-a71e-c318298e8b85_1999x1395.png)

图 23：模型选择和推理强度菜单对应两个不同的扩展轴。

Artificial Analysis 的结果显示了这两个轴在实践中如何交互：每条蓝色曲线对应一个模型（Luna、Terra 或 Sol）。沿曲线通过增加推理强度移动是**推理扩展**，在模型曲线之间切换对应**模型扩展**。

![GPT-5.6 模型家族在 Artificial Analysis Coding Agent Index 上的训练扩展和推理扩展](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5556b75b-3029-4134-8fad-3a243d7e36d7_1999x1514.png)

图 24：GPT-5.6 模型家族在 Artificial Analysis Coding Agent Index 上的训练扩展和推理扩展。

两条路径都能提升基准分数，但也都增加成本。更有趣的是，曲线有重叠——较小模型在较高推理强度下有时可以达到较大模型在较低推理强度下的相似分数。

**模型大小和推理强度构成两个独立的旋钮**。我们可以使用更大的模型、增加推理强度，或两者结合。哪种组合最好取决于所需的准确性、成本和延迟。

### 6. 开源旗舰模型的实现方案解析

> **本节可跳过**，除非你对额外的实现细节感兴趣。

我整理了六款开源（开放权重）旗舰模型的推理强度训练方案：DeepSeek V4、Nemotron 3 Ultra、Kimi K2.5 / K3、GLM-5、Qwen3、Inkling。

#### 6.1 DeepSeek V4：三种模式与蒸馏

[DeepSeek V4 技术报告](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/resolve/main/DeepSeek_V4.pdf)描述了三种模式：

- **Non-think**：直接响应，无推理轨迹
- **Think High**：经典方式，推理轨迹放在 `<think>` 和 `</think>` 标签之间
- **Think Max**：同上，但添加特殊系统指令 `"Reasoning Effort: Absolute maximum with no shortcuts permitted."`

这听起来像是一个简单的提示工程技巧，但这个提示实际上是**由不同的训练设置所支撑的**。每种模式使用自己的上下文窗口和长度惩罚（具体长度惩罚实现未在报告中详述）。Think Max 获得更长的上下文窗口和比 Think High 更小的长度惩罚，从而有更多空间持续推理。

最终模型是通过从这些推理专家进行**在线策略蒸馏**创建的：从基础模型出发，应用 SFT 后再进行 GRPO（一种 RLVR 算法）。每个专家的 RL 配置不同，然后与领域专家一起蒸馏到支持所有三种强度模式的单一检查点中。

#### 6.2 Nemotron 3 Ultra：聊天模板控制与 Token 预算

[Nemotron 3 Ultra 技术报告](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf)描述了三种设置：**reasoning-off**、**regular** 和 **medium-effort**。

- `regular`（默认）：`enable_thinking=True`，以开放 `<think>` 标签开始助手响应
- `medium-effort`：`enable_thinking=True` + `medium_effort=True`，后者还将 `{reasoning effort: efficient}` 追加到最新用户消息中
- `reasoning-off`：`enable_thinking=False`，预填空的 `<think></think>` 块

训练方法：

1. 用 GPT-OSS-120B 中等强度模式的输出生成 SFT 数据
2. 随机截断常规推理轨迹，保留最终答案，`</think>` Token 从 SFT 损失中屏蔽
3. 约 2.5% 的 RLVR 提示使用中等强度设置

此外，Nemotron 还支持一个独立的推理时 Token 预算作为外部停止机制——这与习得的推理强度模式是独立的维度。

#### 6.3 Kimi K2.5：Toggle 方法

[Kimi K2.5 技术报告](https://arxiv.org/abs/2602.02276)讨论了**Token 高效 RL** 方法。他们发现固定 Token 预算可能会使推理模型对短解法过拟合——虽然更简洁、更快、更便宜，但可能失去从额外推理时计算中获益的能力。

**Toggle 方法**在每固定训练轮次后在两个 RL 阶段之间交替：

1. **预算阶段**（budgeted phase）：鼓励正确解法的响应长度保持在问题特定的 Token 预算内
2. **无约束阶段**（unconstrained phase）：恢复常规最大生成长度

预算从 RLVR 正确 rollout 响应长度的选定百分位数估计，且仅在问题准确率超过阈值时才激活预算约束——这避免了在模型能可靠解题前就强制缩短推理。

Toggle 在 K2 Thinking 上减少约 25-30% 的生成 Token，基准性能几乎不变。数学和代码 RL 任务中的行为也迁移到了 GPQA 和 MMLU-Pro。

K3 提供了更直接的推理强度接口——`reasoning_effort` 参数支持 low/high/max 三个级别——但 Moonshot 尚未公开具体的训练实现方法。

#### 6.4 GLM-5：多轮和工具使用场景

[GLM-5 技术报告](https://arxiv.org/abs/2602.15763)将 GLM-4.5 引入的二元 Thinking 开关扩展到多轮对话和工具使用场景，描述三种相关行为：

- **交织思考（Interleaved thinking）**：在每个响应和工具调用前插入推理块
- **保留思考（Preserved thinking）**：跨轮保留早期推理块，以便后续复用
- **轮次级思考（Turn-level thinking）**：对对话中每个请求独立启用或禁用推理

推理时，轮次级思考是实际的开关，通过聊天模板中 `think` 标签的预填来控制。这些行为在多任务 SFT 中与更新的聊天模板一起引入。之后模型经历推理 RL、智能体 RL、通用 RL 和最终的在线策略蒸馏。

#### 6.5 Qwen3（回顾）

Qwen3 已在第 4 节介绍。其"思考模式融合"阶段是关键——通过 SFT 在思考和无需思考的样本混合上训练后，通用 RL 进一步强化。Qwen3 还支持硬思考预算——到达请求阈值时停止推理跨度，插入停止思考指令后模型继续生成最终答案。报告称这种部分推理行为未显式训练，而是在思考模式融合后涌现的。

#### 6.6 Inkling（回顾）

Inkling 已在第 5.3 节介绍。它使用**连续强度值**（0.0-1.0）而非固定标签。大部分训练来自异步 RL，超过 3000 万次 rollout。所需强度包含在系统消息中，Token 长度惩罚根据该值调整。

#### 6.7 总结

六款开源模型共享一个框架：

| 模型             | SFT/聊天模板             | RL 阶段条件化             | 预算鲁棒性   |
| ---------------- | ------------------------ | ------------------------- | ------------ |
| DeepSeek V4      | —                        | 差异上下文窗口 + 长度惩罚 | —            |
| Nemotron 3 Ultra | GPT-OSS 教师 + 随机截断  | 中等强度子集 RL           | 外部硬预算   |
| Kimi K2.5        | —                        | Toggle 交替预算/无约束 RL | 预算阶段内化 |
| GLM-5            | 交织/保留/轮次级思考模式 | 多阶段 RL                 | —            |
| Qwen3            | 思考/无思考混合 SFT      | 通用 RL 强化              | 推理时硬停止 |
| Inkling          | 系统消息                 | 连续强度-Lambda 惩罚      | —            |

**关键洞察**：

1. **通过 SFT 和聊天模板引入强度模式控制**——Qwen3 明确混合思考和无需思考样本，GLM-5 添加交织、保留和轮次级思考模式
2. **模式条件化 RL 阶段**——上下文窗口和长度惩罚随请求强度变化，DeepSeek V4、Nemotron 3 Ultra 和 Inkling 采用此方法
3. **预算鲁棒性**——Nemotron 训练时随机截断轨迹，Qwen3 可从强制停止的推理跨度继续，Kimi 交替预算和无约束 RL
4. 相似标签可能由独立专家、混合 SFT 数据、模式条件化奖励、硬 Token 预算或这些方法的组合来支撑

哪种方法最好难以判断——各模型在基础检查点、训练数据、训练计算、基准和服务目标上都不同。可能不存在一劳永逸的解决方案：对交互式助手有效的方案可能不适合长时间运行的编码智能体。

### 7. 未来展望：自动推理强度选择

终极目标是**自动推理强度选择**。我们之前见过 GPT 5 的 Auto 模式——这是一个棘手的问题，最终实现可能弊大于利，所以它从 UI 中被移除了。

**在近期，推理强度仍将是显式的模型输入**，最常通过系统提示传递。然而，LLM 周围的智能体包装/框架或内部路由器可能会越来越多地根据任务状态和可用资源自动推断适当的模式和预算（同时仍允许用户手动覆盖）。

---

> **译者注**：本文对推理模型训练技术的梳理非常系统，从 DeepSeek-R1 的 RLVR 基础到 GPT-5.6 的多级强度控制，再到六款开源旗舰模型的具体实现，涵盖了推理模型领域从诞生到繁荣的完整脉络。核心要点：
>
> 1. **RLVR 是推理模型训练的核心范式**——仅靠输出奖励信号就足以让模型学会推理
> 2. **推理强度控制是 2026 年的标配**——几乎所有旗舰模型都支持，通过 SFT + RL + 聊天模板三层机制实现
> 3. **Token 预算和长度惩罚是关键杠杆**——本质上是精度-效率的 trade-off
> 4. **未来方向是自动化**——从显式设置走向被智能体框架自动推断
>
> 作者 Sebastian Raschka 的 _Build a Reasoning Model (From Scratch)_ 一书的配套代码是实现 RLVR 和推理扩展技术的绝佳学习资源。
