---
title: Agent 驱动的开发流程
tags:
  - gstack
  - superpowers
  - claude-code
draft: false
description: 未命名
source:
---

> 用途：本文件用于"新项目初始化后"的执行清单。
>
> 适用场景：已拿到初版 PRD，需要基于本脚手架快速落地前后端分离 Web 应用。
>
> 工具集成：结合 **gstack** 和 **superpowers** skill 加速各阶段交付。

---

## 工具速查表

| 场景         | Skill 命令             | 说明                      |
| ------------ | ---------------------- | ------------------------- |
| 会话启动     | `/session-start`       | 初始化编码上下文          |
| 理解代码库   | `/understand`          | 快速摸清项目结构          |
| 脚手架生成   | `/scaffold`            | 生成模块/组件骨架         |
| 产品头脑风暴 | `/office-hours`        | YC Office Hours 模式      |
| CEO 视角评审 | `/plan-ceo-review`     | 产品价值与优先级          |
| 工程评审     | `/plan-eng-review`     | 技术方案可行性            |
| 设计评审     | `/plan-design-review`  | UI/UX 方向把关            |
| 自动规划     | `/autoplan`            | CEO + 工程 + 设计联合评审 |
| 技术图表     | `/diagram-expert`      | ER 图、流程图、架构图     |
| 生成待办     | `/create-todos`        | 从需求自动拆解任务        |
| 智能实现     | `/implement`           | 上下文感知代码生成        |
| AI 辅助编码  | `/codex`               | Codex CLI 代码生成        |
| 代码审查     | `/review`              | PR 合并前质量门控         |
| 测试运行     | `/test`                | 上下文感知测试执行        |
| BUG 调查     | `/investigate`         | 系统化根因分析            |
| 代码健康     | `/health`              | 代码质量仪表盘            |
| 安全扫描     | `/security-scan`       | 静态安全分析              |
| CSO 审查     | `/cso`                 | 基础设施安全评估          |
| 安全专家     | `/web-security-expert` | OWASP Top 10 审计         |
| 前端设计     | `/frontend-design`     | 生产级界面生成            |
| 多方案设计   | `/design-shotgun`      | 并行生成多套设计方案      |
| 设计定稿     | `/design-html`         | 高保真 HTML 产出          |
| 设计评审     | `/design-review`       | 视觉一致性审查            |
| 网页浏览     | `/browse`              | 无头浏览器操作            |
| QA 测试      | `/qa`                  | 全链路 QA + 自动修复      |
| 仅报告 QA    | `/qa-only`             | 只报告不修改              |
| 性能基准     | `/benchmark`           | 性能回归检测              |
| 进度存档     | `/checkpoint`          | 保存/恢复工作状态         |
| 应用评分     | `/score-app`           | 综合评分报告              |
| 文档更新     | `/document-release`    | 发布后文档同步            |
| 发布流程     | `/ship`                | 检测 + 合并 + 部署        |
| 落地部署     | `/land-and-deploy`     | 合并 PR 并等待部署        |
| 金丝雀监控   | `/canary`              | 上线后实时监控            |
| 周期复盘     | `/retro`               | 工程回顾分析              |
| 安全操作     | `/careful`             | 危险命令二次确认          |

### 什么时候用 superpower 的 brainstorming

- ==明确要做某个功能，核心是完善功能的设计
- ==通过不断的反问完善需求细节

### 什么时候用 gstack 的 office-hours

- ==不确定要不要做==，需要有人质疑你的想法

---

先把两个工具中所有相关 skill 的源码读一遍，再给出完整方案。所有关键 skill 的源码已读完。现在可以给出一份完整的技术马拉松使用手册。

---

## 技术马拉松 Skill 使用手册

### Phase 1（T+0 ~ T+45min）：需求理解与设计

#### 用 superpowers: brainstorming（唯一入口）

输入格式要一次性给全，避免被追问：

```
题目原文：[完整粘贴]

已知约束：
- 技术栈：Node.js / React / PostgreSQL
- 时间限制：8小时
- 安全要求：未明确，按 Web 应用基线处理
- 性能要求：未明确，参赛者自行判断

范围决策（已做）：
- 子系统 A：核心功能，本次实现
- 子系统 B：认证模块，本次实现
- 子系统 C：数据导出，标记为 out of scope
```

