---
title: Claude 文本水印的工作原理
description: Anthropic 官方解读 Claude 文本水印机制——基于 SynthID-Text 技术，在不影响输出质量的前提下为文本打上可检测标记，以符合欧盟《人工智能法案》。
tags:
  - clippings
  - anthropic
  - watermark
  - ai-regulation
  - llm
source: https://www.anthropic.com/news/claude-text-watermark
created: 2026-08-20
author: Anthropic
---

## Claude 文本水印的工作原理

> **原文**：[How Claude's text watermarking works](https://www.anthropic.com/news/claude-text-watermark) | 作者：Anthropic | 日期：2026-08-14

## 📝 摘要

Anthropic 宣布未来 Claude 模型生成的文本将带有水印，用于判断文本由 Claude 生成的可能性，以满足欧盟《人工智能法案》的要求。文章解释了水印的技术原理：它只改变模型在多个「低风险」候选词之间做随机选择时所用的随机源，对输出质量和内容没有任何实际影响，读者无法察觉，也不含任何可追溯到个人或组织的信息。Claude 采用的水印是 Google DeepMind 在 2024 年 Nature 论文中提出的 SynthID-Text 方法。文章还解答了水印对代码、校对、翻译、检测、版权归属等方面的常见疑问。

## 📋 术语表

| 英文                    | 中文                 | 说明                                                 |
| ----------------------- | -------------------- | ---------------------------------------------------- |
| watermarking            | 水印                 | 在生成文本中嵌入可检测模式，用于判断文本来源         |
| SynthID-Text            | SynthID-Text         | Google DeepMind 于 2024 年在 Nature 发表的水印技术   |
| EU AI Act               | 欧盟《人工智能法案》 | 要求 AI 系统提供商标记 AI 生成内容                   |
| Code of Practice        | 行为准则             | 欧盟《AI 生成内容透明度行为准则》，约 190 个签署方   |
| C2PA                    | C2PA                 | 内容来源与真实性联盟的开放标准，记录文件来源         |
| content credential      | 内容凭证             | 文件元数据中加密签名的来源说明                       |
| token                   | Token                | 语言模型生成文本的最小单位                           |
| random number generator | 随机数生成器         | 用于在候选词之间做随机选择的机制                     |
| watermark detection API | 水印检测 API         | Anthropic 即将提供的检测文本是否由 Claude 生成的服务 |

---

## 正文（双语对照）

Future Claude models will generate text that contains a watermark. This is a way of determining the likelihood that Claude was involved in writing the text, and we, along with several other major AI providers, are implementing this change to comply with the EU AI Act.

未来 Claude 模型生成的文本将带有水印。这是一种判断文本是否可能由 Claude 参与撰写的方法。我们与其他几家主要 AI 提供商一起实施这一改动，以符合欧盟《人工智能法案》的要求。

In this article, we share answers to some of the questions we've received about how our chosen watermarking method works, whether it affects Claude's outputs, and why we're making this change. To summarize:

在本文中，我们针对大家提出的问题给出解答，包括我们选择的水印方法如何工作、是否影响 Claude 的输出，以及我们为什么做出这一改动。总结如下：

- We use a method of watermarking that does not have any practical impact on the quality or content of Claude's outputs;

- 我们采用的水印方法对 Claude 输出的质量或内容没有任何实际影响；

- The difference between watermarked and un-watermarked text will not be distinguishable to readers;

- 读者无法区分带水印和不带水印的文本之间的差异；

- Nothing is added to the text and there are no hidden characters;

- 文本中没有添加任何内容，也不存在隐藏字符；

- Watermarking doesn't require extra tokens, and will not be more expensive;

- 水印不需要额外的 Token，也不会更贵；

- Watermarking carries no identifying information and can't be traced to a specific person, organization, or chat;

- 水印不携带任何身份信息，无法追溯到特定的个人、组织或对话；

- Watermarking won't be specific to Claude. As of August 2, the EU requires AI providers serving its market to mark AI-generated content. Other major model developers have signed the same Code of Practice and will be implementing their own watermarks.

- 水印并非 Claude 独有。自 8 月 2 日起，欧盟要求向其市场提供服务的 AI 提供商标记 AI 生成的内容。其他主要模型开发商已签署同一份行为准则，并将实施各自的水印。

## What is watermarking?

## 什么是水印？

Large language models like Claude work by generating one word at a time. Each time the model decides on the next word, it chooses among a list of potential candidates, ultimately selecting the most sensible or likely based on the preceding text. Take the sentence "The weather today was cold and…". The next word is very unlikely to be "sugary." But it is quite likely to be "overcast" or "grey." Under most circumstances, it doesn't matter much to the reader which of these latter two words the model ultimately chooses—the meaning of the sentence is largely the same either way. In cases like this, the choice is settled by a random number.

像 Claude 这样的大语言模型一次生成一个词。模型每次决定下一个词时，会在一系列候选词中挑选，最终根据前文选择最合理或最可能的那个。以句子「The weather today was cold and…」（今天天气寒冷且……）为例，下一个词极不可能是「sugary」（甜腻的），但很可能是「overcast」（阴沉的）或「grey」（灰蒙蒙的）。在大多数情况下，模型最终选哪个词对读者来说差别不大——句子的含义几乎相同。在这种情况下，选择由随机数来决定。

Watermarking uses low-stakes choices like these—which occur many times over a piece of generated text—to leave a pattern in Claude's responses. That pattern is undetectable to the reader, but is detectable to anyone who has a key that encodes it. When watermarking is used, choices are still made at random, but the source of the randomness is different. Instead of using an arbitrary random number generator to pick the next word, watermarking uses the key and a few words that come before to settle what word the model should pick. That is, the words that Claude picks are still random, but now, one can check the sequence of words and see if it's consistent with the choices Claude would make if it was using the key. If it is, one can assign a probability that the text was generated by Claude.

水印利用这类低风险的选择——它们在一段生成文本中会出现很多次——在 Claude 的回复中留下一种模式。这种模式对读者不可察觉，但对任何持有编码该模式密钥的人来说是可以检测的。使用水印时，选择仍然是随机的，但随机性的来源变了。水印不再用任意的随机数生成器来选择下一个词，而是用密钥和前文的几个词来决定模型该选哪个词。也就是说，Claude 选择的词仍然是随机的，但现在人们可以检查词序列，看它是否与 Claude 在使用密钥时会做出的选择一致。如果一致，就可以给出一段文本由 Claude 生成的概率。

Importantly, it isn't that the model will now always be biased toward overcast or grey. Just as with non-watermarked text, overcast might be selected in one sentence, grey in the next, depending on the words that came before. And it's not the case that the watermarking method pushes Claude to choose a word it wouldn't have considered anyway (for instance, it wouldn't make Claude pick a word like "nubilous"—an obscure1 synonym for overcast or grey that Claude almost certainly wouldn't use under normal circumstances).

重要的是，模型并不会从此总是偏向「overcast」或「grey」。和不带水印的文本一样，这一句可能选「overcast」，下一句可能选「grey」，取决于前文。水印方法也不会迫使 Claude 去选一个它本来根本不会考虑的词（比如，它不会让 Claude 选「nubilous」这个词——它是「overcast」或「grey」的一个冷僻同义词1，Claude 在正常情况几乎不会用）。

## How does watermarking affect Claude's outputs?

## 水印如何影响 Claude 的输出？

Watermarking does not impact the quality of Claude's output. To a reader, a watermarked response is indistinguishable from an unwatermarked one (in this way, AI watermarks differ substantially from their namesakes on banknotes, other physical objects, and some digital documents, which are visible to the naked eye).

水印不影响 Claude 输出的质量。对读者而言，带水印的回复与不带水印的回复无法区分（这一点上，AI 水印与钞票、其他实体物品以及某些数字文档上的同名水印大不相同——后者肉眼可见）。

In internal testing, we've seen no impact of watermarking on the content, level of creativity, or readability of Claude's text. In the SynthID-Text paper, which introduced the technique we use, Google DeepMind tested this impact by serving a model that used watermarking to a portion of their Gemini traffic and comparing thumbs-up and thumbs-down ratings. They found no statistically significant differences from the unwatermarked model. And in a controlled study, human raters comparing watermarked and unwatermarked answers side-by-side saw no difference in quality.

在内部测试中，我们没有观察到水印对 Claude 文本的内容、创造力水平或可读性有任何影响。在介绍这项技术的 SynthID-Text 论文中，Google DeepMind 通过把启用水印的模型部署到一部分 Gemini 流量上，并对比点赞/点踩评分来测试这种影响。他们发现与不带水印的模型相比没有统计显著的差异。在一项对照研究中，人工评审员并排比较带水印和不带水印的回答，也没有看到质量上的差异。

A useful analogy is to imagine you're playing a game like Monopoly. On each turn, each player moves a random number of spaces around the board according to the roll of a die. Suppose that, instead of rolling the die to get this randomness, we decided to use a book of the digits of pi.2 We start from a randomly-chosen digit (say, the 1,012,845th after the decimal place, which happens to be a 6), and from that point on each player simply uses the next digit in the sequence as their next "roll."

一个有用的类比是想象你在玩大富翁之类的游戏。每一回合，每位玩家根据掷骰子的结果在棋盘上随机移动若干格。假设我们不掷骰子来获取随机性，而是改用一本圆周率 π 的数字表2。我们从一个随机选定的数字开始（比如小数点后第 1,012,845 位，恰好是 6），从那一刻起，每位玩家就把序列中的下一位数字当作自己下一次「掷骰」的结果。

For all intents and purposes, the moves are still random: it makes no difference to the players—or to the outcome of the game—whether the randomness comes from pi or from dice rolls each time. But if we could see the sequence of all the moves after the game (and we knew the value of pi), we could work out whether this was a game that likely used pi to determine its moves. The game that used pi is, in a sense, "watermarked."

无论怎么看，移动仍然是随机的：对玩家——或对游戏结果——来说，随机性来自 π 还是每次掷骰子并没有区别。但如果游戏结束后我们能看所有移动的序列（而且我们知道 π 的值），就能判断这场游戏是否很可能用 π 来决定移动。用了 π 的那场游戏，在某种意义上就是「带了水印」。

It's the same for Claude-generated text. Watermarking doesn't change the meaning or experience for the person reading it, but if you wanted to check after the fact whether the text was likely generated by Claude, the watermark allows you to do so.

Claude 生成的文本也是同样的道理。水印不会改变阅读者的含义或体验，但如果你想事后核实一段文本是否很可能由 Claude 生成，水印就能帮你做到。

## Which specific method of watermarking do you use?

## 你们具体采用哪种水印方法？

Claude's text watermark is a version of the SynthID-Text approach published by Google DeepMind in a Nature paper in 2024. It belongs to a family of approaches that go back to a proposal by Scott Aaronson in 2022, all of which share the same design principle that we described above—the watermark only changes the source of the randomness used to pick among words.

Claude 的文本水印是 Google DeepMind 在 2024 年一篇 Nature 论文中发表的 SynthID-Text 方法的一个版本。它属于一个可追溯到 Scott Aaronson 在 2022 年提出方案的方法家族，所有这些方法共享上文所述的同一设计原则——水印只改变在候选词之间做选择时所用的随机源。

There are limitations to the effectiveness of watermarking. Using our key, one can only answer the question "What is the likelihood this was partly written by Claude?" It doesn't confirm whether the text was human-written, and it can't tell whether the text was written by a different AI (even if that other AI uses watermarking, it would have a different key; it might also use a different watermarking method altogether). Detecting a watermark also doesn't work well on small samples, where there are fewer word choices and thus less information to go on. As a passage increases in length, confidence about Claude's involvement increases too.

水印的有效性存在局限。用我们的密钥，只能回答一个问题：「这段文本有多大可能部分由 Claude 撰写？」它既不能确认文本是否由人类所写，也不能判断文本是否由其他 AI 生成（即使那个 AI 也用了水印，它的密钥也不一样；它甚至可能用的是完全不同的水印方法）。在小样本上，水印检测效果也不佳，因为可供选择的词更少、信息更少。随着段落变长，关于 Claude 参与的置信度也随之提高。

Watermarking is sparser on factual passages where there are fewer choices that can be made without decreasing the accuracy of the text. For example, take the sentence "Isaac Newton's most famous work was called Principia…". It really matters whether the next word is "Mathematica" (it's the only right answer), so the watermark would have nothing to act on. The same is true for proofreading. If you hand Claude a piece of writing and ask it to edit only the grammar and punctuation and nothing else, the watermark can only live in the handful of corrections, which might be too few to register.

在事实性段落上，水印会更稀疏，因为在不降低文本准确性的前提下能做的选择更少。例如，句子「Isaac Newton's most famous work was called Principia…」（牛顿最著名的著作名为《自然哲学的数学原理》……），下一个词是否必须是「Mathematica」（数学原理）至关重要——它是唯一正确的答案，因此水印无从下手。校对也是如此。如果你把一段文字交给 Claude，让它只修改语法和标点、别的什么都不动，水印只能附着在寥寥几处修改上，可能少到无法被检测出来。

## What about cases where Claude has proofread or edited human text?

## 当 Claude 校对或编辑了人类文本时怎么办？

The watermark only applies to words Claude chooses. When Claude proofreads text written by a person, what it gives back has generally only been lightly edited; because nearly all the words are the person's, there's very little (if anything) for the watermark to attach to. Depending on the length of the text and how heavily Claude has edited it, those changes might not be enough to make Claude's involvement detectable. The more Claude writes, the more decisions it has to make, and the more space there is for a watermark.

水印只作用于 Claude 选择的词。当 Claude 校对人类撰写的文本时，它返回的内容通常只被轻微编辑；由于几乎所有词都是那个人写的，水印几乎没有（甚至完全没有）可附着的地方。取决于文本的长度和 Claude 编辑的幅度，这些改动可能不足以让 Claude 的参与被检测到。Claude 写得越多，需要做的决定越多，水印的空间也就越大。

## What about code?

## 代码呢？

As we noted above, AI watermarking takes advantage of decisions where either choice of a word would be equally good. Where an exact output is required—where there isn't a choice, and something would be factually wrong or a piece of code would break if a different term was chosen—the watermark isn't applied.

正如上文所述，AI 水印利用的是「选哪个词都一样好」的决策场景。在需要精确输出的地方——那里没有选择余地，如果换一个词，就会事实错误或导致代码出错——水印不会被应用。

For example, once the model has written "2 + 2 =", there is a very clear best choice for the next token (if the model is completing the sum, there isn't an answer that's equally as good as "4"; if it's talking about George Orwell's Nineteen Eighty-Four, there isn't an answer that's equally as good as "5"). The "nudge" of the watermark wouldn't be applied here. For the same reason, code—which in very many cases has to be exact—has generally less watermarking than some other forms of text.

例如，一旦模型写出「2 + 2 =」，下一个 Token 的最佳选择就非常明确（如果模型在完成这个算式，没有哪个答案能和「4」一样好；如果它在谈论乔治·奥威尔的《一九八四》，没有哪个答案能和「5」一样好）。水印的「微调」在这里不会被应用。出于同样的原因，代码——在很多时候必须精确——通常比其他形式的文本带有更少的水印。

Having said that, in areas where there is an arbitrary choice between particular words or terms within the code, the watermark can be used, such as comments within code. But by definition, it will have a negligible effect on the actual code produced.

话虽如此，在代码中某些词或术语存在任意选择的区域（比如代码里的注释），水印仍然可以使用。但就其定义而言，它会对实际生成的代码产生可忽略不计的影响。

## What does this mean for users?

## 这对用户意味着什么？

### Does this slow the model down, or make it more expensive?

### 这会让模型变慢或更贵吗？

No. Watermarking has a negligible impact on the speed of models, and because it produces no extra tokens, the model is the same price to serve and use.

不会。水印对模型速度的影响可以忽略不计，而且因为它不产生额外的 Token，模型的部署和使用成本保持不变。

### Can a watermark be traced back to me or my organization?

### 水印能被追溯到我自己或我的组织吗？

No. The watermarking applies to Claude and its outputs. It doesn't identify anything to do with individual users. There's nothing in the watermark, or its key, that would allow anyone to recover any information about the user, their organization, or their chats with Claude.

不能。水印作用于 Claude 及其输出，不涉及任何与个人用户相关的信息。水印及其密钥中没有任何内容能让任何人还原出关于用户、其组织或他们与 Claude 对话的信息。

## Why are you watermarking Claude's outputs?

## 你们为什么给 Claude 的输出打水印？

We're implementing watermarking to comply with the EU AI Act. Anthropic, along with several other major AI model providers and around 190 total signatories, signed the EU Code of Practice on Transparency of AI-Generated Content in July 2026. This requires AI system providers to use methods of "marking" AI-generated text. We're applying watermarking globally at launch because we don't yet have a durable way to scope it by region. However, we will continue to evaluate different approaches, and will share updates when we have them.

我们实施水印是为了符合欧盟《人工智能法案》。Anthropic 与其他几家主要 AI 模型提供商，以及总计约 190 个签署方，于 2026 年 7 月签署了欧盟《AI 生成内容透明度行为准则》。该准则要求 AI 系统提供商使用「标记」AI 生成文本的方法。我们在上线时全球范围内应用水印，是因为我们目前还没有按地区划分范围的持久方案。不过，我们会继续评估不同的方法，并在有进展时分享更新。

## Other questions

## 其他问题

### How do I check if a piece of text was written by Claude?

### 我如何检查一段文本是否由 Claude 撰写？

We will soon be offering a watermark detection API. We're in the process of working out the details of its implementation.

我们很快将提供水印检测 API。我们正在落实其实现细节。

### What about images and other files?

### 图片和其他文件呢？

When Claude produces a file of a supported type (such as a .png, .jpg, or .svg), it will attach a content credential in the form of a small, cryptographically signed note in the file's metadata, saying that the file was made or processed with Claude. This is an open industry standard called C2PA—the same used by camera manufacturers and in photo-editing software to record where an image came from. Any C2PA-aware tool can read it; we'll be providing our own where you can drop a file and check.

当 Claude 生成一个受支持类型的文件（如 .png、.jpg 或 .svg）时，它会在文件元数据中附加一个内容凭证——一段经过加密签名的小备注，说明该文件是用 Claude 制作或处理的。这是一个名为 C2PA 的开放行业标准——相机制造商和照片编辑软件也用它来记录图像的来源。任何支持 C2PA 的工具都能读取它；我们也会提供自己的工具，让你把文件拖进去就能检查。

This metadata label is very different from a watermark. Nothing in the file changes—it is not embedded or hidden. As with text, the credential only says Claude was involved in producing the file; it doesn't include any identifying information.

这个元数据标签与水印截然不同。文件本身没有任何改动——它不是嵌入或隐藏的。与文本一样，该凭证只说明 Claude 参与了文件的生成，不含任何身份信息。

### Can't someone just edit the text to get around the watermarking?

### 难道不能有人编辑文本绕过水印吗？

To some extent, yes. Light editing probably won't remove the watermark completely; a complete rewrite where every word is replaced will. In the latter case, of course, it's arguable whether the text can any longer be described as AI-generated.

在某种程度上，可以。轻微编辑可能无法完全去除水印；而把每个词都替换掉的彻底重写则可以。当然，在后一种情况下，这段文本是否还能被称为「AI 生成」就值得商榷了。

### What does a watermark actually prove?

### 水印实际上能证明什么？

A watermark can only determine that Claude was likely involved with the content at some point. It cannot distinguish "Claude wrote this" from "Claude heavily edited this."

水印只能判断 Claude 很可能在某个阶段参与了该内容。它无法区分「Claude 写了这段」和「Claude 大幅编辑了这段」。

### Do watermarks apply to translations?

### 水印适用于翻译吗？

Yes. A translation produced by Claude carries a watermark, because in this case every word is chosen by Claude.

是的。由 Claude 生成的翻译带有水印，因为这种情况下每个词都是由 Claude 选择的。

### What about older Claude models?

### 较旧的 Claude 模型呢？

The EU law includes a transition period for Anthropic models launched before August 2, 2026, and we're working to add watermarking for those models as well. This will be rolled out over the coming months.

欧盟法律为 2026 年 8 月 2 日之前发布的 Anthropic 模型设定了过渡期，我们也在努力为这些模型添加水印。这将在此后几个月内逐步推出。

### How does this differ from AI detection software, like Pangram?

### 这与 Pangram 之类的 AI 检测软件有何不同？

AI detection software uses a different method, because the companies that provide it don't have our key. Among other things, those services look at aspects of the text like the subtle (and not-so-subtle) "tells" that often appear in AI's phrasing. For example, AI models appear to be fond of the construction "this isn't [X], it's [Y]", and use the word "quietly" a lot more than you might expect. Picking up on these patterns is fundamentally different from checking for a watermark.

AI 检测软件用的是另一种方法，因为提供这些服务的公司没有我们的密钥。除其他方面外，这些服务会观察文本的某些特征，比如 AI 措辞中经常出现的微妙（以及不那么微妙）的「破绽」。例如，AI 模型似乎偏爱「this isn't [X], it's [Y]」（这不是 X，而是 Y）这种句式，而且「quietly」（悄然地）这个词的使用频率远超你的想象。捕捉这些模式与检查水印是根本不同的两回事。

### Does this change who owns a given output, or who is legally responsible for it?

### 这会改变某个输出的所有权或法律责任归属吗？

No. A watermark only helps test whether Claude might have produced or processed the content. It doesn't say anything about ownership or authorship, and doesn't change a user's rights under our terms. We only apply the watermark when Claude was involved in processing the content or file.

不会。水印只用于检验 Claude 是否可能生成或处理过该内容。它对所有权或作者身份不置一词，也不会改变用户在我们的条款下享有的权利。只有当 Claude 参与处理了内容或文件时，我们才会应用水印。

#### Footnotes

#### 脚注

1. Or, you might say, nubilous—which is also a synonym for "obscure."

1. 或者也可以说，nubilous 本身也是「obscure」（晦涩的）的同义词。

1. Pi is technically predictable, but any run of digits from somewhere in the middle of pi is indistinguishable from a run of rolls of a ten-sided die. Also, set aside the fact that the dice in Monopoly go from 1 to 6 whereas a digit of pi can be from 0 to 9; the analogy isn't perfect.

1. π 严格来说是可预测的，但从 π 中间某处开始的一串数字，与一枚十面骰连续掷出的结果无法区分。此外，请先忽略一个事实：大富翁里的骰子是从 1 到 6，而 π 的一位数字可以是 0 到 9；这个类比并不完美。

---

> **译者注**：本文译自 Anthropic 官方公告。核心结论是：Claude 的水印基于 SynthID-Text 技术，只改变「低风险候选词」之间的随机选择来源，不改变输出内容与质量、不可被读者察觉、不携带身份信息，也不额外消耗 Token。它的检测能力存在边界——对小样本、事实性文本、代码和轻微编辑的场景检测力较弱。需要留意的一点是：Claude 生成的翻译同样会带水印（因为每个词都是 Claude 选的），这与「水印只附着于 Claude 亲自选词」的原则一致。
