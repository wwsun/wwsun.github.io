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

与 v0 合作就像与一位技艺高超的队友一起工作，他可以构建你所需要的任何东西。v0 不仅仅是一个工具，更是你的构建伙伴。就像与任何优秀的合作者一样，你获得的成果质量取决于你沟通的清晰程度。

你的描述越具体，v0 的输出效果就越好。根据我们的测试，优质的提示通常能带来：

- Faster generation time (30-40% faster with less unnecessary code, fewer credits spent)
- Smarter UX decisions (v0 understands intent and optimizes accordingly)
- Cleaner, more maintainable code

This guide shows you a framework that consistently produces these results.

## 驱动优质提示的三个输入

After building hundreds of applications ourselves and learning from v0 's power users, we’ve noticed that the best prompts always include three core inputs:

1. **Product surface**
2. **Context of use**
3. **Constraints & taste**

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

Let's break down each input.

## 产品界面

**你具体在构建什么？**

列出实际的组件、功能和数据。不要只说“一个仪表盘”，而是要说明它展示哪些数据，用户可以进行哪些操作，以及主要的版块有哪些。

**Example:**

```markdown
Dashboard displaying: top 5 performers with 
names and revenue, team revenue vs quota 
progress bar, deal pipeline with stages 
(Leads → Qualified → Demo → Closed), 
6-month revenue trend chart.
```

When you’re specific about the product surface, v0 doesn’t waste time inventing features you don’t need or missing ones you do.

## 使用场景

**谁在使用这个产品？他们是在什么时刻使用？**

请具体说明你的用户，以及他们在现实生活中如何与产品互动。他们的角色、技术熟练程度、时间限制和所处环境都会影响 v0 的用户体验设计。

Ask yourself:

- Who uses this?
- When do they use it?
- What decision are they trying to make?
- How much time do they have?

**Example:**

```markdown
Sales managers (non-technical) who check 
this during morning standups on desktop 
monitors to quickly spot underperformers and 
celebrate wins with the team.
```

v0 optimizes for assumed usage. If you don’t define the context of use, it will guess.

## 约束与偏好

**How should it work and look**

约束条件告诉 v0 不要凭空创造内容。

Include:

- Style preferences
- Platform or device assumptions
- Layout expectations
- Color systems
- Responsiveness or accessibility needs

**Example:**

```markdown
Professional but approachable. Use card-based 
layout with clear hierarchy. Color code: green for 
on-track, yellow for at-risk, red for below target. 
Desktop-first since they use large monitors. Make 
it feel like a real SaaS product.
```

v0 ’s defaults are good. Specific constraints make them great while keeping code cleaner.

## 显示差异：真实测试结果

I tested this framework by building the same applications with different levels of context. Each test isolates one element to show its impact:

**Without context of use:**

```markdown
Build an e-commerce site with product grid, filters, and shopping features.
```

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F4odzXUzi6ox72jmSoFWEtX%2F633bbda45122a5f54ec77d50db1c8926%2Fprompt_v0_01_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F2HCNJWCYSy6aHiEGvSPHqt%2F54cebc7343ec552a70cbc1d4631d197b%2Fprompt_v0_01_dm_mobile.png&w=1920&q=75)

**v0 chat:** [**https:// v0.link/6vSzuSI**](https://v0.link/6vSzuSI)

**With context of use:**

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F1NrxDwi8kDgnADVEpc8AaX%2F7b7a0f6493e383bab87cb2d026dfa7e4%2Fprompt_v0_02_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F7xLylAwZD1V5i6DHrES1Wt%2Fa515b1ab4fa8652c7a37b3c5d6a09ee6%2Fprompt_v0_02_dm_mobile.png&w=1920&q=75)

