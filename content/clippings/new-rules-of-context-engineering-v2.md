---
title: Claude 5 代模型上下文工程新规则
description: Anthropic 分享 Claude 5 代模型上下文工程最佳实践：删除 80% 系统提示词、用判断替代规则、渐进式披露等 6 大范式转变
tags:
  - clippings
  - context-engineering
  - claude-code
  - prompt-engineering
  - ai-agent
source: https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models
created: 2026-07-24
author: Anthropic
---

## Claude 5 代模型上下文工程新规则

**原文**：[The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models) | 作者：Anthropic | 日期：2026-07-24 | 分类：Product, Claude Code, Claude Enterprise, Claude Platform

## 📝 摘要

Anthropic 官方博客分享了针对 Claude 5 代模型（Opus 5、Fable 5）的上下文工程新范式。团队发现，在升级到新一代模型后，可以删除 Claude Code 超过 80% 的系统提示词，且编码评测结果无任何可测量的损失。文章提出了六组"过去 vs 现在"的范式转变：用模型判断替代硬性规则、用接口设计替代示例教学、用渐进式披露替代全量前置、用简洁工具描述替代重复指令、用自动记忆替代手动 CLAUDE.md、用丰富引用替代简单规格。核心思想是：新一代模型具备更强的判断力，应尽可能少地约束它们，仅在绝对必要的领域施加限制。文章最后给出了如何将这套理念应用到系统提示词、CLAUDE.md、Skills 和 References 四个上下文层面的具体建议。

## 📋 术语表

| 英文                   | 中文           | 说明                                                                       |
| ---------------------- | -------------- | -------------------------------------------------------------------------- |
| context engineering    | 上下文工程     | 系统化地设计和组装智能体所见上下文（系统提示词、Skills、记忆等）的工程实践 |
| progressive disclosure | 渐进式披露     | 按需加载信息的设计模式，只在必要时提供上下文，而非一次性全部给出           |
| deferred loading       | 延迟加载       | 工具的完整定义在智能体主动搜索后才加载，避免占用上下文                     |
| guardrails             | 护栏           | 用于防止模型产生不良输出的约束性规则                                       |
| system prompt          | 系统提示词     | 在每次对话开始时注入模型的全局指令，定义其行为和产品上下文                 |
| rubrics                | 评定标准       | 一组用于评估输出质量的参考标准，可让验证智能体据此评判结果                 |
| verifier agent         | 验证智能体     | 根据评定标准检查其他智能体输出的专用子智能体                               |
| agent harness          | 智能体编排框架 | 管理和编排智能体的基础设施层，包括系统提示词、工具集成等                   |
| artifacts              | 工件           | Claude 生成的独立交互式内容（如 HTML 页面），可作为引用传递给智能体        |
| gotchas                | 暗坑           | 代码库中的反直觉设计或陷阱，需要在配置文件中特别说明                       |
| auto-memory            | 自动记忆       | Claude 自动保存与工作相关的记忆，无需用户手动操作                          |
| judgement              | 判断力         | 模型在无显式规则的情况下，根据上下文做出合理决策的能力                     |
| specs                  | 规格说明       | 定义项目需求和技术规范的文件                                               |

---

## 正文（双语对照）

# The new rules of context engineering for Claude 5 generation models

We removed over 80% of Claude Code's system prompt for more advanced models. How to apply the lessons we learned to your own context engineering in Claude Code and with your own agents.
Category: Product, Claude Code, Claude Enterprise, Claude Platform
Date: July 24, 2026

# Claude 5 代模型上下文工程新规则

我们为更先进的模型删除了 Claude Code 超过 80% 的系统提示词。以下是我们从中获得的经验，以及如何将其应用到 Claude Code 和自建智能体的上下文工程中。

类别：产品、Claude Code、Claude Enterprise、Claude Platform
日期：2026 年 7 月 24 日

---

I've written previously about how to best prompt the newest generation of Claude 5 models and work with them iteratively to discover what you want to build.

我此前写过如何以最佳方式为新一代 Claude 5 模型编写提示词，并通过迭代协作来探索你想要构建的东西。

But when you send a message to Claude, the prompt is only a small part of the context it gets. Much of your context is assembled from your system prompt, Skills, CLAUDE.md files, memory, and other sources. We call this context engineering, and it makes a big impact on the results you generate when using Claude Code or in building your own agents.

