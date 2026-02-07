---
description: Attention Is All You Need
source: https://arxiv.org/html/1706.03762?_immersive_translate_auto_translate=1
author:
  - google brain
created: 2026-02-06
tags:
  - clippings
  - llm
  - paper
---

## 摘要

主流的序列转换模型基于包含编码器和解码器的**复杂循环或卷积神经网络**。性能最优的模型还通过注意力机制连接编码器和解码器。我们提出了一种新的简单网络架构——==Transformer，它完全基于注意力机制，彻底摒弃了循环和卷积==。在两个机器翻译任务上的实验表明，这些模型在质量上更胜一筹，同时具有更好的可并行性，且训练所需时间显著减少。我们的模型在 WMT 2014 英德翻译任务中达到了 28.4 BLEU，比包括集成模型在内的现有最佳结果提高了 2 个 BLEU 以上。在 WMT 2014 英法翻译任务中，我们的模型在 8 个 GPU 上训练 3.5 天后，创下了 41.8 的单模型最先进（state-of-the-art）BLEU 分数，而这仅是文献中最佳模型训练成本的一小部分。**我们通过将 Transformer 成功应用于具有大规模和有限训练数据的英语成分句法分析，证明了该模型能够很好地泛化到其他任务。**

## 1 引言

循环神经网络，特别是长短期记忆网络 [^13] 和门控循环 [^7] 神经网络，已在序列建模和转换问题（如语言建模和机器翻译 [^35]）中被确立为最先进的方法。此后，许多研究继续致力于拓展循环语言模型和编码器-解码器架构 [^38] 的边界。

循环模型通常沿输入和输出序列的符号位置进行计算分解。通过将位置与计算时间步对齐，它们生成一系列隐藏状态 $h_{t}$ ，该状态是前一隐藏状态 $h_{t-1}$ 和位置 $t$ 处输入的函数。这种固有的顺序特性阻碍了训练样本内部的并行化，这在序列长度较长时变得至关重要，因为内存限制了跨样本的批处理。最近的研究通过分解技巧 [^21] 和条件计算 [^32] 在计算效率方面取得了显著提升，同时后者也提高了模型性能。然而，顺序计算的根本限制依然存在。

注意力机制已成为各种任务中极具吸引力的序列建模和转换模型中不可或缺的一部分，它允许对依赖关系进行建模，而无需考虑它们在输入或输出序列中的距离 [^2]。然而，除了极少数情况 [^27] 之外，此类注意力机制通常与循环网络结合使用。

在这项工作中，我们提出了 Transformer，这是一种摒弃了循环结构，转而完全依赖注意力机制来建立输入和输出之间全局依赖关系的模型架构。==Transformer 允许显著更高程度的并行化，在八块 P100 GPU 上仅需训练 12 小时，即可在翻译质量上达到新的最先进水平。==

## 2 背景

减少序贯计算的目标也是 Extended Neural GPU [^16]、ByteNet [^18] 和 ConvS2S [^9] 的基础，这些模型都使用卷积神经网络作为基本构建模块，为所有输入和输出位置并行计算隐藏表示。在这些模型中，关联两个任意输入或输出位置信号所需的操作次数随位置间距离的增加而增长，ConvS2S 呈线性增长，而 ByteNet 呈对数增长。这使得学习远距离位置之间的依赖关系变得更加困难 [^12]。在 Transformer 中，这一次数被减少到了常数次操作，尽管其代价是由于对注意力权重位置取平均而导致有效分辨率降低，我们通过 3.2 节中描述的多头注意力机制来抵消这一影响。

自注意力（有时称为内部注意力）是一种将单个序列的不同位置联系起来以计算该序列表示的注意力机制。自注意力已成功应用于各种任务，包括阅读理解、生成式摘要、文本蕴含以及学习任务无关的句子表示 [^4]。

端到端记忆网络基于循环注意力机制，而非序列对齐的循环，并已被证明在简单语言问答和语言建模任务中表现良好 [^34]。

然而，据我们所知，Transformer 是第一个完全依赖自注意力来计算其输入和输出表示的转换模型，而没有使用序列对齐的 RNN 或卷积。在接下来的章节中，我们将描述 Transformer，阐述自注意力的动机，并讨论其相对于 [^17] 和 [^9] 等模型的优势。

## 3 模型架构

![[transformer-model-architecture.png]]

图 1：Transformer - 模型架构。

大多数极具竞争力的神经序列转导模型都采用编码器-解码器结构 [^5]。在这里，编码器将符号表示的输入序列 $(x_{1},...,x_{n})$ 映射为一个连续表示序列 $\mathbf{z}=(z_{1},...,z_{n})$ 。在给定 $\mathbf{z}$ 的情况下，解码器随后逐个元素地生成符号输出序列 $(y_{1},...,y_{m})$ 。在每一步中，该模型都是自回归的 [^10]，即在生成下一个符号时，将先前生成的符号作为额外的输入。

Transformer 遵循这一整体架构，在编码器和解码器中均采用了堆叠的自注意力机制和逐点全连接层，分别如图 1 的左半部分和右半部分所示。

>[!tip] Transformer——一种利用注意力机制来提高模型训练速度的模型。最大的益处在于 Transformer 易于并行化。

### 3.1 编码器和解码器栈

##### Encoder: 编码器：

