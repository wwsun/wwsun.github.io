---
title: 如何用 AI 先理解遗留代码库、再动手改动
description: 一套用 AI 做「代码库考古」的方法论——在重构/迁移之前，先用 AI 摸清仓库结构、入口点、依赖、业务规则、副作用与隐式契约，把「未知」也显式记录下来
tags:
  - clippings
  - ai-engineering
  - legacy-code
  - refactoring
  - software-architecture
source: https://www.freecodecamp.org/news/understand-a-legacy-codebase-with-ai/
created: 2026-08-27
author: freeCodeCamp
---

## 如何用 AI 先理解遗留代码库、再动手改动

> **原文**：[How to Understand a Legacy Codebase Using AI Before Changing it](https://www.freecodecamp.org/news/understand-a-legacy-codebase-with-ai/) | 作者：freeCodeCamp | 日期：2026-08-27

## 📝 摘要

继承一个遗留代码库时，很多工程师第一反应是「改它」。但作者提出：丑陋的代码里可能藏着重要的知识——奇怪的判断可能编码了业务例外，重复计算可能是两个「看起来一样」的流程，难听的字段名可能是外部契约的一部分。文章系统地介绍如何用 AI 做「代码库考古」：在重构或迁移之前，先映射仓库结构、找到真实入口点、追踪业务能力、分离业务规则与基础设施、挖掘隐藏副作用、发现隐式契约、定位重复业务规则、构建依赖图、显式记录「未知」。核心观点是：AI 的价值不在于「生成一个看似可信的解释」，而在于减少你寻找「正确问题」所花的时间——用 AI 当调查员，而不是当改造者。

## 📋 术语表

| 英文                 | 中文        | 说明                                                               |
| -------------------- | ----------- | ------------------------------------------------------------------ |
| legacy codebase      | 遗留代码库  | 由他人编写、缺乏文档、长期演进的老旧代码系统                       |
| codebase archaeology | 代码库考古  | 在改动之前系统性地理解既有代码结构、行为与约束的过程               |
| refactoring          | 重构        | 在不改变外部行为的前提下改善代码内部结构                           |
| entry point          | 入口点      | 业务流程开始执行的位置（API、队列、定时任务、脚本等）              |
| business rule        | 业务规则    | 决定业务行为合法性与逻辑的规则，与基础设施代码相对                 |
| side effect          | 副作用      | 函数除返回值外对外部状态产生的可观察影响（写库、发消息、发邮件等） |
| implicit contract    | 隐式契约    | 未用接口声明的、外部消费者依赖的隐性约定（响应结构、事件格式等）   |
| idempotent           | 幂等        | 重复执行多次与执行一次产生相同效果的性质                           |
| dependency map       | 依赖图      | 描述模块之间依赖关系的图谱                                         |
| magic value          | 魔法值      | 代码中含义不明的硬编码数值或常量                                   |
| fan-in / fan-out     | 扇入 / 扇出 | 一个模块被依赖的广度 / 一个模块依赖他人的广度                      |

---

## 正文（双语对照）

The first thing many engineers want to do when they inherit a legacy codebase is change it. And I understand the impulse.

很多工程师继承一个遗留代码库时，想做的第一件事就是改动它。我理解这种冲动。

You open a class that's 1,500 lines long. There are database calls mixed with business rules, configuration values scattered across the repository, methods nobody wants to touch, and comments that refer to systems that disappeared years ago.

你打开一个 1500 行的类。里面数据库调用和业务规则混在一起，配置值散落在仓库各处，有些方法没人敢碰，还有注释指向那些几年前就消失了的系统。

Then an AI coding assistant offers to explain the whole thing.

然后一个 AI 编程助手主动提出要解释整件事。

So you ask:

于是你问：

```text
Refactor this class.
```

```text
重构这个类。
```

But that's usually too early.

但这通常太早了。

One of the lessons I've learned from working with legacy systems is that code can be ugly and still contain important knowledge.

我从遗留系统工作中得到的教训之一就是：代码可以很丑，却依然承载着重要的知识。

A strange condition may encode a business exception. A duplicated calculation may exist because two processes that look identical aren't actually identical. A database column with a terrible name may still be part of an external contract.

一个奇怪的判断可能编码了一个业务例外。一段重复的计算之所以存在，可能是因为两个看起来一模一样的过程其实并不相同。一个名字难听得要命的数据库字段，可能仍然是某个外部契约的一部分。

And a method nobody understands may be the only thing preventing a production incident that happened eight years ago from happening again.

而一个没人能看懂的方法，可能是唯一在阻止「八年前那起生产事故」再次发生的东西。

AI makes it much easier to read unfamiliar software, and that's valuable. But it also makes it much easier to change software before you understand it.

AI 让阅读陌生软件变得容易得多，这很有价值。但它也让「还没理解就动手改」变得容易得多。

In this tutorial, I'll show you how to use AI for something I believe should happen before refactoring or migration: codebase archaeology.

在这篇教程里，我会向你展示如何用 AI 做一件我认为应该发生在重构或迁移之前的事：代码库考古。

You'll learn how to use AI to help you:

你将学会如何用 AI 帮助你：

map a repository,

映射一个仓库，

identify entry points,

识别入口点，

trace dependencies,

追踪依赖，

separate business rules from infrastructure,

把业务规则与基础设施分离开来，

find hidden side effects,

找出隐藏的副作用，

inspect data flow,

检查数据流，

discover implicit contracts,

发现隐式契约，

detect duplicated behavior,

检测重复行为，

build a dependency map,

构建一张依赖图，

identify areas of uncertainty,

识别不确定的区域，

and turn those findings into a modernization plan.

以及把这些发现转化为一份现代化改造计划。

The examples use TypeScript, but the process works with most languages and stacks.

示例用的是 TypeScript，但这套方法适用于大多数语言和技术栈。

The goal isn't to ask AI what the code means and trust the answer. The goal is to use AI to reduce the amount of time you spend looking for the right questions.

目标不是问 AI「这段代码是什么意思」然后轻信答案。目标是用 AI 来减少你花在寻找「正确问题」上的时间。

## Prerequisites

## 前置要求

You should be comfortable with:

你应该熟悉以下内容：

reading an existing codebase

阅读现有代码库

TypeScript or a similar object-oriented language

TypeScript 或类似的面向对象语言

basic software architecture

基本的软件架构

dependency injection

依赖注入

unit and integration testing

单元测试与集成测试

using an AI coding assistant that can inspect repository files

使用一个能检查仓库文件的 AI 编程助手

You don't need a specific AI provider, as the workflow matters more than the model.

你不需要特定的 AI 服务商，因为工作流比模型更重要。

## Why Understanding Has to Come Before Refactoring

## 为什么理解必须发生在重构之前

Legacy code often creates a false sense of urgency.

遗留代码常常制造一种虚假的紧迫感。

You see something obviously coupled or duplicated and immediately want to clean it up.

你看到某个明显耦合或重复的东西，就立刻想清理它。

Consider this function:

看这个函数：

```ts
async function approveOrder(order: Order) {
  if (order.total > 10000 && !order.customer.verified) {
    throw new Error("Manual verification required")
  }

  if (order.customer.country === "AR" && order.paymentMethod === "TRANSFER") {
    order.status = "PENDING"
  } else {
    order.status = "APPROVED"
  }

  await orders.save(order)

  if (order.status === "APPROVED") {
    await billing.createInvoice(order)
  }

  await audit.log({
    action: "ORDER_APPROVAL",
    orderId: order.id,
    status: order.status,
  })

  return order
}
```

At first glance, there are several clear refactoring opportunities:

乍一看，这里有几个明显的重构机会：

You could extract validation.

你可以抽出校验逻辑。

You could isolate status calculation.

你可以隔离状态计算。

You could move billing behind an interface.

你可以把账单逻辑挪到接口后面。

You could create an approval policy.

你可以创建一个审批策略。

All of those ideas may be reasonable, but there are questions you should answer first:

这些想法可能都合理，但在此之前，有一些问题你应该先回答：

Why is `10000` important?

为什么 `10000` 很重要？

Why does an Argentine bank transfer remain pending?

为什么阿根廷的银行转账会保持「待处理」状态？

Does invoice creation have to happen after persistence?

发票创建必须在持久化之后发生吗？

Is `ORDER_APPROVAL` consumed by another system?

`ORDER_APPROVAL` 会被另一个系统消费吗？

Can orders transition from `PENDING` to `APPROVED` somewhere else?

订单能在别处从 `PENDING` 转变为 `APPROVED` 吗？

Does anything depend on the exact exception message?

有没有什么东西依赖于那个精确的异常消息文本？

You can't answer those questions from syntax alone.

仅凭语法，你无法回答这些问题。

That's where understanding begins.

理解，就从这里开始。

Instead of asking your AI tool:

与其这样问你的 AI 工具：

```text
Refactor this function using clean architecture.
```

```text
用整洁架构重构这个函数。
```

start with:

不如这样开始：

```text
Analyze this function without changing it.

Identify:

1. explicit business rules,
2. likely business rules that need confirmation,
3. side effects,
4. external dependencies,
5. state transitions,
6. magic values,
7. assumptions that cannot be proven from this file alone.

Do not propose a refactor yet.
```

```text
分析这个函数，但不要改动它。

识别：

1. 显式的业务规则，
2. 需要确认的、可能的业务规则，
3. 副作用，
4. 外部依赖，
5. 状态转换，
6. 魔法值，
7. 仅凭这个文件无法证明的假设。

先不要提出重构方案。
```

That last line is important: Do not propose a refactor yet.

最后一行很重要：先不要提出重构方案。

You want the model in investigation mode, not solution mode.

你要让模型处于「调查模式」，而不是「解决方案模式」。

## How to Start with the Repository, Not the Classes

## 如何从仓库开始，而不是从类开始

When I approach an unfamiliar legacy system, I don't start by reading every file. I start by trying to understand the shape of the application.

面对一个陌生的遗留系统时，我不会从逐个读文件开始。我会从理解应用的整体形状开始。

A repository already contains architectural clues.

一个仓库里已经藏着架构线索。

Look for directories such as:

去找这样的目录：

```text
src/
controllers/
services/
repositories/
models/
jobs/
workers/
scripts/
migrations/
config/
integrations/
tests/
```

But don't assume the directory names describe the real architecture.

但不要假设目录名就描述了真实的架构。

A directory called `services` can contain business logic, infrastructure, orchestration, and random utility functions.

一个叫 `services` 的目录里，可能装着业务逻辑、基础设施、编排，还有各种杂七杂八的工具函数。

A directory called `models` might contain database entities rather than domain models.

一个叫 `models` 的目录里，装的可能是数据库实体，而不是领域模型。

A folder called `utils` can hide half the application's business logic.

一个叫 `utils` 的文件夹，可能藏着应用一半的业务逻辑。

Use the structure as evidence, not truth.

把结构当作证据，而不是真相。

A useful first AI request is:

一个有用的第一个 AI 请求是：

```text
Inspect the repository structure.

Do not analyze individual implementation details yet.

Identify:

- application entry points,
- major modules,
- database technologies,
- external integrations,
- background processing,
- scheduled tasks,
- authentication mechanisms,
- configuration sources,
- tests,
- likely architectural boundaries.

For each conclusion, reference the files or directories
that support it.

Mark anything uncertain explicitly.
```

```text
检查仓库结构。

先不要分析具体的实现细节。

识别：

- 应用入口点，
- 主要模块，
- 数据库技术，
- 外部集成，
- 后台处理，
- 定时任务，
- 认证机制，
- 配置来源，
- 测试，
- 可能的架构边界。

每一个结论，都要引用支撑它的文件或目录。

任何不确定的内容，明确标记出来。
```

The requirement to reference files matters. Without it, AI can give you a perfectly reasonable architecture that doesn't actually exist.

「必须引用文件」这个要求很重要。没有它，AI 可能给你一个看似完全合理、却根本不存在的架构。

You want something closer to:

你想要的是更接近这样的输出：

```text
HTTP API
Evidence:
- src/server.ts
- src/routes/orders.ts
- src/routes/customers.ts

Background processing
Evidence:
- src/workers/paymentWorker.ts
- src/queues/index.ts

Scheduled jobs
Evidence:
- src/jobs/reconcileInvoices.ts
- src/cron.ts
```

```text
HTTP API
证据：
- src/server.ts
- src/routes/orders.ts
- src/routes/customers.ts

后台处理
证据：
- src/workers/paymentWorker.ts
- src/queues/index.ts

定时任务
证据：
- src/jobs/reconcileInvoices.ts
- src/cron.ts
```

Now you have a map you can verify.

现在你有了一个可以验证的地图。

## How to Find the Real Entry Points

## 如何找到真正的入口点

Web applications often have an obvious HTTP entry point. But legacy systems frequently have several more.

Web 应用通常有一个明显的 HTTP 入口点。但遗留系统往往还有好几个。

A business operation may begin from:

一个业务操作可能始于：

an API request,

一次 API 请求，

a scheduled job,

一个定时任务，

a queue consumer,

一个队列消费者，

a database trigger,

一个数据库触发器，

a CLI script,

一个 CLI 脚本，

a file import,

一次文件导入，

an email handler,

一个邮件处理器，

a webhook,

一个 webhook，

or another application calling the database directly.

或者是另一个应用直接调用数据库。

If you only analyze controllers, you may miss half the system.

如果你只分析控制器，可能会错过一半的系统。

Suppose you search for order creation and find:

假设你搜索订单创建，找到了：

```text
POST /orders
```

It would be easy to assume that all orders enter through that endpoint.

于是很容易假设所有订单都通过这个端点进入。

Then you discover:

然后你发现：

```text
jobs/importMarketplaceOrders.ts
workers/retryFailedOrders.ts
scripts/migratePendingOrders.ts
integrations/shopify/webhook.ts
```

Now the same business object has four additional entry paths.

现在，同一个业务对象有了四条额外的进入路径。

This changes how you think about refactoring.

这会改变你对重构的思考方式。

Ask AI:

这样问 AI：

```text
Find every location that can create, modify,
approve, cancel, or persist an Order.

Include:

- HTTP endpoints,
- background workers,
- scheduled jobs,
- scripts,
- imports,
- webhooks,
- direct repository calls.

Group the results by operation.

For every result, include the file path and
the relevant function or class.
```

```text
找出每一个能够创建、修改、审批、取消或持久化 Order 的位置。

包括：

- HTTP 端点，
- 后台 worker，
- 定时任务，
- 脚本，
- 导入，
- webhook，
- 直接的仓库调用。

按操作对结果分组。

每一个结果，都要包含文件路径和相关的函数或类。
```

Then verify those results with repository search.

然后用仓库搜索来验证那些结果。

For example:

例如：

```bash
rg "orders\.save|orders\.insert|createOrder|approveOrder" src
```

AI should accelerate search, not replace it.

AI 应该加速搜索，而不是取代搜索。

## How to Trace a Business Capability Through the Codebase

## 如何在代码库中追踪一个业务能力

Understanding individual files isn't enough.

只理解单个文件是不够的。

What usually matters is understanding a business capability.

通常真正重要的是理解一个业务能力。

For example:

例如：

```text
Create an order.
```

```text
创建订单。
```

That capability may travel through several layers:

这个能力可能会穿过好几层：

```text
HTTP Request
     ↓
Controller
     ↓
Application Service
     ↓
Pricing
     ↓
Inventory
     ↓
Persistence
     ↓
Payment
     ↓
Notification
```

```text
HTTP 请求
     ↓
控制器
     ↓
应用服务
     ↓
定价
     ↓
库存
     ↓
持久化
     ↓
支付
     ↓
通知
```

The code may not be organized that cleanly, and that's precisely why tracing the capability is useful.

代码可能不会组织得那么干净，而这恰恰是追踪该能力有价值的原因。

Choose one real workflow and ask:

选一个真实的工作流，然后这样问：

```text
Trace the "Create Order" capability from its entry point
until all observable side effects are complete.

For each step, show:

- file,
- function or class,
- input,
- output,
- state change,
- external call,
- error behavior.

Do not summarize multiple steps into one.
```

```text
从入口点开始追踪「创建订单」这个能力，
直到所有可观察的副作用完成为止。

每一步都要展示：

- 文件，
- 函数或类，
- 输入，
- 输出，
- 状态变化，
- 外部调用，
- 错误行为。

不要把多个步骤合并成一个。
```

You want a sequence that you can inspect.

你想要的是一个你能检查的序列。

For example:

例如：

```text
1. POST /orders
   src/routes/orders.ts

2. OrdersController.create()
   src/controllers/OrdersController.ts

3. OrderService.create()
   src/services/OrderService.ts

4. calculatePrice()
   src/services/pricing.ts

5. inventory.reserve()
   src/integrations/inventory.ts

6. ordersRepository.save()
   src/repositories/orders.ts

7. paymentQueue.publish()
   src/queues/payment.ts
```

This becomes far more useful than a generic explanation of the architecture.

这比一个泛泛的架构解释有用得多。

Now you can ask questions such as:

现在你可以问这样的问题：

Where does the transaction actually begin?

事务到底从哪里开始？

What happens if payment publishing fails?

如果支付发布失败了会怎样？

Is inventory reservation reversible?

库存预留是可逆的吗？

Can the order be saved twice?

订单会被保存两次吗？

Which steps are synchronous?

哪些步骤是同步的？

Which failures are retried?

哪些失败会被重试？

Those are modernization questions.

这些才是现代化改造该问的问题。

## How to Separate Business Rules from Infrastructure

## 如何把业务规则与基础设施分离开来

One of the most useful things you can do during codebase archaeology is identify where business behavior lives.

在代码库考古期间，你能做的最有用的事情之一，就是识别业务行为住在哪里。

Legacy applications frequently mix it with infrastructure.

遗留应用常常把它和基础设施混在一起。

Consider:

看这个：

```ts
async function saveCustomer(customer: Customer) {
  if (
    customer.type === "ENTERPRISE" &&
    customer.creditLimit < 50000
  ) {
    throw new Error("Invalid enterprise credit limit");
  }

  const connection = await mysql.getConnection();

  await connection.query(
    "INSERT INTO customers (...) VALUES (...)",
    [...]
  );

  await redis.del(`customer:${customer.id}`);

  await eventBus.publish(
    "customer.updated",
    customer
  );
}
```

There's at least one business rule:

这里至少有一条业务规则：

```text
Enterprise customers must have a credit limit >= 50000.
```

```text
企业客户必须拥有 >= 50000 的信用额度。
```

And several infrastructure concerns:

以及若干个基础设施关注点：

```text
MySQL
Redis
Event bus
```

```text
MySQL
Redis
事件总线
```

Ask AI to classify the code:

这样让 AI 给代码分类：

```text
Classify each responsibility in this function as one of:

- business rule,
- application orchestration,
- persistence,
- caching,
- messaging,
- logging,
- validation,
- unknown.

Explain why.

Do not move or rewrite any code.
```

```text
把这个函数里的每一项职责，归类为以下之一：

- 业务规则，
- 应用编排，
- 持久化，
- 缓存，
- 消息传递，
- 日志，
- 校验，
- 未知。

解释为什么。

不要移动或重写任何代码。
```

The `unknown` category is useful. You don't want the model to force every line into a clean architectural theory.

「未知」这个类别很有用。你不希望模型把每一行代码都硬塞进一套干净的架构理论里。

Some code really is ambiguous until you inspect more context.

有些代码在你检查更多上下文之前，确实就是模棱两可的。

## How to Find Hidden Side Effects

## 如何找出隐藏的副作用

Side effects are one of the biggest sources of migration risk.

副作用是迁移风险的最大来源之一。

A function called:

一个叫：

```ts
updateCustomer()
```

may do much more than update a customer.

的函数，做的事可能远不止「更新一个客户」。

It may:

它可能会：

write to the database

写数据库

invalidate cache

使缓存失效

emit an event

发出一个事件

send an email

发一封邮件

update analytics

更新分析数据

write an audit record

写一条审计记录

schedule another job

调度另一个任务

If you refactor the function and preserve only its return value, you can break production behavior without any compiler error.

如果你重构了这个函数、却只保留了它的返回值，你可以在没有任何编译错误的情况下破坏生产行为。

A useful investigation prompt is:

一个有用的调查提示词是：

```text
List every observable side effect produced directly
or indirectly by this function.

For each one, identify:

- the side effect,
- where it happens,
- whether it is synchronous or asynchronous,
- whether failure propagates,
- whether it appears retryable,
- whether it is idempotent,
- whether it can be safely repeated.

Mark uncertain answers as unknown.
```

```text
列出这个函数直接或间接产生的每一个可观察的副作用。

对每一项，识别：

- 这个副作用是什么，
- 它发生在哪里，
- 它是同步的还是异步的，
- 失败是否会传播，
- 它看起来是否可重试，
- 它是否是幂等的，
- 它是否能被安全地重复执行。

把不确定的答案标记为未知。
```

That last property, idempotency, matters a lot.

最后那个属性——幂等性——非常重要。

Suppose a worker does this:

假设一个 worker 做了这样的事：

```ts
await chargeCard(order)
await markOrderAsPaid(order)
```

If the worker crashes between those two lines and retries, what happens? You may charge the customer twice. And that's not visible from the function name.

如果 worker 在这两行之间崩溃然后重试，会发生什么？你可能会向客户扣两次款。而这从函数名上是看不出来的。

Understanding retry semantics is part of understanding the codebase.

理解重试语义，就是理解代码库的一部分。

## How to Discover Implicit Contracts

## 如何发现隐式契约

Not every contract is declared with an interface. Legacy applications contain many implicit contracts.

并不是每个契约都用接口声明过。遗留应用里藏着许多隐式契约。

For example:

例如：

```ts
return {
  status: "ok",
  value: customer.balance.toFixed(2),
}
```

Some external consumer may depend on:

某个外部消费者可能依赖：

```json
{
  "status": "ok",
  "value": "100.00"
}
```

Changing `value` from a string to a number can look like an improvement:

把 `value` 从字符串改成数字，看起来像是一种改进：

```json
{
  "status": "ok",
  "value": 100
}
```

It can also break a client.

它也可能破坏一个客户端。

Look for contracts in:

到这些地方去找契约：

API responses,

API 响应，

events,

事件，

database structures,

数据库结构，

CSV exports,

CSV 导出，

filenames,

文件名，

environment variables,

环境变量，

error messages,

错误消息，

queue payloads,

队列负载，

and webhook bodies.

以及 webhook 请求体。

Ask:

这样问：

```text
Identify outputs from this module that could be consumed
outside the module.

Include:

- HTTP responses,
- emitted events,
- queue messages,
- files,
- database records,
- exceptions,
- logs used for automated processing.

For each output, explain what evidence suggests that it
may be an external or implicit contract.
```

```text
识别这个模块中可能被模块外部消费的输出。

包括：

- HTTP 响应，
- 发出的事件，
- 队列消息，
- 文件，
- 数据库记录，
- 异常，
- 用于自动化处理的日志。

对每个输出，解释有什么证据表明它可能是一个外部的或隐式的契约。
```

The wording matters:

措辞很重要：

```text
what evidence suggests
```

```text
有什么证据表明
```

not:

而不是：

```text
tell me which contracts exist
```

```text
告诉我哪些契约存在
```

because you may not be able to prove the consumer from the current repository.

因为你可能无法从当前的仓库里证明那个消费者。

## How to Use AI to Find Duplicated Business Rules

## 如何用 AI 找出重复的业务规则

Duplicated code is easy to detect. Duplicated business meaning is harder.

重复的代码容易检测。重复的业务含义则更难。

You may find:

你可能会发现：

```ts
if (customer.type === "PREMIUM") {
  discount = total * 0.1
}
```

in one module.

在某个模块里。

And elsewhere:

而在别处：

```ts
if (account.plan === "GOLD") {
  price = price * 0.9
}
```

Those might represent the same business rule, or they might not.

这些可能代表同一条业务规则，也可能不是。

AI is useful for identifying candidates.

AI 善于找出候选。

Ask:

这样问：

```text
Search the repository for business rules related to
customer discounts.

Group implementations that appear semantically related,
even if variable names differ.

For each group:

- list file locations,
- describe the apparent rule,
- highlight differences,
- do not assume the rules should be unified.
```

```text
在仓库中搜索与客户折扣相关的业务规则。

把那些语义上看似相关的实现分组，
即使变量名不同。

对每一组：

- 列出文件位置，
- 描述这条看似存在的规则，
- 标出差异，
- 不要假设这些规则应该被统一。
```

That final instruction is important.

最后那句指令很重要。

Duplication is sometimes accidental.

重复有时是偶然的。

Sometimes it represents two domains that evolved independently.

有时它代表着两个独立演进的领域。

Don't let an AI assistant turn:

别让一个 AI 助手把：

```text
similar
```

```text
相似
```

into:

变成：

```text
must be merged
```

```text
必须合并
```

without evidence.

而没有证据。

## How to Build a Lightweight Dependency Map

## 如何构建一张轻量的依赖图

At some point, you need to understand which parts of the system depend on which others.

到了某个时候，你需要理解系统的哪些部分依赖于哪些其他部分。

You don't need a perfect enterprise architecture diagram. A lightweight dependency map is enough to start.

你不需要一张完美的企业级架构图。一张轻量的依赖图就足够开始了。

For example:

例如：

```text
Orders
 ├── Customers
 ├── Inventory
 ├── Payments
 ├── Notifications
 └── Database

Payments
 ├── Payment Provider
 ├── Audit
 └── Database
```

Ask AI to extract module-level dependencies:

这样让 AI 提取模块级依赖：

```text
Build a module dependency map from the repository.

Only include dependencies supported by imports,
constructor dependencies, explicit calls, or configuration.

Output:

Module A -> Module B

For each dependency, provide at least one source file
that demonstrates it.

Do not infer dependencies from names alone.
```

```text
从仓库构建一张模块依赖图。

只包含由导入、构造函数依赖、显式调用或配置支撑的依赖。

输出：

模块 A -> 模块 B

对每条依赖，至少提供一个能证明它的源文件。

不要仅凭名字来推断依赖。
```

You can then compare the result with automated tools.

然后你可以把这个结果与自动化工具对比。

For JavaScript or TypeScript projects, dependency analysis tools can help you find:

对于 JavaScript 或 TypeScript 项目，依赖分析工具能帮你找到：

circular dependencies

循环依赖

cross-module imports

跨模块导入

high fan-in

高扇入

high fan-out

高扇出

AI is useful for explaining why those dependencies may matter. Static analysis is better at proving that they exist.

AI 善于解释这些依赖为什么可能重要。静态分析则更善于证明它们确实存在。

Use both.

两者都用。

## How to Mark What You Still Do Not Understand

## 如何标记你仍然不理解的东西

This is one of the most important parts of the process.

这是整个过程中最重要的部分之一。

A useful system map doesn't only contain answers. It also contains uncertainty.

一张有用的系统地图，不只是包含答案，它也包含不确定性。

I like keeping an explicit list such as:

我喜欢维护一个显式的清单，比如：

```text
## Open Questions

- Why is the enterprise credit threshold 50,000?
- Is `ORDER_APPROVAL` consumed outside this repository?
- Can marketplace orders bypass inventory validation?
- Is `customer.balance` allowed to be negative?
- What process transitions PENDING orders to APPROVED?
- Is `legacy_customer_id` still used by another system?
```

```text
## 待解决问题

- 为什么企业信用阈值是 50,000？
- `ORDER_APPROVAL` 在这个仓库之外会被消费吗？
- 市场订单能绕过库存校验吗？
- `customer.balance` 允许为负数吗？
- 是哪个过程把 PENDING 订单转为 APPROVED？
- `legacy_customer_id` 还在被另一个系统使用吗？
```

You can ask AI to generate this list:

你可以让 AI 生成这个清单：

```text
Based on everything analyzed so far, list the questions
that can't be answered safely from the repository.

Focus on questions that would matter during:

- refactoring,
- migration,
- schema changes,
- interface changes,
- removal of code.

Do not answer the questions.
```

```text
基于到目前为止分析的一切，列出那些无法仅凭仓库安全回答的问题。

聚焦于在以下场景中会很重要的问题：

- 重构，
- 迁移，
- 模式（schema）变更，
- 接口变更，
- 删除代码。

不要回答这些问题。
```

I like this prompt because it does the opposite of what we normally ask AI to do. It asks the model to identify where it should not pretend to know.

我喜欢这个提示词，因为它做的是与我们通常要求 AI 相反的事。它要求模型去识别「哪些地方它不该假装自己知道」。

A modernization plan should include those unknowns.

一份现代化改造计划，应该包含这些未知。

## How to Validate AI Findings Against the System

## 如何对照系统本身来验证 AI 的发现

AI-generated explanations can sound convincing even when they're incomplete. So every important finding should have another source of evidence.

AI 生成的解释，即便不完整，听起来也可能很有说服力。所以每一个重要的发现，都应该有另一个证据来源。

I use a simple hierarchy.

我用一个简单的层级。

### Repository Search

### 仓库搜索

If AI says a function is called only once, search for it.

如果 AI 说某个函数只被调用一次，就去搜它。

```bash
rg "approveOrder" .
```

### Tests

### 测试

Tests often reveal assumptions that implementation code doesn't explain.

测试常常揭示实现代码没有说明的假设。

Look for:

去找：

```text
expected errors
special values
boundary cases
fixture data
historical behavior
```

```text
预期的错误
特殊值
边界情况
夹具数据
历史行为
```

### Database Schema

### 数据库 Schema

The schema may reveal key things like:

schema 可能揭示一些关键信息，比如：

```text
nullable fields
foreign keys
defaults
legacy columns
constraints
status values
```

```text
可空字段
外键
默认值
遗留字段
约束
状态值
```

### Logs and Observability

### 日志与可观测性

Production telemetry can tell you whether a supposedly unused path is still active.

生产遥测能告诉你，一条据说没人在用的路径是否仍在活动。

### Version History

### 版本历史

Git history can sometimes answer questions that source code can't.

Git 历史有时能回答源代码无法回答的问题。

For example:

例如：

```bash
git log -S "Manual verification required" --all
```

or:

或：

```bash
git blame src/orders/approveOrder.ts
```

The commit that introduced a strange condition may contain the explanation.

引入那个奇怪判断的提交，可能就带着解释。

This is an area where AI can help summarize history:

这是一个 AI 能帮忙总结历史的地方：

```text
Review the commits that changed this function.

Build a timeline of behavior changes.

For each change, include:

- commit,
- date,
- behavior changed,
- stated reason if available.

Do not infer a reason if the commit history does not provide one.
```

```text
审查那些改动过这个函数的提交。

构建一条行为变化的时间线。

对每次变更，包括：

- 提交，
- 日期，
- 被改变的行为，
- 如果有，写明陈述的原因。

如果提交历史没有提供原因，就不要推断。
```

That can save a surprising amount of time.

这能省下惊人的时间。

## How to Turn Codebase Understanding into a Migration Plan

## 如何把对代码库的理解转化为一份迁移计划

Once you understand one capability, you can begin making decisions. But not before.

一旦你理解了一个能力，你才能开始做决策。但不能更早。

Suppose your investigation produces this:

假设你的调查得出了这样的结果：

```text
Create Order

Business rules:
- active customer required
- premium customers receive 10% discount
- inventory must be available

Side effects:
- order persisted
- inventory reserved
- payment queued
- confirmation email sent

External contracts:
- POST /orders response
- payment queue payload
- order.created event

Unknowns:
- retry semantics for inventory reservation
- whether event consumers require exact field names
```

```text
创建订单

业务规则：
- 需要活跃客户
- 高级客户享受 10% 折扣
- 库存必须可用

副作用：
- 订单被持久化
- 库存被预留
- 支付入队
- 发送确认邮件

外部契约：
- POST /orders 响应
- 支付队列负载
- order.created 事件

未知：
- 库存预留的重试语义
- 事件消费者是否需要精确的字段名
```

Now you can decide what to protect.

现在你可以决定要保护什么了。

For example:

例如：

```text
Protect first:
- pricing behavior
- API response
- payment payload
- event schema
```

```text
优先保护：
- 定价行为
- API 响应
- 支付负载
- 事件 schema
```

Then decide what can be refactored.

然后决定什么可以重构。

```text
Candidate boundaries:
- pricing policy
- inventory gateway
- payment publisher
- notification service
```

```text
候选边界：
- 定价策略
- 库存网关
- 支付发布器
- 通知服务
```

Then decide what needs investigation.

然后决定什么需要进一步调查。

```text
Block migration until understood:
- inventory retry behavior
- event consumers
```

```text
在理解之前阻断迁移：
- 库存重试行为
- 事件消费者
```

That's already a migration plan.

这已经是一份迁移计划了。

Notice what AI did not do: it didn't decide the target architecture.

注意 AI 没有做什么：它没有替你决定目标架构。

It helped make the current architecture observable enough for you to make that decision.

它帮助你让当前架构变得足够「可观察」，从而让你自己做出那个决定。

## A Practical Codebase Archaeology Workflow

## 一个实用的代码库考古工作流

If I had to reduce this process to something repeatable, I would use these steps.

如果要把这个过程压缩成可重复的步骤，我会用下面这些。

### 1. Map the Repository

### 1. 映射仓库

Identify:

识别：

```text
entry points
modules
persistence
integrations
workers
jobs
tests
configuration
```

```text
入口点
模块
持久化
集成
worker
任务
测试
配置
```

Don't refactor anything.

什么都不要重构。

### 2. Choose One Capability

### 2. 选一个能力

Pick something concrete:

挑一个具体的：

```text
Create Order
Approve Loan
Generate Invoice
Register Customer
Cancel Subscription
```

```text
创建订单
审批贷款
生成发票
注册客户
取消订阅
```

Avoid trying to understand the whole product at once.

避免一次性去理解整个产品。

### 3. Trace It End to End

### 3. 端到端追踪它

Follow:

沿着：

```text
input
↓
business logic
↓
state changes
↓
external calls
↓
output
```

```text
输入
↓
业务逻辑
↓
状态变化
↓
外部调用
↓
输出
```

Record every file involved.

记录涉及的每一个文件。

### 4. Extract Business Rules

### 4. 提取业务规则

Separate:

区分：

```text
explicit rules
likely rules
infrastructure behavior
unknowns
```

```text
显式规则
可能的规则
基础设施行为
未知
```

### 5. Identify Side Effects

### 5. 识别副作用

Find:

找出：

```text
writes
messages
emails
jobs
cache changes
external calls
```

```text
写入
消息
邮件
任务
缓存变更
外部调用
```

### 6. Discover Contracts

### 6. 发现契约

Look for:

去找：

```text
APIs
event schemas
database assumptions
exported files
error behavior
```

```text
API
事件 schema
数据库假设
导出的文件
错误行为
```

### 7. Map Dependencies

### 7. 映射依赖

Document:

记录：

```text
module -> module
```

```text
模块 -> 模块
```

and identify coupling.

并识别耦合。

### 8. Record Unknowns

### 8. 记录未知

Don't hide uncertainty. Create an explicit list.

不要隐藏不确定性。建一个显式的清单。

### 9. Verify

### 9. 验证

Use:

使用：

```text
repository search
tests
schema
logs
Git history
production telemetry
```

```text
仓库搜索
测试
schema
日志
Git 历史
生产遥测
```

### 10. Only Then Plan the Change

### 10. 只有到这时才规划改动

Decide:

决定：

```text
what behavior must survive,
what code can disappear,
what boundaries should be introduced,
what needs tests,
and what can migrate first.
```

```text
哪些行为必须存活，
哪些代码可以消失，
应该引入哪些边界，
什么需要测试，
以及什么可以先迁移。
```

## What I Would Not Ask AI to Do First

## 我不会一开始就让 AI 做什么

There are several prompts I avoid at the beginning of a legacy modernization project.

在一个遗留系统现代化项目的开始阶段，有几类提示词我会避开。

For example:

例如：

```text
Rewrite this application using Clean Architecture.
```

```text
用整洁架构重写这个应用。
```

or:

或：

```text
Convert this monolith into microservices.
```

```text
把这个单体拆成微服务。
```

or:

或：

```text
Modernize this entire repository.
```

```text
现代化整个仓库。
```

or even:

或者甚至：

```text
Find all the bad code.
```

```text
找出所有烂代码。
```

The problem isn't that AI can't produce useful output from those prompts. It can.

问题不在于 AI 无法从这些提示词产出有用的输出。它可以。

The problem is that those questions already contain a solution.

问题在于，这些问题本身就已经内置了一个解决方案。

You're asking for:

你在要求：

```text
Clean Architecture
Microservices
Rewrite
Bad code
```

```text
整洁架构
微服务
重写
烂代码
```

before you've established what the system actually needs.

而你还根本没有确立这个系统真正需要什么。

A better sequence is:

更好的顺序是：

```text
What exists?
↓
Why does it exist?
↓
What behavior matters?
↓
What is uncertain?
↓
What should change?
```

```text
现在有什么？
↓
它为什么存在？
↓
什么行为重要？
↓
什么是未知的？
↓
应该改什么？
```

That sequence is slower for the first hour, but it's usually much faster for the rest of the project.

这个顺序在头一个小时会更慢，但在项目的其余时间里，通常快得多。

## The Most Useful AI Output Is Sometimes a Question

## 最有用的 AI 输出，有时是一个问题

There's a tendency to evaluate AI coding tools by how much code they generate.

人们倾向于用「生成了多少代码」来评估 AI 编程工具。

For legacy systems, I think that misses part of their value.

对于遗留系统，我认为这忽略了它们的一部分价值。

One of the most useful outputs can be:

最有用的输出之一可能是：

```text
I cannot determine why this condition exists from the available code.
```

```text
从现有代码中，我无法确定这个判断为什么存在。
```

Or:

或：

```text
This event appears to have no consumer in the current repository, but external consumers cannot be ruled out.
```

```text
这个事件在当前仓库里似乎没有消费者，但无法排除外部消费者。
```

Or:

或：

```text
These two discount calculations look similar, but their behavior differs for zero-value orders.
```

```text
这两处折扣计算看起来相似，但对零值订单的行为不同。
```

Those are useful findings that tell an engineer where to investigate.

这些都是有用的发现，告诉工程师该去哪里调查。

A confident but incorrect answer is much more dangerous.

一个自信但错误的答案，则危险得多。

When working with legacy systems, uncertainty is information. Treat it that way.

在处理遗留系统时，不确定性本身就是信息。请这样对待它。

## Conclusion

## 结语

AI makes unfamiliar codebases much easier to explore.

AI 让探索陌生的代码库变得容易得多。

You can use it to summarize modules, trace execution paths, extract candidate business rules, find side effects, compare implementations, analyze Git history, and build dependency maps.

你可以用它来总结模块、追踪执行路径、提取候选业务规则、找出副作用、比较实现、分析 Git 历史、构建依赖图。

That can remove a large amount of mechanical investigation work.

这能移除大量的机械性调查工作。

But understanding a system isn't the same as generating an explanation of it. Legacy applications contain context that may exist outside the source code:

但「理解一个系统」不等于「生成一个关于它的解释」。遗留应用所包含的上下文，可能存在于源代码之外：

production behavior,

生产行为，

old incidents,

历史事故，

external consumers,

外部消费者，

business exceptions,

业务例外，

undocumented integrations,

未文档化的集成，

and organizational history.

以及组织的历史。

AI can help you find evidence. It can't manufacture missing history.

AI 能帮你找到证据。它无法凭空捏造缺失的历史。

That's why I prefer to use it as an investigator before I use it as a transformer.

这就是为什么我更愿意先把它当作调查员来用，然后再当作改造者来用。

Start with:

从：

```text
What does this system actually do?
```

```text
这个系统实际上在做什么？
```

Then ask:

再问：

```text
What do I still not understand?
```

```text
我仍然不理解什么？
```

Only after that should you ask:

只有在那之后，你才应该问：

```text
What should I change?
```

```text
我应该改什么？
```

The faster AI lets you modify software, the more important that sequence becomes.

AI 让你改软件的速度越快，这个顺序就越重要。

Because changing code you understand is engineering. But changing code you don't understand is experimentation.

因为改动你理解的代码，是工程；而改动你不理解的代码，是实验。

And production is usually the most expensive place to run that experiment.

而生产环境，通常是运行这种实验最昂贵的地方。

---

> **译者注**：这篇是 freeCodeCamp 上一篇很有分量的工程方法论文章，作者是一位有 25+ 年经验的 B2B 平台技术负责人。它精准戳中了 AI 编程时代的一个普遍误区——「让 AI 直接重构」。文章反复强调的核心是：用 AI 做「调查员」而非「改造者」，尤其是第 8 步「记录未知」和第 10 步「先理解再规划」——「改动你理解的代码是工程，改动你不理解的代码是实验」。这套「代码库考古」工作流对正在用 Claude Code / Codex 处理遗留系统的工程师极具实操价值。
