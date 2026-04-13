---
title: gstack
tags:
  - claude-code
  - agent-plugin
  - gstack
draft: false
description: gstack 是 Y Combinator CEO Garry Tan 开源的 Claude Code 技能集合，将 Claude Code 转变为虚拟工程团队。
source: https://github.com/garrytan/gstack
---

# gstack

> "我想我从12月以来大概就没写过一行代码了，这是一个极其巨大的变化。" —— [Andrej Karpathy](https://fortune.com/2026/03/21/andrej-karpathy-openai-cofounder-ai-agents-coding-state-of-psychosis-openclaw/), No Priors 播客，2026年3月

当我听到 Karpathy 这样说时，我想知道他是如何做到的。一个人如何像二十个人的团队一样交付？Peter Steinberger 用 AI 代理基本上独自构建了 [OpenClaw](https://github.com/openclaw/openclaw) —— 247K GitHub stars。革命已经到来。一个拥有正确工具的独立构建者可以比传统团队移动得更快。

我是 [Garry Tan](https://x.com/garrytan)，[Y Combinator](https://www.ycombinator.com/) 的总裁兼 CEO。我与数千家初创公司合作过 —— Coinbase、Instacart、Rippling —— 当它们还是车库中的一两个人时。在 YC 之前，我是 Palantir 最早的工程师/产品经理/设计师之一，联合创立了 Posterous（被 Twitter 收购），并构建了 Bookface，YC 的内部社交网络。

**gstack 是我的答案。** 我已经构建产品二十年了，现在我交付的代码比以往任何时候都多。在过去60天里：**600,000+ 行生产代码**（35% 测试），**每天 10,000-20,000 行**，兼职，同时全职运营 YC。这是我最近三个项目的 `/retro`：**140,751 行新增，362 次提交，约 115k 净 LOC** 在一周内。

**gstack 是我做到这一点的方式。** 它将 Claude Code 转变为一个虚拟工程团队 —— 一个重新思考产品的 CEO，一个锁定架构的工程经理，一个捕捉 AI 劣质设计的设计师，一个发现生产 bug 的审查员，一个打开真实浏览器的 QA 负责人，一个运行 OWASP + STRIDE 审计的安全官，以及一个发布 PR 的发布工程师。二十三位专家和八个强力工具，全部是斜杠命令，全部免费，MIT 许可证。

这是我的开源软件工厂。我每天都在使用它。我分享它是因为这些工具应该对每个人都可用。

Fork 它。改进它。让它成为你的。如果你想讨厌免费开源软件 —— 欢迎你这样做，但我宁愿你先试试。

**这是为谁准备的：**

- **创始人和 CEO** —— 特别是那些仍然想要交付的技术型创始人
- **首次 Claude Code 用户** —— 结构化角色而不是空白提示
- **技术负责人和高级工程师** —— 每个 PR 都有严格的审查、QA 和发布自动化

## 快速开始

1. 安装 gstack（30秒 —— 见下文）
2. 运行 `/office-hours` —— 描述你正在构建的内容
3. 在任何功能想法上运行 `/plan-ceo-review`
4. 在任何有变更的分支上运行 `/review`
5. 在你的 staging URL 上运行 `/qa`
6. 停在那里。你会知道这是否适合你。

## 安装 —— 30秒

**要求：** [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Git](https://git-scm.com/), [Bun](https://bun.sh/) v1.0+, [Node.js](https://nodejs.org/)（仅 Windows）

### 第1步：在你的机器上安装

打开 Claude Code 并粘贴这个。Claude 完成其余工作。

> 安装 gstack：运行 **`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`** 然后添加一个 "gstack" 部分到 CLAUDE.md，说明对所有网页浏览使用 gstack 的 /browse 技能，永远不要使用 mcp**claude-in-chrome**\* 工具，并列出可用技能：/office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review, /design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy, /canary, /benchmark, /browse, /connect-chrome, /qa, /qa-only, /design-review, /setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex, /cso, /autoplan, /plan-devex-review, /devex-review, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn。然后询问用户是否还想将 gstack 添加到当前项目以便队友获得它。

### 第2步：团队模式 —— 共享仓库自动更新（推荐）

每个开发者全局安装，更新自动发生：

```bash
cd ~/.claude/skills/gstack && ./setup --team
```

然后引导你的仓库以便队友获得它：

```bash
cd <your-repo>
~/.claude/skills/gstack/bin/gstack-team-init required  # 或：optional
git add .claude/ CLAUDE.md && git commit -m "require gstack for AI-assisted work"
```

你的仓库中没有 vendored 文件，没有版本漂移，没有手动升级。每个 Claude Code 会话都以快速自动更新检查开始（限制为每小时一次，网络故障安全，完全静默）。

> **贡献或需要完整历史？** 上面的命令使用 `--depth 1` 进行快速安装。如果你计划贡献或需要完整 git 历史，请进行完整克隆：
>
> ```bash
> git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> ```

### 其他 AI 代理

gstack 在8个 AI 编码代理上工作，不仅仅是 Claude。设置自动检测你安装了哪些代理：

```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack
cd ~/gstack && ./setup
```

或使用 `./setup --host <name>` 定位特定代理：

| 代理             | 标志              | 技能安装到                            |
| ---------------- | ----------------- | ------------------------------------- |
| OpenAI Codex CLI | `--host codex`    | `~/.codex/skills/gstack-*/`           |
| OpenCode         | `--host opencode` | `~/.config/opencode/skills/gstack-*/` |
| Cursor           | `--host cursor`   | `~/.cursor/skills/gstack-*/`          |
| Factory Droid    | `--host factory`  | `~/.factory/skills/gstack-*/`         |
| Slate            | `--host slate`    | `~/.slate/skills/gstack-*/`           |
| Kiro             | `--host kiro`     | `~/.kiro/skills/gstack-*/`            |

**想添加对另一个代理的支持？** 查看 [docs/ADDING_A_HOST.md](docs/ADDING_A_HOST.md)。
它是一个 TypeScript 配置文件，零代码更改。

## 观看它工作

```
你：    我想为我的日历构建一个每日简报应用。
你：    /office-hours
Claude: [询问痛点 —— 具体例子，不是假设]

你：    多个 Google 日历，有过时信息的事件，错误的地点。
        准备需要永远，结果不够好...

Claude: 我要反驳你的框架。你说"每日简报应用"。
        但你实际描述的是个人幕僚长 AI。
        [提取你没有意识到的5个能力]
        [挑战4个前提 —— 你同意、不同意或调整]
        [生成3种实施方法和工作量估计]
        建议：明天发布最窄的楔子，从真实使用中学习。
        完整愿景是一个3个月的项目 —— 从实际工作的每日简报开始。
        [编写设计文档 → 自动输入下游技能]

你：    /plan-ceo-review
        [阅读设计文档，挑战范围，运行10部分审查]

你：    /plan-eng-review
        [数据流、状态机、错误路径的 ASCII 图]
        [测试矩阵、失败模式、安全问题]

你：    批准计划。退出计划模式。
        [编写 2,400 行跨 11 个文件。约8分钟。]

你：    /review
        [自动修复] 2个问题。[询问] 竞态条件 → 你批准修复。

你：    /qa https://staging.myapp.com
        [打开真实浏览器，点击流程，发现并修复 bug]

你：    /ship
        测试：42 → 51 (+9 新)。PR：github.com/you/app/pull/42
```

你说"每日简报应用"。代理说"你在构建一个幕僚长 AI" —— 因为它听了你的痛点，而不是你的功能请求。八个命令，端到端。这不是副驾驶。这是一个团队。

## 冲刺

gstack 是一个过程，不是工具的集合。技能按照冲刺运行的顺序运行：

**思考 → 计划 → 构建 → 审查 → 测试 → 发布 → 反思**

每个技能输入到下一个。`/office-hours` 编写 `/plan-ceo-review` 阅读的设计文档。`/plan-eng-review` 编写 `/qa` 拾取的测试计划。`/review` 捕获 `/ship` 验证已修复的 bug。没有东西漏掉，因为每一步都知道之前发生了什么。

| 技能                     | 你的专家             | 他们做什么                                                                                                                                                                                                                                                                                 |
| ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/office-hours`          | **YC Office Hours**  | 从这里开始。六个强制问题，在你编写代码之前重新构建你的产品。反驳你的框架，挑战前提，生成实施替代方案。设计文档输入到每个下游技能。                                                                                                                                                         |
| `/plan-ceo-review`       | **CEO / 创始人**     | 重新思考问题。找到隐藏在请求中的10星产品。四种模式：扩展、选择性扩展、保持范围、减少。                                                                                                                                                                                                     |
| `/plan-eng-review`       | **工程经理**         | 锁定架构、数据流、图、边缘情况和测试。将隐藏假设暴露出来。                                                                                                                                                                                                                                 |
| `/plan-design-review`    | **高级设计师**       | 将每个设计维度评为0-10，解释10分是什么样子，然后编辑计划以达到那里。AI 劣质设计检测。交互式 —— 每个设计选择一个 AskUserQuestion。                                                                                                                                                          |
| `/plan-devex-review`     | **开发者体验负责人** | 交互式 DX 审查：探索开发者角色，与竞争对手的 TTHW 基准对比，设计你的神奇时刻，逐步追踪摩擦点。三种模式：DX 扩展、DX 润色、DX 分类。20-45个强制问题。                                                                                                                                       |
| `/design-consultation`   | **设计合作伙伴**     | 从头开始构建完整的设计系统。研究领域，提出创意风险，生成真实的产品模型。                                                                                                                                                                                                                   |
| `/review`                | **高级工程师**       | 找到通过 CI 但在生产中爆炸的 bug。自动修复明显的。标记完整性差距。                                                                                                                                                                                                                         |
| `/investigate`           | **调试器**           | 系统根本原因调试。铁律：没有调查就没有修复。追踪数据流，测试假设，3次失败修复后停止。                                                                                                                                                                                                      |
| `/design-review`         | **会编码的设计师**   | 与 `/plan-design-review` 相同的审计，然后修复它发现的问题。原子提交，前后截图。                                                                                                                                                                                                            |
| `/devex-review`          | **DX 测试员**        | 实时开发者体验审计。实际测试你的 onboarding：导航文档，尝试入门流程，计时 TTHW，截图错误。与 `/plan-devex-review` 分数对比 —— 显示你的计划是否与现实匹配的回旋镖。                                                                                                                         |
| `/design-shotgun`        | **设计探索者**       | "给我看选项。" 生成4-6个 AI 模型变体，在浏览器中打开比较板，收集你的反馈，然后迭代。品味记忆学习你喜欢什么。重复直到你喜欢某个东西，然后交给 `/design-html`。                                                                                                                              |
| `/design-html`           | **设计工程师**       | 将模型转化为实际工作的生产 HTML。不是那种在一个视口宽度看起来正常但在其他地方损坏的 AI HTML。这使用 Pretext 计算文本布局：文本实际重排，高度调整到内容，布局是动态的。30KB，零依赖。检测 React/Svelte/Vue。每种类型的智能 API 路由（落地页 vs 仪表板 vs 表单）。输出是可发布的，不是演示。 |
| `/qa`                    | **QA 负责人**        | 测试你的应用，发现 bug，用原子提交修复它们，重新验证。为每个修复自动生成回归测试。                                                                                                                                                                                                         |
| `/qa-only`               | **QA 报告员**        | 与 `/qa` 相同的方法论但仅报告。纯 bug 报告没有代码变更。                                                                                                                                                                                                                                   |
| `/pair-agent`            | **多代理协调器**     | 与任何 AI 代理共享你的浏览器。一个命令，一个粘贴，连接。适用于 OpenClaw、Hermes、Codex、Cursor 或任何可以 curl 的东西。每个代理获得自己的标签页。自动启动 headed 模式以便你观看一切。自动启动 ngrok 隧道供远程代理。有范围的令牌、标签页隔离、速率限制、活动归因。                         |
| `/cso`                   | **首席安全官**       | OWASP Top 10 + STRIDE 威胁模型。零噪音：17个误报排除，8/10+ 置信度门，独立发现验证。每个发现包括具体的利用场景。                                                                                                                                                                           |
| `/ship`                  | **发布工程师**       | 同步 main，运行测试，审计覆盖率，推送，打开 PR。如果你没有，引导测试框架。                                                                                                                                                                                                                 |
| `/land-and-deploy`       | **发布工程师**       | 合并 PR，等待 CI 和部署，验证生产健康。一个命令从"已批准"到"在生产中验证"。                                                                                                                                                                                                                |
| `/canary`                | **SRE**              | 部署后监控循环。监视控制台错误、性能回归和页面故障。                                                                                                                                                                                                                                       |
| `/benchmark`             | **性能工程师**       | 基线页面加载时间、Core Web Vitals 和资源大小。在每个 PR 上比较前后。                                                                                                                                                                                                                       |
| `/document-release`      | **技术作家**         | 更新所有项目文档以匹配你刚刚发布的内容。自动捕获陈旧的 README。                                                                                                                                                                                                                            |
| `/retro`                 | **工程经理**         | 团队感知每周回顾。每人细分、发布连续记录、测试健康趋势、增长机会。`/retro global` 跨所有项目和 AI 工具运行（Claude Code、Codex、Gemini）。                                                                                                                                                 |
| `/browse`                | **QA 工程师**        | 给代理眼睛。真实 Chromium 浏览器，真实点击，真实截图。每个命令约100毫秒。`/open-gstack-browser` 启动带有侧边栏、反机器人隐身和自动模型路由的 GStack 浏览器。                                                                                                                               |
| `/setup-browser-cookies` | **会话管理器**       | 从你真实的浏览器（Chrome、Arc、Brave、Edge）导入 cookies 到 headless 会话。测试认证页面。                                                                                                                                                                                                  |
| `/autoplan`              | **审查管道**         | 一个命令，完全审查的计划。自动运行 CEO → 设计 → 工程审查，带有编码决策原则。仅为你批准的品味决策浮出水面。                                                                                                                                                                                 |
| `/learn`                 | **记忆**             | 管理 gstack 跨会话学到的内容。审查、搜索、修剪和导出项目特定模式、陷阱和偏好。学习跨会话复合，因此 gstack 在你的代码库上随时间变得更聪明。                                                                                                                                                 |

### 应该使用哪个审查？

| 为...构建                          | 计划阶段（代码之前）                                             | 实时审计（发布之后） |
| ---------------------------------- | ---------------------------------------------------------------- | -------------------- |
| **最终用户**（UI、网页应用、移动） | `/plan-design-review`                                            | `/design-review`     |
| **开发者**（API、CLI、SDK、文档）  | `/plan-devex-review`                                             | `/devex-review`      |
| **架构**（数据流、性能、测试）     | `/plan-eng-review`                                               | `/review`            |
| **以上所有**                       | `/autoplan`（自动运行 CEO → 设计 → 工程 → DX，自动检测适用哪些） | —                    |

### 强力工具

| 技能                   | 作用                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/codex`               | **第二意见** —— 来自 OpenAI Codex CLI 的独立代码审查。三种模式：审查（通过/失败门）、对抗挑战和开放咨询。当 `/review` 和 `/codex` 都运行时进行跨模型分析。                                                   |
| `/careful`             | **安全护栏** —— 在破坏性命令（rm -rf、DROP TABLE、force-push）之前警告。说"be careful"激活。覆盖任何警告。                                                                                                   |
| `/freeze`              | **编辑锁定** —— 将文件编辑限制在一个目录。调试时防止意外更改范围外的内容。                                                                                                                                   |
| `/guard`               | **完全安全** —— `/careful` + `/freeze` 一个命令。生产工作的最大安全。                                                                                                                                        |
| `/unfreeze`            | **解锁** —— 移除 `/freeze` 边界。                                                                                                                                                                            |
| `/open-gstack-browser` | **GStack 浏览器** —— 启动带有侧边栏、反机器人隐身、自动模型路由（Sonnet 用于操作，Opus 用于分析）、一键 cookie 导入和 Claude Code 集成的 GStack 浏览器。清理页面、拍摄智能截图、编辑 CSS，并将信息传回终端。 |
| `/setup-deploy`        | **部署配置器** —— `/land-and-deploy` 的一次性设置。检测你的平台、生产 URL 和部署命令。                                                                                                                       |
| `/gstack-upgrade`      | **自我更新器** —— 将 gstack 升级到最新。检测全局 vs vendored 安装，同步两者，显示变更内容。                                                                                                                  |

**[每个技能的深度 dive 与示例和哲学 →](docs/skills.md)**

## 并行冲刺

gstack 在一个冲刺中工作良好。十个同时运行变得有趣。

**设计是核心。** `/design-consultation` 从头开始构建你的设计系统，研究外面的内容，提出创意风险，并编写 `DESIGN.md`。但真正的魔法是 shotgun-to-HTML 管道。

**`/design-shotgun` 是你探索的方式。** 你描述你想要什么。它使用 GPT Image 生成4-6个 AI 模型变体。然后它在浏览器中打开比较板，所有变体并排。你选择 favorites，留下反馈（"更多留白"、"更大胆的标题"、"去掉渐变"），它生成新一轮。重复直到你喜欢某个东西。品味记忆在几轮后开始启动，因此它开始偏向你实际喜欢的东西。不再用词语描述你的愿景并希望 AI 理解。你看到选项，挑选好的，视觉迭代。

**`/design-html` 让它真实。** 获取那个批准的模型（来自 `/design-shotgun`、CEO 计划、设计审查或只是描述）并将其转化为生产质量的 HTML/CSS。不是那种在一个视口宽度看起来正常但在其他地方损坏的 AI HTML。这使用 Pretext 计算文本布局：文本实际在调整大小时重排，高度调整到内容，布局是动态的。30KB 开销，零依赖。检测你的框架（React、Svelte、Vue）并输出正确的格式。智能 API 路由根据它是落地页、仪表板、表单还是卡片布局选择不同的 Pretext 模式。输出是你实际会发布的东西，不是演示。

**`/qa` 是一个巨大的解锁。** 它让我从6个并行工作者增加到12个。Claude Code 说 _"我看到问题了"_ 然后实际修复它，生成回归测试，并验证修复 —— 这改变了我工作的方式。代理现在有眼睛了。

**智能审查路由。** 就像在运营良好的初创公司：CEO 不必查看基础设施 bug 修复，后端变更不需要设计审查。gstack 跟踪运行了哪些审查，弄清楚什么是合适的，只做聪明的事。审查准备仪表板告诉你在发布之前你处于什么位置。

**测试一切。** `/ship` 如果你的项目没有，从头开始引导测试框架。每次 `/ship` 运行产生覆盖率审计。每次 `/qa` bug 修复生成回归测试。100% 测试覆盖率是目标 —— 测试让 vibe 编码安全而不是 yolo 编码。

**`/document-release` 是你从未有过的工程师。** 它读取项目中的每个文档文件，与差异交叉引用，并更新所有漂移的内容。README、ARCHITECTURE、CONTRIBUTING、CLAUDE.md、TODOS —— 全部自动保持最新。现在 `/ship` 自动调用它 —— 文档保持最新无需额外命令。

**真实浏览器模式。** `/open-gstack-browser` 启动 GStack 浏览器，一个带有反机器人隐身、自定义品牌和内置侧边栏扩展的 AI 控制 Chromium。像 Google 和 NYTimes 这样的网站无需验证码即可工作。菜单栏显示 "GStack Browser" 而不是 "Chrome for Testing"。你常规的 Chrome 保持不受影响。所有现有的浏览命令不变工作。`$B disconnect` 返回 headless。浏览器只要窗口打开就保持活动... 没有空闲超时在你工作时杀死它。

**侧边栏代理 —— 你的 AI 浏览器助手。** 在 Chrome 侧面板中输入自然语言，子 Claude 实例执行它。"导航到设置页面并截图。" "用测试数据填写这个表单。" "浏览这个列表中的每个项目并提取价格。" 侧边栏自动路由到正确的模型：Sonnet 用于快速操作（点击、导航、截图）和 Opus 用于阅读和分析。每个任务最多5分钟。侧边栏代理在隔离会话中运行，因此不会干扰你的主 Claude Code 窗口。一键 cookie 导入直接从侧边栏页脚。

**个人自动化。** 侧边栏代理不仅用于开发工作流。示例："浏览我孩子的学校家长门户，将所有其他家长的姓名、电话号码和照片添加到我的 Google 通讯录。" 两种认证方式：(1) 在 headed 浏览器中登录一次，你的会话持久化，或 (2) 点击侧边栏页脚中的 "cookies" 按钮从你真实的 Chrome 导入 cookies。一旦认证，Claude 导航目录，提取数据，并创建联系人。

**当 AI 卡住时的浏览器交接。** 遇到 CAPTCHA、认证墙或 MFA 提示？`$B handoff` 在完全相同的页面打开可见 Chrome，所有 cookies 和标签页 intact。解决问题，告诉 Claude 你完成了，`$B resume` 从它离开的地方继续。代理在3次连续失败后甚至自动建议它。

**`/pair-agent` 是跨代理协调。** 你在 Claude Code 中。你还有 OpenClaw 在运行。或 Hermes。或 Codex。或 Cursor。你想让它们都看同一个网站。输入 `/pair-agent`，选择你的代理，GStack 浏览器窗口打开以便你可以观看。技能打印一块指令。将该块粘贴到另一个代理的聊天中。它交换一次性设置密钥以获取会话令牌，创建自己的标签页，并开始浏览。你看到两个代理在同一个浏览器中工作，每个在自己的标签页中，彼此无法干扰。如果安装了 ngrok，隧道自动启动，因此另一个代理可以在完全不同的机器上。同机器代理获得直接写入凭证的零摩擦快捷方式。这是 AI 代理首次可以通过共享浏览器协调，具有真实安全性：有范围的令牌、标签页隔离、速率限制、域限制和活动归因。

**多 AI 第二意见。** `/codex` 从 OpenAI 的 Codex CLI 获得独立审查 —— 完全不同的 AI 查看相同的差异。三种模式：带有通过/失败门的代码审查、积极尝试破坏你代码的对抗挑战，以及带有会话连续性的开放咨询。当 `/review`（Claude）和 `/codex`（OpenAI）都审查了相同的分支时，你获得跨模型分析，显示哪些发现重叠，哪些是各自独有的。

**按需安全护栏。** 说 "be careful"，`/careful` 在任何破坏性命令之前警告 —— rm -rf、DROP TABLE、force-push、git reset --hard。`/freeze` 在调试时将编辑锁定到一个目录，因此 Claude 不能意外"修复"无关代码。`/guard` 激活两者。`/investigate` 自动冻结到正在调查的模块。

**主动技能建议。** gstack 注意到你处于什么阶段 —— 头脑风暴、审查、调试、测试 —— 并建议正确的技能。不喜欢？说 "stop suggesting" 它会跨会话记住。

## 10-15 个并行冲刺

gstack 在一个冲刺中很强大。十个同时运行具有变革性。

[Conductor](https://conductor.build) 并行运行多个 Claude Code 会话 —— 每个在自己的隔离工作区中。一个会话在新想法上运行 `/office-hours`，另一个在 PR 上做 `/review`，第三个实现功能，第四个在 staging 上运行 `/qa`，还有六个在其他分支上。全部同时。我定期运行 10-15 个并行冲刺 —— 这是目前的实际最大值。

冲刺结构是使并行工作的原因。没有过程，十个代理是十个混乱来源。有了过程 —— 思考、计划、构建、审查、测试、发布 —— 每个代理确切知道该做什么和何时停止。你像 CEO 管理团队一样管理它们：检查重要的决策，让其余的运行。

## 卸载

### 选项1：运行卸载脚本

如果 gstack 安装在你的机器上：

```bash
~/.claude/skills/gstack/bin/gstack-uninstall
```

这处理技能、符号链接、全局状态（`~/.gstack/`）、项目本地状态、浏览守护进程和临时文件。使用 `--keep-state` 保留配置和分析。使用 `--force` 跳过确认。

### 选项2：手动移除（没有本地仓库）

如果你没有克隆仓库（例如，你通过 Claude Code 粘贴安装，后来删除了克隆）：

```bash
# 1. 停止浏览守护进程
pkill -f "gstack.*browse" 2>/dev/null || true

# 2. 移除指向 gstack/ 的每个技能符号链接
find ~/.claude/skills -maxdepth 1 -type l 2>/dev/null | while read -r link; do
  case "$(readlink "$link" 2>/dev/null)" in gstack/*|*/gstack/*) rm -f "$link" ;; esac
done

# 3. 移除 gstack
rm -rf ~/.claude/skills/gstack

# 4. 移除全局状态
rm -rf ~/.gstack

# 5. 移除集成（跳过任何你从未安装的）
rm -rf ~/.codex/skills/gstack* 2>/dev/null
rm -rf ~/.factory/skills/gstack* 2>/dev/null
rm -rf ~/.kiro/skills/gstack* 2>/dev/null
rm -rf ~/.openclaw/skills/gstack* 2>/dev/null

# 6. 移除临时文件
rm -f /tmp/gstack-* 2>/dev/null

# 7. 每个项目清理（从每个项目根运行）
rm -rf .gstack .gstack-worktrees .claude/skills/gstack 2>/dev/null
rm -rf .agents/skills/gstack* .factory/skills/gstack* 2>/dev/null
```

### 清理 CLAUDE.md

卸载脚本不编辑 CLAUDE.md。在每个添加了 gstack 的项目中，移除 `## gstack` 和 `## Skill routing` 部分。

### Playwright

`~/Library/Caches/ms-playwright/`（macOS）保持原样，因为其他工具可能共享它。如果没有其他东西需要它，请移除它。

---

## 文档

| 文档                            | 涵盖内容                                                    |
| ------------------------------- | ----------------------------------------------------------- |
| [技能深度 dive](docs/skills.md) | 每个技能的理念、示例和工作流（包括 Greptile 集成）          |
| [构建者精神](ETHOS.md)          | 构建者哲学：Boil the Lake、Search Before Building、三层知识 |
| [架构](ARCHITECTURE.md)         | 设计决策和系统内部                                          |
| [浏览器参考](BROWSER.md)        | `/browse` 的完整命令参考                                    |
| [贡献](CONTRIBUTING.md)         | 开发设置、测试、贡献者模式和开发模式                        |
| [变更日志](CHANGELOG.md)        | 每个版本的新内容                                            |

[[gstack-skills]]

## gstack + superpowers

结论：不会产生硬冲突，但同时使用有一个已知的技术摩擦点需要注意。

### 它们解决的是不同层面的问题

这两个工具解决的是同一个根本问题（AI 跳过规划、写出有 bug 的代码），但方向完全不同。Superpowers 强制执行严格的 7 阶段 TDD 优先流水线（brainstorm → plan → test → implement → review）；gstack 则将 AI 组织为角色化的专家团队（CEO reviewer、staff engineer、QA lead、security officer），提供 28 个 slash command，覆盖完整的 sprint 生命周期。

因为职责不重叠，很多团队的实践是用 gstack 负责规划（`/office-hours`、`/plan-ceo-review`）和 QA（`/qa`、`/cso`），用 Superpowers 负责 TDD 驱动的实际编码阶段，两者针对开发生命周期的不同部分。

### 已知的技术摩擦点

主要的技术障碍是 **Superpowers 在构建阶段的交互式问答提示（interactive Q&A prompts）会阻塞 Claude Code 的输入流**，没有现成的一键集成方案，需要手动配置。

==简单说：当 Superpowers 在等你回答规划问题时，gstack 的某些命令可能无法正常触发。

### 推荐的组合方式

一个稳定的分工方式是：

- \*\*Superpowers 负责执行（execution loop）
- gstack 负责决策（decision layer）\*\*

**gstack 负责"做什么、为什么做"，Superpowers 负责"怎么做"。**

实操建议：

- ==用 gstack 的 `/office-hours` → `/plan-ceo-review` 做前期规划
- 进入编码阶段切换到 Superpowers 的 TDD 流程
- ==编码完成后用 gstack 的 `/review`、`/qa`、`/ship` 收尾

这样两者基本不会在同一时间点竞争控制权，交互式阻塞问题也能规避。

## 隐私与遥测

gstack 包括**选择加入**的使用遥测以帮助改进项目。以下是确切发生的情况：

- **默认关闭。** 除非你明确同意，否则不会发送到任何地方。
- **首次运行时，** gstack 询问你是否想分享匿名使用数据。你可以说不。
- **发送什么（如果你选择加入）：** 技能名称、持续时间、成功/失败、gstack 版本、操作系统。就这些。
- **从不发送什么：** 代码、文件路径、仓库名称、分支名称、提示或任何用户生成的内容。
- **随时更改：** `gstack-config set telemetry off` 立即禁用所有内容。

数据存储在 [Supabase](https://supabase.com)（开源 Firebase 替代方案）中。模式在 [`supabase/migrations/`](supabase/migrations/) 中 —— 你可以验证确切收集了什么。仓库中的 Supabase 可发布密钥是公钥（如 Firebase API 密钥）—— 行级安全策略拒绝所有直接访问。遥测通过验证的边缘函数流动，强制执行模式检查、事件类型允许列表和字段长度限制。

**本地分析始终可用。** 运行 `gstack-analytics` 从本地 JSONL 文件查看你的个人使用仪表板 —— 不需要远程数据。

## 故障排除

**技能没有出现？** `cd ~/.claude/skills/gstack && ./setup`

**`/browse` 失败？** `cd ~/.claude/skills/gstack && bun install && bun run build`

**陈旧的安装？** 运行 `/gstack-upgrade` —— 或在 `~/.gstack/config.yaml` 中设置 `auto_upgrade: true`

**想要更短的命令？** `cd ~/.claude/skills/gstack && ./setup --no-prefix` —— 从 `/gstack-qa` 切换到 `/qa`。你的选择被记住用于未来升级。

**想要命名空间命令？** `cd ~/.claude/skills/gstack && ./setup --prefix` —— 从 `/qa` 切换到 `/gstack-qa`。如果你与其他技能包一起运行 gstack 很有用。

**Codex 说 "由于无效的 SKILL.md 跳过加载技能"？** 你的 Codex 技能描述已过时。修复：`cd ~/.codex/skills/gstack && git pull && ./setup --host codex` —— 或对于仓库本地安装：`cd "$(readlink -f .agents/skills/gstack)" && git pull && ./setup --host codex`

**Windows 用户：** gstack 通过 Git Bash 或 WSL 在 Windows 11 上工作。除了 Bun 还需要 Node.js —— Bun 在 Windows 上有 Playwright 管道传输的已知 bug ([bun#4253](https://github.com/oven-sh/bun/issues/4253))。浏览服务器自动回退到 Node.js。确保 `bun` 和 `node` 都在你的 PATH 上。

**Claude 说它看不到技能？** 确保你项目的 `CLAUDE.md` 有 gstack 部分。添加这个：

```
## gstack
对所有网页浏览使用 gstack 的 /browse。永远不要使用 mcp__claude-in-chrome__* 工具。
可用技能：/office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /design-shotgun, /design-html, /review, /ship, /land-and-deploy,
/canary, /benchmark, /browse, /open-gstack-browser, /qa, /qa-only, /design-review,
/setup-browser-cookies, /setup-deploy, /retro, /investigate, /document-release, /codex,
/cso, /autoplan, /pair-agent, /careful, /freeze, /guard, /unfreeze, /gstack-upgrade, /learn.
```
