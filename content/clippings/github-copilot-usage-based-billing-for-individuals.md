---
title: GitHub Copilot 个人用户按量计费指南
description: GitHub Copilot 个人用户按量计费（Usage-based Billing）的完整说明，包括 AI 积分机制、各套餐额度、超额处理方案及迁移准备。
tags:
  - github
  - copilot
  - billing
  - usage-based
  - ai-credits
  - clippings
source: https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals
---

## 个人用户按量计费

> [!important] 重要提示
> GitHub 将于 **2026 年 6 月 1 日** 起采用本文所述的新计费方式。你可以在 [GitHub 博客](https://github.blog/) 上了解更多关于此变更的信息。

### 什么是按量计费？

所有个人套餐——Copilot Free、Copilot Pro 和 Copilot Pro+——都包含不同额度的 **GitHub AI 积分**（GitHub AI Credits）。付费套餐提供的额度上限高于免费套餐。

### 什么是 GitHub AI 积分？

GitHub AI 积分是 Copilot 使用量的计费单位。

当你使用 Copilot 时，每次交互都会消耗 tokens：

- **输入 tokens**：发送给模型的内容
- **输出 tokens**：模型生成的内容
- **缓存 tokens**：模型复用或存储的上下文

每个 token 根据所使用的模型定价，总计金额折算为 AI 积分，其中 **1 AI 积分 = $0.01 USD**。

一次交互的成本取决于两个因素：**模型**和**消耗的 token 数量**。使用轻量模型快速提问可能只消耗几分之一积分。而跨多个文件使用前沿模型进行长时间的编码 Agent 会话，成本会更高，因为它在完成更复杂的工作。

### 什么会影响我的使用量？

交互越复杂，消耗的使用量配额就越多。主要影响因素包括：

- **对话长度与复杂度**：更长的对话和更复杂的任务意味着与模型之间更多的往返交互，消耗更多。
- **Agent 功能**：Agent 模式和 Copilot Cloud Agent 等功能在一次任务中可能涉及多次模型调用。跨大型代码库进行复杂的 Agent 会话，消耗的使用量会远超聊天中的快速提问。
- **模型选择**：不同模型的每 token 成本不同。专为复杂推理设计的能力更强的模型，比适合快速任务的轻量模型成本更高。切换到更便宜的模型是延长使用配额的一种方式。

### 哪些功能计入 AI 积分？

Copilot 中使用 AI 模型的功能会消耗 AI 积分，包括：

- Copilot Chat
- Copilot CLI
- Copilot Cloud Agent
- Copilot Spaces
- Spark
- 第三方编码 Agent

> [!note]
> **代码补全**和**下一编辑建议**（next edit suggestions）**不计入** AI 积分。所有付费套餐中这两项仍保持无限使用。

### AI 积分如何运作？

每个 Copilot 个人套餐订阅均包含每月 AI 积分额度。

- **基础积分**（Base credits）：随套餐订阅每月发放，与订阅价格匹配，不会变动。
- **弹性配额**（Flex allotment）：基础积分之上的额外月度额度。弹性配额是包含用量的可变部分，旨在随 AI 经济变化（包括模型定价、新模型发布以及效率提升）而动态调整。

你的基础积分会被优先使用。超出基础积分后，弹性配额会在你的 IDE、GitHub.com 和 Copilot CLI 中以相同费率自动生效，无需额外设置。用量仪表板会显示你的可用额度和已用量。

如果你用完了套餐包含的全部额度，可以购买更多额度继续使用。请参阅 [[#超出 AI 积分额度后会怎样？]]。

| 套餐         | 月费     | 基础积分 | 弹性配额 | 月度 AI 积分总额 |
| ------------ | -------- | -------- | -------- | ---------------- |
| Copilot Pro  | $10 USD  | 1,000    | 500      | 1,500            |
| Copilot Pro+ | $39 USD  | 3,900    | 3,100    | 7,000            |
| Copilot Max  | $100 USD | 10,000   | 10,000   | 20,000           |

Copilot Free 每月包含 2,000 次代码补全、AI 积分额度和自动模型选择。

### 超出 AI 积分额度后会怎样？

当 AI 积分耗尽后，你可以：

- **设置额外用量预算**，付费继续使用
- **等待下个计费周期**，届时包含的使用量会重置

额外用量预算以美元设置，使用量以 GitHub AI 积分显示。GitHub AI 积分按固定汇率消耗预算：**1 AI 积分 = $0.01 USD**，因此 $10 预算可覆盖 1,000 AI 积分。

### 我需要为按量计费做准备吗？

#### 如果你使用月付套餐

**无需任何操作**。你将在 2026 年 6 月 1 日自动迁移到按量计费。

#### 如果你使用年付套餐

你的套餐**不会自动续订**。在年度续订日期之前，你将收到 GitHub 关于可选方案的通知。

你将有以下选项：

- 取消套餐并获得按比例退款。
- 在续订时降级为 Copilot Free。

> [!warning] 注意
> 从 **2026 年 6 月 1 日** 起，仍在**原有年付计费方案**上的 Copilot Pro 和 Copilot Pro+ 订阅用户，将经历模型倍率变化。请参阅 [[Model multipliers for annual plans staying on request-based billing]]。

### 后续步骤

有关如何为按量计费做准备的指南，请参阅 [[Preparing for your move to usage-based billing]]。

---

> 原文：[Usage-based billing for individuals - GitHub Docs](https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-individuals)
> 翻译日期：2026-05-13
