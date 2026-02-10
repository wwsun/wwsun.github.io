---
description: The best v0 prompts include three things. What you're building, who uses it and when, and your design constraints. This guide walks through the framework with side-by-side tests showing faster generation times, less code, and better UX decisions.
source: https://vercel.com/blog/how-to-prompt-v0
author:
  - "[[Esteban Suárez]]"
created: 2025-12-18
tags:
  - clippings
  - v0
  - agent
---

更好的提示 = 更好的结果，更快的速度
Better prompts = Better results, faster.

与 v0 合作就像与一位技艺高超的队友一起工作，他可以构建你所需要的任何东西。v0 不仅仅是一个工具，更是你的构建伙伴。就像与任何优秀的合作者一样，你获得的成果质量取决于你沟通的清晰程度。
Working with v0 is like working with a highly skilled teammate who can build whatever you need. v0 is more than a tool—it's a building partner. And as with any good collaborator, the quality of what you get back is determined by the clarity of how you communicate.

你的描述越具体，v0 的输出效果就越好。根据我们的测试，优质的提示通常能带来：
The more specific your descriptions, the better v0’s output. Based on our testing, high-quality prompts consistently lead to:

- **更快的生成速度**（减少不必要的代码，生成速度提升 30-40%，节省额度）
  Faster generation time (30-40% faster with less unnecessary code, fewer credits spent)
- **更明智的 UX 决策**（v0 能够理解意图并据此进行优化）
  Smarter UX decisions (v0 understands intent and optimizes accordingly)
- **更简洁、更易维护的代码**
  Cleaner, more maintainable code

本指南将向你展示一个能够持续产生这些结果的框架。
This guide shows you a framework that consistently produces these results.

## 驱动优质提示的三个输入
The three inputs that drive high-quality prompts

在我们自己构建了数百个应用程序并向 v0 的高级用户学习之后，我们注意到最好的提示词总是包含三个核心输入：
After building hundreds of applications ourselves and learning from v0’s power users, we’ve noticed that the best prompts always include three core inputs:

1. **产品界面 (Product surface)**
2. **使用场景 (Context of use)**
3. **约束与偏好 (Constraints & taste)**

以下是模版：
Here's the template:

```markdown
Build [product surface: components, data, actions].

Used by [who],
in [what moment],
to [what decision or outcome].

Constraints:
- platform / device
- visual tone
- layout assumptions
```

让我们拆解每个输入。
Let's break down each input.

## 产品界面
Product surface

**你具体在构建什么？**
**What exactly are you building?**

列出实际的组件、功能和数据。不要只说“一个仪表盘”，而是要说明它展示哪些数据，用户可以进行哪些操作，以及主要的版块有哪些。
List the actual components, features, and data. Instead of just saying “a dashboard,” specify what data it shows, what actions users can take, and what the primary sections are.

**示例：**
**Example:**

```markdown
Dashboard displaying: top 5 performers with 
names and revenue, team revenue vs quota 
progress bar, deal pipeline with stages 
(Leads → Qualified → Demo → Closed), 
6-month revenue trend chart.
```

当你对产品界面描述得很具体时，v0 就不会浪费时间去发明你不需要的功能，也不会遗漏你想要的功能。
When you’re specific about the product surface, v0 doesn’t waste time inventing features you don’t need or missing ones you do.

## 使用场景
Context of use

**谁在使用这个产品？他们是在什么时刻使用？**
**Who is using this? In what moment?**

请具体说明你的用户，以及他们在现实生活中如何与产品互动。他们的角色、技术熟练程度、时间限制和所处环境都会影响 v0 的用户体验设计。
Be specific about your user and how they interact with the product in real life. Their role, technical proficiency, time constraints, and environment all shape v0’s UX decisions.

问问你自己：
Ask yourself:

- 谁在使用它？ (Who uses this?)
- 他们什么时候使用它？ (When do they use it?)
- 他们试图做出什么决定？ (What decision are they trying to make?)
- 他们有多少时间？ (How much time do they have?)

**示例：**
**Example:**

```markdown
Sales managers (non-technical) who check 
this during morning standups on desktop 
monitors to quickly spot underperformers and 
celebrate wins with the team.
```

v0 会根据假设的用途进行优化。如果你没有定义使用场景，它就会自己猜测。
v0 optimizes for assumed usage. If you don’t define the context of use, it will guess.

## 约束与偏好
Constraints & taste

**它应该如何运作和呈现？**
**How should it work and look**

约束条件告诉 v0 不要凭空创造内容。
Constraints tell v0 what not to invent out of thin air.

包括：
Include:

- 风格偏好 (Style preferences)
- 平台或设备假设 (Platform or device assumptions)
- 布局期望 (Layout expectations)
- 颜色系统 (Color systems)
- 响应式或无障碍需求 (Responsiveness or accessibility needs)

**示例：**
**Example:**