**关键操作：**

1. Scope 判断环节——果断砍掉所有非核心子系统，只做一个单一 spec
2. 模糊需求处理——不要等 agent 问，直接声明"请主动决策并写入 spec"
3. spec 的 Ambiguity Check 会自动把所有模糊项变成显式决策，这是马拉松的核心竞争力

输出：`docs/superpowers/specs/YYYY-MM-DD-[题目]-design.md`，Status 变为 APPROVED 后进入下一步。

---

### Phase 2（T+45min ~ T+1.5h）：工程评审与实现计划

#### 并行使用两个工具（可同时跑）

**路线 A：gstack /plan-eng-review**

这个 skill 会做 Step 0 Scope Challenge，强制回答：

- 已有代码有哪些能复用（马拉松从零开始时跳过）
- 架构是否可以用更少文件实现
- 安全/性能/边界失效场景

输出 Failure Modes 表——**马拉松答辩环节的加分项**，评委会问"这个场景怎么处理"，你有文档可以直接引用。

它还会生成 **Worktree parallelization strategy**，告诉你哪些实现步骤可以并行，这直接决定后续实现速度。

**路线 B：superpowers: writing-plans（紧接 brainstorming 自动触发）**

生成逐步实现计划，格式是 bite-sized tasks（每步 2-5 分钟），每个 task 包含：

- 精确文件路径
- 完整代码片段（不是描述，是实际代码）
- 验证命令和期望输出
- git commit 指令

---

### Phase 3（T+1.5h ~ T+7h）：高速实现

这是马拉松成败的核心阶段，skill 选择直接决定速度。

#### 主线：superpowers: subagent-driven-development

这是**马拉松推荐路线**，而不是 executing-plans，原因：

| 对比维度   | subagent-driven-development                     | executing-plans                 |
| ---------- | ----------------------------------------------- | ------------------------------- |
| 上下文污染 | 每个 task 用新的 subagent，上下文干净           | 同一 session 累积，后期容易跑偏 |
| 卡住处理   | BLOCKED 状态自动上报，换模型重试                | 需要人工发现卡住                |
| 质量门控   | 每个 task 做两轮 review（spec 合规 + 代码质量） | batch 执行，review 较粗         |
| 速度       | task 之间无需切换 session                       | 需要上下文切换                  |

执行流程（每个 task 循环）：

```
派发 implementer subagent
    -> 回答问题（如果有）
    -> 实现 + 自检 + commit
-> 派发 spec reviewer（验证没有多做也没有少做）
-> 派发 code quality reviewer
-> 标记 task DONE
-> 下一个 task
```

#### 并行加速：superpowers: dispatching-parallel-agents

当 plan-eng-review 产出的 Worktree parallelization strategy 显示有独立 lane 时使用。

典型场景：

- Lane A：后端 API 路由 + 数据库层（不依赖前端）
- Lane B：前端组件（不依赖后端实现，只依赖 API contract）

两个 lane 可以同时派发，互不干扰，完成后合并。

**注意**：两个 lane 如果触碰同一个模块目录，plan-eng-review 会标记 Conflict Flag，这种情况回退到顺序执行。

#### 调试：按情况选择

| 情况                              | 用哪个                                      |
| --------------------------------- | ------------------------------------------- |
| 有明确报错 / 测试失败 / 异常行为  | superpowers: systematic-debugging           |
| 在 gstack 项目内 / 有 browse 工具 | gstack /investigate                         |
| 连续 3 次 fix 失败                | 两者都有"3-strike rule"，会强制要求人工介入 |

systematic-debugging 的 Iron Law 和 gstack /investigate 的 Iron Law 几乎一致：**必须找到 root cause 才能修，禁止猜测性修改**。马拉松时间压力大，这条规则反而更重要——猜测性 fix 会导致 3-4 轮反复，比系统调试浪费更多时间。

---

### Phase 4（T+7h ~ T+8h）：收尾与提交

#### ==步骤一：gstack /qa（--quick 模式）

时间不够时用 `--quick`，只修 critical + high severity。

QA skill 会：

1. 检查工作区是否干净（不干净会问你 commit or stash）
2. 自动截图留证据
3. 对每个 fix 做 before/after 截图对比
4. 输出 PR Summary 一行话：`QA found N issues, fixed M, health score X → Y`

