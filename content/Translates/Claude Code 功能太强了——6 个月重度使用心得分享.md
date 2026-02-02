---
title: Claude Code 功能太强了——6 个月重度使用心得分享
source: https://www.reddit.com/r/ClaudeCode/comments/1oivs81/claude_code_is_a_beast_tips_from_6_months_of/
author:
  - "[[JokeGold5455]]"
published: 2025-10-29
created: 2025-11-03
description:
tags:
  - clippings
  - claude
---

编辑（最终版？）：我咬咬牙，花了一个下午为你们搭建了一个 github 代码仓库。刚刚发了一个帖子，里面有一些额外信息，你们可以看这里，或者直接去源地址：

**🎯 Repository:** [https://github.com/diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase)  
🎯 代码仓库：https://github.com/diet103/claude-code-infrastructure-showcase

*Quick tip from a fellow lazy person: You can throw this book of a post into one of the many text-to-speech AI services like* [*ElevenLabs Reader*](https://elevenlabs.io/text-reader) *or* [*Natural Reader*](https://www.naturalreaders.com/online/) *and have it read the post for you* :)  

#  免责声明


大约六个月前我发了一篇帖子，分享了我使用 Claude Code 一周深度体验后的感受。现在已经深度使用了大约六个月，我想和大家分享更多的技巧、窍门和一些碎碎念。我可能有点过头了，所以系好安全带，泡杯咖啡，坐在马桶上或者做任何你刷 reddit 时会做的事情。


我想在帖子开头声明一下：这篇帖子中的所有内容仅仅是我分享目前对我来说最有效的设置，不应该被当作金科玉律或唯一正确的做法。希望能启发你改进你的 AI 智能编程设置和工作流程。我只是个普通人，这只是我的个人观点，兄弟。


另外，我用的是 20x Max 套餐，所以你的体验可能会有所不同。如果你在寻找随意编程的技巧，你应该去别处看看。如果你想从 Claude Code 中获得最佳效果，那么你应该与它协作：规划、审查、迭代、探索不同的方法等等。

# 快速概览


在 6 个月的时间里将 Claude 代码推向极限（独自重写 30 万行代码）后，这是我构建的系统：

- Skills that actually auto-activate when needed  
	真正能在需要时自动激活的技能
- Dev docs workflow that prevents Claude from losing the plot  
	防止 Claude 偏离主线的开发文档工作流程
- PM2 + hooks for zero-errors-left-behind  
	PM2 + 钩子，确保零错误遗漏
- Army of specialized agents for reviews, testing, and planning Let's get into it.  
	专门负责评审、测试和规划的专业代理团队 让我们深入了解一下。

# 背景


我是一名软件工程师，在过去七年左右的时间里一直在开发生产 web applications。我全心全意地拥抱了 AI 浪潮。我并不太担心 AI 会很快取代我的工作，因为它是我用来增强自己能力的工具。在这个过程中，我一直在构建许多新功能，并与 Claude 和 GPT-5 Thinking 一起制作各种新的提案演示，将新的 AI 系统集成到我们的生产应用中。这些项目在我将 AI 集成到工作流程之前，我连考虑的时间都没有。通过这一切，我为自己提供了很好的工作保障，并成为了公司的 AI 专家，因为其他人在如何将 AI 集成到日常工作中方面大约落后了一年左右。

有了新的信心后，我提议对我们工作中使用的一个内部工具网络应用进行相当大规模的重新设计/重构。这是一个相当粗糙的大学生项目，是从我作为实习生时开发的另一个项目中分叉出来的（大约 7 年前创建，4 年前分叉）。这可能有点过于雄心勃勃了，因为为了向利益相关者推销这个想法，我同意在两到三个月内完成这个相当大规模项目（约 10 万行代码）的自顶向下重新设计...全部由我一个人完成。我知道进入这个项目后，即使有 CC 的帮助，我也必须投入额外的时间来完成这项工作。但在内心深处，我知道这会是个成功的项目，能够自动化几个手动流程，为公司很多人节省大量时间。


现在已经过去六个月了...是的，我可能不应该同意这个时间线。为了完成这个项目，我测试了 Claude 和我自己理智的极限。我完全重写了旧的前端，因为所有东西都严重过时了，我想玩一玩最新最棒的技术。我说的是 React 16 JS → React 19 TypeScript，React Query v2 → TanStack Query v5，React Router v4 w/ hashrouter → TanStack Router w/ 基于文件的路由，Material UI v4 → MUI v7，全部严格遵循最佳实践。项目现在大约有 30-40 万行代码，我的预期寿命大概缩短了 5 年。终于准备好进行测试了，我对结果非常满意。


这曾经是一个有着无法克服的技术债务、零测试覆盖率、糟糕透顶的开发体验（测试功能简直是噩梦）以及各种乱七八糟问题的项目。我解决了所有这些问题，实现了不错的测试覆盖率、可管理的技术债务，并且实现了一个用于生成测试数据的命令行工具以及一个用于在前端测试不同功能的开发模式。在这段时间里，我了解了 CC 的能力以及对它的期望。

# 关于质量和一致性的说明

我注意到在论坛和讨论中有一个反复出现的主题——人们对使用限制感到沮丧，并担心输出质量随时间下降。我想先声明：我并不是要忽视这些体验或声称这只是"使用方法不当"的问题。每个人的使用场景和背景都不同，合理的担忧应该被倾听。


话虽如此，我想分享一下对我有效的方法。根据我的经验，CC 的输出质量在过去几个月里实际上有了显著提升，我相信这主要归功于我一直在不断完善的工作流程。我希望如果你能从我的系统中汲取哪怕一点灵感，并将其融入到你的 CC 工作流程中，你就能给它一个更好的机会来产生你满意的高质量输出。

现在，我们得实事求是——绝对有些时候 Claude 完全搞砸了，产出的代码质量不佳。这可能有多种原因。首先，AI 模型是随机性的，这意味着同样的输入可能得到截然不同的输出。有时候随机性就是不站在你这边，你会得到质量确实很差的输出，这并不是你的错。其他时候，这与提示词的结构有关。输入措辞的细微差别可能导致输出结果的显著差异，因为模型会相当字面化地理解内容。如果你用词不当或措辞模糊，可能会导致结果质量大打折扣。

# 有时你就是需要亲自出马


听着，AI 很了不起，但它不是魔法。在某些问题上，模式识别和人类直觉就是更胜一筹。如果你已经花了 30 分钟看着 Claude 在某个问题上挣扎，而你自己 2 分钟就能搞定，那就自己动手吧。这没什么丢人的。把这想象成教人骑自行车——有时候你只需要稳住车把一会儿，然后再松手让他们继续。


我发现这种情况特别容易出现在逻辑谜题或需要现实世界常识的问题上。AI 可以暴力破解很多东西，但有时人类就是能更快地"理解"。不要因为固执或某种错误的"AI 应该能做所有事"的想法而浪费时间。直接介入，解决问题，然后继续前进。


我也有过很多糟糕的提示经历，这通常发生在一天快结束的时候，我变得懒散，没有在提示上投入太多精力。结果真的很明显。所以下次当你遇到这种问题，觉得输出质量变差了，认为是 Anthropic 暗中削弱了 Claude 时，我建议你退一步，反思一下自己是如何进行提示的。


**经常重新提示。** 你可以按 **两次 Esc 键** 调出之前的提示，选择一个来分支。当你带着对不想要什么的认识重新给出同样的提示时，你会惊讶于能获得多么好的结果。总之，输出质量似乎变差可能有很多原因，自我反思并考虑如何给 AI 最好的机会来获得你想要的输出是很好的做法。


正如某个聪明人在某个地方可能说过的："不要问 Claude 能为你做什么，要问你能为 Claude 提供什么样的上下文" ~ 聪明人


# 我的系统


过去 6 个月里，我对与 CC 相关的工作流程进行了大量调整，在我看来效果非常不错。

# 技能自动激活系统（游戏规则改变者！）


这个功能值得单独说明，因为它彻底改变了我与 Claude 代码协作的方式。

# 问题


所以 Anthropic 发布了这个技能功能，我想着"这看起来太棒了！" 拥有这些便携的、可重复使用的指南让 Claude 可以参考，对于在我庞大的代码库中保持一致性来说听起来完美。我花了大量时间和 Claude 一起编写了前端开发、后端开发、数据库操作、工作流管理等方面的全面技能。我们说的是数千行的最佳实践、模式和示例。


然后...什么都没有。Claude 就是不使用它们。我明明使用了技能描述中的确切关键词。什么都没有。我处理那些应该触发技能的文件。什么都没有。这非常令人沮丧，因为我能看到潜力，但这些技能就像昂贵的装饰品一样静静地放在那里。

# "恍然大悟"的时刻

That's when I had the idea of using **hooks**. If Claude won't automatically use skills, what if I built a system that MAKES it check for relevant skills before doing anything?  
这时我想到了使用钩子的方法。如果 Claude 不会自动使用技能，那么如果我构建一个系统，让它在做任何事情之前都必须检查相关技能呢？

So I dove into Claude Code's hook system and built a multi-layered auto-activation architecture with TypeScript hooks. And it actually works!  
于是我深入研究了 Claude Code 的钩子系统，并使用 TypeScript 钩子构建了一个多层自动激活架构。而且它真的有效！

# 工作原理

I created two main hooks:  
我创建了两个主要的钩子：

**1\. UserPromptSubmit Hook** (runs BEFORE Claude sees your message):  
1\. UserPromptSubmit Hook（在 Claude 看到你的消息之前运行）：

- Analyzes your prompt for keywords and intent patterns  
	分析你的提示中的关键词和意图模式
- Checks which skills might be relevant  
	检查哪些技能可能相关
- Injects a formatted reminder into Claude's context  
	向 Claude 的上下文注入格式化提醒
- Now when I ask "how does the layout system work?" Claude sees a big "🎯 SKILL ACTIVATION CHECK - Use project-catalog-developer skill" (project catalog is a large complex data grid based feature on my front end) before even reading my question  
	现在当我问"布局系统是如何工作的？"时，Claude 甚至在阅读我的问题之前就会看到一个大大的"🎯 技能激活检查 - 使用项目目录开发者技能"（项目目录是我前端的一个基于大型复杂数据网格的功能）

**2\. Stop Event Hook** (runs AFTER Claude finishes responding):  
2\. 停止事件钩子（在 Claude 完成响应后运行）：

- Analyzes which files were edited  
	分析哪些文件被编辑了
- Checks for risky patterns (try-catch blocks, database operations, async functions)  
	检查风险模式（try-catch 块、数据库操作、异步函数）
- Displays a gentle self-check reminder  
	显示温和的自检提醒
- "Did you add error handling? Are Prisma operations using the repository pattern?"  
	"你添加错误处理了吗？Prisma 操作是否使用了代码仓库模式？"
- Non-blocking, just keeps Claude aware without being annoying  
	非阻塞式，只是让 Claude 保持察觉而不会让人感到烦恼

# skill-rules.json 配置

I created a central configuration file that defines every skill with:  
我创建了一个中央配置文件，定义了每个技能：

- **Keywords**: Explicit topic matches ("layout", "workflow", "database")  
	关键词：明确的主题匹配（"布局"、"工作流程"、"数据库"）
- **Intent patterns**: Regex to catch actions ("(create|add).\*?(feature|route)")  
	意图模式：使用正则表达式捕获操作("(create|add).\*?(feature|route)")
- **File path triggers**: Activates based on what file you're editing  
	文件路径触发器：基于您正在编辑的文件激活
- **Content triggers**: Activates if file contains specific patterns (Prisma imports, controllers, etc.)  
	内容触发器：当文件包含特定模式时激活（Prisma 导入、控制器等）

Example snippet:   示例代码片段：

{
  "backend-dev-guidelines": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "promptTriggers": {
      "keywords": \["backend", "controller", "service", "API", "endpoint"\],
      "intentPatterns": \[
        "(create|add).\*?(route|endpoint|controller)",
        "(how to|best practice).\*?(backend|API)"
      \]
    },
    "fileTriggers": {
      "pathPatterns": \["backend/src/\*\*/\*.ts"\],
      "contentPatterns": \["router\\\\.", "export.\*Controller"\]
    }
  }
}

# 结果

Now when I work on backend code, Claude automatically:  
现在当我处理后端代码时，Claude 会自动：

1. Sees the skill suggestion before reading my prompt  
	在阅读我的提示前就看到了技能建议
2. Loads the relevant guidelines  
	加载了相关指导原则
3. Actually follows the patterns consistently  
	实际上始终如一地遵循了这些模式
4. Self-checks at the end via gentle reminders  
	通过温和提醒进行最后的自我检查

**The difference is night and day.** No more inconsistent code. No more "wait, Claude used the old pattern again." No more manually telling it to check the guidelines every single time.  
差别简直是天壤之别。再也没有不一致的代码了。再也不会出现"等等，Claude 又用了旧的模式"的情况。再也不用每次都手动告诉它去检查指导原则了。

# 遵循 Anthropic 最佳实践（艰难的道路）


在让自动激活功能正常工作后，我深入研究并找到了 Anthropic 的官方最佳实践文档。结果发现我做错了，因为他们建议将主要的 SKILL.md 文件保持在 500 行以下，并使用渐进式披露配合资源文件。


糟糕。我的 frontend-dev-guidelines 技能有 1500 多行。而且我还有几个其他技能超过 1000 行。这些庞大的文件完全违背了技能的整个目的（只加载你需要的内容）。


所以我重新整理了所有内容：

- **frontend-dev-guidelines**: 398-line main file + 10 resource files  
	frontend-dev-guidelines：398 行主文件 + 10 个资源文件
- **backend-dev-guidelines**: 304-line main file + 11 resource files  
	backend-dev-guidelines：304 行主文件 + 11 个资源文件


现在 Claude 首先加载轻量级的主文件，只有在实际需要时才调取详细的资源文件。大多数查询的 token 效率提升了 40-60%。

# 我创建的技能

Here's my current skill lineup:  
以下是我目前的技能组合：

**Guidelines & Best Practices:  
指导原则和最佳实践：**

- `backend-dev-guidelines` - Routes → Controllers → Services → Repositories  
	`backend-dev-guidelines` - 路由 → 控制器 → 服务 → 仓储
- `frontend-dev-guidelines` - React 19, MUI v7, TanStack Query/Router patterns  
	`frontend-dev-guidelines` - React 19、MUI v7、TanStack 查询/路由器模式
- `skill-developer` - Meta-skill for creating more skills  
	`skill-developer` - 创造更多技能的元技能

**Domain-Specific:  特定领域：**

- `workflow-developer` - Complex workflow engine patterns  
	`workflow-developer` - 复杂工作流引擎模式
- `notification-developer` - Email/notification system  
	`notification-developer` - 邮件/通知系统
- `database-verification` - Prevent column name errors (this one is a guardrail that actually blocks edits!)  
	`database-verification` - 防止列名错误（这是一个实际阻止编辑的保护措施！）
- `project-catalog-developer` - DataGrid layout system  
	`project-catalog-developer` - DataGrid 布局系统

All of these automatically activate based on what I'm working on. It's like having a senior dev who actually remembers all the patterns looking over Claude's shoulder.  
所有这些都会根据我正在处理的内容自动激活。就像有一个真正记住所有模式的高级开发人员在 Claude 身边指导一样。

# 为什么这很重要

技能+钩子之前：

- Claude would use old patterns even though I documented new ones  
	Claude 会使用旧的模式，即使我已经记录了新的模式
- Had to manually tell Claude to check BEST\_PRACTICES.md every time  
	每次都得手动告诉 Claude 去检查 BEST\_PRACTICES.md 文件
- Inconsistent code across the 300k+ LOC codebase  
	30 万+行代码库中代码不一致
- Spent too much time fixing Claude's "creative interpretations"  
	花了太多时间修复 Claude 的"创意解读"

After skills + hooks:  
使用技能+钩子后：

- Consistent patterns automatically enforced  
	自动强制执行一致的模式
- Claude self-corrects before I even see the code  
	Claude 在我看到代码之前就会自我纠正
- Can trust that guidelines are being followed  
	可以信任指导原则得到遵循
- Way less time spent on reviews and fixes  
	在审查和修复上花费的时间大大减少

If you're working on a large codebase with established patterns, I cannot recommend this system enough. The initial setup took a couple of days to get right, but it's paid for itself ten times over.  
如果你正在处理一个具有既定模式的大型代码库，我强烈推荐这个系统。初始设置需要花费几天时间才能搞对，但它的回报已经超过了投入的十倍。

# CLAUDE.md 和文档演进


在我 6 个月前写的一篇帖子中，我有一个关于规则是你最好朋友的章节，我仍然坚持这个观点。但我的 CLAUDE.md 文件很快就变得失控了，试图做太多事情。我还有一个巨大的 BEST\_PRACTICES.md 文件（1400 多行），Claude 有时会读它，有时又完全忽略它。


所以我花了一个下午和 Claude 一起，把所有内容整合并重新组织成了一个新系统。以下是发生的变化：

# 哪些内容已迁移到 Skills


之前，BEST\_PRACTICES.md 包含：

- TypeScript standards   TypeScript 标准
- React patterns (hooks, components, suspense)  
	React 模式（hooks、组件、suspense）
- Backend API patterns (routes, controllers, services)  
	后端 API 模式（路由、控制器、服务）
- Error handling (Sentry integration)  
	错误处理（Sentry 集成）
- Database patterns (Prisma usage)  
	数据库模式（Prisma 的使用）
- Testing guidelines   测试指南
- Performance optimization  
	性能优化


现在所有这些都已经集成到技能里了，自动激活钩子确保 Claude 真的会用它们。再也不用指望 Claude 记得去看 `BEST\_PRACTICES.md` 了。

# 什么内容保留在 CLAUDE.md

现在 CLAUDE.md 专注于项目相关信息（只有大约 200 行）：

- 快捷命令（ `pnpm pm2:start` ， `pnpm build` ，等等）
- 特定服务配置
- 任务管理工作流（开发文档系统）
- 测试需要身份验证的路由
- 工作流演练模式
- 浏览器工具配置

# 新结构

```

Root CLAUDE.md (100 lines)
├── Critical universal rules
├── Points to repo-specific claude.md files
└── References skills for detailed guidelines

Each Repo's claude.md (50-100 lines)
├── Quick Start section pointing to:
│   ├── PROJECT\_KNOWLEDGE.md - Architecture & integration
│   ├── TROUBLESHOOTING.md - Common issues
│   └── Auto-generated API docs
└── Repo-specific quirks and commands
```


神奇之处在于：**Skills 负责所有“如何写代码”的指导，而 CLAUDE.md 负责“这个具体项目如何运作”**。

关注点分离，赢麻了。

# 开发文档系统

This system, out of everything (besides skills), I think has made the most impact on the results I'm getting out of CC. Claude is like an extremely confident junior dev with extreme amnesia, losing track of what they're doing easily. This system is aimed at solving those shortcomings.  
在所有系统中（除了技能以外），我认为这个系统对我在 CC 上获得的结果影响最大。Claude 就像一个极度自信但健忘的初级开发者，很容易忘记自己在做什么。这个系统就是为了解决这些缺点而设计的。


我在 CLAUDE.md 里的开发文档部分：

### Starting Large Tasks

When exiting plan mode with an accepted plan: 1.\*\*Create Task Directory\*\*:
mkdir -p ~/git/project/dev/active/\[task-name\]/

2.\*\*Create Documents\*\*:

- \`\[task-name\]-plan.md\` - The accepted plan
- \`\[task-name\]-context.md\` - Key files, decisions
- \`\[task-name\]-tasks.md\` - Checklist of work

3.\*\*Update Regularly\*\*: Mark tasks complete immediately

### Continuing Tasks

- Check \`/dev/active/\` for existing tasks
- Read all three files before proceeding
- Update "Last Updated" timestamps


这些文档会在每个功能或大型任务时都创建。在使用这个系统之前，我经常突然发现 Claude 已经偏离了主题，我们已经不再实现 30 分钟前规划好的内容了，因为不知怎么就跑偏了。

# 我的规划流程


我的流程从规划开始。规划为王。如果你在让 Claude 实现某个功能之前，至少没有用规划模式，你肯定会吃苦头，懂了吗？你不会让一个建筑工人直接跑到你家就开始乱加盖，而不是先画好图纸吧。


当我开始规划一个功能时，我会把它放到规划模式里，尽管最后我还是会让 Claude 把计划写到一个 markdown 文件里。我不确定把它放到规划模式是不是必须的，但对我来说，规划模式在研究你的代码库、获取所有正确的上下文以便制定计划时，效果会更好。


我创建了一个 `strategic-plan-architect` 子代理，基本上就是个规划怪兽。它：

- 高效收集上下文
- 分析项目结构
- ==创建包含执行摘要、阶段、任务、风险、成功指标和时间线的全面结构化计划
- ==自动生成三个文件：计划、上下文和任务清单


但我觉得很烦的是你看不到 agent 的输出，更烦的是如果你对计划说“不”，它就直接把 agent 干掉了，而不是继续规划。所以我还创建了一个自定义斜杠命令（ `/dev-docs` ），用同样的提示在主 CC 实例上使用。

一旦 Claude 给出那个漂亮的计划，我会花时间彻底审查。这一步真的很重要。花点时间去理解它，你会惊讶于你能多频繁地发现一些低级错误，或者 Claude 对请求或任务中的某个关键部分理解错了。

通常情况下，退出计划模式后我的上下文只剩下 15% 或更少。但没关系，因为我们会把所有需要重新开始的内容都放进开发文档里。Claude 通常喜欢直接冲进去开干，所以我会立刻按下 ESC 键中断，然后运行我的 `/dev-docs` 斜杠命令。这个命令会用批准的计划创建所有三个文件，有时候如果上下文还够，还会多做点研究来补充空白。

等我完成这些之后，基本上就可以让 Claude 完整实现这个功能了，而且不会迷失方向或忘记自己在做什么，即使自动压缩也没问题。我只需要时不时提醒 Claude 更新任务列表，以及把相关的上下文写进 context 文件。当当前会话里的上下文快用完时，我只需运行我的斜杠命令 `/update-dev-docs` 。Claude 会记录所有相关的上下文（包括下一步），还会标记已完成的任务或添加新任务，然后我再压缩对话。接下来在新会话里，我只需要说一句“继续”就行了。

在实现过程中，根据功能或任务的大小，我会明确告诉 Claude 一次只实现一到两个部分。这样我就有机会在每组任务之间检查和审核代码。同时，我还会定期让一个子代理也来审查这些更改，这样可以尽早发现重大错误。如果你没有让 Claude 自己审核代码，我强烈推荐你这么做，因为它帮我及时发现了关键错误、遗漏的实现、不一致的代码和安全漏洞，省了我不少麻烦。

# PM2 进程管理（后端调试神器）

This one's a relatively recent addition, but it's made debugging backend issues so much easier.  
这是最近才加上的功能，但它让后端问题的调试变得轻松多了。

# 问题

My project has seven backend microservices running simultaneously. The issue was that Claude didn't have access to view the logs while services were running. I couldn't just ask "what's going wrong with the email service?" - Claude couldn't see the logs without me manually copying and pasting them into chat.  
我的项目有七个后端微服务同时运行。问题在于 Claude 无法在服务运行时查看日志。我不能直接问“邮件服务哪里出错了？”——Claude 看不到日志，除非我手动把日志复制粘贴到聊天里。

# 中级解决方案

有一段时间，我让每个服务用一个 `devLog` 脚本把输出写到带时间戳的日志文件里。这样做……还行吧。Claude 能读取这些日志文件，但用起来很笨拙。日志不是实时的，服务崩溃后不会自动重启，管理起来也很麻烦。

# 正的解决方案：PM2

Then I discovered PM2, and it was a game changer. I configured all my backend services to run via PM2 with a single command: `pnpm pm2:start`  
然后我发现了 PM2，简直改变了游戏规则。我把所有后端服务都配置成用 PM2 一条命令运行： `pnpm pm2:start`

**What this gives me:  
这样做的好处：**

- Each service runs as a managed process with its own log file  
	每个服务都作为一个受管进程运行，并有自己的日志文件
- **Claude can easily read individual service logs in real-time  
	Claude 可以轻松实时读取各个服务的日志**
- Automatic restarts on crashes  
	崩溃时自动重启
- Real-time monitoring with `pm2 logs`  
	使用 `pm2 logs` 实时监控
- Memory/CPU monitoring with `pm2 monit`  
	使用 `pm2 monit` 进行内存/CPU 监控
- Easy service management (`pm2 restart email`, `pm2 stop all`, etc.)  
	轻松管理服务（ `pm2 restart email` 、 `pm2 stop all` 等）

**PM2 Configuration:  PM2 配置：**

// ecosystem.config.jsmodule.exports = {
  apps: \[
    {
      name: 'form-service',
      script: 'npm',
      args: 'start',
      cwd: './form',
      error\_file: './form/logs/error.log',
      out\_file: './form/logs/out.log',
    },
// ... 6 more services
  \]
};

**Before PM2:  在 PM2 之前：**

Me: "The email service is throwing errors"
Me: \[Manually finds and copies logs\]
Me: \[Pastes into chat\]
Claude: "Let me analyze this..."

**The debugging workflow now:  
现在的调试流程：**

Me: "The email service is throwing errors"
Claude: \[Runs\] pm2 logs email --lines 200
Claude: \[Reads the logs\] "I see the issue - database connection timeout..."
Claude: \[Runs\] pm2 restart email
Claude: "Restarted the service, monitoring for errors..."

Night and day difference. Claude can autonomously debug issues now without me being a human log-fetching service.  
简直天壤之别。现在 Claude 可以自主调试问题了，不用我再当人工日志搬运工。

**One caveat:** Hot reload doesn't work with PM2, so I still run the frontend separately with `pnpm dev`. But for backend services that don't need hot reload as often, PM2 is incredible.  
有一点需要注意：热重载在 PM2 上不起作用，所以我还是用 `pnpm dev` 单独运行前端。但对于那些不经常需要热重载的后端服务来说，PM2 简直太棒了。

# Hooks 系统

The project I'm working on is multi-root and has about eight different repos in the root project directory. One for the frontend and seven microservices and utilities for the backend. I'm constantly bouncing around making changes in a couple of repos at a time depending on the feature.  
我正在做的这个项目是多根结构，根目录下大约有八个不同的仓库。一个是前端，另外七个是后端的微服务和工具。根据不同的功能，我总是在几个仓库之间来回切换修改代码。

And one thing that would annoy me to no end is when Claude forgets to run the build command in whatever repo it's editing to catch errors. And it will just leave a dozen or so TypeScript errors without me catching it. Then a couple of hours later I see Claude running a build script like a good boy and I see the output: "There are several TypeScript errors, but they are unrelated, so we're all good here!"  
有一件事真的让我很抓狂，就是 Claude 在编辑某个仓库时忘记运行构建命令来检查错误。结果就会留下一堆 TypeScript 错误我都没发现。然后过了几个小时，我看到 Claude 像个乖孩子一样运行了构建脚本，输出结果是：“有几个 TypeScript 错误，但它们互不相关，所以没问题！”

No, we are not good, Claude.  
不，我们一点也不好，Claude。

## Hook #1: File Edit Tracker  
钩子 `文件编辑追踪器`

First, I created a **post-tool-use hook** that runs after every Edit/Write/MultiEdit operation. It logs:  
首先，我创建了一个在每次编辑/写入/多重编辑操作后运行的工具使用后钩子。它会记录：

- Which files were edited  
	被编辑了哪些文件
- What repo they belong to  
	这些文件属于哪个仓库
- Timestamps   时间戳

Initially, I made it run builds immediately after each edit, but that was stupidly inefficient. Claude makes edits that break things all the time before quickly fixing them.  
最开始，我让它在每次编辑后立刻运行构建，但那样做实在太低效了。Claude 经常会做出一些会导致出错的修改，然后很快再修复它们。

## Hook #2: Build Checker  

Hook `构建检查器`

Then I added a **Stop hook** that runs when Claude finishes responding. It:  
然后我添加了一个 Stop 钩子，在 Claude 回复完成时运行。它会：

1. Reads the edit logs to find which repos were modified  
	读取编辑日志以查找哪些仓库被修改
2. Runs build scripts on each affected repo  
	在每个受影响的仓库上运行构建脚本
3. Checks for TypeScript errors  
	检查 TypeScript 错误
4. If < 5 errors: Shows them to Claude  
	如果错误少于 5 个：将它们展示给 Claude
5. If ≥ 5 errors: Recommends launching auto-error-resolver agent  
	如果错误大于等于 5 个：建议启动自动错误修复代理
6. Logs everything for debugging  
	记录所有内容以便调试

Since implementing this system, I've not had a single instance where Claude has left errors in the code for me to find later. The hook catches them immediately, and Claude fixes them before moving on.  
自从实施这个系统以来，Claude 再也没有留下任何需要我之后去发现的代码错误。钩子会立即捕捉到这些错误，Claude 会在继续之前修复它们。

## Hook #3: Prettier Formatter  
Hook `Prettier 格式化器`

This one's simple but effective. After Claude finishes responding, automatically format all edited files with Prettier using the appropriate `.prettierrc` config for that repo.  
这个方法简单但很有效。Claude 回复完成后，自动用 Prettier 按照该仓库的相应 `.prettierrc` 配置格式化所有被编辑的文件。

No more going into to manually edit a file just to have prettier run and produce 20 changes because Claude decided to leave off trailing commas last week when we created that file.  
不用再手动编辑文件，只是为了让 prettier 运行并产生 20 个更改，因为 Claude 上周创建那个文件时决定不加尾逗号了。

**⚠️ Update: I No Longer Recommend This Hook  
⚠️ 更新：我不再推荐这个 hook**

After publishing, a reader shared [detailed data](https://www.reddit.com/r/ClaudeAI/comments/1oivjvm/comment/nm2cxm7/) showing that file modifications trigger `<system-reminder>` notifications that can consume significant context tokens. In their case, Prettier formatting led to 160k tokens consumed in just 3 rounds due to system-reminders showing file diffs.  
发布后，有位读者分享了详细数据，显示文件修改会触发 `<system-reminder>` 通知，这会消耗大量上下文 token。在他们的案例中，仅仅是用 Prettier 格式化，就因为系统提醒显示文件 diff，导致 3 轮对话就消耗了 16 万个 token。

While the impact varies by project (large files and strict formatting rules are worst-case scenarios), I'm removing this hook from my setup. It's not a big deal to let formatting happen when you manually edit files anyway, and the potential token cost isn't worth the convenience.  
虽然影响因项目而异（大文件和严格格式规则是最糟糕的情况），但我还是决定把这个钩子从我的设置里移除。反正手动编辑文件时让格式化自动发生也没什么大不了的，而且为了方便而付出的潜在 token 成本并不值得。

If you want automatic formatting, consider running Prettier manually between sessions instead of during Claude conversations.  
如果你想要自动格式化，建议在每次使用 Claude 之间手动运行 Prettier，而不是在与 Claude 对话时运行。

## Hook #4: Error Handling Reminder  
技巧 `错误处理提醒`

This is the gentle philosophy hook I mentioned earlier:  
这就是我之前提到的温和哲学引子：

- Analyzes edited files after Claude finishes  
	在 Claude 完成后分析已编辑的文件
- Detects risky patterns (try-catch, async operations, database calls, controllers)  
	检测风险模式（try-catch、异步操作、数据库调用、控制器）
- Shows a gentle reminder if risky code was written  
	如果写了有风险的代码，会温和地提醒一下
- Claude self-assesses whether error handling is needed  
	Claude 会自我评估是否需要错误处理
- No blocking, no friction, just awareness  
	没有阻碍，没有摩擦，只有觉察

**Example output:  示例输出：**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ERROR HANDLING SELF-CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Backend Changes Detected
   2 file(s) edited

   ❓ Did you add Sentry.captureException() in catch blocks?
   ❓ Are Prisma operations wrapped in error handling?

   💡 Backend Best Practice:
      - All errors should be captured to Sentry
      - Controllers should extend BaseController
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 完整的 Hook 流程

Here's what happens on every Claude response now:  
现在每次 Claude 响应时都会发生以下情况：

Claude finishes responding
  ↓
Hook 1: Prettier formatter runs → All edited files auto-formatted
  ↓
Hook 2: Build checker runs → TypeScript errors caught immediately
  ↓
Hook 3: Error reminder runs → Gentle self-check for error handling
  ↓
If errors found → Claude sees them and fixes
  ↓
If too many errors → Auto-error-resolver agent recommended
  ↓
Result: Clean, formatted, error-free code

And the UserPromptSubmit hook ensures Claude loads relevant skills BEFORE even starting work.  
而 UserPromptSubmit 钩子确保 Claude 在开始工作之前就加载相关技能。

**No mess left behind.** It's beautiful.  
没有留下任何烂摊子。太美了。

# 附加到技能的脚本

One really cool pattern I picked up from Anthropic's official skill examples on GitHub: **attach utility scripts to skills**.  
我从 Anthropic 官方在 GitHub 上的技能示例里学到一个很酷的模式：把实用脚本附加到技能上。

For example, my `backend-dev-guidelines` skill has a section about testing authenticated routes. Instead of just explaining how authentication works, the skill references an actual script:  
比如，我的 `backend-dev-guidelines` 技能有一部分是关于测试认证路由的。这个技能不是单纯解释认证怎么做，而是直接引用了一个真实的脚本：

\### Testing Authenticated Routes

Use the provided test-auth-route.js script:

\`node scripts/test-auth-route.js http://localhost:3002/api/endpoint\`

The script handles all the complex authentication steps for you:  
这个脚本会帮你处理所有复杂的认证步骤：

1. Gets a refresh token from Keycloak  
	从 Keycloak 获取刷新令牌
2. Signs the token with JWT secret  
	用 JWT 密钥对令牌进行签名
3. Creates cookie header   创建 cookie 头部
4. Makes authenticated request  
	发起认证请求

When Claude needs to test a route, it knows exactly what script to use and how to use it. No more "let me create a test script" and reinventing the wheel every time.  
当 Claude 需要测试某个路由时，它会准确知道该用哪个脚本以及如何使用。再也不用每次都说“让我写个测试脚本”，也不用每次都重复造轮子了。

I'm planning to expand this pattern - attach more utility scripts to relevant skills so Claude has ready-to-use tools instead of generating them from scratch.  
我打算扩展这种模式——把更多实用脚本绑定到相关技能上，这样 Claude 就有现成的工具可用，而不是每次都从零生成。

# 工具和其他东西

## Mac 上的 SuperWhisper

Voice-to-text for prompting when my hands are tired from typing. Works surprisingly well, and Claude understands my rambling voice-to-text surprisingly well.  
当我打字打累了的时候，用语音转文字来输入提示。效果出乎意料地好，而且 Claude 居然能很好地理解我语音输入时的胡言乱语。

## 记忆 MCP

I use this less over time now that skills handle most of the "remembering patterns" work. But it's still useful for tracking project-specific decisions and architectural choices that don't belong in skills.  
现在我用得越来越少了，因为技能已经能处理大部分“记住模式”的工作。但它在跟踪项目特定的决策和架构选择时还是很有用，这些内容不适合放在技能里。

## BetterTouchTool

- Relative URL copy from Cursor (for sharing code references)  
	从 Cursor 复制相对 URL（用于分享代码引用）
	- I have VSCode open to more easily find the files I’m looking for and I can double tap CAPS-LOCK, then BTT inputs the shortcut to copy relative URL, transforms the clipboard contents by prepending an ‘@’ symbol, focuses the terminal, and then pastes the file path. All in one.  
		我会打开 VSCode，这样更容易找到我想要的文件，然后我可以双击 CAPS-LOCK，BTT 就会输入复制相对 URL 的快捷键，把剪贴板内容前面加上一个‘@’符号，聚焦到终端，然后粘贴文件路径。全部一步到位。
- Double-tap hotkeys to quickly focus apps (CMD+CMD = Claude Code, OPT+OPT = Browser)  
	双击快捷键快速切换应用（CMD+CMD = Claude Code，OPT+OPT = 浏览器）
- Custom gestures for common actions  
	为常用操作自定义手势

Honestly, the time savings on just not fumbling between apps is worth the BTT purchase alone.  
说实话，光是不用在不同应用之间来回切换省下的时间，就已经值回 BTT 的票价了。

## 万物皆可脚本

If there's any annoying tedious task, chances are there's a script for that:  
只要有烦人的重复性任务，大概率就有对应的脚本可以解决：

- Command-line tool to generate mock test data. Before using Claude code, it was extremely annoying to generate mock data because I would have to make a submission to a form that had about a 120 questions Just to generate one single test submission.  
	命令行工具生成模拟测试数据。在用 Claude code 之前，生成模拟数据真的超级麻烦，因为我得提交一个有大约 120 个问题的表单，只为了生成一份测试提交。
- Authentication testing scripts (get tokens, test routes)  
	认证测试脚本（获取令牌，测试路由）
- Database resetting and seeding  
	数据库重置和数据填充
- Schema diff checker before migrations  
	迁移前的数据库结构差异检查工具
- Automated backup and restore for dev database  
	开发数据库的自动备份与恢复

**Pro tip:** When Claude helps you write a useful script, immediately document it in CLAUDE.md or attach it to a relevant skill. Future you will thank past you.  
专业提示：当 Claude 帮你写了一个有用的脚本时，立刻把它记录在 CLAUDE.md 文件里，或者附加到相关技能上。未来的你会感谢现在的你。

## 文档（依然重要，但已经进化了）

I think next to planning, documentation is almost just as important. I document everything as I go in addition to the dev docs that are created for each task or feature. From system architecture to data flow diagrams to actual developer docs and APIs, just to name a few.  
我认为除了规划之外，文档几乎同样重要。我会在开发过程中记录所有内容，除此之外，每个任务或功能也会有专门的开发文档。从系统架构到数据流图，再到实际的开发文档和 API，只是举几个例子。

**But here's what changed:** Documentation now works WITH skills, not instead of them.  
但变化在于：现在文档是和技能配合使用的，而不是替代技能。

**Skills contain:** Reusable patterns, best practices, how-to guides **Documentation contains:** System architecture, data flows, API references, integration points  
技能包括：可复用的模式、最佳实践、操作指南 文档包括：系统架构、数据流、API 参考、集成点

For example:   例如：

- "How to create a controller" → **backend-dev-guidelines skill**  
	“如何创建一个控制器” → backend-dev-guidelines 技能
- "How our workflow engine works" → **Architecture documentation**  
	“我们的工作流引擎如何运作” → 架构文档
- "How to write React components" → **frontend-dev-guidelines skill**  
	“如何编写 React 组件” → 前端开发指南技能
- "How notifications flow through the system" → **Data flow diagram + notification skill**  
	“通知如何在系统中流转” → 数据流图 + 通知技能


我现在还有很多文档（850+ 个 markdown 文件），但它们现在都高度聚焦于项目特定的架构，而不是重复那些通用最佳实践——这些其实更适合放在技能里。

你不一定要做到这么极致，但我强烈建议你建立多层级的文档。比如针对特定服务的整体架构概览文档，其中可以包含指向其他更详细架构部分的文档路径。这样会极大提升 Claude 轻松浏览你的代码库的能力。

## 提示技巧


当你在写提示词时，应该尽量具体地说明你想要的结果。再举个例子，你不会让一个建筑工人过来给你造一个新浴室，而至少不讨论一下设计方案，对吧？

"You're absolutely right! Shag carpet probably is not the best idea to have in a bathroom."  
“你说得太对了！毛绒地毯可能真的不是浴室的最佳选择。”


有时候你可能并不知道具体细节，这也没关系。如果你不懂就多问问题，让 Claude 去调研并给出几种可能的解决方案。你甚至可以用专门的子代理，或者用其他 AI 聊天界面来做调研。世界任你探索。我保证这样做绝对值得，因为你可以查看 Claude 给出的方案，更清楚地判断它是好是坏，还是需要调整。否则你就是在盲目操作，纯靠感觉写代码。最后你会陷入一种连需要包含什么上下文都不知道的境地，因为你根本不清楚哪些文件和你要修复的东西有关。

**Try not to lead in your prompts** if you want honest, unbiased feedback. If you're unsure about something Claude did, ask about it in a neutral way instead of saying, "Is this good or bad?" Claude tends to tell you what it thinks you want to hear, so leading questions can skew the response. It's better to just describe the situation and ask for thoughts or alternatives. That way, you'll get a more balanced answer.  
如果你想获得诚实且无偏见的反馈，尽量不要在你的提示中带有引导性。如果你对 Claude 的某些操作感到不确定，最好用中立的方式提问，而不是直接问“这是好还是坏？”Claude 往往会告诉你它认为你想听的答案，所以引导性问题会影响响应结果。更好的做法是直接描述情况，然后请它发表看法或提供其他方案。这样你会得到更客观的回答。

# Agents, Hooks, and Slash Commands (The Holy Trinity)  
代理、钩子和斜杠命令（三位一体）

## Agents 

I've built a small army of specialized agents:  
我打造了一支由专业代理组成的小型军队：

**Quality Control:  质量控制：**

- `code-architecture-reviewer` - Reviews code for best practices adherence  
	`code-architecture-reviewer` - 审查代码是否符合最佳实践
- `build-error-resolver` - Systematically fixes TypeScript errors  
	`build-error-resolver` - 系统性地修复 TypeScript 错误
- `refactor-planner` - Creates comprehensive refactoring plans  
	`refactor-planner` - 制定全面的重构计划

**Testing & Debugging:  测试与调试：**

- `auth-route-tester` - Tests backend routes with authentication  
	`auth-route-tester` - 测试带认证的后端路由
- `auth-route-debugger` - Debugs 401/403 errors and route issues  
	`auth-route-debugger` - 调试 401/403 错误和路由问题
- `frontend-error-fixer` - Diagnoses and fixes frontend errors  
	`frontend-error-fixer` - 诊断并修复前端错误

**Planning & Strategy:  规划与策略：**

- `strategic-plan-architect` - Creates detailed implementation plans  
	`strategic-plan-architect` - 制定详细的实施计划
- `plan-reviewer` - Reviews plans before implementation  
	`plan-reviewer` - 在实施前审查计划
- `documentation-architect` - Creates/updates documentation  
	`documentation-architect` - 创建/更新文档

**Specialized:  专业化：**

- `frontend-ux-designer` - Fixes styling and UX issues  
	`frontend-ux-designer` - 修复样式和用户体验问题
- `web-research-specialist` - Researches issues along with many other things on the web  
	`web-research-specialist` - 在网上研究问题以及许多其他内容
- `reactour-walkthrough-designer` - Creates UI tours  
	`reactour-walkthrough-designer` - 创建界面导览


代理的关键在于要给他们非常具体的角色和明确的返还指令。我是吃了苦头才学到这一点的——之前我创建的代理会自己跑去做一些莫名其妙的事情，然后回来只说“我修好了！”，却完全不告诉我到底修了什么。

## Hooks (Covered Above)  

钩子（上文已讲）

The hook system is honestly what ties everything together. Without hooks:  
说实话，钩子系统才是真正把一切串联起来的东西。没有钩子的话：

- Skills sit unused   技能就会闲置不用
- Errors slip through   错误会漏掉
- Code is inconsistently formatted  
	代码格式不统一
- No automatic quality checks  
	没有自动质量检查

With hooks:   带有 hooks：

- Skills auto-activate   技能自动激活
- Zero errors left behind  
	零错误遗留
- Automatic formatting   自动格式化
- Quality awareness built-in  
	内置质量意识

## Slash Commands  斜杠命令


我有不少自定义斜杠命令，但这些是我用得最多的：

**Planning & Docs:  规划与文档：**

- `/dev-docs` - Create comprehensive strategic plan  
	`/dev-docs` - 制定全面的战略计划
- `/dev-docs-update` - Update dev docs before compaction  
	`/dev-docs-update` - 在压缩前更新开发文档
- `/create-dev-docs` - Convert approved plan to dev doc files  
	`/create-dev-docs` - 将已批准的方案转为开发文档文件

**Quality & Review:  质量与评审：**

- `/code-review` - Architectural code review  
	`/code-review` - 架构代码评审
- `/build-and-fix` - Run builds and fix all errors  
	`/build-and-fix` - 运行构建并修复所有错误

**Testing:  测试：**

- `/route-research-for-testing` - Find affected routes and launch tests  
	`/route-research-for-testing` - 找到受影响的路由并启动测试
- `/test-route` - Test specific authenticated routes  
	`/test-route` - 测试特定的认证路由

The beauty of slash commands is they expand into full prompts, so you can pack a ton of context and instructions into a simple command. Way better than typing out the same instructions every time.  
斜杠命令的妙处在于它们会扩展成完整的提示，所以你可以把大量的上下文和指令塞进一个简单的命令里。比每次都手动输入同样的指令强太多了。

# Conclusion  结论


经过六个月的高强度使用，我学到的东西如下：

**The Essentials:  要点：**

1. **Plan everything** - Use planning mode or strategic-plan-architect  
	制定计划——使用规划模式或 strategic-plan-architect
2. **Skills + Hooks** - Auto-activation is the only way skills actually work reliably  
	技能 + 钩子——自动激活是技能真正稳定运行的唯一方式
3. **Dev docs system** - Prevents Claude from losing the plot  
	开发文档系统——防止 Claude 跑偏
4. **Code reviews** - Have Claude review its own work  
	代码审查 - 让 Claude 审查自己的工作
5. **PM2 for backend** - Makes debugging actually bearable  
	后端用 PM2 - 调试终于不再痛苦

**The Nice-to-Haves:  锦上添花的功能：**

- Specialized agents for common tasks  
	针对常见任务的专用代理
- Slash commands for repeated workflows  
	用于重复工作流程的斜杠命令
- Comprehensive documentation  
	全面的文档
- Utility scripts attached to skills  
	附加到技能上的实用脚本
- Memory MCP for decisions  
	用于决策的记忆 MCP


目前我能想到的大概就这些了。就像我说的，我只是个普通人，很希望能听到大家的技巧和建议，也欢迎任何批评意见。因为我一直都想改进自己的工作流程。说实话，我只是想把对我有用的东西分享给其他人，因为现实生活中我没什么可以分享的对象（我的团队很小，而且他们都很慢才开始接触 AI）。


如果你能看到这里，感谢你花时间阅读。如果你对这些内容有疑问，或者想了解更多实现细节，很乐意分享。尤其是 hooks 和技能系统，花了不少时间试错才搞定，但现在用起来非常顺手，完全不想回头了。


总结：用 TypeScript hooks 为 Claude Code 技能构建了自动激活系统，创建了防止上下文丢失的开发文档流程，并实现了 PM2 + 自动化错误检查。结果：一个人六个月重写了 30 万行代码，质量始终如一。