但当你给 Claude 发消息时，提示词只是 Claude 所获上下文中的一小部分。大部分上下文来自系统提示词、Skills、CLAUDE.md 文件、记忆和其他来源的组装。我们称之为**上下文工程**，它对你使用 Claude Code 或构建自建智能体时产生的结果影响巨大。

Unlike a prompt, context is used generally across many requests, so it cannot be as specific. How do you build these general prompts and guidance for Claude, especially when you don't know what a user's prompt might be?

与提示词不同，上下文是跨多个请求通用的，因此不能过于具体。你该如何构建这些通用的提示词和引导，尤其是在你无法预知用户会输入什么提示词的情况下？

This can be surprisingly difficult as Claude's own capabilities evolve. Most recently, we noticed a large jump in the way we prompt the newest generation of Claude models. We removed over 80% of Claude Code's system prompt for models like Claude Opus 5 and Claude Fable 5 with no measurable loss on our coding evaluations.

随着 Claude 自身能力的进化，这个问题会变得出人意料地困难。最近，我们注意到新一代 Claude 模型的提示方式发生了巨大飞跃。我们为 Claude Opus 5 和 Claude Fable 5 等模型删除了 Claude Code 超过 80% 的系统提示词，且在编码评测中没有任何可测量的损失。

Here's what we've learned about prompting this new class of models, and how you can utilize it to update your context engineering. We've put these best practices in `claude doctor;` use the command /doctor in Claude Code to rightsize your skills, and CLAUDE.md files.

以下是我们为这类新式模型总结的提示经验，以及如何利用这些经验升级你的上下文工程。我们将这些最佳实践内置到了 `claude doctor` 中——在 Claude Code 中使用 `/doctor` 命令即可精简你的 Skills 和 CLAUDE.md 文件。

---

## Unhobbling Claude

Overall, we found that we were overconstraining Claude Code, both through our system prompt and in our CLAUDE.md files and skills.

## 为 Claude 松绑

总的来说，我们发现我们在系统提示词、CLAUDE.md 文件和 Skills 中**过度约束**了 Claude Code。

For example, when we read transcripts of our own internal usage of Claude Code, we see several conflicting messages in a single request like "leave documentation as appropriate," or "DO NOT add comments" as our system prompt, skills, and user requests clash with each other.

例如，在阅读我们团队内部使用 Claude Code 的对话记录时，我们发现单次请求中存在多条相互矛盾的指令——比如"适当保留文档"和"不要添加注释"——这是因为系统提示词、Skills 和用户请求中的指令彼此冲突。

Generally, Claude can interpret the user's intent to get to the right answer, but Claude must think more carefully about these overlapping and conflicting messages before deciding what to do.

一般来说，Claude 能够解读用户意图并找到正确答案，但它必须更加仔细地思考这些重叠且矛盾的指令，才能决定该怎么做。

And while these constraints were once needed to avoid worst case scenarios, we have since found we can delete many of them and let the model use surrounding context and judgement instead.

尽管这些约束曾经是防止最坏情况的必需手段，但我们现在发现可以删除其中很多条，让模型自己根据上下文和判断力来决定。

Additionally, Claude Code now has many more tools. Claude used to rely on CLAUDE.md as a source of memory, information, and guidance. Now we have memory, artifacts, and skills, which Claude can use to create new ways of loading and sharing context across sessions.

此外，Claude Code 现在拥有更多工具。Claude 过去依赖 CLAUDE.md 作为记忆、信息和指引的来源。如今我们有了记忆、Artifacts 和 Skills，Claude 可以利用它们创建跨会话加载和共享上下文的新方式。

---

## Then and now

There were a number of previous context engineering best practices that had become myths. Including:

## 过去 vs 现在

许多曾经被视为上下文工程最佳实践的做法，如今已被证明是迷思。以下逐一来看：

---

### Then: Give Claude rules

### Now: Let Claude use judgement

### 过去：给 Claude 定规则

### 现在：让 Claude 用判断

When we first rolled out Claude Code, we needed to be sure that Claude avoided worst case scenarios, such as deleting files. This meant we would give particularly strong guidance that might not always be true. For example, in the system prompt we used to say:

