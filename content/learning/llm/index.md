---
title: 大语言模型——从预测下一个词到对话助手
tags:
  - learning
  - llm
description: 学习主页：LLM 主线流程的知识库索引与 3D 模拟入口。覆盖从分词、Transformer 推理、预训练到 SFT/RLHF 对齐的完整生命周期，外加现代工程魔法番外。
---

# 大语言模型——从预测下一个词到对话助手

> 学习主页 | 方法论参考：[[我是如何用大语言模型学习复杂主题的]]

ChatGPT 为什么能对话？它和你手机输入法的「猜下一个词」有什么本质联系？几千亿参数的模型里，每一次回答到底发生了什么？

这个学习项目把 LLM 的主线流程拆成五章加一篇番外，每章一篇笔记，最后有一个可以动手玩的 [3D 模拟](/static/learning/llm/simulation.html)，带你跟随「一个 token 的旅程」走完从打字到生成回答的全程，再看模型如何从乱码机器成长为对话助手。

## 知识库章节

- [[what-is-an-llm|第 1 章：LLM 是什么]] — 一台预测下一个 token 的概率机器，历史脉络与「为什么必须大」。
- [[tokenization|第 2 章：分词]] — 文字如何被切成模型能吃的 token，BPE 算法与中文的特殊性。
- [[transformer-inference|第 3 章：Transformer 推理]] — 嵌入、自注意力、多层堆叠与自回归逐词生成的完整旅程。
- [[pre-training|第 4 章：预训练]] — 在万亿 token 上自学预测下一个词，知识如何被编码进参数。
- [[alignment|第 5 章：对齐]] — SFT、RLHF、DPO 三道工序，把补全机器训练成助手。
- [[beyond|番外：工程魔法]] — KV Cache、量化、MoE、推理模型四个现代工程主题。

## 怎么玩模拟

打开 [3D 模拟](/static/learning/llm/simulation.html)，跟随一个 token 走完五个阶段：分词切割 → Transformer 注意力 → 自回归生成 → 预训练成长 → 对齐调教。每个阶段都有暂停/继续控件、阶段跳转和文字解说，对应上方各篇笔记。

## 已核实来源

知识库撰写后经过网络交叉验证，关键事实与出处如下（每章文末另有「来源」小节）：

- Transformer 由 Google 团队 Vaswani 等 2017 年提出；GPT-1（2018，117M 参数）、GPT-2（2019，1.5B 参数）、GPT-3（2020，175B 参数）—— 维基百科 GPT-1 / GPT-3 条目
- BPE 起源于 1994 年压缩算法、2016 年引入机器翻译；byte-level BPE 自 GPT-2 起使用 —— 维基百科 Byte pair encoding 条目
- GPT-3 架构：96 层、12288 维嵌入、96 个注意力头 —— GPT-3 论文 Table 2.1
- Chinchilla 缩放定律：参数量与数据量应同步放大（约 20 token/参数）—— 维基百科 Chinchilla (language model) 条目
- RLHF 三步（SFT → 奖励模型 → PPO）出自 InstructGPT（2022）；DPO 出自 Rafailov 等（2023）—— 两篇原始论文
- DeepSeek-V3：671B 总参数、每 token 激活 37B —— 维基百科 DeepSeek 条目

**置信边界**：英文「1000 token ≈ 750 词」为 OpenAI 官方文档的粗略口径，原页面已迁移无法直接复核；「GPT-4 为 8 专家 MoE」系行业推断，正文已用「据信」标注；训练成本量级为行业估算而非官方数字。

## 相关剪报与笔记

- [[我是如何用大语言模型学习复杂主题的]] — 本学习项目的方法论源头
- [[LLM]] — wiki 总览：架构与生命周期全图
- [[llm-vs-nlp|LLM 与 NLP 的区别]] — LLM 在新范式中的位置
- [[Attention Is All You Need]] — Transformer 原始论文精读
- [[State of LLMs 2026 RLVR, GRPO, Inference Scaling]] — 2026 年 LLM 前沿动态
