---
title: "Codex 手册：OpenAI 编程平台实用指南（翻译）"
description: "freeCodeCamp 发布的 OpenAI Codex 使用手册中文翻译"
tags:
  - openai
  - codex
  - ai-coding
  - clippings
source: "https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/"
created: 2026-05-12
---

![Image 1: The Codex Handbook: A Practical Guide to OpenAI's Coding Platform](https://cdn.hashnode.com/uploads/covers/5e1e335a7a1d3fcc59028c64/e558d0da-b13d-4fce-90de-9ef1e818fcff.png)

本手册面向希望了解 Codex 是什么、如何设置、如何高效使用、它与通用模型的区别以及当前定价方式的开发者、团队负责人和管理员。

内容基于当前 OpenAI Codex 官方文档和帮助中心文章。定价和计划可用性变动频繁，因此请将定价部分视为当前文档的快照，并在做出采购决策前对照官方链接进行核实。

**最新动态（2026 年 4 月）：** OpenAI 于 2026 年 4 月 23 日至 24 日发布了 **GPT-5.5** 和 **GPT-5.5 Pro**。GPT-5.5 现在是旗舰通用模型，正在逐步进入 Codex 各界面。请参阅 [第 2 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-2-where-codex-fits-in-the-openai-ecosystem) 中新增的"GPT-5.5：最新发布"子节、[第 11 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-11-model-specs-and-benchmarks-gpt-55-deep-dive) 中的完整基准测试深入分析，以及 [第 7 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-7-pricing-and-plan-access) 中更新的定价快照。

**作者：** Tatev Aslanyan、Vahe Aslanyan、Jim Amuto | **版本：** 1.3 — 最后更新：2026 年 4 月 30 日

## 执行摘要

Codex 是 OpenAI 的编程 agent（智能体）——不是一个单一的模型，而是一个产品和 workflow（工作流）层，将 OpenAI 的前沿模型与文件访问、shell 执行、sandbox（沙箱）、审批流程和代码审查能力封装在一起。

它运行在四个界面中：CLI（命令行界面）、IDE 扩展（VS Code、Cursor、Windsurf）、macOS/Windows 桌面应用，以及针对 GitHub 仓库后台任务的 Codex Cloud。

该产品包含在大多数付费 ChatGPT 计划中（Plus、Pro、Business、Enterprise/Edu），目前也面向 Free 和 Go 用户提供，但速率限制更严格。

Codex 底层的模型层在 2026 年 4 月发生了变化。GPT-5.5 是新的通用旗舰模型，在 agentic（智能体式）和长上下文基准测试上取得了显著提升（MRCR v2 在 100 万 token 上下文下从 GPT-5.4 的 36.6% 跃升至 GPT-5.5 的 74.0%。Terminal-Bench 2.0 达到 82.7%，幻觉率比前代下降了约 60%）。它的每 token 成本大约是 GPT-5.4 的 2 倍，因此为每个任务选择正确的模型现在对预算的影响比一个季度前更大。

对于采用 Codex 的团队，最具杠杆效应的选择是：

1.  在启用云端功能之前，先在 CLI（命令行界面）或 IDE 中进行小型限定任务

2.  将 Codex 作为代码生成器之外，也用作合并前的审查者

3.  通过 workspace（工作区）RBAC（基于角色的访问控制）将管理员和用户访问权限分离

4.  将 token 消耗量——而非提示数量——作为成本驱动因素

附录中的 30-60-90 天推行计划提供了一个分阶段推广方案，可以提前暴露摩擦点。

本手册涵盖 Codex 是什么、如何设置、如何高效使用、它与 Claude Code、GitHub Copilot 和自托管替代方案的区别。我们还将讨论它的成本、如何在企业中治理、以及它在哪些场景适用和不适用的地方。你可以在附录中找到术语表、安全清单和实际成本案例。

## 目录（Table of Contents）

### 以下是本手册涵盖的内容：

1.  [执行摘要](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-executive-summary)

2.  [前置条件](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-prerequisites)

3.  [第 1 节：什么是 Codex](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-1-what-codex-is)

4.  [第 2 节：Codex 在 OpenAI 生态系统中的定位](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-2-where-codex-fits-in-the-openai-ecosystem)

5.  [第 3 节：核心界面](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-3-the-core-surfaces)

6.  [第 4 节：入门：安装、设置和你的第一个任务](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-4-getting-started-install-set-up-and-your-first-task)

7.  [第 5 节：如何有效使用 Codex](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-5-how-to-use-codex-effectively)

8.  [第 6 节：Codex 与其他编程工具的区别](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-6-difference-between-codex-and-other-coding-tools)

9.  [对比矩阵](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-comparison-matrix)

10. [第 7 节：定价与计划访问](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-7-pricing-and-plan-access)

11. [实际成本案例](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-worked-cost-example)

12. [第 8 节：安全、权限与企业设置](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-8-security-permissions-and-enterprise-setup)

13. [第 9 节：团队最佳实践](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-9-best-practices-for-teams)

14. [第 10 节：常见工作流与示例](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-10-common-workflows-and-examples)

15. [第 11 节：模型规格与基准测试（GPT-5.5 深入分析）](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-11-model-specs-and-benchmarks-gpt-55-deep-dive)

16. [第 12 节：故障排查](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-12-troubleshooting)

17. [第 13 节：常见问题](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-13-faq)

18. [第 14 节：何时不应使用 Codex](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-14-when-not-to-use-codex)

19. [第 15 节：最终建议](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-15-final-recommendations)

20. [第 16 节：参考来源](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-16-source-references)

21. [附录 A：30-60-90 天推行计划](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-appendix-a-30-60-90-day-adoption-plan)

22. [附录 B：术语表](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-appendix-b-glossary)

23. [附录 C：管理员安全清单](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-appendix-c-admin-security-checklist)

24. [附录 D：更新日志](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-appendix-d-changelog)

25. [附录 E：在 VS Code 中使用 Codex](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-appendix-e-working-with-codex-in-vs-code)

## 前置条件（Prerequisites）

本手册是实操型的。为了充分利用它——特别是 [第 4 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-4-getting-started-install-set-up-and-your-first-task)、[第 5 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-5-how-to-use-codex-effectively) 和 [第 10 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-10-common-workflows-and-examples)，你将在这些章节安装 Codex 并运行真实任务——你应该准备好以下内容。

### 你应该已经具备的背景知识

你不需要是高级工程师，但以下演练假设：

- **能够熟练使用命令行。** 你会 `cd` 进入目录、列出文件、运行 `git` 命令以及阅读 shell 错误信息。如果你从未打开过终端，请先花一小时学习 shell 教程。

- **基本的 Git 使用能力。** 你理解 commits（提交）、branches（分支）、pull requests（拉取请求），以及暂存更改和未暂存更改的区别。Codex 的工作流核心是生成可审查的 diff（差异），所以这一点是必不可少的。

- **能够阅读至少一种主流语言的代码。** Codex 可以处理任何语言，但 [第 4 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-4-getting-started-install-set-up-and-your-first-task) 中的演示仓库是一个小型 Python 服务。如果你能阅读 Python、JavaScript、Go 或类似语言，就没问题。

- **对"API 调用的成本"有心理模型。** [第 7 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-7-pricing-and-plan-access) 的实际成本案例假设你理解 LLM（大语言模型）使用是按 token（令牌）计费的。如果"token"是一个全新的概念，请在阅读 [第 7 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-7-pricing-and-plan-access) 之前先浏览一遍 OpenAI 的 token 化工具页面。

如果你是工程经理、采购负责人或管理员，只需要 [第 7 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-7-pricing-and-plan-access)、[第 8 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-8-security-permissions-and-enterprise-setup) 和 [第 14 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-14-when-not-to-use-codex)，你可以跳过技术前置条件，直接跳转到这些章节。

### 你需要安装的工具和账号

在开始 [第 4 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-4-getting-started-install-set-up-and-your-first-task) 之前，请准备好以下内容。从零开始预计设置时间：**15–25 分钟**。

| 工具 / 账号                                                    | 为什么需要                                                                                                                                                                                                                                                                                                                                                              | 获取地址                                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 具有 Plus、Pro、Business 或 Enterprise/Edu 计划的 ChatGPT 账号 | Codex 包含在这些计划中。Free 和 Go 目前也可使用，但有更严格的速率限制                                                                                                                                                                                                                                                                                                   | [chatgpt.com](https://chatgpt.com/)                                         |
| **Node.js 18+ 和 npm**                                         | Codex CLI 通过 npm 安装（`npm i -g @openai/codex`）                                                                                                                                                                                                                                                                                                                     | [nodejs.org](https://nodejs.org/)                                           |
| **Git 2.30+**                                                  | 用于克隆演示仓库并生成 Codex 可审查的 diff（差异）                                                                                                                                                                                                                                                                                                                      | [git-scm.com](https://git-scm.com/)                                         |
| **代码编辑器**                                                 | VS Code 是推荐的基准编辑器。Cursor 和 Windsurf 也可用                                                                                                                                                                                                                                                                                                                   | [code.visualstudio.com](https://code.visualstudio.com/)                     |
| **GitHub 账号**                                                | 仅 Codex Cloud 任务需要（[第 8 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-8-security-permissions-and-enterprise-setup) 和 [附录 E](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-appendix-e-working-with-codex-in-vs-code)） | [github.com](https://github.com/)                                           |
| **WSL2**（仅限 Windows 用户）                                  | Codex CLI 在原生 Windows 上为实验性支持；WSL 是受支持的路径                                                                                                                                                                                                                                                                                                             | [Microsoft WSL docs](https://learn.microsoft.com/en-us/windows/wsl/install) |

### 验证你的环境

在开始 [第 4 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-4-getting-started-install-set-up-and-your-first-task) 之前，运行以下三条命令。如果任何一条失败，请先修复。

```
node --version   # 应打印 v18.x 或更高版本
npm --version    # 应打印 9.x 或更高版本
git --version    # 应打印 2.30 或更高版本
```

### 本手册不会教你的内容

为了坦诚设定期望，本手册**不**涵盖：

- 如何编写生产级 Python、JavaScript 或任何特定语言。我们使用小示例来演示 Codex 的行为，而非教授语法。

- 如何从头设计系统架构。[第 14 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-14-when-not-to-use-codex) 解释了为什么 Codex 不适合全新架构决策。

- 如何在组织级别管理 GitHub。[第 8 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-8-security-permissions-and-enterprise-setup) 涵盖 Codex 特有的 GitHub Connector（连接器）设置，但假设你的 GitHub 组织已经存在。

- LLM 内部原理（attention（注意力机制）、RLHF（基于人类反馈的强化学习）等）。我们将模型视为具有可衡量行为的黑箱。

## 第 1 节：什么是 Codex

Codex 是 OpenAI 的编程 agent（智能体）。最重要的一点是，Codex 不只是一个单一模型名称。它是一个产品和 workflow（工作流）层，旨在帮助人们更快地编写、审查、调试和交付代码。用 OpenAI 自己的话说，它是一个 AI 编程 agent（智能体），可以在本地与你协作，也可以在云端完成任务。

这个区别很重要。大多数人对 AI 的认知有两种方式：

- 一个回答问题的聊天模型。

- 一个建议代码片段的编程助手。

Codex 比这两者更广泛。它可以检查 repository（仓库）、编辑文件、运行命令和执行测试。它还可以通过接收 prompt（提示）或 spec（规格说明）来完成更大块的工作，并将其转化为任务计划、代码变更和可审查的输出。

对于团队来说，基于云端的 workflow（工作流）尤其重要，因为它让 Codex 可以在后台运行，同时工程师保持流畅状态。

OpenAI 当前的文档还将 Codex 与更广泛的开发者工具并列：API、Responses API、Agents SDK、MCP（模型上下文协议）工具以及 Codex 应用。如果你正在为一个团队导入，最简单的心理模型是：

- 模型是引擎。

- Codex 是使用这些引擎的编程产品。

- CLI（命令行界面）、IDE 扩展、Web 应用和云端任务是与之交互的方式。

## 第 2 节：Codex 在 OpenAI 生态系统中的定位

OpenAI 现在提供分层式技术栈：

- 通用前沿模型，如 **GPT-5.5**、**GPT-5.5 Pro**、GPT-5.4、GPT-5.4-mini 和 GPT-5.4-nano。

- Codex 专用模型，如 GPT-5.3-Codex、GPT-5.2-Codex、GPT-5.1-Codex 和 codex-mini-latest。

- 将这些模型封装为 workflow（工作流）的产品界面，如 Codex CLI、Codex 应用、IDE 扩展、云端任务和代码审查。

实际区别很简单：

- 如果你需要一次性推理、综合或通用聊天，你可以使用通用模型。

- 如果你需要一个能在 repository（仓库）中导航、修改文件、运行测试并推动具体代码成果的 agent（智能体），Codex 是专为此构建的界面。

OpenAI 当前模型文档将 GPT-5.4 描述为用于复杂推理和编程的旗舰模型。同时，Codex 专用模型页面将 GPT-5.3-Codex 和 GPT-5.2-Codex 描述为针对 Codex 或类似环境中的 agentic（智能体式）编程任务进行了优化。这告诉你 OpenAI 是如何定位这个技术栈的：

- GPT-5.4 是通用旗舰。

- Codex 专用模型针对编程 workflow（工作流）进行了调优。

- Codex 产品可以根据界面和配置切换模型。

如果你从本节只记住一件事，请记住：**Codex 是 workflow（工作流）。模型是引擎。**

### GPT-5.5：最新发布

OpenAI 于 2026 年 4 月 23 日发布 **GPT-5.5**，API 访问紧随其后于 2026 年 4 月 24 日上线。同时发布的还有更高级别的 **GPT-5.5 Pro** 变体。OpenAI 将 GPT-5.5 描述为"迄今为止最智能、最直观易用的模型，是迈向在计算机上完成工作的新方式的下一步。"

对于 Codex 用户，实际要点很简单：

1.  **GPT-5.5 是新的通用旗舰。** 任何地方旧文档写着"GPT-5.4 是旗舰"的，今后都应读作 GPT-5.5。GPT-5.4 仍然作为更便宜的默认选项可用。

2.  **Codex 各界面将切换。** 预计 GPT-5.5 将在发布后不久在 CLI（命令行界面）、IDE、应用和云端任务中变得可选（且通常为默认）。在设置中验证当前激活的模型。

3.  **定价已经变化。** GPT-5.5 的每 token 成本远高于 GPT-5.4。在批准预算前请参见 [第 7 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-7-pricing-and-plan-access)。

完整的基准测试细节、性能亮点以及针对不同 workload（工作负载）选择 GPT-5.5 vs GPT-5.4 vs Codex 专用模型的指导，请参见 [第 11 节：模型规格与基准测试](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-11-model-specs-and-benchmarks-gpt-55-deep-dive)。在掌握基础章节后再阅读该节。

## 第 3 节：核心界面

Codex 目前出现在几个地方，每个地方都针对略有不同的工作风格进行了优化。

### Codex CLI（命令行界面）

- [官方文档：developers.openai.com/codex/cli](https://developers.openai.com/codex/cli)

- [npm 包：`@openai/codex`](https://www.npmjs.com/package/@openai/codex)

- [GitHub 仓库](https://github.com/openai/codex)

CLI 是将 Codex 直接注入终端会话的最快方式。文档将其描述为 OpenAI 的编程 agent（智能体），可在你的终端本地运行，能够读取、修改和运行你机器上的代码，开源且用 Rust 编写。

在以下场景使用 CLI：

- 终端优先的 workflow（工作流）。

- 在现有仓库内的快速迭代。

- 对审批和执行进行细粒度控制。

- 本地编程任务的轻量级路径。

### IDE 扩展

- [官方文档：developers.openai.com/codex/ide](https://developers.openai.com/codex/ide)

- [VS Code Marketplace 列表（`openai.chatgpt`）](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)

CLI 文档和帮助中心文章都指向 VS Code、Cursor、Windsurf 及其他 VS Code 分支的 IDE 扩展。当你的团队生活在编辑器中，并希望 Codex 嵌入到正常的编程流程中时，这是自然的选择。

在以下场景使用 IDE 扩展：

- Codex 靠近你正在编辑的文件。

- 无需切换上下文即可进行提示和编辑。

- 在人类驱动和 agent（智能体）驱动的编辑之间架起桥梁。

### Codex 应用

- [帮助中心：将 Codex 用于你的 ChatGPT 计划](https://help.openai.com/en/articles/11369540-codex-in-chatgpt-faq)

- [从 chatgpt.com/codex 下载](https://chatgpt.com/codex)

OpenAI 的帮助中心说明 Codex 应用适用于 macOS 和 Windows。它专为跨项目的并行工作而设计，内置 worktree（工作树）支持、skills（技能）、automations（自动化）和 git 功能。

在以下场景使用应用：

- 多个 Codex agent（智能体）并行运行。

- 无需在终端和编辑器之间切换的云端任务。

- 一个以项目为中心的地方来分配和监控任务。

### Codex Cloud（云端）

- [官方文档：developers.openai.com/codex/cloud](https://developers.openai.com/codex/cloud)

- [Web 界面：chatgpt.com/codex](https://chatgpt.com/codex)

Codex Cloud 是后台执行模式。它在隔离的 sandbox（沙箱）中运行每个任务，配备 repository（仓库）和环境，旨在产出可审查的代码输出，而非直接的交互式会话。

在以下场景使用 Codex Cloud：

- 任务在后台运行时你可以做其他事情。

- 沙箱化执行，产出可审查的 diff（差异）。

- 自动化代码审查或仓库级别的 workflow（工作流）。

### 代码审查（Code Review）

- [帮助中心：Codex 用于代码审查](https://help.openai.com/en/articles/11369540-codex-in-chatgpt-faq)

- [Codex 用例](https://developers.openai.com/codex/use-cases)

Codex 还可以在 GitHub 内审查代码。OpenAI 将其描述为一种自动审查个人 pull request（拉取请求）或在团队级别配置审查的方式。

在以下场景使用代码审查：

- 为 pull request（拉取请求）提供第二双眼睛。

- 在人工审查前自动发现回归或问题。

- 覆盖团队范围的轻量级审查。

## 第 4 节：入门：安装、设置和你的第一个任务

本节从"什么都没安装"带你走完一个完整的端到端流程，直至"Codex 刚刚帮我修复了一个真实的 bug。"

我们将使用一个你可以在两分钟内自行搭建的微型演示 repository（仓库）——一个小的 Python 价格计算器，包含一个明显的 bug 和一个缺失的测试。这为你提供了一个真实、可重现的目标，完成后可以丢弃。

相同的演练适用于 CLI、IDE 扩展和应用，并在各处附有说明。

如果你有更想用的现有代码，跳到 [第 4 步](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-step-4-launch-codex-and-run-your-first-task) 并让 Codex 指向你自己的仓库。演示是为想要一个已知可用起点的读者准备的。

### 第 0 步：确认访问权限

Codex 包含在 ChatGPT Plus、Pro、Business 和 Enterprise/Edu 计划中。在有限时间内，它也包含在 Free 和 Go 中，但有更严格的速率限制。

如果你属于团队或企业 workspace（工作区），访问权限还可能取决于工作区设置和基于角色的控制。在托管环境中，不要假设仅凭 ChatGPT 订阅就能保证访问权限——向你的管理员确认，或在 [chatgpt.com/codex](https://chatgpt.com/codex) 的 Codex Cloud 设置中查看。

### 第 1 步：安装 Codex

你有三种安装路径。先选择**一种**开始；后面可以添加其他的。

#### 选项 A：CLI（推荐用于第一个任务）

CLI 是了解 Codex 行为的最直接方式。官方文档指出 **macOS 和 Linux 是一级支持的，而 Windows 是实验性的，应使用 WSL2**。

```
npm i -g @openai/codex
codex --version
```

如果 `codex --version` 打印出版本号，你就完成了。

#### 选项 B：VS Code 扩展

在 VS Code（或 Cursor / Windsurf）中，打开扩展面板，搜索 `openai` 发布的"Codex"，然后安装。或者从终端执行：

```
code --install-extension openai.chatgpt
```

安装后，Codex 面板将出现在右侧边栏中。

#### 选项 C：Codex 应用

从 [chatgpt.com/codex](https://chatgpt.com/codex) 下载 macOS 或 Windows 版 Codex 应用。当你想进行并行任务、使用内置 git worktrees（工作树）和以项目为中心的 UI 时，应用是最佳选择。对于你的第一个任务来说它有些大材小用——从 CLI 或扩展开始。

**VS Code 用户：** 关于覆盖三种 VS Code 入口点（扩展、集成终端中的 CLI 和浏览器版 Codex）的分步指南，请参见 **附录 E：在 VS Code 中使用 Codex**。

### 第 2 步：认证

在终端中运行 `codex`（或打开扩展面板）。系统将提示你：

- **使用 ChatGPT 登录** — 推荐。用量从你计划包含的 Codex 额度中扣除。

- **使用 API key（密钥）登录** — 当你想要按量 API 计费或工作区策略要求时使用。

如果不确定，选择 ChatGPT 登录。

### 第 3 步：搭建演示仓库

这是大多数快速入门跳过的部分。与其让 Codex 指向"任意仓库"，不如让我们创建一个小的、**自包含的、带有已知 bug 的演示仓库**，这样你可以验证 Codex 确实修复了它。

在终端中运行：

```
mkdir codex-demo && cd codex-demo
git init
```

现在创建三个文件。首先是 `pricing.py`——一个小的价格计算器，包含一个差一错误和一个缺失的边缘情况：

```
# pricing.py
def apply_discount(price: float, discount_percent: float) -> float:
    """对价格应用百分比折扣。

    BUG：折扣作为 (discount_percent / 10) 的乘数应用，而不是
    (discount_percent / 100)。20% 的折扣目前会使价格翻倍
    而非减少。
    """
    if discount_percent < 0:
        raise ValueError("discount_percent 必须 >= 0")
    return price * (1 - discount_percent / 10)

def cart_total(items: list[dict], discount_percent: float = 0) -> float:
    """计算购物车中商品列表折扣后的总价。"""
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    return apply_discount(subtotal, discount_percent)
```

然后是 `test_pricing.py`——一个通过的测试，以及一个会因 bug 而失败的测试：

```
# test_pricing.py
from pricing import apply_discount, cart_total

def test_no_discount_returns_original_price():
    assert apply_discount(100.0, 0) == 100.0

def test_twenty_percent_discount_on_100_is_80():
    # 在 apply_discount 中的 bug 修复之前，这个测试将失败。
    assert apply_discount(100.0, 20) == 80.0

def test_cart_total_with_discount():
    items = [
        {"price": 10.0, "quantity": 2},
        {"price": 5.0, "quantity": 1},
    ]
    # 小计为 25.0。10% 折扣后期望总价为 22.5。
    assert cart_total(items, discount_percent=10) == 22.5
```

以及一个小的 `README.md`：

```
# codex-demo

一个用于学习 Codex workflow 的小型定价模块。

运行测试：`python -m pytest`
```

提交初始状态，以便 Codex 的 diff（差异）易于审查：

```
git add .
git commit -m "初始演示：含有已知 bug 的定价模块"
```

在让 Codex 修复之前，确认 bug 是真实存在的：

```
python -m pytest
```

你应该看到两个失败的测试（`test_twenty_percent_discount_on_100_is_80` 和 `test_cart_total_with_discount`）。

如果未安装 `pytest`：`pip install pytest`。完整演示只需要 Python 3.10+ 和 pytest。

### 第 4 步：启动 Codex 并运行你的第一个任务

现在让 Codex 指向演示仓库。

**从 CLI：**

```
cd codex-demo
codex
```

当 Codex 启动后，给它一个清晰、有边界的任务。**精确输入此 prompt（提示）：**

```
测试套件有两个失败的测试。阅读 pricing.py 和 test_pricing.py，
识别根本原因，修复尽可能小的改动，然后运行测试以确认它们通过。
解释你改了什么以及为什么。
```

Codex 将：

1.  检查 `pricing.py` 和 `test_pricing.py`。

2.  识别出差一错误（`/ 10` 应为 `/ 100`）。

3.  提出一行 diff（差异）。

4.  在修改文件前请求审批（默认审批模式下）。

5.  在你批准后，运行 `python -m pytest` 并报告所有三个测试现在都通过。

**从 VS Code 扩展：** 在 VS Code 中打开 `codex-demo` 文件夹，在右侧边栏打开 Codex 面板，粘贴相同的 prompt（提示）。diff（差异）将在编辑器中以内联方式显示，供你审查和接受。

### 第 5 步：审查 diff（差异）

这是在早期建立的最重要的习惯。即使修复只有一个字符（`10` → `100`），在接受之前也要查看 diff（差异）：

```
git diff
```

阅读变更。确认它与 Codex 描述的匹配。自己运行测试：

```
python -m pytest
```

所有三个都应该通过。提交修复：

```
git commit -am "修复 apply_discount 中的差一错误"
```

你刚刚完成了完整的 Codex 循环：**上下文 → 任务 → 变更 → 审查 → 验证**。每个更大的任务都是这个循环的更长时间版本。

### 第 6 步：尝试另外两个有边界的任务

现在循环已经奏效，尝试在同一演示仓库上进行以下操作：

1.  **添加边缘情况测试。** Prompt（提示）：_"添加一个验证_`apply_discount`_在_`discount_percent`_为负数时抛出 ValueError 的测试。完成后运行测试。"_

2.  **添加缺失的安全检查。** Prompt（提示）：_"_`apply_discount`_目前没有拒绝大于 100 的_`discount_percent`_值，这会产生负数价格。添加验证，必要时更新现有测试，并添加一个针对新行为的测试。"_

每个任务都很小，有明确的验收标准（测试通过），并产出可审查的 diff（差异）。这就是每个好的 Codex 任务的形状。

### 第 7 步（可选）：设置 Codex Cloud

云端任务允许 Codex 在后台运行，而你做其他工作。它们需要一个 **GitHub 托管的 repository（仓库）**。

要为演示仓库启用 Codex Cloud：

1.  将 `codex-demo` 推送到私有 GitHub 仓库：`gh repo create codex-demo --private --source=. --push`（需要 `gh` CLI）。

2.  访问 [chatgpt.com/codex](https://chatgpt.com/codex) 并连接 **ChatGPT GitHub Connector**。

3.  在连接器中允许 `codex-demo` 仓库。**不要默认授予组织范围的访问权限**——见 [附录 C](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-appendix-c-admin-security-checklist)。

4.  从 Web 界面，选择仓库并 prompt（提示）：_"为_`pricing.py`_中的每个函数添加类型提示，并添加一个 CI 风格的变更摘要。"_

5.  等待 sandbox（沙箱）完成，在浏览器中审查 diff（差异），然后接受或打开 PR（拉取请求）。

默认情况下，**Codex Cloud sandbox（沙箱）没有互联网访问权限**。这是有意为之——如果真实 workflow（工作流）需要，管理员可以将依赖注册表和受信任站点列入白名单。

### 何时使用哪个界面

完成演示后，界面的取舍变得具体：

- **CLI** — 最适合终端密集型本地工作，可脚本化，最适合具有明确审批的多步骤 agentic（智能体式）任务。

- **VS Code 扩展** — 在编辑器中工作时进行流内编辑的摩擦最小。

- **Codex 应用** — 当你想通过 worktree（工作树）隔离跨项目运行多个并行任务时最适用。

- **Codex Cloud** — 最适合后台工作、长时间运行的任务，以及可以保持运行中的 PR 式审查。

大多数有经验的用户**全部安装**并根据任务选择。一个单一的 workflow（工作流）很少适合所有类型的工作。

### 如果出了什么问题怎么办？

如果你在本演练中卡住了：

- `codex` 命令找不到 → npm 的全局 bin 目录不在你的 PATH 中。重启终端，或使用像 nvm 这样的 Node 版本管理器。

- 登录持续失败 → 确认电子邮件与你的 ChatGPT 计划匹配；在企业 workspace（工作区）中，你的管理员必须启用 Codex。

- Codex 不修改文件 → 你可能处于严格的审批模式。在提示时批准，或在成功完成第一个任务后放宽模式。

- Windows 异常行为 → 切换到 WSL2 终端。CLI 的原生 Windows 是实验性的。

完整的故障排查指南在 [第 12 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-12-troubleshooting)。

## 第 5 节：如何有效使用 Codex

当你将 Codex 视为一个你正在导入培训的开发者，而不是一个神奇的 prompt（提示）响应器时，它的效果最好。你的任务越具体，结果就越好。

下面的每条建议都有一个**坏示例**（人们实际输入的内容）和一个**好示例**（能产出有用结果的内容）。大多数使用 [第 4 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-4-getting-started-install-set-up-and-your-first-task) 中的 `codex-demo` 仓库，你可以自己运行。

### 给它一个真正的目标

"真正的目标"意味着一个有可验证结果的具體目标——而非一种感觉。

**坏：**

```
改进这个代码库。
```

Codex 会挑选一些事情去做，但你无法知道结果是否是你想要的，而且 diff（差异）可能会触及超出你能审查的范围。

**好：**

```
重构 pricing.py 中的 cart_total，将迭代逻辑和折扣
应用分离为两个独立的辅助函数。保持 cart_total 的公共签名
不变。为每个辅助函数添加测试。最后运行 pytest。
```

这是有效的，因为恰好有一个验收标准（新结构下的测试通过）和恰好一个边界（公共签名不变）。你可以在 30 秒内审查 diff（差异）。

其他有效的形式：

- "修复 `test_pricing.py::test_twenty_percent_discount_on_100_is_80` 中的失败测试。"

- "为 `cart_total` 添加一个 `currency: str = 'USD'` 参数并更新测试。"

- "审查我上次提交的变更，找出缺失的边缘情况。"

### 提供正确的上下文

Codex 可以检查仓库，但你仍然需要引导它到正确的文件和约束条件。否则，它会漫无目的地试探。

**坏：**

```
为定价模块添加验证。
```

什么类型的验证？对哪些输入？什么错误类？Codex 必须猜测所有这些。

**好：**

```
上下文：
- 文件：pricing.py
- 函数：apply_discount
- 当前行为：对负数的 discount_percent 抛出 ValueError。
- 期望行为：当 discount_percent > 100 时也抛出 ValueError，
  消息为 "discount_percent 必须在 0 到 100 之间"。

任务：
- 添加验证。
- 在 test_pricing.py 中添加匹配的测试。
- 不更改 apply_discount 的公共签名。
- 之后运行 pytest。
```

注意结构：**哪个文件**、**当前行为**、**期望行为**、**任务**、**约束条件**、**如何验证**。这就是有希望的 prompt（提示）和可用的 spec（规格说明）之间的区别。

对于更大的任务，还应包括：

- 指向 issue 或 spec（规格说明）的链接（如果启用了 Web 访问，Codex 可以获取）。

- 相关文件的名称，即使 Codex 可以自己找到——命名它们可以将首次编辑时间减半。

- 任何应通过的测试命令、构建命令或 lint 命令的名称。

### 在需要时请求中间思考

"中间思考"意味着要求 Codex **在编辑文件之前以书面形式制定计划**。默认情况下，Codex 会直接跳到代码。对于任何比单个函数更大的任务，这不是正确的默认方式。

**没有中间思考**（替代方案）：

```
重构 pricing.py 以支持多种货币。
```

Codex 立即开始编辑。事后你发现它改变了数据库 schema、API 契约和三个测试文件——而你完全不知道它所做的设计选择是否正确。

**有中间思考：**

```
我想为 pricing.py 添加多货币支持。

在编辑任何内容之前：
1. 列出你预计要触及的文件及原因。
2. 用 5-10 个要点概述方法。
3. 指出你所做的任何假设和任何开放性问题。
4. 识别变更中风险最大的部分。

在进行任何编辑之前等待我的批准。
```

现在你得到了一个可以审查、反驳或完全放弃的计划——对代码库零成本。在你批准后，Codex 按照它刚刚编写的计划执行，这使得产生的 diff（差异）可预测。

在以下情况下使用中间思考：

- 多文件或交叉性的。

- 对这个代码库来说是架构上全新的。

- 难以测试（因此 diff（差异）是你唯一的信号）。

- 如果出错会有大的影响范围（认证、支付、数据迁移）。

### 偏好有边界的变更

一个有**边界变更（bounded change）**是具有以下全部四个属性的变更：

1.  **小的影响面积**——只触碰一个文件、一个模块或一个逻辑概念。

2.  **明确的验收标准**——有特定的测试、输出或行为证明它成功了。

3.  **几分钟内可审查**——人类可以在不预留一小时的情况下阅读 diff（差异）并形成意见。

4.  **容易回滚**——如果出错，`git revert` 可以干净地撤销，不会破坏其他任何东西。

相反的是**无边界变更（unbounded change）**："让代码库更快"、"现代化 API"、"到处添加类型"。这些没有明确的终点，没有简单的验证，也没有干净的回滚路径。

**有边界的示例（好）：**

- "为 `CartItem` 添加一个 `serialize()` 方法，返回适合 JSON 编码的字典。添加一个测试。"

- "在 `apply_discount` 中，将魔数 100 替换为模块级常量 `MAX_DISCOUNT_PERCENT`。"

- "`cart_total` 函数接受一个默认为 0 的 `discount_percent` 关键字参数。将默认值改为 `None`，并将 `None` 视为'无折扣'。更新测试。"

**无边界的示例（避免）：**

- "让 pricing.py 达到生产就绪状态。"

- "到处添加适当的错误处理。"

- "改进架构。"

当你发现自己写了一个无边界 prompt（提示）时，在发送之前将其分解为一系列有边界的 prompt。分解本身就是大部分工作；一旦你完成了分解，Codex 擅长执行每个部分。

### 将审查用作循环

Codex 不仅仅用于编写代码——它也是一个有用的合并前审查者。循环是：

1.  你（或 Codex）编写变更。

2.  要求 Codex 审查它。

3.  修复它发现的问题。

4.  重新运行测试。

**这在实践中是什么样子：**

在 `codex-demo` 中完成任务后，要求 Codex 审查你自己的提交：

```
审查我上次提交（git show HEAD）中的变更，检查：
- 正确性问题（差一错误、类型不匹配、错误的默认值）
- 缺失的测试，特别是边缘情况
- 安全问题（输入验证、注入、不安全的默认值）
- 可维护性风险（命名不清晰、隐藏耦合）

按严重程度（严重 / 重要 / 小问题）排列发现的问题。对每个
发现，指出确切行并提出具体的修复方案。在这一轮中不要
修改任何文件——只产出一份审查报告。
```

你通常会得到一个结构化的响应，例如：

```
严重：第 14 行 — apply_discount 静默地接受 NaN，因为类型
  检查是 `discount_percent < 0`，对于 NaN 返回 False。修复：在
  比较之前添加一个显式的 math.isnan() 检查。

重要：test_pricing.py 没有针对 boundary discount_percent=100 的测试。
  修复：添加一个断言 apply_discount(100, 100) == 0 的测试。

小问题：第 8 行 — 文档字符串中提到了一个 "BUG" 注释，现在 bug 已修复，
  应该移除。
```

然后你进行 triage（分类）：修复严重和重要的发现（通常通过将其反馈给 Codex 并说"应用你建议的修复"），推迟或拒绝小问题，然后重新运行测试。

这将 Codex 从代码生成器转变为**质量闸门（quality gate）**，这通常是更高杠杆的用法。一个仅将 Codex 用作生成器的团队得到的是更快的代码；一个也将它用作审查者的团队得到的是更好的代码。

## 第 6 节：Codex 与其他编程工具的区别

这通常是新用户最关心的一节，因为类别边界容易模糊。

### Codex 是产品层，而不仅仅是模型

Codex 是产品体验和 workflow（工作流）层。模型是底层的引擎。换句话说：

- 通用模型回答问题或编写文本。

- 编程模型针对软件任务进行了更窄的调优。

- Codex 将模型封装在 agentic（智能体式）编程 workflow（工作流）中，具备文件操作、命令执行、审批、sandbox（沙箱）和审查功能。

这一点很重要，因为用户经常将 Codex 与"另一个模型"进行比较，而真正的比较对象是"另一个编程系统"。

### Codex vs OpenAI 通用模型

OpenAI 当前的模型页面推荐 GPT-5.4 作为复杂推理和编码的旗舰模型。这是通用模型侧的建议。

另一方面，Codex 特定页面将 GPT-5.3-Codex 和 GPT-5.2-Codex 等模型描述为针对 Codex 或类似环境中的 agentic（智能体式）编程任务进行了优化。

实际要点：

- 当你想用顶级通用模型时，使用 GPT-5.4。

- 当你想用在 Codex 中针对编程 workflow（工作流）优化的模型时，使用 Codex 专用模型。

- 当你想用文件编辑、shell 命令、审查和 sandbox（沙箱），而不仅仅是文本输出时，使用 Codex 界面。

### Codex vs Claude Code

Claude Code 也是一个基于终端的 agentic（智能体式）编程工具。Anthropic 的文档将其描述为一个终端工具，可以制定计划、编辑文件、运行命令、创建 commits（提交）并与 MCP 连接的数据源一起工作。如果你的团队已经偏好终端优先的 workflow（工作流）并想要一个高度可脚本化的开发者工具，Claude Code 是一个很强的选择。

Codex 在几个实际方面有所不同：

- Codex 覆盖更多界面，包括 CLI、IDE 扩展、应用、云端任务和代码审查。

- Codex Cloud 围绕 GitHub 连接的任务执行和审查构建。

- Codex 更明确地被定位为一系列编程 workflow（工作流），而不仅仅是一个单一的终端 agent（智能体）。

实际要点：

- 选择 Claude Code，如果你想要终端原生的 workflow（工作流），具有强大的可组合性，并且你乐于主要生活在 shell 中。

- 选择 Codex，如果你想要更广泛的产品层，具有可以在团队间共享的本地、云端和基于应用的 workflow（工作流）。

### Codex vs GitHub Copilot 编程 Agent

GitHub Copilot 编程 agent（智能体）围绕 GitHub 自身的工作流设计。GitHub 文档将其描述为一个你可以分配 issues（问题）或 pull request（拉取请求）的 agent（智能体），它在后台工作以创建或修改 PR。它非常自然地融入 GitHub 托管的开发流程。

Codex 的侧重点不同：

- Copilot 编程 agent（智能体）高度以 GitHub 为中心。

- Codex 在终端、IDE、应用和云端方面更广泛。

- 如果你的团队已经以 GitHub 作为任务分配和审查的重心，Copilot 是一个很强的选择。

- 如果你想要一个更通用的、可以在本地和云端 workflow（工作流）中运行的编程 agent（智能体）界面，Codex 是更强的选择。

实际要点：

- 选择 Copilot 编程 agent（智能体），如果你的流程已经深深锚定在 GitHub issues（问题）和 pull request（拉取请求）上。

- 选择 Codex，如果你想要一个更广泛的 agent（智能体）workflow（工作流），能在本地、IDE 或 Codex Cloud 中运行。

### Codex vs 开源权重和自托管模型

开源权重（open-weight）或自托管模型服务于不同的需求。团队通常在以下情况下选择它们：

- 完全的 infrastructure（基础设施）控制。

- 自定义托管或隔空部署。

- 对数据保留和数据边界更直接的控制。

- 在已经拥有硬件和运维技术栈时，大规模使用时成本更低的路径。

权衡是，自托管模型通常不会为你提供与 Codex 相同的开箱即用 agentic（智能体式）产品体验。你必须自己组装编排、仓库访问、sandbox（沙箱）、审批和审查循环。

这意味着真正的选择不是"哪个模型最聪明？"而是"我想在模型周围的工作流上投入多少工程工作？"

实际要点：

- 选择开源权重或自托管模型，当 infrastructure（基础设施）控制是主要需求，并且你愿意构建周围的 agent（智能体）系统时。

- 选择 Codex，当你想要已经打包好的 workflow（工作流），特别是对于日常工程团队。

### Codex vs 通用聊天模型

通用聊天模型在以下任务中表现最好：

- 问答交流。

- 概念推理。

- 起草文稿。

- 总结或改写文本。

Codex 在以下任务中表现更好：

- 阅读和修改 repository（仓库）。

- 运行测试。

- 修复代码。

- 审查 pull request（拉取请求）。

- 协调多步骤的实现工作。

### Codex vs 相同模型的 API 使用

同一模型家族在不同的界面中可能表现不同。

- 在 API 中，你可以直接调用模型并设计自己的编排。

- 在 Codex 中，相同或类似的模型可能被包裹在仓库访问、审批流程和任务执行中。

这就是为什么一些模型页面提到某个模型针对"Codex 或类似环境"进行了优化。模型针对 agentic（智能体式）软件工作进行了调优，但 workflow（工作流）界面仍然重要。

### 对比矩阵

上面的文字比较浓缩为一个单一矩阵，便于快速参考：

| 维度                       | Codex                             | Claude Code            | GitHub Copilot 编程 Agent    | 自托管 / 开源权重                          |
| -------------------------- | --------------------------------- | ---------------------- | ---------------------------- | ------------------------------------------ |
| 主要界面                   | CLI、IDE、应用、云端              | CLI（终端优先）        | GitHub Web/PR/issues         | 你自己构建的                               |
| 后台执行                   | 是（Codex Cloud sandbox（沙箱）） | 有限；本地运行         | 是（GitHub Actions runners） | 自行构建                                   |
| 仓库集成                   | 通过连接器的 GitHub；本地仓库直接 | 本地；MCP 连接的数据源 | 原生 GitHub                  | 自行构建                                   |
| 模型选择                   | OpenAI 模型，可按界面切换         | Anthropic Claude 模型  | GitHub 管理（混合厂商）      | 任何你可以托管的模型                       |
| 审批和 sandbox（沙箱）控制 | 是，按界面                        | 是，按工具             | GitHub 权限模型              | 自行构建                                   |
| 并行 agent（智能体）       | 是（应用 + 云端）                 | 有限                   | 是（每个 PR）                | 自行构建                                   |
| 最适合                     | 跨界面团队 workflow（工作流）     | 终端原生的高级用户     | 已深度基于 GitHub 的团队     | 隔空、自定义基础设施或成本敏感的规模化应用 |
| 主要权衡                   | OpenAI 生态系统锁定；价格层级     | 产品界面面积较小       | 严重依赖 GitHub              | 显著的工程投入                             |

使用该矩阵选择主导工具，然后根据需要叠加其他工具。许多团队合理地并行运行其中两个——例如，Codex 用于跨界面工作，Claude Code 用于高级用户的终端 workflow（工作流）。

### 新用户应该选择哪个工具？

作为经验法则：

- 对于终端优先的编码和脚本编写，Claude Code 是一个有力的替代方案。

- 对于 GitHub 原生的 issue 和 PR 自动化，GitHub Copilot 编程 agent（智能体）自然契合。

- 对于本地加云端加基于应用的团队 workflow（工作流），Codex 是最灵活的选择。

- 对于最大的 infrastructure（基础设施）控制，自托管或开源权重技术栈最有意义。

OpenAI 当前的文档将 GPT-5.5 列为通用旗舰，GPT-5.4、GPT-5.4-mini 和 GPT-5.4-nano 仍然在下方可用，而 Codex 的文档和模型页面则暴露 Codex 专用变体和 CLI 内的模型切换。

## 第 7 节：定价与计划访问

定价是 Codex 中最可能变化的部分，因此本节应视为当前官方文档的快照。

### 计划访问

OpenAI 当前的帮助中心说明 Codex 包含在以下计划中：

- ChatGPT Plus

- ChatGPT Pro

- ChatGPT Business

- ChatGPT Enterprise/Edu

在有限时间内，它也包含在 Free 和 Go 中，尽管这些计划是临时例外，并受速率限制。

### 灵活定价与额度

当前费率表说明 Codex 定价于 2026 年 4 月 2 日变更，以与 API token 用量对齐，而非纯按消息定价。同一文章解释：

- 新的和现有的 Plus 及 Pro 客户使用基于 token 的费率表。

- 新的和现有的 Business 客户使用基于 token 的费率表。

- 新的 Enterprise 客户使用基于 token 的费率表。

- 现有的 Enterprise/Edu 和数种其他旧计划类别在迁移前仍然使用旧费率表。

这一点很重要，因为同一家公司中的两个团队可能根据 workspace（工作区）状态和计划版本处于不同的定价逻辑下。

### 当前模型定价快照

当前模型页面列出每 100 万 token 的美元定价。具体数字取决于你选择的模型：

- **GPT-5.5：输入 \(5，输出 \)30。** 2026 年 4 月 23 日发布的新旗舰。

- **GPT-5.5 Pro：输入 \(30，输出 \)180。** 针对最苛刻的 agentic（智能体式）和推理 workload（工作负载）的更高级变体。

- GPT-5.4：输入 \(2.50，输出 \)15。

- GPT-5.4-mini：输入 \(0.75，输出 \)4.50。

- GPT-5.4-nano：输入 \(0.20，输出 \)1.25。

- GPT-5-Codex：输入 \(1.25，输出 \)10。

- GPT-5.2-Codex：输入 \(1.75，输出 \)14。

- GPT-5.1-Codex-mini：输入 \(0.25，输出 \)2。

- codex-mini-latest：输入 \(1.50，输出 \)6。

这些模型页面还注明上下文窗口、输出限制，以及模型是用于 Codex 专用还是通用 API。对于预算规划，请记住较长的输出成本可能远高于输入 prompt（提示），因此任务框架的选择与模型选择同样重要。

请注意，GPT-5.5 的输入价格和输出价格大约是 GPT-5.4 的 2 倍，而 GPT-5.5 Pro 则高出整整一个数量级。OpenAI 的说法是 GPT-5.5 在 token 效率上也高于 GPT-5.4，这可以抵消部分标价差，但你应该在自己的 workload（工作负载）上进行测量，而不是假设它自动持平。对于 Codex 专用模型，预计当基于 GPT-5.5 的 Codex 变体发布后，产品阵容将发生变化；在此之前，上述 Codex 专用模型仍然是纯编程类任务的最佳选择。

### 这在实践中意味着什么

实际成本取决于：

- 输入大小。

- 缓存的输入。

- 输出长度。

- 任务是否使用快速模式。

- 你选择哪个模型。

因此，如果你正在规划团队推广，不要仅从"prompt（提示）数量"来估算用量。基于预期的 token 消耗量和任务类型进行估算。

### 旧版定价

旧版费率表对于尚未迁移的用户和 workspace（工作区）仍然重要。最大的教训是定价现在更紧密地与模型使用量相关，而非简单的固定消息数量。任何为 Codex 做预算的人都应该在制定内部计费规则或使用政策前阅读当前费率表。

### 实际成本案例

定价表很容易被误读。一个实际案例使模型选择问题变得具体。

**场景：** 一个 30 名工程师的团队使用 Codex Cloud 进行自动化 pull request（拉取请求）审查。每位工程师每周大约提交 4 个 PR。每个 PR 审查大约拉入 30,000 个输入 token（diff（差异）加上相关上下文文件），并产生大约 3,000 个输出 token（审查评论和风险摘要）。

每周 token 量：

- 每周审查数：30 工程师 × 4 PR = 120 次审查

- 每周输入 token：120 × 30,000 = 360 万输入 token

- 每周输出 token：120 × 3,000 = 36 万输出 token

按模型计算的每周成本：

| 模型                               | 输入成本                | 输出成本                  | 每周总计    | 年化（52 周） |
| ---------------------------------- | ----------------------- | ------------------------- | ----------- | ------------- |
| GPT-5.5（\(5 / \)30）              | 3.6M × \(5/1M = \)18.00 | 0.36M × \(30/1M = \)10.80 | **$28.80**  | $1,498        |
| GPT-5.5 Pro（\(30 / \)180）        | $108.00                 | $64.80                    | **$172.80** | $8,986        |
| GPT-5.4（\(2.50 / \)15）           | $9.00                   | $5.40                     | **$14.40**  | $749          |
| GPT-5-Codex（\(1.25 / \)10）       | $4.50                   | $3.60                     | **$8.10**   | $421          |
| GPT-5.1-Codex-mini（\(0.25 / \)2） | $0.90                   | $0.72                     | **$1.62**   | $84           |

**阅读表格：** GPT-5.5 的表面标价冲击在这个体量上消失了——30 名工程师的自动化审查每年不到 $1,500，与工程人力成本相比只是一个舍入误差。GPT-5.5 Pro 成本是其 6 倍，对常规审查而言通常不划算；将其保留用于需要其额外能力的那一小部分审查。Codex 专用模型成本大幅更低，如果你的审查主要是机械性的（风格、明显 bug、缺失测试），它们是正确的默认选择。

**此示例未捕获的内容：**

- **缓存的输入。** OpenAI 对重复输入 token 定价较低；如果你的审查重复拉入相同的上下文文件，实际成本低于所示。

- **长任务开销。** 重新读取文件或进行迭代的 agentic（智能体式）workflow（工作流）消耗的 token 比一次性审查多得多。一个编程任务很容易是审查 token 的 5–10 倍。

- **失败重试。** 一个失败的任务在重新运行后成本大致相同。agent（智能体）的不稳定性是一个真实的预算项目。

- **混合模型策略。** 大多数成熟团队将廉价任务（测试桩、文档更新）路由到 Codex-mini 模型，并将 GPT-5.5 保留用于仓库范围的重构和需要长上下文推理的 PR。

实际模式：围绕你实际最高体量的 workload（工作负载）（通常是 PR 审查或测试生成）构建成本模型，然后为真正受益于新能力的那一小部分任务单独制定 GPT-5.5 预算。

## 第 8 节：安全、权限与企业设置

团队关心 Codex，不仅将其视为生产力工具，更视作一个受控的软件开发系统。OpenAI 的文档反映了这一现实。

### 本地 vs 云端访问

企业管理员可以分别启用：

- Codex Local（本地）

- Codex Cloud（云端）

- 两者皆可

Codex Local 涵盖应用、CLI 和 IDE 扩展。Codex Cloud 涵盖托管任务、代码审查和相关集成。

这种分离很有用，因为一些组织希望广泛启用本地工具，同时将云端任务限制给更少的用户。

### Workspace（工作区）控制

管理文档说明 workspace（工作区）拥有者可以使用 RBAC（基于角色的访问控制）来管理访问权限。他们可以：

- 设置默认角色。

- 创建自定义角色。

- 将角色分配给组。

- 通过 SCIM（跨域身份管理系统）同步组。

- 集中管理权限。

这是在推广中构建最小权限原则的正确位置，而不是默认给每个开发者广泛的 Codex 访问权限。

### GitHub Connector（连接器）和仓库访问

Codex Cloud 需要 GitHub 托管的 repository（仓库）。管理员连接 ChatGPT GitHub Connector，选择安装目标，并允许特定的仓库。Codex 使用短期、最小权限的 GitHub App token（令牌），并尊重仓库权限和分支保护规则。

对于安全团队来说，这一点很重要，因为它使 Codex 与你已经使用的仓库访问模型保持一致。

### 互联网访问

默认情况下，Codex Cloud agent（智能体）在运行时没有互联网访问权限。这是有意为之。如果你的任务确实需要访问依赖注册表或受信任站点，管理员可以配置白名单和 HTTP 方法限制。

### 推荐的治理模式

企业文档建议对用户和管理员使用独立的组：

- 一个较小的 Codex Admin（管理员）组，用于管理策略和治理的人员。

- 一个更广泛的 Codex Users（用户）组，用于只需要使用该工具的开发者。

这使策略管理保持紧密，并避免意外的过度授权。

## 第 9 节：团队最佳实践

如果你正在为团队导入使用，如果你提前设定期望，你将获得更好的结果。

### 从简单、有价值的任务开始

适合团队首次使用的好场景：

- Pull request（拉取请求）审查。

- 小型 bug 修复。

- 测试生成。

- 文档更新。

- 代码库导航和理解。

这些容易与人工工作对比，也容易评判质量。

### 标准化任务 Prompt（提示）

给人们一个共享的 prompt（提示）模板。例如：

```
任务：修复 X 中的失败测试。
上下文：回归从 Y 之后开始。
约束：不改变公共 API 行为。
输出：解释根本原因，应用修复，运行测试，总结风险。
```

这使得结果更容易审查，并减少经常阻碍团队采用的"prompt（提示）质量彩票"问题。

### 使用审查文化

Codex 不应取代代码审查纪律。将其视为：

- 第一轮实现者。

- 审查前的审查者。

- 减少重复性工作的方式。

人类团队仍应拥有架构、产品权衡和最终签字的决策权。

### 衡量真正重要的指标

真正重要的指标是那些告诉你 Codex 是否在产出可审查、可合并、可信赖的工作的指标——而非计数活动的指标。以下是每个指标、**凭你已有的数据实际计算它的方法**，以及"健康"状态的判断标准。

#### 1. 首个有用 diff（差异）的时间

**定义：** 从 Codex 任务启动到产生一个人类实际会考虑应用的 diff（差异）（经过可能的小调整后）之间的时间。

**如何测量：**

- 对于 CLI/IDE 任务，记录从 prompt（提示）提交到首次 diff（差异）的挂钟时间。Codex CLI 发出结构化日志，你可以解析；一个简单的包装脚本就足够了：

```
start=\((date +%s); codex "<prompt>"; echo "elapsed: \)(( $(date +%s) - start ))s"
```

- 对于 Codex Cloud 任务，使用 chatgpt.com/codex 仪表板中显示的任务持续时间，或从 workspace（工作区）用量导出中拉取。

- 在第一个月将每个任务在共享电子表格中标记为"有用"或"已废弃"。此后可以采用抽样方式。

**健康标准：** 有边界的任务低于 2 分钟；多文件重构低于 10 分钟。如果中位数远高于此，你的 prompt（提示）可能缺乏上下文（见 [第 5 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-5-how-to-use-codex-effectively)）。

#### 2. Codex 生成变更的测试通过率

**定义：** 在 Codex 产生的 diff（差异）中，首次尝试就通过现有测试套件的百分比。

**如何测量：**

- 在 CI 中，标记源自 Codex 的 PR（像 `codex-authored` 这样的 label（标签）或 commit-message 前缀即可）。然后运行简单的每周查询：

```
SELECT
  COUNT(*) FILTER (WHERE first_ci_run = 'pass') * 100.0 / COUNT(*) AS first_try_pass_rate
FROM pull_requests
WHERE labels @> '{"codex-authored"}'
  AND created_at > NOW() - INTERVAL '7 days';
```

- 对于本地 CLI 使用，用一个包装脚本在 Codex 完成后立即运行你的测试命令并记录退出代码。

**健康标准：** 对于有边界的任务，高于 75%。低于 50% 意味着 Codex 在没有验证的情况下做变更——通常可以通过在 prompt（提示）模板中添加"完成后运行测试"来修复（见 [第 9 节 → 标准化任务 Prompt](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-standardize-task-prompts)）。

#### 3. Codex 捕获的审查发现

**定义：** 当 Codex 作为合并前审查者使用时，它发现了多少人类审查者或 CI 原本能发现的问题，对比只有 Codex 发现的问题，对比误报。

**如何测量：**

- 让人类审查者用三种标签之一标注 Codex 的审查评论：`agree-found-it`（同意，本来也能发现）、`agree-missed-it`（同意，但本来会遗漏）、`disagree-noise`（不同意，认为是噪音）。

- 随时间跟踪比率：

  - **有用发现率** = (`agree-found-it` + `agree-missed-it`) / 总 Codex 评论数。

  - **独特价值率** = `agree-missed-it` / 总 Codex 评论数。

- 使用一个简单的 GitHub Actions 步骤发布 Codex 审查，并要求人类审查者用 emoji（✅ / ⚠️ / ❌）回应，使得数据收集几乎零成本。

**健康标准：** 有用发现率高于 70%；独特价值率高于 20%。独特价值率是证明继续使用该 workflow（工作流）合理性的数字——如果它接近于零，Codex 只是在重复 CI 的工作，你可以禁用它而不会损失任何东西。

#### 4. 无需人工重写的已完成任务

**定义：** 在所有已合并的 Codex 编写的变更中，有多少比例基本上按照 Codex 所写的样子交付（而不是在合并前由人类大幅重写）。

**如何测量：**

- 比较 Codex 最初产生的 diff（差异）与实际合并的 diff（差异）。最简单的代理方式：

```
# 在 Codex 编写的分支中：
git diff codex/initial-commit HEAD --shortstat
```

如果 Codex 之后变更的 diff（差异）改变了超过 Codex 最初编写的约 30% 的行，将该任务计为"已重写"。

- 每月跟踪。趋势线比绝对数字更重要。

**健康标准：** 高于 60% 无需重大重写即可交付。低于此值，要么 prompt（提示）指定不足，要么 Codex 被推到了它不擅长的工作中——重新阅读 [第 14 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-14-when-not-to-use-codex)。

#### 5. 开发者满意度

**定义：** 实际使用该工具的人是否认为它让他们更快，以及是否想继续使用它。硬数字无法捕获这一点。

**如何测量：**

- 每月进行一份 5 题的 pulse survey（脉动调查）。保持简短。建议问题，全部采用 1–5 分制：

  1.  "Codex 本周帮我节省了时间。"

  2.  "我足够信任 Codex 的 diff（差异），可以自信地审查它们。"

  3.  "Codex 的审查评论通常值得阅读。"

  4.  "如果 Codex 被取消了，我会不高兴。"

  5.  "最大的单一摩擦点是什么？"（自由文本）

- 特别跟踪**第 4 题的趋势**。这是内部工具最接近产品-市场契合度的信号。

**健康标准：** 在推行到第 3 个月时，问题 1-4 的平均分高于 3.5/5。如果问题 4 的趋势下降，无论其他指标如何，推行都是失败的。

#### 不应衡量的内容

这些看起来有用但具有误导性：

- **发送的 prompt（提示）数量。** 计数的是活动，而非价值。一个发送了 10 倍多 prompt 的团队可能生产率提高 10 倍——也可能困惑了 10 倍。

- **消耗的 token 数量。** 对预算有用，对影响无用。重度使用者不一定是好的使用者。

- **生成的代码行数。** 与 LOC（代码行数）一直存在的问题相同：你奖励的是啰嗦。

- **Codex 发起的 PR 数量。** 一个 Codex 发起的、没人合并的 PR 是一个被美化为积极结果的负面结果。

使用成本数据（[第 7 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-7-pricing-and-plan-access)）来管理预算。使用上述指标来管理推广。

### 为正确的工作使用正确的界面

- 终端密集型本地工作用 CLI。

- 日常编码用 IDE 扩展。

- 并行项目工作用应用。

- 后台任务和审查用云端。

这通常就是"这很有用"和"这很烦人"的区别。

## 第 10 节：常见工作流与示例

以下是大多数团队实际会使用的 workflow（工作流）。每个都包含一个针对 [第 4 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-4-getting-started-install-set-up-and-your-first-task) 中 `codex-demo` 仓库的**实际示例**，让你可以看到完整的 prompt（提示）、Codex 产生的输出类型，以及如何处理它。

### 工作流 1：本地修复 Bug

**在以下场景使用：** 一个测试失败、一个行为错误，且原因局限在一个文件或函数内。

**步骤：**

1.  在终端或 IDE 中打开仓库。

2.  要求 Codex 检查失败路径。

3.  请求一个修复和一个测试。

4.  审查 diff（差异）。

5.  运行测试套件。

**实际示例：**

在 `codex-demo` 仓库中，假设一位同事刚刚报告：_"_`apply_discount`_在 discount\_percent 大于 100 时静默返回负数价格。_ 先验证 bug：

```
python -c "from pricing import apply_discount; print(apply_discount(100, 150))"
# 打印：-50.0    <-- 静默负数价格，没有抛出错误
```

现在启动 Codex 并运行：

```
Bug：apply_discount(100, 150) 返回 -50.0 而非抛出错误。
期望：大于 100 的 discount_percent 值应抛出 ValueError，
消息为 "discount_percent 必须在 0 到 100 之间"。

任务：
- 在 pricing.py 中添加验证。
- 在 test_pricing.py 中添加断言 discount_percent=150 时
  抛出 ValueError 的测试。
- 保持现有测试通过。
- 最后运行 pytest 并报告结果。
```

**你得到的结果：** 一个在 `apply_discount` 中添加 `if discount_percent > 100: raise ValueError(...)` 的 diff（差异），一个新的 `test_invalid_discount_percent_above_100` 测试，以及显示所有四个测试通过的 pytest 输出。用 `git diff` 审查，自己运行 `python -m pytest` 确认，然后 `git commit -am "拒绝大于 100 的 discount_percent"`。

这在 bug 有边界且可重现时效果最好。如果你不能从命令行重现，Codex 通常也不能。

### 工作流 2：审查 Pull Request（拉取请求）

**在以下场景使用：** 你（或同事）刚刚做了变更，想在进行人工审查之前快速进行一次合并前的健全性检查。

**步骤：**

1.  让 Codex 指向 PR 或变更文件。

2.  要求检查正确性问题、缺失测试和安全风险。

3.  将发现与人工审查进行比较。

4.  在更广泛的团队审查前将 Codex 作为预过滤器使用。

**实际示例：**

在完成上述工作流 1 后，要求 Codex 在打开 PR 前审查你自己的变更：

```
审查我上次提交（HEAD）中的变更——它在 pricing.py 的
apply_discount 中添加了验证。

检查：
- 正确性问题（边界上的差一错误、错误的错误类型等）
- 缺失的测试（边界情况如正好 100、正好 0、NaN、负零）
- 安全或健壮性问题
- 与现有 apply_discount 验证风格的 API 一致性

按严重程度（严重 / 重要 / 小问题）排列发现的问题，
并为每个问题提出具体的修复方案。在这一轮中不要修改任何文件。
```

**你可能得到的结果：**

```
重要：第 14 行 — 新的验证拒绝了 discount_percent > 100，但
  静默地允许 discount_percent == 100，这使价格为 0。这在技术上是
  有效的，但值得添加一个测试来锁定边界。添加：
    test_apply_discount_at_boundary_100_returns_zero

小问题：新的错误消息说 "在 0 到 100 之间"，但针对负值的
  现有检查说 "必须 >= 0"。考虑统一消息措辞以提高一致性。
```

你应用重要修复（通常通过后续跟进："_应用你审查中标记为重要的修复_"），推迟或接受小问题，然后重新运行测试。

这是杠杆最高的团队 workflow（工作流）之一，因为它在人工审查开始之前捕捉到明显的问题。参见 [第 9 节 → 衡量真正重要的指标 → Codex 捕获的审查发现](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-3-review-findings-caught-by-codex)，了解如何跟踪其随时间推移的实际价值。

### 工作流 3：理解大型代码库

**在以下场景使用：** 你对一个仓库是新来的（或数月后回来），在安全地进行更改之前需要一张地图。

**步骤：**

1.  要求 Codex 跟踪一个请求流程。

2.  询问关键模块和入口点。

3.  在编辑任何内容之前请求代码路径的映射图。

**实际示例：**

`codex-demo` 仓库太小，不需要这样做。所以想象一个更真实的案例：一个同事的仓库，里面有 `app/`、`services/`、`models/`、`api/` 和 80 个你从未见过的文件。在 Codex 中打开仓库并运行：

```
我是这个代码库的新人。在不修改任何内容的情况下，给我一个方向指南：

1. HTTP API 的入口点是什么？
2. 跟踪当 POST 请求到达 /users 时发生什么——按顺序列出请求
   触达的每个文件，每个附一行描述。
3. 数据库访问在哪里集中？是否存在 repository 模式？
4. 我应该运行什么测试命令来验证我的任何变更？
5. 我应该首先阅读哪三个文件来理解项目约定？

以结构化 markdown 报告的形式输出。
```

**你得到的结果：** 一个可以粘贴到笔记中的 markdown 报告。阅读推荐的文件，然后用 Codex 开始进行实际更改。在这个定位上花费的 10 分钟通常能节省后续一小时混乱的重构。

这个 workflow（工作流）对新员工特别有用。高级工程师在第一次接触不熟悉的服务时也可以使用它，以避免破坏他们看不到的约定。

### 工作流 4：并行生成功能

**在以下场景使用：** 一个功能自然地分割为不互相阻塞的独立部分（API + 测试 + 文档，或 UI + 后端 + 迁移）。

**步骤：**

1.  将工作分解为子任务。

2.  为 UI、API、测试或文档运行独立的 Codex 任务。

3.  审查后合并输出。

**实际示例：**

为 `codex-demo` 添加一个新的"忠诚度折扣"功能。工作可以分割为三个不相互依赖的部分：

| 子任务      | 界面            | Prompt（提示）                                                                                                                                                                                                 |
| ----------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. 实现** | 终端 1 中的 CLI | "为 `pricing.py` 添加一个 `loyalty_discount(price, customer_tier)` 函数。级别为 'bronze'（0%）、'silver'（5%）、'gold'（10%）。拒绝未知级别，抛出 ValueError。不改变任何其他函数。"                            |
| **B. 测试** | Codex Cloud     | "在 `test_pricing.py` 中为具有 bronze/silver/gold 级别的 `loyalty_discount(price, customer_tier)` 函数生成详尽测试。覆盖：每个级别、未知级别、负数价格、零价格、小数价格。不修改 pricing.py——假设函数将存在。" |
| **C. 文档** | VS Code 扩展    | "在 README.md 中添加一个记录新的 loyalty_discount 函数的部分：签名、级别表和一条使用示例。"                                                                                                                    |

每个部分并行运行。当所有三个完成后，合并 diff（差异）（通常实现先走，然后测试对照它进行验证，然后文档引用已交付的内容）。独立审查每个部分。

Codex 应用和云端界面特别适合这种情况，因为它们让你可以在不切换终端窗口的情况下启动和监控多个任务。CLI 也支持并行工作，但配合 `git worktree` 使每次运行在自己的分支检出上操作时效果更好。

### 工作流 5：使用子 Agent（Subagents）进行分解

**在以下场景使用：** 一个任务对一次 Codex 运行来说太大，但可以自然地分割为调查 / 复现 / 提出方案等阶段。

CLI 明支持 subagents（子智能体）——一个 Codex 任务生成子任务，每个子任务具有更窄的范围和自己的上下文窗口。

**实际示例：**

一个 bug 报告说：_"购物车总价有时对欧洲货币差一分钱。"_ 你还不知道这是舍入 bug、货币转换 bug 还是数据 bug。运行一个父任务来进行分解：

```
一个 bug 报告说购物车总价偶尔对欧洲货币差一分钱。

将其分解为三个 subagent（子智能体）任务：

1. 调查：阅读 pricing.py 和任何与货币相关的代码。识别
   每个涉及浮点运算触及货币值的地方。
   报告发现但不提出修复方案。

2. 复现：在 test_pricing.py 中编写一个失败的测试，展示
   与 EUR 金额的一分钱差异。使用尽可能小的
   复现。

3. 提出方案：基于（1）和（2），提出两种可能的修复方案（例如，
   切换到 Decimal vs 在边界处舍入）及各自的权衡。
   先不要实现任何一种方案。

在编写任何生产代码之前等我选择一种修复方案。
```

**为什么 subagents（子智能体）有帮助：** 每个子任务有干净的上下文，所以调查的发现不会污染测试编写的上下文，提出方案的任务也有清晰的两方面视野。你还在调查和实现之间得到了一个自然的人工检查点。

这种划分通常比一次巨大的全能运行更快，而且结果更容易审查。

### Prompt（提示）菜谱

新用户经常要求提供示例，因为他们知道想要什么样的结果但不知道如何措辞。这些模板是好的起点。

#### Bug 修复模板

```
检查 [文件或模块] 中的失败行为。
识别根本原因。
补上最小的安全修复。
添加或更新测试。
总结变更内容以及我应该注意的任何边缘情况。
```

在 bug 很窄且你想要一个严谨的修复而非重新设计时使用此模板。

#### 重构模板

```
重构 [模块] 以提高可读性，同时保持当前行为。
保持外部 API 稳定。
在编辑前解释重构计划。
进行实现目标所需的最小变更集。
```

在代码可以工作但难以维护时使用此模板。

#### 审查模板

```
审查此变更的正确性、缺失测试、安全问题和可维护性风险。
按严重程度排列发现的问题。
指出任何行为变更或模糊逻辑。
```

当你想让 Codex 像合并前审查者一样行事时使用此模板。

#### 功能模板

```
在 [文件或子系统] 中实现 [功能]。
在更改任何内容之前列出你预计触碰的文件。
添加测试。
保持实现与当前架构一致。
```

当任务跨越多个文件且你想了解计划时使用此模板。

### 你正在有效使用 Codex 的标志

当以下情况出现时，你通常就知道 workflow（工作流）是健康的：

- Codex 做小的、可审查的 diff（差异），而不是大范围重写。

- 模型只在缺失的细节很重要时才要求澄清。

- 测试覆盖率随功能一起提高。

- 新开发者可以在不需要定制培训的情况下使用该工具。

- 从 prompt（提示）到合并变更的时间降低了，但审查质量没有下降。

当以下情况出现时，你通常就知道 workflow（工作流）是不健康的：

- Prompt（提示）模糊，每个结果都需要大量返工。

- 团队把第一次输出当作最终版本。

- 没有人检查 diff（差异）或运行测试。

- 用户一直要求"让它更好"而不是定义一个明确的目标。

这些信号比原始使用计数更重要。

## 第 11 节：模型规格与基准测试（GPT-5.5 深入分析）

[第 2 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-2-where-codex-fits-in-the-openai-ecosystem) 将 GPT-5.5 作为新的通用旗舰引入，并给出了三点实际要点。本节是深入分析：已发布的基准测试数字、每个数字实际测量什么、为什么它对 Codex workload（工作负载）特别重要，以及如何使用这些数字为每个任务选择正确的模型。

如果你正在为团队设定预算或选择默认模型，请完整阅读本节。如果你只是想使用 Codex，可以略读。

### 为什么基准测试对模型选择很重要

Codex 允许你在每个界面背后选择模型。正确选择主要在于将模型的优势与任务形状匹配：

- **一个有边界的本地编辑**（一个文件、一个函数）不会从前沿模型中获得多少收益。Codex 专用或 Codex-mini 变体通常是正确的选择。

- **仓库范围的重构**，需要模型在工作记忆中保持多个文件，会从长上下文性能中获益巨大。

- **无人值守运行十分钟的 agentic（智能体式）云端任务**受益于低幻觉率和强大的工具使用行为。

- **PR 审查**几乎首先受益于低幻觉率——一条自信但错误的审查评论比漏掉真正的问题代价更高。

以下基准测试告诉你哪个模型最匹配每种任务形状。

### GPT-5.5 性能亮点

已发布的基准测试将 GPT-5.5 定位为在 agentic（智能体式）和长上下文工作方面——对 Codex 用户最相关的 workload（工作负载）——相比 GPT-5.4 有了有意义的跃升。

- **知识工作（GDPval）** — **84.9%**。GDPval 评估模型是否能在 44 种职业中产出规范的知识工作输出。这是整体通用能力的标志性数字。

- **计算机使用（OSWorld-Verified）** — **78.7%**。衡量模型是否能端到端操控一个真实的计算机环境。与 Codex Cloud sandbox（沙箱）和 agentic（智能体式）CLI 运行直接相关。

- **编程（Terminal-Bench 2.0）** — **82.7%**。一个以终端为中心的编码基准测试，包含长上下文检索和计算机使用两个组成部分。最接近 Codex CLI workload（工作负载）的公开代理指标。

- **客服工作流（Tau2-bench Telecom）** — **98.0%**（无 prompt 调优）。表明开箱即用的强大工具使用和策略遵循行为。

- **长上下文检索（MRCR v2，100 万 token）** — **74.0%**，从 GPT-5.4 的 **36.6%** 提升。这是报告中最大的单一跃升，也是对于需要在工作记忆中保持多个文件的仓库级 Codex 任务最重要的数字。

- **幻觉率** — 独立报道称与前代相比**幻觉减少约 60%**，这在实质上改变了审查和 PR 反馈 workflow（工作流）的信任计算。

### 每个基准测试实际测量什么

基准测试很容易被误读。以下是对上述引用项的快速定义：

- **GDPval** — 要求模型在 44 种职业中产出规范的知识工作输出（法律备忘录、财务摘要、技术文档等）。高分意味着模型能可靠地产生结构化、规范化的输出。用作通用能力信号，而非编码专用信号。

- **OSWorld-Verified** — 让模型操控一个真实的桌面环境来完成实际 workflow（工作流）（打开文件、导航 UI、运行命令）。高分预示模型在模拟开发者桌面的 agentic（智能体式）sandbox（沙箱）中会表现良好。

- **Terminal-Bench 2.0** — 一个以终端驱动的编码基准测试，包含长上下文检索和计算机使用两个组成部分。最接近 Codex CLI 日常实际行为的公开代理指标。

- **Tau2-bench Telecom** — 评估需要遵循策略和正确使用工具的复杂客服风格 workflow（工作流）。是"模型是否按照你告诉它的去做而不会偏离脚本"的代理指标。

- **MRCR v2（100 万 token）** — 一个长上下文检索基准测试。测试模型是否能在完整的 100 万 token 上下文窗口中找到和使用信息。对需要在工作记忆中保持许多文件的仓库级 Codex 任务行为的最佳单一预测指标。

### 对 Codex 用户的实用指导

将基准测试转化为模型选择：

- **仓库范围的任务**（跨文件重构、多模块迁移）：GPT-5.5。MRCR v2 的跃升是在大型代码库上将比 GPT-5.4 表现更好的最佳单一信号。

- **廉价、有边界的本地编辑**（单个函数、单个测试、文档调整）：GPT-5.4 或 Codex 专用模型。成本/延迟的权衡好得多，并且在小型任务上能力空间被浪费了。不要仅仅因为 GPT-5.5 是最新的就把所有任务默认使用它。

- **Agentic（智能体式）云端任务**（后台 sandbox（沙箱）运行、多步骤 workflow（工作流））：GPT-5.5。OSWorld-Verified 得分和较低的幻觉率是相关信号——更少的 sandbox（沙箱）运行失败和更少的自信但错误的输出。

- **PR 审查和代码审查 workflow（工作流）**：GPT-5.5。幻觉率下降 60% 是审查工作最重要的单一数字；一个噪音大的审查者会训练团队忽略审查者。

- **最昂贵的 workload（工作负载）**（任何接近 GPT-5.5 Pro 定价的任务）：将 GPT-5.5 Pro 保留用于需要其额外能力的那一小部分任务——通常是深度创新推理或极端长上下文工作。

### 对采购：将 GPT-5.5 作为独立的预算项目

Agentic（智能体式）任务中的 token 消耗以输出为主。GPT-5.5 的输出成本比 GPT-5.4 明显更高。具体来说：

- 混合模型策略现在是规则而非例外。大多数成熟团队将常规工作路由到 Codex-mini 模型，并将 GPT-5.5 保留用于仓库范围和审查密集型工作。

- [第 7 节的实际成本案例](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-worked-cost-example) 展示了 30 名工程师 PR 审查案例在所有五个模型级别的对比。在批准预算前阅读它。

- 每季度重新检查定价。费率表过去已经变更，将来还会变更。

### 引用前请验证

本节中的数字来自 OpenAI 的发布文档和同期新闻报道。在进入采购简报或公开文件之前，请对照 OpenAI 官方公告和模型页面进行验证——参见 [第 16 节：参考来源](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-16-source-references)。基准测试会被重新运行；数字会随评估方法变化而变动。

## 第 12 节：故障排查

即使好的工具，如果设置错误也会失败。以下是最常见的问题。

### "Codex 未安装"

检查：

- 你运行了 `npm i -g @openai/codex`。

- 你使用的是受支持的 shell 和运行时。

- 二进制文件在你的 PATH 上。

### "我无法登录"

检查：

- 你的 ChatGPT 账号有正确的计划。

- 你的 workspace（工作区）允许 Codex 本地或云端使用。

- 你正在使用正确的账号登录。

### "Windows 表现异常"

CLI 文档说 Windows 支持是实验性的。如果你在 Windows 上，受支持的最佳路径是使用 WSL 运行 CLI，或在适当时使用 Codex 应用。

### "云端任务看不到我的仓库"

检查：

- GitHub Connector（连接器）已安装。

- 仓库在连接器中被允许。

- 你的组织管理员已启用 Codex Cloud。

- 你使用的是 GitHub 托管的仓库。

### "Codex 无法浏览互联网"

在云端模式下，这是预期默认行为。询问你的管理员互联网访问是否被有意限制。

### "结果技术上正确但不是我想的"

这通常意味着 prompt（提示）指定不足。收紧：

- 目标文件或功能。

- 验收标准。

- 约束条件。

- 预期的输出格式。

## 第 13 节：常见问题

### Codex 是一个聊天模型吗？

不完全是。它是一个编程 agent（智能体）和产品界面，构建用于处理仓库、测试、代码审查和多步骤软件任务。

### 我可以在不不断切换工具的情况下使用 Codex 吗？

可以。这是它的优势之一。你可以根据你的 workflow（工作流）使用 CLI、IDE 扩展或 Codex 应用。

### 我需要云端功能吗？

不需要。许多个人用户仅通过本地 CLI 或 IDE 扩展就能获得价值。当你想要后台执行、并行性或自动化审查时，云端任务变得更有价值。

### Codex 只适用于专业工程师吗？

不，但当用户能够评估代码变更并理解仓库时，它最有用。它首先是一个开发者工具。

### Codex 和 GPT-5.4 一样吗？

不。GPT-5.4 是一个模型。Codex 是编程产品/workflow（工作流）。Codex 可能根据界面和配置使用不同的模型。

### 最安全的开始方式是什么？

在小的仓库变更中使用 CLI 或 IDE 扩展，将审批模式保持为保守，并在合并前审查每一个 diff（差异）。

## 第 14 节：何时不应使用 Codex

本手册的大部分内容是肯定的——Codex 擅长这个、Codex 适合这里、这是设置方法。这种框架可能给人一个印象，即 Codex 是任何编程相关任务的正确工具。并非如此。最快失去团队对 AI 编程工具信任的方式是把它推到它不擅长的工作中。以下是 Codex 目前不适合的坦诚列表。

### 没有可审查输出的任务

Codex 的价值依赖于人类审查 diff（差异）、测试结果或解释。如果任务产出的东西没有人会检查——一个触及生产数据的一次性脚本、其结果影响决策但没人在阅读 SQL 之前的探索性查询——AI 的信心成为唯一的质量闸门。无论模型质量如何，这都是不好的位置。要么添加一个审查步骤，要么自己做这个任务。

### 高度创新的架构决策

Codex 擅长应用模式。它在选择哪种模式适合团队尚未解决的问题上弱得多。预期它会自信地为真正新颖的领域生成看似合理但错误的架构：新的定价模型、新的认证边界、新的事件溯源方案。用它来制作原型选项，而不是在选项之间做决定。

### 跨越组织边界的工作

Codex 看到它有权访问的仓库。它看不到跨团队契约、平台团队路线图中的弃用日历、另一个仓库进行到一半的迁移，以及某种方法被政治原因禁止的原因。对于跨越多个团队或服务的变更，Codex 可以实现单个部分，但人类仍然需要拥有跨领域的计划。

### 任何涉及实时生产状态的事情

Codex Cloud sandbox（沙箱）很好。它们不能替代生产变更前的人工审批。数据库迁移、会改变真实资源的 infrastructure-as-code（基础设施即代码）、密钥轮换、客户数据脚本——即使 diff（差异）是由 Codex 编写的，这些也需要人类在审批路径中。Codex 能运行命令这个事实并不意味着它应该运行那些命令。

### 合规性和安全关键代码

存在于受监管边界内的代码（支付、医疗、安全原语、用于安全的模型评估工具）比典型产品代码有更高的审查和来源要求。Codex 的输出作为起始草稿是可以的，但审查负担与任何第三方编写的代码相同，这通常意味着速度优势大幅缩水。为此做好规划，或者让这些领域不使用 Codex。

### 真正的瓶颈是知识而非打字速度的任务

如果团队因为没有人理解遗留系统、失败的测试或奇怪的客户报告而卡住，生成更多代码通常没有帮助。一旦你知道该做什么，Codex 可以加速实现。它无法替代应该首先进行的发现和设计对话。跳过发现步骤直接去"问 Codex"的团队往往会快速交付错误的东西。

### 幻觉成本高的任何事情

GPT-5.5 相比前代将幻觉率降低了约 60%，这是一个真正的改进。但它不是零。一个自信但错误的输出会造成真正损害的任务——生成监管引用、从模型实际没有读取的文档中抄录 API 契约细节、对不熟悉的第三方库断言事实——仍然需要你应用与任何 AI 输出相同的怀疑态度。对这些任务使用搜索基础的 workflow（工作流）或人工验证。

### 快速启发法

如果你能为以下四个问题全部回答"是"，Codex 很可能合适：

1.  输出可以被能够发现错误的人审查吗？

2.  任务是一个已知模式，而非新颖的架构决策吗？

3.  影响范围局限于一个仓库或服务内吗？

4.  错误输出的成本是有界（例如，一个失败的测试、一个被回滚的提交）而非无界（例如，生产数据丢失、监管暴露）的吗？

如果其中任何一个回答是"否"，要么重新构造任务使其变为"是"，要么将工作保持在 Codex 之外。

## 第 15 节：最终建议

如果你正在向新用户推广 Codex，我会将指导保持得非常简单：

1.  从 CLI 或 IDE 扩展开始。

2.  用一个简单的任务来学习该工具。

3.  在合并前审查每一个变更。

4.  只有在用户信任本地 workflow（工作流）之后，再转向云端任务。

5.  对于团队，将用户访问与管理员访问分离。

6.  每当你的计划或 workspace（工作区）变化时重新检查定价。

当 Codex 被当作一个有纪律的工程工具而非新奇玩具时，它是最有价值的。如果你给它真实的代码、明确的约束和一个审查文化，它可以加速软件开发中枯燥的部分，并让更大的任务更容易分解。

### LUNARTECH Fellowship：链接学术与产业

为了解决学术理论与科技产业实际需求之间日益增长的脱节，LUNARTECH Fellowship 应运而生，旨在弥合这一人才鸿沟。

太多时候，有抱负的工程师陷入"没有经验就没有工作"的循环，毕业后拥有理论知识却对生产系统的混乱现实毫无准备。

为了对抗这一系统性问题并阻止由此导致的人才流失，Fellowship 对潜力突出的个人进行大量投资，提供一个优先考虑实践经验、导师指导和真实世界工程的转型环境，而非传统学位。

这个为期 6 个月的远程优先学徒计划是一条从有抱负的人才到 AI 先锋的沉浸式成长之路。与其独自付费学习，Fellows 与经验丰富的高级工程师和创始人一起，工作在真实、高风险的 AI 和数据产品上。通过应对实际的工程挑战并构建一个包含可投产工作的具体 portfolio（作品集），参与者获得在当今竞争格局中蓬勃发展所需的就业就绪技能。

如果你准备好打破循环并加速你的职业生涯，你可以探索这些机会并从这里开始你的旅程：[https://www.lunartech.ai/our-careers](https://www.lunartech.ai/our-careers)。

### 精通你的职业生涯：AI 工程手册

对于那些准备从理论过渡到实践的人，我们开发了 [**The AI Engineering Handbook：如何开启职业生涯并在 AI 工程师岗位上卓越发展**](https://www.lunartech.ai/download/the-ai-engineering-handbook)。这份全面指南提供了掌握在 2026 年 AI 变革世界中蓬勃发展所需技能的分步路线图。

无论你是一名希望进入竞争激烈领域的开发者，还是一名寻求为职业生涯做好准备的专业人士，本手册提供的经过验证的策略和可操作的见解已经帮助无数人获得了高影响力的职位。

在里面，你将探索真实世界的行业 workflow（工作流）、高级架构方法，以及来自 NVIDIA、Microsoft 和 OpenAI 等公司领导者的专家观点。从发现 ChatGPT 背后的技术到学习如何构建将研究转化为改变世界产品的系统，这本电子书是你加速职业生涯的终极伙伴。你可以 [下载免费副本](https://www.lunartech.ai/download/the-ai-engineering-handbook) 并开始精通 AI 的未来。

## 第 16 节：参考来源

本手册使用的 OpenAI 官方来源：

- [Introducing GPT-5.5（OpenAI）](https://openai.com/index/introducing-gpt-5-5/)

- [将 Codex 用于你的 ChatGPT 计划](https://help.openai.com/en/articles/11369540-codex-in-chatgpt-faq)

- [Enterprise、Edu 和 Business 计划的灵活定价](https://help.openai.com/en/articles/11487671-flexible-pricing-for-the-enterprise-edu-and-team-plans)

- [所有模型](https://developers.openai.com/api/docs/models/all)

- [OpenAI API 模型概览](https://developers.openai.com/api/docs/models)

- [GPT-5-Codex 模型](https://developers.openai.com/api/docs/models/gpt-5-codex)

- [GPT-5.2-Codex 模型](https://developers.openai.com/api/docs/models/gpt-5.2-codex)

- [codex-mini-latest 模型](https://developers.openai.com/api/docs/models/codex-mini-latest)

- [Codex 用例](https://developers.openai.com/codex/use-cases)

- [Claude 概览](https://docs.anthropic.com/en/docs/overview)

- [GitHub Copilot 文档](https://docs.github.com/en/copilot/)

- [Codex 企业管理员设置](https://developers.openai.com/codex/enterprise/admin-setup)

- [Codex IDE 扩展文档](https://developers.openai.com/codex/ide)

- [Codex — OpenAI 的编程 agent（VS Code Marketplace 列表）](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)

- [Codex Web（云端）文档](https://developers.openai.com/codex/cloud)

- [Codex CLI 文档](https://developers.openai.com/codex/cli)

- [Codex CLI 命令行参考](https://developers.openai.com/codex/cli/reference)

- [Codex CLI 功能](https://developers.openai.com/codex/cli/features)

- [Codex 快速入门](https://developers.openai.com/codex/quickstart)

- [将 Codex 用于你的 ChatGPT 计划（帮助中心）](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)

[第 2 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-2-where-codex-fits-in-the-openai-ecosystem) 和 [第 11 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-11-model-specs-and-benchmarks-gpt-55-deep-dive) 中引用的 GPT-5.5 发布新闻报道：

- [OpenAI releases GPT-5.5, bringing company one step closer to an AI 'super app'（TechCrunch）](https://techcrunch.com/2026/04/23/openai-chatgpt-gpt-5-5-ai-model-superapp/)

- [OpenAI launches GPT-5.5, calling it "a new class of intelligence"（The New Stack）](https://thenewstack.io/openai-launches-gpt-5-5-calling-it-a-new-class-of-intelligence/)

- [OpenAI's GPT-5.5 benchmarks show a 60% hallucination drop and coding skills that rival senior engineers（Startup Fortune）](https://startupfortune.com/openais-gpt-55-benchmarks-show-a-60-hallucination-drop-and-coding-skills-that-rival-senior-engineers/)

## 附录 A：30-60-90 天推行计划

如果你正在向团队引入 Codex，建立信任的最快方式是将推广分成阶段进行，而不是一次性全面铺开。分阶段的计划还可以帮助你在早期发现真正的摩擦所在：认证、权限、prompt（提示）质量、审查习惯或预算假设。

### 前 30 天：证明价值

在第一个月，目标不是最大化使用量。目标是可复现的成功。

推荐行动：

1.  挑选一到两名乐于尝试新工具的工程师。

2.  将使用限制在小型、低风险任务上，如 bug 修复、测试生成和文档更新。

3.  标准化一个简短的 prompt（提示）模板，使每个请求都包含任务、上下文、约束和预期输出。

4.  要求对每个变更进行人工审查。

5.  跟踪从 prompt（提示）到合并 diff（差异）的时间。

在这个阶段你应该学到的东西：

- Codex 理解你的代码库结构吗？

- Diff（差异）可审查吗？

- 审批流程是以有用的方式还是令人沮丧的方式使人们减慢？

- 哪些类别的任务效果很好，哪些类别需要更多指导？

如果第一个月很嘈杂，不要首先责怪模型。通常问题是任务范围、缺失的上下文或不明确的验收标准。

### 第 31-60 天：谨慎扩展

一旦工具在一批任务上证明了自己，就扩展到更广泛的试点组。

推荐行动：

1.  从技术栈不同部分添加更多开发者。

2.  至少包含一个持怀疑态度的人，因为他们的反馈将揭示薄弱环节。

3.  并行试用应用、CLI 和 IDE 扩展，以便人们可以选择匹配他们习惯的 workflow（工作流）。

4.  为一两个后台任务或 pull request（拉取请求）审查引入 Codex Cloud。

5.  开始记录效果好的 prompt（提示），包括高质量跟进指令的示例。

在这个阶段你应该学到的东西：

- 团队实际坚持使用哪些界面？

- Codex 在哪里节省最多时间？

- 人们是否足够信任输出来委托真正的工作？

- 你是否看到相同错误反复出现？

在这个阶段，你的内部文档很重要。一份简短的"我们在这里如何使用 Codex"页面通常比另一份技术深入分析更有用。

### 第 61-90 天：运营化

大约三个月后，你的目标应该从实验转向运营实践。

推荐行动：

1.  为 workspace（工作区）设置、GitHub Connector（连接器）设置和模型访问分配负责人。

2.  定义哪些任务应该留在本地，哪些可以放到云端 sandbox（沙箱）。

3.  记录你对 Codex 生成 diff（差异）的审查标准。

4.  与团队设定期望，这样没有人会因为消耗大量 token 的任务感到惊讶。

5.  将 Codex 添加到新工程师的入职流程中，从一个简单流程开始。

这个阶段的理想状态是什么样的：

- 新员工第一天就能使用 Codex。

- 团队成员知道何时使用 Codex 以及何时使用不同的 workflow（工作流）。

- 管理员能快速回答访问和定价问题。

- 组织对该工具的优势和局限有现实的了解。

### 一个实用的入职脚本

如果你需要一个现成的入职指导给新用户，使用以下流程：

1.  "安装 CLI 或扩展。"

2.  "打开一个你熟悉的仓库。"

3.  "要求 Codex 做一个小的、安全的变更。"

4.  "逐行审查 diff（差异）。"

5.  "运行测试。"

6.  "要求 Codex 解释它改了什么以及为什么。"

7.  "用一个稍大的任务重复。"

这个序列教会了核心循环：上下文、任务、变更、审查、验证。一旦用户理解了这个循环，产品的其余部分就会更容易被掌握。

## 附录 B：术语表

本手册中使用的术语，按字母顺序排列。列表有意保持精简——仅包含正文中出现且非工程背景读者（采购、安全、领导层）可能不熟悉的术语。

- **Agent / Agentic Workflow（智能体 / 智能体式工作流）。** 可以接收目标、规划步骤、执行操作（读取文件、运行命令、调用 API）、观察结果并迭代的软件。Codex 是一个 agentic（智能体式）编程 workflow（工作流）；聊天机器人不是。

- **Approval mode（审批模式）。** 控制 agent（智能体）在未经询问的情况下能做多少事情的 Codex 设置。更严格的模式在运行 shell 命令或修改文件前提示人工确认；宽松模式让 agent 不受中断地工作。

- **CLI（命令行界面）。** Codex CLI 是基于终端的 Codex 版本，通过 `npm i -g @openai/codex` 安装。

- **Codex Cloud（云端）。** Codex 的托管、沙箱化执行模式。任务在配备仓库的隔离环境中运行，并以可审查的 diff（差异）结束。

- **GDPval。** 一个基准测试，评估模型在 44 种职业中产出规范知识工作输出的能力。在 [第 11 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-11-model-specs-and-benchmarks-gpt-55-deep-dive) 中用作通用能力信号。

- **GitHub Connector（连接器）。** 允许 Codex Cloud 访问 GitHub repository（仓库）的集成。云端任务必需；使用短期、最小权限的 token（令牌）。

- **MCP（模型上下文协议）。** 一种开放协议，用于将模型连接到外部数据源和工具。Codex CLI 支持 MCP，使其能从仓库之外的系统拉取数据。

- **MRCR v2。** 一个长上下文检索基准测试，衡量模型是否能在非常大的输入窗口中查找和使用信息。在 GPT-5.5 相关章节中引用了 100 万 token 版本，因为它预测仓库级任务上的行为。

- **OSWorld-Verified。** 衡量模型能否操作真实桌面计算机环境以完成任务的基准测试。是 agentic（智能体式）和计算机使用 workload（工作负载）的直接代理指标。

- **PR（Pull Request，拉取请求）。** 对代码仓库的提议变更，托管在 GitHub 或类似平台上，审查者在变更合并前进行审批。

- **RBAC（基于角色的访问控制）。** 一种权限模型，其中用户被分配到角色，角色具有特定权限。由 Codex workspace（工作区）管理员用来控制谁可以做什么。

- **SCIM（跨域身份管理系统）。** 一种将从身份提供方（Okta、Entra ID 等）同步用户和组到另一个系统的标准。Codex 为 Enterprise 支持基于 SCIM 的组同步。

- **Subagent（子智能体）。** Codex CLI 的一项功能，将任务拆分为多个并行 agent（智能体）运行，每个处理一部分工作。

- **Tau2-bench Telecom。** 针对包含工具使用的复杂客服 workflow（工作流）的基准测试。被引用为工具使用可靠性和策略遵循的标志。

- **Terminal-Bench 2.0。** 一个聚焦于终端驱动 workflow（工作流）的编码基准测试，包含长上下文检索和计算机使用。最接近 Codex CLI workload（工作负载）的公开代理指标。

- **Worktree（工作树）。** 一个 git 功能，允许多个分支同时在不同目录中检出。Codex 应用使用 worktrees，使多个 agent 可以并行工作，互不干扰。

- **WSL（Windows Subsystem for Linux，适用于 Linux 的 Windows 子系统）。** 一个兼容层，在 Windows 上原生运行 Linux 二进制文件。是在 Windows 上使用 Codex CLI 的推荐环境，因为直接 Windows 支持是实验性的。

## 附录 C：管理员安全清单

面向为企业设置 Codex 的 workspace（工作区）管理员。此清单浓缩了 [第 8 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-8-security-permissions-and-enterprise-setup) 的内容为可操作项。在广泛推广前逐项检查，然后每季度复查。

**访问权限**

- [ ] 决定在 workspace（工作区）级别启用 Codex Local、Codex Cloud 或两者。

- [ ] 为 Codex Admins（管理员）（策略和治理）和 Codex Users（用户）（日常开发者）创建独立的 RBAC（基于角色的访问控制）组。避免将两者混合。

- [ ] 通过 SCIM（跨域身份管理系统）从你的身份提供方同步用户和组成员资格，而不是手动管理用户。

- [ ] 为新的 workspace（工作区）成员设置合理的默认角色。不要默认设为管理员。

**GitHub 集成**

- [ ] 将 ChatGPT GitHub Connector（连接器）针对正确的 GitHub 组织进行安装。

- [ ] 仅将 Codex Cloud 需要的仓库列入白名单。不要默认授予组织范围的访问权限。

- [ ] 在对受保护分支启用云端任务之前，验证 Codex 尊重受保护分支上的现有分支保护规则。

- [ ] 确认 Codex 使用的 GitHub App token（令牌）是短期且最小权限的。

**网络与运行时**

- [ ] 确认 Codex Cloud 默认无互联网访问权限运行。这是安全默认值；验证它已开启。

- [ ] 如果某个 workflow（工作流）需要互联网访问，定义明确的允许列表（依赖注册表、受信任站点）并限制允许的 HTTP 方法。

- [ ] 记录哪些模型界面被批准用于敏感代码（通常：本地 CLI 可以，云端不行，对于最敏感的仓库）。

**数据与审查**

- [ ] 记录团队对 Codex 生成 diff（差异）的审查标准。最低要求：人类批准每一次合并。

- [ ] 根据你的合规要求，确认为 Codex 操作（使用的模型、prompt、变更的文件）配置了日志记录和审计追踪。

- [ ] 定义哪些类型的数据禁止 Codex 处理（PII（个人身份信息）、客户数据、密钥）以及这些边界如何执行。

- [ ] 为 Codex 生成或提交了不该有内容的情况建立事故响应手册。

**预算与持续运营**

- [ ] 设置每个 workspace（工作区）的 token 预算或告警阈值，以便尽早发现意外支出。

- [ ] 为每个任务类型选择默认模型（例如，常规审查用 Codex-mini，仓库范围重构用 GPT-5.5）并记录该选择。

- [ ] 每季度审查 Codex 定价页面。费率表过去已经变更，将来还会变更。

- [ ] 在以下情况下重新检查本清单：（a）有重大模型发布，（b）workspace（工作区）扩展到新团队，或（c）Codex 增加了新界面或功能。

## 附录 D：更新日志

一份简短、仅追加记录本手册实质性修订的日志。每个条目列出版本、日期和变更内容的一行摘要。

- **v1.3 — 2026-04-30。** 使目录可点击。在目录后添加了新的前置条件部分。重组了开头章节：将旧的"快速入门"和"如何设置 Codex"合并为单一 [第 4 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-4-getting-started-install-set-up-and-your-first-task) 演练，使用读者自己搭建的自包含 `codex-demo` 仓库。通过将 GPT-5.5 基准测试深入分析移至新的 [第 11 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-11-model-specs-and-benchmarks-gpt-55-deep-dive)（模型规格与基准测试）来精简了 [第 2 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-2-where-codex-fits-in-the-openai-ecosystem)。为 [第 3 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-3-the-core-surfaces) 添加了各界面超链接。重写了 [第 5 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-5-how-to-use-codex-effectively)（如何有效使用 Codex），为每条提示提供了坏/好示例，并定义了"有边界变更"。重写了"衡量真正重要的指标"子节，为每个指标提供了具体计算方法。为 [第 10 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-10-common-workflows-and-examples) 中的所有 workflow（工作流）添加了可运行的实际示例。相应地对下游章节重新编号。

- **v1.2 — 2026-04-25。** 添加了附录 E（在 VS Code 中使用 Codex），一份详细的分步指南，涵盖三种 VS Code 入口点——扩展、集成终端中的 CLI 和 chatgpt.com/codex 的浏览器版 Codex——包含设置说明、决策矩阵、组合 workflow（工作流）模式以及 VS Code 专属故障排查。在设置部分添加了前向指引。

- **v1.1 — 2026-04-25。** 在 [第 2 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-2-where-codex-fits-in-the-openai-ecosystem) 和 [第 7 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-7-pricing-and-plan-access) 中添加了 GPT-5.5 / GPT-5.5 Pro 覆盖。添加了执行摘要、模型比较部分的对比矩阵、实际成本案例、[第 14 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-14-when-not-to-use-codex) 中的"何时不应使用 Codex"。添加了附录 B（术语表）、附录 C（管理员安全清单）、附录 D（更新日志）。添加了版本印戳和作者行。[第 16 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-16-source-references) 中添加了 GPT-5.5 的新闻报道来源。

- **v1.0 — 初始发布。** 原始的 Codex 入门手册，涵盖界面、设置、使用、模型比较、定价、安全、团队实践、workflow（工作流）、故障排查、常见问题和 30-60-90 天推行计划。

## 附录 E：在 VS Code 中使用 Codex

本附录是一份专注、分步的指南，教你在 Visual Studio Code（及其分支 Cursor 和 Windsurf）中使用 Codex。

VS Code 是大多数新 Codex 用户最常见的起始界面，该 workflow（工作流）有三个可以独立使用或组合使用的不同入口点。本指南涵盖每个入口点、何时选择它，以及三者如何组合成一个流畅的 workflow（工作流）。

### E.1 为什么 VS Code 是推荐的起始界面

大多数团队从 VS Code 开始而非独立的 Codex 应用或纯 CLI，有几个实际原因：

- 编辑器已经是工程师日常所在的地方。添加 Codex 不需要上下文切换。

- 扩展界面的面积小且可审查。工程师可以在更广泛采用之前先在单个文件上试用。

- VS Code 的集成终端使 CLI 成为一种一键体验，因此扩展和 CLI 可以在不离开编辑器的情况下组合使用。

- Cursor 和 Windsurf——最流行的 VS Code 分支——都运行相同的 Codex 扩展。一个标准化使用 VS Code workflow（工作流）的团队，即使一些工程师偏好分支，也不必重新培训。

从 VS Code 开始的缺点是：你不会开箱即用得到并行任务管理或 worktree（工作树）支持——这些在 Codex 应用中更强。对大多数个体贡献者来说，这在第一个月不是一个有意义的损失。

### E.2 三种入口点

Codex 在 VS Code 中以三种不同的方式出现，它们很容易混淆。每种都是独立的软件，有自己的安装和认证握手，即使它们都用同一个 ChatGPT 账号登录。

1.  **Codex VS Code 扩展** — VS Code 内部的侧边栏 UI。从 VS Code Marketplace 安装。最适合流内编辑、快速提问关于已打开文件以及短的有边界任务。

2.  **在 VS Code 集成终端内运行的 Codex CLI** — 在已经连接到你的 VS Code workspace（工作区）的终端面板中运行的命令行 agent（`codex`）。最适合多步骤 agentic（智能体式）任务、脚本化运行以及任何你想要显式审批关卡的事情。

3.  **chatgpt.com/codex 的浏览器版 Codex** — Codex Cloud 的 Web 界面，任务在隔离的 sandbox（沙箱）中针对你的 GitHub 仓库运行。最适合后台工作、并行任务和 PR 式审查。

这些不是"你必须选择一个"意义上的替代品。它们是针对不同类型工作的三种 workflow（工作流），大多数有经验的 Codex 用户会设置全部三种。

### E.3 设置 Codex VS Code 扩展

这是大多数新用户首先遇到的入口点。

**安装**

有两种安装路径：

1.  打开 VS Code Marketplace，搜索"Codex"或"ChatGPT"，安装由 `openai` 发布的扩展。marketplace 标识为 `openai.chatgpt`。

2.  从终端运行：

```
code --install-extension openai.chatgpt
```

CLI 安装路径对于脚本化的开发环境配置、dotfiles 仓库以及将新机器设置到已知基准的入职脚本非常有用。

**登录**

安装后，Codex 面板出现在右侧边栏中。第一次打开它时，系统会提示你登录。你有两个选项：

- **使用 ChatGPT 登录。** 推荐给 Plus、Pro、Business 或 Enterprise/Edu 计划的个人用户。用量从你计划包含的 Codex 额度中扣除。

- **使用 API key（密钥）登录。** 当你想使用按量 API 计费而非基于计划的用量时，或者你的 workspace（工作区）策略要求时使用。从 OpenAI 开发者控制台获取密钥，然后粘贴到扩展的认证提示中。

如果两个选项都可见而你不确定选哪个，默认使用 ChatGPT 登录。这是你的团队中其他人正在使用的相同计划涵盖的用量，这使得成本行为可预测。

**首次运行健全性检查**

登录后，在依赖扩展进行真实工作之前，进行五分钟的健全性检查：

1.  打开一个你熟悉的小型仓库。

2.  在右侧边栏中打开 Codex 面板。

3.  问一个关于已打开文件的问题（例如，"这个函数做什么？"）并确认答案与你已知的匹配。

4.  请求一个小的变更（例如，"为这个函数添加一个 docstring"）并确认出现了可审查的 diff（差异）。

5.  应用变更，运行测试，并在需要时回滚。

如果其中任何步骤失败，在做其他事情之前先修复认证或安装。在一个已知的玩具任务上调试扩展比在一个真实任务上调试要容易得多。

**平台说明**

- **macOS 和 Linux** 是一级支持。扩展和底层 CLI 都可以原生工作。

- **Windows** 对 CLI 是实验性的。扩展本身可以工作，但如果你也想在 VS Code 的集成终端中运行 CLI，OpenAI 建议使用 WSL workspace（工作区）。在安装 CLI 之前，通过"Reopen in WSL"打开文件夹。

- **Cursor 和 Windsurf** 运行相同的扩展。注意与分支内置 AI 功能的视觉或快捷键冲突——见 E.9 了解具体信息。

### E.4 在 VS Code 集成终端中设置 Codex CLI

CLI 是第二个入口点。它作为普通的命令行工具运行，但在 VS Code 的集成终端中它会自动获取活动 workspace（工作区）文件夹，这使得它感觉像是编辑器的原生部分。

**安装 CLI**

从任何终端，包括 VS Code 的集成终端：

```
npm i -g @openai/codex
```

这会全局安装 `codex` 二进制文件。通过运行以下命令确认：

```
codex --version
```

如果找不到命令，最常见的原因是 npm 的全局 bin 目录不在你的 PATH 中。要么修复 PATH，要么使用处理此问题的 Node 版本管理器（nvm、fnm、volta）。

**在 VS Code 中打开集成终端**

有三种方式打开它，选择符合你习惯的：

- 查看菜单 → 终端。

- 键盘快捷键 **Ctrl+`**（反引号）在 Windows/Linux 上，**⌃`** 在 macOS 上。

- 命令面板：`Terminal: Create New Terminal`。

集成终端将活动 workspace（工作区）文件夹继承为其工作目录，这意味着从那里启动的 `codex` 会立即看到正确的仓库。

**运行 Codex**

在终端中，导航到仓库（如果你还没有在那里）并运行：

```
codex
```

第一次运行时，你将经历与扩展相同的认证流程——使用 ChatGPT 登录或粘贴 API key（密钥）。

**选择审批模式**

CLI 支持多种审批模式，控制 Codex 在未经明确确认的情况下能做多少事情。对于新用户，从最严格的模式开始（在执行每个 shell 命令和每个文件变更前询问），然后在你信任你的仓库上的 workflow（工作流）后放宽。相关模式及如何切换在 [第 16 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-16-source-references) 链接的 CLI 文档中描述。

**CLI 优于扩展的地方**

- 需要读取多个文件、运行测试、迭代并报告的多步骤 agentic（智能体式）运行。

- 任何你想脚本化或从 `package.json` 脚本、Makefile 或 CI 步骤中调用的东西。

- Subagent（子智能体）分解（CLI 明确支持将任务拆分为多个并行 agent（智能体）运行）。

- MCP 连接的工具和自定义数据源。

- 当不想离开键盘时，从终端启动云端任务。

### E.5 设置浏览器版 Codex（chatgpt.com/codex）

第三个入口点在 VS Code 外部，但对完整 workflow（工作流）来说是必需的，因为它是你启动和监控云端任务的方式。

**打开浏览器版 Codex**

导航到 **chatgpt.com/codex**。你需要使用与扩展和 CLI 相同的 ChatGPT 账号登录。如果你是某个企业 workspace（工作区）的成员，你的管理员必须在 workspace（工作区）级别启用了 Codex Cloud——见 [第 8 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-8-security-permissions-and-enterprise-setup)。

你也可以通过常规 ChatGPT 的侧边栏访问 Codex。浏览器界面暴露两个主要动作：

- **Code（编码）** — 分配一个编程任务。Codex 启动一个预加载了你的仓库的 sandbox（沙箱），并产出可审查的 diff（差异）。

- **Ask（提问）** — 在不更改任何代码的情况下询问关于你的代码库的问题。

**连接 GitHub 仓库**

云端任务需要一个 GitHub 托管的仓库。连接一次：

1.  在 chatgpt.com/codex 打开环境设置。

2.  通过 ChatGPT GitHub Connector（连接器）连接你的 GitHub 账号。

3.  授予 Codex 能够使用的特定仓库的访问权限。不要默认授予组织范围的访问权限——见附录 C 的安全清单。

4.  确认连接器显示该仓库为可用。

**启动任务**

从 Codex Web 界面：

1.  选择仓库和（可选）分支。

2.  输入描述任务的 prompt（提示）。要具体——"为 `/users` POST 端点添加输入验证并更新匹配的测试"比"改进 API"好。

3.  点击 **Code**（或 **Ask** 用于非变更性问题）。

4.  当 Codex 工作时观看实时日志，或关闭标签页让它后台运行。

5.  完成后，审查 diff（差异）。从那里你可以请求更改、接受结果或发起 pull request（拉取请求）。

**从 GitHub PR 评论中委托**

一个有用的快捷方式：在已连接仓库的任何 PR 中，你可以发布一条标记 `@codex` 的评论并附上指令（例如，"@codex review this PR for security issues and missing tests"）。Codex 会接收请求并在 PR 上响应。这需要在同一浏览器中已登录 ChatGPT。

**为什么浏览器界面即使你生活在 VS Code 中也很重要**

云端任务将 Codex 与你的本地机器分离。你可以从浏览器启动一个长时间运行的任务，合上笔记本，稍后再回来查看 diff（差异）。扩展和 CLI 做不到这一点——它们需要一个打开的 VS Code 实例才能运行。

### E.6 何时选择哪个入口点

三个入口点有重叠，这会造成混淆。此表使选择变得机械化。

| 场景                                     | 最佳入口点                       | 原因                                                                                                                                                        |
| ---------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 对已打开的文件进行快速编辑               | 扩展                             | 摩擦最小，无需上下文切换                                                                                                                                    |
| "这个函数做什么？"                       | 扩展                             | 右侧边栏问答比在终端中输入更快                                                                                                                              |
| 带测试的多文件重构                       | 集成终端中的 CLI                 | 在多步骤 agentic（智能体式）工作和审批方面更强                                                                                                              |
| 任何你想脚本化或接入 Makefile 的         | CLI                              | 只有 CLI 是可以从其他脚本调用的                                                                                                                             |
| 你想让它保持运行的长时间任务             | 浏览器（云端）                   | 与你的笔记本解耦                                                                                                                                            |
| 并行任务（例如，三个同时进行的独立修复） | 浏览器（云端）                   | Cloud sandbox（沙箱）并行运行，没有本地资源争用                                                                                                             |
| 对同事 pull request 的 PR 审查           | 浏览器，通过在 PR 中 @codex 提及 | 存在审查实际发生的地方                                                                                                                                      |
| 任何涉及生产凭证或实时基础设施的         | 没有任何明确人工批准的都不行     | 见 [第 14 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-14-when-not-to-use-codex) |

浮现的模式：**流内编辑用扩展，严肃的本地 agentic（智能体式）工作用 CLI，任何你想卸载或与团队共享的用浏览器。**

### E.7 组合的 VS Code Workflow（工作流）

三个入口点组合使用时最强大。一个有代表性的工作日看起来是这样的。

**早晨，在 VS Code 中：**

1.  打开仓库。Codex 扩展面板在右侧边栏中。

2.  使用扩展在接触一个不熟悉的模块之前询问关于它的问题。

3.  进行小的内联编辑——单函数变更、docstring、类型修复——使用扩展的 diff 应用流程。

**上午中段，在集成终端中：**

1.  打开集成终端（Ctrl+`）。

2.  运行 `codex` 并以显式审批模式启动一个多文件任务："重构认证中间件以使用新的会话接口。先列出你打算触碰的文件，然后以尽可能小的提交进行更改。"

3.  当 Codex 请求时，批准每个 shell 命令和每个 diff（差异）。

4.  当 Codex 完成时运行测试套件。

**下午，在浏览器中：**

1.  当你在审查上午的 CLI 更改时，在另一个标签页中打开 chatgpt.com/codex。

2.  启动一个云端任务："为 `/api/v2` 目录中的每个公共端点添加 OpenAPI 注解。"这需要一些时间。

3.  切换回 VS Code 继续工作。云端任务在它自己的 sandbox（沙箱）中运行。

4.  当云端任务完成时，在浏览器中审查 diff（差异），请求任何调整，并发起一个 PR。

**一天结束，在 GitHub 上：**

1.  在同事的开放 PR 上标记 `@codex` 并附上"审查正确性和缺失的测试。"结果作为评论在夜间到达。

组合 workflow（工作流）的要点是每个入口点同时在它最擅长的事情上工作。扩展保持流内编辑快速，CLI 处理你想要审批控制的本地 agentic（智能体式）工作，云端处理长时间运行和并行任务而不消耗你的本地机器。

### E.8 VS Code 专属提示

这些是当你在 VS Code 内日常使用 Codex 后会随时间积累的小提示。

- **侧边栏位置。** Codex 面板默认在右侧边栏。如果你也有 GitHub PR 审查或另一个面板在那里，将 Codex 拖到次要侧边栏或面板底部 dock——无论哪种方式都能保持它可见而不占用编辑器空间。

- **键盘快捷键。** 通过 VS Code 的 `Preferences: Open Keyboard Shortcuts` 将最常用的 Codex 命令（打开面板、新建任务、接受 diff）绑定到键盘快捷键。用键盘而非鼠标操作。

- **设置同步。** 如果你使用 VS Code 的设置同步，Codex 扩展的设置会随你传输到其他机器。认证状态不会——你需要在每台机器上重新登录。这是正确的行为；不要绕过它。

- **多根 workspace（工作区）。** 扩展限定到活动 workspace 文件夹。如果你打开一个多根 workspace，在要求 Codex 做更改之前显式切换活动文件夹，否则它可能会针对错误的根目录操作。

- **集成终端配置文件。** 如果你使用多个终端配置文件（PowerShell、bash、WSL），在 Windows 上将 WSL 配置文件设为默认，使得从集成终端启动的 `codex` 总是在受支持的环境中。

- **源代码管理面板。** 在 Codex 应用更改后，VS Code 源代码管理面板会显示 diff（差异）。在提交之前在那里审查——它给你与 `git diff` 相同的上下文而不离开编辑器。

- **不要对抗审批模式。** 新用户往往太快将审批放宽到"自动"，因为 prompt（提示）感觉慢。在第一周抵制这种诱惑。审批是你建立 Codex 在你的仓库中实际做什么的心理模型的方式。

- **每个 VS Code 窗口一个 Codex 面板。** 避免在同一任务上同时在同一个 workspace 中运行扩展和 CLI——它们都可以触碰文件，你会混淆哪一个做了哪个变更。

### E.9 Cursor 和 Windsurf

Codex 扩展明确支持 Cursor 和 Windsurf——最流行的两个 VS Code 分支。安装和登录流程完全相同。值得注意的说明：

- **避免双重 AI 混淆。** Cursor 和 Windsurf 都内置了各自的 AI 功能。使用它们与 Codex 的工程师有时会在想要调用 Codex 时意外调用了分支的内置 AI，反之亦然。选择一个主要编辑工具，仅在特定优势重要时使用另一个。

- **认证是独立的。** Codex 扩展的 ChatGPT 登录与 Cursor 或 Windsurf 自己的模型账号是分开的。你的 Codex 用量按照你的 ChatGPT 计划计费；Cursor/Windsurf 用量按照它们自己的计划计费。

- **快捷键冲突。** Cursor 特别有大量自定义 AI 相关快捷键。在安装 Codex 扩展后审核你的快捷键绑定，确保两个界面都可访问。

- **设置同步注意事项。** Cursor 和 Windsurf 有各自的设置同步，与上游 VS Code 不同。Codex 扩展设置可能会在 Cursor 或 Windsurf 内与你的 VS Code 安装分别同步。

对于纯 Codex 第一的团队，标准 VS Code 是最简单的基准。对于因其他原因已标准化使用 Cursor 或 Windsurf 的团队，Codex 扩展是一个干净的补充而非替代。

### E.10 VS Code 专属故障排查

通用故障排查列表在 [第 12 节](https://www.freecodecamp.org/news/the-codex-handbook-a-practical-guide-to-openai-s-coding-platform/#heading-section-12-troubleshooting)。以下问题特定于在 VS Code 中运行 Codex。

**扩展安装了但侧边栏面板从未出现**

重新加载窗口（命令面板 → "Developer: Reload Window"）。如果未修复，检查 Output 面板，将下拉菜单切换到"Codex"，并查找实际错误。最常见的原因是企业代理阻止了扩展的认证握手，或者仍然安装了冲突的旧版扩展。

**"登录"一直循环回到登录提示**

这通常意味着浏览器认证流程的重定向未能到达扩展。尝试完全退出登录，关闭所有 VS Code 窗口，然后重新打开并全新登录。在 Windows 上，验证你的默认浏览器是 VS Code 可以通过操作系统处理程序打开的浏览器。

**集成终端中 `codex` 命令找不到**

CLI 的 npm 全局 bin 目录不在 PATH 中。在 macOS/Linux 上最快的修复是将 `$(npm bin -g)` 添加到你的 shell 配置文件（`.zshrc`、`.bashrc`）中。在 Windows 上，在 npm 安装后重启 VS Code，使集成终端获取更新后的 PATH，或切换到 WSL 终端，那里的安装已经在 PATH 中。

**云端任务说"没有已连接的仓库"尽管你已经连接了一个**

在 chatgpt.com/codex 环境设置中验证特定仓库是否在允许列表中。GitHub Connector（连接器）授予的是按仓库访问权限；仅授予组织访问权限是不够的。另请确认你的 workspace（工作区）管理员已启用 Codex Cloud——个人用户不能自己启用。

**扩展和 CLI 同时编辑同一个文件**

停止其中一个。它们不会协调，你会得到冲突的编辑。最简单的纪律：每个任务选择一个入口点，在任务之间切换而非在任务内组合。

**对于相同的 prompt（提示），扩展感觉比 CLI 慢**

通常这是因为扩展使用的默认模型与你的 CLI 配置不同。检查两者的活动模型——扩展面板中的模型选择器，以及 CLI 的 `codex --help` 或相关配置文件。

**Windows 行为普遍不好**

切换到 WSL workspace（工作区）。OpenAI 自己的文档指出 Windows 上 CLI 是实验性的；WSL 路径是受支持的，可以一举清除大多数问题。

### **准备好成为 AI 工程师了吗？**

在我们结束对智能医疗的探索时，很明显未来属于那些能够将开创性研究与现实世界效用连接起来的人。如果你受到启发去引领这场转型，我们邀请你下载我们的旗舰资源 **The AI Engineering Handbook**。由 Tatev Aslanyan（一位先锋 AI 工程师和 LUNARTECH 联合创始人）撰写，本指南旨在帮助你驾驭 AI 工程的高度竞争格局，为你提供构建世界变革性产品所需的分步路线图和行业 workflow（工作流）。

用世界上最创新科技公司的 AI 先锋所采用的同样策略来赋能自己。通过掌握这些生产就绪的技能，你不仅能跟上超级互联世界的步伐——你还可以帮助定义它。今天就从这里下载你的电子书开始：[https://www.lunartech.ai/download/the-ai-engineering-handbook](https://www.lunartech.ai/download/the-ai-engineering-handbook)。

## **关于 LunarTech Lab**

_"真正的 AI。真正的 ROI。由工程师交付——而非幻灯片。"_

[**LunarTech Lab**](https://technologies.lunartech.ai/) 是一家深度科技创新合作伙伴，专注于 AI、数据科学和数字化转型——从医疗保健到能源、电信等领域。

我们构建真实的系统，而非 PowerPoint 战略。我们的团队将临床、数据和工程专业知识相结合，设计出可衡量、合规且生产就绪的 AI。我们是供应商中立、全球分布、并植根于真实的 AI 和工程，而非炒作。我们的模式融合了西欧和北美的领导力与高性能技术团队，以四大咨询公司 70% 的成本提供世界级交付。

### 我们的工作方式——从零开始，四个阶段

**1. Discovery Sprint（发现冲刺，2–4 周）：** 我们从数据和 ROI 开始——而非假设——来定义什么值得构建、什么不值得，以及它将花费多少。

**2. Pilot / Proof of Concept（试点/概念验证，8–12 周）：** 我们快速、聚焦、可衡量地制作核心理念的原型。

此阶段在扩展之前测试模型、集成和真实世界的 ROI。

**3. Full Implementation（全面实施，6–12 个月）：** 我们将解决方案工业化——安全的数据管道、生产级模型、完全合规（HIPAA、MDR、GDPR）和知识转移。

**4. Managed Services（托管服务，持续进行）：** 我们维护、重新训练和演进 AI 模型以实现持久的 ROI。季度审查确保性能随时间提高而非衰减。由于我们拥有 [LunarTech Academy](https://academy.lunartech.ai/courses)，我们也构建定制培训以确保客户的技术团队在没有我们的情况下也能继续工作。

每个项目都**从零开始**设计，整合临床知识、数据工程和应用 AI 研究。

### 为什么选择 LunarTech Lab？

LunarTech Lab 弥合了战略与真实工程之间的鸿沟，这是大多数竞争对手跌倒的地方。传统咨询公司，包括四大，销售的是框架而非系统——昂贵的幻灯片几乎没有执行。

我们提供同样清晰的战略，但由构建他们所设计内容的工程师和数据科学家交付，成本约为其 70%。云厂商推动自己的技术栈并将客户锁定其中。LunarTech 是供应商中立的：我们选择对你的目标最佳的东西，确保自由和长期灵活性。

外包公司执行而无创新。LunarTech 像一个研发伙伴一样工作，从第一性原理构建，共同创造 IP，并交付可衡量的 ROI。

从发现到部署，我们结合战略、科学和工程，只有一个承诺：我们不卖幻灯片。我们交付能起作用的智能。

### 与 LunarTech 保持联系

在 [LunarTech NewsLetter](https://substack.com/@lunartech) 和 [**LinkedIn**](https://www.linkedin.com/in/tatev-karen-aslanyan/) 上关注 LunarTech Lab，在这里创新与真实工程相遇。你将从前沿应用 AI 和数据科学的一线获得洞察、项目故事和行业突破。

---

---

免费学习编程。freeCodeCamp 的开源课程已经帮助超过 40,000 人获得了开发者工作。[开始学习](https://www.freecodecamp.org/learn)
