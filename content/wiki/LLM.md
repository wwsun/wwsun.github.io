---
title: Large Language Model
date: 2026-02-06 15:53:34
tags:
  - llm
draft: false
description: Large Language Model
source:
---
## 核心架构（Transformer）

LLM 的基石是 Transformer 架构。对于开发者来说，理解其如何实现并行化计算和处理长程依赖是关键。

- **Self-Attention（自注意力机制）**：这是 LLM 的“灵魂”。你需要理解 Query ($Q$)、Key ($K$)、Value ($V$) 的数学本质及其通过点积计算相关性的过程：
    
    $$Attention(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
    
- **Positional Encoding & RoPE**：由于 Transformer 是并行处理的，模型本身没有位置感。你需要了解主流模型（如 Llama）如何使用 **RoPE (Rotary Positional Embedding)** 来处理位置信息。
    
- **Decoder-Only 架构**：现代主流模型（GPT 系列、Llama、Mistral）基本都采用了 Decoder-only 架构。你需要搞清楚它与原始 Transformer (Encoder-Decoder) 的区别，以及为什么它在生成任务中表现更好。
    

---

## 数据处理与表征

在模型“读懂”文字之前，需要将离散的字符转化为高维向量。

- **[[Tokenization]]（分词）**：掌握 **BPE (Byte Pair Encoding)** 算法。理解 Token 并不是单词，而是子词（Subwords）。
    
- **Embeddings**：理解如何将 Token 映射到高维空间中的稠密向量。
    
- **[[Scaling Laws]]**：了解模型参数、训练数据量与性能之间的幂律关系，这决定了为什么 LLM 需要“大”。
    

---

## 全生命周期（从预训练到对齐）

模型是如何从一堆乱码变成可以对话的助手的。

1. **[[Pre-training]]（预训练）**：在数万亿 Token 上进行的无监督预测下一个词（Next Token Prediction）。这是模型获取“常识”和“推理能力”的阶段。
    
2. **SFT (Supervised Fine-Tuning)**：使用高质量的问答对进行指令微调，让模型学会按照指令回答问题。
    
3. **RLHF & DPO（对齐）**：
    - **[[RLHF]] (Reinforcement Learning from Human Feedback)**：通过人类偏好训练奖励模型（Reward Model），并使用 PPO 算法优化。        
    - **[[DPO]] (Direct Preference Optimization)**：目前更主流的简化方案，跳过奖励模型直接在偏好数据上优化。

---

## 现代模型变体与工程挑战

以下概念是现代 LLM 实现的精髓：

- **[[MoE]] (Mixture of Experts, 混合专家模型)**：GPT-4 和 DeepSeek 等模型的核心。模型不再是一个巨大的整体，而是由多个小专家组成，==每次只激活其中一部分（稀疏性），从而在降低推理成本的同时保持高性能。==
    
- **Flash Attention**：通过 IO 感知优化内存读写，显著提升长文本处理速度。
    
- **KV Cache**：推理优化的关键。理解为什么生成每个词都要缓存之前的 Key 和 Value，以及它是如何节省计算量的。
    
- **Quantization（量化）**：如 **GPTQ, AWQ, GGUF**。了解如何将 FP16 的模型压缩到 INT8 或 INT4，以便在消费级显卡上运行。
    

## 学习路径

1. **精读论文**： _《[[Attention is All You Need]]》_ 、 _《Llama 3 Technical Report》_。
    
2. **代码**：参考 Andrej Karpathy 的 **`minGPT`** 或 **`llm.c`** 仓库。