---
title: Chain-of-Thought 思维链
tags:
  - llm
draft: false
description: Chain-of-Thought 思维链
source: https://arxiv.org/abs/2201.11903
---
## 直观理解与定义 (The "What")

==CoT 的核心在于打破“输入  输出”的直接映射，强制模型生成“中间推理步骤”。==

**核心概念**：
* **Standard Prompting（标准提示）**：直接询问模型答案。
* **Chain of Thought Prompting（思维链提示）**：在给出最终答案之前，要求模型先生成一系列中间推理步骤。
* **直观对比**：
* *Standard:* Q: 罗杰有5个网球，他又买了2筒，每筒3个。他现在有多少个？ A: 11个。
* *CoT:* Q: 罗杰有5个网球... A: 罗杰原本有5个。2筒每筒3个意味着买了  个。。所以答案是11个。

![[Pasted image 20260209150337.png]]


https://www.promptingguide.ai/zh/techniques/cot

## 实践与操作 (The "How")

理解概念后，需要通过实际 Prompting（提示工程）来掌握两种主要的 CoT 模式。

### 1. Zero-Shot CoT (零样本思维链)

这是最简单的入门方式，无需提供示例。

* **核心咒语**："Let's think step by step" (让我们一步步思考)。
* **必读论文**：*Large Language Models are Zero-Shot Reasoners* (Kojima et al., 2022)。
* **实践**：找一个复杂的逻辑题，分别尝试不加这句话和加上这句话，观察模型输出的差异。

### 2. Few-Shot CoT (少样本思维链)

这是 CoT 的标准形式，效果通常优于 Zero-Shot。

* **方法**：在 Prompt 中提供 3-5 个 `<Question, Rationale, Answer>` 的示例（Exemplars），引导模型模仿这种推理格式。
* **实践技巧**：
* **Demonstration Selection**：选择与目标问题多样性互补的示例。
* **Formatting**：保持推理步骤清晰，通常使用换行符或序号。



**对比表：不同 Prompting 策略**

| 策略 | 输入内容 | 适用场景 | 计算成本 |
| --- | --- | --- | --- |
| **Standard** | 问题 | 简单知识检索、翻译 | 低 |
| **Zero-Shot CoT** | 问题 + "Let's think step by step" | 突发性复杂任务、无示例库 | 中 |
| **Few-Shot CoT** | 问题 + [问题/推理/答案] x N | 高难度推理、数学、符号操作 | 高 (Prompt 更长) |

### 结构化 CoT

比“请一步步思考”更稳定

```
请按以下格式回答：
1) 关键信息提取（已知/未知/约束）
2) 解决思路（分解为若干步）
3) 推导/计算
4) 自检（边界情况、单位、是否满足约束）
5) 最终答案（简洁）
```


## 进阶变体与优化

当你掌握了基础 CoT 后，需要了解它是如何演变为更复杂的推理架构的。

1. **Self-Consistency (自洽性/自我一致性)**
* **概念**：单一的 CoT 路径可能是错误的。Self-Consistency 通过让模型生成多条不同的推理路径（Sampling multiple reasoning paths），然后对最终答案进行“投票”（Majority Voting）。
* **必读论文**：*Self-Consistency Improves Chain of Thought Reasoning in Language Models* (Wang et al., 2022).
* **理解**：这利用了 LLM 的概率性质，用计算量换取准确率。


2. **Tree of Thoughts (ToT, 思维树)**
* **概念**：将 CoT 的线性推理扩展为树状搜索。模型在每一步生成多个可能的“下一步”，并使用广度优先搜索 (BFS) 或深度优先搜索 (DFS) 来寻找最优解，甚至可以回溯。
* **必读论文**：*Tree of Thoughts: Deliberate Problem Solving with Large Language Models* (Yao et al., 2023).
* **图示理解**：


## 理论深入

如果你想深入理解“为什么 CoT 有效”，建议阅读以下方向的分析材料：

1. **Locality of Computation (计算的局部性)**：
* LLM 是基于 Token 预测的。对于复杂问题（如多位数乘法），模型无法在一个 Token 内完成所有计算。CoT 通过生成中间 Token，实际上是为模型争取了额外的“计算时间”和“暂存空间”（Scratchpad）。


2. **Emergent Abilities (涌现能力)**：
* CoT 能力通常只在模型参数量达到一定规模（如 >10B 或 >100B）后才会显著出现。小模型使用 CoT 甚至可能导致性能下降（产生幻觉推理）。
