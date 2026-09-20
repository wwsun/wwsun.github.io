---
title: State of LLMs 2026 RLVR, GRPO, Inference Scaling
tags:
  - llm
draft: false
description: State of LLMs 2026 RLVR, GRPO, Inference Scaling
source: https://www.youtube.com/watch?v=K5WPr5dtne0
---

核心观点总结为：**LLM 正在从“暴力预训练”时代转向“精细化推理”时代。**

---

## 1. 范式转移：从预训练 Scaling 到推理侧 Scaling

视频中最重要的观点是：**预训练带来的边际收益正在显著降低（Data Wall），而推理侧（Inference-time）正成为新的增长曲线。**

- **System 2 Thinking（系统 2 思维）**：借鉴认知科学，模型不再仅仅根据概率输出下一个 Token（System 1），而是通过“思维链（CoT）”进行自我纠正和路径搜索。
- **Compute-Optimal Inference**：性能提升不再仅取决于模型有多少亿参数，而取决于你在推理时给模型分配了多少计算量（比如让模型尝试不同的解题路径并自我验证）。

## 2. 后训练（Post-training）的核心技术：RLVR 与 GRPO

Raschka 详细拆解了为什么 DeepSeek R1 这样的模型能以极低成本对标 OpenAI 的 o1。核心在于**强化学习（RL）**的改进：

- **RLVR (Reinforcement Learning with Verifiable Rewards)**：
  - **核心逻辑**：针对数学和代码等具有“确定性答案”的任务，直接通过代码编译器或数学判题机给出**可验证的硬奖励**，而不是依赖昂贵且有主观偏差的人类反馈（RLHF）。
- **GRPO (Group Relative Policy Optimization)**：
  - **工程优势**：这是 DeepSeek 提出的一种新型算法。它通过计算一组（Group）输出的相对得分来更新策略，**彻底去掉了传统 PPO 中的 Value Network (Critic)**，大幅节省了显存占用，使得在有限算力下进行大规模 RL 训练成为可能。

## 3. 架构演进与“DeepSeek 瞬间”

视频探讨了 2025-2026 年架构上的微调：

- **Transformer 依然是王者**：虽然有 Mamba 或线性 Attention 等尝试，但 Transformer 在大规模并行化上的优势依然不可撼动。
- **MLA (Multi-head Latent Attention)**：Raschka 强调了这种新型注意力机制。它通过低秩压缩技术显著减少了推理时的 **KV Cache** 占用，这在长上下文推理（Long Context）中是极大的工程突破。
- **MoE 的常态化**：稀疏专家模型已成为工业界标准，不再是“黑科技”，现在的难点转向了如何进行高效的负载均衡和多节点通信。

## 4. 数据的瓶颈与私有化趋势

- **高质量语料枯竭**：互联网公开数据基本被挖掘殆尽。未来的壁垒在于**私有数据（Private Data）**。
- **合成数据 (Synthetic Data)**：Raschka 认为合成数据并非简单的“自说自话”，而是通过 RLVR 这种带有强验证能力的机制，让模型生成可证明正确的数据，从而实现自博弈进化。

## 5. 对软件工程的影响

作为高级开发者，视频末尾给出的建议值得深思：

- ==**从 Coder 转向 Architect**：随着 Cursor 和 Claude Code 等工具的 Agent 化，开发者的工作正从“写实现”转向“写约束（Constraints）”和“验证逻辑”。==
- **模型拥有权**：由于开源/开放权重模型的效率提升（如 DeepSeek-V3/R1），大公司会越来越倾向于在私有云中通过微调（Fine-tuning）和推理侧优化来构建自己的专属模型，而不是简单调用闭源 API。
