---
title: Kimi K3 与鹈鹕基准测试的启示
description: Simon Willison 对 Moonshot AI 发布 Kimi K3 模型的评测，以及「鹈鹕骑自行车」基准测试的持续价值
tags:
  - clippings
  - llm
  - benchmark
  - ai-model
source: https://simonwillison.net/2026/Jul/16/kimi-k3/
created: 2026-07-22
---

## Kimi K3 与鹈鹕基准测试还能教给我们什么

> 原文：[Kimi K3, and what we can still learn from the pelican benchmark](https://simonwillison.net/2026/Jul/16/kimi-k3/) 作者：Simon Willison 日期：2026-07-16

中国 AI 实验室月之暗面（Moonshot AI）今早[发布了 Kimi K3](https://www.kimi.com/blog/kimi-k3)，称其为「迄今为止最强的模型，拥有 2.8 万亿参数」。该模型目前可通过其官网和 API 使用，开放权重版本承诺「在 2026 年 7 月 27 日前」发布。

月之暗面称这是首个「开放的三万亿级模型」（我猜他们把 2.8 万亿四舍五入到了 3 万亿），从 [DeepSeek 的 1.6 万亿 V4 Pro](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro) 手中夺过了王冠。他们[自报的基准测试](https://www.kimi.com/blog/kimi-k3#full-benchmark-table)显示 K3 在多数指标上击败了 Claude Opus 4.8 max 和 GPT-5.5 high，但输给了 Claude Fable 5 和 GPT-5.6 Sol。

来自 [Artificial Analysis 报告](https://twitter.com/ArtificialAnlys/status/2077832874183860404)的几个亮点：

- 「在我们的私密长周期知识工作评估中，Kimi K3 整体 Elo 达到 1547，较 Kimi K2.6 提升了 732 分，仅次于 Claude Fable 5。」
- 「每个任务成本（$0.94）与 GPT-5.6 Sol（$1.04）相近，约为 Opus 4.8（$1.80）的一半，但高于同类开放权重模型。」
- 「Kimi K3 在 Artificial Analysis 智能指数上的 Token 消耗显著下降，输出 Token 比 K2.6 减少了 21%。」

该模型目前也是 [Arena.ai 前端代码竞技场](https://twitter.com/arena/status/2077824029126504525)上的领先模型，甚至超越了 Claude Fable 5。

新模型引人注目的是定价：每百万输入 Token $3，每百万输出 Token $15，与 Anthropic 的 Claude Sonnet 系列持平，成为迄今为止中国 AI 实验室发布的最昂贵模型。这比他们之前 [Kimi K2.6](https://platform.kimi.ai/docs/pricing/chat-k26) 的 $0.95/$4 大幅提升。2.8 万亿参数也比那个 1T 模型的两倍还多。

#### 但它的鹈鹕画得怎么样？

我通过 OpenRouter（省得注册月之暗面 API 密钥）并使用 [llm-openrouter 插件](https://github.com/simonw/llm-openrouter) 来生成一幅鹈鹕骑自行车的 SVG：

```
llm -m openrouter/moonshotai/kimi-k3 'Generate an SVG of a pelican riding a bicycle'
```

这是[完整记录](https://gist.github.com/simonw/66a2699eb1594258904c7b5102840dd6)。效果如下：

![鹈鹕骑自行车 SVG](https://static.simonwillison.net/static/2026/kimi-3-pelican.jpg)

那只鹈鹕消耗了 95 个输入 Token 和 16,658 个输出 Token（其中 13,241 是推理 Token），总成本[25 美分](https://www.llm-prices.com/#it=95&ot=16658&ic=3&oc=15)！

由于 K3 支持图像输入，我把上面渲染好的 SVG 图片扔给它（配上了我的[替代文本提示词](https://simonwillison.net/guides/agentic-engineering-patterns/prompts/#alt-text)），[得到](https://gist.github.com/simonw/665dbf840701b421745f2cb891acdfd6)了这段回复（花费[0.6 美分](https://www.llm-prices.com/#it=822&ot=243&ic=3&oc=15)）：

> 卡通风格插画：一只戴着红色围巾的白色鹈鹕，骑着一辆红色自行车沿着带白色虚线的灰色道路前行；鹈鹕有大大的橘色喙和带蹼的橘色脚正在踩踏板，身后有白色的运动线；背景是浅蓝色天空与白云、一轮黄色太阳、两只飞翔的小黑鸟，前景是绿色草地和小白花。

#### 我们从鹈鹕中学到了什么？

我的「[生成一幅鹈鹕骑自行车的 SVG](https://simonwillison.net/tags/pelican-riding-a-bicycle/)」测试已经有 21 个月的历史了。它从来算不上一个多好的基准测试。最初这只是个玩笑，讽刺模型对比的荒谬难度，但在第一年里它竟然与模型的实际水平有着[令人惊讶的相关性](https://simonwillison.net/2025/Jun/6/six-months-in-llms/)。

这种关联现在基本已经被切断了。[GPT-5.6](https://simonwillison.net/2026/Jul/9/gpt-5-6/) 和 [Claude Fable 5](https://simonwillison.net/2026/Jun/9/claude-fable-5/) 的鹈鹕被 [GLM-5.2 超越](https://simonwillison.net/2026/Jun/17/glm-52/)，而我虽然喜欢 GLM，但不认为它是 Fable 级别的模型。

（我还是不相信各家实验室在[针对这个基准做训练](https://simonwillison.net/2025/Nov/13/training-for-pelicans-riding-bicycles/)——如果是的话，结果应该好得多。不过 Gemini 有可能针对[任意动物搭配交通工具的组合](https://simonwillison.net/2026/Feb/19/gemini-31-pro/#jeff-dean)做过优化！）

鹈鹕测试最大的局限在于它完全触及不到当今模型最重要的事情：智能体工具调用，以及随着对话增长可靠操作工具的能力。

所以别用鹈鹕来比较模型！

尽管如此，我自己跑这个基准测试仍然能获得不少价值。

首先，它是一个推动我去真正试用模型的强制手段。我给你看一只鹈鹕，就意味着我确实跑通了那个模型的提示词。如果模型有官方 API，我就用官方 API；如果是开放权重（且小到能装进 128GB M5 MacBook Pro），我会尝试在本机跑，通常通过 [llama.cpp](https://github.com/ggml-org/llama.cpp)、[LM Studio](https://lmstudio.ai/) 或 [Ollama](https://ollama.com/)。我还经常用 [OpenRouter](https://openrouter.ai/)，因为它通常能代理官方 API，省得我再注册新密钥。

我的大多数鹈鹕都是用[我的 LLM CLI 工具](https://llm.datasette.io/)生成的，这也有助于推动我确保最新模型通过其插件获得支持。

更重要的是，仅仅一个「生成一幅鹈鹕骑自行车的 SVG」的提示词就能暴露出模型的有趣特性。

看看今天 Kimi K3 的[结果](https://gist.github.com/simonw/66a2699eb1594258904c7b5102840dd6)。跑这些简单提示词帮助强调了该模型的几个要点：

1. 它目前只有一个推理力度级别——「max」，而且表现得很明显。模型消耗了 13,241 个推理 Token 来输出 3,417 个回复 Token。这很贵——那只鹈鹕花了 25 美分！
2. 「Generate an SVG of a pelican riding a bicycle」这个提示词怎么就算 95 个输入 Token 了？OpenAI 的[分词器](https://platform.openai.com/tokenizer)算出 10 个，[Anthropic 的](https://tools.simonwillison.net/claude-token-counter)对 Opus 4.6 算 10 个、Opus 4.7 算 30 个、Sonnet 5/Fable 5 算 25 个。对 Kimi K3 输入「hi」[算出了 86 个 Token](https://news.ycombinator.com/item?id=48935342#48936461)，暗示可能存在一个 85 Token 的隐藏系统提示词。不过它[拒绝泄露内容](https://news.ycombinator.com/item?id=48935342#48936515)。
3. 视觉能力不错：生成的替代文本质量很高。

K3 目前只有一个推理力度级别，但我最近从用不同力度跑同一个鹈鹕提示词中获得了很多价值，能快速了解这些力度的影响。例如这是我为 [GPT-5.6 模型家族做的矩阵](https://static.simonwillison.net/static/2026/gpt-5.6-pelicans.html)。

说真的，我从鹈鹕测试中获得的主要收获是：

1. 它是给模型发提示词的「Hello World」练习
2. 提供了一个简单任务的大致成本和推理估算
3. 确认模型能输出有效 SVG 并具备基本的几何和空间感知能力。这对那些能在我笔记本上跑的小模型来说意义更大。
4. 比较同一模型家族不同版本之间的鹈鹕依然有趣。K3 的鹈鹕较 [Kimi 2.5](https://simonwillison.net/2026/Jan/27/kimi-k25/) 有明显提升。
5. 这是我能分享的、证明我试用过的证据。再加上带鹈鹕的评论在 Hacker News 上几乎成了一种传统——每当我晚了，就会有人评论问鹈鹕在哪！

---

> **译者注**：Simon Willison 的「鹈鹕骑自行车」是一个经典的非正式 LLM 基准测试，用「生成一幅鹈鹕骑自行车的 SVG」这个简单提示词来快速感受模型的代码生成、空间推理和视觉理解能力。Kimi K3 是月之暗面发布的最新超大模型（2.8T 参数），定价对标 Anthropic Sonnet 系列，是国产模型首次进入高价区间。
