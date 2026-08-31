---
title: eve — Vercel 开源的智能体框架
description: Vercel 正式发布 eve，一个内置持久化执行、沙盒计算、人工审批、多渠道支持、追踪和测评的智能体框架，让构建生产级智能体像定义文件一样简单。
tags:
  - clippings
  - agent-framework
  - eve
  - vercel
  - open-source
source: https://vercel.com/blog/introducing-eve
created: 2026-07-06
---

## eve — Vercel 开源的智能体框架

> 原文：[Introducing eve](https://vercel.com/blog/introducing-eve) 来源：Vercel Blog

今天，我们自豪地推出 [eve](https://vercel.com/eve)——一个用于构建、运行和扩展智能体的开源框架。eve 的设计核心理念是：构建一个智能体意味着定义它做什么，而不需要拼装跑在生产环境所需的所有零碎组件。相反，eve 自带生产就绪的内置能力：

- 持久化执行（Durable execution）
- 沙盒计算（Sandboxed compute）
- 人工介入审批（Human-in-the-loop approvals）
- 子智能体（Subagents）
- 测评（Evals）
- 以及更多

eve 是我们用来构建和运行自己智能体的框架。

智能体今天所处的阶段，就像 Web 在没有框架之前的时代——每个人都在手写同样的管道代码，没有任何东西能复用到下一个项目。[Next.js](https://nextjs.org/) 终结了 Web 的这一困境，eve 正在为智能体做同样的事。

## 一个智能体就是一个目录

这是一个 eve 智能体。

```
agent/
  agent.ts                   # 它运行的模型
  instructions.md            # 它是谁
  tools/
    run_sql.ts               # 它能做什么
    post_chart.ts
  skills/
    revenue-definitions.md   # 它知道什么
  subagents/
    investigator/            # 它委托给谁
  channels/
    slack.ts                 # 它在哪里
  schedules/
    monday-summary.ts        # 它何时自主行动
```

一目了然的数据分析师智能体

每个文件描述智能体的一个组件，因此只需扫一眼目录树，你就知道一个智能体是什么、做什么、在哪里运行、何时自主行动。

### 几分钟创建一个 eve 智能体

每个智能体都始于它的定义。

```typescript
// agent/agent.ts
import { defineAgent } from "eve"

export default defineAgent({
  model: "anthropic/claude-opus-4.8",
})
```

配置智能体及其模型，一个文件搞定

`agent.ts` 文件是你配置智能体本身的地方。你可以用一行代码定义模型，通过 [AI Gateway](https://vercel.com/docs/ai-gateway) 支持提供商回退（provider fallbacks），上下文压缩、模型选项和[其他可选字段](https://beta.eve.dev/docs/agent-config#other-defineagent-fields)按需使用。

给智能体赋予工作和性格就像创建一个 `instructions.md` 文件一样简单，它作为系统提示词被 eve 放在每次模型调用之前。

```markdown
<!-- agent/instructions.md -->

你是一位资深数据分析师。你回答关于团队数据的问题。

- 优先使用精确数字而非模糊描述。如果能计算，就计算出来。
- 说明你报告的每个数字背后的假设（日期范围、过滤条件、粒度）。
- 使用你可用的工具而不是猜测。如果无法从数据中回答，就明确说出来。
```

智能体的身份和常设规则，被置于每次模型调用前面

你为智能体做什么创建文件，比如 `post_chart.ts` 和 `revenue-definitions.md` 分别对应工具和技能，eve 将它们连接成一个可工作的智能体，无需任何样板代码或管道管理。你可以只专注于智能体做什么，而不是它怎么做。

## 我们为什么构建 eve

我们在 Vercel 构建智能体已经多年了，[v0](https://v0.app/) 就是其中之一。但一旦编程智能体让构建智能体变成任何人都能做到的事，每个人都在做。我们交付了数百个智能体和内部应用，看起来像是一场生产力革命。

但在表象之下，每个团队都在重复构建相同的底层管道才能让他们的智能体工作，而这些工作无法从一个用例复用到下一个。每个智能体被设计用于不同的任务，但它们都有相同的需求，相同的结构反复出现。智能体是有形状的。

eve 就是把那个形状做成了框架。每一代软件在足够多的人以艰难的方式构建了相同的东西后，就会赢得属于它的抽象，而智能体已经到了这个节点。

## 开箱即用

生产环境中智能体需要的一切都随框架一同提供。

### 每次对话一个持久化会话

智能体要等人，调用慢速系统，运行数小时、数天甚至数周。在 eve 中，每次对话都是一个持久化工作流，每一步都有检查点（checkpoint），因此会话可以暂停、在崩溃或部署后存活，并在它停止的地方精确恢复。这种持久性建立在开源的 [Workflow SDK](https://workflow-sdk.dev/) 之上。

### 每个智能体一个沙盒

你的智能体编写的代码应被视为不可信的，因此 eve 将智能体生成的代码完全隔离在你的应用运行时之外。每个智能体获得自己的沙盒——一个用于 Shell 命令、脚本和文件读写的隔离环境——在与控制智能体的 harness 分离的安全上下文中运行。沙盒的后端是一个适配器。部署时，它运行在 [Vercel Sandbox](https://vercel.com/docs/sandbox) 上。本地开发时，运行在 Docker、microsandbox 或 [just-bash](https://justbash.dev/) 上，你可以为任何其他提供商编写适配器。

### 人工介入审批

智能体在真实系统上执行操作，其中一些操作应该需要人来批准。eve 中的任何操作都可以配置为需要审批，智能体会在那里暂停并等待，如果需要可以无限期地等，不消耗任何计算资源。一旦批准，eve 会从它停下的地方继续执行任务。

### 安全连接到工具、数据和服务

智能体需要连接你的后端、数据和其他第三方服务。在 eve 中，一个连接就是一个指向 MCP 服务器或任何具有兼容 OpenAPI 文档的 API 的文件。

```typescript
// agent/connections/linear.ts
import { defineMcpClientConnection } from "eve/connections"

export default defineMcpClientConnection({
  url: "https://mcp.linear.app/sse",
  description: "Linear 工作区：工单、项目、周期和评论。",
  auth: {
    getToken: async () => ({ token: process.env.LINEAR_API_TOKEN! }),
  },
})
```

连接到一个 MCP 服务器，一个文件

eve 自动发现远程工具，将其交给模型，并代理认证过程，模型永远看不到连接的 URL 或凭证。[Vercel Connect](https://vercel.com/connect) 处理交互式 OAuth，内置同意和 Token 刷新。在发布时，eve 智能体可以连接到 Slack、GitHub、Snowflake、Salesforce、Notion 和 Linear，以及任何你能通过 OAuth、API 密钥或 MCP 服务器到达的服务。

### 相同的智能体，每个渠道

大多数智能体只存在于一个地方，因为每个新的交互界面都需要单独构建集成。在 eve 中，同一个智能体服务于所有界面，每个渠道只是一个小的适配器文件。HTTP API 默认开启，Slack、Discord、Teams、Telegram、Twilio、GitHub 和 Linear 内置可用，`defineChannel` 覆盖自定义渠道。一个渠道也可以交接给另一个，因此一个事故 webhook 可以在 Slack 中开启一个调查线程。

### 内置追踪和测评

当智能体出错时，第一个问题是智能体实际做了什么。在 eve 中，每次运行都生成一条追踪。每个模型调用和工具调用按顺序显示，包含其输入和输出，直到智能体在沙盒中运行的命令，因此你可以重放运行过程，而不是从日志中拼凑。

```
ai.eve.turn                      # 每个 turn 一个 span
├── ai.streamText                # 模型调用
│   └── ai.streamText.doStream
└── ai.toolCall                  # run_sql，包含输入和输出
```

单个 turn 产生的 OpenTelemetry span 树

这些 span 是标准 OpenTelemetry，可导出到你已经运行的任何追踪服务，无论是 Braintrust、Raindrop、Arize、Honeycomb、Datadog 还是 Jaeger。在 Vercel 上，它们显示在 Observability 下的 Agent Runs 标签页中，让你在一个地方观察每个会话并深入任何运行。测评让你更进一步，提供带评分的测试套件，可以在本地运行或接入 CI。

![会话追踪截图](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F40jc4SfFPkNOQ2aZzXmsvB%2Fee762f8bcf1e3e8d98a3330e33d1b8ca%2FCleanShot_2026-06-16_at_12.00.07_2x.png&w=1920&q=75)

精确显示智能体做了什么，一个 turn 接一个 turn

以上涵盖了框架能为你做的所有事。剩下的就是任何框架无法替你写的部分：你的智能体实际上做什么。

## 一次一个文件地扩展智能体

给智能体赋予能力最常用的方式是给它工具，并用技能教它如何做事。今天这意味着构建工具、编写技能，然后把两者都接入运行智能体循环的东西里。有了 eve，一个工具就是一个 TypeScript 文件，一个技能就是一个 Markdown 文件。

```typescript
// agent/tools/run_sql.ts
import { defineTool } from "eve/tools"
import { z } from "zod"
import { runReadOnlySql } from "../lib/sample-db"

export default defineTool({
  description: "对 orders 和 customers 表运行只读 SQL 查询。",
  inputSchema: z.object({
    sql: z.string().describe("单条只读 SELECT 语句。"),
  }),
  async execute({ sql }) {
    const { columns, rows } = await runReadOnlySql(sql)
    return { columns, rows: rows.slice(0, 500), truncated: rows.length > 500 }
  },
})
```

带类型的工具，一个文件，文件名即工具名

```markdown
<!-- agent/skills/revenue-definitions.md -->

---

description: 本团队如何定义收入。回答任何收入问题前加载。
---

收入按退款后净值确认，按订阅期分摊。
周以周一为锚点，UTC 时区。
排除试用和内部账户，不计入任何数字。
```

一个 Markdown 文件即一项技能，仅在相关话题出现时加载

注意缺少了什么。不需要编写所有样板代码来连接这些并注册到你的智能体，eve 替你处理了。

文件在树中的名称和位置就是它的定义。eve 在构建时拾取工具和技能，将它们的描述交给模型，模型从这里接手。就像 [Next.js](https://nextjs.org/) 通过拥有路由将一个文件夹变成一个路由一样，eve 通过拥有智能体循环将一个文件变成一项能力。

### 添加人工审批

要求对某个操作进行审批只是工具上的一个字段。

```typescript
// agent/tools/run_sql.ts
export default defineTool({
  description: "对数据仓库运行只读 SQL 查询。",
  inputSchema: z.object({ sql: z.string() }),
  needsApproval: ({ toolInput }) => estimateScanGb(toolInput.sql) > 50,
  async execute({ sql }) {
    // 不变
  },
})
```

当查询扫描超过 50GB 时要求审批

现在你可以守卫昂贵的查询、破坏性的写入或任何你不想无监督运行的操作。

### 让智能体写自己的代码

你定义的工具不是上限。eve 给你的智能体一台真正的、带 Shell 的计算机，因此它可以运行 bash、grep 以及任何你会在终端中运行的命令。当任务需要还不存在的代码时，智能体会编写并运行它。

```
> 将上周收入按地区分解并生成图表
⦿ write_file analysis/by_region.py
⦿ bash  python analysis/by_region.py
6 月 1 日当周按地区收入。AMER $2.1M，EMEA $1.6M，APAC $0.5M。
图表已保存至 analysis/by_region.png。
```

智能体在自己的沙盒中编写并运行自己的代码

你的智能体可以在安全的沙盒中自主解决问题，重塑数据集、运行一次性分析，或编写任务所需的任何代码，而无需预先定义工具。

### 委托工作给子智能体

eve 智能体也可以委托。子智能体在下一级具有相同的形状——`subagents/` 内的一个目录，拥有自己的指令、工具和沙盒。父级像调用工具一样调用它。

```typescript
// agent/subagents/investigator/agent.ts
import { defineAgent } from "eve"

export default defineAgent({
  description: "在分析师报告之前调查数据中的异常。",
  model: "anthropic/claude-opus-4.8",
})
```

分析师可以移交工作的子智能体

子智能体以干净的上下文窗口启动，只有你给它的工具，完成工作后把结果交回父级。

## 启动并与你的智能体交互

现在到了每个开发者都期待的部分——测试他们的智能体。以前这意味着启动进程、提问、阅读日志，没有简单的视图来显示使用了哪些工具、模型加载了什么、或者它为什么这样回答。你想跟你的智能体对话并看它工作，但得到的只有 `stdout`。有了 eve，开发循环只需要一条命令。

### 本地运行智能体

启动一个 eve 智能体，你运行它的开发服务器。

```bash
eve dev
```

在本地启动智能体，通过终端 UI 与它对话

```
> 上周收入是多少？
⦿ load_skill revenue-definitions
⦿ run_sql  SELECT date_trunc('week', created_at) ...
6 月 1 日当周收入为 $4.2M（退款后净值），较前一周增长 6%。
```

运行的每一步都实时可见

智能体所做的一切都在 TUI 中可见。智能体加载了技能，运行了查询，按照团队规则回答，每一行都是持久化会话中的一个带检查点的步骤。终端 UI 只是一个客户端，智能体通过 HTTP 提供相同的结构化事件，因此 `curl`、测试脚本或 CI 都可以驱动它并精确检查它做了什么。

### 用测评测试智能体

对话只能一次一次地验证智能体。测评像测试其他软件一样测试你的智能体——作为项目中的文件编写带评分的检查。

```typescript
// evals/revenue.eval.ts
import { defineEval } from "eve/evals"
import { includes } from "eve/evals/expect"

export default defineEval({
  description: "分析师按团队规则回答收入问题。",
  async test(t) {
    await t.send("上周收入是多少？")
    t.completed()
    t.calledTool("run_sql")
    t.check(t.reply, includes("退款后净值"))
  },
})
```

一个检查分析师是否使用了其工具并遵循了团队定义的测试套件

你可以在本地运行 `eve eval`，也可以指向已部署的应用，这样提示词变更或模型切换会在用户发现之前告诉你什么被破坏了。

## 部署

智能体在你的笔记本上待得够久了。部署它通常是智能体工作结束、基础设施工作开始的步骤。有了 eve，没什么需要配置的，因为智能体就是一个普通的 Vercel 项目，它的部署方式和其他前端或后端一样。

```bash
vercel deploy
```

部署智能体

部署时你的智能体无需任何更改，因为 eve 从设计之初就以适配器为目标。发布时 eve 部署到 Vercel，对其他平台的支持也在进行中。同一个目录在生产环境中运行的方式和你的笔记本上完全一样。沙盒无需代码更改就切换到 Vercel Sandbox，你在开发中对话的智能体现在可以通过公开 URL 访问。部署甚至不会中断智能体；一个在部署推送时正在执行任务的会话会继续在它启动时的版本上完成。

整个过程中不需要任何 Dashboard 操作。构建你智能体的同一个编程智能体可以部署它并验证其工作。

但部署不等于完成。在生产环境中，智能体有用户要服务，有工作要在自己的时间表上完成。

## 将智能体介绍给你的团队

以前让智能体进入 Slack 意味着先构建一个 Slack 应用，包括应用配置、Bot Token、事件订阅、Webhook 端点、签名密钥——所有这些都在智能体说出第一句话之前。有了 eve，一个渠道就是一条命令。

```bash
eve channels add slack
```

脚手架生成 Slack 渠道文件

这条命令写入 `channels/slack.ts`，一个像任何其他代码更改一样部署的文件，你刚部署的智能体现在在 Slack 中回答问题。平台交互能力随渠道而来，因此审批渲染为 Slack 按钮，问题渲染为选择菜单，智能体在工作时显示输入状态指示器。通过 [Vercel Connect](https://vercel.com/connect) 路由凭证，无需将 Bot Token 复制到 `.env` 文件。再用 `discord` 或 `teams` 运行一次命令，同一个智能体也在那里了，每个渠道一个文件。

渠道是智能体的用户界面，会话可以在它们之间流转。在 Slack 中提出的问题可以继续在 Web 上进行，通过 HTTP 到达的事故 webhook 可以在 Slack 中开启调查线程，让工作在团队已经所在的地方完成。

### 把智能体放到时间表上

周一的收入报告不应该等有人来问。一个时间表不过是又一个文件——一个 cron 表达式和一个处理器，让智能体按自己的时钟启动。

```typescript
// agent/schedules/monday-summary.ts
import { defineSchedule } from "eve/schedules"
import slack from "../channels/slack.js"

export default defineSchedule({
  cron: "0 9 * * 1",
  async run({ receive, waitUntil, appAuth }) {
    waitUntil(
      receive(slack, {
        message: "总结上周的收入并发布到团队频道。",
        target: { channelId: "C0123ABC" },
        auth: appAuth,
      }),
    )
  },
})
```

通过 Slack 渠道在 cron 上发布周一收入报告

在 Vercel 上，每个时间表以 [Vercel Cron Job](https://vercel.com/docs/cron-jobs) 的形式部署，因此报告每个周一发布，不需要有人记着这件事。

## 像运行其他软件一样运行智能体

你的团队依赖的智能体是生产软件，对指令的更改可以像代码更改一样明确地破坏它。因为 eve 智能体是目录中的文件，它像你的其他代码一样存在于 Git 中，新的提示词、工具或技能是一个有 diff、有 review、有历史的提交。

将 `eve eval` 接入 CI，你编写的测试套件就成为部署门禁，为每次提交打分，让回归在 CI 中停止而不是在生产环境中。

每次提交也有自己的预览部署，并且携带智能体的渠道。团队可以在新版本替代他们每天使用的 Slack 机器人之前先对话它。

当某个变更以测评未能捕获的方式出错时，你可以[即时回滚](https://vercel.com/docs/instant-rollback)生产环境到上一个版本。

## 我们如何在 Vercel 上用 eve 运营

我们在 Vercel 生产环境中运行超过一百个智能体，它们是公司日常运营的一部分，每个都在业务中扮演一个角色。以下是其中几个。

### 数据分析师

Vercel 内部使用最多的工具是一个智能体，每月处理超过 30,000 个问题。任何人都可以在 Slack 中向 d0 提问任何问题，并从数据仓库获得答案。每个查询都限定在提问者自己的权限范围内，因此 d0 永远不会向你展示你本来看不到的表。

### 自主 SDR

Lead Agent 全天候运行我们最佳销售代表的剧本。它在每条新线索进来的第一时间就开始工作，并自主跟进，不让任何线索过夜冷却。每年运行成本约 $5,000，回报是 32 倍，一名工程师兼职维护。

### 销售驾驶舱

RevOps 团队在没有工程师的情况下用了六周构建了 Athena。它用自然语言从 Snowflake 和 Salesforce 回答管道和预测问题，上线后管道覆盖率几乎翻倍。

### 支持工程师

Vertex 是我们的支持智能体，全天候处理帮助中心、文档和 Slack 中的工单，确保人们无论何时提问都能获得快速回应。它阅读工单、找到正确答案并回复，独立解决 92% 的工单，将剩余的升级给支持团队，让他们专注于最需要关注的问题。

### 内容智能体

Vercel 的每个人都可以写作，不只是内容团队。draft0 运行一个完整的审查管道，在内容到达我们之前捕获最明显的问题并构建对文章实际内容的分析。当它到达时，显而易见的工作已完成，我们对它需要什么有了更清晰的了解。这意味着小篇幅的内容可以快速推进，我们可以将全部注意力集中在那些值得深入打磨的内容上，比如这一篇。

### 路由智能体

我们每天依赖数百个智能体，但要追踪哪个处理什么工作负载并不高效。因此，我们不自己做任务路由，而是把一切先发给 Slack 中的 V。V 判断哪个智能体能真正回答任务并将其路由过去，这意味着整个舰队像一个智能体一样工作，而非一百个不同选项。

这些智能体最初都是独立项目、独立技术栈，每个都有自己的状态管理、凭证代理和日志输出方式——大多数团队在构建第二或第三个智能体后都会发现自己处于这种境地。今天它们生活在一个 monorepo 中，无论哪个团队拥有它们，都以相同的方式构建、观测和升级。因为它们共享相同的形状，一百个智能体以相同的工具和相同的约定运行如一。

## 开始使用

一年前，智能体触发的部署不到 Vercel 总部署的 3%。现在，它们触发了约 29%，我们预期来自智能体的部署很快会达到一半。你可能已经构建过一个智能体了，下一个不需要再从零开始。

公开预览版今天开放，CLI 向导让你在一分钟内经历从选择模型到运行开发服务器的完整流程，创建第一个智能体。

```bash
npx eve@latest init my-agent
```

你的第一个 eve 智能体

编程智能体只需要一个提示词：

```
为用户搭建一个 Eve 智能体。Eve 是一个文件系统优先的 TypeScript 框架，
用于构建持久化智能体，以 npm 包 eve 发布。阅读其文档：
eve 安装后文档打包在 node_modules/eve/docs 中；
eve 安装前，阅读已发布的 Introduction 和 Getting Started 页面。
如果项目还没有 Eve 应用，用 `npx eve@latest init <name>` 脚手架创建一个；
仅当用户需要 Web Chat 时添加 `--channel-web-nextjs`。
init 命令会安装依赖、初始化 Git 并启动开发服务器，
因此在一个可控的进程中运行它，编辑前先停止。
要将 Eve 添加到现有应用，运行 `npm install eve@latest`。
确保 agent/agent.ts 和 agent/instructions.md 存在，
然后使用 defineTool from eve/tools 在 agent/tools/get_weather.ts 中
添加第一个带类型的工具，包含 Zod inputSchema 和内联 execute。
重新启动开发服务器，然后练习 HTTP API：
用 POST /eve/v1/session 创建会话，
用 GET /eve/v1/session/:id/stream 连接，
用返回的 continuationToken 发送后续消息。
用项目的类型检查验证，根据项目调整模型和提供商选择，
除非用户要求否则不要提交。
```

给你的编程智能体的启动提示词

eve 能做的一切在 [eve.dev/docs](https://eve.dev/docs)，开发在 [github.com/vercel/eve](https://github.com/vercel/eve) 公开进行，欢迎 Issues、讨论和贡献。

Vercel 上已有数百个智能体运行在 eve 上。你会构建什么？

[**构建你的第一个智能体** — 一个智能体就是一个文件目录，eve 运行它，内置持久化执行、沙盒、审批和测评。兼容任何模型、任何 MCP 服务器，以及 Slack、Discord、GitHub 等渠道。开始吧](https://vercel.com/kb/eve)

---

> **译者注**：eve 是 Vercel 在智能体框架领域的一次重要布局，定位类似于 Next.js 在 Web 框架中的角色——将反复出现的模式固化为框架，消除样板代码。核心理念"一个智能体就是一个目录"非常优雅：通过文件系统约定来组织智能体的身份（`agent.ts`）、能力（`tools/`）、知识（`skills/`）、渠道（`channels/`）和定时任务（`schedules/`）。内置持久化执行、沙盒隔离、人工审批和多渠道支持，让开发者从"组装管道"阶段跳到"专注业务"阶段。