编码器由 $N=6$ 个相同的层堆叠而成。每层包含两个子层。第一层是多头自注意力机制，第二层是一个简单的逐位置全连接前馈网络。我们在每个子层周围采用残差连接 [^11]，随后进行层归一化 [^1]。也就是说，每个子层的输出为 $\mathrm{LayerNorm}(x+\mathrm{Sublayer}(x))$ ，其中 $\mathrm{Sublayer}(x)$ 是子层本身实现的函数。为了便于这些残差连接，模型中的所有子层以及嵌入层产生的输出维度均为 $d_{\text{model}}=512$ 。

##### Decoder: 解码器：

解码器也由 $N=6$ 个相同的层堆叠而成。除了每个编码器层中的两个子层之外，解码器还插入了第三个子层，该子层对编码器堆栈的输出执行多头注意力机制。与编码器类似，我们在每个子层周围采用残差连接，随后进行层归一化。我们还修改了解码器堆栈中的自注意力子层，以防止当前位置关注到后续位置。这种掩码处理，结合输出嵌入偏移一个位置的事实，确保了对位置 $i$ 的预测只能依赖于小于 $i$ 位置的已知输出。

### 3.2 注意力机制

注意力函数可以描述为将查询和一组键值对映射到输出的过程，其中查询、键、值和输出均为向量。输出是这些值的加权和，其中分配给每个值的权重是通过查询与相应键的兼容性函数计算得出的。

> [!tip] 解读：让序列中的每一个词都能“注意到”其他所有词，从而捕捉上下文信息。
> 在传统的 RNN 中，信息是按顺序“挤”进一个固定长度的隐向量（Hidden State）里的；而 Attention 允许模型在处理当前任务时，直接在输入序列中“查表”，根据相关性权重提取信息。

#### 3.2.1 缩放点积注意力

我们将这种特定的注意力机制称为“缩放点积注意力”（Scaled Dot-Product Attention）（图 2）。输入由维度为 $d_{k}$ 的查询和键以及维度为 $d_{v}$ 的值组成。我们计算查询与所有键的点积，将每个点积除以 $\sqrt{d_{k}}$ ，并应用 softmax 函数以获得值的权重。

在实践中，我们同时对一组查询进行注意力函数计算，并将它们打包成一个矩阵 $Q$ 。键和值也被分别打包成矩阵 $K$ 和 $V$ 。我们计算输出矩阵如下：

<table><tbody><tr><td></td><td><math><semantics><mrow><mrow><mi>Attention</mi> <mo></mo><mrow><mo>(</mo><mi>Q</mi><mo>,</mo><mi>K</mi><mo>,</mo><mi>V</mi><mo>)</mo></mrow></mrow> <mo>=</mo> <mrow><mi>softmax</mi> <mo></mo><mrow><mo>(</mo><mfrac><mrow><mi>Q</mi> <mo></mo><msup><mi>K</mi> <mi>T</mi></msup></mrow> <msqrt><msub><mi>d</mi> <mi>k</mi></msub></msqrt></mfrac><mo>)</mo></mrow> <mo></mo><mi>V</mi></mrow></mrow> <annotation>\mathrm{Attention}(Q,K,V)=\mathrm{softmax}(\frac{QK^{T}}{\sqrt{d_{k}}})V</annotation></semantics></math></td><td></td><td rowspan="1"><span>(1)</span></td></tr></tbody></table>

两种最常用的注意力函数是加法注意力 [^2] 和点积（乘法）注意力。除了缩放因子 $\frac{1}{\sqrt{d_{k}}}$ 之外，点积注意力与我们的算法完全相同。加法注意力使用具有单个隐藏层的前馈网络来计算兼容性函数。虽然两者在理论复杂度上相似，但在实践中，点积注意力速度更快且更节省空间，因为它可以使用高度优化的矩阵乘法代码来实现。

为了说明点积为何会变大，假设 $q$ 和 $k$ 的分量是均值为 $0$ 、方差为 $1$ 的独立随机变量。那么它们的点积 $q\cdot k=\sum_{i=1}^{d_{k}}q_{i}k_{i}$ 的均值为 $0$ ，方差为 $d_{k}$ 。  
虽然对于较小的 $d_{k}$ 值，这两种机制的表现相似，但对于较大的 $d_{k}$ 值，加法注意力优于不带缩放的点积注意力 [^3]。我们推测，对于较大的 $d_{k}$ 值，点积在量级上变得很大，从而将 softmax 函数推向梯度极小的区域 <sup>1</sup>. To counteract this effect, we scale the dot products by $\frac{1}{\sqrt{d_{k}}}$ .  
。为了抵消这种影响，我们将点积缩放 $\frac{1}{\sqrt{d_{k}}}$ 。

#### 3.2.2 多头注意力

![[Pasted image 20260207102934.png]]

图 2：（左）缩放点积注意力。（右）多头注意力由多个并行运行的注意力层组成。

与其执行具有 $d_{\text{model}}$ 维键、值和查询的单个注意力函数，我们发现将查询、键和值分别通过不同的、学习到的线性投影进行 $h$ 次线性投影，分别投影到 $d_{k}$ 、 $d_{k}$ 和 $d_{v}$ 维度，会更有益处。在这些投影后的查询、键和值版本上，我们并行执行注意力函数，产生 $d_{v}$ 维的输出值。这些值被拼接并再次投影，得到最终值，如图 2 所示。

==多头注意力允许模型共同关注来自不同位置、不同表示子空间的信息。==在单个注意力头的情况下，平均化操作会抑制这一点。