最初推出 Claude Code 时，我们必须确保 Claude 避免最坏情况，比如误删文件。这意味着我们会给出特别强的指导，哪怕这些指导意见并非始终正确。例如，系统提示词中曾这样写：

In code: default to writing no comments. Never write multi-paragraph docstrings or multi-line comment blocks — one short line max. Don't create planning, decision, or analysis documents unless the user asks for them — work from conversation context, not intermediate files.

在代码中：默认不写注释。永远不要编写多段文档字符串或多行注释块——最多一行短注释。除非用户要求，否则不要创建计划、决策或分析文档——直接基于对话上下文工作，不要依赖中间文件。

But for a certain subset of prompts, this guidance would be wrong. In the case of documentation, the user may have their own preferences, or specific parts of very complex code might need multi-line comment blocks.

但对于某些提示词场景，这种指导反而是错误的。在编写文档时，用户可能有自己的偏好，或者某些极其复杂的代码段确实需要多行注释块。

Still, without these guardrails for older models, the comments Claude wrote would be incorrect in many cases and we had to accept this tradeoff. But newer models have better judgement and can handle these decisions well without explicit rules.

然而对旧模型而言，没有这些护栏，Claude 写的注释在很多情况下会出错，我们不得不接受这种取舍。但新模型具有更好的判断力，无需显式规则就能很好地处理这些决策。

In the new system prompt we say: Write code that reads like the surrounding code: match its comment density, naming, and idiom.

在新的系统提示词中，我们只写：编写与周围代码风格一致的代码：匹配其注释密度、命名方式和惯用写法。

---

### Then: Give Claude examples

### Now: Design interfaces

### 过去：给 Claude 示例

### 现在：设计好接口

The number one rule for tool usage was to give Claude examples on how to use them. With our newest models, we've found that giving examples actually constrains them to a certain exploration space.

过去关于工具使用的头号法则是给 Claude 提供使用示例。但我们对最新模型的研究发现，提供示例实际上会限制它们的探索空间。

Instead of using examples, think more about the design of your tools, scripts and files — what parameters does Claude have and how can they be more expressive?

与其提供示例，不如多花心思设计你的工具、脚本和文件——Claude 有哪些可用参数？如何让它们更具表达力？

For example, in the Todo tool example, just listing status as an enumeration between pending, in_progress, and completed, hints to Claude about how to use it. The instruction on keeping one item in_progress helps define our requested behavior.

例如，在 Todo 工具中，仅将状态枚举为 `pending`、`in_progress` 和 `completed`，就足以向 Claude 暗示如何使用它。保持一项任务为 `in_progress` 的指令，有助于定义我们期望的行为。

---

### Then: Put it all upfront

### Now: Use progressive disclosure

### 过去：一次性全塞进去

### 现在：用渐进式披露

Because Claude Code was focused on coding, our system prompt included detailed information on how to do code review and verification. These were not always needed, but when they were, it was crucial information.

由于 Claude Code 专注于编程，我们的系统提示词中包含有关如何进行代码审查和验证的详细信息。这些信息并非总是需要，但一旦需要，就是至关重要的信息。

Since then, Claude Code has gotten very competent at using progressive disclosure — loading the right context at the right times. For example, we moved verification and code review into their own skills that Claude Code could selectively call.

自那以后，Claude Code 已经非常擅长使用渐进式披露——在恰当的时机加载恰当的上下文。例如，我们将验证和代码审查移入了各自的 Skill 中，Claude Code 可以选择性地调用。

But progressive disclosure is not just for skills, we also use it for tools. Some of our tools are 'deferred loading,' which means the agent must search for their full definitions using ToolSearch before using them. This allows us to have more tools (such as our Task tools) that don't take up context until they're needed.

但渐进式披露不仅适用于 Skills，我们也将其用于工具。部分工具采用"延迟加载"——智能体必须先用 ToolSearch 搜索其完整定义，然后才能使用。这样我们就能拥有更多工具（如 Task 工具），它们在需要时才占用上下文。

The same can be applied to your own CLAUDE.md and Skill.md files. A common myth is that you want to make these a central repository for every known practice that you might run into, because Claude would not find it otherwise. Instead, consider having a tree of files that can be loaded at the right time.

