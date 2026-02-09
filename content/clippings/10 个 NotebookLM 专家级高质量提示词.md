---
title: 10 个 NotebookLM 专家级高质量提示词
description: 来自 @Ihtesham 分享的高质量提示词，青小蛙觉得写的非常赞啊，值得仔细学习一下。
source: https://www.appinn.com/notebooklm-prompts-10/
author:
  - "[[青小蛙]]"
tags:
  - clippings
  - notebooklm
  - google
---

## 提示词1. 专家级提炼

让 AI 扮演某个领域 15 年经验的专家，从多份资料中提炼出：

- 3 个该领域从业者一眼就能认出的「突破性核心洞见」
- 每个洞见为什么重要
- 如果忽略它，会产生什么后果

👉 适合：

快速判断一堆材料「有没有真货」、值不值得继续深挖。

### 提示词

> “You are a \[field\] expert with 15 years of experience. Analyze these sources and identify the 3 core insights that practitioners in this field would immediately recognize as groundbreaking. For each insight, explain why it matters and what conventional wisdom it challenges.”

> “您是一位拥有15年经验的\[领域\]专家。请分析这些资料，并找出该领域从业者一眼就能看出具有突破性意义的3个核心见解。对于每个见解，请解释其重要性以及它挑战了哪些传统观念。”

## 提示词2. 发现互相矛盾内容

要求 AI：

- 找出所有资料之间互相矛盾的地方
- 对每个矛盾判断哪一方证据更强
- 如果双方都可信，解释分歧产生的原因

👉 适合：

综述论文、政策分析、行业报告、技术路线之争。

### 提示词

> Compare these sources and identify every point where they contradict each other. For each contradiction, explain which source has stronger evidence and why. If both are credible, explain what factors might explain the disagreement.

> “比较这些资料，找出它们之间所有相互矛盾的地方。对于每一个矛盾之处，解释哪个资料的证据更有力，以及原因。如果两者都可信，解释可能导致分歧的因素。”

## 提示词3. 实施蓝图计划

从所有资料中提取：

- 每一个可执行步骤
- 使用到的工具 / 框架 / 技术
- 前置条件
- 预期结果
- 每一步可能踩的坑

并整理成 **一步步的实施计划** 。

👉 适合：

“看懂了，但不知道怎么落地”的所有场景。

### 提示词

> Extract every actionable step, tool, framework, and technique mentioned across all sources. Organize them into a step-by-step implementation plan with prerequisites, expected outcomes, and potential pitfalls for each step.

> 提取所有来源中提到的每一个可操作的步骤、工具、框架和技术。将它们整理成一个循序渐进的实施计划，每个步骤都应包含前提条件、预期结果和潜在风险。

## 提示词4. 专家级提问

让 AI 生成：

- 15 个真正的专家才会问
- 但现有资料完全没有回答的问题

并优先挑选：

- 能推动领域进展的
- 能暴露关键认知缺口的

👉 适合：

写论文选题、创业方向、产品差异化、深度内容选角度。

### 提示词

> Based on these sources, generate 15 questions that an expert would ask but that these sources DON’T answer. Prioritize questions that would advance the field or reveal critical gaps in current understanding.

> 基于这些资料，提出15个专家会问但这些资料没有回答的问题。优先考虑那些能够推动该领域发展或揭示当前理解中关键空白的问题。

## 提示词5. 挖掘假设条件

要求 AI：

- 列出所有「资料默认成立但从未明说的假设」
- 给每个假设打两个分：
	- 重要性（1–10）
	- 出错概率（1–10）
- 假设一旦不成立，会发生什么变化

👉 适合：

识别系统性风险、认知偏差、共识幻觉。

### 提示词

> Identify every unstated assumption in these sources. For each assumption, rate how critical it is (1-10) and how likely it is to be wrong. Explain what would change if that assumption were false.

> 找出这些资料中所有未明确说明的假设。对于每个假设，评估其重要性(1-10)以及其错误的可能性。解释如果该假设为假，将会发生什么变化。

## 提示词6. 建立内容框架

让 AI 构建一个完整框架，包含：

- 核心组件
- 组件之间的关系
- 适用时的决策路径
- 框架在哪些边界条件下会失效

👉 适合：

把零散观点变成「能反复使用的认知工具」。

