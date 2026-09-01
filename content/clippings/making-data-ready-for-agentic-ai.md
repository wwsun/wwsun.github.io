---
title: 让你的数据为 Agentic AI 做好准备
description: Pramod Sadalage 与 Prem Chandrasekaran 阐述数据层如何决定智能体 AI 的成败：通过数据契约、可追溯性、上下文层与可操作的访问模式，把原本依赖人类分析师直觉的隐性工作，显式地构建进数据架构本身。
tags:
  - clippings
  - agentic-ai
  - data-architecture
  - data-contracts
  - semantic-layer
source: https://martinfowler.com/articles/making-data-ready-for-agentic-ai.html
created: 2026-09-01
author: Pramod Sadalage & Prem Chandrasekaran
---

## 让你的数据为 Agentic AI 做好准备

> **原文**：[Making Your Data Ready for Agentic AI](https://martinfowler.com/articles/making-data-ready-for-agentic-ai.html) | 作者：Pramod Sadalage & Prem Chandrasekaran | 日期：2026-08-27

## 📝 摘要

当前业界对智能体框架、编排模式与协议热情高涨，但如果跳过数据层，这一切几乎都产生不了价值——数据必须先处于机器可以消费、信任并据此行动的形态。文章的核心论点：过去三十年的数据架构是为人类分析师设计的，人类自带隐性上下文、判断力和怀疑精神；而自主智能体什么都没有，它会自信地照单全收。要让数据「AI 就绪」，需要五个属性：可信（Trusted）、有上下文（Contextual）、可追溯（Traceable）、受治理（Governed）、可操作（Operational）。文章按四条主线展开：数据契约与质量（让数据可信）、可追溯性与治理（让行动可审计）、上下文层（让数据有意义）、从可搜索到可操作（让智能体能读写）。作者还给出了每部分的起步清单，并强调所有层自第一天起就要埋入可观测性，因为事后补装远比从一开始就内置困难得多。

## 📋 术语表

| 英文                     | 中文       | 说明                                                                                         |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------------- |
| data contract            | 数据契约   | 以代码形式声明数据集的 schema、质量规则与新鲜度 SLA 的约定，把「schema 即法律」落到 CI/CD 里 |
| freshness SLA            | 新鲜度 SLA | 规定数据必须在指定时限内完成刷新的服务级别协议，超时即视为过期数据                           |
| medallion architecture   | 奖章架构   | 按 Bronze/Silver/Gold 分层组织数据的分析型数据设计模式，智能体只读 Gold 及以上               |
| quarantine pattern       | 隔离模式   | 不合规数据在进入智能体可见存储前被拦截并转入死信队列的熔断机制                               |
| semantic layer           | 语义层     | 对指标与业务实体含义的声明式定义层，把原本活在分析师脑中的上下文搬进数据本身                 |
| domain model             | 领域模型   | 描述业务实体及其关系的定义，回答「有什么」；只被查询，从不被执行                             |
| semantic model           | 语义模型   | 描述指标如何计算的版本化定义，回答「数字怎么算」；编译为一致的 SQL                           |
| capability model         | 能力模型   | 描述智能体可执行操作的受治理清单，回答「能做什么」；携带权限、前置条件与可逆性               |
| agentic lineage          | 智能体血缘 | 记录智能体为何做出某个决策的可追溯链路，是传统数据血缘在「为什么」维度上的扩展               |
| traces and spans         | 追踪与跨度 | 从分布式系统可观测性借用的审计模型：一条 trace 记录端到端工作流，每个 span 是一个步骤        |
| knowledge graph          | 知识图谱   | 用图结构存储实体及其关系，支持深度不确定的遍历推理                                           |
| GraphRAG                 | GraphRAG   | 微软提出的图检索增强生成方法，用社区检测处理传统 RAG 无法回答的抽象查询                      |
| prompt injection         | 提示注入   | 通过投毒内容劫持智能体行为并窃取数据的攻击方式                                               |
| delegated access         | 委托访问   | 智能体以调用者本人的权限行动，而不是使用能看见所有客户数据的宽泛服务账户                     |
| just-in-time credentials | 即时凭证   | 为单个具体任务签发、短时有效的临时凭证，任务完成即失效                                       |
| lethal trifecta          | 致命三要素 | Simon Willison 提出的三个条件：能访问私有数据、接触不可信内容、具备对外通信渠道              |
| write-back               | 写回       | 智能体不止读数据，还能创建记录、更新系统、触发工作流                                         |
| data as a product        | 数据即产品 | 每个数据集像 API 一样有署名所有者、发布契约与版本化生命周期                                  |

---

## 正文（双语对照）

There's a lot of excitement right now about agent frameworks, orchestration patterns, and protocols. All of it matters, but almost none of it delivers value if you skip the data layer. Before any agent framework can produce useful outcomes, your data has to be in a shape that a machine can consume, trust, and act on. In this article, we discuss what your data needs to look like for agentic AI to derive value from it.

当前业界对智能体框架、编排模式和协议热情高涨。这些都很重要，但如果跳过数据层，它们几乎都产生不了价值。任何智能体框架要产出有用的结果，前提都是你的数据处于机器可以消费、信任并据此行动的形态。本文讨论的正是：要让智能体式 AI（agentic AI）从数据中获取价值，你的数据需要长成什么样子。

We've spent quite a bit of time building data architectures for the human consumer. We're about to hand those architectures to a very different kind of consumer, and most of them aren't ready for it.

我们花了相当长的时间为人类消费者构建数据架构。而现在，我们正要把这些架构交给一种截然不同的消费者，它们大多还没准备好。

## 数据的消费者正在改变

For over three decades, we've been building data systems for humans. Dashboards, reports, analyst queries, all of it designed around a person sitting in front of a screen. And it worked, because humans bring an enormous amount of implicit context, along with the curiosity to track down whatever they're missing from the people around them.

三十多年来，我们一直在为人类构建数据系统。仪表盘、报表、分析师查询，一切都是围绕坐在屏幕前的人设计的。这套东西一直行之有效，因为人类自带海量的隐性上下文，还有向周围同事追查缺失信息的好奇心。

A human analyst knows what “revenue” means in your particular organization. They know which tables to query and which ones to avoid. They notice when a number looks off, when a total is suspiciously round, when a date falls on a public holiday, or when a price seems too low. That instinct is doing a large amount of invisible context and knowledge work.

人类分析师知道「revenue（营收）」在你的组织里意味着什么。他们知道该查哪些表、该避开哪些表。当一个数字看起来不对劲、一个合计恰好是可疑的整数、一个日期落在公共假期、或者一个价格低得离谱时，他们会察觉。这种直觉承担着大量看不见的上下文与知识工作。

> A human hesitates at data that looks wrong; an agent acts on it anyway

> 面对看起来不对劲的数据，人类会犹豫；智能体则照单全收

Agents have none of it. They can't lean on the tribal knowledge and pattern recognition people accumulate over years, so they need context made explicit, access in real time, and quality they can rely on. And the difference that matters most is this: when the data feels wrong, a human double-checks; an agent confidently acts on it. That behavioral gap is what the rest of this discussion is built around.

智能体这些都没有。它无法依赖人们多年积累的部落知识与模式识别，因此它需要显式给出的上下文、实时的数据访问，以及可以信赖的数据质量。而最关键的差异在于：当数据感觉不对时，人类会再核实一遍；智能体则自信地照用不误。本文后续的所有讨论，都建立在这一行为差异之上。

## 「AI 就绪」现在必须意味着什么

For a human consumer, the data only had to be _good enough_; the analyst did the rest. The meaning, the sanity check, and the judgment about whether a number could be trusted all lived in a person's head. When the same data is handed to an agent, every bit of that implicit labor has to move into the data itself. That shows up as five attributes, each the flip side of something a human used to do for free.

对人类消费者来说，数据只要「足够好」就行，剩下的交给分析师。数字的含义、合理性检查、以及这个数能不能信的判断，全都装在人的脑子里。当同样的数据交给智能体时，所有这些隐性劳动都必须搬进数据本身。这体现为五个属性，每一个都是人类过去免费代劳的某件事的镜像。

- Trusted: a person pauses at a number that feels wrong; an agent acts on it. The confidence a human used to supply has to be built in, so the data must be accurate, fresh, and validated before the agent ever sees it.

- 可信（Trusted）：人对一个感觉不对的数字会停下来，智能体则照用不误。过去由人提供的信心必须内建到数据里——在智能体看到数据之前，它就必须是准确、新鲜、经过验证的。

- Contextual: a person knows your “revenue” figure already has returns taken out, and that your fiscal year starts in February; an agent has to be told both. Meaning that used to live in someone's head has to be made explicit in the data.

- 有上下文（Contextual）：人知道你的「revenue」数字已经扣除了退货，也知道你们的财年从二月开始；智能体需要被告知这两点。过去活在某人脑子里的含义，必须显式地写进数据。

- Traceable: when a person decides, they can explain why afterward; when an agent decides in 30 seconds, that reasoning is gone unless you capture it as it happens. You have to be able to reconstruct what the agent did and why.

- 可追溯（Traceable）：人做决定之后可以解释为什么；智能体 30 秒就做出决定，推理过程如果不当场捕获就会消失。你必须能够重建智能体做了什么、为什么这么做。

- Governed: a person's access is bounded by their role and their judgment; an agent's has to be bounded by design. Access must be scoped, controlled, and auditable.

- 受治理（Governed）：人的访问权限受其角色与判断力约束；智能体的权限必须通过设计来约束。访问必须限定范围、受控、可审计。

- Operational: a person reads a dashboard and then goes and does something; an agent has to be _able_ to do the something. The data can't just be readable, it has to be actionable.

- 可操作（Operational）：人看完仪表盘之后会去动手做点什么；智能体必须「有能力」去做那件事。数据不能只是可读的，还必须是可执行的。

All five come down to the same idea. Each is a job humans used to do without thinking, now pushed into the data itself. Miss one, and the agent won't degrade gracefully the way a person would. It fails confidently.

这五条归结为同一个思想：每一项都是人类过去不假思索就完成的工作，如今被推给了数据本身。缺了任何一项，智能体都不会像人那样体面地降级——它会自信地失败。

None of these attributes builds itself. The rest of the article works through four topics that do, roughly in the order you should tackle them.

这些属性不会自己长出来。本文余下部分会依次展开四个主题，大致按照你应该动手处理的顺序。

- [Data Contracts and Quality](#data-contracts) makes data _Trusted_. We start here, because a single wrong fact poisons every layer built on top of it.

- [数据契约与质量](#data-contracts)让数据变得**可信**。我们从这里开始，因为一个错误的事实会毒害建立在它之上的每一层。

- [Traceability and Governance](#traceability) records why an agent acted and bounds what it can reach, making data _Traceable_ and _Governed_.

- [可追溯性与治理](#traceability)记录智能体为何行动、限制它能触及什么，让数据变得**可追溯**和**受治理**。

- [The context layer](#context-layer) encodes what your metrics and entities mean, making data _Contextual_.

- [上下文层](#context-layer)把指标与实体的含义编码下来，让数据变得**有上下文**。

- [From Searchable to Actionable](#actionable) lets agents query live systems and write back, making data _Operational_.

- [从可搜索到可操作](#actionable)让智能体能够查询在线系统并写回，让数据变得**可操作**。

We'll take them one topic at a time, and show what it takes to build each attribute in. Work through all four, and the five attributes stop being abstract goals. They become something you can engineer, turning ordinary data into AI-ready data.

我们逐个主题展开，展示如何把每个属性构建进去。走完四个主题，这五个属性就不再是抽象目标，而是可以工程化实现的东西——把普通数据变成 AI 就绪的数据。

## 数据契约与质量：智能体闻不出坏数据

Humans have a smell test for bad data. They notice when a number looks off, when a date makes no sense, or when a price seems wrong. Agents have no such instinct. As Simon Willison puts it, [language models are gullible](https://simonwillison.net/2023/Oct/14/multi-modal-prompt-injection/), they believe whatever they are handed and act on it. Feed an AI agent a wrong value, and it won't pause to wonder, it will use the number and produce a confident, wrong answer. Without trusted data, nothing else in agentic AI works, so this is where we begin.

人类对坏数据有一套「嗅觉测试」。数字不对劲、日期讲不通、价格离谱，他们都会察觉。智能体没有这种本能。正如 Simon Willison 所说，[语言模型是轻信的](https://simonwillison.net/2023/Oct/14/multi-modal-prompt-injection/)——递给它什么它就信什么，然后照此行动。喂给 AI 智能体一个错误的值，它不会停下来想一想，而是直接用这个数，给出一个自信的错误答案。没有可信的数据，智能体 AI 的其他一切都无从谈起，所以我们从这里开始。

### 智能体把每个值都当作真相

Consider a concrete scenario. A pricing agent is asked for the current price of Product _X_. Yesterday, the price was updated from $49.99 to $59.99. But the agent's data source hasn't refreshed, it still shows the old number.

设想一个具体场景。一个定价智能体被问到产品 _X_ 的当前价格。昨天，价格刚从 $49.99 更新到 $59.99。但智能体的数据源还没刷新，显示的仍是旧数字。

The agent doesn't hesitate, it retrieves $49.99, quotes the customer, the customer buys, and the company loses $10 on every unit sold. Every step the agent took was technically correct. It followed its workflow perfectly. The _data_ it accessed was the problem.

智能体毫不犹豫，取出 $49.99，报给客户，客户下单，公司每卖一件就亏 $10。智能体的每一步在技术上都是正确的，它完美地执行了工作流。问题出在它访问的*数据*上。

> The leaders most confident their data is AI-ready also name data readiness their biggest barrier

> 最自信自家数据已「AI 就绪」的领导者，恰恰把数据就绪度列为最大障碍

A human sales rep would have paused: “Wait, didn't we update this last week?” They'd double-check. They have institutional memory and a feel for when something's off. The agent has neither. Errors don't trigger warnings; they cascade silently through the workflow. And this isn't a rare edge case. In the 2026 [State of Data Integrity and AI Readiness](https://www.lebow.drexel.edu/sites/default/files/2026-01/lebow-precisely-state-data-integrity-ai-readiness-2026.pdf) report, Precisely and Drexel University's LeBow College of Business surveyed 505 data and analytics leaders, of whom 87% believed their data was ready for AI, yet 43% named data readiness as the single biggest barrier to getting value from it. That gap between confidence and readiness is the organization-level version of the pricing agent, sure of itself and wrong. A separate [KPMG Global AI Pulse](https://kpmg.com/xx/en/media/press-releases/2026/06/growing-adoption-signals-progress-as-cost-visibility-and-accountability-drive-ai-value.html) survey of 2,145 leaders points the same way, with nearly half of executives now seeing AI's costs exceed its benefits. Most enterprises are one stale field away from the scenario above.

人类销售代表会停下来：「等等，我们上周不是刚更新过吗？」他们会再核实一遍。他们有组织记忆，对不对劲的事情有直觉。智能体这两样都没有。错误不会触发警告，它们在工作流中悄无声息地层层传导。而且这不是罕见的边角情况。在 2026 年 [State of Data Integrity and AI Readiness](https://www.lebow.drexel.edu/sites/default/files/2026-01/lebow-precisely-state-data-integrity-ai-readiness-2026.pdf) 报告中，Precisely 与德雷塞尔大学 LeBow 商学院调查了 505 位数据与分析领导者，其中 87% 认为自己的数据已经为 AI 做好准备，但同时有 43% 把数据就绪度列为从 AI 中获取价值的最大障碍。这种信心与就绪度之间的落差，就是那个定价智能体在组织层面的翻版——自信，且错误。另一份 [KPMG Global AI Pulse](https://kpmg.com/xx/en/media/press-releases/2026/06/growing-adoption-signals-progress-as-cost-visibility-and-accountability-drive-ai-value.html) 对 2,145 位领导者的调查也指向同一结论：近半数高管现在认为 AI 的成本已超过其收益。大多数企业距离上面的场景，只差一个过期的字段。

### Schema 即法律：数据契约即代码

So how do you prevent AI agents from accessing bad or stale data? The answer is _data contracts_, treating schema as law, not a polite suggestion.

那么，如何防止 AI 智能体访问坏数据或过期数据？答案是*数据契约*——把 schema 当作法律，而不是礼貌性的建议。

This reverses a decade of “schemaless is flexible” thinking, for human consumers, loose schemas are merely inconvenient, while for AI agents, they're dangerous. A data contract, written in the [Open Data Contract Standard](https://github.com/bitol-io/open-data-contract-standard), the format the [Data Contract CLI](https://cli.datacontract.com/) uses (and recommended in [Thoughtworks tech radar 33](https://www.thoughtworks.com/radar/tools/data-contract-cli)), defines the rules explicitly. A `product_pricing` contract might specify:

这颠覆了十年来「无 schema 即灵活」的思维：对人类消费者来说，松散的 schema 只是不便；对 AI 智能体来说，它是危险的。一份用 [Open Data Contract Standard](https://github.com/bitol-io/open-data-contract-standard)（[Data Contract CLI](https://cli.datacontract.com/) 采用的格式，并在 [Thoughtworks 技术雷达第 33 期](https://www.thoughtworks.com/radar/tools/data-contract-cli)中被推荐）编写的数据契约，会把规则显式定义出来。一份 `product_pricing` 契约可能会规定：

- Properties with strict logical types.

- 带有严格逻辑类型的属性。

- A quality rule that `price` must be greater than zero.

- 一条质量规则：`price` 必须大于零。

- A quality check on `currency` that rejects anything outside USD, EUR, or GBP.

- 对 `currency` 的质量检查：拒绝 USD、EUR、GBP 以外的任何值。

- Critically, a _freshness SLA_, pricing data must have been refreshed within the last 24 hours.

- 最关键的是*新鲜度 SLA*：定价数据必须在最近 24 小时内完成过刷新。

In the Open Data Contract Standard, that contract is shown below.

下面展示的是用 Open Data Contract Standard 写成的这份契约。

```yaml
apiVersion: v3.1.0
kind: DataContract
id: product-pricing
name: Product Pricing
version: 1.0.0
status: active
schema:
  - name: product_pricing
    physicalType: table
    properties:
      - name: product_id
        logicalType: string
        physicalType: varchar(64)
        required: true
        unique: true
        primaryKey: true
        primaryKeyPosition: 1
      - name: price
        logicalType: number
        physicalType: decimal
        required: true
        quality:
          - type: sql
            description: Every price must be greater than zero
            query: SELECT min({property}) FROM {object}
            mustBeGreaterThan: 0
      - name: currency
        logicalType: string
        physicalType: varchar(3)
        required: true
        quality:
          - type: sql
            description: Currency must be a supported ISO code
            query: SELECT count(*) FROM {object} WHERE {property} NOT IN ('USD', 'EUR', 'GBP')
            mustBe: 0
      - name: ingested_at
        logicalType: timestamp
        physicalType: timestamp
        required: true
slaProperties:
  # the rule that would have caught the stale-price scenario
  - property: latency
    value: 24
    unit: h
    element: product_pricing.ingested_at
```

Enforcement happens along three dimensions.

契约的执行沿三个维度展开。

- Schema enforcement ensures types and constraints are respected and made explicit by the contract.

- Schema 执行：确保类型与约束得到遵守，并由契约显式声明。

- Freshness SLAs define the maximum acceptable staleness per dataset, nightly batch updates aren't enough when an agent answers in real time. Key the SLA to when the data was last successfully loaded, not when a value last changed, so that steady data isn't flagged as stale and a stalled pipeline can't masquerade as fresh.

- 新鲜度 SLA：定义每个数据集可接受的最大过期程度。当智能体实时作答时，夜间批处理是不够的。SLA 要以数据「最后一次成功载入」的时间为准，而不是以某个值「最后一次变化」的时间为准——这样稳定的数据不会被误标为过期，停滞的管道也无法伪装成新鲜。

- Quality gates validate contracts in CI/CD, blocking deployments when they fail.

- 质量关卡：在 CI/CD 中校验契约，校验失败即阻断部署。

Notice how this changes the earlier pricing scenario, it prevents it by design. If the pricing data hasn't been refreshed in 24 hours, the contract is violated _before the agent ever sees the data._

注意这如何改变了前面的定价场景——它从设计上就杜绝了问题。如果定价数据 24 小时内没有刷新，契约在*智能体看到数据之前*就已经被违反了。

### 隔离模式

Defining a contract is one thing. What happens when data violates it? You need a circuit breaker and that's the quarantine pattern.

定义契约是一回事。当数据违反契约时会发生什么？你需要一个熔断器——这就是隔离模式。

The flow works like this. Raw data arrives from source systems, APIs, databases, streams. Before it enters the agent accessible data store, it passes through a contract validation gate that checks three things, does it match the schema, is it within the freshness SLA, and does it pass the quality rules?

流程是这样的：原始数据从源系统、API、数据库、流中到达。在进入智能体可访问的数据存储之前，它要先通过一道契约校验关卡，检查三件事：是否符合 schema、是否在新鲜度 SLA 之内、是否通过质量规则。

If it passes all three, it flows into the certified, agent ready tier. If it fails any one of them, it's quarantined, routed to a dead letter queue for human review, with alerts fired.

三项全部通过，数据就流入经过认证的「智能体就绪」层。任何一项失败，数据就被隔离，转入死信队列等待人工复核，同时触发告警。

> Bad data lands in a dead-letter queue, never in front of the agent

> 坏数据落入死信队列，永远不会出现在智能体面前

The point is that the agent never sees the bad data. It doesn't get poisoned by stale prices or corrupted embeddings. In the pricing scenario, if the `ingested_at` timestamp is older than 24 hours the contract is violated and the record is quarantined, so when asked about the price the agent says, “I don't have current pricing data” rather than confidently quoting the wrong number. That is a far better failure mode. And it's a job for the data architecture, not the model. A better model won't rescue you from bad data.

关键在于智能体永远不会看到坏数据。它不会被过期价格或损坏的嵌入向量毒害。在定价场景中，如果 `ingested_at` 时间戳超过 24 小时，契约即被违反，记录被隔离。于是当被问及价格时，智能体会说「我没有当前的定价数据」，而不是自信地报出错误的数字。这是一种好得多的失败模式。而且这是数据架构的职责，不是模型的职责——更好的模型救不了坏数据。

### 面向智能体的奖章架构

A medallion architecture is an analytical data design pattern for organizing data in a [lakehouse](https://www.databricks.com/blog/what-is-data-lakehouse), popularized by [Databricks](https://www.databricks.com/blog/what-is-medallion-architecture).

奖章架构是一种在 [lakehouse（湖仓一体）](https://www.databricks.com/blog/what-is-data-lakehouse)中组织数据的分析型数据设计模式，由 [Databricks](https://www.databricks.com/blog/what-is-medallion-architecture) 推广开来。

Bad data gets quarantined, but where does the _good_ data go? That's what the medallion architecture organizes, and its first three tiers are well established:

坏数据被隔离了，但*好*数据去了哪里？这正是奖章架构所组织的内容。它的前三个层级已经很成熟：

- Bronze: raw, immutable ingestion. You keep everything for audit trail and lineage.

- 铜层（Bronze）：原始、不可变的摄入层。保留一切，用于审计追踪与血缘。

- Silver: validated and deduplicated. Schema is applied, data contracts are enforced, and this is where the quarantine pattern lives.

- 银层（Silver）：已验证并去重。应用 schema、执行数据契约，隔离模式就住在这里。

- Gold: certified. This is what the semantic model compiles against, access is governed, and metrics are trusted.

- 金层（Gold）：已认证。语义模型编译的对象就是它，访问受治理，指标可信。

For agentic architectures, there's a useful fourth tier worth adding: **Adaptive Gold** where agents become active participants in data curation rather than passive consumers (shown in the figure below). They monitor their own query patterns, identify frequently accessed combinations, and materialize optimized datasets, effectively building their own warehouse views based on real usage. The idea that agents can actively curate data, rather than only read it, is already in production, at [DataHub's CONTEXT 2025 summit](https://datahub.com/blog/context-2025-highlights/), Apple described agents acting as “digital stewards” of its data catalog, continuously scanning metadata, flagging gaps, and proposing updates, turning passive documentation into an active governance partner. Apple's agents curate the _catalog_; Adaptive Gold points that same active-curation pattern at the _datasets_ themselves. That last step is an extrapolation, but a modest one from something already running.

对于智能体架构，值得增加一个有用的第四层：**自适应金层（Adaptive Gold）**——智能体从被动的数据消费者变成数据治理的积极参与者（见下图）。它们监控自己的查询模式，识别高频访问的组合，物化出优化的数据集，实际上是根据真实使用情况构建自己的数仓视图。「智能体可以主动治理数据，而不只是读取数据」这一想法已经投入生产：在 [DataHub 的 CONTEXT 2025 峰会](https://datahub.com/blog/context-2025-highlights/)上，Apple 描述了智能体作为其数据目录的「数字管家」，持续扫描元数据、标记缺口、提议更新，把被动的文档变成了主动的治理伙伴。Apple 的智能体治理的是*目录*；自适应金层则把同样的主动治理模式指向*数据集本身*。最后这一步是一种外推，但只是从已经运行的东西里迈出的一小步。

> Figure 1: Medallion tiers for agents: data flows from raw Bronze through validated Silver to certified Gold and agent curated Adaptive Gold, while agents are restricted to Gold and above.

> 图 1：面向智能体的奖章层级：数据从原始铜层流经已验证的银层，到已认证的金层与智能体治理的自适应金层；智能体被限制只能访问金层及以上。

> Bronze and Silver are for humans; agents see only Gold and above

> 铜层和银层是给人类的；智能体只见金层及以上

The key architectural principle is that agents should only access Gold tier or above. Bronze and Silver exist for lineage, debugging, and human investigation. Exposing raw or partially validated data to agents invites the pricing problem back in.

关键架构原则是：智能体只应访问金层及以上。铜层和银层的存在是为了血缘、调试和人工调查。把原始或半验证的数据暴露给智能体，等于又把定价问题请了回来。

### 同样的规则适用于非结构化数据

Everything so far has looked like a table, prices, currencies, timestamps, but most of what agents consume isn't tabular. It's documents, wikis, PDFs, and support tickets, chunked and embedded into a vector store for retrieval. If your agents do RAG, this is the data they run on, and it needs the same trust guarantees, even though you can't write `price > 0` on a paragraph. The patterns carry over, only the quality dimensions change.

到目前为止的一切看起来都像一张表——价格、币种、时间戳。但智能体消费的大部分数据并不是表格。它们是文档、wiki、PDF 和工单，被切块并嵌入向量存储以供检索。如果你的智能体在做 RAG，这就是它们赖以运行的数据，它同样需要那些信任保证——尽管你没法在一段文字上写 `price > 0`。模式是相通的，只是质量维度变了。

The stale-price scenario has a twin here. A policy document gets updated, but the vector index isn't re-embedded, so the agent retrieves the old version and answers confidently from it, the same failure as the stale price, only now it's an embedding rather than a row. The _freshness SLA_ carries over, but be precise about what the clock measures, the point isn't when the content last changed, it's when the index was last successfully rebuilt against its sources. A 24-hour SLA means the re-indexing job must have completed within the last 24 hours, if it hasn't, the index is stale and quarantined even when nothing appears to have changed, because a silently failed indexer is exactly when you can't tell whether something did. That one heartbeat catches both the _updated but unindexed_ document and the pipeline that quietly stopped.

过期价格场景在这里有一个孪生版本。一份政策文档更新了，但向量索引没有重新嵌入，于是智能体检索到旧版本，并据此自信作答——与过期价格同样的失败，只不过这次是嵌入向量而不是一行记录。_新鲜度 SLA_ 同样适用，但要精确界定时钟衡量的是什么：重点不是内容最后一次变化的时间，而是索引最后一次针对其数据源成功重建的时间。24 小时 SLA 意味着重建索引的任务必须在最近 24 小时内完成过；如果没有，即便看起来什么都没变，索引也是过期的、要被隔离——因为索引器静默失败时，恰恰是你无法判断是否有东西变了的时刻。这一个小小的心跳信号，既能抓住*更新了但没重建索引*的文档，也能抓住悄悄停摆的管道。

_Contracts_ move from the content to the surrounding metadata. You can't constrain the prose, but you can require that every chunk carry a source, a version, a timestamp, and an access scope, and reject anything that doesn't. That metadata is also what makes retrieval traceable and governable later.

*契约*从内容转移到周围的元数据上。你无法约束行文本身，但可以要求每个文本块都携带来源、版本、时间戳和访问范围，不合规的一律拒绝。这些元数据也正是日后让检索可追溯、可治理的基础。

_Quality gates_ get checks suited to text, reject empty or truncated chunks, catch near-duplicate documents that skew retrieval, flag failed extractions and OCR garbage, and watch for embedding drift. A malformed or empty embedding warps similarity search, so it never reaches the store, for the same reason a bad price never reaches the agent, a warped index makes the agent retrieve confidently wrong content.

*质量关卡*换成适合文本的检查：拒绝空的或被截断的文本块，抓出干扰检索的近似重复文档，标记失败的抽取和 OCR 垃圾，监控嵌入漂移。畸形或空的嵌入向量会扭曲相似度搜索，所以它们永远进不了存储——与坏价格永远到不了智能体面前是同一个道理：扭曲的索引会让智能体检索出自信的错误内容。

Whether the data is a priced row or an embedded paragraph, the job is identical. The architecture has to smell what's bad before the agent does.

无论数据是一行定价记录还是一段嵌入文本，任务都是一样的：架构必须在智能体之前就闻到坏味道。

### 置信度阈值路由

Contracts, quarantine, and the medallion architecture handle the clear cases. But there's a gray area, data that isn't clearly bad, but isn't fully trustworthy either. That's where confidence-threshold routing comes in, bridging full autonomy and full human control.

契约、隔离和奖章架构处理的是明确的情况。但还有一个灰色地带：数据不算明显坏，但也不完全可信。这就是置信度阈值路由登场的地方——它在完全自主与完全人工控制之间架起桥梁。

The agent processes a request and assesses data quality signals, and checks not just _model_ confidence, but _data-level_ signals like freshness, completeness, and consistency. If confidence is at or above the threshold (say 85%), the agent proceeds autonomously. Below it, the agent defers to a human. The threshold is configurable per use case, for example, pricing might demand 90%, while an internal FAQ is fine at 70%.

智能体处理请求时会评估数据质量信号——不仅检查*模型*置信度，还检查*数据层*的信号，如新鲜度、完整性和一致性。如果置信度达到或超过阈值（比如 85%），智能体自主继续；低于阈值，则转交人类。阈值可按用例配置：例如定价场景可能要求 90%，而内部 FAQ 70% 就够用。

Let's return to the pricing scenario one last time. The price data is three days stale; the freshness SLA says 24 hours. The SLA violation automatically drives the confidence score below the threshold, regardless of how confident the model itself feels about its answer. The agent should respond by pulling a human in:

最后一次回到定价场景。价格数据已过期三天，而新鲜度 SLA 规定 24 小时。SLA 违约会自动把置信度分数压到阈值之下，无论模型自己对自己的答案多有信心。智能体的正确反应是引入人类：

> “I'm not confident this price is current. Routing to a human for verification.”

> 「我不确定这个价格是否现行有效。转交人工核实。」

> Data quality signals should drive the threshold, not just the model's own confidence

> 驱动阈值的应是数据质量信号，而不只是模型自身的置信度

In other words, data quality signals should drive the threshold, not just the model's own confidence. A model can be sure of a stale answer, and the freshness SLA overrides that misplaced certainty.

换句话说，驱动阈值的应是数据质量信号，而不只是模型自身的置信度。模型可能对一个过期的答案信心十足，而新鲜度 SLA 会推翻这种错位的自信。

The hard part is turning those quality signals into a single score and weighing it against the model's own confidence. That's an open design problem, not a solved one. Start with a hard gate rather than a smooth composite. Any contract or SLA breach forces a human, regardless of how the other signals look. Add weighted scoring later, and only once you can show it beats that simple rule.

难点在于把这些质量信号汇成一个分数，并与模型自身的置信度权衡。这是一个开放的设计问题，还没有定论。从硬性关卡开始，而不是平滑的加权合成：任何契约或 SLA 违约都强制转交人类，不管其他信号看起来多好。加权评分以后再引入——而且要等到你能证明它优于那条简单规则之后。

### 从哪里开始

You don't have to build all of this at once, and most teams can't. Contracts, quarantine gates, a medallion architecture, and confidence-threshold routing are a lot to stand up in one go. The good news is that they're additive, each one lowers risk on its own, and you can layer in the rest over time. Begin with the highest leverage moves and expand from there.

你不必一次建齐所有这些，大多数团队也做不到。契约、隔离关卡、奖章架构、置信度阈值路由，一口气立起来量太大。好消息是它们是可叠加的：每一项单独就能降低风险，其余的可以随时间的推移逐层加入。从杠杆效应最高的动作开始，再向外扩展。

- Define freshness SLAs for every dataset agents touch. The same dataset can have different freshness requirements per consumer, such as a pricing table that's fine on nightly batches for a dashboard may need near real time updates when a quoting agent depends on it.

- 为智能体触及的每个数据集定义新鲜度 SLA。同一个数据集对不同消费者可以有不同要求：定价表对仪表盘来说夜间批处理就够，但当报价智能体依赖它时，就可能需要近实时更新。

- Implement quarantine gates. Validate against contracts before data enters agent accessible storage. Start with your highest risk datasets such as pricing, inventory, customer records.

- 实施隔离关卡。数据进入智能体可访问存储之前先按契约校验。从风险最高的数据集开始，比如定价、库存、客户记录。

- Start with the Data Contract CLI. Bring contract governance into CI/CD, define contracts as YAML, validate automatically, block deployments on failure. Treat data contracts with the same rigor you'd give an API contract.

- 从 Data Contract CLI 开始。把契约治理引入 CI/CD，用 YAML 定义契约，自动校验，失败即阻断部署。像对待 API 契约一样严谨地对待数据契约。

- Add confidence threshold routing. When quality signals drop below a threshold, defer to a human. Start high (around 90%) and adjust downward as you build trust and track accuracy.

- 增加置信度阈值路由。质量信号低于阈值时就转交人类。起点设高（90% 左右），随着信任建立和准确率跟踪，再逐步下调。

We've made data trustworthy. But when agents act autonomously on that data, who's watching?

我们让数据变得可信了。但当智能体基于这些数据自主行动时，谁在看着？

## 可追溯性与治理：审计自主智能体

Even with perfect data, autonomous action raises a harder question, when a regulator asks why the agent did what it did, can you answer? Traditional systems record what happened. Agentic ones have to explain why. That shift, from _what_ to _why_, is where governance gets hard.

即便数据完美无缺，自主行动也引出一个更难的问题：当监管者问「智能体为什么这么做」时，你答得上来吗？传统系统记录的是发生了什么。智能体系统必须解释为什么。从「什么」到「为什么」的这一转变，正是治理变难的地方。

### 审计缺口

Picture a bank running agentic AI for trade finance, where the governance architecture is the real innovation.

设想一家银行在贸易融资中运行智能体 AI——这里真正的创新是治理架构。

An agent processes a letter of credit. It checks KYC data, verifies the customer isn't on a sanctions list, evaluates the credit terms, and approves a $2.4 million transaction, all in about 30 seconds. Six months later, a regulator asks a simple question, “Why was this approved?”

一个智能体处理一份信用证。它核查 KYC 数据、确认客户不在制裁名单上、评估信贷条款，然后批准了一笔 240 万美元的交易——全程约 30 秒。六个月后，监管者问了一个简单的问题：「这笔交易为什么被批准？」

Traditional audit logs can tell you **what** happened, but they can't tell you **why**.

传统审计日志能告诉你**发生了什么**，但无法告诉你**为什么**。

Traditional audit logs can tell you _what_ happened, which tables were queried, at what time, by which service account. What they can't tell you is _why_. Why did the agent check the sanctions list before the credit terms? Why did it approve despite a minor documentation discrepancy? What alternatives did it consider and reject? The gap between “what” and “why” is where regulatory risk arises, and the [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) 's [Article 12](https://artificialintelligenceact.eu/article/12/) requires high-risk systems to keep automatic logs for exactly this reason, so the “why” can be reconstructed after the fact. Closing that gap is what agentic lineage is for.

传统审计日志能告诉你*发生了什么*：查了哪些表、什么时间、用哪个服务账户。它无法告诉你的是*为什么*：智能体为什么先查制裁名单再看信贷条款？为什么在存在轻微单据差异的情况下仍然批准？它考虑过并否掉了哪些替代方案？「什么」与「为什么」之间的缺口正是监管风险滋生的地方。欧盟[《人工智能法案》](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)的[第 12 条](https://artificialintelligenceact.eu/article/12/)要求高风险系统自动保存日志，正是出于这个原因——让「为什么」可以在事后被重建。填补这个缺口，正是智能体血缘的用武之地。

### 智能体血缘

The way to close this audit gap is _agentic lineage_, an extension of traditional data lineage. Where traditional lineage tracks which sources were accessed, agentic lineage tracks why the agent decided to access X, because it found Y in source Z.

弥合审计缺口的方法是*智能体血缘*——传统数据血缘的扩展。传统血缘追踪访问了哪些数据源；智能体血缘追踪的是：智能体为什么决定访问 X——因为它在数据源 Z 中发现了 Y。

Concretely, for the trade finance case, a single trace represents the end-to-end workflow of processing letter of credit LC-4892. Within that trace, each span is an individual step:

具体到贸易融资案例，一条 trace 代表处理信用证 LC-4892 的端到端工作流。在这条 trace 之内，每个 span 是一个独立步骤：

- Span 1: retrieved customer KYC data from the compliance database, result: verified.

- Span 1：从合规数据库检索客户 KYC 数据，结果：已核实。

- Span 2: checked the sanctions list via the OFAC API, result: clear.

- Span 2：通过 OFAC API 核查制裁名单，结果：无命中。

- Span 3: evaluated credit terms against the policy engine, result: within limits.

- Span 3：对照政策引擎评估信贷条款，结果：在限额之内。

- Final span: the decision, APPROVE, with a 94% confidence score and the full reasoning chain attached.

- 最终 span：决策——批准（APPROVE），附带 94% 的置信度分数与完整推理链。

This is exactly what a regulator needs. Not “the agent accessed the compliance database at 14:32:07 UTC” but “the agent checked KYC first, then sanctions, then credit terms, and approved because all three passed.” The _traces and spans model_ is borrowed directly from distributed systems observability, so engineers already understand the mental model from tools like [Jaeger](https://www.jaegertracing.io/) and [Zipkin](https://zipkin.io/). For the agentic equivalent, [Langfuse](https://langfuse.com/), [Arize Phoenix](https://phoenix.arize.com/), and [OpenTelemetry](https://opentelemetry.io/) for AI are the emerging choices. All three feature on the Thoughtworks Technology Radar, OpenTelemetry at Adopt, Langfuse at Trial, and Arize Phoenix at Assess.

这正是监管者需要的：不是「智能体于 UTC 14:32:07 访问了合规数据库」，而是「智能体先核查 KYC，再查制裁名单，然后评估信贷条款，因为三项全部通过所以批准」。*追踪与跨度（traces and spans）模型*直接借自分布式系统可观测性领域，工程师们早已通过 [Jaeger](https://www.jaegertracing.io/) 和 [Zipkin](https://zipkin.io/) 这类工具熟悉了这一心智模型。智能体领域的对应选择正在涌现：[Langfuse](https://langfuse.com/)、[Arize Phoenix](https://phoenix.arize.com/) 和面向 AI 的 [OpenTelemetry](https://opentelemetry.io/)。这三者都登上了 Thoughtworks 技术雷达：OpenTelemetry 处于采纳（Adopt）环，Langfuse 处于试用（Trial）环，Arize Phoenix 处于评估（Assess）环。

### 监管的牙齿是真的

This isn't a theoretical exercise. The EU AI Act is the most specific regulation on the books. [Article 12](https://artificialintelligenceact.eu/article/12/) requires high-risk AI systems to automatically log events over their lifetime so their operation can be traced, and [Article 19](https://artificialintelligenceact.eu/article/19/) requires providers to keep those logs for at least six months. Breaching these record-keeping obligations falls in the Act's middle penalty tier, up to €15 million or 3% of global annual turnover, whichever is higher. For a large company, even 3% of global turnover runs into the hundreds of millions.

这不是纸上谈兵。欧盟《人工智能法案》是目前最具体的成文监管。[第 12 条](https://artificialintelligenceact.eu/article/12/)要求高风险 AI 系统在其生命周期内自动记录事件，使其运行过程可被追踪；[第 19 条](https://artificialintelligenceact.eu/article/19/)要求提供者将这些日志保存至少六个月。违反这些记录保存义务会落入法案的中档处罚区间：最高 1500 万欧元，或全球年营业额的 3%，以较高者为准。对大公司来说，即便是全球营业额的 3% 也是数亿美元之巨。

Together, Articles 12 and 19 translate into three obligations for your architecture:

第 12 条与第 19 条合在一起，给你的架构带来三项义务：

- Automatically log events across the system's lifetime, enough to trace how it operated, not just isolated timestamps.

- 在系统整个生命周期内自动记录事件，足以追踪它的运行方式，而不只是零散的时间戳。

- Retain those logs for at least six months, which means your observability infrastructure has to handle long-term storage.

- 将这些日志保存至少六个月，这意味着你的可观测性基础设施必须支持长期存储。

- Be able to reconstruct the “why” after the fact. The law mandates the logs; making them answer a regulator's question is on you. That means capturing the full reasoning chain, which sources were consulted, what logic was applied, and which alternatives the agent weighed and rejected.

- 能够在事后重建「为什么」。法律只强制要求有日志；让日志能回答监管者的问题，是你自己的事。这意味着要捕获完整推理链：查询了哪些数据源、应用了什么逻辑、智能体权衡并否掉了哪些替代方案。

The EU is furthest ahead, and for now no other jurisdiction has a law quite like it. But you don't have to bet on where regulation lands to see the point. Sooner or later something will force the question of why an agent did what it did, whether that's a regulator, an auditor, a customer disputing a decision, or just your own team trying to debug one. The safe assumption isn't that a particular law is coming, it's that you'll want to answer that question regardless. A system you can't explain is one you can't fully trust, defend, or fix.

欧盟走在了最前面，目前还没有其他司法辖区有类似的法律。但你不需要押注监管最终落在哪里才能看懂要点。或早或晚，总有什么会逼着回答「智能体为什么这么做」这个问题——可能是监管者、审计师、对决策提出异议的客户，或者只是你自己的团队在调试某个问题。稳妥的假设不是「某部法律快来了」，而是「无论如何你都会想回答这个问题」。一个你无法解释的系统，就是一个你无法完全信任、无法辩护、也无法修复的系统。

### 分阶段自主

Knowing you need audit trails is one thing; rolling this out safely is another. You don't deploy an agent with full autonomy on day one, any more than you'd hand a brand new employee unrestricted access. Autonomy is earned in stages:

知道需要审计追踪是一回事，安全地铺开是另一回事。你不会在第一天就部署一个拥有完全自主权的智能体，正如你不会给一个新员工不受限制的权限。自主权是一级一级挣来的：

| 阶段         | 智能体                                                 | 人类                 | 监控                                       |
| ------------ | ------------------------------------------------------ | -------------------- | ------------------------------------------ |
| 影子模式     | 推荐行动                                               | 复核建议，合适才执行 | 所有建议都被记录，以跟踪准确率随时间的变化 |
| 受监督       | 准备行动并等待批准                                     | 复核行动，批准或否决 | 所有提议的行动与人工决策均被记录           |
| 带护栏的自主 | 在既定边界内行动（边界最好按可逆性划定，而非交易金额） | 定义护栏             | 所有行动均被记录，异常时触发告警           |
| 完全自主     | 执行所有行动                                           | 抽查                 | 持续监控，由其他智能体与人类共同执行       |

> 原文对照：Shadow Mode — Agent: Recommends actions; Human: Reviews recommendation and executes if appropriate; Monitoring: All recommendations are logged to track accuracy over time. Supervised — Agent: Prepares action and waits for approval; Human: Reviews action and approves or denies; Monitoring: All proposed actions and human decisions are logged. Autonomous with guardrails — Agent: Acts within defined boundaries (best drawn by reversibility, not transaction size); Human: Defines guardrails; Monitoring: All actions logged, alerts fired on exceptions. Full autonomy — Agent: Carries out all actions; Human: Spot checks; Monitoring: Continuous, by other agents and humans.

You wouldn't give a new hire the corporate credit card on day one. They start with purchase requests, graduate to supervised spending, and eventually earn a card with limits. Agents should earn trust the same way.

你不会在第一天就把公司信用卡交给新员工。他们从采购申请开始，逐渐过渡到受监督的开销，最终获得一张有限额的卡。智能体也应该以同样的方式赢得信任。

Promotion up this ladder should turn on evidence, not a hunch. That means testing an agent before each step, not only watching it in production. Agents are hard to test. They're nondeterministic, costly to call, and act through tools with real side effects. So teams mock or replay the tool and model interactions so tests run deterministically in CI. They score the agent's decisions with evals rather than calling live services on every run. Building that harness is a discipline of its own, and beyond the scope of this article.

沿阶梯晋升应基于证据，而不是感觉。这意味着每一步之前都要测试智能体，而不只是在生产环境里观察它。智能体很难测试：它们不确定、调用成本高，而且通过带真实副作用的工具行动。因此团队会 mock 或回放工具与模型的交互，让测试在 CI 中以确定性的方式运行。他们用 evals（评估）给智能体的决策打分，而不是每次运行都调用真实服务。构建这套测试装置本身就是一门学问，超出了本文的范围。

### 委托访问与即时凭证

As agents earn autonomy, the question becomes, what permissions should they hold? Three security patterns matter most here.

随着智能体赢得自主权，问题变成了：它们应该持有什么权限？这里最重要的三个安全模式是：

- Delegated Access: When Alice asks the agent to check her account, the agent should act _with Alice's permissions_, not through a broad service account that can see every customer's data. Shared service accounts destroy attribution. When a regulator asks “who accessed this customer's data?”, “the service account” tells you almost nothing. With delegated access, the answer is “Alice's agent, acting on Alice's behalf, with Alice's permissions.”

- 委托访问（Delegated Access）：当 Alice 让智能体查她的账户时，智能体应该*以 Alice 的权限*行动，而不是通过一个能看到所有客户数据的宽泛服务账户。共享服务账户会毁掉归因能力。当监管者问「谁访问了这位客户的数据？」，「服务账户」这个回答几乎什么也说明不了。有了委托访问，答案就是「Alice 的智能体，代表 Alice，以 Alice 的权限」。

- Just-in-time Credentials: Instead of a persistent API key that never expires, issue a short-lived token for each specific task. The agent needs to check the sanctions list? Issue a token scoped to _OFAC API_ read access for that specific customer, valid for five minutes. When the task completes, the token expires. No standing credentials sitting around waiting to be compromised.

- 即时凭证（Just-in-time Credentials）：不要发放永不过期的持久 API key，而是为每个具体任务签发短时有效的令牌。智能体需要查制裁名单？就签发一个限定为*针对该客户*的 OFAC API 读取权限、五分钟有效的令牌。任务完成，令牌即失效。不再有常驻凭证闲置着等待被攻破。

- Least Privilege: The agent gets the minimum access the task requires. Processing a letter of credit doesn't need reach into HR systems or marketing data.

- 最小权限（Least Privilege）：智能体只获得任务所需的最小访问权限。处理信用证不需要触及 HR 系统或营销数据。

Together, these three patterns address the attribution and scope challenges that undermine many current agentic deployments.

这三个模式合在一起，解决了困扰当前许多智能体部署的归因与范围难题。

They also defend against the sharpest security risk in agentic systems. Simon Willison calls it the [lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), an agent turns dangerous the moment it holds all three of access to private data, exposure to untrusted content, and a way to communicate externally. Put those together and a single poisoned document or web page can hijack the agent through prompt injection and quietly exfiltrate whatever it can reach. Delegated access, _just-in-time_ credentials, and least privilege shrink how much a hijacked agent can reach, breaking the trifecta. Later we add a second cut at the same problem, keeping retrieved text out of the authorisation path entirely, so that a poisoned document cannot grant a permission in the first place.

它们还抵御了智能体系统中最尖锐的安全风险。Simon Willison 称之为[致命三要素](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)：当智能体同时具备这三样——对私有数据的访问权、对不可信内容的接触、对外通信的渠道——它就变得危险。三者齐聚，一份被投毒的文档或网页就能通过提示注入劫持智能体，悄悄窃取它所能触及的一切。委托访问、*即时*凭证和最小权限压缩了被劫持智能体可触及的范围，从而瓦解三要素。稍后我们会用第二种思路处理同一个问题：让检索出的文本彻底离开授权路径，使投毒文档从一开始就无法授予任何权限。

### 从哪里开始

Of the four topics, this is the one where going slowly is the right instinct. But separate two things that are easy to conflate. Autonomy is earned in stages, so nobody expects you to grant it all at once. Observability is not staged at all. It goes in from day one, at full strength, whatever the autonomy level, because retrofitting it onto a running system is painful. What you build on top can stay deliberately conservative; the instrumentation underneath cannot.

四个主题中，这是最适合「慢慢来」的一个。但要把两件容易混淆的事情分开。自主权是分阶段挣来的，所以没人指望你一次性全部授予。可观测性则完全不分阶段——从第一天起就要全量接入，无论自主级别多高，因为给运行中的系统事后补装是痛苦的。上层构建的东西可以刻意保守，底层的埋点不能。

- Instrument from day one. Of everything here, this is the one to do first, adding observability after deployment is far harder. Every agent workflow should emit traces with spans for each step, including reasoning and sources consulted. The tracing pattern here is well established, so lean on a proven tool (like [OpenTelemetry](https://opentelemetry.io/)) rather than building your own.

- 第一天就埋点。在所有事项中，这是首先要做的，部署之后再补可观测性要难得多。每个智能体工作流都应发出带 span 的 trace，覆盖每一步，包括推理过程和所查询的数据源。这里的追踪模式已经很成熟，依赖经过验证的工具（如 [OpenTelemetry](https://opentelemetry.io/)），而不是自己造轮子。

- Start in shadow mode. Lowest risk, highest learning. Agents recommend, humans decide. You build the audit trail before you need it for compliance and measure accuracy before granting autonomy.

- 从影子模式起步。风险最低，学习最多。智能体建议，人类决策。在合规需要之前就把审计追踪建好，在授予自主权之前先度量准确率。

- Implement delegated access. Agents inherit the invoking user's permissions and use _just-in-time_ credentials with short expiry windows. No persistent tokens.

- 实施委托访问。智能体继承调用者的权限，使用短过期窗口的*即时*凭证。不留持久令牌。

- Build to be explainable. Whether or not a regulator ever asks, an audit trail that answers “why” is what lets you debug a bad decision, defend a good one, and trust the system enough to widen its autonomy. Wire it in now, it's far harder to add later.

- 构建得可解释。无论监管者会不会问，一条能回答「为什么」的审计追踪，能让你调试错误的决策、为正确的决策辩护，并足够信任系统以扩大其自主权。现在就接好，以后再补要难得多。

Semantic layers bridge the institutional knowledge gap between agents and human analysts, building on trusted data and auditable actions provided by the earlier topics.

语义层在前两个主题提供的可信数据与可审计行动之上，弥合智能体与人类分析师之间的组织知识鸿沟。

## 上下文层：教智能体你的数据意味着什么

Semantic layers provide the explicit context AI agents need when they become the primary consumers of data, context that human analysts carry implicitly, based on years of experience.

当 AI 智能体成为数据的主要消费者时，语义层提供它们所需的显式上下文——那些人类分析师基于多年经验而隐性携带的上下文。

### 你的智能体不知道「revenue」意味着什么

Ask an agent, “What was Q3 revenue for Product X?” A human analyst knows precisely what to do, which table to query, whether revenue means gross or net, what Q3 maps to in your fiscal calendar. They absorbed all of it over years of institutional knowledge, tribal docs, and Slack threads.

问智能体：「产品 X 第三季度的营收是多少？」人类分析师清楚地知道该做什么：查哪张表、revenue 是毛额还是净额、Q3 对应你财年日历的哪几个月。这些是他们在多年的组织知识、部落文档和 Slack 讨论串中逐渐吸收的。

The agent has none of it. It doesn't know which joins connect products to orders to revenue, or that your fiscal calendar starts in February. With that context missing, it either hallucinates an answer or gives up. The semantic layer fills that gap, supplying the business-domain context.

智能体一样都没有。它不知道哪些 join 把产品、订单和营收连在一起，也不知道你们的财年从二月开始。缺少这些上下文，它要么编造答案，要么放弃。语义层填补的正是这个缺口，提供业务领域上下文。

### 上下文层是什么

A semantic layer is a set of declarative definitions of your metrics, how revenue is calculated, what an active customer is, what the numbers mean. Every consumer goes through the same definitions, so they all derive consistent, accurate results. But an agent that acts needs more than definitions of numbers. It needs to know what the things are, and what it may do to them. Those are three separate bodies of definition, and an agent needs all three.

语义层是一组关于指标的声明式定义：营收如何计算、什么是活跃客户、数字意味着什么。所有消费者都经过同一套定义，因此都能得到一致、准确的结果。但一个要行动的智能体需要的不仅仅是数字的定义。它需要知道「事物是什么」，以及「它能对它们做什么」。这是三套相互独立的定义，而智能体三者都需要。

The **domain model** says what exists. Entities, their relationships, and the meaning rules of the business: an order belongs to a customer, an active customer is one who purchased in the last ninety days. It gives the agent the vocabulary to interpret a request and plan against it. It is consulted, never executed; no query path to data runs through it.

**领域模型**说明存在什么。实体、它们的关系，以及业务含义规则：订单属于客户，活跃客户是过去九十天内有购买行为的客户。它为智能体提供了解读请求、制定计划所需的词汇表。它只被查询，从不被执行——没有任何通往数据的查询路径经过它。

The **semantic model** says how the numbers are computed. Metrics and dimensions, one versioned formula each, compiled to the same SQL every time and run against the analytical store. This is the semantic layer under a more exact name, and the job is to put correctness in the compiler rather than in the model's guess.

**语义模型**说明数字如何计算。指标与维度，每个都有版本化的一版公式，每次都编译为相同的 SQL，并针对分析型存储执行。这是语义层更精确的别名，其职责是把正确性放进编译器，而不是放进模型的猜测里。

The **capability model** says what the agent may do. A curated set of operations against live systems, some that read (check payment status, retrieve a troubleshooting guide) and some that write (issue a refund). Each carries permissions and an owner, and the acting ones carry preconditions and a reversibility class as well.

**能力模型**说明智能体可以做什么。一组针对在线系统精心策划的操作：有些是读取（查支付状态、取排障指南），有些是写入（发起退款）。每个操作都携带权限和所有者；会实际执行的操作还额外携带前置条件与可逆性分级。

Nouns, numbers, and verbs. Together they are the **context layer**, and what unites them is not that they are all about meaning, because the capability model plainly is not. It is that each one is a place where a guarantee is declared once, in version control, instead of being worked out afresh by the model on every request. The definitions are the layer; the interface, MCP today, is just the door.

名词、数字和动词。三者合在一起就是**上下文层**。把它们联系在一起的，并不是「都关乎含义」——能力模型显然不是——而是：每一处都是一次性声明保障的地方，声明存放在版本控制里，而不是让模型在每次请求时重新临场推演。定义才是层本身；接口（今天是 MCP）只是一扇门。

A reader who works with dbt will object that its [semantic models](https://docs.getdbt.com/docs/build/about-metricflow) already declare entities, so why separate the domain model out. Because entities declared inside the metrics layer are scoped to metrics, and the capability model has to be written in the same vocabulary as the semantic one or the two drift apart. A refund acts on the same customer the revenue figure counts. One vocabulary underneath, or you get two.

熟悉 dbt 的读者会反驳：dbt 的[语义模型](https://docs.getdbt.com/docs/build/about-metricflow)已经声明了实体，何必把领域模型单独拆出来？因为指标层内部声明的实体其作用域仅限于指标，而能力模型必须用与语义模型相同的词汇表来编写，否则二者就会渐行渐远。退款操作的客户对象，与营收数字统计的客户对象，是同一个客户。底层必须只有一套词汇表，否则就会变成两套。

> Figure 2: The context layer: a domain model of entities and relationships, a semantic model of metrics compiled to SQL against the analytical store, and a capability model of guarded reads and actions against live systems, with provenance signals across all three. The domain model has no arrow out because it is consulted rather than executed; the other two are written in its vocabulary. Dashboards and analysts reach the semantic model; agents are the first consumer to need all three, which is the shift this article is about.

> 图 2：上下文层：实体与关系的领域模型、针对分析型存储编译为 SQL 的指标语义模型、以及针对在线系统的受保护读取与操作的能力模型，三者之间贯穿着来源信号。领域模型没有向外指向的箭头，因为它只被查询而不被执行；另外两者都用它的词汇表编写。仪表盘和分析师只到达语义模型；智能体是第一个需要全部三者的消费者——这正是本文所讨论的转变。

All three models are code in source control. They go through code reviews, get tested in CI, and progress through environments before reaching production. When the definition of “revenue” or the rule on refunds changes, you change it in one place and it propagates everywhere. Agents never reach the underlying data directly; they go through the context layer, which constrains and governs both what they can ask for and what they can do.

三个模型都是源代码控制里的代码。它们经过代码评审、在 CI 中测试，跨环境演进后才进入生产。当「revenue」的定义或退款的规则改变时，你只需在一处修改，它就会传播到所有地方。智能体从不直接接触底层数据；它们经由上下文层，这一层同时约束和治理它们能请求什么、能做什么。

### 指标即代码

In practice, the business logic lives right in the definition, revenue = order_amount - discount_amount, not buried in a BI tool or an ad hoc SQL view. The agent receives a natural language question, and the semantic model resolves it to correct, constrained SQL. The agent doesn't guess table names or join paths; it uses the definition.

实践中，业务逻辑直接活在定义里：`revenue = order_amount - discount_amount`，而不是埋在 BI 工具或临时的 SQL 视图里。智能体收到自然语言问题，语义模型把它解析为正确且受约束的 SQL。智能体不猜表名或连接路径，它直接用定义。

The examples here use [dbt MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow) syntax (dbt is mid-migration from measures to a metrics-first spec; the widely-used form is shown here, and the concept holds either way). _Cube.js_, _Snowflake_, and _Databricks_ all follow similar patterns. The tool matters less than the discipline of getting business logic into version controlled code.

这里的示例使用 [dbt MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow) 语法（dbt 正处于从 measures 向 metrics 优先规范迁移的中途；此处展示的是广泛使用的形式，无论哪种形式，概念都成立）。_Cube.js_、_Snowflake_ 和 _Databricks_ 都遵循类似的模式。工具没那么重要，重要的是把业务逻辑纳入版本化代码的纪律。

```yaml
semantic_models:
  - name: orders
    model: ref('orders')
    defaults:
      agg_time_dimension: order_date
    entities:
      - name: order_id
        type: primary
      - name: customer_id
        type: foreign
    dimensions:
      - name: order_date
        type: time
        type_params:
          time_granularity: day
    measures:
      - name: revenue
        agg: sum
        expr: order_amount - discount_amount
        create_metric: true
```

### 同样的问题，截然不同的 SQL

Let's consider an example. Ask “What was Q3 revenue for Product X?” of an agent _without_ a semantic model, and it guesses at table names, uses the wrong column, has no fiscal-calendar mapping, and misses the join.

看一个例子。向*没有*语义模型的智能体提问「产品 X 第三季度的营收是多少」，它会瞎猜表名、用错列、没有财年日历映射，还漏掉 join。

```sql
-- Before metric definition
SELECT SUM(amount)
  FROM sales_data
 WHERE product = 'Product X'
   AND quarter = 'Q3'
```

Ask the same question _with_ a semantic model, and the agent is constrained to the correct table, the net-revenue formula from the YAML definition, the right fiscal-calendar dates, and the valid join path.

向*有*语义模型的智能体问同一个问题，它会被约束到正确的表、来自 YAML 定义的净营收公式、正确的财年日历日期和有效的连接路径。

```sql
-- Constrained by metric definition
SELECT SUM(order_amount - discount_amount)
  FROM orders o
  JOIN products p
    ON o.product_id = p.id
 WHERE p.name = 'Product X'
   AND o.order_date
       BETWEEN '2025-07-01'
           AND '2025-09-30'
```

The semantic model doesn't make the agent smarter. It stops it from guessing. For an agent that acts on the answer unchecked, that's what matters.

语义模型不会让智能体更聪明。它只是让它停止猜测。对于一个不加核查就按答案行动的智能体来说，这才是关键。

### 智能体如何使用它

Take the semantic model on its own, the path a quantitative question travels. End to end, the flow looks like this. The agent sends a natural-language question (step 1). The semantic model looks up metric definitions, valid dimensions, join paths, and access rules, via MCP (step 2), then generates constrained SQL (step 3), both inside the same component. The data warehouse executes the query (step 4). The result flows back to the agent with full lineage metadata (step 5).

单看语义模型，一个定量问题的完整路径如下：智能体发出自然语言问题（第 1 步）。语义模型通过 MCP 查找指标定义、有效维度、连接路径和访问规则（第 2 步），然后生成受约束的 SQL（第 3 步）——两步都在同一个组件内完成。数据仓库执行查询（第 4 步）。结果连同完整的血缘元数据一起流回智能体（第 5 步）。

> Figure 3: One of the three paths: a quantitative question answered through the semantic model. Questions about what things are go to the domain model, and reads or actions against live systems go through the capability model.

> 图 3：三条路径之一：定量问题经语义模型作答。关于「事物是什么」的问题走领域模型，针对在线系统的读取或操作走能力模型。

> Agents pick from governed metrics, never raw tables they can misread

> 智能体从受治理的指标中挑选，绝不接触它们会误读的原始表

The semantic model constrains what the agent can ask for. dbt's, for instance, dynamically surfaces only the dimensions applicable to the selected metrics, which prevents the agent from generating plausible sounding but incorrect queries. And that lineage metadata in step 5 is the foundation for the traceability we covered earlier. Context and traceability reinforce one another.

语义模型约束了智能体能请求什么。以 dbt 为例，它只动态暴露适用于所选指标的维度，从而防止智能体生成听起来合理但错误的查询。而第 5 步中的血缘元数据，正是我们前面讨论的可追溯性的基础。上下文与可追溯性彼此强化。

### 从哪里开始

The temptation with a context layer is to model the whole business before you ship anything. Resist it. Start with the semantic model, because the value is concentrated in a handful of metrics, the contested ones that mean different things to different teams. Let your first agent use case set the scope, and grow the domain model and the capabilities it actually needs rather than the ones you can imagine. A narrow, correct context layer beats a sprawling, half-agreed one.

上下文层的一个诱惑是：在交付任何东西之前，先把整个业务建模出来。抵制它。从语义模型开始，因为价值集中在少数几个指标上——那些不同团队理解各异的争议性指标。让你的第一个智能体用例划定范围，按实际需要生长领域模型和能力清单，而不是按你能想象到的去建。一个窄而正确的上下文层，胜过一个大而无当、半推半就的上下文层。

- 1. Find your conflicting metric definitions. Most organizations have several definitions for their most important metrics, revenue being the classic, with its gross vs net, with or without returns variations. Those conflicts are your biggest agent risk and your quickest win.

- 1. 找出互相冲突的指标定义。大多数组织对其最重要的指标存在多种定义——营收就是典型，有毛额与净额之分、是否含退货之别。这些冲突是你最大的智能体风险，也是你见效最快的切入点。

- 2. Pick a tool, but focus on the discipline. Any mainstream semantic layer tool will do; what matters is the discipline behind it, metric definitions in version control, one agreed definition per metric, and agents querying through the layer, not the raw schema.

- 2. 选一个工具，但重心放在纪律上。任何主流语义层工具都可以；重要的是背后的纪律：指标定义进版本控制、每个指标一个公认定义、智能体经由这一层查询而不是直接查原始 schema。

- 3. Route agents through the context layer, never the raw schema. The agent should see governed metrics and dimensions, not raw tables and joins. MCP is the common way to expose the layer today, and dbt, Cube, and AtScale all ship MCP servers, but the principle holds however you connect, the point is the abstraction, not the protocol.

- 3. 让智能体经由上下文层路由，绝不直接碰原始 schema。智能体应该看到的是受治理的指标和维度，而不是原始表和 join。MCP 是如今暴露这一层的常见方式，dbt、Cube 和 AtScale 都自带 MCP 服务器；但无论用什么方式连接，原则都不变——重点在抽象，不在协议。

- 4. Test adversarially. The best way to find gaps is adversarial testing, every hallucination points to a missing definition. Fix the definition, not the prompt. And don't boil the ocean, start with the metrics your first agent use case needs.

- 4. 对抗性测试。发现缺口的最好方式是对抗性测试——每一次幻觉都指向一个缺失的定义。修定义，而不是修提示词。别想把大海烧开，从第一个智能体用例所需的指标开始。

### 遍历领域模型：知识图谱

The semantic model shines for structured metric queries such as “what was revenue by region.” But some agent tasks demand richer relationship reasoning across entities, events, and time. Consider a customer who bought Product X, then churned after a pricing change. A fixed number of hops like that is an ordinary join. What flat tables handle badly is traversal whose depth you don't know when you write the query, following a chain of relationships until you find what you are looking for. That is the domain model's territory, the entities and how they connect.

语义模型在结构化的指标查询上表现出色，比如「各区域营收是多少」。但有些智能体任务需要跨实体、事件和时间的更丰富的关系推理。设想一位客户购买了产品 X，在一次价格调整后流失了。这样固定跳数的路径是普通的 join 就能解决的。扁平表处理不好的，是那种你在写查询时不知道深度的遍历——沿着关系链一直找，直到找到你要的东西。这正是领域模型的领地：实体以及它们如何连接。

The common way to store and traverse that map is a knowledge graph, which is a storage choice for the domain model rather than a fourth thing to build. [GraphRAG](https://github.com/microsoft/graphrag) from Microsoft uses community detection to handle abstract queries that traditional RAG can't, and [Graphiti](https://github.com/getzep/graphiti) builds temporally aware knowledge graphs for evolving facts. (Both sat at _Trial_ on the Thoughtworks Radar as of 2026.) The semantic model still defines the metrics; the graph carries the connections between customers, products, events, and decisions over time. Together they give agents something close to institutional memory, the kind of knowledge that would take a new hire months to absorb.

存储和遍历这张地图的常见方式是知识图谱——它是领域模型的一种存储选择，而不是要额外构建的第四样东西。微软的 [GraphRAG](https://github.com/microsoft/graphrag) 用社区检测处理传统 RAG 无法应对的抽象查询，[Graphiti](https://github.com/getzep/graphiti) 为不断演化的事实构建时间感知的知识图谱。（截至 2026 年，二者在 Thoughtworks 技术雷达上都处于试用环。）语义模型仍然定义指标；图谱承载客户、产品、事件与决策之间随时间的连接。二者结合，给了智能体近似组织记忆的能力——那种新员工需要数月才能吸收的知识。

Now agents have trusted data, governance, and context. But can they actually act?

现在智能体有了可信的数据、治理和上下文。但它们真的能行动吗？

## 从可搜索到可操作：智能体就绪的数据访问

Once agents understand your data and governance is in place, the question shifts to access. How do agents reach the data and act on it? The answer is more than “RAG”. It's a full spectrum, from retrieval, to real-time queries, to controlled _write-back_ actions. That whole spectrum is the capability model, the third of the three, and the write-back end is where its guardrails earn their keep.

一旦智能体理解了你的数据、治理也到位了，问题就转向访问：智能体如何触达数据并据此行动？答案不只是「RAG」。它是一个完整的光谱：从检索，到实时查询，再到受控的*写回*操作。整个光谱就是能力模型——三件套中的第三件——而写回一端正是护栏派上用场的地方。

### 你的智能体会读，但不会行动

Let's take an example. An employee reports a PO (purchase order) issue. An ideal agent would do three things, retrieve the relevant troubleshooting guide, check whether the PO payment service is down right now, and create a help desk ticket if needed.

举个例子。一名员工报告了一个 PO（采购订单）问题。理想的智能体会做三件事：检索相关的排障指南、检查 PO 支付服务当前是否宕机、必要时创建一张客服工单。

Traditional RAG, the pattern most organizations have deployed, only does step one. It searches documents and retrieves content. It can't query a live monitoring system to check service status, and it certainly can't create a ticket in ServiceNow or Jira. That gap between _searchable_ and _actionable_ is the subject of this final topic, and we will use the PO scenario to elaborate.

传统 RAG——大多数组织已经部署的模式——只能做第一步。它搜索文档并检索内容。它不能查询实时监控系统来检查服务状态，更不用说在 ServiceNow 或 Jira 里创建工单了。*可搜索*与*可操作*之间的这道鸿沟，正是最后一个主题的讨论对象，我们将用 PO 场景来展开。

### 数据访问光谱

This framing comes from Microsoft's [Cloud Adoption Framework for AI](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/), which formalizes it as RAG + MCP-Read + MCP-Write.

这个框架来自微软的 [AI 云采用框架](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/)，它将其形式化为 RAG + MCP 读 + MCP 写。

- Retrieval. RAG, vector search, document lookup. The agent finds relevant content. Most organizations live here today.

- 检索（Retrieval）：RAG、向量搜索、文档查找。智能体找到相关内容。如今大多数组织都停留在这里。

- Real-Time Query. The agent queries live systems, checks service status, reads from databases in real time.

- 实时查询（Real-Time Query）：智能体查询在线系统、检查服务状态、实时读取数据库。

- Write-Back. The most powerful and most dangerous tier. The agent creates tickets, updates records, triggers workflows.

- 写回（Write-Back）：最强大也最危险的一层。智能体创建工单、更新记录、触发工作流。

Each step up the spectrum adds capability, and risk. The PO scenario maps cleanly across all three.

光谱上每上一级，能力与风险同步增加。PO 场景正好横跨这三级：

- Retrieve the guide (Retrieval)

- 检索排障指南（检索）

- Check payment status (Real-Time Query)

- 检查支付状态（实时查询）

- Create the ticket (Write-Back)

- 创建工单（写回）

The shift to agentic AI requires all three, not just the retrieval most teams have built.

向智能体 AI 的转型需要全部三级，而不只是大多数团队已经建成的检索这一级。

MCP has quickly become the default way to wire these tiers up, and its rise has been remarkably fast. But the mechanism matters less than the demarcation. What counts is keeping retrieval, real-time reads, and write-back as separate, deliberately governed levels of access, whether you expose them through MCP or your own native APIs.

MCP 已经迅速成为连接这些层级的默认方式，它的崛起快得惊人。但机制不如划界重要。要紧的是把检索、实时读取和写回保持为相互独立、刻意治理的访问层级——无论你是通过 MCP 还是自有原生 API 来暴露它们。

### 三个原语，一个协议

Agents reach all of this through MCP, the Model Context Protocol. Its primitives sit on a risk gradient, Resources (read-only) are safe, Prompts shape behavior, and Tools change state. That gradient maps straight onto the tiers, Resources to retrieval and Tools to write-back, which is why the safe path is to expose Resources first and graduate to Tools only under governance. In the PO scenario, Resources serve the troubleshooting docs, a Prompt guides triage, and Tools run `check_service_status()` and `create_support_ticket()`.

智能体通过 MCP（模型上下文协议）触达这一切。它的原语坐在一条风险梯度上：Resources（只读）是安全的，Prompts 塑造行为，Tools 改变状态。这条梯度直接映射到各层级——Resources 对应检索，Tools 对应写回。这就是为什么安全路径是先暴露 Resources，只有在治理到位后才升级到 Tools。在 PO 场景中，Resources 提供排障文档，Prompt 指导分诊，Tools 运行 `check_service_status()` 和 `create_support_ticket()`。

### 反模式：朴素的 API 转 MCP

How you design those Tools matters as much as when you reach for them. The common, costly mistake is to take existing REST APIs and wrap them one-to-one, so every endpoint becomes a tool. The result is _tool sprawl_, 50 tools with names like `get_po_payment_status`, `create_ticket_po_payment`, `create_ticket_po_payment_network`. The agent then has to choose among 50 barely-distinguished tools with little context, and LLMs are bad at that; accuracy drops sharply as the tool count climbs. The Thoughtworks Tech Radar put [“naive API-to-MCP conversion”](https://www.thoughtworks.com/radar/techniques/naive-api-to-mcp-conversion) on _HOLD_ for exactly this reason.

如何设计这些 Tools，与何时使用它们同样重要。一个常见而代价高昂的错误是：把现有 REST API 一对一地包装起来，让每个端点都变成一个工具。结果就是*工具蔓延*——50 个工具，名字诸如 `get_po_payment_status`、`create_ticket_po_payment`、`create_ticket_po_payment_network`。于是智能体要在 50 个几乎无法区分的工具中做出选择，而上下文信息寥寥——LLM 很不擅长这件事，工具数量攀升时准确率会急剧下降。Thoughtworks 技术雷达正因如此把[「朴素的 API 转 MCP」](https://www.thoughtworks.com/radar/techniques/naive-api-to-mcp-conversion)列为暂缓（HOLD）。

The better approach exposes the same functionality as a handful of well-designed capabilities with rich descriptions and parameterized inputs. `check_service_status` takes a service name and location, one tool for all services and all locations. `create_support_ticket` is parameterized with category, priority, and description. The descriptions are detailed enough for the LLM to know when to reach for each one.

更好的做法是把同样的功能暴露为少数几个精心设计的能力，配以丰富的描述和参数化的输入。`check_service_status` 接收服务名和位置——一个工具覆盖所有服务和所有位置。`create_support_ticket` 以类别、优先级和描述为参数。描述要详细到让 LLM 知道何时该用哪一个。

> Five to ten well described business capabilities will outperform 50 thin API wrappers almost every time

> 五到十个描述良好的业务能力，几乎每次都能胜过 50 个单薄的 API 包装器

The principle is to _design capabilities, not endpoints._ Five to ten well described business capabilities will outperform 50 thin API wrappers almost every time. And this principle is protocol-agnostic, whether an agent reaches your data through MCP, through another agent, or through whatever standard comes next, the properties that make it agent-ready are the same, rich descriptions, parameterized access, clear schemas.

原则是*设计能力，而非端点*。五到十个描述良好的业务能力，几乎每次都能胜过 50 个单薄的 API 包装器。而且这个原则与协议无关——无论智能体是通过 MCP、通过另一个智能体、还是通过未来出现的任何标准触达你的数据，让数据「智能体就绪」的那些性质都是一样的：丰富的描述、参数化的访问、清晰的 schema。

### 能力声明了什么

A rich description tells the agent when to reach for a capability. It says nothing about whether the agent is allowed to, or what happens if it is wrong. That is the rest of the declaration. Every capability carries **permissions**, who may invoke it and acting as whom, and an **owner**, the person accountable when it misbehaves. The ones that act carry two more.

丰富的描述告诉智能体何时使用某个能力。它没有说明智能体是否被允许使用，或者用错了会怎样。这些是声明的其余部分。每个能力都携带**权限**（谁可以调用、以谁的身份）和一个**所有者**（行为不端时问责的人）。会实际执行的能力还额外携带两样。

**Preconditions** are the conditions that must hold before the action may proceed, checked against live state at the moment of acting rather than against whatever the agent read earlier in its plan. A refund needs an original payment, not yet refunded, within the amount the invoking user may authorise.

**前置条件**是行动执行前必须满足的条件，在执行的那一刻对照实时状态校验，而不是对照智能体早前在计划中读到的东西。退款需要存在一笔原始支付、尚未退款、且金额在调用用户可授权的范围之内。

**Reversibility** is the class of damage the action can do: cleanly reversible, reversible at a cost through some compensating transaction, or irreversible. This is the more useful predictor of safe autonomy than the money involved. A $50,000 internal ledger correction you can back out is a safer thing to automate than a $200 payment to an external account you cannot claw back. Where the staged autonomy ladder earlier keys its guardrails to transaction size, prefer keying them to reversibility, and let irreversible actions require human approval whatever stage the agent has reached.

**可逆性**是行动所能造成的损害类别：干净可逆、通过补偿交易付出一定代价后可逆、或不可逆。这是比金额更有用的安全自主性预测指标。一笔 5 万美元的、可以撤回的内部账本修正，比一笔 200 美元的、无法追回的外部账户付款更适合自动化。前面分阶段自主的阶梯把护栏挂在交易金额上——更推荐把它们挂在可逆性上，并让不可逆的行动无论智能体处于哪个阶段都需要人工批准。

> Reversibility predicts safe autonomy better than the size of the transaction

> 可逆性比交易金额更能预测安全的自主性

Which raises the question of where the rules in those preconditions come from, because most of them are written down in prose somewhere, in a refund policy, a contract, a compliance manual.

这就引出一个问题：那些前置条件里的规则从何而来？因为大多数规则都写在某处散文里——退款政策、合同、合规手册。

### 检索文本只提供信息，从不把关

Business documents remain where the business writes its rules down. But a rule that gates an action must not be read and interpreted at the moment of acting. Rules are extracted from those documents ahead of time, curated by a human, and stored as declared preconditions in the capability model, each with a link back to the passage it came from.

业务文档仍然是业务书写规则的地方。但一条为行动把关的规则，绝不能在行动的那一刻才被读取和解读。规则要提前从那些文档中提取出来，由人工策展，作为声明式的前置条件存入能力模型，每条都带一个指回其出处的链接。

At action time the agent may still read unstructured content, a complaint ticket, a contract clause, to work out what to propose. Only the declared rules decide what is permitted, and they are checked deterministically against live state. The boundary is between _informing_ and _gating_. Retrieved text can shape what the agent suggests and serve as evidence for a human approver, but it never carries the authority to authorise the action itself.

在行动时刻，智能体仍可以读取非结构化内容——投诉工单、合同条款——来琢磨该提出什么。但只有声明式规则才能决定什么被允许，且它们以确定性的方式对照实时状态校验。边界在*提供信息*与*把关*之间。检索文本可以塑造智能体的建议、可以作为人类审批者的证据，但它永远不携带授权行动本身的权力。

That boundary is also a security property. Removing retrieved text from the authorisation path means a poisoned document cannot grant an agent a permission it did not already have, which is a stronger claim than merely shrinking what a hijacked agent can reach. It is not a complete defence, because injected text can still influence what the agent proposes, and a human approver shown fabricated evidence may wave it through. What it removes is the path where the document authorises the action directly, with nobody in between.

这道边界同时也是一项安全属性。把检索文本从授权路径中移除，意味着被投毒的文档无法授予智能体它本来没有的权限——这比仅仅缩小被劫持智能体的可及范围更强。这不是完整的防御：注入的文本仍能影响智能体的提议，而看到伪造证据的人类审批者也可能挥手放行。它移除的是那条「文档直接授权行动、中间没有任何人」的路径。

The provenance link is what keeps the declarations honest as the documents move underneath them. Be careful what you promise here. Detecting that a document changed is easy; knowing that the change invalidated a precondition derived from it is a judgement, not a diff. What the link buys you is a review queue, the derived rules flagged for a human to re-check when their source moves, in the same spirit as keying a freshness SLA to when the index was last rebuilt rather than to when the content last appeared to change.

来源链接让声明在底层文档变动时保持诚实。这里要小心你能承诺什么。检测文档变化很容易；判断这个变化是否使某个从它派生的前置条件失效，则是一个判断，而不是一次 diff。链接带来的是一支复审队列：当规则的来源变动时，派生出的规则被标记出来，交由人工重新核查——这与把新鲜度 SLA 挂到「索引最后一次重建的时间」而不是「内容最后一次看似变化的时间」是同一个精神。

Where no declaration covers the situation, the agent does not improvise from its own reading of policy. It escalates. This is the hard gate from earlier in a different setting, the same instinct that says any contract or SLA breach forces a human rather than a lower score. An undeclared case degrades the agent to supervised, not to autonomous.

当没有任何声明覆盖当前情形时，智能体不会凭自己对政策的理解临场发挥——它会升级上报。这是前面那道硬性关卡在另一个场景下的翻版，与「任何契约或 SLA 违约都强制转交人类，而不是给个低分」是同一个本能。未声明的场景把智能体降级为受监督模式，而不是自主模式。

Extraction and curation is a pipeline like any other, and it needs an owner, a cadence, and somebody who clears the review queue. Which is the subject of a later section, because none of this maintains itself.

提取与策展和其他任何管道一样，需要所有者、节奏，以及清理复审队列的人。这是后面章节的主题——因为这一切都不会自我维护。

### 端到端：PO 支付场景

With all three tiers in place, the PO issue we opened the section with runs end to end, the agent retrieves the troubleshooting guide (a read-only Resource), checks the live payment status (a Tool that reads), and files a ticket (a Tool that writes), all in a single workflow.

三级全部就位后，本节开头那个 PO 问题就能端到端跑通：智能体检索排障指南（只读 Resource）、检查实时支付状态（读取型 Tool）、创建工单（写入型 Tool），全部在一个工作流中完成。

> Figure 4: One agent, three tiers: retrieval, real-time query, then write-back, combined into a single response.

> 图 4：一个智能体，三个层级：检索、实时查询、然后是写回，合并为一次响应。

Done manually, the employee would wait in a queue, explain the issue, have a support agent check the monitoring dashboard, and get a ticket created. The agent is now able to do all this in one pass.

人工处理时，员工要在队列里等待、解释问题、让客服去查监控仪表盘，最后才能创建工单。如今智能体一次就能完成所有这些。

### 从哪里开始

The safe way in is to climb the tiers, not leap to write-back. Most teams already live in retrieval, the read-only tier where risk is lowest. Write-back is where the real danger sits. So earn your way up. Map what each use case needs, expose read-only access first, and add write-back last, only once you can log every action. Don't let the thrill of an agent that can act rush you past the steps that make acting safe.

安全的方式是逐级爬升，而不是直接跳到写回。大多数团队已经生活在检索层——风险最低的只读层。真正的危险在写回。所以一级一级挣上去：摸清每个用例需要什么，先暴露只读访问，最后再加写回——而且要在能够记录每一次行动之后。别让「智能体能行动」的兴奋推着你跳过那些让行动变安全的步骤。

- 1. Map your data access tiers. Take your top three agent use cases and classify what each needs, retrieval, real-time query, or write-back. Most gaps live in real-time query and write-back.

- 1. 摸清你的数据访问层级。拿出前三个智能体用例，给每个用例归类：检索、实时查询还是写回。大多数缺口在实时查询和写回。

- 2. Design capabilities, not endpoints. Group existing APIs into 5–10 well-described business capabilities. Rich descriptions matter, they're what the LLM uses to decide which tool to call.

- 2. 设计能力，而非端点。把现有 API 归并为 5–10 个描述良好的业务能力。丰富的描述很重要——LLM 正是靠它来决定调用哪个工具。

- 3. Start with MCP Resources. Read-only access is the lowest risk entry point. Expose knowledge bases, config data, and documentation as Resources. Graduate to Tools only once governance is in place.

- 3. 从 MCP Resources 开始。只读访问是风险最低的入口。把知识库、配置数据和文档以 Resources 形式暴露。治理到位后才升级到 Tools。

- 4. Instrument from day one. Before deploying any agent with write access, log every tool invocation, who triggered it, what was called, when, and critically, on whose behalf. This feeds the audit trail from the Traceability and Governance section.

- 4. 第一天就埋点。在部署任何带写权限的智能体之前，记录每一次工具调用：谁触发的、调用了什么、什么时间，以及关键的是——以谁的名义。这为「可追溯性与治理」章节的审计追踪提供养料。

## AI 就绪的数据栈

We've now walked through all four topics, contracts that make data trusted, a context layer that makes it meaningful and actionable, access patterns that let agents act on it, and observability that makes those actions auditable. Treated separately, they look like four work streams you could staff independently. But they aren't independent. They build on one another, and the order in which they're built matters.

四个主题我们都走了一遍：让数据可信的契约、让数据有意义且可操作的上下文层、让智能体据此行动的访问模式、让这些行动可审计的可观测性。分开看，它们像四条可以独立配人的工作流。但它们并不独立。它们层层相叠，构建顺序至关重要。

> Figure 5: The AI-ready data stack: three dependent layers built bottom-up, with observability cutting across all of them from day one.

> 图 5：AI 就绪数据栈：三个自底向上构建的依赖层，可观测性从第一天起贯穿所有层。

The dependencies run bottom-up. You can't attach meaning to data you can't trust, so context sits on the foundation. You can't safely let agents act without that meaning to constrain them, so access sits on context. Skip either of those and everything above it collapses. That's exactly why so many agentic AI programs stall. They jump straight to agent access without building the foundation underneath. Observability is different. Rather than a fourth tier stacked on top, it runs alongside all three. Every layer has to be traceable and auditable from the moment it handles real work. The trust checks, the semantic queries, the agent's actions, all of it has to be explainable in production, not whenever you get around to instrumenting it. It is also much harder to retrofit onto a running system than to build in from the start. Either way, you wire it in from day one.

依赖自底向上运行。你不能给不信任的数据附加意义，所以上下文层坐在基础层之上。没有意义的约束，你就不能安全地让智能体行动，所以访问层坐在上下文层之上。跳过其中任何一层，其上的一切都会坍塌。这正是那么多智能体 AI 项目停滞不前的原因——它们跳过地基，直接扑向智能体访问。可观测性与众不同。它不是堆在最顶上的第四层，而是与所有三层并行运行。每一层从处理真实工作的那一刻起就必须可追踪、可审计。信任检查、语义查询、智能体的行动——所有这些都必须在生产环境里可解释，而不是等到你有空埋点的时候。而且给运行中的系统补装，远比一开始就内置困难得多。所以无论如何，从第一天就接好它。

## 谁拥有这一切？

The stack has one more dependency the diagram can't draw. Every layer in it produces an artifact that has to be kept true, a data contract, a metric definition, an access scope, an observability trace. Artifacts don't maintain themselves. A contract with no owner drifts out of sync with the source it describes. A definition of “revenue” with no owner forks back into the three conflicting versions you just consolidated. An access scope with no owner quietly widens until it's a standing service account again. The technology is necessary, but it's the operating model that keeps it honest.

这个栈还有一个图表画不出来的依赖。栈里的每一层都会产出必须保持为真的工件：数据契约、指标定义、访问范围、可观测性追踪。工件不会自我维护。没有所有者的契约会与它所描述的来源渐行渐远。没有所有者的「revenue」定义会重新分裂成你刚整合完的那三个冲突版本。没有所有者的访问范围会悄悄扩张，直到又变回一个常驻服务账户。技术是必要的，但让这一切保持诚实的是运营模式。

The discipline that makes this work is treating [data as a product](https://martinfowler.com/articles/data-mesh-principles.html#DataAsAProduct). Each dataset, contract, and metric has a named owner, a published contract and SLA, and a versioned lifecycle, the same way an API does. You won't always know every consumer, and for public or broadly shared data you can't, which is precisely why the contract matters, it's the stable promise unknown consumers build on, and a deprecation policy is how you change it without breaking them. When the `product_pricing` contract blocks a deployment at 2 a.m., someone is accountable for it. When finance and sales disagree on “revenue,” someone owns the decision. When a new agent asks for access, someone owns the scope and reviews it. These aren't infrastructure questions; they're ownership questions, and no tool answers them for you.

让这一切运转的纪律，是[把数据当作产品](https://martinfowler.com/articles/data-mesh-principles.html#DataAsAProduct)来对待。每个数据集、契约和指标都有署名的所有者、发布的契约和 SLA，以及版本化的生命周期——与 API 完全一样。你不可能总是知道每一个消费者，对于公开或广泛共享的数据你根本无法知道——这正是契约之所以重要的原因：它是未知消费者赖以构建的稳定承诺，而弃用策略就是你在不破坏他们的前提下变更它的方式。当 `product_pricing` 契约在凌晨两点阻断一次部署时，有人要为此负责。当财务和销售对「revenue」意见相左时，有人拥有这个决定。当一个新智能体申请访问时，有人拥有这个范围并审查它。这些不是基础设施问题，而是所有权问题——没有工具能替你回答。

A human consumer of an unowned, drifting dataset notices and works around it. An agent consumes it at machine speed and scale, and propagates the error just as fast. The faster and more autonomous your consumers, the less you can afford data without an owner.

人类消费者碰到一个没有所有者、日渐漂移的数据集，会察觉并绕开它。智能体则以机器的速度和规模消费它，并以同样快的速度传播错误。你的消费者越快、越自主，你就越负担不起没有所有者的数据。

## 你站在哪里？

Before deciding what to build, it helps to locate yourself. Score each attribute against the signals below, all drawn from the topics above.

在决定构建什么之前，先给自己定位。对照下面的信号给每个属性打分，这些信号全部来自上文讨论的主题。

| 属性     | 人类时代                                                | 过渡期                                                        | 智能体就绪                                                                                                        |
| -------- | ------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 可信     | 松散 schema、无新鲜度 SLA；质量依赖分析师察觉数字不对劲 | 少数关键数据集有契约；质量有检查但未在 CI/CD 中强制执行       | 契约以代码强制执行、按消费者定制新鲜度 SLA、智能体存储前先隔离、智能体只读金层（表和嵌入向量皆然）                |
| 有上下文 | 指标定义活在 BI 工具、SQL 和人的脑子里；人类提供上下文  | 部分指标定义为代码，但定义仍冲突，智能体可能仍直连原始 schema | 上下文层进 Git：领域模型管实体与关系、每个指标一个语义定义、精心策划的能力清单；智能体经此路由，绝不碰原始 schema |
| 可追溯   | 日志显示某人何时查了什么；「为什么」活在分析师脑子里    | 部分智能体工作流有追踪；推理捕获不一致                        | 每个智能体工作流都发出带 span、推理与来源的 trace；任何决策的「为什么」可重建                                     |
| 受治理   | 人通过自己的角色访问数据；系统共享宽泛的服务账户        | 智能体使用有范围但长期有效的粗粒度凭证                        | 按用户委托访问、即时凭证、最小权限；致命三要素路径封死                                                            |
| 可操作   | 没有智能体作用于数据；人读仪表盘并手动行动              | 智能体通过 RAG 检索；实时读取涌现；写回处于实验或不受控状态   | 全部三个层级经精心设计的能力实现；写回受分阶段自主与埋点把关                                                      |

> 原文对照：Trusted — Human-era: Loose schemas, no freshness SLAs; quality rests on an analyst noticing when a number looks off. In Transition: Contracts on a few critical datasets; quality checked but not enforced in CI/CD. Agent-ready: Contracts enforced as code, freshness SLAs per consumer, quarantine before agent storage, agents read Gold only (tables and embeddings). Contextual — Human-era: Metric definitions live in BI tools, SQL, and people's heads; humans supply the context. In Transition: Some metrics defined as code, but definitions still conflict and agents may still hit the raw schema. Agent-ready: A context layer in Git: entities and relationships in a domain model, one semantic definition per metric, and a curated set of capabilities; agents route through it, never the raw schema. Traceable — Human-era: Logs show what a person queried and when; the why lives in the analyst's head. In Transition: Traces on some agent workflows; reasoning captured inconsistently. Agent-ready: Every agent workflow emits traces with spans, reasoning, and sources; any decision's "why" is reconstructable. Governed — Human-era: People access data through their own roles; systems share broad service accounts. In Transition: Agents run on scoped but long-lived, coarse credentials. Agent-ready: Delegated per-user access, just-in-time credentials, least privilege; lethal-trifecta paths closed. Operational — Human-era: No agent acts on the data; people read dashboards and take actions by hand. In Transition: Agents retrieve via RAG; real-time reads emerging; write-back experimental or ungoverned. Agent-ready: All three tiers via well-designed capabilities; write-back gated by staged autonomy and instrumentation.

Don't average the rows, because the stack is dependency ordered, your readiness is capped by your weakest foundational layer, a flawless context layer sitting on untrusted data is still not agent ready. Find your weakest row, and that's where the next investment goes.

不要把各行取平均——因为这个栈是依赖排序的，你的就绪度受制于最薄弱的基础层：一个完美无瑕的上下文层如果坐在不可信的数据之上，依然不是智能体就绪。找出你最薄弱的那一行，那里就是下一笔投资该去的地方。

## 四件起步要做的事

Each topic came with its own starting points. Treat those as tactical checklists for the work itself. The four below are where to start. The first, instrumenting from day one, isn't a build-order step. It runs alongside everything else, which is why it comes first and never stops. The other three build from the bottom of the stack up, because you're only as ready as your weakest foundational layer. The highest-leverage single move among them is the context layer, since context moves accuracy further than a bigger model does, but it only pays off once the data beneath it can be trusted. Build up to it.

每个主题都自带起步清单。把这些当作工作本身的战术检查表。下面四件是从哪里开始。第一件——第一天就埋点——不是构建顺序中的一个步骤，它与一切并行运行，所以它排第一，且永不停止。另外三件自栈底向上构建，因为你的就绪度只等同于最薄弱的基础层。其中杠杆效应最高的单步动作是上下文层——上下文对准确率的提升比换更大的模型还大——但只有当它下面的数据可信之后，它才能兑现。逐步搭上去。

- Instrument from day one. This isn't a step in the sequence so much as a constant that runs under all of them. Put traces and spans in every workflow from the start, because observability is far harder to retrofit than to build in, and you'll want audit trails that answer “why” for debugging today and regulators tomorrow.

- 第一天就埋点。这不是序列中的一步，而是贯穿所有步骤的常量。从第一天起就在每个工作流里放入 trace 和 span——因为可观测性事后补装远比内置困难——你会想要一条能回答「为什么」的审计追踪：今天用于调试，明天应对监管者。

- Contract everything. Freshness SLAs, strict schema enforcement, quarantine for bad data. This is the floor the rest stands on, agents can't smell bad data, so the data architecture has to smell it for them.

- 为一切建立契约。新鲜度 SLA、严格的 schema 执行、坏数据隔离。这是其余一切立足的地板——智能体闻不出坏数据，所以数据架构必须替它们闻。

- Context over models. Once the data can be trusted, a context layer is the highest-return thing you can build on top of it. Its semantic model alone carries the point: in [AtScale's text-to-SQL benchmark](https://atscale.com/blog/public-leaderboard-text-to-sql-tasks/), accuracy jumped from under 20% on the raw schema to over 92.5% with a semantic layer, on the _same model_.

- 上下文优先于模型。数据可信之后，上下文层是你在其上能构建的回报最高的东西。仅语义模型一项就足以说明：在 [AtScale 的 text-to-SQL 基准测试](https://atscale.com/blog/public-leaderboard-text-to-sql-tasks/)中，_同一个模型_，在原始 schema 上的准确率不到 20%，加了语义层后跃升到 92.5% 以上。

- Read before write. Start with MCP Resources (read-only) and graduate to Tools (write) only with governance in place. Earn autonomy in stages, shadow mode, then supervised, then autonomous with guardrails.

- 先读后写。从 MCP Resources（只读）开始，治理到位后才升级到 Tools（写入）。分阶段赢得自主权：影子模式，然后是受监督，再然后是带护栏的自主。

When agents become the primary consumers of your data, your data architecture _becomes_ your AI architecture.

当智能体成为你数据的主要消费者时，你的数据架构*就变成了*你的 AI 架构。

We go much deeper on all of this, and on the broader operational and analytical data architecture decisions around it, in our forthcoming O'Reilly book, [Data Architecture for Software Architects](https://www.oreilly.com/library/view/data-architecture-for/9781098181185/).

关于这一切，以及围绕它的更广泛的操作型与分析型数据架构决策，我们在即将出版的 O'Reilly 新书 [Data Architecture for Software Architects](https://www.oreilly.com/library/view/data-architecture-for/9781098181185/) 中有更深入的阐述。

## 侧栏：语义层的各种叫法

None of this vocabulary is settled, and the words trip people up. The classic semantic layer (Business Objects, then LookML and Cube) bundled entities and relationships in with the metrics, so plenty of people still use “semantic layer” for the whole thing. We draw sharper lines because agents make the distinctions matter. We also say “model” rather than “layer” for the parts, because each is a body of definitions rather than a tier of infrastructure, and because that is what the tools call them: dbt declares `semantic_models`, and the vendor-neutral specification that came out of the Open Semantic Interchange initiative, now Apache Ossie, is a semantic model specification.

这套词汇远未定型，措辞常常绊倒人。经典的语义层（Business Objects，后来的 LookML 和 Cube）把实体、关系和指标打包在一起，所以很多人至今仍用「语义层」指代整个东西。我们划出更清晰的界线，因为智能体让这些区分变得重要。对各部分我们更愿意说「模型」而非「层」——因为每一部分都是一组定义，而不是一层基础设施，也因为工具们就是这么叫的：dbt 声明的是 `semantic_models`；出自 Open Semantic Interchange 倡议、如今名为 Apache Ossie 的厂商中立规范，正是一份语义模型规范。

The domain model goes by other names. Store its entities and relationships as a graph and you have a knowledge graph. Domain-driven design calls it a domain model, and its Bounded Context is the reminder that no single model covers the whole enterprise. Chasing one canonical model is usually a mirage; each domain has its own, governed the federated way Data Mesh describes.

领域模型另有别名。把它的实体和关系存成图，你就有了知识图谱。领域驱动设计称之为领域模型，其「限界上下文（Bounded Context）」提醒我们：没有任何单一模型能覆盖整个企业。追逐唯一的规范模型通常是海市蜃楼；每个领域都有自己的模型，以 Data Mesh 所描述的联邦方式治理。

The market name is ontology, and it is the same artefact. It has a longer pedigree than the current wave suggests: a formal, explicit specification of a shared conceptualization, with RDF, OWL, and SHACL as the formal machinery. Strictly, an ontology describes and does not act. Two shipping products stretch it further. Palantir's Foundry Ontology pairs its objects, properties, and links with the actions an agent may take on them, and Databricks' Genie Ontology puts a living graph of a company's concepts on top of its governed metric definitions. The one real difference between Palantir's shape and ours is that it bundles the actions in. We keep them separate, because the write path carries different risk from the read path and benefits from being governed on its own terms.

市场上的叫法是本体（ontology），它是同一件东西。它的渊源比当前这波浪潮暗示的更久远：一份共享概念化的正式、显式规范，其形式化工具是 RDF、OWL 和 SHACL。严格来说，本体只描述、不行动。两个已出货的产品把它延伸得更远：Palantir 的 Foundry Ontology 把对象、属性和链接与智能体可对它们采取的行动配对；Databricks 的 Genie Ontology 在公司受治理的指标定义之上放了一张活的公司概念图。Palantir 的形态与我们唯一的实质区别在于它把行动打包了进去。我们把它们分开，因为写路径与读路径的风险不同，各自独立治理更有益。

You mostly don't write any of this from scratch. The strongest implementations bootstrap from what you already have, table structures, glossaries, and how people actually query, and let humans curate on top, rather than asking anyone to write the whole thing by hand.

这些东西大多不需要你从零写起。最强的实现都是从你已有的资产起步——表结构、术语表、人们实际的查询方式——再由人工在其上策展，而不是要求任何人手写整套东西。

## 致谢

Thanks to Martin Fowler for encouraging to write about this topic based on a series of talks we gave at multiple conferences, we would also like to thank Rebecca Parsons, Kevin Hartman, Paul Hammant, Arun Srinivasan, Swapnil Phulse, Brian Smith, Ramanathan Santhanam, Cameron Casher and Mark Taylor for giving us a through review and actionable comments to improve the article.

感谢 Martin Fowler 鼓励我们基于在多场会议上的系列演讲撰写这个主题；也感谢 Rebecca Parsons、Kevin Hartman、Paul Hammant、Arun Srinivasan、Swapnil Phulse、Brian Smith、Ramanathan Santhanam、Cameron Casher 和 Mark Taylor 给予的全面评审与可执行的改进意见。

Like most things in the industry, we used AI assistance to help research, organize, and format some parts of our writing.

与业界大多数作品一样，我们在研究、组织和格式化部分内容时使用了 AI 辅助。

> Significant Revisions _27 August 2026:_ published

> 重要修订 _2026 年 8 月 27 日：_ 首发