同样的原则也适用于你自己的 CLAUDE.md 和 Skill.md 文件。一个常见迷思是：你应该把它们变成一个中央仓库，囊括所有可能遇到的实践方法，因为不这样做 Claude 就找不到。事实上，你应该考虑构建一棵文件树，让每个文件在恰当的时机被加载。

---

### Then: Repeat yourself

### Now: Simple tool descriptions

### 过去：重复强调

### 现在：简洁的工具描述

Earlier Claude models could sometimes need repeated instructions or be more likely to listen to instructions at the end of their context window than at the start. This meant our system prompt would sometimes have references to tools in the main system prompt as well as instructions in the tool description.

早期的 Claude 模型有时需要重复指令，或者更倾向于听从上下文窗口末尾而非开头的指令。这意味着我们的系统提示词正文中有时会提到工具用法，同时工具描述里也有同样的指令。

We found we could delete these repeat examples and put instructions on how to use tools in the tool descriptions rather than the system prompt.

我们发现可以删除这些冗余内容，将工具使用说明只放在工具描述中，而非系统提示词里。

---

### Then: Memory in CLAUDE.md files

### Now: Auto-memory

### 过去：在 CLAUDE.md 里记东西

### 现在：自动记忆

We used to encourage users to save things to Claude's memory, by using the # hotkey to write to their CLAUDE.md automatically. Instead, Claude now automatically saves memories that are relevant to the work and to you.

我们过去鼓励用户通过 `#` 快捷键将内容自动写入 CLAUDE.md 来保存到 Claude 的记忆中。而现在，Claude 会**自动保存**与你和工作相关的记忆。

---

### Then: Simple specs

### Now: Rich references

### 过去：简单的规格文档

### 现在：丰富的引用形式

In plan mode, Claude Code has heavily relied on markdown files with plans. Storing these files as plans helped Claude refer to them when needed. Another similar best practice was to store specs in the codebase for Claude to refer to while working across longer projects.

在计划模式下，Claude Code 严重依赖带计划的 Markdown 文件。将这些文件保存为计划有助于 Claude 在需要时引用。另一个类似的最佳实践是将规格说明存放到代码库中，供 Claude 在长项目中引用。

But we've found that Claude can handle increasingly more complicated references. Instead of simple markdown files, Claude can reference HTML artifacts created by our new artifacts feature.

但我们发现，Claude 已经能处理越来越复杂的引用格式。除了简单的 Markdown 文件，Claude 还可以引用新 Artifacts 功能创建的 HTML 工件。

You may also give Claude references in the form of code. A spec may also be a detailed test suite, or a function in a different codebase that Claude might port.

你还可以用代码形式给 Claude 提供引用。一份规格说明可以是详细的测试套件，也可以是另一个代码库中 Claude 需要移植的函数。

Rubrics are another form of references. Rubrics allow Claude to try and verify your taste in a particular field (e.g. what does a good API design look like) by using dynamic workflows and spinning up verifier agents with those rubrics.

评定标准（Rubrics）是另一种引用形式。它让 Claude 能够通过动态工作流，利用这些评定标准启动验证智能体，来尝试和核验你在特定领域的品味——比如「良好的 API 设计长什么样」。

---

## Applying this to your context

Pulling this all together, what does this look like when you assemble your context?

## 如何应用到你的上下文

将以上理念融会贯通之后，具体到每一项上下文组件，应该怎么做？

---

### System Prompt

A system prompt is heavily tied to the product context. It tells Claude what product it's operating in and what it's doing. For Claude Code, you will likely never modify this, but if you are building your own agent harness, this is where you should spend a lot of time.

### 系统提示词

系统提示词与产品上下文紧密绑定。它告诉 Claude 自己在什么产品中运行，正在做什么。对于 Claude Code，你基本不需要修改它，但如果你在构建自己的智能体编排框架，这里就是你应该花大量精力打磨的地方。

---

### CLAUDE.md

Keep your CLAUDE.md lightweight and briefly describe what your repo is for, but spend most of the tokens on gotchas inside of the codebase. For example, you may organize your code to keep types in one monolithic file and nowhere else. Avoid stating 'the obvious' things Claude should know by looking at your file system or your repo.

### CLAUDE.md

