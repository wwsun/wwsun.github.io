---
description: "Eighteen months since launch, Devin’s gone from tackling small projects, to deeply embedding in engineering teams at thousands of companies, including some of the largest businesses in the world. We decided it was well past time for Devin to get a performance review - just like any human engineer."
source: "https://cognition.ai/blog/devin-annual-performance-review-2025#whats-next-"
author:
  - "[[Cognition]]"
created: 2026-01-08
tags:
  - "clippings"
---
在发布十八个月后，Devin 已经从处理小型项目，成长为在包括高盛、桑坦德银行和 Nubank 在内的数千家公司工程团队中工作。

Devin 现在已经合并了**数十万条 PR**。

此时，Devin 早就该进行一次绩效评估了——就像任何一位人类工程师一样。

## 我们如何评估 Devin

我们最初尝试用传统的工程师能力矩阵来评估 Devin，但这很困难。虽然人类工程师通常会集中在某一个级别，Devin 在代码库理解方面达到了高级水平，但在执行力上却是初级。它有无限的容量，但在软技能方面表现不佳。

因此，我们总结了 Devin 在真实环境中的优势和劣势，并结合了客户的案例和数据。我们希望这些内容能对任何关注真实世界代理部署的人有所帮助。

## 优势模式一：无限规模下的初级执行

Devin excels at **tasks with clear, upfront requirements and verifiable outcomes that would take a junior engineer 4-8 hrs of work.**  
Devin 擅长处理那些有明确、前期要求和可验证结果的任务，这些任务通常需要初级工程师花费 4 到 8 小时完成。

但与人类不同的是，它可以无限并行处理任务，并且从不休息。这使得它非常适合执行关键但创造性较低的工作，比如迁移和现代化代码仓库、修复由 SonarQube 和 Veracode 等静态分析工具发现的漏洞、编写单元测试以及完成小型工单。这让人类工程师能够专注于更有影响力的项目。

在过去的一年里，Devin 已经成为一名更快、更优秀的初级工程师——在解决问题的速度上提升了 4 倍，资源消耗效率提升了 2 倍，现在有 67%的 PR 被合并，而去年只有 34%。