```markdown
Professional but approachable. Use card-based 
layout with clear hierarchy. Color code: green for 
on-track, yellow for at-risk, red for below target. 
Desktop-first since they use large monitors. Make 
it feel like a real SaaS product.
```

v0 的默认设置已经很好了。具体的约束条件能让结果更出色，同时保持代码更加简洁。
v0’s defaults are good. Specific constraints make them great while keeping code cleaner.

## 显示差异：真实测试结果
Showing the difference: Real test results

我通过使用不同程度的上下文构建相同的应用程序来测试这个框架。每次测试都分离出一个元素以显示其影响：
I tested this framework by building the same applications with different levels of context. Each test isolates one element to show its impact:

**没有使用场景：**
**Without context of use:**

```markdown
Build an e-commerce site with product grid, filters, and shopping features.
```

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F4odzXUzi6ox72jmSoFWEtX%2F633bbda45122a5f54ec77d50db1c8926%2Fprompt_v0_01_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F2HCNJWCYSy6aHiEGvSPHqt%2F54cebc7343ec552a70cbc1d4631d197b%2Fprompt_v0_01_dm_mobile.png&w=1920&q=75)

**v0 对话：** [**https://v0.link/6vSzuSI**](https://v0.link/6vSzuSI)

**带有使用场景：**
**With context of use:**

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F1NrxDwi8kDgnADVEpc8AaX%2F7b7a0f6493e383bab87cb2d026dfa7e4%2Fprompt_v0_02_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F7xLylAwZD1V5i6DHrES1Wt%2Fa515b1ab4fa8652c7a37b3c5d6a09ee6%2Fprompt_v0_02_dm_mobile.png&w=1920&q=75)

**v0 对话：** [**https://v0.link/CcOTmsI**](https://v0.link/CcOTmsI)

**发生了什么变化：**
**What changed:**

带有上下文的版本多花了 26 秒，但交付了一个完全功能化的产品。没有上下文的版本则存在：
The version with context took 26 seconds longer but delivered a completely functional product. The version without context had:

- 搜索功能不可用（仅占位符） (Non-functional search (placeholder only))
- 购物车不可用 (Non-functional cart)
- 非响应式设计 (NOT responsive)

而带有上下文的版本则拥有：
The version with context had:

- 具有数量控制功能的完整搜索和购物车 (Fully functional search and cart with quantity controls)
- 100% 移动端响应式 (100% mobile responsive)
- 精致的移动优先设计 (Sophisticated mobile-first design)
- 快速查看弹窗和类别过滤器 (Quick view modals and category filters)

**真实成本：**
**The real cost:**

没有上下文的版本需要再提示 1-2 次才能补全缺失的功能，总计约 5 分钟和 ~1.5 个额度。更好的上下文节省了多次迭代。
Without context would have required 1-2 more prompts to add the missing functionality, totaling ~5 minutes and ~1.5 credits. Better context saved multiple iterations.

**模糊的产品界面：**
**Vague product surface:**

```markdown
Build a user profile page.
```

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6zrIZDICVa2NfJ0v7Dv8cT%2F74986b04b1a98b23077733838b0cc946%2Fprompt_v0_03_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2FJYHXwDxD9hHFtx8Aui2NM%2F94ab62c9a629efefe3956f14ba3638e3%2Fprompt_v0_03_dm_mobile.png&w=1920&q=75)

**v0 对话：** [**https://v0.link/1Gev1Gi**](https://v0.link/1Gev1Gi)

**具体的产品界面：**
**Specific product surface:**

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2FQprXf2LvVP7mDY86Bq9fe%2F04d9bee4164d43fe715b8d77f01d4ff8%2Fprompt_v0_04_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F56GC1GFBKtyWzbbHWqmSo0%2Fdf205f73e7b6b02c6d0889d5f7e67fd6%2Fprompt_v0_04_dm_mobile.png&w=1920&q=75)

**v0 对话：** [**https://v0.link/690wE6f**](https://v0.link/690wE6f)

**结果：**
**Results:**

- 模糊提示：**1分38秒**，595行，0.173 额度 (Vague: 1m 38s, 595 lines, 0.173 credits)
- 具体提示：**1分19秒**，443行，0.160 额度 (Specific: 1m 19s, 443 lines, 0.160 credits)

**快了 19 秒，代码减少 152 行，成本更低。**
**19 seconds faster, 152 fewer lines, lower cost.**

模糊的提示迫使 v0 去猜测。具体的提示则准确生成了我们需要的：所有请求字段都结构合理，活动统计显著，信息架构正确。
The vague prompt forced v0 to guess. The specific prompt generated exactly what we needed: all requested fields properly structured, activity stats prominent, correct information architecture.

当产品界面明确时，v0 就不会浪费时间去发明你不需要的功能，也不会遗漏你想要的功能。
When the product surface is explicit, v0 doesn’t waste time inventing features you don’t need or missing ones you do.

**基础约束：**
**Basic constraints:**

```markdown
Build a support ticket dashboard. Shows: open 
tickets, response time, agent performance, 
recent activity.
```

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2Frcpmd8yysFmjo6vzenJv5%2Fd471d64ec5df92642c56e7787cdd7bb7%2Fprompt_v0_05_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6mKhq36PqWO45IcFXaMZvb%2F873a659d56089f4bccb3ea5149fc6f02%2Fprompt_v0_05_dm_mobile.png&w=1920&q=75)

