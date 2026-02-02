---
title: "AI 模型比较 - GitHub 文档"
source: "https://docs.github.com/zh/copilot/reference/ai-models/model-comparison"
author:
  - "[[GitHub Docs]]"
published:
created: 2025-10-23
description: "比较 Copilot 对话助手 中的可用 AI 模型，并选择任务的最佳模型。"
tags:
  - "clippings"
---
## AI 模型比较

## 适用于 Copilot 的 AI 模型的比较

GitHub Copilot 支持具有不同功能的多个 AI 模型。 你选择的模型会影响 Copilot 对话助手 的响应以及 Copilot 代码补全的质量和相关性。 某些模型提供较低延迟，而另一些模型则提供较少的虚构内容或针对特定任务的更出色性能。 本指南可帮助你根据任务（而不仅仅是模型名称）选择最佳模型。

使用下表快速查找合适的模型，请在以下部分中查看更多详细信息。

| 型号 | 任务领域 | 擅长功能（主要用例） | 附加功能 | 其他阅读材料 |
| --- | --- | --- | --- | --- |
| GPT-4.1 | 常规用途的编码和编写 | 快速、准确的代码补全和解释 | 代理模式，视觉 | [GPT-4.1 模型卡](https://openai.com/index/gpt-4-1/) |
| GPT-5-Codex | 常规用途的编码和编写 | 快速、准确的代码补全和解释 | 代理模式 | [GPT-5-Codex 模型卡](https://cdn.openai.com/pdf/97cc5669-7a25-4e63-b15f-5fd5bdc4d149/gpt-5-codex-system-card.pdf) |
| GPT-5 mini | 深层推理和调试 | 定义明确的任务和精确的提示 | 推理，视觉 | 不可用 |
| GPT-5 | 深层推理和调试 | 多步骤解决问题和体系结构级代码分析 | 原因 | [GPT-5 模型卡](https://cdn.openai.com/pdf/8124a3ce-ab78-4f06-96eb-49ea29ffb52f/gpt5-system-card-aug7.pdf) |
| o3 | 深层推理和调试 | 多步骤解决问题和体系结构级代码分析 | 原因 | [o3 模型卡](https://openai.com/index/o3-o4-mini-system-card/) |
| o4-mini | 快速帮助完成简单或重复的任务 | 为轻型编码问题提供快速可靠的答案 | 降低延迟 | [o4-mini 模型卡](https://openai.com/index/o3-o4-mini-system-card/) |
| Claude Sonnet 4.5 | 常规用途的编码和智能体任务 | 复杂的问题解决挑战，复杂的推理 | 代理模式 | 不可用 |
| Claude Opus 4.1 | 深层推理和调试 | 复杂的问题解决挑战，复杂的推理 | 推理，视觉 | [Claude Opus 4.1 模型卡](https://assets.anthropic.com/m/4c024b86c698d3d4/original/Claude-4-1-System-Card.pdf) |
| Claude Opus 4 | 深层推理和调试 | 复杂的问题解决挑战，复杂的推理 | 推理，视觉 | [Claude Opus 4 模型卡](https://www-cdn.anthropic.com/6be99a52cb68eb70eb9572b4cafad13df32ed995.pdf) |
| Claude Sonnet 3.5 | 快速帮助完成简单或重复的任务 | 提供代码、语法和文档方面的快速答复 | 代理模式，视觉 | [Claude Sonnet 3.5 模型卡](https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf) |
| Claude Sonnet 3.7 | 深层推理和调试 | 跨大型复杂代码库进行结构化推理 | 代理模式，视觉 | [Claude Sonnet 3.7 模型卡](https://assets.anthropic.com/m/785e231869ea8b3b/original/claude-3-7-sonnet-system-card.pdf) |
| Claude Sonnet 4 | 深层推理和调试 | 为编码工作流打造的性能与实用性的完美结合 | 代理模式，视觉 | [Claude Sonnet 4 模型卡](https://www-cdn.anthropic.com/6be99a52cb68eb70eb9572b4cafad13df32ed995.pdf) |
| Gemini 2.5 Pro | 深层推理和调试 | 复杂代码生成、调试和研究工作流 | 推理，视觉 | [Gemini 2.5 Pro 模型卡](https://storage.googleapis.com/model-cards/documents/gemini-2.5-pro.pdf) |
| Gemini 2.0 Flash | 使用视觉对象（图表、屏幕截图） | 为基于 UI 和图表的任务提供实时答复和视觉推理 | 视觉 | [Gemini 2.0 Flash 模型卡](https://storage.googleapis.com/model-cards/documents/gemini-2-flash.pdf) |
| Grok Code Fast 1 | 常规用途的编码和编写 | 快速、准确的代码补全和解释 | 代理模式 | [Grok Code Fast 1 模型卡](https://data.x.ai/2025-08-20-grok-4-model-card.pdf) |

## 任务：常规用途的编码和编写

将这些模型用于需要平衡质量、速度和成本效益的常见开发任务。 如果没有特定要求，这些模型是不错的默认方案。

| 型号 | 适合的原因 |
| --- | --- |
| GPT-4.1 | 这是适合大多数编码和编写任务的可靠默认方案。 快速、准确且跨语言和框架工作良好。 |
| GPT-5-Codex | 在复杂的工程任务（如功能、测试、调试、重构和评审）中，无需冗长指令即可交付更高质量的代码。 |
| Claude Sonnet 3.7 | 生成清晰、结构化的输出。 遵循格式设置说明并保持一致的样式。 |
| Gemini 2.0 Flash | 快速且经济高效。 非常适合快速问题、简短代码片段和轻型编写任务。 |
| o4-mini | 针对速度和成本效益进行了优化。 非常适合以较低的使用开销提供实时建议。 |
| Grok Code Fast 1 | 编码任务专用。 在生成代码和跨多种语言调试方面表现出色。 |

### 何时使用这些模型

如果要执行以下操作，请使用这些模型之一：

- 编写或查看函数、短文件或代码差异。
- 生成文档、注释或摘要。
- 快速解释错误或意外行为。
- 在非英语编程环境中工作。

### 何时使用其他模型

如果要处理复杂的重构、体系结构决策或多步骤逻辑，请考虑使用 [深层推理和调试](https://docs.github.com/zh/copilot/reference/ai-models/#task-deep-reasoning-and-debugging) 中的模型。 若要完成更快、更简单的任务（如重复编辑或一次性代码建议），请参阅 [快速帮助完成简单或重复的任务](https://docs.github.com/zh/copilot/reference/ai-models/#task-fast-help-with-simple-or-repetitive-tasks) 。

## 任务：快速帮助完成简单或重复的任务

这些模型针对速度和响应能力进行了优化。 它们非常适合快速编辑、实用工具函数、语法帮助和轻型原型制作。 你将获得快速答案，而无需等待不必要的深度或较长的推理链。

| 型号 | 适合的原因 |
| --- | --- |
| o4-mini | 这是一款适用于重复或简单编码任务的快速且经济高效的模型。 提供简洁明了的建议。 |
| Claude Sonnet 3.5 | 平衡质量输出与快速答复。 非常适合小型任务和轻型代码解释。 |
| Gemini 2.0 Flash | 延迟极低和支持多模态（如果有）。 非常适合快速交互式反馈。 |

### 何时使用这些模型

如果要执行以下操作，请使用这些模型之一：

- 编写或编辑小型函数或实用工具代码。
- 询问快速语法或语言问题。
- 以最少的设置建立创意原型。
- 获取有关简单提示或编辑的快速反馈。

### 何时使用其他模型

如果要处理复杂的重构、体系结构决策或多步骤逻辑，请参阅 [深层推理和调试](https://docs.github.com/zh/copilot/reference/ai-models/#task-deep-reasoning-and-debugging) 。 有关需要更强常规用途的推理或更结构化输出的任务，请参阅 [常规用途的编码和编写](https://docs.github.com/zh/copilot/reference/ai-models/#task-general-purpose-coding-and-writing) 。

## 任务：深层推理和调试

这些模型专为需要分步推理、复杂决策或高上下文感知的任务而设计。 当你需要结构化分析、深思熟虑的代码生成或多文件理解时，它们就很合适。

| 型号 | 适合的原因 |
| --- | --- |
| GPT-5 mini | 提供深度推理和调试能力，与 GPT-5 相比，响应速度更快，资源使用率更低。 非常适合交互式会话和分步代码分析。 |
| GPT-5 | 擅长复杂的推理、代码分析和技术决策。 |
| o3 | 擅长算法设计、系统调试和体系结构决策。 可平衡性能和推理。 |
| Claude Sonnet 3.7 | 提供可兼顾快速任务和更深入思考的混合推理。 |
| Claude Sonnet 4 | 在 3.7 的基础上加以改进，在压力下可提供更可靠的补全和更智能的推理。 |
| Claude Opus 4.1 | Anthropic 的最强模型。 Claude Opus 4 的改进。 |
| Claude Opus 4 | 在策略、调试和多层逻辑方面非常强大。 |
| Gemini 2.5 Pro | 提供具有长篇语境的高级推理和提供科学或技术分析。 |

### 何时使用这些模型

如果要执行以下操作，请使用这些模型之一：

- 跨多个文件调试上下文的复杂问题。
- 重构大型或互连的代码库。
- 跨层规划功能或体系结构。
- 在库、模式或工作流之间进行权衡。
- 分析日志、性能数据或系统行为。

### 何时使用其他模型

若要完成快速迭代或轻型任务，请参阅 [快速帮助完成简单或重复的任务](https://docs.github.com/zh/copilot/reference/ai-models/#task-fast-help-with-simple-or-repetitive-tasks) 。 有关常规开发工作流或内容生成，请参阅 [常规用途的编码和编写](https://docs.github.com/zh/copilot/reference/ai-models/#task-general-purpose-coding-and-writing) 。

## 任务：使用视觉对象（图表、屏幕截图）

如果要询问有关屏幕截图、图表、UI 组件或其他视觉输入的问题，请使用这些模型。 这些模型支持多模态输入，非常适合前端工作或视觉对象调试。

| 型号 | 适合的原因 |
| --- | --- |
| GPT-4.1 | 这是适合大多数编码和编写任务的可靠默认方案。 快速、准确，并支持视觉推理任务的多模式输入。 跨语言和框架工作良好。 |
| Claude Opus 4 | Anthropic 的最强模型。 在策略、调试和多层逻辑方面非常强大。 |
| Claude Sonnet 4 | 在 3.7 的基础上加以改进，在压力下可提供更可靠的补全和更智能的推理。 |
| Gemini 2.0 Flash | 这款快速多模态模型针对实时交互进行了优化。 非常适合用于提供图表、视觉原型和 UI 布局的反馈。 |
| Gemini 2.5 Pro | 深度推理和调试，非常适合复杂的代码生成、调试和研究工作流。 |

### 何时使用这些模型

如果要执行以下操作，请使用这些模型之一：

- 询问有关图表、屏幕截图或 UI 组件的问题。
- 获取有关视觉草稿或工作流的反馈。
- 通过视觉上下文了解前端行为。

### 何时使用其他模型

如果任务涉及深层推理或大规模重构，请考虑使用 [深层推理和调试](https://docs.github.com/zh/copilot/reference/ai-models/#task-deep-reasoning-and-debugging) 中的模型。 若要完成纯文本任务或更简单的代码编辑，请参阅 [快速帮助完成简单或重复的任务](https://docs.github.com/zh/copilot/reference/ai-models/#task-fast-help-with-simple-or-repetitive-tasks) 。

选择正确的模型有助于充分利用 Copilot。 如果不确定要使用哪种模型，请从常规用途的方案（如 GPT-4.1）开始，然后根据需求进行调整。

- 有关详细的模型规格和定价，请参阅 [GitHub Copilot 中支持的 AI 模型](https://docs.github.com/zh/copilot/using-github-copilot/ai-models/supported-ai-models-in-copilot) 。
- 有关如何使用不同模型的其他示例，请参阅 [使用不同任务比较 AI 模型](https://docs.github.com/zh/copilot/using-github-copilot/ai-models/comparing-ai-models-using-different-tasks) 。
- 若要切换模型，请参阅 [更改 GitHub Copilot 对话助手的 AI 模型](https://docs.github.com/zh/copilot/using-github-copilot/ai-models/changing-the-ai-model-for-copilot-chat) 或 [更改 GitHub Copilot 代码补全的 AI 模型](https://docs.github.com/zh/copilot/using-github-copilot/ai-models/changing-the-ai-model-for-copilot-code-completion) 。
- 要了解 Copilot 对话助手 如何提供不同的 AI 模型，请参阅“ [托管 GitHub Copilot 对话助手的模型](https://docs.github.com/zh/copilot/reference/ai-models/model-hosting) ”。