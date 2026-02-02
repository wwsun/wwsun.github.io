---
title: Writing a good CLAUDE.md
source: https://www.humanlayer.dev/blog/writing-a-good-claude-md
author:
published: 2025-11-25
created: 2025-12-01
description: "`CLAUDE.md` is a high-leverage configuration point for Claude Code. Learning how to write a good `CLAUDE.md` (or `AGENTS.md`) is a key skill for agent-enabled software engineering."
tags:
  - clippings
  - claude
---
*Note: this post is also applicable to `AGENTS.md`*, the open-source equivalent of `CLAUDE.md` for agents and harnesses like OpenCode, Zed, Cursor and Codex.

## Principle: LLMs are (mostly) stateless

LLMs are stateless functions. Their weights are frozen by the time they're used for inference, so they don't learn over time. The only thing that the model knows about your codebase is the tokens you put into it.

Similarly, coding agent harnesses such as Claude Code usually require you to manage agents' memory explicitly. `CLAUDE.md` (or `AGENTS.md`) is the only file that by default goes into *every single conversation* you have with the agent.

**This has three important implications:**

1. Coding agents know absolutely nothing about your codebase at the beginning of each session.  
	编码代理在每次会话开始时对你的代码库一无所知。
2. The agent must be told anything that's important to know about your codebase each time you start a session.  
	每次开始会话时，必须告知代理有关你的代码库所有重要信息。
3. `CLAUDE.md` is the preferred way of doing this.  
	`CLAUDE.md` 是推荐的做法。

## CLAUDE.md 将 Claude 引导进入你的代码库


由于 Claude 在每次会话开始时对你的代码库一无所知，你应该使用 `CLAUDE.md` 将 Claude 引导进入你的代码库。总体来说，这意味着它应该涵盖以下内容：

- **WHAT**: 做什么：告诉 Claude 有关技术、你的技术栈、项目结构的信息。为 Claude 提供代码库的地图。这在 monorepos 中尤为重要！告诉 Claude 有哪些应用、哪些是共享包，以及每个部分的用途，这样它才能知道去哪里查找相关内容。
- **WHY**: 为什么：告诉 Claude 这个项目的目的，以及代码仓库中每个部分的作用。项目中不同部分的目的和功能是什么？
- **HOW**: 方法：告诉 Claude 在项目中应该如何工作。例如，你是否使用 `bun` 而不是 `node` ？你需要包含所有让它能够在项目中真正发挥作用的信息。Claude 如何验证自己的更改？它如何运行测试、类型检查和编译步骤？

但你采用的方式很重要！不要试图把 Claude 可能需要运行的所有命令都塞进你的 `CLAUDE.md` 文件——这样会导致效果不佳。

## Claude 经常忽略 CLAUDE.md


无论你使用的是哪种模型，你可能会注意到 Claude 经常忽略你的 `CLAUDE.md` 文件内容。


你可以通过在 claude code CLI 和 Anthropic API 之间使用 `ANTHROPIC_BASE_URL` 放置一个日志代理，自己进行调查。Claude code 会在用户消息中将以下系统提醒与您的 `CLAUDE.md` 文件一起注入到代理中：

```
<system-reminder>
      IMPORTANT: this context may or may not be relevant to your tasks. 
      You should not respond to this context unless it is highly relevant to your task.
</system-reminder>
```


因此，如果 Claude 认为你的 `CLAUDE.md` 文件内容与当前任务无关，它就会忽略这些内容。你在文件中包含的信息越多，而这些信息并非适用于所有任务，Claude 就越有可能忽略你在文件中的指令。


Anthropic 为什么要这样做？很难确定，但我们可以稍作推测。我们遇到的大多数 `CLAUDE.md` 文件都包含了一堆并不广泛适用的指令。许多用户把这个文件当作添加“热修复”的方式，通过追加大量并不一定广泛适用的指令来修正他们不喜欢的行为。


我们只能假设 Claude Code 团队发现，通过让 Claude 忽略错误的指令，测试工具实际上产生了更好的结果。

## 创建一个优秀的 CLAUDE.md 文件

