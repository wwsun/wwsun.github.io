---
title: AI 应该帮助我们产出更好的代码
description: AI should help us produce better code - Agentic Engineering Patterns
source: https://simonwillison.net/guides/agentic-engineering-patterns/better-code/
author:
  - "[[Simon Willison]]"
tags:
  - clippings
---

许多开发者担心将代码外包给 AI 工具会导致质量下降，产生糟糕的代码，但由于产出速度够快，决策者愿意忽视其缺陷。

如果采用编码代理明显降低了你正在产出的代码和功能的质量，你应该直接解决这个问题：找出流程中哪些环节在损害输出质量并修复它们。

用代理发布更差的代码是一个**选择**。我们可以选择发布[更好的代码](https://simonwillison.net/guides/agentic-engineering-patterns/code-is-cheap/#good-code)。

---

## 避免承担技术债务

我喜欢从技术债务的角度来思考发布更好的代码。我们承担技术债务是权衡的结果："用正确的方式"做事需要太长时间，所以我们在面临的时间限制内工作，并祈祷项目能撑到以后偿还债务。

技术债务最好的缓解方式就是一开始就避免承担它。

根据我的经验，一类常见的技术债务修复是简单但耗时的改动。

- 我们最初的 API 设计没有涵盖后来出现的重要场景。修复该 API 需要在几十个不同的地方修改代码，因此添加一个略有不同的新 API 并忍受重复会更快。
- 我们早期对一个概念的命名选择不佳——比如用 teams 而不是 groups——但在代码中清理这个术语的工作量太大，所以我们只在 UI 中修复它。
- 我们的系统随着时间推移产生了重复但略有不同的功能，需要合并和重构。
- 我们的某个文件已经增长到几千行代码，理想情况下应该拆分成独立的模块。

所有这些改动在概念上都很简单，但仍需要专门投入时间，而这在面临更紧迫的问题时很难证明其合理性。

---

## 编码代理可以为我们处理这些

这类重构任务是编码代理的**理想**应用场景。

启动一个代理，告诉它要改什么，然后让它在分支或工作树中后台运行。

我通常为此使用异步编码代理，如 [Gemini Jules](https://jules.google.com/)、[OpenAI Codex web](https://developers.openai.com/codex/cloud/) 或 [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)。这样我可以在笔记本电脑上不被打断地运行这些重构任务。

在 Pull Request 中评估结果。如果很好，就合并。如果接近目标，就提示它并告诉它哪里做得不同。如果很差，就扔掉。

这些代码改进的成本已经降到如此低的水平，以至于我们可以对轻微的代码异味和不便采取零容忍态度。

---

## AI 工具让我们能考虑更多选项

任何软件开发任务都有大量解决问题的方法可选。一些最重大的技术债务来自于在规划步骤中做出糟糕的选择——错过明显的简单解决方案，或者选择的技术后来证明并不是最合适的。

LLM 可以帮助确保我们不会错过任何可能之前没注意到的明显解决方案。它们只会建议训练数据中常见的解决方案，但这些往往是[无聊的技术](https://boringtechnology.club/)，最有可能奏效。

更重要的是，编码代理可以帮助进行**探索性原型设计**。

做出有把握的技术选择的最佳方式是用原型证明它们适合用途。

Redis 是否适合预期有数千并发用户的网站的活动流？

确定的最佳方式是搭建该系统的模拟并对其进行负载测试，看看什么会出问题。

编码代理可以用单个精心设计的提示构建这种模拟，将这类实验的成本降到几乎为零。而且由于它们如此便宜，我们可以同时运行多个实验，测试多个解决方案以挑选最适合我们问题的那个。

---

## 拥抱复合工程循环

代理遵循指令。我们可以根据之前学到的经验，随时间演化这些指令以获得更好的结果。

Every 公司的 Dan Shipper 和 Kieran Klaassen 描述他们公司使用编码代理的方法为[复合工程](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents)。他们完成的每个编码项目都以回顾结束，他们称之为**复合步骤**，在那里他们将有效的方法记录下来供未来的代理运行使用。

如果我们想要从代理中获得最佳结果，我们应该致力于持续提高代码库的质量。小的改进会复合。曾经耗时的质量提升现在成本已经降到没有理由不在发布新功能的同时投资质量的程度。编码代理意味着我们终于可以两者兼得。

---

_原文：[AI should help us produce better code - Agentic Engineering Patterns](https://simonwillison.net/guides/agentic-engineering-patterns/better-code/)_  
_作者：Simon Willison_
