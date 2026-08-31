---
title: 我的智能体配置方案
description: Chad Arimura 分享他组建「AI 员工团队」一个月实验的完整配置：六个各司其职的 Hermes 智能体、Buzz 通信、Obsidian 记忆与真实用例
tags:
  - clippings
  - agent
  - ai-agent
  - llm
  - workflow
source: https://chad.cm/posts/2026-8-11-my-agent-setup
created: 2026-08-13
author: Chad Arimura
---

## 我的智能体配置方案

> **原文**：[My agent setup](https://chad.cm/posts/2026-8-11-my-agent-setup) | 作者：Chad Arimura | 日期：2026-08-11

## 📝 摘要

Chad Arimura 分享了他组建「AI 员工团队」约一个月的实验。他搭建了六个各司其职的 Hermes 智能体（ea/ops/dev/gtm/research/vps-agent），跑在一台 8GB 内存的 DigitalOcean Droplet 上，统一使用 GPT-5.6 模型，通过 SOUL.md、AGENTS.md、技能、MCP 服务器、Mnemosyne 记忆库和共享 Obsidian wiki 定义。通信方面，他采用 Buzz（基于 Nostr 的开源协作工具），并已落地 Sentry 自动响应、晨间简报、每日工作报告等用例。文章坦诚回应了「为什么不用一个智能体包办一切」「是否值得」等疑问，核心原则是最小权限与可移植、可替换的开源组件。

## 📋 术语表

| 英文            | 中文       | 说明                                                  |
| --------------- | ---------- | ----------------------------------------------------- |
| agent           | 智能体     | 能自主执行任务的 AI 程序，文中指作者组建的「AI 员工」 |
| Hermes          | Hermes     | 一种 Agent 运行时框架                                 |
| MCP server      | MCP 服务器 | 模型上下文协议服务器，为智能体提供工具能力            |
| Mnemosyne       | Mnemosyne  | 一个记忆库系统，为智能体提供持久记忆                  |
| Obsidian        | Obsidian   | 基于本地 Markdown 的笔记/知识库软件                   |
| Linear          | Linear     | 项目管理/工单跟踪工具                                 |
| Sentry          | Sentry     | 应用性能监控与错误追踪平台                            |
| Nostr           | Nostr      | 去中心化社交协议，基于密钥对和事件                    |
| NIP             | NIP        | Nostr Implementation Possibility，Nostr 协议规范编号  |
| least privilege | 最小权限   | 只授予完成任务所必需权限的安全原则                    |
| blast radius    | 爆炸半径   | 安全事故可能影响的范围                                |
| me-in-the-loop  | 人在环内   | 关键决策仍需人工参与的工作模式                        |

---

## 正文（双语对照）

My agent setup

我的智能体配置方案

(this was written by a human. I had my gtm-agent review and make some changes, but I then mostly reversed all of those taking me 10x more time than had I just shipped it with missing commas, run-on sentences, and 6 instead of six. Refer to "Has it been worth it?" at the end.)

（这篇文章是人写的。我让我的 gtm-agent 审阅并做了一些修改，但随后我又几乎全部改了回去——这花费的时间，比直接发布带着缺逗号、连写句、用「6」而不是「six」这些毛病的原稿还要多 10 倍。参见文末的「这一切值得吗？」一节。）

A few people have asked about my agent setup, but first let me talk about the goal. I'm working on a few products as well as a nonprofit. The only product I've mentioned so far is The Daily FM, which is just something I wanted so I built it.

有几个人问过我的智能体配置，但首先让我谈谈目标。我在同时做几个产品和一个非营利组织。我目前唯一提过的产品是 The Daily FM，那只是因为我想要一个这样的东西，于是自己做了出来。

The goal of all this agent experimentation is to scale multiple products and the nonprofit with fewer staff and volunteers than would otherwise be needed. In short, I'm creating a staff of agents. I'm about a month into this charade, so it's still early days.

所有这些智能体实验的目标，是用比原本所需更少的员工和志愿者来扩展多个产品和非营利组织。简而言之，我正在组建一支由智能体组成的「员工队伍」。我在这件事上已经折腾了大约一个月，所以还处于早期阶段。

I know the leading influencers in the space are yelling into their mics about thousands of agents (what happened to swarms?), self-improving loops (or is it graphs?), etc., but before getting to thousands, I'd like to start with a modest six.

我知道这个领域的头部意见领袖们正对着麦克风高喊成千上万个智能体（那些「群体 swarm」怎么了？）、自我改进循环（还是叫「图 graphs」？）之类的概念，但在到达成千上万之前，我想先从朴实的六个开始。

## The agents

## 这些智能体

### Profiles

### 成员档案

1. ea-agent: My executive admin. It's basically there to remind me of stuff, interact with my calendar, and manage work in Linear like a program manager.

1. ea-agent：我的执行助理。它基本上就是负责提醒我各种事情、和我的日历交互，并像项目经理一样在 Linear 里管理工作。

1. ops-agent: Monitors site performance and Sentry, makes sure stuff keeps running, and triages issues. It either fixes them, assigns them to dev-agent, or sends them to me.

1. ops-agent：监控网站性能和 Sentry，确保一切持续运行，并对问题进行分诊。它要么自己修复，要么把问题分配给 dev-agent，要么转交给我。

1. dev-agent: My core developer, with GitHub access to a few projects.

1. dev-agent：我的核心开发者，拥有几个项目的 GitHub 访问权限。

1. gtm-agent: My marketer. It looks at funnels, traffic numbers, and social media, and has skills for writing and social media management.

1. gtm-agent：我的营销人员。它会关注转化漏斗、流量数据和社交媒体，并具备写作和社交媒体管理方面的技能。

1. research-agent: Searches the web, does long asynchronous research, and builds reports.

1. research-agent：搜索网页、进行长时间的异步研究，并生成报告。

1. vps-agent: My infrastructure manager, with root access to the agent box. It can create new agents, add MCP servers and skills, and handle server maintenance. It only responds to me in Buzz.

1. vps-agent：我的基础设施管理员，拥有智能体服务器的 root 权限。它可以创建新智能体、添加 MCP 服务器和技能，并处理服务器维护。它在 Buzz 中只响应我一个人。

### Runtime and memory

### 运行时与记忆

All the agents are currently Hermes agents, but I predict this will change at some point. They are defined by SOUL.md, AGENTS.md, skills, tools, MCP servers, a Mnemosyne memory bank per profile, and a shared Obsidian wiki synced to my machine. In theory this is all portable. It's just a few easily-locatable 1's and 0's. Right? RIGHT?

目前所有智能体都是 Hermes 智能体，但我预测这迟早会变。它们由 SOUL.md、AGENTS.md、技能、工具、MCP 服务器、每个档案独立的 Mnemosyne 记忆库，以及一个同步到我机器上的共享 Obsidian wiki 来定义。理论上这些都是可移植的。不过是几个易于定位的 1 和 0 而已。对吧？对吧？！

Obsidian is proving to be really cool. Like everyone else I discovered it when Karpathy published his LLM wiki brain dump. It didn't click at first, but the more I use it, the more useful it becomes as a "business operating manual." It lets me capture processes so agents can spin up and just know how things work 'round here.

Obsidian 被证明非常酷。和所有人一样，我是 Karpathy 发布他的 LLM wiki「脑内倾倒」时才发现的它。起初没太 get 到，但用得越多，它作为「企业运营手册」就越有用。它让我能把流程记录下来，这样智能体一启动就能知道这里的各种事情是怎么运作的。

### Models

### 模型

Currently all agents use OpenAI GPT-5.6 Sol and can spin up subagents using GPT-5.6 Terra. I was originally using Anthropic's Fable, but I got slapped with an API bill and realized Anthropic doesn't allow subscription usage for this setup, so I switched to GPT.

目前所有智能体都使用 OpenAI GPT-5.6 Sol，并能用 GPT-5.6 Terra 启动子智能体。我原本用的是 Anthropic 的 Fable，但收到一张 API 账单后才意识到，Anthropic 不允许这种配置使用订阅额度，于是切换到了 GPT。

Frontier models are mostly interchangeable for this type of work. I probably don't need Sol and will adjust if needed. I'd love to use an open-weights model, but I have little incentive to switch when a $100 OpenAI subscription gets the job done. I'd even move to the $200 plan if needed.

对于这类工作，前沿模型大体上是可以互换的。我可能并不需要 Sol，如果需要会再调整。我很想用开源权重模型，但既然每月 100 美元的 OpenAI 订阅就能搞定，我就没什么动力去切换。如果有必要，我甚至愿意升级到 200 美元的档位。

### Compute

### 算力

All six run on a simple DigitalOcean Basic Droplet: 4 vCPUs, 8 GB RAM, and 160 GB of disk. I did have to upgrade from 4 gigs RAM because the box kept swapping to disk. I secure it with Tailscale and don't expose any public ports.

六个智能体都运行在一台简单的 DigitalOcean 基础 Droplet 上：4 个 vCPU、8 GB 内存和 160 GB 磁盘。我确实从 4 GB 内存升级过，因为那台机器一直在往磁盘做交换（swap）。我用 Tailscale 保护它，不对外暴露任何公共端口。

### Coding

### 编码

I mentioned dev-agent above, but I still use Claude Code with Fable, and Codex as a fallback, for 95% of my coding. I just feel at home in the terminal on my local machine, watching code changes and reasoning happen in real time. I know... so uncool.

上面提到了 dev-agent，但我 95% 的编码工作仍然使用 Claude Code（搭配 Fable），Codex 作为备选。我只是在自己的本机终端里觉得自在，喜欢实时看着代码变更和推理过程发生。我知道……太不时髦了。

## Communication

## 通信

### Buzz

### Buzz

As I've talked about before, I'm working with Buzz, an open-source Slack alternative by Block with first-class agent support. It's early still, v0.5.9 at the time of writing, and you need to install the iPhone app manually, but it has a ton of promise. My vps-agent can create a new agent and connect it to Buzz as another member of the team in about 10 minutes.

正如我之前谈到的，我正在使用 Buzz——Block 出品的一个开源 Slack 替代品，对智能体有一流的支持。它还处于早期阶段，写作时是 v0.5.9，iPhone 应用需要手动安装，但它潜力巨大。我的 vps-agent 可以在大约 10 分钟内创建一个新智能体，并把它作为团队的又一名成员接入 Buzz。

All agents respond to DMs without a callout. In rooms, they require one (for example, @ea-agent). They can talk to each other, except for vps-agent, which only I can talk to.

所有智能体在私聊（DM）中无需 @ 点名就会响应。在房间里，它们需要被点名（例如 @ea-agent）。它们可以互相交谈，唯独 vps-agent 只能和我对话。

### Nostr

### Nostr

Buzz runs on the Nostr protocol, which is also pretty cool. It's small and open and defines its specifications through unfortunately-acronymed NIPs. At its core, NIP-01 defines a universal signed event, key-based authorship, WebSocket relays, and filterable real-time subscriptions. Buzz extends that into channels and operational events.

Buzz 运行在 Nostr 协议之上，这同样相当酷。它小巧而开放，通过缩写不太优雅的 NIPs 来定义规范。其核心 NIP-01 定义了一个通用签名事件、基于密钥的作者身份、WebSocket 中继，以及可过滤的实时订阅。Buzz 在此基础上扩展出了频道和运营事件。

Agents are literally just keypairs. Any community can host its own relay, and new event types use the same signing and authentication model. I just think this is so cool.

智能体实际上只是一对密钥对。任何社区都可以自建中继，新的事件类型沿用相同的签名和认证模型。我就是觉得这太酷了。

### Workflows

### 工作流

As I mention below, I've already set up webhooks that post messages into Buzz from external systems. Buzz can format the messages and call out specific users.

正如我下面提到的，我已经设置了一些 webhook，能从外部系统把消息发到 Buzz 里。Buzz 可以格式化这些消息并点名特定的用户。

```
name: sentry_notifier
description: Post Sentry alerts to Buzz
trigger:
  on: webhook
steps:
  - id: step_1
    name: send_message
    if: "trigger_action == \"created\""
    action: send_message
    text: |
      🚨 Sentry issue created:
      {{trigger.data | truncate(1000)}}
      @ops-agent please triage — the JSON head above has the issue id, title,
      and permalink; use your Sentry MCP for full details.
```

```
name: sentry_notifier
description: 将 Sentry 告警发布到 Buzz
trigger:
  on: webhook
steps:
  - id: step_1
    name: send_message
    if: "trigger_action == \"created\""
    action: send_message
    text: |
      🚨 Sentry issue created:
      {{trigger.data | truncate(1000)}}
      @ops-agent please triage — the JSON head above has the issue id, title,
      and permalink; use your Sentry MCP for full details.
```

## Some use cases

## 一些用例

Remember, I'm only a month in. But a few interesting use cases have emerged so far.

请记住，我才刚上手一个月。但到目前为止已经涌现出几个有趣的用例。

### Automated Sentry response

### 自动化 Sentry 响应

My apps create Sentry events for various error types, high latency, and other problems. New events post into Buzz, where Buzz Workflows can format the message and call out ops-agent or even an agent team (a Buzz construct that I don't use).

我的应用会为各种错误类型、高延迟和其他问题创建 Sentry 事件。新事件会发布到 Buzz，在那里 Buzz Workflows 可以格式化消息并点名 ops-agent，甚至是整个智能体团队（这是 Buzz 的一个构造，我还没用）。

Once it receives the alert, ops-agent analyzes the root cause across Sentry, Cloudflare, and the code, provides a report, and attempts to fix the issue. This process is still 100% me-in-the-loop, but I can see a lot of room for independent automation.

一旦收到警报，ops-agent 会跨 Sentry、Cloudflare 和代码分析根因，提供一份报告，并尝试修复问题。这个过程目前还是 100% 人在环内（me-in-the-loop），但我能看到大量独立自动化的空间。

### Simple development tasks

### 简单的开发任务

As mentioned in the coding section above, I'm not ready to let go of driving the terminal, but I have started to outsource some stuff. An easy example: if I'm looking at one of my websites on the go and come up with an idea, I can pop it into Buzz and have the agent complete it.

正如上文「编码」一节提到的，我还没准备好放开对终端的掌控，但已经开始外包一些事情。一个简单的例子：如果我在外面浏览自己的某个网站时想到一个点子，我可以把它丢进 Buzz，让智能体来完成它。

The next step is to set up a proper software factory and have the agents react to Linear tickets. Ticket in, PR out, sounds neat.

下一步是搭建一个像样的「软件工厂」，让智能体响应 Linear 工单。工单进、PR 出，听起来很棒。

### Morning work briefing

### 早晨工作简报

ea-agent looks through Linear tickets, my calendar, and conversations from the previous day to triage and recommend what I should work on.

ea-agent 会浏览 Linear 工单、我的日历和前一天的对话，进行分诊并推荐我该做什么。

### Social calendar review

### 社媒日历审查

gtm-agent reviews a content calendar every day, lets me know about gaps, and can recommend content. I'm gun-shy in this area for lots of reasons, mostly because I'm not really a post-for-any-reason on socials kind of guy. I don't "just want clicks" I want to authentically share what I think is useful, in my voice (see header at the top of this post). We'll see how this evolves as I announce more of the things I'm working on.

gtm-agent 每天审查内容日历，告诉我有哪些空缺，并能推荐内容。在这个领域我有点畏首畏尾，原因很多，主要是因为我并不是那种会为了发而发社交内容的人。我不「只想要点击量」，我想用自己的声音（见本文开头的题记）真实地分享我认为有用的东西。随着我宣布更多正在做的事，我们看看这会如何演变。

### Reminders and research

### 提醒与研究

One of the simplest things I've found useful is opening the mobile app from anywhere and saying, "ea-agent, remind me of this thing tomorrow, and keep reminding me until I respond." Or, "hey research-agent, I just had this idea. Go do deep research and tell me XYZ."

我发现最有用的最简单事情之一，就是在任何地方打开手机应用说：「ea-agent，明天提醒我这件事，一直提醒到我回复为止。」或者：「嘿 research-agent，我刚有个想法，去做深度研究然后告诉我 XYZ。」

### Daily work report

### 每日工作报告

I'm particularly excited about this one. My vps-agent looks at all Buzz conversations from the previous day, including private DMs, and sends me a morning report on what was accomplished, what's in flight, and what requires my attention. The idea is twofold:

我尤其对这一项感到兴奋。我的 vps-agent 会查看前一天 Buzz 里的所有对话，包括私聊，然后在早上给我发一份报告，说明完成了什么、正在推进什么、以及哪些需要我关注。这个想法有双重目的：

1. Assess the health of the overall system.
2. Add a "belt and suspenders" for things I'm sure to miss once the volume grows.

3. 评估整个系统的健康状况。
4. 为那些等规模变大后我肯定会漏掉的事情加上一道「双保险」（belt and suspenders）。

The agent sends the report as an ordered list that keeps incrementing across sections and after reading it, I can say something like:

智能体会把报告作为一个有序列表发送，编号跨章节持续递增。读完报告后，我可以这样说：

Go do 2 and 3, remind me about 4 tomorrow, and create Linear tickets for 8 and 10. 💥

去做第 2 和第 3 项，明天提醒我第 4 项，然后为第 8 和第 10 项创建 Linear 工单。💥

## Questions

## 一些问题

### Why not one agent for everything?

### 为什么不用一个智能体包办一切？

This might be pointless, but the main reason is least privilege. Some agents don't need access to GitHub, deployments, or my calendar. Why increase the blast radius and potential for mistakes if I can avoid it? Just like humans...?

这可能有点较真，但主要原因是「最小权限」。有些智能体不需要访问 GitHub、部署或我的日历。如果能避免，为什么要扩大爆炸半径和出错的可能性呢？就像人类一样……？

### Why not go all in on Claude/codex agents + computer + this + that + the other thing....?

### 为什么不全力押注 Claude/Codex 智能体 + 电脑 + 这个 + 那个 + 其他所有东西……？

That's a good question. Anthropic and OpenAI have a trillion-dollar vested interest in expanding their empires outward from the model, similar to how AWS grew from EC2 and S3 into a juggernaut of more services than stars in the sky. It makes sense, and I think they can pull it off, but I don't want a world controlled by a few players who act as arbiters of morality and truth.

这是个好问题。Anthropic 和 OpenAI 都有万亿美元级的既得利益，要从模型向外扩张它们的帝国，就像 AWS 从 EC2 和 S3 成长为拥有比天上星星还多服务的庞然大物一样。这合情合理，而且我认为它们能做成，但我不想生活在一个由少数几个「道德与真理的仲裁者」控制的世界里。

That's why, at least in theory, the components above are portable, swappable, and/or open source.

这就是为什么——至少在理论上——上面这些组件都是可移植、可替换、且/或开源的。

### Has it been worth it?

### 这一切值得吗？

For the journey, yes, for the ROI, nope. I've spent 10x longer setting this up than it would have taken me to do any of the things above on my own. But... building the factory itself doesn't produce anything, now does it? :)

就这段旅程而言，值得；就 ROI（投资回报）而言，不值得。我花在搭建这套系统上的时间，是我自己动手做上面任何一件事所需时间的 10 倍。但……搭建工厂本身并不产出任何东西，不是吗？:)

---

Image credits: the Buzz app icon comes from the Apache-2.0-licensed Buzz repository. The Nostr logo was created by Andrea Nicolini and released under CC0.

图片版权：Buzz 应用图标来自采用 Apache-2.0 许可的 Buzz 仓库。Nostr 标志由 Andrea Nicolini 创作，以 CC0 协议发布。
