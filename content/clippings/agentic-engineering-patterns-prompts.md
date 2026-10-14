---
title: 我常用的提示词
description: Simon Willison《Agentic Engineering Patterns》附录：我在用的四组提示词——Artifact 构建规范、博客校对、图片替代文本、播客金句提取
tags:
  - translation
  - prompt-engineering
  - claude
  - agent
  - accessibility
source: https://simonwillison.net/guides/agentic-engineering-patterns/prompts/
date: 2026-09-18
author: Simon Willison
---

## 我常用的提示词

> **原文**：[Prompts I use](https://simonwillison.net/guides/agentic-engineering-patterns/prompts/) | 作者：Simon Willison | 日期：未标注（指南章节，持续更新） | 出处：《Agentic Engineering Patterns》附录

## 摘要

这是 Simon Willison 指南《Agentic Engineering Patterns》的附录章节，收录他本人在用的四组提示词，并会持续更新。四组分别是：（1）**Artifact 构建规范**——通过 Claude 项目的自定义指令，强制产出纯 HTML/vanilla JS/CSS 而不用 React，好处是无需构建步骤、代码可直接复制到别处静态托管；（2）**博客校对**——他坚持「表达观点、用第一人称的文字必须自己写」，但允许 LLM 帮忙校对拼写、语法、重复用词、逻辑与事实错误、空链接；（3）**图片替代文本**——让模型按「先说明图片性质、原图文字必须逐字收录、输出单行围栏代码块」的格式起草 alt 文本，常配合 Claude Opus 使用；（4）**播客金句提取**——把播客转录稿丢进项目，只让它挑出最能体现主题、或最出人意料/最犀利的话。整体透露出一个态度：提示词是个人工作流的沉淀，而不是通用模板。

## 术语表

| 英文                | 中文               | 说明                                         |
| ------------------- | ------------------ | -------------------------------------------- |
| Artifacts           | Artifacts          | Claude 聊天中直接渲染 HTML/JS 应用的产物功能 |
| Canvas              | Canvas             | OpenAI 与 Gemini 中对应 Artifacts 的同类功能 |
| custom instructions | 自定义指令         | Claude 项目中长期生效的提示词配置            |
| vanilla JavaScript  | vanilla JavaScript | 不依赖框架的原生 JavaScript                  |
| alt text            | 替代文本           | 图片的可访问性描述，供屏幕阅读器朗读         |
| proofread           | 校对               | 检查拼写、语法、逻辑与事实错误               |
| fenced code block   | 围栏代码块         | 用 ``` 包裹的 Markdown 代码块                |
| transcript          | 转录稿             | 播客/访谈的逐字记录文本                      |
| dark factories      | 暗工厂             | 指几乎无需人工介入、全自动运转的工厂         |
| Sentence case       | 句首大写           | 仅句首字母大写的标题写法（非 Title Case）    |

---

## 正文（双语对照）

This section of the guide will be continually updated with prompts that I use myself, linked to from other chapters where appropriate.

本章节会持续更新我本人正在使用的提示词，并会在合适的地方被其他章节引用。

### Artifacts

I frequently use Claude's Artifacts feature for prototyping and to build small HTML tools. Artifacts are when regular Claude chat builds an application in HTML and JavaScript and displays it directly within the Claude chat interface. OpenAI and Gemini offer a finial feature which they both call Canvas.

我经常用 Claude 的 Artifacts 功能做原型、构建小型的 HTML 工具。所谓 Artifacts，就是普通的 Claude 聊天直接构建出 HTML + JavaScript 应用，并直接在 Claude 的聊天界面里渲染出来。OpenAI 和 Gemini 也提供了类似功能，两家都叫 Canvas。

Models love using React for these. I don't like how React requires an additional build step which prevents me from copying and pasting code out of an artifact and into static hosting elsewhere, so I create my artifacts in Claude using a project with the following custom instructions:

模型做这类东西时特别爱用 React。我不喜欢 React 需要额外的构建步骤——这会让我没法把代码从 Artifact 里复制粘贴出去、放到别处的静态托管上。所以我用一个 Claude 项目来创建 Artifacts，并为它配置了下面这段自定义指令：

````text
Never use React in artifacts - always plain HTML and vanilla JavaScript and CSS with minimal dependencies.

CSS should be indented with two spaces and should start like this:
```html
<style>
* {
  box-sizing: border-box;
}
```

Inputs and textareas should be font size 16px. Font should always prefer Helvetica.

JavaScript should be two space indents and start like this:
```html
<script type="module">
// code in here should not be indented at the first level
```

Prefer Sentence case for headings.
````

译：

````text
在 artifact 中永远不要使用 React —— 始终使用纯 HTML、vanilla JavaScript 和 CSS，依赖越少越好。

CSS 使用两个空格缩进，并且这样开头：
```html
<style>
* {
  box-sizing: border-box;
}
```

输入框和 textarea 的字号应为 16px。字体始终优先使用 Helvetica。

JavaScript 使用两个空格缩进，并且这样开头：
```html
<script type="module">
// 这里的代码在第一层不要缩进
```

标题优先使用句首大写（Sentence case）。
````

### Proofreader

I don't let LLMs write text for my blog. My hard line is that anything that expresses opinions or uses "I" pronouns needs to have been written by me. I'll allow an LLM to update code documentation but if something has my name and personality attached to it then I write it myself.

我不让 LLM 为我的博客写正文。我的底线是：任何表达观点、或者使用第一人称「我」的文字，都必须由我自己写。我可以允许 LLM 更新代码文档，但如果某样东西署着我的名字、带着我的个人风格，那我就自己写。

I do use LLMs to proofread text that I publish. Here's my current proofreading prompt, which I use as custom instructions in a Claude project:

但我确实会用 LLM 来校对我要发布的文字。下面是我当前在用的校对提示词，它被配置为一个 Claude 项目的自定义指令：

```text
You are a proofreader for posts about to be published.

1. Identify spelling mistakes and typos
2. Identify grammar mistakes
3. Watch out for repeated terms like "It was interesting that X, and it was interesting that Y"
4. Spot any logical errors or factual mistakes
5. Highlight weak arguments that could be strengthened
6. Make sure there are no empty or placeholder links
```

译：

```text
你是即将发布文章的校对员。

1. 找出拼写错误和笔误
2. 找出语法错误
3. 留意重复的表述，比如「有意思的是 X，而且有意思的是 Y」
4. 找出逻辑错误或事实错误
5. 标出论据薄弱、可以加强的地方
6. 确认没有空链接或占位链接
```

### Alt text

I use this prompt with images to help write the first draft of the alt text for accessibility.

我会把这个提示词配合图片使用，帮助起草供无障碍使用的替代文本（alt text）初稿。

```text
You write alt text for any image pasted in by the user. Alt text is always presented in a fenced code block to make it easy to copy and paste out. It is always presented on a single line so it can be used easily in Markdown images. All text on the image (for screenshots etc) must be exactly included. A short note describing the nature of the image itself should go first.
```

译：

```text
你为用户粘贴的任何图片撰写替代文本。替代文本始终放在围栏代码块中呈现，方便复制粘贴。它始终以单行形式给出，以便直接用在 Markdown 图片语法里。图片上的所有文字（例如截图中的文字）都必须原样收录。开头先给一句简短说明，交代这张图片本身的性质。
```

I usually use this with Claude Opus, which I find has extremely good taste in alt text. It will often make editorial decisions of its own to do things like highlight just the most interesting numbers from a chart.

我通常搭配 Claude Opus 使用它——我觉得它在替代文本上的品味极好。它常常会自己做出编辑判断，比如从一张图表里只挑出最有趣的几个数字来强调。

These decisions may not always be the right ones. Alt text should express the key meaning that is being conferred by the image. I often edit the text produced by this prompt myself, or provide further prompts telling it to expand certain descriptions or drop extraneous information.

这些判断并不总是对的。替代文本应当表达图片所传达的核心含义。我经常会自己修改这段提示词产出的文本，或者追加指令让它展开某些描述、或者删掉多余信息。

Sometimes I pass multiple images to the same conversation driven by this prompt, since that way the model can describe a subsequent image by making reference to the information communicated by the first.

有时我会把多张图片送进同一个由该提示词驱动的对话，这样模型在描述后面那张图时，可以引用第一张图所传达的信息。

### Podcast highlights

After I'm a guest on a podcast I like to publish a blog post with some quoted highlights from the conversation. I start by pasting a transcript of the podcast into a Claude Project with the following custom instructions:

在做过某档播客的嘉宾之后，我喜欢发一篇博客，摘录对话中的一些精彩片段。我的做法是把播客的转录稿粘贴进一个 Claude 项目，并为它配置下面这段自定义指令：

```text
You will be given a transcript of a podcast episode. Find the most interesting quotes in that transcript - quotes that best illustrate the overall themes, and quotes that introduce surprising ideas or express things in a particularly clear or engaging or spicy way. Answer just with those quotes - long quotes are fine.
```

译：

```text
你会拿到一集播客的转录稿。请从转录稿中找出最有趣的引语——最能体现整体主题的引语，以及那些引入了出人意料的观点、或者以特别清晰、特别吸引人、特别辛辣的方式表达出来的引语。只回答这些引语即可——引语长一点没关系。
```

Here's example output after pasting in the transcript from An AI state of the union: We've passed the inflection point, dark factories are coming, and automation timelines with Lenny Rachitsky.

下面是把《An AI state of the union: We've passed the inflection point, dark factories are coming, and automation timelines》这期与 Lenny Rachitsky 的访谈转录稿粘贴进去之后的输出示例。

（原文此处直接跳转到下一篇章节链接，未附具体输出内容。）

---

### 本指南目录

Principles

1. What is agentic engineering?
2. Writing code is cheap now
3. Hoard things you know how to do
4. AI should help us produce better code
5. Anti-patterns: things to avoid

Working with coding agents

1. How coding agents work
2. Using Git with coding agents
3. Subagents

Testing and QA

1. Red/green TDD
2. First run the tests
3. Agentic manual testing

Understanding code

1. Linear walkthroughs
2. Interactive explanations

Annotated prompts

1. GIF optimization tool using WebAssembly and Gifsicle
2. Adding a new content type to my blog-to-newsletter tool

Appendix

1. Prompts I use

第一章 · 原则

1. 什么是 agentic engineering（智能体工程）？
2. 现在写代码很便宜
3. 把手头会做的活儿囤起来
4. AI 应当帮我们产出更好的代码
5. 反模式：应当避免的做法

第二章 · 与编码智能体协作

1. 编码智能体是如何工作的
2. 与编码智能体一起使用 Git
3. 子智能体

第三章 · 测试与质量保障

1. 红/绿 TDD
2. 先跑测试
3. 智能体式的手工测试

第四章 · 理解代码

1. 线性走读
2. 交互式讲解

第五章 · 带注释的提示词

1. 用 WebAssembly 和 Gifsicle 做 GIF 优化工具
2. 给我的「博客转邮件简报」工具新增一种内容类型

附录

1. 我常用的提示词

---

> **译者注**：
>
> 1. 原文页面未标注发布/更新日期，本文 frontmatter 中的日期为翻译日期。
> 2. 原文「finial feature」疑为「similar feature」的笔误，按上下文译为「类似功能」。
> 3. 「Prompts I use」是《Agentic Engineering Patterns》指南的附录章节，文末目录为指南全章的章节列表，原页面以导航形式呈现，本文转为列表保留，便于对照。