>[!tip] 如果说 Self-Attention 是模型在看一张图，那么 **Multi-Head Attention** 就是让模型**同时从多个不同的角度（特征子空间）**去看这张图。

|     | $\displaystyle\mathrm{MultiHead}(Q,K,V)$      | $\displaystyle=\mathrm{Concat}(\mathrm{head_{1}},...,\mathrm{head_{h}})W^{O}$ |     |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------- | --- |
|     | $\displaystyle\text{where}~\mathrm{head_{i}}$ | $\displaystyle=\mathrm{Attention}(QW^{Q}_{i},KW^{K}_{i},VW^{V}_{i})$          |     |

其中投影是参数矩阵 $W^{Q}_{i}\in\mathbb{R}^{d_{\text{model}}\times d_{k}}$ 、 $W^{K}_{i}\in\mathbb{R}^{d_{\text{model}}\times d_{k}}$ 、 $W^{V}_{i}\in\mathbb{R}^{d_{\text{model}}\times d_{v}}$ 和 $W^{O}\in\mathbb{R}^{hd_{v}\times d_{\text{model}}}$ 。

在这项工作中，我们采用了 $h=8$ 个并行注意力层，或称为“头”。对于每一个头，我们使用 $d_{k}=d_{v}=d_{\text{model}}/h=64$ 。由于每个头的维度降低了，总计算成本与全维度的单头注意力相似。

#### 3.2.3 注意力机制在模型中的应用

Transformer 以三种不同的方式使用多头注意力：

- 在“编码器-解码器注意力”层中，查询（queries）来自前一个解码器层，而记忆键（memory keys）和值（values）来自编码器的输出。这使得解码器中的每个位置都能关注输入序列中的所有位置。这模仿了序列到序列模型（如 [^38]）中典型的编码器-解码器注意力机制。
- 编码器包含自注意力层。在自注意力层中，所有的键、值和查询都来自同一个地方，即编码器中前一层的输出。编码器中的每个位置都可以关注编码器前一层中的所有位置。
- 同样地，解码器中的自注意力层允许解码器中的每个位置关注解码器中直到并包括该位置在内的所有位置。我们需要防止解码器中的信息向左流动，以保持自回归属性。我们在缩放点积注意力内部通过屏蔽（设置为 $-\infty$ ）softmax 输入中所有对应于非法连接的数值来实现这一点。参见图 2。

### 3.3 逐位置前馈网络

除了注意力子层外，编码器和解码器中的每一层都包含一个全连接的前馈网络，该网络分别且相同地应用于每个位置。它由两个线性变换组成，中间夹有一个 ReLU 激活。

<table><tbody><tr><td></td><td><math><semantics><mrow><mrow><mi>FFN</mi> <mo></mo><mrow><mo>(</mo><mi>x</mi><mo>)</mo></mrow></mrow> <mo>=</mo> <mrow><mrow><mrow><mi>max</mi> <mo>⁡</mo> <mrow><mo>(</mo><mn>0</mn><mo>,</mo><mrow><mrow><mi>x</mi> <mo></mo><msub><mi>W</mi> <mn>1</mn></msub></mrow> <mo>+</mo> <msub><mi>b</mi> <mn>1</mn></msub></mrow><mo>)</mo></mrow></mrow> <mo></mo><msub><mi>W</mi> <mn>2</mn></msub></mrow> <mo>+</mo> <msub><mi>b</mi> <mn>2</mn></msub></mrow></mrow> <annotation>\mathrm{FFN}(x)=\max(0,xW_{1}+b_{1})W_{2}+b_{2}</annotation></semantics></math></td><td></td><td rowspan="1"><span>(2)</span></td></tr></tbody></table>

虽然不同位置的线性变换是相同的，但它们在层与层之间使用不同的参数。另一种描述方式是将其视为两个卷积核大小为 1 的卷积。输入和输出的维度为 $d_{\text{model}}=512$ ，内层的维度为 $d_{ff}=2048$ 。

### 3.4 嵌入和 Softmax

与其他序列转换模型类似，我们使用学习到的嵌入将输入标记和输出标记转换为维度为 $d_{\text{model}}$ 的向量。我们还使用通常的学习线性变换和 softmax 函数，将解码器输出转换为预测的下一个标记的概率。在我们的模型中，我们在两个嵌入层和 softmax 前的线性变换之间共享相同的权重矩阵，类似于 [^30]。在嵌入层中，我们将这些权重乘以 $\sqrt{d_{\text{model}}}$ 。

### 3.5 位置编码

由于我们的模型不包含循环和卷积，为了使模型能够利用序列的顺序，我们必须注入一些关于序列中标记相对或绝对位置的信息。为此，我们在编码器和解码器堆栈底部的输入嵌入中添加了“位置编码”。位置编码与嵌入具有相同的维度 $d_{\text{model}}$ ，因此两者可以相加。位置编码有许多选择，包括学习到的和固定的 [^9]。

在这项工作中，我们使用了不同频率的正弦和余弦函数：

|     | $\displaystyle PE_{(pos,2i)}=sin(pos/10000^{2i/d_{\text{model}}})$   |     |
| --- | -------------------------------------------------------------------- | --- |
|     | $\displaystyle PE_{(pos,2i+1)}=cos(pos/10000^{2i/d_{\text{model}}})$ |     |

其中 $pos$ 是位置， $i$ 是维度。也就是说，位置编码的每个维度都对应于一个正弦曲线。波长形成从 $2\pi$ 到 $10000\cdot 2\pi$ 的等比数列。我们选择这个函数是因为我们假设它能让模型很容易地学习根据相对位置进行注意力计算，因为对于任何固定的偏移量 $k$ ， $PE_{pos+k}$ 都可以表示为 $PE_{pos}$ 的线性函数。

