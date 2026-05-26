---
title: "Learning Opportunities — AI 辅助编码中的刻意练习技能插件"
tags:
  - learning-science
  - ai-assisted-coding
  - skill-development
  - claude-code
  - codex
description: "基于学习科学的 Claude Code/Codex 技能插件调研，面向 Claude Code 用户的安装指南、使用场景和价值分析"
source: "https://github.com/DrCatHicks/learning-opportunities"
created: 2026-05-15
---

## 一句话定位

> [!tip] 一句话定位
> 在你的 [[claude-code|Claude Code]] 里装一个"学习教练"——完成架构性工作后，它会主动问："要不要花 10-15 分钟做一个学习练习？"

**Learning Opportunities** 是一个 [[claude-code|Claude Code]] / Codex 插件（同时也是一个插件市场），由心理科学家 Dr. Cat Hicks 基于学习科学研究开发。它用认知科学的方法论，帮你在 AI 辅助编码的同时**真正提升自己的技能**，而不是陷在"产出很多、学到的很少"的陷阱里。

## 我为什么需要这个

### 我在用什么

日常工作重度使用 [[claude-code|Claude Code]] 和 Codex 进行 Agent 开发、Node.js/TypeScript 后端、React 前端开发。典型场景：

- 用 [[claude-code|Claude Code]] 做架构设计、模块重构
- 用 Codex 做交互式编码
- 不熟悉的领域（新框架、新模式）直接用 AI 快速试错

### 我面临的问题

AI 编码的**速度**是一把双刃剑。当我用 [[claude-code|Claude Code]] 快速生成一个完整的模块、一套数据库 schema、或一次大规模重构时，有一个真实的感受：**"代码写完了，但我不确定自己是否真的理解了。"**

这背后是学习科学已经证实的五个具体风险：

| 风险             | 在 [[claude-code                                | Claude Code]] 中的表现 |
| ---------------- | ----------------------------------------------- | ---------------------- |
| **生成效应削弱** | Claude 生成代码，我直接接受，跳过了主动构建理解 |
| **流畅性幻觉**   | 输出太干净了，让我误以为已经懂了                |
| **间隔效应消失** | 一口气让 Claude 完成了所有功能，没有间隔和反思  |
| **元认知被压制** | 快速产出让人没空问自己"我真的学会了吗？"        |
| **测试效应缺失** | Claude 总是给完整答案，我从不自我测试           |

**Learning Opportunities 就是在解决这个问题**——它不是拦着你用 AI，而是在合适的时机插入刻意练习。

## 安装（Claude Code）

### 1. 添加插件市场

```bash
/plugin marketplace add https://github.com/DrCatHicks/learning-opportunities.git
```

### 2. 安装插件

```bash
# 核心技能（必装）
/plugin install learning-opportunities@learning-opportunities

# 可选：自动触发（推荐）
/plugin install learning-opportunities-auto@learning-opportunities

# 可选：仓库导航
/plugin install orient@learning-opportunities
```

### 3. 重启 Claude Code

安装后重启即可生效。

### Codex 安装

```bash
codex plugin marketplace add https://github.com/DrCatHicks/learning-opportunities.git
```

## 三个插件详解

```
learning-opportunities/        # 这是一个插件市场
├── learning-opportunities/    # 🎯 核心：学习练习引擎
│   └── skills/learning-opportunities/
│       ├── SKILL.md           # ~250 行 prompt，定义全部行为
│       └── resources/
│           └── PRINCIPLES.md  # 学习科学原理手册
├── learning-opportunities-auto/  # 🔔 post-commit 自动提醒
│   └── hooks/post-tool-use.sh
└── orient/                    # 🧭 新仓库学习路径生成器
    └── skills/orient/
```

### 插件一：learning-opportunities（核心）

**触发时机：** Claude 完成以下工作后，主动问一声"要不要做学习练习？"

- 创建新文件或模块
- 数据库 schema 变更
- 架构决策或重构
- 实现不熟悉的模式
- 开发过程中我问过"Why"类问题

**自动抑制：**

- 我拒绝过一次 → 本次会话不再问
- 已完成 2 次练习 → 本次会话软上限

### 插件二：learning-opportunities-auto（推荐装）

每次 `git commit` 后自动触发学习提示。对 macOS/Linux 开箱即用。适合我这种 commit 频繁的开发习惯。

### 插件三：orient（探索新仓库时用）

接手新项目时，先生成 `orientation.md`，然后 Claude 带你按学习路径走一遍代码库。基于程序理解和代码导航的实证研究设计。

```bash
# 在目标仓库目录下
/orient
# 然后
/learning-opportunities orient
```