[![](https://cdn.sanity.io/images/2mc9cv2v/production/621afab3e569a2b90e61a952c733b4e0f1d65cba-2963x1467.png)](https://cdn.sanity.io/images/2mc9cv2v/production/621afab3e569a2b90e61a952c733b4e0f1d65cba-2963x1467.png)

### 安全漏洞修复

Devin 非常擅长解决静态分析工具（如 SonarQube、Veracode）标记出的漏洞。

几个突出的例子：某大型组织通过使用 Devin 进行安全修复，节省了 5-10%的开发者总时间。另一家组织的效率提升了 20 倍：人工开发者平均每个漏洞需要 30 分钟，Devin 只需 1.5 分钟。

### 语言和框架升级、迁移与现代化

客户使用 Devin 进行现代化和迁移，例如将 SAS 迁移到 PySpark、COBOL、Angular 迁移到 React、.NET Framework 迁移到.NET Core，或替换专有框架。

一旦获得了如何更新每个代码库的指令，一组 Devin 可以并行地在每个代码库上执行任务。这带来了巨大的节省。今年的一些例子如下：

- A large bank was migrating hundreds of thousands of proprietary ETL framework files. Devin completed each file's migration in **3-4 hours vs 30-40 for human engineers (10x improvement).**  
	一家大型银行正在迁移数十万份专有 ETL 框架文件。Devin 完成每个文件的迁移只需 3-4 小时，而人类工程师则需要 30-40 小时（提升了 10 倍）。
- When Oracle sunsetted legacy support for one Java version, Devin was able to migrate each repo in **14x less time than a human engineer.**  
	当 Oracle 停止对某个 Java 旧版本的支持时，Devin 迁移每个代码库所需的时间比人类工程师少了 14 倍。
[![](https://cdn.sanity.io/images/2mc9cv2v/production/56ebf7834fbe08c1dc79491f200b71307ef9da0d-1712x656.png)](https://cdn.sanity.io/images/2mc9cv2v/production/56ebf7834fbe08c1dc79491f200b71307ef9da0d-1712x656.png)

使用智能代理可以降低现代化改造的成本，因此组织能够将更多时间用于开发新功能，而不是维护遗留代码。

### 测试生成

Devin can do the first pass of [writing tests](https://docs.devin.ai/use-cases/testing-refactoring), with humans checking logic. Humans will write a unit testing playbook for Devin that spans a few hundred repos at a time. Then a fleet of Devins will go off and write the tests. After, code owners will check to see if all logic has been tested.  
Devin 可以进行第一轮测试编写，由人工检查逻辑。人类会为 Devin 编写一个单元测试操作手册，覆盖数百个代码库。然后，一组 Devin 会去编写测试。之后，代码所有者会检查所有逻辑是否都已被测试。

Companies' test coverage typically rises from **50-60% to 80-90%** when using Devin.  
使用 Devin 后，公司的测试覆盖率通常会从 50-60%提升到 80-90%。

### 棕地功能开发

当现有代码提供了清晰的模式时，Devin 可以进行复制和修改：添加 API 端点、创建前端组件、扩展功能。Devin 在我们的网页应用中提交了大约三分之一的代码。

### PR 审核

Devin 可以进行初步审核并发现明显的问题。人工审核仍然是必要的，因为代码质量并不能直接验证。

### 数据分析与质量保证工作

[![](https://cdn.sanity.io/images/2mc9cv2v/production/8a30c06c220b9fed9bea558f9945126709fac55a-1200x721.png)](https://cdn.sanity.io/images/2mc9cv2v/production/8a30c06c220b9fed9bea558f9945126709fac55a-1200x721.png)

Devin 在数据分析和质量保障方面表现出乎意料地优秀。公司可以在 Slack 中“@” Devin，提出诸如“你能拉取一下昨天各渠道的销售数据吗？”、“你能查查为什么这个数字看起来不对吗？”或者让它创建数据看板等问题。

One customer, EightSleep, ships **[3x as many](https://cognition.ai/blog/how-eight-sleep-uses-devin-as-a-data-analyst) data features and investigations with Devin**. We constantly do use this internally (we even used Devin to pull metrics for this report.)  
有一家客户 EightSleep，借助 Devin 发布的数据特性和调查数量是原来的三倍。我们在内部也一直在使用 Devin（甚至用 Devin 来提取本报告的相关指标）。

Another skill Devin has picked up is quality engineering. When Litera gave every engineering manager a “team of Devins” acting as QE testers, SREs, and DevOps specialists, test coverage increased by 40% and regression cycles got 93% faster.  
Devin 掌握的另一项技能是质量工程。当 Litera 为每位工程经理配备了一支“Devin 团队”，让他们担任 QE 测试员、SRE 和 DevOps 专家时，测试覆盖率提升了 40%，回归周期加快了 93%。

## 优势模式#2：按需提供高级智能

**Only [20%](https://www.microsoft.com/en-us/research/wp-content/uploads/2024/11/Time-Warp-Developer-Productivity-Study.pdf) of engineering time is spent coding;** much more goes into other work, like planning and reviewing.  
只有 20%的工程时间用于编码；更多的时间花在了其他工作上，比如规划和评审。

在过去一年里，Devin 在理解大型代码库方面有了极大提升（这是其 PR 合并率翻倍的一个原因）。这意味着它可以快速为大型代码库编写文档，并协助人类进行规划。

这种能力更像是随时拥有一位资深工程师，可以随时解答任何问题。工程师能够更快地入职，并与 Devin 交流，以了解他们的代码库并规划项目。

### 文档

When onboarding to a codebase, Devin generates comprehensive, always-updating documentation with system diagrams ([DeepWiki](https://deepwiki.com/)). It can do this on large repos - customers have used DeepWiki to **generate docs for 5M lines of COBOL or 500GB repos.**  
在接入代码库时，Devin 会生成全面且持续更新的文档，并附有系统图（DeepWiki）。它可以在大型代码库上完成此操作——客户曾使用 DeepWiki 为 500 万行 COBOL 代码或 500GB 的代码库生成文档。

[![](https://cdn.sanity.io/images/2mc9cv2v/production/de62d08befecf33f2f0f55f4ca35f35a831a4138-2916x1908.png)](https://cdn.sanity.io/images/2mc9cv2v/production/de62d08befecf33f2f0f55f4ca35f35a831a4138-2916x1908.png)

一家银行可以将多个工程团队从大型文档项目中重新分配到新功能开发上，因为 Devin 已经为超过 400,000 个代码库生成了文档。

### 规划

When engineers are planning work, they will look at the documentation and chat with Devin ([AskDevin](https://docs.devin.ai/work-with-devin/ask-devin)) to understand the system. Devin can explain with architecture diagrams, map dependencies, and flag any breaking changes, and recommend what should be tackled by humans vs AI.  
当工程师们在规划工作时，他们会查阅文档并与 Devin（AskDevin）聊天，以了解系统情况。Devin 可以通过架构图进行解释，映射依赖关系，标记任何可能导致系统崩溃的变更，并建议哪些任务应该由人类完成，哪些可以交给 AI 处理。

一位工程师告诉我们，他可以在 15 分钟内生成草拟的架构，供其他人反馈。

## Devin 的改进方向

### 在模糊需求下的独立执行

和大多数初级工程师一样，Devin 在有明确需求时表现最佳。Devin 无法像高级工程师那样，凭借自己的判断独立完成一个模糊的编码项目。例如，在视觉设计方面，Devin 需要具体的信息，如组件结构、颜色代码和间距数值。

当结果无法直接验证时，需要额外的人类审核。在 Devin 完成初步工作后，人类会检查单元测试逻辑，并审核其代码评审。

### 范围变更与迭代协作

Devin 在明确的前期范围界定方面表现良好，但在任务进行中遇到需求变更时处理得不好。当你在它开始任务后不断补充信息时，它的表现通常会变差。这与人类初级员工不同：你可以通过迭代式问题解决过程对人类进行指导。

这让工程师在前期对工作的范围界定上承担了更多责任。与 Devin 合作的工程师必须学会如何有效地“管理”Devin。

### 软技能与人际协作

虽然它非常擅长在 Slack、Teams 和 Jira 中协作，但它无法管理下属或利益相关者，也无法处理团队成员的情绪。它肯定不会组织午餐学习会，也不会耐心地指导直属下属！不过，它始终非常友好、耐心且响应迅速。
