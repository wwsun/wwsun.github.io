---
title: 使用 Claude Code 构建 Agent 编排框架
description: 通过专业化子智能体、门控流水线、MCP 遥测和持久化学习机制，让 Claude Code 的 AI 辅助开发更可预测
tags:
  - clippings
  - claude-code
  - agent
  - mcp
  - devops
source: https://blog.logrocket.com/building-an-agent-harness-with-claude-code/
created: 2026-07-22
---

## 使用 Claude Code 构建 Agent 编排框架

> 原文：[How to build an agent harness with Claude Code](https://blog.logrocket.com/building-an-agent-harness-with-claude-code/) 作者：Andrew Evans 日期：2026-07

如果你花过大量时间与编程智能体结对编程，你很可能遇到和我一样的瓶颈：智能体开局强劲，然后在第三或第四轮对话时开始偏离方向。范围蔓延。它"修复"了没坏的代码。它说测试通过了，但测试并没有真正验证新行为。会话越久，越难判断智能体是否还在遵循原始任务。

编排（Harness）式工作流是让 AI 辅助开发更可预测的一种方式。不是让一个通用智能体包揽计划、实现、测试、审查和发布变更，而是把工作拆分成多个专业化智能体。每个智能体承担一个狭窄角色，拥有全新的上下文窗口和清晰的交接机制。一个薄编排层强制操作的执行顺序，前一关卡不通过，后续步骤不能推进。

本文面向已经在尝试编程智能体、希望获得比单条长提示链更可控的工作流的开发者、平台团队和 DevEx 团队。我们将在 [Claude Code](https://code.claude.com/docs/en/overview) 中构建一个小型编排框架，使用 `/harness` 斜杠命令、Dev/QE/Ops 子智能体、本地 MCP 遥测服务器以及跨运行传递经验的 `LEARNING.md` 文件。示例项目在 [agent-harness-with-claude-code](https://github.com/andrewevans0102/agent-harness-with-claude-code)，本文将围绕它展开。

最后，我还会展示相同模式如何在 [Reygent](https://github.com/andrewevans0102/reygent) 中规模化——那是我构建并开源的一个更完整的生产级编排框架。

## 什么是编排模式？

编排（Harness）是一个由专业化智能体组成的带编排的流水线。每个智能体负责工作的一个阶段，框架在各阶段之间强制执行关卡。

这个名字借自赛马：模型仍然提供动力，但缰绳（Harness）将动力引导到可控的方向。在软件语境中，编排框架把模糊的智能体会话转变为有制品、角色边界和通过/失败关卡的工作流。

一个简单的编排框架可能长这样：

| 阶段 | 智能体角色    | 主要制品       | 关卡                 |
| ---- | ------------- | -------------- | -------------------- |
| 规划 | Planner       | 书面规格说明   | 人工或自动的规格审查 |
| 生成 | Dev/Generator | 代码差异和测试 | 单元测试通过         |
| 验证 | QE/Reviewer   | 验证报告       | 验收标准通过         |
| 发布 | Ops           | 分支、提交、PR | 前述关卡已通过       |

重要的不是智能体的精确数量，而是每个阶段有狭窄的任务，下一阶段接收的是制品，而非前一智能体的完整推理历史。

从视觉上看，这就是一个智能体包揽全部任务和门控流水线之间的区别——每个阶段交接给下一个阶段：

**单智能体**：一个不断膨胀的上下文

```
需求
  │
  ▼
┌─────────────────────────────┐
│ 一个智能体：                  │
│ 计划 + 编码 + 测试 + 审查     │
└─────────────────────────────┘
  │
  ▼
发布 🤞
```

**编排模式**：每个阶段独立上下文，有关卡

```
需求
  │
  ▼
┌──────┐   ┌──────────┐   ┌──────────┐   ┌──────┐
│ Plan │──▶│ Generate │──▶│ Evaluate │──▶│ Ship │
└──────┘   └──────────┘   └──────────┘   └──────┘
  spec         diff           pass           ▲
                  │ 失败/补救  │
                  └───────────┘
```

单智能体工作流是偏移、范围蔓延和自我审查偏见的来源。编排框架通过构造来遏制这些问题。评估者没有写代码。发布者不能绕开测试关卡。Dev 智能体不能悄悄地重新解释需求，因为 spec 就是合同。

## 为什么单智能体工作流会失效

很容易把这件事概括为"智能体越多越好"，但关键不在这里。编排框架之所以有效，是因为它解决了单个智能体承载端到端任务时出现的特定失败模式。

| 失败模式     | 单智能体会话中的表现                     | 编排如何解决                               |
| ------------ | ---------------------------------------- | ------------------------------------------ |
| 上下文漂移   | 随对话增长，智能体遗忘早期约束           | 每个阶段仅以所需制品开始                   |
| 范围蔓延     | 一个小 Bug 修复变成未请求的重构          | 生成器实现 spec 而非重新协商范围           |
| 自我审查偏见 | 智能体对自己代码的审查过于宽松           | 独立的评估者按 spec 检查输出               |
| 自检质量差   | 测试通过了，但没真正验证变更             | QE 拥有验证权，按验收标准逐条报告通过/失败 |
| 上下文饱和   | 工具输出、测试日志、实现细节挤走原始目标 | 规划、编码、测试、发布在不同窗口中发生     |

这不只是 LLM 的特有现象。人类团队出于类似原因分离开发、QA、安全审查和发布管理。编排模式将同样的分离原则应用到智能体上。

好的审查者会问："这段代码实际做什么？"作者往往只能看到自己意图中的写法。好的编排框架确保审查者不是作者。

## 编排工作流的核心组件

最简单的编排框架有三个角色：

- **Planner（规划者）**：将高层需求转化为具体书面规格。规划者不写代码。其产出通常是一个 `spec.md` 文件，包含目标、约束、建议方案和验收标准。
- **Generator（生成者）**：实现计划。生成者读取 spec，编辑代码，理想情况下编写测试。它不决定"完成"的含义，因为 spec 已经定义好了。
- **Evaluator（评估者）**：对照 spec 审查生成者的输出。评估者运行测试、检查行为、审视边缘情况，要么批准变更，要么退回修复。

实际编排框架通常会进一步拆分这些角色。你可能会加入安全审查者、性能分析师、文档编写者或发布经理。但概念主干保持不变：规划、生成、评估，然后才发布。

两个属性比智能体的精确数量更重要：

1. **每个阶段有自己的上下文窗口。** 没有智能体会继承之前阶段的完整历史。它只接收所需的制品——通常是 spec、diff、测试输出或结构化报告。
2. **编排是强制执行的，而非建议性的。** 一个可以继续写代码的规划者，不过是带额外指令的单个智能体。交接和关卡才是关键所在。

## 我们在 Claude Code 中构建什么

为了让编排模式具体化，我在 Claude Code 中构建了一个小型示例项目。完成的工作流做四件事：

1. `/harness <spec.md>` 斜杠命令启动一次运行
2. 编排器将 spec 委托给 Dev、QE、Ops 子智能体
3. 每个子智能体通过本地 MCP 服务器记录遥测
4. QE 可将失败实现循环回 Dev，但 Ops 仅在 Dev 和 QE 都通过后才运行

示例刻意保持小巧：一个叫 `hello-world-api` 的 Express API、一个暴露单个 `recordTelemetry` 工具的本地 MCP 服务器，以及一个跨运行存储经验的 `LEARNING.md` 文件。这些真实代码足以让交接变得具体，而不至于被应用逻辑淹没。

工作流长这样：

```
┌────────────────────────────────────────────────┐
│  /harness <spec.md>                            │
│  orchestrator: main Claude Code thread         │
└────────────────────────────────────────────────┘
  │
  │ 读取 LEARNING.md + spec
  ▼
┌──────────────────────────────────────────────────┐
│                    循环最多 2 次                    │
│  ┌─────────┐  pass  ┌─────────┐  pass  ┌─────────┐│
│  │   Dev   │───────▶│   QE    │───────▶│   Ops   ││
│  │subagent │        │subagent │        │subagent ││
│  └─────────┘        └─────────┘        └─────────┘│
│       │ 失败              │ 失败                    │
│       └──────────┐       └──────────┐              │
│                  ▼                  ▼              │
│  ┌───────────────────────────────┐                 │
│  │ 用失败上下文重新派生 Dev       │────────────────┘
│  └───────────────────────────────┘
│
每步转换 ▶ mcp__telemetry__recordTelemetry ▶ telemetry.db
运行结束 ▶ 追加经验 ▶ LEARNING.md
```

顶行是门控流程。spec 从左向右移动。如果 QE 判定实现失败，工作流带着失败上下文循环回 Dev，而不是一路回到规划阶段。下方是两个每个智能体都会接触的共享服务：遥测记录发生了什么，`LEARNING.md` 记录编排框架下次应该记住的东西。

## 编排框架操作的代码库

工作区结构如下：

```
agent-harness-with-claude-code/
├── LEARNING.md
├── README.md
├── .claude/
│   ├── commands/
│   │   └── harness.md
│   ├── agents/
│   │   ├── planner.md
│   │   ├── dev.md
│   │   ├── qe.md
│   │   └── ops.md
│   └── settings.local.json
├── specs/
│   ├── hello-world-api.md
│   └── goodbye-endpoint.md
├── hello-world-api/
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   └── server.js
│   └── tests/
│       └── hello.test.js
└── tools/
    ├── telemetry-mcp/   # 本地 MCP 服务器，暴露 recordTelemetry
    └── agent-memory/
```

示例应用 `hello-world-api/src/app.js` 是一个小型 Express API：

```js
const express = require("express")
const app = express()

app.get("/hello", (req, res) => {
  const name = req.query.name
  const who = name && String(name).length > 0 ? String(name) : "World"
  res.status(200).json({ message: `Hello, ${who}!` })
})

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" })
})

module.exports = app
```

它刻意保持极简：一个路由和一个 404 回退。本文的示例需求是一个小功能：添加一个与 `/hello` 镜像的 `GET /goodbye` 端点。

## Spec 即合同

Spec 是工作流中最重要的制品。它定义了 Dev 应该构建什么、QE 应该验证什么。没有清晰的 spec，编排框架只是让模糊的工作以更复杂的方式发生。

简化版 `specs/goodbye-endpoint.md` 文件长这样：

```markdown
# Goodbye 端点

## 目标

为 hello-world-api 添加 GET /goodbye 端点。

## 需求

- GET /goodbye 返回 200
- 不带 name 查询参数时，返回 { "message": "Goodbye, World!" }
- 带 ?name=Alice 时，返回 { "message": "Goodbye, Alice!" }
- 现有 /hello 行为必须继续正常工作
- 未知路由必须继续返回 404

## 验收标准

- 单元测试覆盖 /goodbye 带参数和不带参数两种场景
- 回归测试对 /hello 和未知路由仍然通过
- QE 可用 curl 对运行中的应用验证端点
```

这刻意写得很无趣，而这正是它有用的原因。Dev 智能体有一个小而具体的实现目标。QE 智能体有清单式的验收标准。Ops 智能体有足够的上下文来创建聚焦的 Pull Request。

实践中，我建议按两步工作流运行：

1. 编写或生成 spec 到 `specs/<name>.md`，然后手动审查
2. 对已审查的 spec 使用 `/harness specs/<name>.md` 运行编排框架

将 spec 与实现分离至关重要。如果需求模糊，你希望在 Dev、QE、Ops 全部按错误合同执行之前就发现它。这类似于为什么[选择正确的文档层级](https://blog.logrocket.com/product-management/prd-alternatives-modern-product-teams/)在产品开发中如此重要——上游的模糊性会向下游不断放大。

## Claude Code 智能体配置

编排框架通过 `.claude/agents/` 中的 Markdown 文件配置。每个文件包含 YAML frontmatter 和系统提示词。`tools:` 行是强制执行角色纪律的杠杆。

### Dev 智能体

Dev 智能体是生成者。它读取 spec，编辑代码，运行测试：

```yaml
---
name: dev
description: 根据 spec.md 实现功能，编写并运行单元测试
tools: Read, Write, Edit, Bash, Glob, Grep, mcp__telemetry__recordTelemetry
---
你是 Dev Agent。实现 `spec.md` 中定义的技术规格。
开始前先读 `LEARNING.md` 获取之前编排运行的经验，遇到问题时再次查阅。
工作流：
1. 记录 dev_started。读取 spec.md 和 LEARNING.md
2. 实现所需变更。每次编辑/写入用遥测包围
3. 编写并运行单元测试。每次调用记录 test_run
4. 仅当所有单元测试通过后才标记 Dev 完成。记录 dev_finished
```

Dev 智能体有文件编辑和 Shell 工具，因为实现是它的职责。它也有遥测工具的访问权限，以便记录阶段里程碑和测试运行。

### QE 智能体

QE 智能体验证实现。它有类似的工具集，因为可能需要运行应用、执行测试和检查文件，但它的提示词禁止修改生产代码：

```yaml
---
name: qe
description: 按 spec.md 验收标准执行功能和集成测试
tools: Read, Write, Edit, Bash, Glob, Grep, mcp__telemetry__recordTelemetry
---
你是 QE Agent。按 spec.md 中的验收标准验证 Dev Agent 的实现。
工作流：
1. 读取 spec.md 和 LEARNING.md
2. 运行单元测试；对运行中的应用做冒烟测试（后台 npm start、curl、kill）
3. 按验收标准逐条报告通过/失败，附上观察到的输出
4. 仅当每项标准都通过后才标记 QE 完成
```

关键在于 QE 不是在给自己的作品打分。它能看见 spec 和最终代码，但不会继承 Dev 的推理过程。这体现了[用 AI 智能体替代测试套件](https://blog.logrocket.com/replaced-test-suite-ai-agents/)背后的原则——关注点分离正是自动化验证值得信赖的原因。

### Ops 智能体

Ops 智能体完成变更并创建 Pull Request：

```yaml
---
name: ops
description: 完成变更：创建分支、提交、通过 gh 开 PR、追加经验到 LEARNING.md
tools: Read, Write, Edit, Bash, mcp__telemetry__recordTelemetry
---
你是 Ops Agent。完成变更并创建 Pull Request。
工作流：
1. 仅在 Dev 和 QE 都通过后才启动
2. 检测 git remote -v 和 gh auth status；如缺失则给出明确提示
3. 创建功能分支，按仓库根路径暂存文件，提交
4. 通过 gh pr create 向 main 发起 PR，关联 spec
5. 将本轮经验追加到 LEARNING.md
```

Ops 有 `Bash` 权限因为它需要运行 `git` 和 `gh`。它不需要 Dev 和 QE 使用的更广泛的搜索工具。到这个阶段，代码应该已经完成并验证过了。

仓库还包含 `.claude/agents/planner.md`，定义了 Planner 角色。示例 `/harness` 命令不直接调用它，因为 `specs/` 中的规格是单独编写的，但你可以在将粗略需求转化为已审查的 spec 后再启动流水线时使用它。

## 编排器斜杠命令

编排器位于 `.claude/commands/harness.md`。它的职责是运行工作流，而非编辑代码：

```markdown
---
description: 对给定 spec 运行门控 Dev → QE → Ops 编排工作流
argument-hint: <path-to-spec.md>
---

你是 Harness Orchestrator，在主线程中运行。按 Dev → QE → Ops 驱动门控工作流，
spec 路径：$ARGUMENTS。
你通过 Agent 工具将每个阶段委托给其专用子智能体。
你唯一的直接工作：读取 LEARNING.md 和 spec 获取上下文、记录遥测、打印操作者状态行、
执行关卡、为每个子智能体构造提示词。
不要自己运行代码编辑、测试、git 或 gh。
```

命令体定义了必需的遥测事件、操作者状态行、循环策略和委托规则。例如，编排器打印进度如 `[1/3] Dev -- delegating to dev agent ...`，然后用自包含的提示词调用正确的子智能体。

运行编排框架，在仓库根目录执行斜杠命令：

```
/harness specs/goodbye-endpoint.md
```

编排器读取 `LEARNING.md` 和 spec，然后按阶段进行 Agent 工具调用：

```
Agent(subagent_type="dev", prompt=<dev brief>)
Agent(subagent_type="qe", prompt=<qe brief, 包含 dev 制品>)
Agent(subagent_type="ops", prompt=<ops brief, 包含变更摘要>)
```

每次调用派生一个带独立上下文窗口的全新子智能体。编排器收到每个阶段的结构化报告：通过/失败状态、变更文件、运行命令、阻塞项和下一阶段所需信息。

## 走一遍编排运行

以下是 `goodbye-endpoint` spec 流经系统的过程：

| 步骤 | 阶段         | 发生的事                                                           | 关卡                          |
| ---- | ------------ | ------------------------------------------------------------------ | ----------------------------- |
| 1    | Orchestrator | 读取 LEARNING.md、spec，发出 harness_started，委托给 Dev           | Spec 已加载，委托提示词已创建 |
| 2    | Dev          | 添加 GET /goodbye，创建 goodbye.test.js，运行 npm test             | 单元测试通过                  |
| 3    | QE           | 运行测试，启动应用，curl 各端点，验证 /hello、/goodbye 和 404 行为 | 所有验收标准通过              |
| 4    | Ops          | 检查 git/gh，创建分支，提交，推送，开 PR，追加持久化经验           | Dev 和 QE 均已通过            |

在我的运行中，Dev 修改 `hello-world-api/src/app.js` 在 404 回退之前添加了 `GET /goodbye`，然后创建了包含两个 Supertest 用例的 `hello-world-api/tests/goodbye.test.js`。QE 随后验证了新端点，并对现有的 `/hello` 和 `/unknown` 路径做了回归测试。

如果 QE 发现问题——比如 `/goodbye?name=Foo` 返回了正确 body 但内容类型错误——工作流带着具体失败上下文循环回 Dev。它不会回到 Planner，因为 spec 仍然是正确的，问题出在实现上。示例允许最多两次 Dev → QE 循环，之后以 `harness_failed` 中止。Ops 永远不会在关卡失败时运行。

## MCP 遥测与 LEARNING.md 的可观测性

一个只运行一次就忘记一切的编排框架浪费了它最大的优势之一。示例使用两个轻量机制让工作流变得可观测和可积累：

- **遥测记录发生了什么。** 本项目中，每个智能体通过 MCP `recordTelemetry` 工具将阶段里程碑和工具事件写入 SQLite `events` 表。
- **学习记录编排框架应记住的事。** 仓库级的 `LEARNING.md` 文件捕获先前运行的持久经验。智能体启动时读取它，遇到问题时再次查阅。

本地 MCP 服务器位于 `tools/telemetry-mcp/`。示例 API 不使用它，它是给编排框架本身的仪器化工具。

MCP 服务器暴露单个工具 `recordTelemetry`，底层是 SQLite：

```js
const TOOL = {
  name: "recordTelemetry",
  description:
    "追加事件到 telemetry.db (SQLite)。用于 tool_call_start/end、" +
    "workflow_step_start/end、state_change、error 和阶段里程碑 " +
    "(dev_started、qe_finished、harness_completed 等)。",
  inputSchema: {
    type: "object",
    properties: {
      eventName: { type: "string" },
      details: { type: "object", additionalProperties: true },
    },
    required: ["eventName"],
  },
}

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { eventName, details = {} } = req.params.arguments || {}
  telemetry.recordEvent(eventName, details)
  return { content: [{ type: "text", text: `recorded: ${eventName}` }] }
})
```

每个智能体在其允许工具中列举 `mcp__telemetry__recordTelemetry`。各提示词指示智能体在工作时记录 `dev_started`、`tool_call_start`、`test_run`、`qe_finished` 等事件。

`LEARNING.md` 服务于不同目的。它不是日志，而是值得保留的经验的记忆文件。

例如，如果 Ops 发现项目文件必须按仓库根路径暂存而非包相对路径，那条经验就属于 `LEARNING.md`。下一次运行不应该重新发现相同的问题。

遥测和学习二者结合，给你两种不同视角来看工作流：

| 机制        | 记录内容                            | 用途                         |
| ----------- | ----------------------------------- | ---------------------------- |
| 遥测        | 事件、阶段、工具调用、通过/失败状态 | 调试特定运行，发现工作流模式 |
| LEARNING.md | 持久经验和重复性修复                | 防止相同失败重复发生         |

经过多次运行，遥测可以显示编排框架在何处停滞或循环。学习文件随后可以将修复编码进去，让未来的智能体携带这些上下文启动。

## 微调工作流

你构建的第一个编排框架不会是你最终使用的那个。在觉得有用之前，我对这个示例迭代了好几次。以下是我会首先调整的几个杠杆：

- **收紧智能体提示词。** 示例提示词很短以保持可读性。在实际项目中，扩展它们——加入命名约定、测试模式、架构约束，以及每个智能体应该避免什么的示例。
- **让 spec 格式规范化。** 最高杠杆的改进是结构化的 `spec.md` 模板，带有固定的验收标准部分。模糊的 spec 产生模糊的实现。
- **为每个智能体选择正确的模型。** 你不需要最贵的模型来写 PR 描述。我会把强推理模型放在规划上，强编码模型放在 Dev 上，更快的模型放在 Ops 类步骤上。
- **按角色限定权限。** 权限范围不仅是安全特性，还是一种行为引导。一个 `edit: deny` 的只审查智能体不能"快速修一下"然后塌缩回生成者。
- **调整循环策略。** "失败回到 Dev"是合理的默认值，但并不总是对的。如果 QE 持续因为需求被误解而失败，循环应该回到 Planner。
- **尽早使用遥测。** 记录每次交接：哪个智能体运行了、看到了什么 spec、产生了什么、在哪里失败了。编排框架首次以不明显的方式出问题时，你会需要这条追踪链路。

微调编排框架就像微调 CI 流水线。结构是稳定的，但提示词、模型、工具和关卡会随着你了解项目实际奖励什么而演变。

## 实践要点

从我的多次运行中总结的几条经验：

- **Spec 是第一阶段的产出，而非副作用。** 如果规划者产生的是粗糙的 spec，每个下游智能体都会继承这种粗糙。要在 spec 上投入精力——它是为数不多的几个人工审查能防止成比例放大的浪费的地方之一。
- **把 LEARNING.md 当作团队记忆。** 它不是 README，不是设计文档，也不是变更日志。它是"我们上一次是怎么搞砸的，下次怎么做对"。Ops 智能体在每次运行结束时追加内容。其他智能体在启动时读取。就这么简单。
- **上下文隔离比角色命名更有价值。** 把 Dev 和 QE 分给不同智能体的真正原因不是标签，而是 QE 没有 Dev 的聊天历史。这种信息不对称正是审查产生价值的原因。
- **从小处开始，从痛点开始。** 不要为了架构完整性构建编排框架。等到单智能体会话开始在你最看重的项目上让自己难堪，然后只为那个痛点构建。
- **编排框架让审查从负担变为习惯。** 当 QE 是自动化关卡时，没有人的参与负担。你能得到的是一种常规习惯：每次变更都有一个不是你（也不是和你结对的那个智能体）做出的独立评估。

## 走向生产：Reygent

这个示例是概念验证级——足够小到看完一篇文章就能理解。如果你想要一个可以直接作为起点使用的生产级编排框架，可以看看 [Reygent](https://github.com/andrewevans0102/reygent)。它采用相同的 Dev → QE → Ops 流水线模式，增加了：

- 多智能体编排，支持 Planner、Dev、QE、Ops 和安全审查
- 对 Nx monorepo 风格工作区的一流支持
- 项目中内置的遥测和学习跟踪
- Claude Code 子智能体之上的门控工作流
- 可适应不同项目结构的可定制配置

核心思想相同：拆分工作，隔离上下文，强制执行关卡。Reygent 只是将相同模式扩展到了更多工作区形状和团队规模。

## 总结

Harness 模式用结构化的分工取代了"一个智能体包揽一切"。它不是灵丹妙药，但它直接解决了我在单智能体会话中最常遇到的失败模式：漂移、范围蔓延和自我审查。

最有价值的部分——spec 合同、独立评估、持久学习——不依赖于任何特定工具。我在 Claude Code 中构建了这个示例，因为那是我的日常驱动工具，但相同的模式可以在支持子智能体的任何编码工具中实现。

如果你已经在单智能体会话中碰到了漂移和范围蔓延的问题，试试为一个变更运行这个模式。手工做也可以——编写 spec，在独立会话中运行 Dev，在另一个独立会话中运行 QE。感受一下隔离之后是什么感觉。如果你喜欢这种感觉，那就建一个正式的编排框架。

---

> **译者注**：本文提出了一个非常实用的 AI 辅助开发工作流模式——Harness（编排框架）。核心思想是将传统软件工程中的关注点分离（规划、开发、测试、发布）应用到 AI 编程智能体中，通过门控流水线确保每个阶段的质量。这种模式有效解决了单个 AI 智能体在长会话中出现的上下文漂移、范围蔓延和自我审查偏见等问题。配套的开源项目 Reygent 提供了可直接使用的生产级实现。
