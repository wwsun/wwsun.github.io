---
title: 为智能体打造符合工程人体工学的 Monorepo 代码库
description: Basis Atlas 团队分享如何基于权威上下文、分层架构、可验证性与默认排除等五大原则，重塑 Monorepo 代码库，使每位开发者的 Token 用量提升 5 倍、提交速度提升 2.5 倍。
tags:
  - clippings
  - ai-agent
  - context-engineering
  - monorepo
  - software-engineering
source: https://x.com/trybasis/status/2056881705269580023
created: 2026-05-19
author: Michael Crabtree, Ryan Moffat, Bhavdeep Sethi, Seth Schiesel (Basis)
---

## 为智能体打造符合工程人体工学的 Monorepo 代码库

> **原文**：[Making Our Monorepo Ergonomic for Agents](https://x.com/trybasis/status/2056881705269580023) | 作者：Michael Crabtree, Ryan Moffat, Bhavdeep Sethi, Seth Schiesel | 日期：2026-05-19

## 📝 摘要

在 AI 编码智能体深度融入日常研发的时代，代码库不仅是运行在生产环境中的源代码，更是智能体做出每一次决策赖以参考的上下文环境。不同于人类新员工每月数次的入职，智能体在每一个执行轨迹中都在经历「重新入职」，代码库中细微的矛盾与脱节会被放大成千上万倍。Basis 的 Atlas 团队系统性地重构了其 Monorepo 代码库，提出了五大核心原则（权威性、就近本地化、可验证性、互操作性、默认排除），明确界定了「权威真实源（Canon）」与「非权威历史意图（Not Canon）」的认知边界，设计了由根目录 AGENTS.md、嵌套目录规范、Skills 技能包、专职子智能体角色、统一 MCP 与本地自动化测试构成的六层上下文金字塔架构，并构建了自动化扫描与自我修复的 Automatic Context 机制。改造落地后，在 3 个月内将开发者 Token 消耗提升 5 倍以上、每周提交速度提升 2.5 倍，并实现了全员通过 Git Worktree 并行驱动多个智能体的全新工程协作模式。

## 📋 术语表

| 英文                    | 中文                   | 说明                                                                                                                          |
| ----------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Canonicality / Canon    | 权威性 / 权威上下文    | 代码库中描述系统当前实际运转状态的单一真实源（如当前代码、AGENTS.md、Skills 等），智能体必须视其为事实                        |
| Not Canon               | 非权威上下文           | 记录历史意图、折中妥协与方案演进的上下文（如 Linear 工单、.specs/、.notes/、PR 描述），用于理解「为什么」，但不可作为现状事实 |
| Ergonomic for Agents    | 智能体人体工学         | 让代码库的上下文组织、规则指令与工具链高度契合智能体的理解和推理习惯，减少幻觉与摩擦                                          |
| Authority Map           | 权威性映射表           | 将代码库中各类工件（文件、目录、工单、对话）明确划归不同权威等级的体系结构表                                                  |
| The Context Pyramid     | 上下文金字塔           | 从全局通用（Root AGENTS.md），到按需匹配（Skills），再到局部目录规则（Nested AGENTS.md）的分层加载模型                        |
| Default-no              | 默认排除原则           | 上下文加载的防御性法则：任何自动加载的上下文必须经过严格审视，无法证明带来行为改变的 Token 默认坚决不加载                     |
| Automatic Context       | 自动化上下文系统       | 由云端智能体每日扫描、发现矛盾、分配工单并自动修复规范与指令的上下文自治维护机制                                              |
| Sub-agent roles         | 子智能体角色           | 具备独立上下文窗口的专职智能体（如 verifier、standards-enforcer），在隔离环境中执行测试与合规审查                             |
| Proof-based development | 基于证明的开发         | 以形式化验证、测试断言和代码契约为核心，让智能体产出具备机器可验证确定性的开发范式                                            |
| Unified MCP             | 统一 MCP               | 统一的模型上下文协议服务器，使智能体能自主查询工单、日志、分析事件与测试数据库，无需人工搬运上下文                            |
| Worktree                | 工作树（Git Worktree） | Git 支持的同一仓库并行签出多个工作分支的机制，使工程师能够同时并行驾驭多个编码智能体                                          |

---

## 正文（双语对照）

## How we built an agent-native codebase from principles rooted in verifiability, interoperability, and canonical context

## 基于可验证性、互操作性与权威上下文原则构建智能体原生代码库

At Basis, we’re obsessed with this question: How do we make our codebase ergonomic for agents? There are decades of learnings in software engineering on what a well-designed codebase looks like for humans (small functions, defined modules, no over-bloated documents, etc.). How do we evolve that for agents?

在 Basis，我们始终痴迷于一个问题：如何让我们的代码库对智能体更加符合工程人体工学？在软件工程领域，几十年来关于「对人类友好的优秀代码库长什么样」已经积累了丰富的认知（例如短小的函数、清晰的模块划分、不充斥冗长臃肿的文件等）。那么，面对智能体，我们又该如何演进这些认知？

The Atlas team at Basis is responsible for internal agents and context. Our product is the codebase itself. A codebase is two things at once. It is the source code that runs in production, and it is the context that coding agents use to make decisions. So to make our product truly friendly for our users, we had to make the monorepo as agent-native, as ergonomic, as possible.

Basis 的 Atlas 团队专门负责内部智能体与上下文基础设施。我们的「产品」就是代码库本身。一个代码库同时承担着双重身份：它既是在生产环境中运行的源代码，又是编码智能体用来做决策的上下文。因此，为了让我们的产品对用户真正友好，我们必须让这个单仓库（Monorepo）尽可能具备智能体原生特质、尽可能符合智能体的人体工学。

We did it. In three months, token usage per developer increased more than 5x and commit velocity increased by 2.5x.

我们做到了。在短短三个月内，每位开发者消耗的 Token 数量提升了 5 倍以上，代码提交速度（commit velocity）提升了 2.5 倍。

## Our Vision

## 我们的愿景

Basis has placed a core bet on intelligence. From the very beginning of Basis three years ago, we believed that most of our code would soon be written by agents, and built our company accordingly. We hit that point in intelligence about nine months ago.

Basis 在机器智能上押下了核心赌注。从三年前 Basis 创立之初，我们就坚信绝大部分代码很快都将由智能体来编写，并据此构建了整家公司。大约在九个月前，我们在智能能力上正式跨过了这个拐点。

At that point, it became easy to imagine a world where agents consistently deliver high-quality, well-tested code while engineers focus on the challenging task of actually making engineering decisions.

从那一刻起，我们很容易就能勾勒出这样一个未来：智能体能够稳定输出高质量、测试完备的代码，而工程师则可以专注去解决那些真正富有挑战性的工程决策。

But we weren't there yet. While coding agents are capable in isolation, they are prone to mistakes when dropped into a working codebase without supporting infrastructure.

但当时我们离那个未来还有距离。尽管编码智能体在隔离的玩具场景下表现出色，但一旦被直接扔进一个正在真实运转的代码库中，如果没有底层基础设施的支持，它们极易频频犯错。

This is not a new problem; it's also true of any new hire. A fast-growing company like Basis might onboard multiple engineers every month, so it has always been important to make your codebase easy to learn. But unlike a human, an agent has to "onboard" to the codebase every single trajectory. As we've adopted coding agents, suddenly the "onboardings" at Basis have gone from a handful a month to thousands a month. At this rate, any small inconsistencies, contradictions, and gaps compound quickly, while previously they may have gone unnoticed.

这并不是一个全新的挑战，任何新入职的员工都会遇到同样的情况。像 Basis 这样快速扩张的公司，每月可能会迎来多名新工程师入职，因此让代码库易于学习和理解一直都至关重要。但与人类不同的是，智能体在每一个任务轨迹（trajectory）中都必须重新「入职」一次代码库。随着我们广泛采用编码智能体，Basis 内部的代码库「入职次数」从过去的每月寥寥数次，陡增到了每月数千次。在如此庞大的频次下，代码库中原本难以察觉的微小不一致、规则冲突与认知缺口，都会被迅速复合放大。

## Principles for an Agent-Native Codebase

## 智能体原生代码库的五大原则

![五大原则](/assets/basis-ergonomic-monorepo-principles.png)

The primary levers to empower coding agents are context and tools. To get to our end state of fluent agents, we developed five principles to guide the development of those levers.

赋能编码智能体的两个最核心杠杆是**上下文**与**工具**。为了最终实现智能体如丝般顺畅地开展工作，我们梳理出了五条原则来指导这两大杠杆的建设：

1. Canonicality. Every artifact in the repo is either a source of truth about the system as it is today, or a record of intent and history. It is never both. An agent reading your codebase needs an explicit map of what to trust as a description of reality and what to read as a plan, a hypothesis, or a memory.

1. **权威性（Canonicality）**：代码库中的每一项工件，要么是系统当前真实运转状态的单一事实源（source of truth），要么是对历史意图与过程的记录。它绝不能两者兼具。智能体在阅读代码库时，需要一张明确的认知地图，清楚知道哪些内容可以当作系统客观现实全盘信任，哪些内容只能当作计划、假设或历史记忆来参考。

1. Localization. Context should live as close to where it is used as possible. It only moves up as it becomes more generally applicable. This reduces the likelihood that agents miss relevant context.

1. **就近本地化（Localization）**：上下文应当尽可能存放在靠近其使用位置的地方。只有当它变得更加具有普适性时，才向上一层目录提升。这能显著降低智能体遗漏相关上下文的几率。

1. Verifiability. Agents need verification of their work. We built mechanisms to enforce that, including sub-agent roles, pre-commit hooks, and tests.

1. **可验证性（Verifiability）**：智能体的工作必须能够被机器验证。我们为此构建了强约束机制，涵盖专职子智能体角色、Pre-commit 钩子以及自动化测试。

1. Interoperability. No layer of the architecture binds the team to a single vendor. AI technology is moving too fast to bet on a single platform. Locking into a vendor this early in AI development risks missing large benefits down the road.

1. **互操作性（Interoperability）**：整个架构的任何一层都不与任何单一厂商强绑定。AI 技术演进的速度过于迅猛，押注在单一平台上极具风险。在 AI 发展的早期阶段就被单一厂商锁死，很可能会错失未来技术浪潮的巨大利好。

1. Default-no. Any context that is loaded automatically must be scrutinized closely. Tokens that earn no behavior are a tax on every session, paid by every agent and every engineer. Stating it negatively is intentional. When the default is "include," loaded files balloon; when the default is "exclude," every line earns its place.

1. **默认排除（Default-no）**：任何会被自动加载的上下文都必须受到极其严格的审查。无法改变智能体行为的 Token 纯属是对每一次会话征收的税负，代价由每一个智能体和每一位工程师共同承担。以否定句式来表述这条原则是有意为之的：当默认规则是「包含」时，加载的文件会无限膨胀；而当默认规则是「排除」时，写入的每一行文字都必须证明自己的不可或缺。

The architecture we built is the implementation of these principles in code.

我们构建的这套架构，正是将上述原则在代码与工程落地上的具体实现。

## Canon vs. Not Canon

## 权威与非权威

The first step in applying our principles was categorizing existing context into canonical and non-canonical categories. This was a rigorous process that forced the team to gather and collate many types of information from across the codebase, and then engage in intense discussions to reconcile them. Through that reconciliation process, we formalized our approach in a documentation-standards document that maps every artifact type in the repo to an authority level.

践行这套原则的第一步，是将既有的所有上下文清晰划分为「权威（Canonical）」与「非权威（Non-canonical）」两大类别。这是一个极其严谨的过程，团队不得不从整个代码库中搜集并整理各种类型的信息，随后展开了密集的讨论与调和。通过这次调和与对齐，我们将沉淀的方法固化为一份文档规范，把仓库中的每一种工件类型都映射到了明确的权威等级。

Canon is material a coding agent should treat as a source of truth about how the system works today. It includes root and nested AGENTS.md files, skills, the docs/ directory, and inline code comments and docstrings. These artifacts say, "This is the current state and how we work in it."

**权威上下文（Canon）** 是编码智能体应当视作系统当前实际运转状态的真实事实源。它包括根目录与嵌套目录中的 `AGENTS.md` 文件、技能包（Skills）、`docs/` 目录，以及行内代码注释和文档字符串（docstrings）。这些工件所表达的核心语义是：「这是系统当下的现状，也是我们当前的工作方式。」

Not canon is useful context that is not a source of truth about the current codebase. It includes plans and specs (.specs/ and Linear), and historical rationale (.notes/).

**非权威上下文（Not canon）** 则是那些对理解系统有帮助、但绝不能当作当前代码库单一事实源的有用上下文。它包括规划与规格说明（`.specs/` 以及 Linear 工单），以及历史决策背后的权衡思考（`.notes/`）。

Both categories are valuable. The potential mistake is treating not-canon as canon. A Linear ticket may describe a feature that was never implemented, or was implemented differently than planned. If the agent reads that ticket and treats it as truth, it will be confused about the correct state of the world. By explicitly marking what is and is not canonical, we give agents a more nuanced ontology.

这两类内容都极具价值。最致命的潜在误区在于**将非权威内容当作权威事实来对待**。一个 Linear 工单里描述的功能可能根本未曾真正上线，或者实际落地时采用了完全不同的实现方案。如果智能体读到了那张工单并把它当成客观真理，就会对系统的真实状态产生严重的认知混乱。通过明确标记哪些属于权威、哪些不属于，我们赋予了智能体一套更加精细的本体论（ontology）认知体系。

The question this may raise is, "Why allow agents to see non-canonical information at all?" The answer is that non-canonical information can still be extremely valuable when parsing complex situations. Agents need a way to reach back to specific moments in history and answer questions like "Why did we write this code this way?" In a pre-agent world, the answer was a Slack DM to whoever wrote the commit. Now the answer is .notes/.

这可能会引出一个疑问：「既然如此，为什么还要允许智能体接触非权威信息呢？」答案在于：在面对复杂疑难场景时，非权威信息依然能提供无可替代的价值。智能体往往需要一种方式追溯历史上的特定时刻，以回答诸如「我们当初为什么会用这种方式写代码？」这类问题。在智能体普及之前，这个问题的解法往往是向当年提交代码的同事发一条 Slack 私信；而现在，解法变成了查阅 `.notes/`。

For example, when our incident response agent, Clueso, debugs a user report, non-canonical context helps Clueso understand whether it is a bug or a feature. While specifications tell Clueso the latest intended behavior, the notes indicate important edge cases that were considered by the original code author.

例如，当我们的线上故障应急智能体 [Clueso](https://www.getbasis.ai/blogs/clueso-how-we-built-an-agent-that-autonomously-resolves-78-of-bugs) 排查用户反馈的问题时，非权威上下文能帮助 Clueso 判断这究竟是一个 Bug 还是一项既定特性。虽然规格说明告知了 Clueso 最新预期的行为模式，但历史笔记却记录了原始作者当初反复权衡过的关键边界情况。

Our full mapping is published below as the Authority Map.

我们将完整的权威层级映射梳理为下方的「权威性映射表（Authority Map）」：

![权威性映射表](/assets/basis-ergonomic-monorepo-authority-map.png)

## The Six-Layer Architecture

## 六层架构

![上下文金字塔](/assets/basis-ergonomic-monorepo-context-pyramid.png)

The Authority Map gave us a clean six-layer architecture.

基于权威性映射表，我们梳理出了一套层次分明的六层架构：

Layer 1: Root AGENTS.md. Our engineering principles, workflow definitions, and communication patterns. Loaded in every session. Currently around 300 lines. The most high-leverage file in the repository: every token is seen by every agent, every time. For Claude users, we merely symlink the AGENTS.md.

**第一层：根目录 AGENTS.md**。沉淀了我们的核心工程原则、工作流定义与协作沟通规范。每次会话都会加载此文件。目前其体量维持在 300 行左右。这是整个仓库中杠杆率最高的文件：其中的每一个 Token，都会在每一次会话中被每一个智能体通读。对于 Claude 用户，我们只需创建指向它的符号链接即可。

Layer 2: Nested AGENTS.md files. More than 100 of these across the monorepo, each scoped to its directory. The backend AGENTS.md specifies import conventions, concurrency patterns, and dependency rules. Each file is narrow and operational.

**第二层：嵌套 AGENTS.md 文件**。整个单仓库中分布着 100 多个此类文件，每个文件都严格圈定在其所属目录的作用域内。例如后端的 `AGENTS.md` 明确规定了模块导入约定、并发模式与依赖规则。每一个嵌套文件都保持短小聚焦且具备高操作性。

Example:

示例如下：

```markdown
### Imports

All Python imports go at the top of the file.

- Strongly avoid inline/deferred imports to work around circular imports.
  A circular import means the module structure is wrong--fix the structure
  instead.
- Only acceptable reason for a non-top-level import: the imported module
  has expensive load-time side effects and the calling code path is
  rarely executed.
```

```markdown
### 模块导入规范

所有 Python 导入语句必须置于文件顶部。

- 严禁为了绕过循环导入而采用行内/延迟导入。
  出现循环导入说明模块结构划分有误——应该直接修复模块结构。
- 允许非顶层导入的唯一合理例外：被导入的模块包含高开销的加载期副作用，
  且调用该模块的代码路径极少被执行。
```

Layer 3: Skills. The .agents/skills/ directory contains skill packages covering backend architecture, frontend patterns, testing standards, documentation conventions, and domain-specific knowledge for products.

**第三层：Skills（技能包）**。`.agents/skills/` 目录包含一系列技能包，覆盖了后端架构、前端模式、测试标准、文档规范以及针对特定产品的业务领域知识。

Layer 4: Sub-agent roles. The .agents/roles/ directory defines more than half a dozen specialized agents, each with its own context window. The verifier runs diff-scoped tests and pre-commit hooks, then reports pass/fail with actionable failure details. The standards-enforcer validates code against all applicable AGENTS.md files and skills, checking for overly defensive programming, dead code, and missing test coverage.

**第四层：Sub-agent roles（子智能体角色）**。`.agents/roles/` 目录定义了六个以上的专用智能体角色，每个角色都拥有独立的上下文窗口。例如 `verifier`（验证智能体）负责针对改动范围（diff-scoped）运行测试与 Pre-commit 钩子，并输出带明确可操作修复细节的通过/失败报告；`standards-enforcer`（规范执行智能体）则对照所有适用的 `AGENTS.md` 与技能规则核对代码，检查是否存在过度防御性编程、死代码以及测试覆盖缺失。

```markdown
# verifier.md (frontmatter)

---

id: verifier
name: verifier
description: Runs diff-scoped tests, pre-commit hooks, and relevant lint/type checks, then reports pass/fail status with actionable failure details.
codex_agent_key: verifier
codex_model: gpt-5.5
codex_model_reasoning_effort: low
codex_model_verbosity: low
---
```

```markdown
# verifier.md (frontmatter 规范配置)

---

id: verifier
name: verifier
description: 针对 diff 变更范围运行测试、pre-commit 钩子及相关代码检查/类型检查，并输出带有可操作失败详情的 pass/fail 状态。
codex_agent_key: verifier
codex_model: gpt-5.5
codex_model_reasoning_effort: low
codex_model_verbosity: low
---
```

Layer 5: Unified MCP. Our unified MCP server gives agents access to external systems: Linear for project context, Slack for team communication, Better Stack for logs, PostHog for analytics, and dev database access for validation. An agent investigating a bug can pull the relevant Linear ticket, check production logs, and query the database without the engineer manually copying context into the prompt.

**第五层：Unified MCP（统一 MCP）**。我们的统一 MCP 服务器为智能体打通了访问外部系统的能力：通过 Linear 获取项目背景、通过 Slack 获取团队沟通记录、通过 Better Stack 查看日志、通过 PostHog 查看用户行为分析，并通过开发数据库访问权限进行数据验证。智能体在排查 Bug 时，可以直接自主拉取相关工单、核对生产环境日志并查询数据库，完全无需工程师手动将这些上下文逐一复制粘贴到提示词中。

Layer 6: Tests. Automated enforcement that catches standard violations before they reach CI. Ruff for Python linting and formatting, BasedPyright for type checking, ESLint and Prettier for TypeScript, plus detections for large files, private keys, and merge conflicts. These hooks are the last line of defense; they enforce the standards even when an agent (or a human) forgets to follow them.

**第六层：Tests（自动化测试与合规检查）**。这是在代码进入 CI 流程之前拦截违规的自动化防线。包括用于 Python 代码格式化与 Lint 的 Ruff、用于类型检查的 BasedPyright、针对 TypeScript 的 ESLint 与 Prettier，以及检测大文件、私钥泄露和合并冲突的钩子。这些钩子构成了最后的安全底线：即便智能体（或人类开发者）一时遗忘了某些规范，它们也会强制实施合规标准。

## Rewriting AGENTS.md

## 重写 AGENTS.md

Our repo contained lots of AGENTS.md files that had been written before we codified our principles. We found about 20 of them, and they were in rough shape. Here are the three most common issues we saw across the AGENTS.md files.

在我们正式确立上述原则之前，仓库中就已经存在大量零散编写的 `AGENTS.md` 文件。我们盘点出了大约 20 个这样的文件，它们的组织状态普遍非常糟糕。以下是我们观察到的三个最普遍的问题：

First, many of the files described the codebase to the agent rather than instructing them. For example, one AGENTS.md said: "SRC is where we put all our source code." Of course, the agent already knows what an src/ folder is; it has been trained on hundreds of thousands of repositories with that convention.

首先，许多文件只是在向智能体**被动描述**代码库，而不是**主动给出操作指令**。例如，某个 `AGENTS.md` 中赫然写着：「`src/` 是我们存放所有源代码的地方。」但事实上，智能体早已对 `src/` 目录的含义心知肚明——它在海量遵循此惯例的代码库中受过充分训练，根本不需要你废话重复这一常识。

Compare that with an instruction like "use strict type checking" or "never use inline imports to work around circular dependencies; fix the module structure instead." These operational directives change the agent behavior. They tell the agent how we expect it to work.

对比一下类似「必须开启严格类型检查」或者「严禁为了绕过循环依赖而使用行内导入；应改为直接修正模块结构」这样的指令。这些具象的操作型指令才能够真正改变智能体的行为，明确传达我们期望它以怎样的方式去编写代码。

Second, when our AGENTS.md files did include instructions, they were often all high-priority, "must-follow" directives. When you tell an agent in strongly worded terms that everything is important, it makes nothing important. One of the trickier parts of refining the rules was consistently embedding an accurate sense of priority into the prose. The default-no and localization principles helped guide us here. Removing unnecessary emphasis and placing instructions where they applied yielded the agent behavior we wanted.

其次，即使这些 `AGENTS.md` 包含指令，也往往全被标注为最高优先级、「必须严格遵守」的绝对语气。当你用强烈的措辞告诉智能体「每一条都至关重要」时，实际上等于「没有任何一条是重要的」。在打磨规范的过程中，最棘手的工作之一就是如何在字里行间建立准确的优先级感知。「默认排除」与「就近本地化」原则在这一过程中起到了关键的指引作用：去除冗余夸张的强调修辞，将具体指令下沉到真正适用该规则的局部目录中，最终调校出了我们预期的智能体行为。

Third, we also needed to organize information that applied in multiple scenarios across folders. For example, knowledge about the intricacies of our Tasks product could not properly live only in the backend AGENTS.md. This knowledge was necessary for frontend business logic as well. We embedded cross-folder knowledge in skills that could be loaded by the agent on demand. Originally we used a /docs folder, but moved to take advantage of the models all being post-trained to load skills effectively. (Docs now are for explicitly human-facing material.)

第三，我们还需要妥善组织那些跨越多个目录、在多类场景下普遍适用的知识。例如，关于我们核心产品 Tasks 业务复杂细节的知识，不能只放在后端的 `AGENTS.md` 中，因为前端的业务逻辑同样需要这部分认知。我们将这类跨目录的通用知识沉淀为技能包（Skills），供智能体按需调取。最初我们尝试过使用 `/docs` 目录，但随后全面转向了 Skills 方案，因为当前的前沿模型在后训练阶段都针对 Skills 的按需加载进行了深度优化。（现在的 `docs/` 目录被严格收敛为专门面向人类阅读的材料。）

We codified five authoring rules for AGENTS.md files, each of them a corollary of the principles:

我们为编写 `AGENTS.md` 总结了五条编写规则，它们每一条都是前述核心原则的自然推论：

1. Instruction quality. Write for agents, not for humans. The objective of your AGENTS.md files should be to explain to an agent how to operate. They should not become permanent documentation for humans.

1. **指令质量（Instruction quality）**：面向智能体编写，而不是面向人类。编写 `AGENTS.md` 文件的核心诉求是指导智能体如何行动与决策，绝不能把它写成人类的长期静态文档。

1. Hierarchy-first placement. Place context at the most specific directory that fully owns it. Information moves up only when it is genuinely shared.

1. **层级优先归放（Hierarchy-first placement）**：将上下文存放在能完全掌控它的最具体目录中。只有当信息确属跨目录共享时，才能向上一级目录提升。

1. Resilient references. Use descriptive names rather than exact file paths. Paths change; descriptions are stable.

1. **弹性引用（Resilient references）**：优先使用描述性的具象名称，而不是硬编码的具体文件路径。文件路径容易随着代码演进而变动，但概念和机制的描述更加恒定。

1. Text-only, search-friendly content. No ASCII art, no binary content, no formatting that interferes with search or parsing.

1. **纯文本与搜索友好（Text-only, search-friendly content）**：杜绝 ASCII 字符画、二进制内容以及任何干扰搜索匹配或解析的非结构化排版。

1. Default-no. Would an agent reasonably need this information for the majority of tasks in this directory? If not, it belongs somewhere else.

1. **默认排除（Default-no）**：对于该目录下的绝大多数开发任务，智能体是否确实需要这份信息？如果不需要，它就应该被归放至别处。

The team rewrote AGENTS.md files across about 20 folders, migrating contextual knowledge to skills and replacing descriptive content with operational instructions. Examples of what survived the rewrite:

团队彻底重写了分布在大约 20 个目录中的 `AGENTS.md` 文件，将上下文领域的经验沉淀迁移至 Skills，并把被动的描述性陈述全部替换为高执行力的操作型指令。以下是在重写中得以保留的规范典范：

- Canon context is a source of truth you can trust to inform decisions. Non-canonical context is context that indicates intent, notes, temporary states, etc.
- 权威上下文（Canon）是你做决策时可以全盘信赖的真实事实源；非权威上下文（Non-canonical）仅代表历史意图、备忘或临时状态。
- Prefer early returns over deep nesting.
- 优先采用提前返回（early returns），严禁深层代码嵌套。
- Write code that can be understood without referencing other files. Be explicit rather than clever.
- 编写无需反复翻阅其他文件即可理解的自解释代码；追求显式与清晰，杜绝自作聪明的技巧。

These are loaded into every agent session across the entire monorepo. They are the directives we want followed regardless of where an agent is working. The root AGENTS.md is currently around 300 lines, and every line has been argued over.

这些指令会在单仓库的所有智能体执行会话中被统一加载。无论智能体在代码库的哪个角落工作，它们都是必须严格遵循的基石原则。目前根目录的 `AGENTS.md` 大约维持在 300 行左右，其中的每一行文字都经历过团队充分的推敲与争辩。

## The Cleanup

## 代码库大清理

With the instruction layer rebuilt and the architecture in place, we finally turned to the codebase itself. Ryan Moffat used coding agents to audit every directory against the newly codified instructions, producing a list of nine projects with thousands of lines of violations.

随着指令层被重构、六层架构就位，我们终于将注意力转向了代码库本体。Ryan Moffat 借助编码智能体，对照全新出炉的指令规范对代码库的每一个目录展开了地毯式审计，最终梳理出了 9 个存在数千行规范违例的改造项目。

We then deployed agents to fix the problems that agents had perpetuated. The agents that had been absorbing bad patterns were now given explicit, well-structured instructions to rewrite code according to the new standards.

随后，我们调动智能体来收拾先前智能体自身种下的苦果。那些此前不断模仿吸收恶劣代码习惯的智能体，现在被赋予了结构严明、意图清晰的新指令，去按照最高标准彻底重写旧代码。

The rewrite touched an estimated 20 to 30 percent of the entire codebase across the nine completed projects. The principles told us where the bar was; the cleanup was the cost of getting the existing code up to that bar so that it could serve as canon. There is no shortcut. An agent-native codebase demands more local correctness than a human-only one, because every file is context and the agents are constantly onboarding.

在这 9 个完成的项目中，这次重构覆盖了全仓库预估 20% 到 30% 的存量代码。工程原则明确了质量基准所在，而这场大清理则是让存量代码达到基准、使之有资格成为「权威规范」必须付出的代价。这里没有任何捷径可走。一个智能体原生的代码库对「局部正确性」的要求远超传统人类开发团队，因为在这个世界里，**每一个文件都可能沦为智能体的上下文，而智能体每时每刻都在经历重新入职**。

Refactoring with agents hit natural limits. Often, there were structural reasons for the technical debt that agents could not solve. We prioritized the most frequently visible parts of the codebase that agents could fix. We then prioritized the visible areas that required human intervention. The rest we left to be cleaned up in our normal processes.

借助智能体进行代码重构也存在其天然边界。许多历史技术债背后有着深层的结构性架构问题，这是智能体无力自行化解的。我们的策略是：优先推进那些智能体能够胜任、且最常被上下文感知到的高频区域；随后优先推进必须人工介入的关键高频区域；至于其余边缘代码，则留待后续的日常研发流程中逐步消化。

## Maintaining Canonical Context

## 维护权威上下文

The first question anyone asks when they see our architecture is, "How do you keep all that from rotting?"

任何人看到我们这套体系时，脱口而出的第一个问题几乎都是：「你们究竟如何防止所有这些规则和上下文逐渐腐烂脱节？」

Maintenance starts with owners. Every canonical artifact at Basis carries an explicit owner field in YAML frontmatter at the top of the file. A CI/CD check ensures that any new skill or non-production markdown file has a corresponding owner. When our automated context cleanup system flags something, the owner is responsible for reviewing it.

维护工作从**明确责任人（Owner）**开始。在 Basis，每一项权威工件在文件顶部的 YAML frontmatter 中都声明了显式的 `owner` 字段。CI/CD 流水线中设有一道强校验，确保任何新增的技能或非生产 Markdown 文档都必须绑定对应的负责人。一旦我们的自动化上下文清理系统扫描报警，相关负责人就必须跟进审查并推进修复。

We have a set of cloud agent automations that review the monorepo. This is what we call our Automatic Context system. Three of those automations target context directly:

我们在云端运行着一套基于智能体的自动化审查系统，这就是我们所称的 **Automatic Context（自动化上下文系统）**。其中有三项自动化机制专门直接针对上下文质量进行管控：

- A CI/CD check ensures merges match our deterministic standards: validated frontmatter, descriptive prose where operational directives belong, and proper grammar.
- **CI/CD 校验门禁**：确保每一次代码合并都符合确定性的形式规范——通过 Frontmatter 校验、消灭非指令性的空洞描述、以及语法准确性。
- A scanner runs daily to do a broad sweep of skills and AGENTS.md files for staleness, contradictions, duplicated instructions, broken references, and missing context for recent changes.
- **每日扫描器（Daily Scanner）**：每日定时对所有 Skills 和 `AGENTS.md` 文件进行地毯式扫描，检测是否存在陈旧过时、逻辑冲突、重复指令、断裂失效的引用、以及未能及时跟进近期代码改动的上下文缺失。
- Workers run daily to pick up tickets from the scanner and implement small, scoped fixes.
- **每日执行 Worker（Daily Workers）**：自动认领扫描器产出的问题工单，直接针对小范围精准实现自动化补丁修复。

The broader point: automated context maintenance is only possible because we agreed on what is canonical. A scanner can sweep AGENTS.md files and skills for contradictions because canonical context is, by definition, supposed to agree with itself. Non-canonical context is allowed to disagree with itself; specs are revised, plans are abandoned, .notes/ entries capture decisions made at moments that no longer exist. If you do not draw the line between what must be self-consistent and what may not be, you cannot run a scanner over either category.

更深刻的本质在于：**自动化上下文维护之所以可能，完全建立在全团队对『什么是权威（Canon）』达成共识的基础之上**。扫描器之所以能巡检 `AGENTS.md` 与 Skills 中的矛盾，是因为根据定义，权威上下文在逻辑上必须保持自洽与统一。与此相反，非权威上下文被允许包含内在矛盾——需求规格会被推倒重来，研发计划会被放弃搁置，`.notes/` 记录的决策可能针对的是早已不复存在的历史阶段。如果你不在「必须自洽的代码规范」与「允许冲突的历史意图」之间画出这条清晰的红线，你就绝无可能在任何一个维度上跑通自动化的扫描与治理。

## Closing the Validation Loop

## 闭环验证体系

Alongside the problem of agents writing non-standard code, we also recognized that our testing wasn’t standardized. One of our principles was that agents’ work requires verification, so we expanded our testing frameworks. This was a separate effort, led by Bhavdeep Sethi on the platform side and the Atlas team on the agent behavior side.

在智能体产出不合规代码的同时，我们也意识到测试本身同样缺乏统一标准。我们的核心原则之一是「智能体的工作必须能够被验证」，因此我们大力拓展了测试框架。这是一项协同攻坚，由 Bhavdeep Sethi 主导平台工程基础设施，Atlas 团队主导智能体行为层面的调校。

We found a lot of success with an inter-team structure: pairing one engineer focused on solving the traditional technical problems of testing with another engineer focused on the agent's instructions. Bhavdeep built the testing infrastructure: unit tests, integration tests, proper fixtures and markers, CI integration. The Atlas team's contribution was embedding testing standards into the agent behavior layer. This approach treated agent behavior as a first-class requirement rather than an afterthought.

我们通过跨团队搭档模式取得了巨大成功：将一位专注于攻坚传统测试技术难题的工程师，与另一位专注于打磨智能体指令的工程师结对配对。Bhavdeep 负责搭建测试底座：单元测试、集成测试、规范的测试夹具（fixtures）与标记（markers）、以及 CI 流水线集成；而 Atlas 团队的贡献则是将测试标准深度内嵌到智能体的行为指导层。这种做法将「智能体行为规范」视作一等公民（first-class requirement），而不是事后补救的附加品。

We created a testing skill that defines what tests are expected, when they are required, and how they should be structured. We extensively evaluated whether our guidelines induced agents to produce the tests we wanted. Sometimes agents were too verbose. Other times, they were extremely lazy. Getting the skill language correct required some work. It was worth the investment to have agents that consistently produced tests according to our standards.

我们专门沉淀了一套 Testing Skill（测试技能包），明确规范了应当编写怎样的测试用例、何时必须编写测试、以及测试应当如何组织。我们进行了大量的实证评估，观察这些指引是否能真正促使智能体输出我们预期的测试代码。有些时候智能体生成的测试过于冗长琐碎，另一些时候它们又极其偷工减料。拿捏好技能包中的措辞表达需要反复试验打磨。但为了换取智能体始终如一地根据既定规范输出合格测试，这项投入千值万值。

## How We Judged the Result

## 成效评估

We started with the simplest metric to measure: token usage per developer. The hypothesis was that if we solved the problems making coding agents perform poorly, engineers would be able to trust agents to do more work, which would let engineers manage more agents simultaneously, which would increase token usage. We set a goal of 5x token usage in one quarter. It felt ambitious because engineers at Basis were already coding-agent power users. When we hit that goal, we knew we were enabling developers to parallelize more and spend less time fixing agent output.

我们从最朴素的量化指标入手：每位开发者的 Token 消耗量。我们的假设是：如果我们彻底解决了导致编码智能体表现拉胯的底层问题，工程师就敢于信任智能体去承担更多工作，从而能够同时并发驾驭多个智能体，这必然会带来 Token 消耗的飙升。我们在一个季度内设立了 Token 用量提升 5 倍的目标。这在当时显得极为野心勃勃，因为 Basis 的工程师本就已经是编码智能体的重度资深用户。但当我们最终达成这一目标时，我们确信自己成功让工程师实现了更高维度的并行作业，并大幅削减了替智能体擦屁股、修复坏代码的时间。

Increasing AI usage is only meaningful if it enhances the team's overall productivity. Weekly commit velocity over this time increased by 2.5 times. By the end of this work, 100% of our engineering team was working with multiple worktrees. Engineers were coming to us asking for better tooling to help them manage more agents.

然而，提升 AI 用量只有在真正推动团队整体生产力跃升时才具有现实意义。在这段期间内，我们每周的代码提交速度（commit velocity）提升了 2.5 倍。在这项工作收官之际，**我们工程团队 100% 的成员都在使用多个 Git Worktree 并行开发**。工程师们甚至主动找上门来，希望我们提供更好的工具帮助他们同时管理更多的智能体。

## What's Next

## 未来展望

Coding agents are a new kind of consumer of your codebase, with their own failure modes, their own appetite for context, and their own demands on what counts as a well-organized repo. Most companies have not begun to take that seriously. The ones that do will find, as we did, that the work is bigger than expected, the principles are non-obvious, and the payoff is substantial.

编码智能体是代码库的一种全新消费主体。它们有着独特的失败模式、独特的上下文偏好、以及对「何为整洁有序的代码库」有着截然不同的诉求。绝大多数公司尚未开始严肃对待这一剧变。而那些先行一步的企业终将发现，正如我们所经历的那样：这项工程的体量远比预想中庞大，背后的原理并非显而易见，但最终带来的生产力回报也是极其惊人的。

Now that we have given coding agents an ergonomic environment to succeed in, we are optimizing the entire AI-native software development lifecycle at Basis. This includes new approaches such as proof-based development, redesigning our code review process, and experimenting with automatic code maintenance - the natural extension of the Automatic Context machinery from the instruction layer to the code itself.

既然我们已经为编码智能体搭建了一个能够高效运作的符合人体工学的舒适环境，我们在 Basis 正全面优化面向 AI 原生的软件开发全生命周期。这涵盖了诸多前沿探索，例如基于证明的开发（proof-based development）、重构代码评审流程（code review）、以及试验代码的自动化维护——将 Automatic Context 的底层机制从指令规范层自然外延至代码本身。

If you want to join an agent-native company, we’re hiring.

如果你渴望加入一家真正的智能体原生公司，[我们在广纳贤士](https://www.getbasis.ai/careers)。

Michael Crabtree is Atlas Tech Lead at Basis. @RyanBMoffat led the codebase standards audit and owns the Automatic Context system. @BhavdeepSethi built the testing infrastructure. @SethSchiesel contributed to this post.

Michael Crabtree 是 Basis 的 Atlas 技术负责人；Ryan Moffat 主导了代码库规范审计并统筹设计了 Automatic Context 系统；Bhavdeep Sethi 搭建了测试基础设施；Seth Schiesel 为本文的撰写提供了重要贡献。