我们还尝试了使用学习到的位置嵌入 [^9] 来代替，并发现这两个版本产生的结果几乎完全相同（见表 3 第 (E) 行）。我们选择正弦版本是因为它可能允许模型外推到比训练期间遇到的序列长度更长的序列。

## 4 为什么选择自注意力

在本节中，我们将自注意力层的各个方面与常用于将一个符号表示的可变长度序列 $(x_{1},...,x_{n})$ 映射到另一个等长序列 $(z_{1},...,z_{n})$ （其中 $x_{i},z_{i}\in\mathbb{R}^{d}$ ）的循环层和卷积层进行比较，例如典型的序列转换编码器或解码器中的隐藏层。为了说明采用自注意力的动机，我们考虑了三个准则。

其一是每层的总计算复杂度。其二是可并行化的计算量，以所需的最小顺序操作次数来衡量。

第三是网络中长程依赖之间的路径长度。学习长程依赖是许多序列转换任务中的一个关键挑战。影响学习此类依赖能力的一个关键因素是前向和后向信号在网络中必须遍历的路径长度。输入和输出序列中任何位置组合之间的这些路径越短，学习长程依赖就越容易 [^12]。因此，我们还比较了由不同层类型组成的网络中，任意两个输入和输出位置之间的最大路径长度。

表 1：不同层类型的最大路径长度、每层复杂度和最小顺序操作数。 $n$ 是序列长度， $d$ 是表示维度， $k$ 是卷积核大小， $r$ 是受限自注意力中的邻域大小。

| Layer Type 层类型                            | Complexity per Layer 每层复杂度 | Sequential 序列化 | Maximum Path Length 最大路径长度 |
| -------------------------------------------- | ------------------------------- | ----------------- | -------------------------------- |
|                                              |                                 | Operations 操作   |                                  |
| Self-Attention 自注意力                      | $O(n^{2}\cdot d)$               | $O(1)$            | $O(1)$                           |
| Recurrent 循环                               | $O(n\cdot d^{2})$               | $O(n)$            | $O(n)$                           |
| Convolutional 卷积                           | $O(k\cdot n\cdot d^{2})$        | $O(1)$            | $O(log_{k}(n))$                  |
| Self-Attention (restricted) 自注意力（受限） | $O(r\cdot n\cdot d)$            | $O(1)$            | $O(n/r)$                         |

如表 1 所示，自注意力层以常数个顺序执行的操作连接所有位置，而循环层则需要 $O(n)$ 个顺序操作。在计算复杂度方面，当序列长度 $n$ 小于表示维度 $d$ 时，自注意力层比循环层更快，这在机器翻译中最先进模型所使用的句子表示中最为常见，例如 word-piece [^38] 和字节对 [^31] 表示。为了提高涉及极长序列任务的计算性能，可以将自注意力限制为仅考虑输入序列中以相应输出位置为中心、大小为 $r$ 的邻域。这会将最大路径长度增加到 $O(n/r)$ 。我们计划在未来的工作中进一步研究这种方法。

卷积核宽度为 $k<n$ 的单个卷积层无法连接所有输入和输出位置对。在连续卷积核的情况下，这样做需要堆叠 $O(n/k)$ 个卷积层，而在空洞卷积 [^18] 的情况下则需要 $O(log_{k}(n))$ 个，这增加了网络中任意两个位置之间最长路径的长度。卷积层通常比循环层更昂贵，其倍数为 $k$ 。然而，可分离卷积 [^6] 显著降低了复杂度，降至 $O(k\cdot n\cdot d+n\cdot d^{2})$ 。然而，即使在 $k=n$ 的情况下，可分离卷积的复杂度也等同于自注意力层与逐点前馈层的组合，而这正是我们在模型中采用的方法。

作为一个额外收益，自注意力可以产生更具可解释性的模型。我们检查了模型的注意力分布，并在附录中展示并讨论了示例。不仅单个注意力头明显学会了执行不同的任务，而且许多注意力头似乎还表现出与句子的句法和语义结构相关的行为。

## 5 训练

本节描述了我们模型的训练方案。

### 5.1 Training Data and Batching

We trained on the standard WMT 2014 English-German dataset consisting of about 4.5 million sentence pairs. Sentences were encoded using byte-pair encoding [^3], which has a shared source-target vocabulary of about 37000 tokens. For English-French, we used the significantly larger WMT 2014 English-French dataset consisting of 36M sentences and split tokens into a 32000 word-piece vocabulary [^38]. Sentence pairs were batched together by approximate sequence length. Each training batch contained a set of sentence pairs containing approximately 25000 source tokens and 25000 target tokens.

### 5.2 Hardware and Schedule