保持 CLAUDE.md 精简，简单说明仓库用途即可，但把大部分 Token 花在描述代码库中的"暗坑"上。例如，你的代码可能把类型定义全部集中在一个巨大文件中，而不是分散在各处。避免陈述 Claude 一眼就能从文件系统和仓库结构看出的"显然之事"。

Use progressive disclosure heavily, for example if you have several unique instructions on how to verify your work, create a verification skill and reference it from your CLAUDE.md.

**大量使用渐进式披露**——例如，如果你有若干关于如何验证工作的独特指令，就创建一个验证 Skill，并在 CLAUDE.md 中引用它。

---

### Skills

Think of skills as lightweight guides to let Claude find information when needed. Avoid making them overconstrained, except in highly important areas.

### Skills

将 Skills 视为轻量级指南，让 Claude 在需要时查找信息。避免让它们过度约束，除非在极其重要的领域。

For long skills, try and use progressive disclosure as much as possible — divide it into many files and split them out.

对于较长的 Skill，尽可能使用渐进式披露——拆分成多个文件，分别存放。

It's best when skills encode particular opinions, knowledge, or best practices that are particular to you, your team, or product.

Skills 最适合用来编码特定于你、你的团队或产品的观点、知识或最佳实践。

---

### References

You can @ mention files to include them as references. References allow Claude to refer to in-depth information about the current plan.

### References（引用）

你可以通过 `@` 提及文件将其纳入引用。引用让 Claude 能够参考有关当前计划的深度信息。

This might be in specs files, mockups, or even entire codebases. Generally you should prefer files that are in code as it provides clear, high-fidelity instructions to Claude in a language it knows very well. For example, a HTML mockup of a design will generally produce better results than a description of the design or a screenshot.

这些引用可以是规格文件、设计稿，甚至整个代码库。一般来说，你应该优先使用代码文件，因为代码为 Claude 提供了用其最熟悉语言编写的清晰、高保真指令。例如，一份 HTML 设计稿通常比一段文字描述或一张截图产生更好的效果。

---

## Try simplifying

Across your system prompt, CLAUDE.md, and skills — take advantage of the increased judgement of the newer generation models. An agent should be as unconstrained as possible, except where constraints are strictly necessary.

## 尝试做减法

在你的系统提示词、CLAUDE.md 和 Skills 中——充分利用新一代模型增强的判断力。智能体应该尽可能不受约束，仅在约束绝对必要的地方施加限制。

---

## 📚 英语学习笔记

### 重点句式

**1. What/How 引导的名词性从句作主语**
What we've learned about prompting this new class of models, and how you can utilize it to update your context engineering.

- **结构分析**：`What we've learned about X` 是主语从句，"关于 X 我们所学到的东西"；`and how you can utilize it to do Y` 是并列主语从句，"以及你如何利用它来做 Y"。整句的主干是 `What we've learned... and how you can... [is here]`。
- **可套用**：What we've learned about managing remote teams, and how you can apply it to your own workflow, is summarized in this guide.（我们关于管理远程团队的经验，以及你如何将其应用到自己的工作流中，已总结在本指南中。）

**2. 对比状语从句 + 主句递进（while... , ...）**
And while these constraints were once needed to avoid worst case scenarios, we have since found we can delete many of them and let the model use surrounding context and judgement instead.

- **结构分析**：`while` 引导让步状语从句（虽然/尽管），主句 `we have since found` 后接宾语从句 `we can delete... and let...`。`instead` 放在句末表示替代方案。整句表达"虽然过去需要 X，但现在我们可以做 Y"的转折递进。
- **可套用**：While manual testing was once the standard approach, we have since found we can automate most of it and let engineers focus on edge cases instead.（虽然手动测试曾是标准做法，但我们现在发现可以自动化其中大部分，让工程师转而专注于边缘情况。）

**3. 强调句式 + 非限制性定语从句**
It's best when skills encode particular opinions, knowledge, or best practices that are particular to you, your team, or product.

- **结构分析**：`It's best when X` 是一个简化强调句，表示"当 X 时效果最好"。`that are particular to...` 是定语从句修饰前面的三个名词。`particular to` 是固定搭配，表示"特定于……的"。
- **可套用**：It's best when documentation captures decisions, tradeoffs, or constraints that are specific to your architecture.（当文档记录了特定于你架构的决策、权衡或约束时，效果最好。）

**4. 比较级 + 被动语态表建议**
An agent should be as unconstrained as possible, except where constraints are strictly necessary.