## 六种练习类型

安装后，Claude 会用以下方式和我互动：

| 练习               | Claude 会怎么问                          | 背后的学习原理      |
| ------------------ | ---------------------------------------- | ------------------- |
| **预测→观察→反思** | "你觉得这个中间件收到请求后会发生什么？" | 前测效应 + 生成效应 |
| **生成→对比**      | "在我展示实现之前，你先画一下你会怎么做" | 生成效应            |
| **追踪执行路径**   | "请求到了这一步，接下来会经过哪个函数？" | 主动加工            |
| **调试分析**       | "这段代码有个 bug，你觉得问题出在哪？"   | 错误分析 + 动态测试 |
| **教我一遍**       | "假设我是新人，给我解释一下这个模块"     | 检索练习            |
| **回顾检查**       | "上次我们做了 X，你还记得关键设计吗？"   | 间隔效应            |

### 关键设计：硬停止

> [!important] 关键设计：硬停止
> **"End your message immediately after the question."**
>
> 这个设计非常刻意——**Claude 提问后会硬停止**，不给提示、不给示例答案、不给任何教学线索。我必须自己思考并回答，然后 Claude 才会继续。
>
> 这和 Claude 默认"总是提供完整答案"的行为相反。刚开始可能有点不舒服，但这正是**必要难度**原则的体现。

## 学习科学基础

> 详见：[[ai-coding-learning-science-principles|AI 辅助编码中的学习科学原理]]

PRINCIPLES.md 是一份高质量的学习科学速查手册，覆盖十大原理：

1. **生成效应** — 主动产生 > 被动消费
2. **前测效应** — 错误的预测也有学习价值
3. **间隔效应** — 分散学 > 集中填
4. **工作示例效应** — 对新手有效，专家反转
5. **必要难度** — 短期难受 → 长期更好
6. **流畅性幻觉** — "看着懂" ≠ "真懂了"
7. **努力幻觉** — "忙" ≠ "在学"
8. **主动 vs 被动** — 检索/解释/生成 > 阅读/观看
9. **动态测试** — 错误 + 明确反馈 > 零错误
10. **元认知** — 知道自己在学什么、学到哪里

## 我的使用计划

### 立即可做

- [x] 安装核心插件 learning-opportunities
- [ ] 安装 learning-opportunities-auto（post-commit 自动提醒）
- [ ] 在下一个新项目中使用 orient 生成学习路径
- [ ] 在 [[claude-code|Claude Code]] 的 CLAUDE.md 中记录自己的技术背景信息，让练习起点更精准

### 推荐定制方向

1. **调整触发条件** — [[Agent Skills|SKILL.md]] 中的触发规则可以改，比如增加"学到新 API 时触发"
2. **添加领域知识** — 在我的 [[claude-code|Claude Code]] 项目级 CLAUDE.md 里补充已知语言和框架（Node.js/TypeScript/React），Claude 会据此调整练习起点
3. **对接 Learning-Goal** — Dr. Cat Hicks 还有一个配套技能 [Learning-Goal](https://github.com/DrCatHicks/learning-goal)，用于设定结构化学习目标（基于 MCII 技术），可以搭配使用
4. **调整抑制条件** — 如果觉得 2 次太少/太多，可以改

### 团队推广

如果效果不错，可以尝试推给团队。项目附带了一套 [MEASURE-THIS.md](https://github.com/DrCatHicks/learning-opportunities/blob/main/learning-opportunities/docs/MEASURE-THIS.md)，是经过验证的心理测量量表（源自 3,267 名专业开发者的研究），支持团队级的学习效果量化。

## 作者与背景

**Dr. Cat Hicks** — 心理科学家，研究软件团队和技术工作，即将出版《The Psychology of Software Teams》(2026)。她有超过 3,000 名开发者的实证研究数据，这些数据表明：**对学习的重视和承诺，能预测开发者在面对 AI 变革时更少的焦虑。**

**Dr. Michael Mullarkey**（orient 插件作者）— 机器学习工程师，前心理治疗师 + 社会科学研究者。

## 相关信息

- 项目地址：<https://github.com/DrCatHicks/learning-opportunities>
- 配套技能：<https://github.com/DrCatHicks/learning-goal>
- 核心论文：[The New Developer: AI Skill Threat, Identity Change & Developer Thriving](https://osf.io/preprints/psyarxiv/2gej5_v2)
- 作者 Newsletter：[Fight for the Human](https://www.fightforthehuman.com/)
- 许可证：CC-BY-4.0

---

> 调研时间：2026-05-15 | 学习原理整理：[[ai-coding-learning-science-principles|AI 辅助编码中的学习科学原理]]
