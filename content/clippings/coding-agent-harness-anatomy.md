---
title: 现代编码 Agent 的 harness 解剖：从工具列表到上下文压缩
description: Mihail Eric 在 The Modern Software Dev 课程中逐层拆解 Claude Code 的 harness——工具列表、system prompt、CLAUDE.md、plan mode、skills、subagent 与 compaction
tags:
  - translation
  - ai-agent
  - coding-agent
  - harness
  - context-engineering
source: https://themodernsoftware.dev/materials/9-24-26-transcript.txt
date: 2026-09-24
author: Mihail Eric
---

## 现代编码 Agent 的 harness 解剖：从工具列表到上下文压缩

> **原文**：[The Modern Software Dev — 9/24/26 课堂实录](https://themodernsoftware.dev/materials/9-24-26-transcript.txt) | 作者：Mihail Eric | 日期：2026-09-24

## 📝 摘要

这是斯坦福课程 "The Modern Software Dev" 的一节课堂实录。上周演示了用 200 行代码写出一个能改文件、能跑命令的最小 coding agent，这一节转向真实产品：把 Claude Code（配 Opus 5.5）当解剖对象，逐层拆开它包在核心循环外面的那层 harness。作者用抓包工具拦截真实请求，展示工具列表如何整体注入上下文、system prompt 如何在两个月内从 250 行压到 50 行、CLAUDE.md 如何被偷偷塞进 user 消息、plan mode 与 skill 各自注入什么文本、subagent 如何用全新上下文分担探索工作，最后讲到 compaction 与「dumb zone」。核心观点只有一句：harness 正在变简单，能力在往模型里搬，而所有人的共同敌人是上下文膨胀。

## 📋 术语表

| 英文                   | 中文                  | 说明                                                                 |
| ---------------------- | --------------------- | -------------------------------------------------------------------- |
| harness                | harness（框架/外壳）  | 包在 LLM 外面的那层工程代码：提示词、工具、模式、文件配置等的总和    |
| tool list              | 工具列表              | 每次请求都会完整注入上下文的一组工具定义，含名称、描述与 JSON Schema |
| tool schema            | 工具参数结构          | 相当于函数签名，规定调用时可传哪些参数                               |
| MCP                    | MCP（模型上下文协议） | 把外部工具与资源接进 harness 的协议，工具名通常带 `mcp__` 前缀       |
| system prompt          | 系统提示词            | harness 静态设定的行为蓝图，用户不可控，但每次请求都会带上           |
| CLAUDE.md / AGENTS.md  | 项目配置文件          | 用户可控的指令文件，内容会被注入到用户消息里，用于覆盖默认行为       |
| plan mode              | 计划模式              | 先出规格与方案再动手的模式，结束时产出 plan 文件                     |
| skill                  | 技能                  | 把多步流程、脚本与提示词封装成可复用过程；靠元数据做渐进式披露       |
| progressive disclosure | 渐进式披露            | 先只暴露少量元数据，按需再加载完整内容，避免上下文膨胀               |
| subagent               | 子智能体              | 从主循环派生出的工作者，拥有全新上下文窗口，做完只回传结果           |
| compaction             | 上下文压缩            | 接近上下文上限时把历史摘要化，用更少的 token 替换原有上下文          |
| LSP                    | 语言服务协议          | Language Server Protocol，让 agent 能查询符号、跳转定义等            |
| post-training          | 后训练                | 在预训练之后继续训练，使模型更擅长使用特定工具集                     |
| dumb zone              | 迟钝区                | 非正式说法，指上下文过长后模型表现开始下滑的状态                     |

---

## 正文（双语对照）

Mihail Eric (00:59.926)
Just sit here? Yeah, sure.

我就坐这儿？行，没问题。

Mihail Eric (01:57.876)
Let's settle down and get started. We're 35 seconds over. Can people hear me? This feels amplified. Does this work for people? Yeah? I don't love it. It feels a little awkward, and this thing in my back pocket feels a little strange too. Hopefully I don't need to project as much, which I think was a bit of a problem last time.

大家安静一下，我们开始。已经超了 35 秒。能听见我说话吗？感觉声音被放大了。这样大家听着还行吗？行？我不太喜欢。有点别扭，而且后兜里这个东西也挺奇怪的。希望我不用那么使劲喊了，上次那事儿我觉得算是个问题。

Welcome back. We have a quick one-two here with Tuesdays and Thursdays, so I'm glad to see everyone again, or at least most of the folks. Let's dive into it.

欢迎回来。周二加周四，我们这节奏挺紧的，很高兴又见到大家，至少是大部分人。那我们直接开始。

I want to start with some logistics for people who are here for the first time, as well as a few updates for those who were here on Tuesday. First, I believe Isaac put out the final project specifications. That's the capstone for the quarter. There are roughly four milestones along the way, including a proposal and some intermediate milestones, to get you looking at things before the last week of the quarter, when people start getting really crazy with the vibe coding.

我先讲点事务性的东西，给第一次来的同学，也顺便给周二来过的同学更新几条。第一，我记得是 Isaac 已经把期末项目的规格说明发出去了，这是这学期的 capstone。中间大概有四个里程碑，包括一个 proposal 和几个阶段性节点，目的是让你们在学期最后一周之前就开始动手——不然到那时候大家就开始疯狂 vibe coding 了。

We've spaced that out, and you should have already seen the project agenda. We're allowing up to one additional partner in the class for this project. You can have one human partner and as many coding agents as you want. A swarm of them, in fact. That's all fair game.

我们把节奏拉开了，你们应该已经看到项目日程了。这个项目允许在班里再找一个搭档。也就是说，你可以有一个人类搭档，外加任意数量的 coding agent。一整群都行。这些都没问题。

Mihail Eric (03:41.624)
You can also do it by yourself. A lot of people choose to, and I think that's acceptable, maybe even appropriate these days, given how powerful coding agents are.

你也可以自己做。很多人就是这么选的，我觉得这可以接受，考虑到现在 coding agent 这么强，甚至可能更合适。

One thing I forgot to mention last time: in addition to the other perks of the class, such as the OSS partners whose projects we'll get to contribute to and the guest speakers coming in, we're also getting credits from a bunch of providers. These include a lot of the top coding agent startups and companies. Some are technically still private companies, but it's hard to call a ten-billion-dollar company a startup. That's the crazy world we live in today.

上次有一件事我忘了说：除了这门课的其他福利，比如我们会给 OSS 合作伙伴的项目做贡献、还有客座讲师来分享，我们还能拿到一批厂商的额度。这里面包括很多顶尖的 coding agent 创业公司和大厂。有些从法律上讲还是私营公司，但一家一百亿美元的公司你很难再叫它创业公司了。这就是我们今天所处的疯狂世界。

That includes Claude. Through the class, we've been able to get Claude Code credits, Factory credits, and xAI credits. I don't know why some of these are hyperlinked, probably because they look like a domain. I'll just add a domain suffix to everyone else, and then it's fair again.

这里面包括 Claude。通过这门课，我们拿到了 Claude Code 的额度、Factory 的额度，还有 xAI 的额度。我不知道为什么这里面有几个带了超链接，大概是因为它们看起来像域名。那我就给其他几个也都加上域名后缀，这样就又公平了。

Devin is included too. Windsurf and Devin are part of the same company, Cognition. All four have agreed to offer credits. As you're vibe coding, botmaxing, and token maxing, you should be ready to go without burning through your own credit cards. Exciting times.

Devin 也在内。Windsurf 和 Devin 属于同一家公司，Cognition。这四家都同意提供额度。所以你们在 vibe coding、botmaxing、token maxing 的时候，应该不用刷爆自己的信用卡就能开工了。激动人心的时代。

We'll probably release those sometime next week. To distribute them, we might collect your emails or something to that effect. Some providers have QR codes, but expect that next week.

这些东西大概下周某个时候发放。为了分发，我们可能会收集你们的邮箱或者类似的东西。有些厂商是给二维码的，反正下周注意查收。

We also mentioned the OSS partner component of the class. We'll explain exactly what form that takes next week. If you're wondering what it will mean, we'll outline it then. A few of the partners are so excited about being in the class that they're actually going to come in.

我们也提过这门课的 OSS 合作伙伴部分。具体是什么形式，我们下周会讲清楚。如果你在想这到底意味着什么，到时候我们会说明。有几个合作伙伴特别兴奋能参与这门课，他们会亲自过来。

Mihail Eric (05:40.28)
They'll walk through their projects and, in some cases, do virtual or in-person office hours. We're figuring out the logistics. I believe at least one or two people will come in, and we'll probably have them speak for five to ten minutes before class about their projects. Every OSS partner will be featured next week.

他们会介绍自己的项目，有些还会做线上或线下的 office hours。具体安排我们还在定。我记得至少会有一两个人过来，大概会在课前让他们讲五到十分钟，介绍自己的项目。下周每个 OSS 合作伙伴都会被介绍到。

A lot of people have asked about applications to get off the waitlist. I don't think the prerequisites are especially high, but they are the minimum set I think you need to be successful in the class. There are ways to get exceptions, usually for people who didn't do their undergraduate work at Stanford but took equivalent courses elsewhere and can demonstrate that.

很多人问过从 waitlist 转正的申请。我不觉得先修要求有多高，但那是我认为你能把这门课学下来的最低门槛。也有办法申请豁免，通常是给那些本科不在 Stanford 读、但在别处修过同等课程并且能证明的人。

The application deadline is the 27th, which I think is Sunday. We'll review the applications and let people in depending on whether they meet those prerequisites. I've been getting emails asking, “Did you see my application?” I probably haven't yet, though I've likely seen your email. The applications are in a backlog in a Google Form, and we'll go through them over the next few days.

申请截止是 27 号，我记得是周日。我们会审核申请，按是否满足先修要求来决定放人进来。我一直在收到邮件问「你看到我的申请了吗？」我大概还没看，不过你的邮件我应该是看到了。申请都堆在一个 Google Form 里，接下来几天我们会过一遍。

Any questions? Yes?

有问题吗？你说。

Yes, they're on the course website. Tuesday's slides are there, but today's aren't. That's correct. I'll make an effort to get them up before class. That's a good callout.

对，都在课程网站上。周二的幻灯片在上面，今天的还没传。没错。我会尽量在课前传上去。这个提醒得好。

Mihail Eric (07:28.536)
Yes. [Unclear passage.]

好，请讲。[此处录音不清]

Mihail Eric (07:41.038)
If you're not in Ed, you can message us. Are you auditing? Is that why? No? Okay. If you're an enrolled student, you should be able to access it.

如果你不在 Ed 上，可以给我们发消息。你是在旁听吗？是因为这个吗？不是？好。如果你是正式选课的学生，应该是有权限的。

Mihail Eric (07:58.626)
Okay, we'll figure that out. I also just noticed this interesting setup you have here. It's like two separate side desks. Nobody else found that funny? All right, just me. Here I am trying to connect with the students again, and it's falling flat. You guys like hacky sack? Is that anything? All right.

好，我们来解决。我还刚注意到你们这儿这个挺有意思的布置。像是两张分开的边桌。没有别人觉得好笑吗？行吧，就我一个。我这儿又想跟学生拉近关系，结果又冷场了。你们喜欢踢沙包吗？有人玩吗？行吧。

Today we're going deeper into some of the topics we touched on last week—or rather, two days ago. Toward the end of Tuesday's class, we went through a demonstration showing that, in about 150 to 200 lines of code, you can build the bare bones of a coding agent. It can interpret user requests, edit code and files, and generate things of some complexity, starting with “Hello, world.” We pushed the limits a little.

今天我们深入讲一些上周——其实是两天前——碰过的主题。周二课快结束的时候，我们做了一个演示，说明用大概 150 到 200 行代码就能搭出一个 coding agent 的骨架。它能理解用户请求、编辑代码和文件，还能生成有点复杂度的东西，从「Hello, world」开始。我们稍微推了推边界。

Tuesday was a proof of concept: look what you can do in 200 lines of code. Today, I want to bring us up to the modern day in coding agents and their harnesses. We're going to dissect the anatomy of a state-of-the-art coding agent and see what's happening under the hood.

周二是概念验证：看看 200 行代码能做出什么。今天我想把大家带到 coding agent 及其 harness（框架）的当下水平。我们要解剖一个最先进的 coding agent，看看它在底下到底是怎么跑的。

We'll be able to see everything except the intelligence layer, which is the model. The model is private: some big set of two-trillion-plus-parameter models sitting on servers distributed around the world. We can't see that, but we can see the harness around it. We'll get into what that means over the next few slides.

除了智能层，也就是模型本身，其他我们都能看到。模型是不公开的：一堆两万亿以上参数的大模型，跑在世界各地分布着的服务器上。那个我们看不到，但我们能看到包在它外面的 harness。接下来几页我们会讲这意味着什么。

Two days ago, we went through the core execution loop of a coding agent. You have a user interacting with a coding agent harness, such as Claude, Windsurf, or Devin. The intelligence layer is the LLM, a set of parameters trained on a ton of data using intricate training algorithms. We won't cover those here; that could be, and I'm sure is, a whole course in its own right. Then there's the interaction with a tool set.

两天前我们过了一遍 coding agent 的核心执行循环。用户和一个 coding agent harness 交互，比如 Claude、Windsurf、Devin。智能层是 LLM，一堆用复杂训练算法在海量数据上训出来的参数。这部分我们这里不讲；那本身完全可以、而且我确信也确实是一门完整的课。然后是跟工具集的交互。

Mihail Eric (10:20.666)
When you engage with these coding agents, you're issuing prompts. Under the hood, you're going through this loop: talk to the harness through its interface, have it interact with an LLM, and go back and forth with a set of tools. Those tools ground the LLM in the world and let it do things like search the web or interact with your file system.

当你使用这些 coding agent 时，你是在发 prompt。在底下，走的就是这个循环：通过界面跟 harness 对话，让它跟 LLM 交互，再跟一组工具来回调用。这些工具把 LLM 落到现实世界里，让它能搜网页、能操作你的文件系统。

That's the core, but we're going deeper today. We'll focus on everything around that execution loop. The loop is still there, but there are a bunch of bells and whistles around it that we call the harness.

这是核心，但今天我们要更深一层。我们会关注这个执行循环周围的所有东西。循环还在那儿，但周围挂了一大堆零碎功能，我们把这些统称为 harness。

Because we're trying to stay on the cutting edge, we're going to look at the coding agent harness for Claude Code, specifically with Opus 5.5. This literally came out about two days ago. What we're looking at is two days old; it doesn't get much more modern than that.

因为我们想尽量贴近前沿，所以要看的是 Claude Code 的 coding agent harness，具体是配 Opus 5.5 的版本。这东西真的是大概两天前才出的。我们看的材料才两天新，再新也就这样了。

Let's look at what it takes to build a harness around Opus 5.5. According to the benchmarks Anthropic put up, it's state of the art. Though right before or after that, literally on the same day, OpenAI also released a new model. That's the dynamic between these two companies: they time their releases for the same day.

我们来看看围绕 Opus 5.5 搭一个 harness 需要什么。按 Anthropic 公布的 benchmark，它是最先进的。不过差不多就在前后，真的是同一天，OpenAI 也发了一个新模型。这两家公司就是这个节奏：专门把发布日期凑到同一天。

Beyond the simple tool-and-LLM loop we saw two slides ago, most coding agent harnesses today are much more complex. One key takeaway is that harness design is probably one of the hardest and most important problems in coding agents, and in agents more broadly. We're focusing on coding and software systems, but many of these principles apply to any vertical, whether that's sales, legal—

比起两页之前看到的那个简单的「工具 + LLM」循环，今天大多数 coding agent harness 要复杂得多。一个关键结论是：harness 设计大概是 coding agent 里最难也最重要的问题之一，放大到 agent 整体也是如此。我们聚焦在 coding 和软件系统上，但很多原则适用于任何垂直领域，不管是销售、法律——

Mihail Eric (12:16.582)
—customer support, or something else. A lot goes into the harness around the intelligence of an LLM.

——客服，还是别的什么。围绕 LLM 的智能，harness 里要装的东西很多。

A few components are now fairly standard: the system prompt; custom configuration files, such as AGENTS.md and CLAUDE.md; and tool lists, which specify the available tools. You should be familiar with that last part. Two days ago, we discussed editing, listing, and reading files. We can extend that to other tools, both those that come out of the box and additional ones.

有几个组件现在已经相当标准了：system prompt；自定义配置文件，比如 AGENTS.md 和 CLAUDE.md；还有工具列表，用来指定可用的工具。最后这个你们应该熟悉。两天前我们讲过编辑、列出、读取文件。我们可以把它扩展到别的工具，不管是开箱自带的还是额外加的。

We also have things like plan mode, built-in modes that let you do other things within the harness. We can kick off subagents, and we have skills, hooks, and compaction. Those are just a few examples. Quite a bit is baked into what we call the harness.

还有 plan mode 这类东西，是内置的模式，让你在 harness 里做别的事。我们可以拉起 subagent，还有 skills、hooks、compaction。这些只是几个例子。我们所说的 harness 里内置了不少东西。

When we use a system like Claude Code, we're using an interface with a lot of functionality surrounding the core intelligence. It looks something like this. The agent loop is what we focused on two days ago: talk to the LLM, have it respond, possibly request a tool call, execute that call, and return the result. Everything else I've been discussing feeds into that loop.

当我们用 Claude Code 这样的系统时，用的是一层界面，核心智能周围包着一大堆功能。大概是这个样子。agent loop 是我们两天前关注的重点：跟 LLM 说话，让它回应，它可能要求调用工具，执行那个调用，再把结果返回。我刚才讲的其他东西都是往这个循环里喂的。

Within the core loop, we think about the context window, which we'll spend time on this quarter; the model, which is the intelligence layer; and tool execution. We covered that part two days ago. Today, we're talking about all the other pieces from the previous slide. Any questions or thoughts?

在核心循环里，我们要考虑 context window，这学期会专门花时间讲；还有模型，也就是智能层；以及工具执行。这部分两天前讲过了。今天我们讲上一页里的其他所有部件。有问题或想法吗？

Mihail Eric (14:11.202)
Yes. [Unclear passage.]

好，请讲。[此处录音不清]

Mihail Eric (14:20.888)
We're going to do this interactively. I'm not just going to throw slides at you. Together, we'll walk through the harness around a set of calls to Claude Code. I'll switch between slides with high-level principles and an actual demonstration of the harness.

我们这个东西是互动着来的。我不会光往你们脸上扔幻灯片。我们一起走一遍 Claude Code 一组调用外面的那层 harness。我会在讲高层原则的幻灯片和实际的 harness 演示之间来回切。

The first thing I want to focus on is tool lists. We'll start relatively easy. Tools are the things the LLM has access to beyond its static weights and training. They're its way of accessing the real world, whether that's your local file system, something on your computer, or something on the web.

我想先聚焦工具列表。这个开头相对简单。工具是 LLM 在固定权重和训练之外能接触到的东西。这是它接入真实世界的方式，不管是你的本地文件系统、你电脑上的东西，还是网上的东西。

The tools we put into a harness enhance the LLM with capabilities such as search, shell commands, and agent tasks. These are especially relevant to coding, but the same principles apply outside the coding space. We can talk more about this after class, but even agents outside coding are increasingly being designed around coding capabilities. That's become one way to design harnesses for other domains as well.

我们放进 harness（框架）里的工具，给 LLM 增强了搜索、shell 命令、agent 任务这类能力。这些能力跟编码关系特别紧密，但同样的原则在编码之外的领域也适用。这个我们可以课后多聊，不过现在连编码之外的 agent，也越来越多是围绕编码能力来设计的。这已经成了给其他领域设计 harness 的一种方式。

In Claude's case, there are about 40 built-in tools that you get when you download and use Claude Code. These are capabilities the Anthropic team has decided the coding agent should have access to. I'd go a step further: the model has been optimized to use those tools.

在 Claude 这边，你下载并使用 Claude Code 时，大概会拿到 40 个内置工具。这些是 Anthropic 团队认定编码 agent 应该能用的能力。我还要再进一步说一句：模型本身已经被优化过，就是为了用好这些工具。

I'll show you what those roughly 40 tools look like. Think of this as the Anthropic team saying, “These are the capabilities you should have every time you interact with Claude, and we've made a system that's good at using them.” That happens through processes such as post-training, which enhances the LLM's capabilities.

我给大家看看这大约 40 个工具长什么样。你可以把它理解成 Anthropic 团队在说：「这些就是你每次跟 Claude 交互时应该具备的能力，而且我们已经做了一套很会使用它们的系统。」这是通过 post-training（后训练）这类过程实现的，用来增强 LLM 的能力。

Mihail Eric (16:38.412)
In addition to the native tools, there are MCP tools. I'm sure some people have heard of MCP. If you haven't, it's a way to integrate external tools and resources into the harness.

除了原生工具，还有 MCP 工具。我相信有些人听说过 MCP。如果你没听过，它是一种把外部工具和资源接进 harness 的方式。

One thing I want to highlight before we get into an example: you can think of a tool as a function, as we saw two days ago. Everything in its definition—the description, comments, name, and full signature—becomes part of your prompt. It gets injected into the context.

进入例子之前，有一点我想强调：你可以把工具看成一个函数，就像我们两天前看到的那样。它定义里的每一样东西——描述、注释、名字，还有完整的签名——都会变成你 prompt 的一部分。它会被注入到上下文里。

When you're writing a function to expose as a tool to a coding agent, being clear and consistent in the Python docstring is incredibly important. So is being clear about the argument types. All of that gets surfaced to the LLM, and it's what the LLM uses to understand what to do and when to use the tool. That's an important point for designing MCP servers and tools for agents in general.

当你写一个函数、要把它作为工具暴露给编码 agent 时，Python docstring 写得清楚、前后一致，这一点极其重要。把参数类型写清楚也一样重要。这些内容全都会呈现给 LLM，LLM 就是靠它来理解该做什么、什么时候该用这个工具。这一点在设计 MCP server、以及一般意义上为 agent 设计工具时都很关键。

Let's see this in practice. I believe we also released the first assignment today, due on Sunday. It has you working through an exercise similar to what I'm about to show. You'll take a Claude Code instance, issue calls, intercept the requests and responses, and unpack them to see what's going on under the hood.

我们来看实际的东西。我记得我们今天也发布了第一次作业，周日截止。作业里会让你做一遍跟我接下来要演示的类似的练习。你会拿一个 Claude Code 实例，发出调用，拦截请求和响应，然后拆开它们，看底层到底发生了什么。

We'll dissect what happens every time we issue a prompt to Claude. Let's see what that looks like.

我们会解剖一下：每次我们给 Claude 发一个 prompt，究竟发生了什么。来看看是什么样子。

Mihail Eric (18:33.782)
To get everyone on the same page, we're using a proxy tool that intercepts requests and responses from Claude Code. Everyone will have access to it. This is a quick preview of what it looks like.

为了让大家站在同一起跑线上，说明一下：我们用了一个代理工具，用来拦截 Claude Code 的请求和响应。大家都会有访问权限。这是它长什么样的一个快速预览。

When we issue calls to Claude Code, we'll see something like this. If you've taken 144, have you used Wireshark? Are you still doing that? Okay. With Wireshark, you capture network packets and inspect what's happening at the protocol level. We're doing something similar here: capturing requests and responses and unpacking them. Another analogy is the debugging console in Chrome or any other browser. This tool is nice because it lets us unpack the information.

当我们向 Claude Code 发调用时，看到的就是这样的东西。上过 144 的同学，你们用过 Wireshark 吗？现在还在用吗？好。用 Wireshark 你抓网络包，然后在协议层面看发生了什么。我们这里做的事类似：抓请求和响应，然后拆开。另一个类比是 Chrome 或者别的浏览器里的调试控制台。这个工具的好处是，它让我们能把这些信息拆解开来。

For this demonstration, I made a simple to-do tool. Can people see this? Let me zoom in. Is the size good? Yes? Awesome, thank you.

为了这次演示，我写了一个简单的 to-do 工具。大家看得到吗？我放大一点。这个大小可以吗？可以？太好了，谢谢。

It's a command-line to-do tool. You can add tasks, list them, mark them as done, add subtasks, and so on. I effectively vibe-coded it and then chose to extend it.

这是一个命令行的 to-do 工具。你可以加任务、列出任务、标记完成、加子任务，等等。我基本上是 vibe-code 出来的，然后选择再扩展它。

The bottom of the screen shows that the CLI tool exists. Above that is the conversation I had at 4 a.m. with Claude Code. I issued a bunch of prompts, captured the requests, and logged them to files. We're going to look at those files to see what it all looks like. Let's enlarge this a little too.

屏幕底部显示这个 CLI 工具是存在的。上面那块是我凌晨 4 点跟 Claude Code 的对话。我发了一堆 prompt，抓了请求，记到文件里。我们要看的就是这些文件，看看整体是什么样子。这个我也放大一点。

Mihail Eric (20:40.62)
This is the full trace: all the requests and responses from my session with Claude Code. It's a JSON file with a structure that's quite nice for us to parse because it clearly separates what's happening.

这是完整的 trace：我跟 Claude Code 那次会话的所有请求和响应。它是一个 JSON 文件，结构对我们解析来说挺友好的，因为它把发生的事情分得很清楚。

To give you a sense of where I entered the conversation, you can see the model mentioned here, followed by a set of messages. If you remember two days ago, we had a conversation list that we appended to as we issued requests, user messages, and system messages. Think of this messages object as exactly that list.

为了让你知道我是从哪里进入这段对话的，你可以看到这里提到了模型，后面跟着一组 messages。如果你还记得两天前的内容，我们有一个 conversation 列表，随着我们发出请求、user message、system message，就往里追加。你就把这个 messages 对象理解成那个列表，完全一样。

We also have the same concept of roles. Here's a user role, followed by the actual content of the message. This is one of the messages, and it's the first thing I said when I was trying to understand what was happening in this repo I'd vibe-coded. I was trying to get reacquainted with it.

我们也有同样的 role 概念。这里是一个 user role，后面是消息的实际内容。这是其中一条 message，是我一开始想搞明白这个我 vibe-code 出来的 repo 到底在干什么时的第一句话。我在试着重新熟悉它。

There's some material above this that I'll get to, but for now, think of this as our starting point: the first question I asked.

这上面还有一些内容，我待会儿会讲到，但现在你先把它当成我们的起点：我问的第一个问题。

There are a bunch of messages. Some have the user role, typically for something I've issued, though that can also include tool-call responses. There are system-level messages where the harness, Claude Code, injects things behind the scenes. Then there are assistant messages, which are Claude doing things, such as issuing tool calls.

这里有一堆 message。有些是 user role，通常是我发的东西，不过也可能包括 tool call 的响应。还有 system 级别的 message，是 harness，也就是 Claude Code，在背后偷偷注入的东西。然后是 assistant message，那是 Claude 在做事，比如发出 tool call。

Each of these blocks is a message. Some are enriched in ways that help Claude do its work, even though we don't normally see that information. That's why we're intercepting these requests: to look under the hood.

这些块每一块都是一条 message。有些被丰富了，用一些我们平时看不到的信息来帮 Claude 干活。这也是我们为什么要拦截这些请求：就是为了看底下到底怎么回事。

Mihail Eric (22:42.862)
Is everyone with me on the setup and what we're doing?

这个环境和我们在做的事，大家都跟得上吗？

We said we'd start with tools, so let's dive into the tool lists. There's a lot going on here. We won't go through every line, but I want to focus on a few key parts of the structure.

我们说好从工具开始，那就深入看看这些工具列表。这里信息量很大。我们不会每一行都过，但我想聚焦结构里的几个关键部分。

Below the user and assistant messages, there's a tools block in the intercepted request. The tools are explicitly listed in this component. The tools object is a list, and each entry is a dictionary.

在 user 和 assistant message 下面，被拦截的请求里有一个 tools 块。工具就明确列在这个组件里。tools 对象是一个列表，每个元素是一个字典。

One example is the agent tool. What does it do? It lets you launch a new agent to handle complex, multistep tasks, and the description explains that agent's capabilities. There's also a schema that you can think of as the function signature for this tool. The properties are things you can specify. When a tool is called, you'll see values supplied for some of these properties.

一个例子是 agent 工具。它干什么？它能让你启动一个新的 agent 去处理复杂、多步骤的任务，描述里解释了这个 agent 有什么能力。还有一份 schema，你可以把它看成这个工具的 function signature。properties 是你能指定的东西。工具被调用时，你会看到其中一些 property 被赋值了。

It's pretty elaborate. The important point is that all of this gets injected into the LLM's context window.

写得相当细。重点是：所有这些东西都会被注入到 LLM 的上下文窗口里。

Mihail Eric (24:11.47)
There are other tools here too, such as artifact tools. Some definitions are quite elaborate, depending on the complexity of the underlying tool. I won't go through every one; I just want you to get a sense of this block.

这里还有别的工具，比如 artifact 工具。有些定义相当复杂，取决于底层工具本身有多复杂。我不会一个一个过；我只是想让你对这个块有个感觉。

I took the tools block and separated out the native tools that come with Claude from the additional tools, such as MCP tools. We mentioned roughly 40 built-in tools. Here they are.

我把 tools 块拆开了，把 Claude 自带的原生工具和额外的工具（比如 MCP 工具）分开。我们提过大概有 40 个内置工具。就是这些。

There are tools for accessing files, interacting with the shell through Bash, and monitoring things in something like a cron fashion. You can search the web and use LSP search to inspect the language you're working in. LSP stands for Language Server Protocol.

有访问文件的工具，有通过 Bash 跟 shell 交互的工具，还有用类似 cron 的方式做监控的工具。你可以搜索网页，也可以用 LSP search 来检查你正在用的语言。LSP 是 Language Server Protocol 的意思。

There are agent-specific tools, tools for planning and isolation, and scheduling tools, including a specific cron tool. There are tools for creating artifacts and listing MCP resources, which are different from MCP tools. You also have tools for interacting with the user, invoking skills, asking questions, pushing notifications, and sending feedback.

有 agent 专用的工具，有做规划和隔离的工具，还有调度的工具，包括一个专门的 cron 工具。有创建 artifact 和列出 MCP resources 的工具——MCP resources 和 MCP tools 不是一回事。还有跟用户交互、调用 skill、提问、推通知、发反馈的工具。

About 40 tools. Any questions so far? Yes? Is this all the body of one request? Yes, that's right.

大约 40 个工具。到这儿有问题吗？你说？「这些都是一个请求的 body 吗？」对，没错。

Mihail Eric (25:58.866)
It's a lot of stuff. That's exactly right, and it's a good callout. MCP came first, and skills were introduced later. One reason for introducing skills was progressive disclosure: bringing information into the context when it's relevant to the LLM.

东西确实很多。说得完全对，这个点提得好。MCP 是先出现的，skills 是后来才引入的。引入 skills 的一个原因就是 progressive disclosure（渐进式披露）：只在相关信息对 LLM 有用的时候，才把它带进上下文。

Here, we're dropping in all the tools. Every MCP server you've loaded, including third-party servers, appears in this block. Every time you send a request, it gets that set of tools.

而在这里，我们是把所有工具一股脑塞进去。你加载的每一个 MCP server，包括第三方的，都会出现在这个块里。你每发一次请求，它都会带上这一整套工具。

Skills, which we'll discuss shortly, initially include only a small amount of metadata describing what the skill does. Based on that metadata and its relevance to the task, the system can pull in the rest of the skill when it needs it.

skills 我们待会儿会讲，它一开始只包含一小部分 metadata，描述这个 skill 是干什么的。系统根据这份 metadata 和它跟任务的相关性，在需要的时候把 skill 剩下的内容拉进来。

But yes, to your point, this is all included, and it's a lot. That's one reason we'll spend time on context engineering. You have to be careful about which MCP tools and servers you introduce because they can blow up your context. The more irrelevant material you include, the more likely the coding agent is to perform poorly on tasks.

不过回到你那个点：是的，这些全都被包含进去了，而且量很大。这也是我们要花时间讲 context engineering 的原因之一。你得小心引入哪些 MCP 工具和 server，因为它们会把你的上下文撑爆。你塞进去的无关内容越多，编码 agent 在任务上表现不佳的可能性就越大。

There have been studies looking at the point where performance starts dropping off: how many tokens in does that happen? That's why we need to be mindful of this block. It gets included in the request.

已经有研究在看性能从哪个点开始往下掉：输入到多少 token 时会这样？所以我们得留心这个块。它是会被放进请求里的。

Mihail Eric (27:41.454)
So the question is why Claude doesn't use vectors when kicking off agents, instead of natural language. [Question wording unclear in the transcript.]

所以问题是：为什么 Claude 在启动 agent 的时候不用向量，而是用自然语言。[提问表述不清]

I don't know the exact details, but much of the training is based on natural-language text. Code and instructions are represented as text snippets. That's true both of the web corpus used for training and of the custom data that humans annotate to improve these systems. It would be very hard for humans to communicate in vectors or another non-human-readable format.

具体细节我不清楚，但训练的大部分基础是自然语言文本。代码和指令都是以文本片段的形式表示的。训练用的网页语料是这样，人类为了改进这些系统而标注的定制数据也是这样。要让人类用向量或者别的非人类可读的格式来沟通，那会非常难。

Mihail Eric (28:36.396)
Yeah, almost certainly. It's hard to know exactly what that processing looks like. This is the raw form of the request, but when it's ingested, there's probably some processing to collapse or minify it.

对，几乎可以肯定。那个处理过程具体长什么样，很难知道。这是请求的原始形态，但它被接收进去的时候，大概会做一些压缩或精简的处理。

This is the most human-readable form we can parse. It's not necessarily the form that gets fed into the LLM. There's almost certainly something else happening there, with some material being stripped out or transformed. [End of explanation unclear.]

这是我们能解析出来的、最接近人类可读的形态。它不一定就是喂进 LLM 的那个形态。那里几乎肯定还发生了别的事情，有些内容被剥掉了或者被转换了。[结尾解释不清]

Mihail Eric (29:18.286)
I think this is already pretty detailed. We're literally looking at the contents of every tool. To go further, you'd probably have to be on the server where the LLM is hosted, looking at what happens immediately before the tokenized input is sent to it. I don't think we're likely to see that, and some of it is probably their secret sauce.

我觉得这已经相当详细了。我们实际上是在看每一个工具的内容。想再往下走，你大概得待在托管 LLM 的那台服务器上，看 token 化之后的输入被送进去之前那一刻发生了什么。我觉得我们不太可能看到那些，而且其中一部分大概是他们的独门配方。

One other thing worth mentioning: these were the native tools, but to Peter's question, it's not just those. Forty tools is already a lot, and there are also external MCP servers.

还有一点值得一提：这些是原生工具，但回到 Peter 的问题，不只是这些。40 个工具已经很多了，而且还有外部的 MCP server。

I'm still in the tool-list object here. You can see a name beginning with “mcp__claude_ai” and a Claude Docs tool. [Exact tool name unclear.] That's a way of identifying an MCP server tool. The “mcp__” prefix tells you it's an external tool.

我还停留在这个工具列表对象里。你可以看到一个以“mcp__claude_ai”开头的名字，还有一个 Claude Docs 工具。[此处录音不清] 这就是识别 MCP server 工具的一种方式。“mcp__”这个前缀告诉你，它是一个外部工具。

I can show you another one. Claude has a bunch of these. I think I have one from Mintlify, which is for documentation hosting. You can also have tools for Notion, Slack, and so on. All of those get injected into the tool list too.

我再给你看一个。Claude 有一堆这样的工具。我记得我有一个来自 Mintlify 的，那是做文档托管的。你也可以有 Notion、Slack 之类的工具。这些全都会被注入到工具列表里。

Mihail Eric (30:54.658)
Yes, somewhere in the metadata. I'm not going through every piece of metadata here, but there are checksums, hashes, and UIDs on various objects. That's a good callout. Not having things like that can create a security vulnerability.

是的，就在元数据里的某个位置。我不会在这里把每一条元数据都过一遍，但各种对象上都有校验和、哈希和 UID。这一点提得好。缺了这类东西，就可能造成安全漏洞。

Mihail Eric (31:25.272)
People are jumping ahead to skills here. MCP is a primitive. You can think of an MCP tool almost like an API call: an input-output mechanism.

大家这里跳到 skills 上了。MCP 是一个原语。你几乎可以把一个 MCP 工具想成一次 API 调用：一个输入输出的机制。

When we talk about skills, we're codifying procedures: multiple steps, multiple tool calls, and prompts between calls. An MCP tool is the smallest primitive for interacting with an underlying third-party resource. A skill wraps tools, functions, scripts, and other resources into multistep operations. Having that level of granularity is helpful.

我们讲 skills 的时候，是在把流程固化下来：多个步骤、多次工具调用，还有调用之间的 prompt。MCP 工具是与底层第三方资源交互的最小原语。而一个 skill 把工具、函数、脚本和其他资源包装成多步操作。有这种粒度是有帮助的。

Okay, let's keep moving.

好，我们继续。

Mihail Eric (32:19.66)
So, tools: there are about 40 built in, and depending on how many MCP servers you add, that can grow to a lot more.

那么说工具：内置的大概有 40 个，视你加了多少个 MCP server，还可能涨到多得多。

I'll add a historical observation, something to keep in mind if you've already built your own harnesses or plan to. One reason Claude Code became so popular around December of last year was its minimalist harness. For a long time, it had a restrictive set of tools that could still do almost everything. Forty is still not a lot in that context.

我补一个历史上的观察，如果你已经自己搭过 harness（框架），或者打算搭，这点值得记着。Claude Code 去年 12 月前后变得那么火，原因之一就是它的极简 harness。很长一段时间里，它的工具集很受限，但仍然几乎什么都能做。在这个语境下，40 个其实也不算多。

Examples of powerful tools include Bash and SQL. You can do complex operations by giving an LLM access to the file system and a CLI. You can say, “Use Bash to do this or that.” It's effectively a complete language in its own right.

强大工具的例子包括 Bash 和 SQL。只要把文件系统和 CLI 交给 LLM，你就能做复杂的操作。你可以说：“用 Bash 做这个或那个。”它实质上本身就是一门完整的语言。

They stripped down a lot of what had become bloated. In the early days—and by that I mean around late 2024, when MCP came out—servers such as GitHub's had something like 110 tools out of the box: list issues, create an issue, comment on an issue, and so on. Those are useful, but they add a lot of context. The more you bloat the context, the worse the LLM can become at its task.

他们把很多已经变得臃肿的东西砍掉了。早期——我指的是 2024 年末 MCP 刚出来那会儿——像 GitHub 那样的 server 开箱就有 110 个左右的工具：列出 issue、创建 issue、给 issue 评论，等等。这些都有用，但它们会占用大量上下文。上下文越臃肿，LLM 做任务的表现可能越差。

Claude was a big step forward in consolidating that: keep it simple, start with three to five tools that do a lot, and expand from there. The general industry trend is toward reducing complexity. The more you can do with fewer tools, the better. People think about finding those powerful Swiss Army knife tools. SQL and Bash are two examples.

Claude 在整合这方面迈了一大步：保持简单，先给三到五个能办很多事的工具，再往外扩。整个行业的趋势是降低复杂度。用更少的工具能做越多事越好。大家在琢磨的是找那种强大的瑞士军刀式工具。SQL 和 Bash 就是两个例子。

Okay, the system prompt. Have people heard of system prompts? Familiar with them? I see some nods and a lot of silence. Cool.

好，system prompt。有人听说过 system prompt 吗？熟悉吗？我看到有人点头，还有一大片沉默。行。

Mihail Eric (34:30.87)
I'll assume the silence is agreement. For anyone who isn't familiar, a system prompt is effectively a blueprint for the LLM's behavior. I'll show you where it appears.

我就当沉默代表同意。对不熟悉的人来说，system prompt 实质上就是 LLM 行为的一份蓝图。我给你们看它在哪儿出现。

It's a block of text that defines aspects of the harness and its behavior, including guardrails and information about the environment. The harness injects this static text without you saying anything. You don't control this system prompt; the harness sets it. It also finds its way into every request Claude sends.

它是一段文本块，定义了 harness 的各个方面及其行为，包括护栏和环境信息。这段静态文本是 harness 在你什么都没说的情况下注入的。你控制不了这个 system prompt，是 harness 设定的。它还会进入 Claude 发出的每一个请求。

Let me show you. The tools take up a lot of space. The actual text of my conversation stops at about line 600, so I need to go back up here.

我给你们看。这些工具占了很多空间。我对话的实际文本大概到第 600 行就结束了，所以我得往上翻到这里。

Mihail Eric (35:32.942)
Okay, great. Above this was my conversation. Right here, there's a block literally called “system,” which defines the system prompt.

好，很好。这上面是我的对话。就在这里，有一个字面就叫“system”的块，它定义的就是 system prompt。

There are two blocks relevant to us. The first says, “You are Claude Code, Anthropic's official CLI for Claude.” That's the harness telling the LLM, in natural language, what it is as a system.

与我们相关的有两个块。第一个写着：“You are Claude Code, Anthropic's official CLI for Claude.” 这就是 harness 用自然语言告诉 LLM，它作为一个系统是什么。

The second block is where the more substantial instructions are. I'll expand it to show the contents. This is the Claude Opus 5.5 system prompt. It's about 80 lines—or closer to 50. It's quite a bit shorter than previous versions.

第二个块才是更实质的指令所在。我把它展开给你们看内容。这是 Claude Opus 5.5 的 system prompt。大概 80 行——或者更接近 50 行。比之前的版本短了不少。

Here's the blueprint of what the harness tells the LLM about its behavior: you're an interactive agent helping users with software engineering tasks. Here are things to be careful about, including security-related instructions. There's information about what the harness is and how to interact with it.

这就是 harness 告诉 LLM 的行为蓝图：你是一个交互式 agent，帮用户做软件工程任务。这些是要注意的地方，包括和安全相关的指令。还有关于 harness 是什么、该怎么和它交互的信息。

There's also information about sessions. These are things the creators of the Claude Code harness have decided the LLM should know when doing its task. There's a fairly large block about memory, which is a relatively new—

还有关于 session 的信息。这些都是 Claude Code harness 的创造者认为 LLM 在做任务时该知道的东西。有一块相当大的内容是关于 memory 的，这是相对较新的——

Mihail Eric (37:08.974)
—addition to Anthropic's systems and Claude Code: an implicit memory mechanism that learns from your behavior. In a sense, of course they should have something like this, but for a while, companies' attempts to implement it weren't very good. They've now revisited it.

——是 Anthropic 的系统和 Claude Code 里新增的：一种隐式的记忆机制，会从你的行为里学习。某种意义上，他们当然该有这种东西，但有一阵子，各家公司试着做出来的都不太好。现在他们重新拾起来了。

The memory is stored at this location in the file system. Every time the LLM determines it should write something to memory, the prompt specifies a format to use. If I opened that location, which I won't do in the interest of time, we'd see metadata blocks for the memories Claude has extracted. There are a lot of instructions about how to write and interact with those memories.

记忆存在文件系统的这个位置。每当 LLM 判断该往记忆里写点什么，prompt 里规定了要用的格式。如果我把那个位置打开——为了省时间我就不开了——我们会看到 Claude 提取出来的那些记忆的元数据块。关于怎么写、怎么和这些记忆交互，里面有大量指令。

There's information about the environment, including which Claude models are available, and a little information about context management.

还有环境信息，包括有哪些 Claude 模型可用，以及一点关于上下文管理的信息。

One quick note before I take questions: this is a much shorter system prompt. Until the last month or two, it was around 200 to 250 lines. Much of it explained things like how to use Git and issue tasks. Those were instructions considered important to give the model explicitly, but they seem less necessary now.

在提问之前我快速说一句：这个 system prompt 短多了。直到这一两个月之前，它还是 200 到 250 行左右。里面很多内容在解释怎么用 Git、怎么做 issue 之类的任务。当时认为这些指令必须明确交给模型，但现在看来没那么必要了。

I suspect the training process has captured much of that information in the model's parameters. This connects to the point about reducing MCP tools to avoid context bloat: we also want to reduce the bloat from an incredibly long system prompt.

我猜训练过程已经把其中很多信息固化进模型参数里了。这就和刚才说的“减少 MCP 工具以避免上下文臃肿”接上了：我们也想减少超长 system prompt 带来的臃肿。

I think about a month ago they reduced the system prompt by about 8%. They'll try to strip out as much as they can because I didn't write any of this, yet every time—

我记得大概一个月前，他们把 system prompt 砍掉了大约 8%。他们会尽量往下砍，因为这些东西一个字都不是我写的，可每次——

Mihail Eric (39:11.008)
—I issue a request to Claude, it's in my context window. I don't even see it, but it's there. By my first request, perhaps tens of thousands of tokens have already been consumed by material outside my control. [Numerical comparison unclear in the transcript.]

——我向 Claude 发一个请求，它就在我的上下文窗口里。我根本看不见它，但它就在那儿。到我发第一个请求的时候，可能已经有几万个 token 被我控制不了的东西吃掉了。[此处录音不清]

Then I'm confused when it doesn't work or performs worse than expected. I think they want to reduce that surprise for users.

然后它不工作、或者表现不如预期的时候，我就懵了。我觉得他们是想减少用户这种意外感。

[Brief exchange unclear.]

[此处录音不清]

Mihail Eric (39:55.074)
You absolutely can't. [The preceding question is unclear.] I'm sure people have tried. People have been trying prompt injection for a long time, and I imagine they've addressed the simplest attempts. I don't think this is their secret sauce, and I'm sure they have a whole team dedicated to preventing that kind of situation.

你绝对做不到。[此处录音不清] 我肯定有人试过。prompt injection 人们试了很久了，我猜最简单的那些招他们已经堵上了。我不觉得这是他们的什么独门秘方，而且我肯定他们有整整一个团队专门防这种事。

Mihail Eric (40:19.137)
I don't see it as quite as troublesome an attack vector as you might think. Two things: first, capturing these requests and responses isn't hard. There's an open-source tool for it. Second, they leaked their whole system about six months ago, or something like that, so it wasn't entirely a choice.

我不觉得这个攻击面有你想的那么麻烦。两点：第一，抓这些请求和响应并不难，有开源工具能干这事。第二，他们大概半年前把整个系统泄了，差不多就那时候，所以这也不完全是他们主动的选择。

I didn't use the leaked code. I used ordinary, Wireshark-style inspection, and I was able to do this even before the leak. When it happened, people said, “Oh my God, now we know how Claude works.” But we already knew how it worked. We didn't need a code leak for that.

我没用泄露的代码。我用的是普通的、Wireshark 式的那种抓包查看，而且在泄露之前我就能做到。泄露发生的时候，大家说：“天呐，现在我们知道 Claude 怎么工作的了。”可我们早就知道它怎么工作了。我们不需要代码泄露来知道这个。

You could do the same thing with Codex. Its harness is literally on GitHub. So I don't think visibility into the harness is as much of an attack vector as you might expect.

你用 Codex 也能这么干。它的 harness 就明明白白放在 GitHub 上。所以我不觉得 harness 可见性有你想的那么大的攻击面。

[Brief exchange unclear.]

[此处录音不清]

Mihail Eric (41:30.849)
You're jumping ahead. We're going to talk about CLAUDE.md right after this, so I'll answer that in a minute or two.

你们又跳到后面去了。我们紧接着就要讲 CLAUDE.md，所以我过一两分钟再回答那个。

The question is: there's a memory path here, so is the memory local to each execution of Claude Code, or something else? Given how the path is defined, I think this is at the project level. Here you can see the path to where my code exists, and a similar setup would exist for other projects.

问题是：这里有一个 memory 路径，那这个记忆是每次执行 Claude Code 时本地的，还是别的什么？看这个路径怎么定义的，我觉得是在项目层级。这里你能看到我代码所在位置的路径，其他项目也会有类似的设置。

Is that memory also appended to the system prompt? “Appended” is a strong word. I'd think of these as separate blocks that get concatenated into the prompt sent in the request. It's part of the prompt, but I would still think of it as a separate object from the system prompt itself.

那这个记忆也会被追加到 system prompt 后面吗？“追加”这个词有点重。我会把它们想成不同的块，在请求里被拼接进发给模型的 prompt。它是 prompt 的一部分，但我仍然会把它当成独立于 system prompt 本身的一个对象。

Okay, one more question, then let's move forward. A question about the memory system—[remainder of question unclear].

好，再一个问题，然后我们就往下走。一个关于记忆系统的问题——[此处录音不清]

Mihail Eric (42:44.417)
That's a good callout, and these design decisions are benchmark-driven. The question was: where does retrieval happen? Should we use RAG or GraphRAG to pull in relevant memories?

这点提得好，而这些设计决策是 benchmark 驱动的。问题是：检索发生在哪一步？我们该用 RAG 还是 GraphRAG 来拉取相关的记忆？

It turns out that the added complexity of those systems doesn't always provide much advantage over letting the system parse flat text. Research and benchmarks have looked at this. It depends a lot on the task, so I won't make a blanket generalization.

结果发现，那些系统带来的额外复杂度，相比让系统直接解析扁平文本，并不总能带来多少优势。研究和 benchmark 都看过这个问题。这很大程度上取决于任务，所以我不会一概而论。

At the company where I work, we've built our own harness and agent. We're in sales rather than coding, and we've also ended up using flat files for memory.

在我工作的公司，我们自己搭了 harness 和 agent。我们做的是销售，不是写代码，最后我们也是用扁平文件来做记忆。

Okay, CLAUDE.md: these are agent configuration files. CLAUDE.md is specific to Claude, while AGENTS.md is the more universal standard. It seemed everyone had agreed on AGENTS.md except Anthropic, which wanted to do things differently. Then, a few weeks ago, they started joining the party too. You can symlink CLAUDE.md to AGENTS.md. Trying to be different didn't really pay off in this case.

好，CLAUDE.md：这些是 agent 配置文件。CLAUDE.md 是 Claude 专属的，而 AGENTS.md 是更通用的标准。看起来除了 Anthropic，大家都认同 AGENTS.md 了，而 Anthropic 想搞点不一样的。然后几周前，他们也开始加入这个队伍了。你可以把 CLAUDE.md 软链接到 AGENTS.md。在这个事情上，想标新立异并没有真正得到好处。

Mihail Eric (44:22.863)
They're functionally the same. They operate in the same way and serve the same purpose, but have different names. It's an annoyance when you switch between Codex and Anthropic. A very weak walled garden, I'd say.

功能上它们是一样的。运作方式相同，目的相同，只是名字不同。你在 Codex 和 Anthropic 之间切换的时候就很烦。要我说，这是一个非常弱的围墙花园。

This is a user-controlled counterpart to the system prompt. The system prompt is static, set by the harness, and injected behind the scenes. CLAUDE.md is also injected, but we control it.

这是 system prompt 的一个由用户控制的对应物。system prompt 是静态的，由 harness 设定，在后台注入。CLAUDE.md 也会被注入，但它由我们控制。

Let's go back to the code. In this to-do app, among a bunch of other files, I have a CLAUDE.md that describes the project's structure at a high level. I don't want to spend too much time on how to design one optimally, because we'll devote an entire lecture to customizing agents and making these files useful.

我们回到代码部分。在这个待办应用里，除了一堆其他文件，我还有一个 CLAUDE.md，它从比较高的层面描述了项目结构。我不想花太多时间讲怎么把它设计得最优，因为我们会用一整节课讲如何定制 agent、如何让这些文件真正有用。

For now, all I want you to know is that I wrote this. Well, Claude and I wrote it together. We collaborated. At its core, it's a description of where things are in the project.

现在你只需要知道，这是我写的。嗯，是我和 Claude 一起写的。我们协作完成。它的核心内容就是描述项目里各个东西都在哪。

Now let's return to the top of the trace. Remember, my first command was, “What are the core components of this to-do app?” That's what I typed. Everything above it is technically part of this user block, but it isn't something I explicitly entered there. I didn't type “system reminder” or any of that other material. The harness added it behind the scenes.

现在我们回到 trace 的顶部。记住，我的第一条命令是：“这个待办应用的核心组件有哪些？”这就是我输入的。它上面所有的内容，严格来说都属于这个 user 块，但并不是我显式输入进去的。我没有敲过“system reminder”或者那些别的材料。是 harness 在背后加进去的。

One of those additions is the contents of my CLAUDE.md. If you look at the—

其中一项附加内容就是我的 CLAUDE.md 的内容。如果你看——

Mihail Eric (46:09.871)
—top block, it says these instructions override default behavior and must be followed exactly as written. Then it gives the path to my CLAUDE.md.

——最上面那个块，它说这些指令会覆盖默认行为，必须完全按照写的那样执行。然后它给出了我 CLAUDE.md 的路径。

I'll expand this block. Maybe I didn't put it in its own separate file. Let me find the configuration files. Okay, here it is. This is that block copied into an empty file, matching the CLAUDE.md I showed earlier.

我把这个块展开。也许我并没有把它放在单独的文件里。让我找一下配置文件。好，在这里。这就是把那个块复制到一个空文件里的结果，内容和我之前展示的 CLAUDE.md 一致。

This is where I have control over the behavior of the LLM, or the coding agent in this case.

这里就是我能控制 LLM 行为的地方，在这个场景里就是控制编码 agent 的行为。

Mihail Eric (47:05.085)
[Opening exchange unclear.]

[此处录音不清]

In general, the consensus on CLAUDE.md or AGENTS.md is that it's helpful to include some directions for running the code, such as tests and starting the server, but not too many. It's a fine line. If you include too much, you overconstrain the system.

总的来说，关于 CLAUDE.md 或者 AGENTS.md 的共识是：写一些怎么跑代码的说明是有帮助的，比如怎么跑测试、怎么启动服务，但不要写太多。这是一条很细的界线。如果你写太多，就会过度约束系统。

That's one reason people are becoming more minimalist with system prompts and similar instructions. You think you're helping by giving it more information, but you can end up overconstraining it, almost overfitting it to your instructions.

这也是为什么人们在 system prompt 和类似指令上越来越极简。你以为给它更多信息是在帮它，但结果可能是过度约束，几乎是把它过拟合到你的指令上。

Usually, you wouldn't include entire blocks of code. You might include one or two commands: the exact command to run unit tests, or the one to start the server. Again, I don't want to spend too much time on this right now.

通常你不会把整块代码放进去。你可能会放一两条命令：跑单元测试的确切命令，或者启动服务的那条。再说一次，我现在不想在这上面花太多时间。

Okay, one question, then we'll move on.

好，一个问题，然后我们继续。

Mihail Eric (48:03.021)
It's so you can go from raw text to something a little prettier. I could have given it a .txt extension. This is just for demonstration.

这样做是为了让你能从原始文本变成稍微好看一点的东西。我本来也可以给它一个 .txt 扩展名。这只是为了演示。

To clarify, that block doesn't exist as a separate Markdown file in the trace. I pulled it out of the JSON and put it into an empty file. That's the operation I performed.

澄清一下，那个块在 trace 里并不作为一个单独的 Markdown 文件存在。我是把它从 JSON 里抽出来，放进一个空文件。这就是我做的操作。

All right, let's talk about plan mode. It's a mode you can use when talking to these agents, specifically for designing specifications and working through harder tasks.

好，我们来讲 plan mode。这是你和这些 agent 对话时可以用的一种模式，专门用来设计规格、处理更难的任务。

Maybe nine or more months ago, most coding agent harnesses introduced a plan mode. It's a way to develop specs and go back and forth with the user to clarify requirements and architecture.

大概九个月甚至更久以前，大多数编码 agent harness 都引入了 plan mode。它是一种编写规格、并和用户来回沟通以澄清需求和架构的方式。

I could show it in the trace, but in the interest of time, I'll share the trace with you. You'll also capture your own traces in the assignment, so you'll see it yourself.

我可以在 trace 里展示它，但为了节省时间，我会把 trace 分享给你们。你们在作业里也会自己抓 trace，所以会亲眼看到。

This is the plan-mode prompt. It's literally a block of text. I'm using Claude Code here, but the idea generalizes to pretty much every modern coding harness, including Codex. You can switch into plan mode. In Claude's case, there's a tool for entering that mode—I forget its exact name—and the harness injects this block of text explaining what to do. When you're finished, there's a separate tool to exit plan mode.

这是 plan mode 的 prompt。它就是一段文本。我这里用的是 Claude Code，但这个思路几乎可以推广到所有现代编码 harness，包括 Codex。你可以切换到 plan mode。在 Claude 的情况下，有一个工具用来进入这个模式——我忘了它确切叫什么——然后 harness 会注入这段文本，说明该怎么做。做完之后，有另一个单独的工具来退出 plan mode。

As the name suggests, it's for planning a larger task. Claude's prompt describes a workflow for generating plans. Phase one is understanding the user's requirements, and the harness explains how you're—

顾名思义，它是用来规划更大的任务的。Claude 的 prompt 描述了一套生成计划的工作流。第一阶段是理解用户的需求，harness 会说明你该——

Mihail Eric (50:12.483)
—supposed to do that. There's even a point where you kick off agents to explore the codebase. That's all part of phase one. Phase two is design. Then there's a review phase, a final plan, and instructions to exit plan mode when you're done.

——该怎么去做。甚至有一个环节是启动 agent 去探索代码库。这些都算第一阶段。第二阶段是设计。然后是一个评审阶段、一份最终计划，以及完成之后退出 plan mode 的指令。

An important part is the artifact generated at the end: the plan file. That's what you produce after working through the steps of planning the task.

很重要的一部分是最后产出的工件：计划文件。这就是你走完规划任务的各个步骤之后得到的东西。

For this demonstration, I wanted to extend my to-do app to support scheduled tasks or periodic reminders, such as “Water my plants every week.” I entered plan mode, went back and forth with it, and generated a plan. That process started with this prompt being injected; the LLM followed it, and we worked through the plan together.

在这次演示里，我想扩展我的待办应用，让它支持定时任务或者周期性提醒，比如“每周给植物浇水”。我进入 plan mode，和它来回沟通，生成了一份计划。这个过程从注入这个 prompt 开始；LLM 照着它做，我们一起把计划做了出来。

Mihail Eric (51:14.773)
Skills have come up a few times. We'll spend a lot of time on them, including an entire lecture on optimal skill design. For now, I want to give you a taste of what they are.

Skills 已经出现过几次了。我们会在它们上面花很多时间，包括一整节课讲怎么设计出最优的 skill。现在，我只想让你大致感受一下它们是什么。

At their core, skills describe a written procedure. That can include multiple tool calls and scripts stitched together with prompts, allowing more elaborate tasks.

从核心上讲，skill 描述的是一套写下来的流程。它可以包含多次工具调用，以及用 prompt 串起来的脚本，从而实现更复杂的任务。

Skills can be invoked proactively based on the context, or explicitly by the user. For example, I could ask it to review my code, or it could detect that a task is complete and invoke a code-review skill.

Skill 可以根据上下文被主动调用，也可以由用户显式调用。比如，我可以让它审查我的代码，或者它可以判断某个任务已经完成，然后调用一个 code review skill。

I wrote a skill for this class called “check code quality.” The pattern is to define a SKILL.md file. We'll spend more time on how to write these, but here I've just described what to do and what good code quality looks like compared with poor code quality.

我为这门课写了一个 skill，叫“check code quality”。做法是定义一个 SKILL.md 文件。我们后面会花更多时间讲怎么写这些文件，但这里我只是描述了该做什么，以及好的代码质量相比差的代码质量是什么样。

The trace shows where the skill was invoked. Let me show you.

trace 里能看到这个 skill 是在哪里被调用的。我给你们看一下。

Mihail Eric (52:41.773)
At one point in the conversation, I explicitly invoked the skill because I wanted it to appear in the trace. I said something like, “Check my code quality. Use the skill.”

在对话的某个点上，我显式调用了这个 skill，因为我想让它出现在 trace 里。我说的大概是：“检查一下我的代码质量。用那个 skill。”

Under the hood, a text block was injected with a command message for “check code quality.” That indicates to the LLM that it's time to check the code's quality. The harness then pulls in the contents of the skill file. Here you can see it locating the file and inserting its contents into the context.

在底层，注入了一个文本块，里面是针对“check code quality”的命令消息。这就告诉 LLM，该去检查代码质量了。然后 harness 会把 skill 文件的内容拉进来。这里你可以看到它在定位这个文件，并把内容插入到上下文里。

Mihail Eric (53:30.029)
One more minute, then I'll go through the last one or two smaller points.

再讲一分钟，然后我过一下最后一两个小点。

Mihail Eric (53:40.343)
Subagents let you delegate parts of a task. You have a main orchestrator agent, the main control loop in Claude Code, and you can invoke helpers or workers with their own fresh context windows. That lets you parallelize work and define specific behaviors for different tasks.

Subagent 让你可以把任务的一部分委托出去。你有一个主 orchestrator agent，也就是 Claude Code 里的主控制循环，你可以调用一些 helper 或者 worker，它们有自己全新的上下文窗口。这样你就能并行处理工作，也能为不同任务定义不同的行为。

When those workers finish, they return their outputs to the main agent. The benefit is that each subagent starts with a fresh context rather than inheriting all the context of the parent. Its exploration happens outside the main control flow, and the result is brought back when it's done. It's a way to manage context more effectively.

这些 worker 完成后，会把输出返回给主 agent。好处是每个 subagent 都从全新的上下文开始，而不是继承父级的全部上下文。它的探索发生在主控制流之外，做完之后结果再被带回来。这是一种更有效地管理上下文的方式。

I called a subagent at one point in this trace. You can see the tool call. I think I asked it to check performance, or something like that; I don't remember exactly. The point is that an agent was spawned through a tool call, did its work, and returned the result.

在这个 trace 的某个点上，我调用了一个 subagent。你能看到那次工具调用。我想我是让它检查性能，或者类似的事情；我记不太清了。重点是，通过一次工具调用派生出了一个 agent，它做完自己的工作，然后返回结果。

There are also hooks, which I'll touch on only briefly. The last big topic is compaction. You may have heard that term. When your context gets increasingly long, compaction is a way to—

另外还有 hooks，我只简单提一下。最后一个大主题是 compaction（上下文压缩）。你可能听过这个词。当你的上下文越来越长时，compaction 是一种——

Mihail Eric (55:25.327)
—consolidate and summarize it, reducing context bloat. There's a compact mode, much as there's a plan mode. Compaction happens in one of two ways: automatically, when you're about to exceed the context window, perhaps approaching a million tokens or whatever the limit is; or manually, when you invoke it yourself.

——把它整合、总结，减少上下文膨胀的方式。有 compact mode，就像有 plan mode 一样。Compaction 有两种触发方式：自动触发，在你即将超出上下文窗口时，也许接近一百万 token，或者不管上限是多少；或者手动触发，由你自己调用。

We'll discuss best practices for when to invoke it proactively. There's a whole prompt governing how to produce the summary. The summary then replaces the context it summarizes. For example, you might take 500,000 tokens and compact them into 150,000. That's what the LLM sees moving forward.

我们会讨论什么时候应该主动调用它的最佳实践。有一整套 prompt 规定怎么生成摘要。然后摘要会替换掉它所总结的那部分上下文。比如，你可能把 500,000 个 token 压缩成 150,000 个。之后 LLM 看到的就是这个。

Okay, last slide, then we'll wrap up. I've gone a little over. Sorry about that.

好，最后一页，然后我们收尾。我有点超时了。抱歉。

Hopefully this has given you a taste of what goes into more complex harnesses. There are a lot of bells and whistles around the core loop, but the trend is toward simplicity. We still want fewer, more powerful tools.

希望这让你大致感受到了更复杂的 harness 里都有些什么。核心循环周围有很多花里胡哨的东西，但趋势是走向简单。我们想要的仍然是更少、但更强大的工具。

It's hard to demonstrate that without showing a before-and-after comparison, but the roughly 40 native tools in Claude are a smaller set than in past versions of the harness. Harness designers are relying more on the capabilities of the underlying model—

不做一个前后对比，很难演示这一点，但 Claude 里大约 40 个原生工具，比过去版本的 harness 要少。Harness 的设计者越来越依赖底层模型的能力——

Mihail Eric (57:04.491)
—rather than having the harness do the heavy lifting for difficult tasks.

——而不是让 harness 去为困难任务干重活。

That's a big question in agent design: do you invest in the model or the harness? We regularly seesaw between the two. Sometimes people say the value and a company's moat are in the harness. Then they point to the billions of dollars spent training LLMs and argue that the investment should go into the models. We go back and forth all the time.

这是 agent 设计里的一个大问题：你该投资在模型上，还是投资在 harness 上？我们经常在这两者之间摇摆。有时候人们说，价值和公司的护城河在 harness 里。然后他们又指出训练 LLM 花掉的几十亿美元，主张投资应该放在模型上。我们一直在来回反复。

Right now, we're at a point where people want the harness to be as simple and concise as possible. You can still do interesting things in it; just be careful about blowing up the context.

现在，我们处在一个人们希望 harness 尽可能简单、精简的阶段。你仍然可以在里面做有意思的事；只是要小心别把上下文撑爆。

We'll talk about something called the “dumb zone,” which is an official term in coding. No, it's just an informal name for when the LLM starts getting less effective. We'll discuss how to avoid it, and many context-engineering principles come into play there.

我们会讲一个叫“dumb zone”的东西，这是编码里的一个正式术语。不，它只是一个非正式的叫法，指 LLM 开始变得不那么有效的时候。我们会讨论怎么避免它，那里会用到很多上下文工程的原则。

One last point about simplicity in harnesses: prompt lengths change. Sometimes they're long; sometimes they're short. Right now, the tendency is toward shorter prompts because we want to avoid context bloat and be mindful of context windows. Shorter prompts are also easier to adapt to the task.

关于 harness 的简单性，最后一点：prompt 的长度是会变的。有时候长，有时候短。现在趋势是更短的 prompt，因为我们想避免上下文膨胀，也要顾及上下文窗口。更短的 prompt 也更容易针对任务做调整。

All right. I'll stay for questions. Thank you for staying a little over. We'll go into more of this next week.

好。我会留下来回答问题。谢谢你们多留了一会儿。下周我们会继续深入讲这些。

---

> **译者注**：本文是课堂讲座的口语转写稿，保留了讲者原话的节奏与会场互动（提问、设备调试、跑题）。文中提到的 Opus 5.5、约 40 个原生工具、约 50 行的 system prompt、之前一次泄露事件等，都是讲者在本节课上的表述，属于特定时间点的观察，不宜当作长期参数。