- **结构分析**：`as + 形容词 + as possible` 固定结构表示"尽可能……"；`except where` 引入例外条件从句。这是一个简洁有力的总结句式。
- **可套用**：A code review should be as concise as possible, except where deeper analysis is strictly necessary.（代码审查应尽可能简洁，除非深入分析是绝对必要的。）

### 语法精讲

**1. 非谓语动词：现在分词作结果状语**
This allows us to have more tools that don't take up context until they're needed.

- **规则**：现在分词短语放在句末可表示自然而然的结果，常用结构为 `..., doing sth` 或 `..., allowing/suggesting/indicating that...`。
- **为什么用在这里**：文中 `allowing us to have more tools...` 本身就是一个现在分词作结果状语的例子，虽然它在引文中被改写。另一个体现文中风格的例子：`... might not always be true. This meant we would give particularly strong guidance...`——这里用 `meaning` 而非 `which means` 是技术写作中常见的分词简写。
- **常见错误**：混淆分词逻辑主语。分词的结果状语默认逻辑主语是主句主语，如果主语不一致会造成悬垂分词（dangling participle）。

**2. not...unless 双重否定结构**
Don't create planning, decision, or analysis documents unless the user asks for them.

- **规则**：`not... unless` = `only... if`（只有……才……），是一种强调条件的委婉表达。`Don't do X unless Y` = "除非 Y 发生，否则不要做 X"。
- **为什么用在这里**：旧版系统提示词用这个结构来设置保险丝——既禁止了行为，又保留了例外。新版则完全移除了这种硬约束。
- **常见错误**：将 `unless` 和 `if...not` 混淆。`unless` 通常暗示"例外情况较少发生"，而 `if...not` 更中性。

**3. 虚拟语气：would + 过去式（含蓄条件）**
A common myth is that you want to make these a central repository for every known practice that you might run into, because Claude would not find it otherwise.

- **规则**：`would not ... otherwise` 是含蓄虚拟条件句，`otherwise` 代替了 `if you didn't do this` 的条件从句。意为"如果不这样做，Claude 就找不到"。
- **为什么用在这里**：作者用它来呈现一种普遍的错误观念，不引入具体的 if 从句使表达更简洁。
- **常见错误**：在 `otherwise` 前忘记用 `would/could/might`，而用了 will/can（陈述语气），这会失去虚拟语气"假设性"的含义。

### 地道表达

| 原文                   | 含义               | 用法说明                                                                                                            |
| ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| unhobbling             | 解除束缚、松绑     | 源自 hobble（束缚、跛行），加上 un- 前缀表示"解除束缚"。形象化表达，暗指之前的做法限制了 Claude 的能力发挥          |
| worst case scenarios   | 最坏情况           | 技术写作高频词，通常指灾难性失败场景，如误删数据、向用户发送错误消息等                                              |
| no measurable loss     | 无任何可测量的损失 | 一种精准的量化表述，强调差异小到无法被评测体系捕捉，比 simply "no loss" 更具说服力                                  |
| progressive disclosure | 渐进式披露         | UX/工程术语，指按需逐步揭示信息的设计模式。近义词为 "lazy loading"，但指代范围更广                                  |
| rightsize              | 精简化、适量化     | 动名词演变而来的动词，表示"把……调整到合适的规模"。"right-size your skills" 即删掉冗余、保留精华                     |
| take up context        | 占用上下文         | 指内容消耗有限的上下文窗口 Token 配额。`don't take up context` 即"不占上下文空间"                                   |
| spinning up            | 启动、拉起         | 运维领域常用表达，指快速创建并启动一个实例/进程。`spinning up verifier agents` = "拉起验证智能体"                   |
| at the right times     | 在恰当时机         | 强调时机的重要性，与 `at the right places`（在恰当位置）、`to the right people`（给对的人）同属信息传递的经典三要素 |

---

**译者注**：本文是 Anthropic 在 Claude 5 代模型发布后的一次重要方法论更新。文中的核心观点——"少即是多"的上下文工程哲学——对任何使用 AI 编程工具或构建智能体的开发者都有直接参考价值。建议配合 `/doctor` 命令实际精简自己的 CLAUDE.md 和 Skills，亲身体验文中描述的判断力提升。