The following section provides a number of recommendations on how to write a good `CLAUDE.md` file following [context engineering best practices](https://github.com/humanlayer/12-factor-agents/blob/d20c728368bf9c189d6d7aab704744decb6ec0cc/content/factor-03-own-your-context-window.md).  
以下部分将提供一些建议，帮助你按照上下文工程的最佳实践编写优秀的 `CLAUDE.md` 文件。

实际效果可能因人而异。并非所有规则都适用于每一种设置。就像其他事情一样，偶尔打破规则也无妨……

1. you understand when & why it's okay to break them  
	你明白什么时候以及为什么可以打破这些规则
2. you have a good reason to do so  
	你有充分的理由这样做

### 少即是多（指令）

你可能会忍不住想把 Claude 可能需要运行的每一个命令，以及你的代码标准和风格指南都塞进 `CLAUDE.md` 。我们建议不要这样做。


虽然这个话题还没有被极其严谨地研究过，但已有一些研究表明如下结论：

1. **Frontier thinking LLMs can follow ~ 150-200 instructions with reasonable consistency.** Smaller models can attend to fewer instructions than larger models, and non-thinking models can attend to fewer instructions than thinking models.  
	前沿思维型大语言模型（LLM）能够以较高的一致性遵循约 150-200 条指令。较小的模型能处理的指令数量比大型模型少，非思维型模型能处理的指令数量也比思维型模型少。
2. **Smaller models get MUCH worse, MUCH more quickly**. Specifically, smaller models tend to exhibit an expotential decay in instruction-following performance as the number of instructions increase, whereas larger frontier thinking models exhibit a linear decay (see below). For this reason, we recommend against using smaller models for multi-step tasks or complicated implementation plans.  
	较小的模型性能下降得非常快，且幅度很大。具体来说，随着指令数量的增加，较小的模型在遵循指令方面通常呈指数级衰减，而较大的前沿思维型模型则呈线性衰减（见下文）。因此，我们不建议在多步骤任务或复杂实施方案中使用较小的模型。
3. **LLMs bias towards instructions that are on the peripheries of the prompt**: at the very beginning (the Claude Code system message and `CLAUDE.md`), and at the very end (the most-recent user messages)  
	大语言模型倾向于优先处理提示内容边缘的指令：即最开始的（Claude Code 系统消息和 `CLAUDE.md` ），以及最后的（最新的用户消息）。
4. **As instruction count increases, instruction-following quality decreases uniformly**. This means that as you give the LLM more instructions, it doesn't simply ignore the newer ("further down in the file") instructions - it begins to **ignore all of them uniformly**  
	随着指令数量的增加，遵循指令的质量会均匀下降。这意味着，当你给大语言模型更多指令时，它并不会只忽略较新的（文件后面的）指令——而是开始均匀地忽略所有指令。

![Instruction following](https://www.humanlayer.dev/blog/writing-a-good-claude-md/instructionfollowing.png)


我们对 Claude Code 工具的分析表明，Claude Code 的系统提示包含大约 50 条单独的指令。根据你所使用的模型，这几乎已经占据了你的代理能够可靠遵循的指令总数的三分之一——而这还没有包括规则、插件、技能或用户消息。

This implies that your `CLAUDE.md` file should contain as few instructions as possible - ideally only ones which are universally applicable to your task.  
这意味着你的 `CLAUDE.md` 文件应包含尽可能少的指令——理想情况下，只包含对你的任务普遍适用的指令。

### CLAUDE.md 文件长度与适用性

在其他条件相同的情况下，当大语言模型的上下文窗口中充满了专注且相关的内容（包括示例、相关文件、工具调用和工具结果）时，其在任务上的表现会优于上下文窗口中充斥大量无关内容的情况。

由于 `CLAUDE.md` 会进入每一个会话，你应确保其内容尽可能具有普遍适用性。


例如，避免包含关于如何构建新的数据库架构的说明——当你在处理其他无关的任务时，这些内容既不重要，还会分散模型的注意力！

在长度方面，“少即是多”的原则同样适用。虽然 Anthropic 没有对你的 `CLAUDE.md` 文件长度给出官方建议，但普遍认为少于 300 行是最好的，越短越好。

在 HumanLayer，我们的根 `CLAUDE.md` 文件不到六十行。

### 逐步披露

编写一份简明的 `CLAUDE.md` 文件，涵盖你希望 Claude 了解的所有内容，尤其是在大型项目中，可能会颇具挑战。

为了解决这个问题，我们可以利用“渐进式披露”原则，确保 Claude 只在需要时看到与任务或项目相关的指令。


我们建议不要把所有关于构建项目、运行测试、代码规范或其他重要上下文的不同指令都放在 `CLAUDE.md` 文件中，而是将与任务相关的指令保存在项目中的其他具有自描述性名称的独立 markdown 文件里。

For example:例如：

```
agent_docs/
  |- building_the_project.md
  |- running_tests.md 
  |- code_conventions.md
  |- service_architecture.md
  |- database_schema.md
  |- service_communication_patterns.md
```


然后，在你的 `CLAUDE.md` 文件中，你可以包含这些文件的列表，并为每个文件添加简要说明，并指示 Claude 决定哪些（如果有）是相关的，并在开始工作前阅读它们。或者，你也可以让 Claude 在阅读这些文件之前，先将它想要阅读的文件列表呈现给你审批。

**Prefer pointers to copies**. Don't include code snippets in these files if possible - they will become out-of-date quickly. Instead, include `file:line` references to point Claude to the authoritative context.  
优先使用指针而非复制。如果可能，请不要在这些文件中包含代码片段——它们很快就会过时。相反，请包含 `file:line` 引用，将 Claude 指向权威的上下文。

Conceptually, this is very similar to how [Claude Skills](https://code.claude.com/docs/en/skills) are intended to work, although skills are more focused on tool use than instructions.  
从概念上讲，这与 Claude Skills 的设计初衷非常相似，尽管 Skills 更侧重于工具的使用而非指令。

### Claude（不是）一个昂贵的代码检查器

我们经常看到人们在他们的 `CLAUDE.md` 文件中加入代码风格指南。千万不要让 LLM 去做代码检查工具的工作。与传统的代码检查器和格式化工具相比，LLM 不仅成本高昂，而且速度极慢。我们认为，只要有可能，你都应该优先使用确定性的工具。

代码风格指南不可避免地会在你的上下文窗口中添加大量指令和大多无关的代码片段，这会降低你的大语言模型（LLM）的性能和指令遵循能力，并占用你的上下文窗口。

LLM 是上下文学习者！如果你的代码遵循某一套风格指南或模式，你应该会发现，只需对你的代码库进行几次搜索（或者有一份好的研究文档！），你的智能体通常会自发遵循现有的代码模式和约定，而无需特别告知。

If you feel very stronly about this, you might even consider setting up a [Claude Code `Stop` hook](https://code.claude.com/docs/en/hooks#stop) that runs your formatter & linter and presents errors to Claude for it to fix. Don't make Claude find the formatting issues itself.  
如果你对此非常在意，甚至可以考虑设置一个 Claude Code `Stop` hook，运行你的格式化工具和 linter，并将错误反馈给 Claude 让其修复。不要让 Claude 自己去发现格式问题。

加分项：使用可以自动修复问题的 linter（我们喜欢 Biome），并仔细调整哪些规则可以安全地自动修复，以实现最大（且安全）的覆盖率。

You could also create a [Slash Command](https://code.claude.com/docs/en/slash-commands) that includes your code guidelines and which points claude at the changes in version control, or at your `git status`, or similar. This way, you can handle implementation and formatting separately. **You will see better results with both as a result**.  
你也可以创建一个包含你的代码规范的斜杠命令，并让 Claude 关注版本控制中的更改，或者你的 `git status` ，或类似内容。通过这种方式，你可以分别处理实现和格式化。这样，你会在两方面都获得更好的效果。

### 不要使用 /init 或自动生成你的 CLAUDE.md

Both Claude Code and other harnesses with OpenCode come with ways to auto-generate your `CLAUDE.md` file (or `AGENTS.md`).  
Claude Code 和其他带有 OpenCode 的工具都提供了自动生成你的 `CLAUDE.md` 文件（或 `AGENTS.md` ）的方法。

Because `CLAUDE.md` goes into *every single session* with Claude code, it is one of **the highest leverage points of the harness** - for better or for worse, depending on how you use it.  
因为 `CLAUDE.md` 会进入每一个 Claude 代码的会话中，所以它是工具中最具影响力的环节之一——无论好坏，这取决于你的使用方式。

一行糟糕的代码就是一行糟糕的代码。一行糟糕的实现计划可能会导致许多糟糕的代码。一行对系统运作方式理解错误的研究，可能会导致计划中出现许多糟糕的内容，从而最终产生更多糟糕的代码。


但是 `CLAUDE.md` 文件会影响你工作流程中的每一个阶段，以及由此产生的每一个成果。因此，我们认为你应该花些时间，认真思考其中的每一行内容。

![Leverage](https://www.humanlayer.dev/blog/writing-a-good-claude-md/leverage.png)

## 总结

1. `CLAUDE.md` 用于将 Claude 引入你的代码库。它应当定义你的项目的原因（WHY）、内容（WHAT）和方式（HOW）。
2. 说明越少越好。虽然你不应省略必要的说明，但应尽可能合理地减少文件中的说明数量。
3. 保持 `CLAUDE.md` 的内容简明扼要，并具有普遍适用性。
4. 采用渐进式披露——不要一次性告诉 Claude 所有你希望它知道的信息。相反，告诉它如何查找重要信息，这样它只有在需要时才会查找和使用，从而避免上下文窗口或说明数量的膨胀。
5. Claude is not a linter. Use linters and code formatters, and use other features like [Hooks](https://code.claude.com/docs/en/hooks) and [Slash Commands](https://code.claude.com/docs/en/slash-commands) as necessary.  
	Claude 不是代码检查工具。请使用代码检查工具和代码格式化工具，并根据需要使用其他功能，如 Hooks 和斜杠命令。
6. `CLAUDE.md` 是测试工具中最具影响力的部分，因此请避免自动生成它。你应该仔细编写其内容，以获得最佳效果。