这一行话直接用于答辩 demo 的开场白。

#### 步骤二：superpowers: finishing-a-development-branch

流程：

1. 跑全套测试（有失败不能继续）
2. 给出 4 个选项（本地合并 / push + PR / 保留 / 丢弃）
3. 马拉松选**选项 2**：push + 创建 PR，自动生成 PR 描述

#### 步骤三：gstack /ship（如果时间充裕）

/ship 会额外做：

- Pre-landing review（找测试覆盖不到的结构问题）
- 自动版本号 bump
- 自动生成 CHANGELOG
- 确认 TODOS.md 中完成的项目

时间不够就跳过，直接用 finishing-a-development-branch 即可。

---

### 完整 Skill 使用顺序图

```
题目拿到
    |
    v
superpowers: brainstorming          <- 需求理解 + spec
    |（spec APPROVED后）
    v
superpowers: using-git-worktrees    <- 创建隔离工作区（自动触发）
    |
    +---> gstack: /plan-eng-review  <- 架构审查 + 并行策略
    |
    v
superpowers: writing-plans          <- 生成逐步实现计划
    |
    v
superpowers: subagent-driven-development   <- 主实现循环
    |                                         每个 task: 实现 -> spec review -> quality review
    +---> superpowers: dispatching-parallel-agents  (如有独立 lane)
    |
    +---> superpowers: systematic-debugging  (遇到 bug 时)
    |         或 gstack: /investigate
    |
    v
gstack: /qa --quick                 <- 快速 QA
    |
    v
superpowers: finishing-a-development-branch  <- 测试验证 + PR
    |（时间充裕时）
    v
gstack: /ship                       <- 完整收尾流程
```

---

### 时间不够时的优先级砍法

| 时间剩余 | 砍掉什么                                                                                     |
| -------- | -------------------------------------------------------------------------------------------- |
| < 2h     | 跳过 /plan-eng-review，直接 writing-plans                                                    |
| < 1h     | 跳过 QA，直接 finishing-a-development-branch                                                 |
| < 30min  | 跳过 finishing-a-development-branch，手动 push                                               |
| 任何时候 | 绝对不砍 brainstorming 和 systematic-debugging——这两个是防止方向错误和调试陷入死循环的安全网 |

---

## 非功能检查（安全与性能）

在发布前完成基础安全与性能基线验证。

- [ ] 安全检查：鉴权、越权、输入校验、敏感信息暴露
- [ ] 性能检查：关键接口响应时间、慢查询、前端加载性能
- [ ] 记录问题并按优先级闭环

### 推荐工具

- ==`/web-security-expert` — OWASP Top 10 2025 系统化安全审计
- `/cso` — 基础设施安全评估（网络、容器、配置）
- ==`/security-scan` — 静态代码安全扫描
- ==`/benchmark` — 接口性能基准测试与回归对比
- `/health` — 代码质量仪表盘，识别技术债热点

### 产出与验收

- [ ] 无高危安全问题遗留
- [ ] 性能指标达到本期目标或有明确优化计划

---

## 综合评估与发布准备

在发布前形成"可交付结论"和后续改进清单。

- [ ] 对照 PRD 逐条验收并标记状态（已完成/部分完成/延期）
- [ ] 生成项目评分报告
- [ ] 更新必要文档（README、部署说明、模块说明）
- [ ] 执行发布流程并监控上线状态

### 推荐工具

- ==`/score-app` — 生成前后端分离 Web 项目综合评分报告
- `/document-release` — 发布后自动同步 README、CHANGELOG、接口文档
- `/ship` — 一键检测 + 合并 + 部署，包含前置门控
- `/land-and-deploy` — 合并 PR 后等待 CI/CD 完成部署
- `/canary` — 上线后实时监控，自动告警异常
- `/retro` — 本期工程复盘，生成改进建议

### 产出与验收

- [ ] 发布建议结论（可发布 / 有条件发布 / 暂不发布）
- [ ] 遗留问题清单（负责人 + 截止时间）

---

## 附：快速使用方式

- [ ] 新项目创建后，先完成阶段 0
- [ ] 拿到 PRD 后，优先完成阶段 1~3，再进入编码
- [ ] 每完成一个阶段，补齐"产出与验收"并提交
- [ ] 禁止跳过 Spec 与 DDL 直接大规模编码