We trained our models on one machine with 8 NVIDIA P100 GPUs. For our base models using the hyperparameters described throughout the paper, each training step took about 0.4 seconds. We trained the base models for a total of 100,000 steps or 12 hours. For our big models,(described on the bottom line of table [3](https://arxiv.org/html/1706.03762v7#S6.T3 "Table 3 ‣ 6.2 Model Variations ‣ 6 Results ‣ Attention Is All You Need")), step time was 1.0 seconds. The big models were trained for 300,000 steps (3.5 days).

### 5.3 优化器

We used the Adam optimizer [^20] with $\beta_{1}=0.9$ , $\beta_{2}=0.98$ and $\epsilon=10^{-9}$ . We varied the learning rate over the course of training, according to the formula:  
我们使用了 Adam 优化器 [^20]，参数设置为 $\beta_{1}=0.9$ 、 $\beta_{2}=0.98$ 和 $\epsilon=10^{-9}$ 。在训练过程中，我们根据以下公式更改学习率：

<table><tbody><tr><td></td><td><math><semantics><mrow><mrow><mi>l</mi> <mo></mo><mi>r</mi> <mo></mo><mi>a</mi> <mo></mo><mi>t</mi> <mo></mo><mi>e</mi></mrow> <mo>=</mo> <mrow><msubsup><mi>d</mi> <mtext>model</mtext> <mrow><mo>−</mo> <mn>0.5</mn></mrow></msubsup> <mo>⋅</mo> <mrow><mi>min</mi> <mo>⁡</mo> <mrow><mo>(</mo><mrow><mi>s</mi> <mo></mo><mi>t</mi> <mo></mo><mi>e</mi> <mo></mo><mi>p</mi> <mo></mo><mi>_</mi> <mo></mo><mi>n</mi> <mo></mo><mi>u</mi> <mo></mo><msup><mi>m</mi> <mrow><mo>−</mo> <mn>0.5</mn></mrow></msup></mrow><mo>,</mo><mrow><mrow><mrow><mi>s</mi> <mo></mo><mi>t</mi> <mo></mo><mi>e</mi> <mo></mo><mi>p</mi> <mo></mo><mi>_</mi> <mo></mo><mi>n</mi> <mo></mo><mi>u</mi> <mo></mo><mi>m</mi></mrow> <mo>⋅</mo> <mi>w</mi></mrow> <mo></mo><mi>a</mi> <mo></mo><mi>r</mi> <mo></mo><mi>m</mi> <mo></mo><mi>u</mi> <mo></mo><mi>p</mi> <mo></mo><mi>_</mi> <mo></mo><mi>s</mi> <mo></mo><mi>t</mi> <mo></mo><mi>e</mi> <mo></mo><mi>p</mi> <mo></mo><msup><mi>s</mi> <mrow><mo>−</mo> <mn>1.5</mn></mrow></msup></mrow><mo>)</mo></mrow></mrow></mrow></mrow> <annotation>lrate=d_{\text{model}}^{-0.5}\cdot\min({step\_num}^{-0.5},{step\_num}\cdot{warmup\_steps}^{-1.5})</annotation></semantics></math></td><td></td><td rowspan="1"><span>(3)</span></td></tr></tbody></table>

这对应于在训练的前 $warmup\_steps$ 步线性增加学习率，之后使其与步数的平方根倒数成比例地减少。我们使用了 $warmup\_steps=4000$ 。

### 5.4 正则化

我们在训练过程中采用了三种类型的正则化：

##### Residual Dropout 残差 Dropout

我们在每个子层的输出上应用 dropout [^33]，然后再将其与子层输入相加并进行归一化。此外，我们还在编码器和解码器堆栈中，对嵌入项与位置编码之和应用 dropout。对于基础模型，我们使用的比率为 $P_{drop}=0.1$ 。

##### Label Smoothing 标签平滑

在训练过程中，我们采用了值为 $\epsilon_{ls}=0.1$ [^36] 的标签平滑。尽管由于模型学习变得更加不确定，这会损害困惑度，但它提高了准确率和 BLEU 分数。

## 6 结果

### 6.1 机器翻译

表 2：在英语到德语和英语到法语的 newstest2014 测试中，Transformer 取得了比之前的最先进模型更好的 BLEU 分数，且训练成本仅为后者的一小部分。

<table><tbody><tr><th rowspan="2"><span>Model</span></th><td colspan="2">BLEU</td><td></td><td colspan="2">Training Cost (FLOPs) <font><font><font>训练成本 (FLOPs)</font></font></font></td></tr><tr><td>EN-DE</td><td>EN-FR</td><td></td><td>EN-DE</td><td>EN-FR</td></tr><tr><th>ByteNet <sup><a href="https://arxiv.org/html/?_immersive_translate_auto_translate=1#fn:18">18</a></sup></th><td>23.75</td><td></td><td></td><td></td><td></td></tr><tr><th>Deep-Att + PosUnk <sup><a href="https://arxiv.org/html/?_immersive_translate_auto_translate=1#fn:39">39</a></sup></th><td></td><td>39.2</td><td></td><td></td><td><math><semantics><mrow><mn>1.0</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>20</mn></msup></mrow> <annotation>1.0\cdot 10^{20}</annotation></semantics></math></td></tr><tr><th>GNMT + RL <sup><a href="https://arxiv.org/html/?_immersive_translate_auto_translate=1#fn:38">38</a></sup></th><td>24.6</td><td>39.92</td><td></td><td><math><semantics><mrow><mn>2.3</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>19</mn></msup></mrow> <annotation>2.3\cdot 10^{19}</annotation></semantics></math></td><td><math><semantics><mrow><mn>1.4</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>20</mn></msup></mrow> <annotation>1.4\cdot 10^{20}</annotation></semantics></math></td></tr><tr><th>ConvS2S <sup><a href="https://arxiv.org/html/?_immersive_translate_auto_translate=1#fn:9">9</a></sup></th><td>25.16</td><td>40.46</td><td></td><td><math><semantics><mrow><mn>9.6</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>18</mn></msup></mrow> <annotation>9.6\cdot 10^{18}</annotation></semantics></math></td><td><math><semantics><mrow><mn>1.5</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>20</mn></msup></mrow> <annotation>1.5\cdot 10^{20}</annotation></semantics></math></td></tr><tr><th>MoE <sup><a href="https://arxiv.org/html/?_immersive_translate_auto_translate=1#fn:32">32</a></sup></th><td>26.03</td><td>40.56</td><td></td><td><math><semantics><mrow><mn>2.0</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>19</mn></msup></mrow> <annotation>2.0\cdot 10^{19}</annotation></semantics></math></td><td><math><semantics><mrow><mn>1.2</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>20</mn></msup></mrow> <annotation>1.2\cdot 10^{20}</annotation></semantics></math></td></tr><tr><th>Deep-Att + PosUnk Ensemble <sup><a href="https://arxiv.org/html/?_immersive_translate_auto_translate=1#fn:39">39</a></sup><font><br><font><font>Deep-Att + PosUnk 集成 [ 39]</font></font></font></th><td></td><td>40.4</td><td></td><td></td><td><math><semantics><mrow><mn>8.0</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>20</mn></msup></mrow> <annotation>8.0\cdot 10^{20}</annotation></semantics></math></td></tr><tr><th>GNMT + RL Ensemble <sup><a href="https://arxiv.org/html/?_immersive_translate_auto_translate=1#fn:38">38</a></sup><font><br><font><font>GNMT + RL 集成 [ 38]</font></font></font></th><td>26.30</td><td>41.16</td><td></td><td><math><semantics><mrow><mn>1.8</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>20</mn></msup></mrow> <annotation>1.8\cdot 10^{20}</annotation></semantics></math></td><td><math><semantics><mrow><mn>1.1</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>21</mn></msup></mrow> <annotation>1.1\cdot 10^{21}</annotation></semantics></math></td></tr><tr><th>ConvS2S Ensemble <sup><a href="https://arxiv.org/html/?_immersive_translate_auto_translate=1#fn:9">9</a></sup> <font><font><font>ConvS2S 集成 [ 9]</font></font></font></th><td>26.36</td><td><span>41.29</span></td><td></td><td><math><semantics><mrow><mn>7.7</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>19</mn></msup></mrow> <annotation>7.7\cdot 10^{19}</annotation></semantics></math></td><td><math><semantics><mrow><mn>1.2</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>21</mn></msup></mrow> <annotation>1.2\cdot 10^{21}</annotation></semantics></math></td></tr><tr><th>Transformer (base model) <font><font><font>Transformer (基础模型)</font></font></font></th><td>27.3</td><td>38.1</td><td></td><td colspan="2"><math><semantics><mrow><mn>3.3</mn> <mo>⋅</mo> <msup><mn>𝟏𝟎</mn> <mn>𝟏𝟖</mn></msup></mrow> <annotation>3.3\cdot 10^{18}</annotation></semantics></math></td></tr><tr><th>Transformer (big) <font><font><font>Transformer (大)</font></font></font></th><td><span>28.4</span></td><td><span>41.8</span></td><td></td><td colspan="2"><math><semantics><mrow><mn>2.3</mn> <mo>⋅</mo> <msup><mn>10</mn> <mn>19</mn></msup></mrow> <annotation>2.3\cdot 10^{19}</annotation></semantics></math></td></tr></tbody></table>

在 WMT 2014 英德翻译任务中，Transformer 大模型（表 2 中的 Transformer (big)）比之前报道的最佳模型（包括集成模型）高出超过 $2.0$ 个 BLEU 分值，创下了 $28.4$ 的全新最先进（state-of-the-art）BLEU 分值纪录。该模型的配置列在表 3 的最后一行。在 $8$ 台 P100 GPU 上训练耗时 $3.5$ 天。甚至我们的基础模型也超过了之前发布的所有模型和集成模型，而其训练成本仅为任何竞争模型的一小部分。

在 WMT 2014 英法翻译任务中，我们的大模型实现了 $41.0$ 的 BLEU 分值，优于之前发布的所有单模型，且训练成本不到之前最先进模型的 $1/4$ 。用于英法翻译训练的 Transformer (big) 模型使用的 dropout 率为 $P_{drop}=0.1$ ，而非 $0.3$ 。

对于基础模型，我们使用了通过对最后 5 个检查点（每隔 10 分钟记录一次）取平均值得到的单个模型。对于大模型，我们对最后 20 个检查点取平均值。我们使用了束搜索（beam search），束大小为 $4$ ，长度惩罚为 $\alpha=0.6$ [^38]。这些超参数是在开发集上进行实验后选定的。我们将推理过程中的最大输出长度设置为输入长度 + $50$ ，但在可能的情况下会提前终止 [^38]。

我们分别为 K80、K40、M40 和 P100 使用了 2.8、3.7、6.0 和 9.5 TFLOPS 的数值。  
表 2 总结了我们的结果，并将我们的翻译质量和训练成本与文献中的其他模型架构进行了比较。我们通过将训练时间、使用的 GPU 数量以及对每台 GPU 持续单精度浮点运算能力的估计值 <sup>2</sup> 相乘，来估算训练模型所使用的浮点运算次数。.

### 6.2 模型变体

表 3：Transformer 架构的变体。未列出的数值与基准模型相同。所有指标均基于英德翻译开发集 newstest2013。所列出的困惑度是基于每个分词（wordpiece）的，根据我们的字节对编码计算，不应与基于每个单词的困惑度进行比较。

<table><tbody><tr><td></td><td rowspan="2"><span><math><semantics><mi>N</mi> <annotation>N</annotation></semantics></math></span></td><td rowspan="2"><span><math><semantics><msub><mi>d</mi> <mtext>model</mtext></msub> <annotation>d_{\text{model}}</annotation></semantics></math></span></td><td rowspan="2"><span><math><semantics><msub><mi>d</mi> <mtext>ff</mtext></msub> <annotation>d_{\text{ff}}</annotation></semantics></math></span></td><td rowspan="2"><span><math><semantics><mi>h</mi> <annotation>h</annotation></semantics></math></span></td><td rowspan="2"><span><math><semantics><msub><mi>d</mi> <mi>k</mi></msub> <annotation>d_{k}</annotation></semantics></math></span></td><td rowspan="2"><span><math><semantics><msub><mi>d</mi> <mi>v</mi></msub> <annotation>d_{v}</annotation></semantics></math></span></td><td rowspan="2"><span><math><semantics><msub><mi>P</mi> <mrow><mi>d</mi> <mo></mo><mi>r</mi> <mo></mo><mi>o</mi> <mo></mo><mi>p</mi></mrow></msub> <annotation>P_{drop}</annotation></semantics></math></span></td><td rowspan="2"><span><math><semantics><msub><mi>ϵ</mi> <mrow><mi>l</mi> <mo></mo><mi>s</mi></mrow></msub> <annotation>\epsilon_{ls}</annotation></semantics></math></span></td><td>train <font><font><font>训练</font></font></font></td><td>PPL</td><td>BLEU</td><td>params <font><font><font>参数量</font></font></font></td></tr><tr><td></td><td>steps <font><font><font>步数</font></font></font></td><td>(dev) <font><font><font>(开发集)</font></font></font></td><td>(dev) <font><font><font>(开发集)</font></font></font></td><td><math><semantics><mrow><mo>×</mo> <msup><mn>10</mn> <mn>6</mn></msup></mrow> <annotation>\times 10^{6}</annotation></semantics></math></td></tr><tr><td>base <font><font><font>基础模型</font></font></font></td><td>6</td><td>512</td><td>2048</td><td>8</td><td>64</td><td>64</td><td>0.1</td><td>0.1</td><td>100K</td><td>4.92</td><td>25.8</td><td>65</td></tr><tr><td rowspan="4"><span>(A)</span></td><td></td><td></td><td></td><td>1</td><td>512</td><td>512</td><td></td><td></td><td></td><td>5.29</td><td>24.9</td><td></td></tr><tr><td></td><td></td><td></td><td>4</td><td>128</td><td>128</td><td></td><td></td><td></td><td>5.00</td><td>25.5</td><td></td></tr><tr><td></td><td></td><td></td><td>16</td><td>32</td><td>32</td><td></td><td></td><td></td><td>4.91</td><td>25.8</td><td></td></tr><tr><td></td><td></td><td></td><td>32</td><td>16</td><td>16</td><td></td><td></td><td></td><td>5.01</td><td>25.4</td><td></td></tr><tr><td rowspan="2"><span>(B)</span></td><td></td><td></td><td></td><td></td><td>16</td><td></td><td></td><td></td><td></td><td>5.16</td><td>25.1</td><td>58</td></tr><tr><td></td><td></td><td></td><td></td><td>32</td><td></td><td></td><td></td><td></td><td>5.01</td><td>25.4</td><td>60</td></tr><tr><td rowspan="7"><span>(C)</span></td><td>2</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>6.11</td><td>23.7</td><td>36</td></tr><tr><td>4</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>5.19</td><td>25.3</td><td>50</td></tr><tr><td>8</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>4.88</td><td>25.5</td><td>80</td></tr><tr><td></td><td>256</td><td></td><td></td><td>32</td><td>32</td><td></td><td></td><td></td><td>5.75</td><td>24.5</td><td>28</td></tr><tr><td></td><td>1024</td><td></td><td></td><td>128</td><td>128</td><td></td><td></td><td></td><td>4.66</td><td>26.0</td><td>168</td></tr><tr><td></td><td></td><td>1024</td><td></td><td></td><td></td><td></td><td></td><td></td><td>5.12</td><td>25.4</td><td>53</td></tr><tr><td></td><td></td><td>4096</td><td></td><td></td><td></td><td></td><td></td><td></td><td>4.75</td><td>26.2</td><td>90</td></tr><tr><td rowspan="4"><span>(D)</span></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.0</td><td></td><td></td><td>5.77</td><td>24.6</td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td>0.2</td><td></td><td></td><td>4.95</td><td>25.5</td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.0</td><td></td><td>4.67</td><td>25.3</td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0.2</td><td></td><td>5.47</td><td>25.7</td><td></td></tr><tr><td>(E)</td><td></td><td colspan="7">positional embedding instead of sinusoids<font><br><font><font>使用位置嵌入而非正弦曲线</font></font></font></td><td></td><td>4.92</td><td>25.7</td><td></td></tr><tr><td>big <font><font><font>大</font></font></font></td><td>6</td><td>1024</td><td>4096</td><td>16</td><td></td><td></td><td>0.3</td><td></td><td>300K</td><td><span>4.33</span></td><td><span>26.4</span></td><td>213</td></tr></tbody></table>

为了评估 Transformer 不同组件的重要性，我们以不同的方式改变了基础模型，并在开发集 newstest2013 上测量了英语到德语翻译性能的变化。我们使用了前一节所述的束搜索（beam search），但没有进行检查点平均（checkpoint averaging）。我们在表 3 中展示了这些结果。

在表 3 的 (A) 行中，我们改变了注意力头数以及注意力键和值的维度，并如第 3.2.2 节所述保持计算量不变。虽然单头注意力比最佳设置差 0.9 BLEU，但头数过多也会导致质量下降。

在表 3 的行 (B) 中，我们观察到减小注意力键维度 $d_{k}$ 会损害模型质量。这表明确定兼容性并非易事，且采用比点积更复杂的兼容性函数可能是有益的。我们进一步在行 (C) 和 (D) 中观察到，正如预期的那样，更大的模型效果更好，且 dropout 对于避免过拟合非常有帮助。在行 (E) 中，我们将正弦位置编码替换为学习到的位置嵌入 [^9]，并观察到与基准模型几乎相同的结果。

### 6.3 英语成分句法分析

表 4：Transformer 在英语成分句法分析上表现出良好的泛化能力（结果基于 WSJ 第 23 部分）

| Parser 解析器                                                           | Training 训练                           | WSJ 23 F1 |
| ----------------------------------------------------------------------- | --------------------------------------- | --------- |
| Vinyals & Kaiser el al. (2014) [^37]                                    | WSJ only, discriminative 仅 WSJ，判别式 | 88.3      |
| Petrov et al. (2006) [^29] Petrov 等人 (2006) [^29]                   | WSJ only, discriminative 仅 WSJ，判别式 | 90.4      |
| Zhu et al. (2013) [^40] Zhu 等人 (2013) [^40]                         | WSJ only, discriminative 仅 WSJ，判别式 | 90.4      |
| Dyer et al. (2016) [^8] Dyer 等人 (2016) [^8]                         | WSJ only, discriminative 仅 WSJ，判别式 | 91.7      |
| Transformer (4 layers) Transformer (4 层)                               | WSJ only, discriminative 仅 WSJ，判别式 | 91.3      |
| Zhu et al. (2013) [^40] Zhu 等人 (2013) [^40]                         | semi-supervised 半监督                  | 91.3      |
| Huang & Harper (2009) [^14]                                             | semi-supervised 半监督                  | 91.3      |
| McClosky et al. (2006) [^26] McClosky 等 (2006) [^26]                 | semi-supervised 半监督                  | 92.1      |
| Vinyals & Kaiser el al. (2014) [^37] Vinyals & Kaiser 等 (2014) [^37] | semi-supervised 半监督                  | 92.1      |
| Transformer (4 layers) Transformer (4 层)                               | semi-supervised 半监督                  | 92.7      |
| Luong et al. (2015) [^23]                                               | multi-task 多任务                       | 93.0      |
| Dyer et al. (2016) [^8] Dyer 等人 (2016) [^8]                         | generative 生成式                       | 93.3      |

为了评估 Transformer 是否可以泛化到其他任务，我们在英语成分句法分析上进行了实验。这项任务面临着特定的挑战：输出受到强烈的结构约束，且明显比输入更长。此外，RNN 序列到序列模型在小数据场景下一直未能获得最先进的结果 [^37]。

我们在 Penn Treebank [^25] 的《华尔街日报》(WSJ) 部分（约 4 万条训练句子）上训练了一个具有 $d_{model}=1024$ 的 4 层 Transformer。我们还在半监督设置下进行了训练，使用了来自 [^37] 的更大的高置信度和 BerkleyParser 语料库，包含约 1700 万条句子。在仅 WSJ 的设置中，我们使用了 1.6 万个 token 的词表，而在半监督设置中，我们使用了 3.2 万个 token 的词表。

我们仅在 Section 22 开发集上进行了少量实验，以选择 dropout（包括注意力层和残差层，见第 5.4 节）、学习率和束搜索大小（beam size），所有其他参数均与英语到德语的基础翻译模型保持一致。在推理过程中，我们将最大输出长度增加到输入长度 + $300$ 。对于仅使用 WSJ 和半监督设置，我们使用的束搜索大小分别为 $21$ 和 $\alpha=0.3$ 。

表 4 中的结果表明，尽管缺乏针对特定任务的调优，我们的模型表现却出奇地好，其结果优于除循环神经网络语法（Recurrent Neural Network Grammar）[^8] 之外的所有先前报道的模型。

与 RNN 序列到序列模型 [^37] 相比，即使仅在包含 4 万个句子的 WSJ 训练集上进行训练，Transformer 的表现也优于 BerkeleyParser [^29]。

## 7 结论

在这项工作中，我们提出了 Transformer，这是首个完全基于注意力的序列转导模型，它用多头自注意力取代了编码器-解码器架构中最常用的循环层。

对于翻译任务，Transformer 的训练速度显著快于基于循环或卷积层的架构。在 WMT 2014 英德和 WMT 2014 英法翻译任务中，我们均取得了新的最先进水平。在前一项任务中，我们的最佳模型甚至优于之前报道的所有集成模型。

我们对基于注意力的模型的未来充满期待，并计划将其应用于其他任务。我们计划将 Transformer 扩展到涉及文本以外的输入和输出模态的问题，并研究局部、受限的注意力机制，以高效处理图像、音频和视频等大型输入和输出。降低生成过程的序列化程度是我们的另一个研究目标。

我们用于训练和评估模型的代码可在 https://github.com/tensorflow/tensor2tensor 获取。
