---
title: "Skills For Real Engineers — 真正的工程师技能（README 翻译）"
description: "Matt Pocock 的 Agent Skills 仓库 README 完整中文翻译，阐述其设计理念、四大失败模式及解决方案、所有技能的职责与调用模式"
tags:
  - clippings
  - ai-agent
  - skills-design
  - claude-code
  - tdd
  - domain-modeling
  - matt-pocock
source: "https://github.com/mattpocock/skills"
---

> 原文：[github.com/mattpocock/skills](https://github.com/mattpocock/skills)

## 真正的工程师技能

[[20260622-mattpocock-skills-research|→ 深度调研报告]]

> 翻译注：标题原文为 "Skills For Real Engineers"，与当前流行的 "vibe coding"（氛围编程）形成鲜明对比——强调了扎实工程实践在 AI 时代的价值。

我每天都在使用的 Agent Skills——为了做真正的工程，而非氛围编程。

开发真正的应用是困难的。GSD、BMAD 和 Spec-Kit 等方法试图通过掌控流程来帮忙。但这样做会剥夺你的掌控权，并使流程中的 Bug 难以修复。

这些技能设计得小巧、易于修改且可组合。它们适用于任何模型。它们建立在数十年的工程经验之上。随便折腾。让它们成为你自己的。享受吧。

如果你想跟进这些技能的更新以及我创建的任何新技能，你可以和约 60,000 名开发者一起订阅我的 newsletter：

[订阅 Newsletter](https://www.aihero.dev/s/skills-newsletter)

## 快速开始（30 秒安装）

1. 运行 skills.sh 安装器：

```bash
npx skills@latest add mattpocock/skills
```

2. 选择你想要的技能，以及要安装到哪些编程 Agent 上。**确保选中 `/setup-matt-pocock-skills`**。

3. 在 Agent 中运行 `/setup-matt-pocock-skills`。它会：
   - 询问你想使用哪个 Issue Tracker（GitHub、Linear 或本地文件）
   - 询问你在 triage issue 时使用的标签（`/triage` 会用到这些标签）
   - 询问你想把生成的文档保存在哪里

4. 搞定——可以开始使用了。

## 这些技能为何存在

我构建这些技能是为了修正在 Claude Code、Codex 和其他编程 Agent 中常见的失败模式。

### #1：Agent 做出的东西不是我想要的

> "没有人确切知道自己想要什么。"
>
> —— David Thomas & Andrew Hunt，《程序员修炼之道》

**问题**。软件开发中最常见的失败模式是对齐偏差。你以为开发者知道你想要什么。然后你看到他们构建的东西——意识到他们根本没有理解你的意思。

这在 AI 时代完全一样。你和 Agent 之间存在沟通鸿沟。解决方案是**深度质询（grilling session）**——让 Agent 就你正在构建的东西向你提出详尽的问题。

**解决**方案是使用：

- [`/grill-me`](./skills/productivity/grill-me/SKILL.md) — 用于非代码场景
- [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) — 与 [`/grill-me`](./skills/productivity/grill-me/SKILL.md) 相同，但增加了更多好东西（见下文）

这些是我最受欢迎的技能。它们帮助你在开始之前与 Agent 对齐，并深度思考你所做的变更。**每次**你想要做出变更时都使用它们。

### #2：Agent 的输出太啰嗦了

> 有了统一语言，开发者之间的对话和代码的表达都源自同一个领域模型。
>
> —— Eric Evans，《领域驱动设计》

**问题**：在项目开始时，开发者和他们为之构建软件的人（领域专家）通常说着不同的语言。

我在 Agent 身上感受到了同样的张力。Agent 通常被丢进一个项目中，被要求边做边摸索行话。于是他们用 20 个词来表达 1 个词就能说清的东西。

**解决方案**是一种共享语言。它是一个帮助 Agent 解码项目中行话的文档。

> [!example] 示例
>
> 这是来自我的 `course-video-manager` 仓库的一个 [`CONTEXT.md`](https://github.com/mattpocock/course-video-manager/blob/076a5a7a182db0fe1e62971dd7a68bcadf010f1c/CONTEXT.md) 示例。哪个更容易阅读？
>
> - **之前**："课程中某个 section 下的 lesson 被 '具现化'（即在文件系统中分配位置）时会出现问题"
> - **之后**："materialization cascade 出现了问题"
>
> 这种精炼在一次又一次的 session 中持续发挥价值。

这已内置于 [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) 中。它是一个质询过程，但能帮助你在与 AI 构建共享语言的同时，将难以解释的决策记录在 ADR 中。

很难说清楚这有多强大。它可能是这个仓库中最酷的一项技术。试试看就知道了。

> [!tip]
> 共享语言除了减少啰嗦还有许多其他好处：
>
> - 变量、函数和文件使用共享语言**统一命名**
> - 结果是，**代码库对 Agent 来说更容易导航**
> - Agent 也**花费更少的 token 在思考上**，因为它能使用更精炼的语言

### #3：代码不能正常工作

> "始终采取小而审慎的步骤。反馈的速度就是你的速度上限。永远不要接手太大的任务。"
>
> —— David Thomas & Andrew Hunt，《程序员修炼之道》

**问题**：假设你和 Agent 就构建什么已经对齐了。但如果 Agent **还是**产出垃圾代码呢？

这时候就需要审视你的反馈闭环了。如果没有关于 Agent 产出的代码实际运行情况的反馈，Agent 就是在盲飞。

**解决方案**：你需要常规的反馈闭环工具箱：静态类型、浏览器访问和自动化测试。

对于自动化测试，红-绿-重构循环至关重要。这意味着 Agent 先写一个失败的测试，然后修复代码使其通过。这为 Agent 提供了一致的反馈水平，从而产出好得多的代码。

我构建了一个 **[`/tdd`](./skills/engineering/tdd/SKILL.md) 技能**，可以嵌入任何项目。它鼓励红-绿-重构，并为 Agent 提供了大量关于好测试和坏测试的指导。

对于调试，我还构建了一个 **[`/diagnosing-bugs`](./skills/engineering/diagnosing-bugs/SKILL.md)** 技能，将最佳调试实践包装成一个简单的循环。

### #4：我们构建了一团烂泥

> "每天都要投资于系统的设计。"
>
> —— Kent Beck，《解析极限编程》

> "最好的模块是深的。它们允许通过一个简单的接口访问大量功能。"
>
> —— John Ousterhout，《软件设计的哲学》

**问题**：用 Agent 构建的大多数应用都复杂且难以修改。因为 Agent 可以极大地加速编码，它们也加速了软件熵增。代码库以前所未有的速度变得越来越复杂。

**解决方案**是一种全新的 AI 驱动开发方法：**关注代码的设计**。

这内置于这些技能的每一层：

- [`/to-prd`](./skills/engineering/to-prd/SKILL.md) 在创建 PRD 之前会询问你正在触及哪些模块

更为关键的是，[`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md) 帮助你拯救已经变成烂泥的代码库。我建议每隔几天对你的代码库运行一次。

### 总结

软件工程基本功比以往任何时候都更重要。这些技能是我将这些基本功浓缩为可重复实践的最佳努力，旨在帮助你交付职业生涯中最好的应用。享受吧。

## 参考

这些技能沿一个维度划分——谁可以调用它们。**用户调用（User-invoked）** 技能只能在你手动输入时触发（如 `/grill-me`）；它们的职责是编排。**模型调用（Model-invoked）** 技能可以由你调用，也可以由 Agent 在任务匹配时自动触发；它们承载着可复用的纪律。用户调用技能可以调用模型调用技能，但不能调用另一个用户调用技能。

### 工程（Engineering）

我日常编码使用的技能。

**用户调用**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)** — 询问哪种技能或流程适合你的场景。本仓库中用户调用技能的路由器。
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)** — 质询过程，同时构建项目的领域模型，在过程中磨砺术语并更新 `CONTEXT.md` 和 ADR。
- **[triage](./skills/engineering/triage/SKILL.md)** — 将 Issue 按 Triage 角色状态机流转。
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)** — 扫描代码库寻找深化机会，以可视化 HTML 报告呈现，然后对你选择的候选项进行质询。
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)** — 为工程技能配置当前仓库（Issue Tracker、Triage 标签、领域文档布局）。在使用其他工程技能之前，每个仓库运行一次。
- **[to-issues](./skills/engineering/to-issues/SKILL.md)** — 将任何计划、spec 或 PRD 使用垂直切片拆分为可独立接手的 Issue。
- **[to-prd](./skills/engineering/to-prd/SKILL.md)** — 将当前对话转化为 PRD 并发布到 Issue Tracker。无需面谈——仅合成你已讨论过的内容。
- **[prototype](./skills/engineering/prototype/SKILL.md)** — 构建抛掉式原型来充实设计——可以是一个用于状态/业务逻辑问题的可运行终端应用，也可以是一个路由上可切换的多种截然不同的 UI 变体。

**模型调用**

- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)** — 针对棘手 Bug 和性能回归的结构化诊断循环：复现 → 最小化 → 假设 → 插桩 → 修复 → 回归测试。
- **[tdd](./skills/engineering/tdd/SKILL.md)** — 红-绿-重构循环的测试驱动开发。一次一个垂直切片地构建功能或修复 Bug。
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)** — 主动构建和磨砺项目的领域模型——用术语表挑战术语，用边界场景进行压力测试，并在过程中更新 `CONTEXT.md` 和 ADR。
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)** — 设计深度模块的共享纪律和词汇：大量行为隐藏在小接口之后，置于干净的 seam，可通过该接口测试。

### 生产力（Productivity）

通用工作流工具，不限于编码。

**用户调用**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)** — 被 relentlessly 地盘问你的计划或设计，直到决策树的每个分支都被解决。
- **[handoff](./skills/productivity/handoff/SKILL.md)** — 将当前对话压缩成交班文档，以便另一个 Agent 可以继续工作。
- **[teach](./skills/productivity/teach/SKILL.md)** — 在多个 session 中向你教授一项新技能或概念，使用当前目录作为有状态的教学工作区。
- **[writing-great-skills](./skills/productivity/writing-great-skills/SKILL.md)** — 编写和编辑优秀技能的参考指南：使技能可预测的词汇和原则。

**模型调用**

- **[grilling](./skills/productivity/grilling/SKILL.md)** — relentlessly 地盘问用户关于计划或设计的每一个方面，直到决策树的每个分支都被解决。位于 `grill-me` 和 `grill-with-docs` 之后的可复用循环。

### 杂项（Misc）

我保留但很少使用的工具。

- **[git-guardrails-claude-code](./skills/misc/git-guardrails-claude-code/SKILL.md)** — 设置 Claude Code hooks 以在执行前拦截危险的 git 命令（push、reset --hard、clean 等）。
- **[migrate-to-shoehorn](./skills/misc/migrate-to-shoehorn/SKILL.md)** — 将测试文件中的 `as` 类型断言迁移到 @total-typescript/shoehorn。
- **[scaffold-exercises](./skills/misc/scaffold-exercises/SKILL.md)** — 创建包含 section、problem、solution 和 explainer 的练习目录结构。
- **[setup-pre-commit](./skills/misc/setup-pre-commit/SKILL.md)** — 设置 Husky pre-commit hooks，包含 lint-staged、Prettier、类型检查和测试。