**v0 chat:** [**https:// v0.link/CcOTmsI**](https://v0.link/CcOTmsI)

**What changed:**

The version with context took 26 seconds longer but delivered a completely functional product. The version without context had:

- Non-functional search (placeholder only)
- Non-functional cart
- NOT responsive

The version with context had:

- Fully functional search and cart with quantity controls
- 100% mobile responsive
- Sophisticated mobile-first design
- Quick view modals and category filters

**The real cost:**

Without context would have required 1-2 more prompts to add the missing functionality, totaling ~5 minutes and ~1.5 credits. Better context saved multiple iterations.

**Vague product surface:**

```markdown
Build a user profile page.
```

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6zrIZDICVa2NfJ0v7Dv8cT%2F74986b04b1a98b23077733838b0cc946%2Fprompt_v0_03_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2FJYHXwDxD9hHFtx8Aui2NM%2F94ab62c9a629efefe3956f14ba3638e3%2Fprompt_v0_03_dm_mobile.png&w=1920&q=75)

**v0 chat:** [**https:// v0.link/1Gev1Gi**](https://v0.link/1Gev1Gi)

**Specific product surface:**

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2FQprXf2LvVP7mDY86Bq9fe%2F04d9bee4164d43fe715b8d77f01d4ff8%2Fprompt_v0_04_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F56GC1GFBKtyWzbbHWqmSo0%2Fdf205f73e7b6b02c6d0889d5f7e67fd6%2Fprompt_v0_04_dm_mobile.png&w=1920&q=75)

**v0 chat:** [**https:// v0.link/690wE6f**](https://v0.link/690wE6f)

**Results:**

- Vague: **1m 38s**, 595 lines, 0.173 credits
- Specific: **1m 19s**, 443 lines, 0.160 credits

**19 seconds faster, 152 fewer lines, lower cost.**

The vague prompt forced v0 to guess. The specific prompt generated exactly what we needed: all requested fields properly structured, activity stats prominent, correct information architecture.

When the product surface is explicit, v0 doesn’t waste time inventing features you don’t need or missing ones you do.

**Basic constraints:**

```markdown
Build a support ticket dashboard. Shows: open 
tickets, response time, agent performance, 
recent activity.
```

![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2Frcpmd8yysFmjo6vzenJv5%2Fd471d64ec5df92642c56e7787cdd7bb7%2Fprompt_v0_05_lm_mobile.png&w=1920&q=75) ![](https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fcontentful%2Fimage%2Fe5382hct74si%2F6mKhq36PqWO45IcFXaMZvb%2F873a659d56089f4bccb3ea5149fc6f02%2Fprompt_v0_05_dm_mobile.png&w=1920&q=75)

**v0 chat:** [**https:// v0.link/jrNW2FX**](https://v0.link/jrNW2FX)

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

**v0 chat:** [**https:// v0.link/ZtsFTeb**](https://v0.link/ZtsFTeb)

**Results:**

- Basic: **1m 42s**, 679 lines, 0.133 credits
- Detailed: **1m 52s**, 569 lines, 0.130 credits

**Took 10 seconds longer but generated 110 fewer lines and cost less.**

The difference: basic version "works on mobile" (desktop layout that shrinks). Detailed version is "mobile-first" (designed from the ground up for mobile, single column expanding to 3 max, intentional color coding with red/yellow/green urgency levels, agent status badges, high contrast for outdoor visibility).

v0 's defaults are good. Specific constraints make them great while keeping code cleaner.

## 迭代生成结果

Once v0 generates your app, you have two main ways to iterate:

**Prompt for changes:** Describe what you want to change, add, or remove. Best for functional changes, adding features, or restructuring layouts.

**Design Mode:** Click Design Mode, select any element visually, and adjust properties directly. Faster for quick visual changes like colors, spacing, or typography.

Use prompts for logic and structure. Use Design Mode for visual tweaks.

Here's the template again, this time with a fully expanded example:

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

- [v0 Documentation](https://v0.dev/docs) - Complete guide to all features
- [Design Systems Guide](https://v0.app/docs/design-systems) - Learn how to create and use design systems
- [Project Instructions](https://v0.app/docs/instructions) - Set up rules that apply to all generations
- [v0 Templates](https://v0.dev/templates) - Pre-built starting points for common use cases
- [Community Platform](https://community.vercel.com/c/v0/59) - Ask for help, share prompt ideas, and chat about AI projects with the community