### 提示词

> Create a comprehensive framework that integrates all concepts from these sources. Include: key components, relationships between components, decision trees for application, and edge cases where the framework breaks down.

> 创建一个综合框架，整合来自这些来源的所有概念。包括：关键组成部分、组成部分之间的关系、应用决策树以及框架失效的极端情况down.

## 提示词7. 核实信息来源

对每一个主要结论：

- 找出支撑证据
- 标注证据类型：
	- 轶事
	- 相关性
	- 实验
	- Meta 分析
- 标记「证据很弱但语气很强」的危险结论

👉 适合：

反营销、反“专家胡说”、防被带节奏。

### 提示词

> For every major claim in these sources, extract the supporting evidence and rate its strength (anecdotal, correlational, experimental, meta-analysis). Flag any claims with weak evidence that are stated with high confidence.

> 针对这些来源中的每一项主要论断，提取其支持证据并评估其强度（轶事证据、相关性证据、实验证据、荟萃分析证据）。标记出任何证据薄弱但置信度很高的论断。

## 提示词8. 多受众翻译器

把同一批结论分别翻译给：

- 管理层
- 工程师
- 普通用户

每一版都只讲：

- 他们真正关心的点
- 他们能立刻理解的例子和语言

👉 适合：

汇报、产品文档、技术传播、对齐认知。

### 提示词

> Translate the insights from these sources for three different audiences: \[executives, engineers, end-users\]. For each audience, focus on what they specifically care about and use language/examples they’ll immediately understand.

> 将这些来源的见解转化为三种不同受众群体能够理解的内容：\[高管、工程师、最终用户\]。针对每种受众群体，重点关注他们具体关心的内容，并使用他们能够立即理解的语言/示例。

## 提示词9. 时间线构建器

从所有资料中， **提取一切与时间有关的信息** ，包括：

- 明确日期
- 事件
- 里程碑
- 隐含的时间指代（比如“近几年”“此前”“随后”）

把这些信息整理成一条 **完整的演化时间线** 不是简单罗列，而是展示：这个领域 / 主题是如何一步步发展到今天的

**标出“加速节点”** ，也就是：

- 进展突然变快的阶段
- 成果、关注度或突破明显跃迁的点

👉 适合解决的问题：

- 这个东西为什么\*\*突然火了\*\*
- 当前处在\*\*早期 / 爆发期 / 成熟期 / 衰退期\*\*的哪一段
- 接下来最可能发生变化的方向

👉 特别适合：

- 行业趋势分析
- 技术路线演进
- 投资 / 创业判断
- 判断“现在入场是不是太早或太晚”

### 提示词

> Extract every date, event, milestone, and temporal reference from these sources. Build a comprehensive timeline showing how this field/topic evolved. Identify acceleration points where progress dramatically increased.

> 从这些资料中提取所有日期、事件、里程碑和时间参考信息。构建一个全面的时间线，展示该领域/主题的发展历程。找出进展显著加速的节点。

## 提示词10. 弱点扫描器

它要求 AI 对所有资料逐条做“拆解”，找出：

- 方法论上的问题
- 逻辑跳跃
- 证据不足却下了很重结论的地方
- 没有数据支撑的关键断言

并且对每一个问题，都要回答一件事：

👉 **如果要让这个结论成立，还需要补充什么证据？**

这一步的重点不是“否定”，而是：

- 精准指出哪里不行
- 明确告诉你怎么补救

👉 适合解决的问题：

- 这份分析 / 报告\*\*到底靠不靠谱\*\*
- 哪些结论只是“看起来很专业”
- 如果要反驳，它的\*\*薄弱点在哪\*\*
- 如果要支持，还差哪些关键证据

👉 特别适合：

- 尽职调查（due diligence）
- 学术论文阅读
- 商业 / 咨询报告审查
- 防止被包装得很好的结论误导

### 提示词

> Act as a harsh peer reviewer. Identify every methodological flaw, logical gap, overclaim, and unsupported leap in these sources. For each weakness, suggest what additional evidence would be needed to strengthen the argument.

> 扮演严苛的同行评审员角色。指出这些文献中所有的方法论缺陷、逻辑漏洞、夸大其词和缺乏依据的推断。针对每一个缺陷，提出需要哪些补充证据来加强论点。