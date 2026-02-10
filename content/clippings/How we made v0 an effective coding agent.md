---
title: 我们如何将 v0 打造为高效的编程智能体
description: v0’s composite AI pipeline boosts reliability by fixing errors in real time. Learn how dynamic system prompts, LLM Suspense, and autofixers work together to deliver stable, working web app generations at scale.
source: https://vercel.com/blog/how-we-made-v0-an-effective-coding-agent
author:
  - "[[Max Leiter]]"
tags:
  - clippings
  - vercel
  - v0
---
去年，我们推出了 [v0 复合模型系列](https://vercel.com/blog/v0-composite-model-family)，并介绍了 v0 模型如何在多步智能体流水线中运行。该流水线中有三个部分对可靠性的影响最大：动态系统提示词、我们称之为“LLM Suspense”的流式处理操作层，以及一套在模型完成流式传输其响应之后（或期间！）运行的确定性且由模型驱动的自动修复器。


## 我们的优化目标

我们优化的主要指标是生成成功率。成功的生成是指在 v0 的预览中生成一个可以运行的网站，而不是出现错误或空白屏幕。但问题在于，独立运行的大语言模型 (LLM) 在大规模生成代码时会遇到各种问题。

根据我们的经验，LLM 生成的代码出错率可能高达 10%。我们的复合流水线能够在 LLM 流式输出时实时检测并修复其中的许多错误。这可以使成功率实现两位数的增长。

![[Pasted image 20260210102428.png]]

## 动态系统提示词


你产品的护城河不能只是系统提示词。然而，这并不能改变一个事实：系统提示词是你引导模型最强大的工具。
A product's moat cannot just be a system prompt. However, that doesn't change the fact that the system prompt is the most powerful tool you have to guide a model.

以 [AI SDK](https://ai-sdk.dev/) 的使用为例。AI SDK 定期发布主版本和次版本更新。模型通常依赖于过时的内部知识（即它们的“训练截止日期”），但我们希望 v0 使用最新版本。这可能会导致诸如使用旧版本 SDK 的 API 之类的错误。这些错误会直接降低我们的成功率。
For example, take [AI SDK](https://ai-sdk.dev/) usage. AI SDK ships major and minor releases regularly. Models often rely on outdated internal knowledge (their “training cutoff”), but we want v0 to use the latest version. This can lead to errors like using APIs from an older version of the SDK. These errors directly reduce our success rate.

许多智能体依赖网络搜索工具来获取新信息。网络搜索非常出色（v0 也在使用），但它也有其缺陷。你可能会得到过时的搜索结果，例如陈旧的博客文章和文档。此外，许多智能体使用较小的模型来总结网络搜索结果，这反过来又演变成了小模型与父模型之间一场糟糕的“传声筒游戏”。小模型可能会产生幻觉、错误引用或遗漏重要信息。
Many agents rely on web search tools to get new information. Web search is excellent (and v0 uses it), but it has pitfalls. You can get outdated search results, such as stale blog posts and documentation. Further, many agents use smaller models to summarize web search results, which in turn becomes a bad game of "telephone" between the small model and the parent model. Small models can hallucinate, misquote, or miss important information.

我们不依赖网页搜索，而是使用嵌入和关键词匹配来检测 AI 相关意图。当消息被标记为 AI 相关且与 AI SDK 相关时，我们会在提示词中注入描述该 SDK 目标版本的知识。我们保持这种注入的一致性，以最大限度地提高提示词缓存命中率，并保持较低的 Token 使用量。
Instead of relying on web search, we use embeddings and keyword matching to detect AI-related intent. When a message is flagged as AI-related and relevant to the AI SDK, we inject knowledge describing the target version of that SDK into the prompt. We keep this injection consistent to maximize prompt cache hit rates and keep token usage low.

除了文本注入，我们还与 AI SDK 团队合作，在 v0 智能体的只读文件系统中提供示例。这些是人工精选的目录，包含专为大语言模型设计的代码示例。当 v0 决定使用该 SDK 时，它可以搜索这些目录以查找相关模式，例如图像生成、路由或集成网页搜索工具。
In addition to text injection, we work with the AI SDK team to provide examples in the v0 agent's read-only file system. These are hand-curated directories containing code examples designed for LLMs. When v0 decides to use that SDK, it can search these directories for relevant patterns, like image generation, routing, or integrating web search tools.

这些动态系统提示词被用于各种主题，包括前端框架和集成。
These dynamic system prompts are used for a variety of topics, including frontend frameworks and integrations.

## LLM Suspense

LLM Suspense 是一个在向用户流式传输文本时对其进行处理的框架。这包括诸如用于清理错误导入的查找并替换等操作，但也可以变得更加复杂。

两个示例展示了它所提供的灵活性：

一个简单的例子是替换 LLM 经常引用的长字符串。例如，当用户上传附件时，我们会给 v0 一个 blob 存储 URL。该 URL 可能非常长（数百个字符），这可能会消耗数十个 token 并影响性能。
A simple example is substituting long strings the LLM often refers to. For example, when a user uploads an attachment, we give v0 a blob storage URL. That URL can be very long (hundreds of characters), which can cost 10s of tokens and impact performance.

在调用 LLM 之前，我们将长 URL 替换为较短的版本，这些版本在 LLM 完成其响应后会被转换回正确的 URL。这意味着 LLM 读取和写入的 token 更少，从而为我们的用户节省了金钱和时间。
Before we invoke the LLM, we replace the long URLs with shorter versions that get transformed into the proper URL after the LLM finishes its response. This means the LLM reads and writes fewer tokens, saving our users money and time.

在生产环境中，这些简单的规则可以处理引号、格式化和混合导入块的各种变化。由于这是在流式传输过程中发生的，用户永远不会看到中间的错误状态。
In production, these simple rules handle variations in quotes, formatting, and messy import blocks. Because this happens during streaming, the user never sees the intermediate error state.

![[Pasted image 20260210102418.png]] 

Suspense 还可以处理更复杂的情况。默认情况下，v0 使用 [lucide-react](https://lucide.dev/guide/packages/lucide-react) 图标库。它每周更新一次，添加和删除图标。这意味着 LLM 经常会引用不再存在或从未存在过的图标。
Suspense can also handle more complex cases. By default, v0 uses the [lucide-react](https://lucide.dev/guide/packages/lucide-react) icon library. It updates weekly, adding and removing icons. This means the LLM will often reference icons that no longer exist or never existed.

为了确定性地纠正这一点，我们：
To correct this deterministically, we:

1. 将每个图标名称嵌入到向量数据库中。 (Embed every icon name in a vector database.)
2. 在运行时分析 [lucide-react](https://lucide.dev/) 的实际导出项。 (Analyze actual exports from lucide-react at runtime.)
3. 当可用时，透传正确的图标。 (Pass through the correct icon when available.)
4. 当图标不存在时，运行嵌入搜索以找到最接近的匹配项。 (When the icon does not exist, run an embedding search to find the closest match.)
5. 在流式传输过程中重写导入语句。 (Rewrite the import during streaming.)

例如，针对“Vercel logo 图标”的请求可能会生成：
For example, a request for a "Vercel logo icon" might generate:

```typescript
import { VercelLogo } from 'lucide-react'
```

LLM Suspense 将会将其替换为：
LLM Suspense will replace it with:

```typescript
import { Triangle as VercelLogo } from 'lucide-react'
```

此过程在 100 毫秒内完成，且不需要进一步的模型调用。
This process completes within 100 milliseconds and requires no further model calls.

## Autofixers

有时，有些问题是我们的系统提示词和 LLM Suspense 无法修复的。这些问题通常涉及跨多个文件的更改，或者需要分析抽象语法树 (AST)。

对于这些情况，我们在流式传输后收集错误，并将其传递给我们的自动修复程序。这些程序包括确定性修复，以及一个基于大量真实生成数据训练的小型、快速、经过微调的模型。

一些自动修复的示例如下：
Some autofix examples include:

- 来自 `@tanstack/react-query` 的 `useQuery` 和 `useMutation` 需要被包裹在 `QueryClientProvider` 中。我们解析 AST 以检查它们是否已被包裹，但自动修复模型会决定在何处添加它。
  `useQuery` and `useMutation` from `@tanstack/react-query` require being wrapped in a `QueryClientProvider`. We parse the AST to check whether they're wrapped, but the autofix model determines where to add it.
- 通过扫描生成的代码并确定性地更新文件，补全 `package.json` 中缺失的依赖。
  Completing missing dependencies in `package.json` by scanning the generated code and deterministically updating the file.
- 修复在 Suspense 转换过程中遗漏的常见 JSX 或 TypeScript 错误。
  Repairing common JSX or TypeScript errors that slip through Suspense transformations.

这些修复在不到 250 毫秒内运行，且仅在需要时执行，使我们能够在提高可靠性的同时保持低延迟。
These fixes run in under 250 milliseconds and only when needed, allowing us to maintain low latency while increasing reliability.

![[Pasted image 20260210102407.png]] 

将动态系统提示词、LLM Suspense 和自动修复器相结合，为我们提供了一套流水线，其生成稳定、可运行结果的效率远高于独立模型。该流水线的每个环节都针对特定的失败模式进行了优化，共同显著提升了用户在 v0 中首次尝试即可看到渲染网站的可能性。
