---
title: Tokenization 分词/标记化
tags:
  - llm
draft: false
description: Tokenization
url:
---
可以将 **Tokenization（分词/标记化）** 理解为自然语言处理（NLP）流水线中的**数据预处理逻辑（Preprocessing Layer）**。

它的核心任务是：**将连续的字符串（非结构化数据）映射为离散的整数序列（结构化数据）**，从而作为神经网络的输入。

---

## 1. 为什么不直接使用字符或单词？

在设计分词器时，工程师需要在**词表大小（Vocabulary Size）**和**序列长度（Sequence Length）**之间寻找平衡：

- **按字符分词 (Character-level)**：
    
    - _优点_：词表极小（如 256 个 ASCII 字符），不存在 OOV（Out-of-Vocabulary，词汇溢出）问题。
        
    - _缺点_：序列过长，模型难以学习长距离依赖（Transformer 的复杂度是 $O(n^2)$）。
        
- **按词分词 (Word-level)**：
    
    - _优点_：序列短，每个单元包含明确的语义。
        
    - _缺点_：词表爆炸（动辄数百万词），无法处理派生词（如 `unhappy` 和 `happy`），且对拼写错误非常敏感。
        

**现代主流方案：子词分词 (Subword Tokenization)**

它通过将高频词完整保留，将低频词拆分为更小的单元（如 `refactoring` -> `refactor` + `ing`），完美解决了上述矛盾。

---

## 2. 三大核心算法

现代大模型（LLM）主要采用以下三种子词算法：

### A. BPE (Byte Pair Encoding) —— GPT 系列采用

这是一种基于**压缩**思想的算法：

1. 从字符开始，统计语料库中相邻单位出现的频率。
    
2. 反复将最高频的组合合并为一个新的 Token。
    
3. **Byte-level BPE**：为了处理全球语言，像 GPT-3 这样的模型直接作用于 **UTF-8 字节**而非 Unicode 字符，确保任何字符串都能被分解。
    

### B. WordPiece —— BERT 采用

与 BPE 类似，但合并逻辑不同。它不只是看频率，而是看合并后是否能最大化**语言模型的似然概率（Likelihood）**。即：合并这两个单元，是否让模型对训练数据的解释力更强？

### C. Unigram —— T5/SentencePiece 采用

它从一个巨大的初始词表开始，不断**剔除**对整体似然度贡献最小的 Token，直到达到预设的词表大小。

---

## 3. Tokenization 的全流程

当你输入一句 "Hello World" 时，底层发生了以下过程：

1. **标准化 (Normalization)**：去除多余空格、转小写、处理 Unicode 规范化（如 `é` 的不同编码方式）。
    
2. **预分词 (Pre-tokenization)**：通常按空格和标点将句子切成初步的块。
    
3. **模型转换 (Model Application)**：应用上述算法（如 BPE）将块进一步拆分为子词。
    
4. **映射 (Post-processing)**：
    
    - 将子词转换为 **Token ID**（索引）。
        
    - 添加特殊标记，如 `[CLS]` (起始), `[SEP]` (分隔), `[PAD]` (填充)。
        

---

## 4. 开发者需要关注的“工程陷阱”

你在开发或调用 API 时会遇到以下与 Token 相关的实际问题：

- **Token 不等于单词**：==对于英文，1000 个 Token 约等于 750 个单词；对于中文，1 个汉字通常占用 1 到 2 个 Token（取决于词表实现）。==
    
- **上下文窗口限制**：LLM 的计算资源（如 $8192$ 或 $128k$）是以 Token 数量计算的。Tokenization 效率直接影响了你能塞进多少信息。
    
- **空格敏感性**：不同的分词器对空格的处理不同。例如，GPT 的分词器会将 `" Hello"`（带前导空格）和 `"Hello"` 处理为不同的 ID，这在 Prompt Engineering 中非常关键。
    
- **多语言偏差**：如果词表在训练时中文数据较少，分词器可能会将一个汉字拆成多个字节 Token，导致中文推理速度更慢、成本更高。
    

---


## tiktoken

https://github.com/openai/tiktoken

## tokenization vs embedding

在 LLM 的流水线中，**Tokenization** 和 **Embedding** 是紧密衔接的两个步骤。如果用计算机编译器的流程来类比，Tokenization 相当于“词法分析”，而 Embedding 则相当于将符号映射到“语义地址空间”。

简单来说：**Tokenization 解决了“如何对文字进行编号”的问题，而 Embedding 解决了“如何表达这些编号之间的语义关系”的问题。**


数据在输入模型前，必须经过这两个连续的阶段：

1. **Raw Text (字符串)**：`"I love coding"`
    
2. **Tokenization (离散化)**：
    
    - 将文本切分为 Token：`["I", "love", "coding"]`
        
    - 根据词表（Vocabulary）映射为整数索引（Token IDs）：`[42, 1205, 8392]`
        
3. **Embedding (连续化)**：
    
    - 将每个 ID 查找其对应的稠密向量（Dense Vector）：`[42] -> [0.12, -0.5, 0.8, ...]`

![[llm-tokenization-and-embedding.png]]