**v0 对话：** [**https://v0.link/jrNW2FX**](https://v0.link/jrNW2FX)

**详细约束：**
**Detailed constraints:**

```markdown
Build a support ticket dashboard. Shows: open tickets, 
response time, agent performance, recent activity.

Mobile-first design (team leads check this on phones 
while on the floor).
Light theme, high contrast. Color code: red for urgent 
(>24h), yellow for medium, green for on-time. Maximum
3-column layout. Include loading states for real-time data.
```

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F5ZVH6nN2Gs782RkyiCAcjg%2F95db26c73c00243838d86d632d93de3d%2Fprompt_v0_06_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F3xIcvVnEaUO0wteMO6EK2l%2F0a8115ce0468e9e3221930cfbebcfcb2%2Fprompt_v0_06_dm_mobile.png&w=1920&q=75)

**v0 对话：** [**https://v0.link/ZtsFTeb**](https://v0.link/ZtsFTeb)

**结果：**
**Results:**

- 基础约束：**1分42秒**，679行，0.133 额度 (Basic: 1m 42s, 679 lines, 0.133 credits)
- 详细约束：**1分52秒**，569行，0.130 额度 (Detailed: 1m 52s, 569 lines, 0.130 credits)

**虽然多花了 10 秒，但生成的代码减少了 110 行，且成本更低。**
**Took 10 seconds longer but generated 110 fewer lines and cost less.**

区别在于：基础版本“在移动端可用”（只是缩小了的桌面布局）。详细版本则是“移动优先”（从头开始为移动端设计：单列扩展至最多 3 列、有意的红/黄/绿紧急程度配色、代理状态图标、针对户外可见性的高对比度）。
The difference: basic version "works on mobile" (desktop layout that shrinks). Detailed version is "mobile-first" (designed from the ground up for mobile, single column expanding to 3 max, intentional color coding with red/yellow/green urgency levels, agent status badges, high contrast for outdoor visibility).

v0 的默认设置已经很好了。具体的约束条件能让结果更出色，同时保持代码更加简洁。
v0’s defaults are good. Specific constraints make them great while keeping code cleaner.

## 迭代生成结果
Iterating on results

一旦 v0 生成了你的应用，你有两种主要的方式进行迭代：
Once v0 generates your app, you have two main ways to iterate:

**通过提示修改：** 描述你想要更改、添加或移除的内容。最适合功能性更改、添加功能或重构布局。
Prompt for changes: Describe what you want to change, add, or remove. Best for functional changes, adding features, or restructuring layouts.

**设计模式 (Design Mode)：** 点击设计模式，直接通过视觉选择任何元素并调整其属性。对于颜色、间距或字体等快速视觉更改速度更快。
Design Mode: Click Design Mode, select any element visually, and adjust properties directly. Faster for quick visual changes like colors, spacing, or typography.

使用提示词处理逻辑和结构。使用设计模式处理视觉微调。
Use prompts for logic and structure. Use Design Mode for visual tweaks.

这里再次提供模版，这次带有一个完整的示例：
Here's the template again, this time with a fully expanded example:

**模版：**
**Template:**

```markdown
Build [product surface: components, data, actions].

Used by [who],
in [what moment],
to [what decision or outcome].

Constraints:
- platform / device
- visual tone
- layout assumptions
```

**示例：**
**Example:**

```markdown
Build a support dashboard showing: open tickets count,
average response time, tickets by priority (high/medium/low),
agent performance list with current workload, recent ticket activity feed.

Used by support team leads (managing 5–10 agents),
on their phones while walking the floor,
to prevent agent burnout and maintain response-time SLAs.
Checked every 30 minutes to identify overloaded agents
and redistribute work.

Constraints:
Mobile-first, light theme, high contrast.
Color code by priority: red for urgent, yellow for medium, green for low.
Show agent status badges (busy/available).
Maximum 2 columns on mobile.
```

- [v0 文档](https://v0.dev/docs) - 所有功能的完整指南
- [设计系统指南](https://v0.app/docs/design-systems) - 了解如何创建和使用设计系统
- [项目指令](https://v0.app/docs/instructions) - 设置适用于所有生成结果的规则
- [v0 模版](https://v0.dev/templates) - 常见用例的预构建起点
- [社区平台](https://community.vercel.com/c/v0/59) - 寻求帮助、分享提示创意并交流 AI 项目
