---
title: Claude Code 会涨到 100 美元/月吗？大概率不会——但这整件事非常混乱
description: Simon Willison 复盘 Anthropic 悄悄把 Claude Code 从 20 美元/月的 Pro 套餐移除引发的风波：社区反弹、官方含糊回应、数小时后的回滚，以及「测试文化」失误对用户信任的伤害。
tags:
  - clippings
  - claude
  - anthropic
  - ai-tools
source: https://simonwillison.net/2026/Apr/22/claude-code-confusion/
created: 2026-09-01
author: Simon Willison
---

## Claude Code 会涨到 100 美元/月吗？大概率不会——但这整件事非常混乱

> **原文**：[Is Claude Code going to cost $100/month? Probably not—it's all very confusing](https://simonwillison.net/2026/Apr/22/claude-code-confusion/) | 作者：Simon Willison | 日期：2026-04-22

## 📝 摘要

Anthropic 在没有任何公告的情况下，悄悄把 Claude Code 从 20 美元/月的 Pro 套餐中移除，改为仅限 100 美元/月以上的 Max 套餐，引发社区强烈反弹。增长负责人回应称这只是针对约 2% 新注册用户的测试，但作者 Simon Willison 并不买账，并逐条列出这次事件造成的伤害：用户恐慌、信任动摇、战略疑虑，以及对教学投入的打击。他猜测这是「做测试」文化下把坏点子也拿去测的典型失误，Anthropic 需要做出坚定承诺才能赢回信任。戏剧性的是，就在作者写作期间，Anthropic 已经回滚了页面改动；随后官方又澄清实验仍在进行，只是不再对外可见。OpenAI 的 Codex 则借机营销，重申免费档和 20 美元档不变。

## 📋 术语表

| 英文             | 中文           | 说明                                                                |
| ---------------- | -------------- | ------------------------------------------------------------------- |
| Claude Code      | Claude Code    | Anthropic 的编程智能体产品，本文事件的主角                          |
| Claude Pro       | Claude Pro     | Anthropic 面向个人用户的入门订阅套餐，20 美元/月                    |
| Claude Max       | Claude Max     | Anthropic 面向重度用户的高价套餐，分 100 美元/月和 200 美元/月两档  |
| pricing grid     | 定价表格       | 官网对比各套餐功能与价格的表格，本文事件的导火索                    |
| prosumer         | 专业消费者     | 介于普通消费者与专业用户之间、对产品功能要求更高的用户群体          |
| rug-pulled       | 过河拆桥       | 服务或承诺被提供方突然撤销，使依赖它的用户措手不及                  |
| testing culture  | 「做测试」文化 | 点子即便看起来不靠谱也倾向于先小范围上线测试、用数据验证的做法      |
| brand damage     | 品牌信任损耗   | 因决策失误导致用户对品牌的信任和好感度下降                          |
| trust bonfire    | 信任大火       | 比喻因失误或欠缺透明沟通而迅速烧掉的用户信任                        |
| Head of Growth   | 增长负责人     | 企业内负责用户增长策略的高管职位                                    |
| Claude Cowork    | Claude Cowork  | Anthropic 推出的团队协作类智能体产品，被视为 Claude Code 的换皮版本 |
| Codex            | Codex          | OpenAI 推出的编程智能体产品，与 Claude Code 存在直接竞争关系        |
| NICAR            | NICAR          | 美国计算机辅助报道年会，数据新闻记者的行业会议                      |
| Internet Archive | 互联网档案馆   | 长期保存网页历史快照的非营利数字图书馆                              |
| landing page     | 落地页         | 用户从搜索结果或广告点击后到达的营销页面                            |
| free tier        | 免费档         | 产品不收取费用、面向所有用户的档位                                  |
| AI coding agents | AI 编程智能体  | 辅助编写代码的 AI 工具，如 Gemini CLI、Claude Code、Copilot CLI 等  |

---

## 正文（双语对照）

Anthropic today quietly (as in _silently_, no announcement anywhere at all) updated their [claude.com/pricing](https://claude.com/pricing) page (but not their [Choosing a Claude plan page](https://support.claude.com/en/articles/11049762-choosing-a-claude-plan), which shows up first for me on Google) to add this tiny but significant detail (arrow is mine, [and it's already reverted](https://simonwillison.net/2026/Apr/22/claude-code-confusion/#they-reversed-it)):

Anthropic 今天悄悄更新了 [claude.com/pricing](https://claude.com/pricing) 页面——「悄悄」的意思是无声无息，完全没有任何公告——但没更新 [Choosing a Claude plan 页面](https://support.claude.com/en/articles/11049762-choosing-a-claude-plan)（后者才是 Google 搜索里最先出现在我眼前的页面）。更新加上了这个微小但重大的细节（箭头是我加的，[而且它已经被改回去了](https://simonwillison.net/2026/Apr/22/claude-code-confusion/#they-reversed-it)）：

![Screenshot of the Claude pricing grid - Compare features across plans. Free, Pro, Max 5x and Max 20x all have the same features, with the exception of Claude Code which is on Max only and Claude Cowork which is on Pro and Max only. An arrow highlights the Claude Code for Pro cross.](https://static.simonwillison.net/static/2026/anthropic-x.jpg)

截图内容是 Claude 定价表格，对比各套餐的功能：Free、Pro、Max 5x 和 Max 20x 的功能基本相同，唯一的区别是 Claude Code 只在 Max 上提供，Claude Cowork 在 Pro 和 Max 上提供。箭头标出了 Pro 一栏中被划掉的 Claude Code。

The [Internet Archive copy](https://web.archive.org/web/20260421040656/claude.com/pricing) from yesterday shows a checkbox there. Claude Code used to be a feature of the $20/month Pro plan, but according to the new pricing page it is now exclusive to the $100/month or $200/month Max plans.

[互联网档案馆昨天的存档](https://web.archive.org/web/20260421040656/claude.com/pricing)显示那一栏原来是个勾选框。Claude Code 曾经是 20 美元/月 Pro 套餐的一项功能，但按照新的定价页面，它现在只属于 100 美元/月或 200 美元/月的 Max 套餐。

_**Update**: don't miss [the update to this post](https://simonwillison.net/2026/Apr/22/claude-code-confusion/#they-reversed-it), they've already changed course a few hours after this change went live._

**更新**：别忘了看[本文的更新部分](https://simonwillison.net/2026/Apr/22/claude-code-confusion/#they-reversed-it)——这次改动上线几个小时后，他们就已经改弦易辙了。

So what the heck is going on? Unsurprisingly, [Reddit](https://www.reddit.com/r/ClaudeAI/comments/1srzhd7/psa_claude_pro_no_longer_lists_claude_code_as_an/) and [Hacker News](https://news.ycombinator.com/item?id=47854477) and [Twitter](https://twitter.com/i/trending/2046718768634589239) all caught fire.

所以到底发生了什么？不出所料，[Reddit](https://www.reddit.com/r/ClaudeAI/comments/1srzhd7/psa_claude_pro_no_longer_lists_claude_code_as_an/)、[Hacker News](https://news.ycombinator.com/item?id=47854477) 和 [Twitter](https://twitter.com/i/trending/2046718768634589239) 全都炸了锅。

I didn't believe the screenshots myself when I first saw them—aside from the pricing grid I could find no announcement from Anthropic anywhere. Then Amol Avasare, Anthropic's Head of Growth, [tweeted](https://twitter.com/TheAmolAvasare/status/2046724659039932830):

我自己刚看到截图时也不信——除了定价表格，我到处都找不到 Anthropic 的任何公告。然后 Anthropic 的增长负责人 Amol Avasare [发推](https://twitter.com/TheAmolAvasare/status/2046724659039932830)说：

> For clarity, we're running a small test on ~2% of new prosumer signups. Existing Pro and Max subscribers aren't affected.

> 澄清一下：我们正在大约 2% 的新专业消费者注册用户中做一个小测试。现有的 Pro 和 Max 订阅者不受影响。

And that appears to be the closest we have had to official messaging from Anthropic.

而这似乎是我们从 Anthropic 那里得到的最接近官方口径的说法了。

I don't buy the "~2% of new prosumer signups" thing, since everyone I've talked to is seeing the new pricing grid and the Internet Archive has already [snapped a copy](https://web.archive.org/web/20260422001250/https://claude.com/pricing). Maybe he means that they'll only be running this version of the pricing grid for a limited time which somehow adds up to "2%" of signups?

我不买账「约 2% 的新专业消费者注册用户」这个说法，因为我聊过的每个人都看到了新的定价表格，而且互联网档案馆已经[存档了一份](https://web.archive.org/web/20260422001250/https://claude.com/pricing)。也许他的意思是这个版本的定价表格只会展示一小段时间，凑起来相当于「2%」的注册用户？

I'm also amused to see Claude Cowork remain available on the $20/month plan, because Claude Cowork is effectively a rebranded version of Claude Code wearing a less threatening hat!

看到 Claude Cowork 仍然留在 20 美元/月的套餐里，我也觉得好笑——Claude Cowork 本质上就是换了个皮、戴了顶不那么吓人的帽子的 Claude Code。

There are a whole bunch of things that are bad about this.

这件事有一大堆糟糕的地方。

If we assume this is indeed a test, and that test comes up negative and they decide not to go ahead with it, the damage has still been extensive:

即便我们假设这确实只是一次测试，而且测试结果不理想、他们决定不推进，伤害也已经相当大了：

1. A whole lot of people got scared or angry or both that a service they relied on was about to be rug-pulled. There really is a significant difference between $20/month and $100/month for most people, especially outside of higher salary countries.

1. 一大群人感到害怕或愤怒，或者两者兼有——他们依赖的服务眼看就要被过河拆桥。对大多数人来说，20 美元/月和 100 美元/月的差别真的很大，尤其是在高薪国家之外。

1. The uncertainty is really bad! A tweet from an employee is _not_ the way to make an announcement like this. I wasted a solid hour of my afternoon trying to figure out what had happened here. My trust in Anthropic's transparency around pricing—a _crucial factor_ in how I understand their products—has been shaken.

1. 这种不确定性非常糟糕！这种级别的公告不该由一名员工的推文来发布。我浪费了整整一个下午的一个小时，试图搞清楚到底发生了什么。我对 Anthropic 在定价上的透明度的信任——这是理解他们产品的关键因素——已经动摇了。

1. Strategically, should I be taking a bet on Claude Code if I know that they might 5x the minimum price of the product?

1. 从战略上说，如果我知道产品的最低价可能翻 5 倍，我还应该押注 Claude Code 吗？

1. More of a personal issue, but one I care deeply about myself: I invest a [great deal of effort](https://simonwillison.net/tags/claude-code/) (that's 105 posts and counting) in teaching people how to use Claude Code. I don't want to invest that effort in a product that most people cannot afford to use.

1. 这更多是我个人的问题，但我自己非常在意：我投入了[大量精力](https://simonwillison.net/tags/claude-code/)（已经有 105 篇帖子，还在增加）教人们如何使用 Claude Code。我不想把这些精力投入到一个大多数人用不起的产品上。

Last month I ran [a tutorial for journalists](https://simonw.github.io/nicar-2026-coding-agents/) on "Coding agents for data analysis" at the annual NICAR data journalism conference. I'm not going to be teaching that audience a course that depends on a $100/month subscription!

上个月，我在一年一度的 NICAR 数据新闻大会上给记者们开了一期[「数据分析编程智能体」教程](https://simonw.github.io/nicar-2026-coding-agents/)。我不会给这群听众教一门依赖 100 美元/月订阅的课程！

This also doesn't make sense to me as a strategy for Anthropic. Claude Code _defined the category_ of coding agents. It's responsible for billions of dollars in annual revenue for Anthropic already. It has a stellar reputation, but I'm not convinced that reputation is strong enough for it to lose the $20/month trial and jump people directly to a $100/month subscription.

作为 Anthropic 的一项策略，这对我来说也说不通。Claude Code _定义_了编程智能体这个品类。它已经为 Anthropic 贡献了数十亿美元的年收入。它名声卓著，但我不相信这个名声强到可以让它丢掉 20 美元/月的入门档、直接把用户推向 100 美元/月的订阅。

OpenAI have been investing heavily in catching up to Claude Code with their Codex products. Anthropic just handed them this marketing opportunity on a plate—here's Codex engineering lead [Thibault Sottiaux](https://twitter.com/thsottiaux/status/2046740759056162816):

OpenAI 一直在大力投资 Codex 系列产品，追赶 Claude Code。Anthropic 刚把这个营销机会白送给了他们——以下是 Codex 工程负责人 [Thibault Sottiaux](https://twitter.com/thsottiaux/status/2046740759056162816) 的表态：

> I don't know what they are doing over there, but Codex will continue to be available both in the FREE and PLUS ($20) plans. We have the compute and efficient models to support it. For important changes, we will engage with the community well ahead of making them.
>
> Transparency and trust are two principles we will not break, even if it means momentarily earning less. A reminder that you vote with your subscription for the values you want to see in this world.

> 我不知道他们在那边做什么，但 Codex 将继续在 FREE 和 PLUS（20 美元）套餐中提供。我们有算力和高效的模型来支撑这一点。对于重要的变更，我们会在落地之前很久就与社区充分沟通。
>
> 透明度和信任是我们不会打破的两条原则，即便这意味着短期内少赚一些。提醒一下：你的订阅就是你对这个世界的价值观投出的一票。

I should note that I pay $200/month for Claude Max and I consider it well worth the money. I've had periods of free access in the past courtesy of Anthropic but I'm currently paying full price, and happy to do so.

我应该说明一下：我自己付 200 美元/月订阅 Claude Max，并且觉得物有所值。过去我曾享受过 Anthropic 提供的免费使用期，但现在我在付全价，而且付得心甘情愿。

But I care about the accessibility of the tools that I work with and teach. If Codex has a free tier while Claude Code starts at $100/month I should obviously switch to Codex, because that way I can use the same tool as the people I want to teach how to use coding agents.

但我关心自己使用和教授的工具的可及性。如果 Codex 有免费档，而 Claude Code 起步就是 100 美元/月，那我显然应该转向 Codex——这样我就能和我想教的人使用同一个工具来学习编程智能体。

Here's what I think happened. I think Anthropic are trying to optimize revenue growth—obviously—and someone pitched making Claude Code only available for Max and higher. That's clearly a bad idea, but "testing" culture says that it's worth putting even bad ideas out to test just in case they surprise you.

下面是我对事情经过的猜测。我认为 Anthropic 在试图优化收入增长——这很明显——有人提出了让 Claude Code 只在 Max 及以上套餐提供的方案。这显然是个坏主意，但「做测试」文化认为，即便是坏主意也值得拿出去测一测，万一带来惊喜呢。

So they started a test, without taking into account the wailing and gnashing of teeth that would result when their test was noticed—or accounting for the longer-term brand damage that would be caused.

于是他们启动了测试，却没有考虑到测试被人发现后会引发的哀嚎与咬牙切齿，也没有计算由此造成的长期品牌信任损耗。

Or maybe they _did_ account for that, and decided it was worth the risk.

又或者他们确实考虑到了，只是觉得风险值得一冒。

I don't think that calculation was worthwhile. They're going to have to make a _very_ firm commitment along the lines of "we heard your feedback and we commit to keeping Claude Code available on our $20/month plan going forward" to regain my trust.

我认为这笔账不划算。他们要重新赢回我的信任，就必须做出_非常_坚定的承诺，类似于「我们听到了你们的反馈，我们承诺 Claude Code 今后继续在 20 美元/月套餐中提供」。

As it stands, Codex is looking like a much safer bet for me to invest my time in learning and building educational materials around.

就目前而言，Codex 看起来是一个稳妥得多的选择，值得我把时间投入到学习和围绕它构建教学材料上。

### 更新：他们已经改回去了

In the time I was _typing this blog entry_ Anthropic appear to have reversed course—the [claude.com/pricing page](https://claude.com/pricing) now has a checkbox back in the Pro column for Claude Code. I can't find any official communication about it though.

就在我_敲这篇博文_的时候，Anthropic 似乎已经改弦易辙——[claude.com/pricing 页面](https://claude.com/pricing)上，Pro 一栏的 Claude Code 勾选框又回来了。不过我还是找不到任何官方沟通。

Let's see if they can come up with an explanation/apology that's convincing enough to offset the trust bonfire from this afternoon!

看看他们能不能拿出一个有足够说服力的解释或道歉，来抵消今天下午烧起来的信任大火！

### 更新 2：可能仍会影响 2% 的注册用户？

Amol [on Twitter](https://x.com/TheAmolAvasare/status/2046788872517066971):

Amol [在 Twitter 上说](https://x.com/TheAmolAvasare/status/2046788872517066971)：

> was a mistake that the logged-out landing page and docs were updated for this test [[embedded self-tweet](https://twitter.com/TheAmolAvasare/status/2046783926920978681)]

> 未登录状态下的落地页和文档为这次测试更新，是个错误 [[嵌入的自推](https://twitter.com/TheAmolAvasare/status/2046783926920978681)]

> > Getting lots of questions on why the landing page / docs were updated if only 2% of new signups were affected. This was understandably confusing for the 98% of folks not part of the experiment, and we've reverted both the landing page and docs changes.

> > 很多人问：既然只有 2% 的新注册用户受影响，为什么落地页和文档也更新了？对没有参与实验的那 98% 的人来说，这种困惑完全可以理解，我们已经回滚了落地页和文档的改动。

So the experiment is still running, just not visible to the rest of the world?

所以实验仍在进行，只是外界看不到了？
