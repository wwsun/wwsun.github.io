---
title: CodePen 2.0
description: Chris Coyier 宣布 CodePen 2.0 发布，分享上线首周的几个故事，展示新版本的协作编辑、npm 包管理、Blocks 扩展和小网站部署等亮点功能
tags:
  - clippings
  - frontend
  - codepen
  - web-development
source: https://chriscoyier.net/2026/07/30/codepen-2-0/
created: 2026-07-31
author: Chris Coyier
---

## CodePen 2.0

> **原文**：[CodePen 2.0](https://chriscoyier.net/2026/07/30/codepen-2-0/) | 作者：Chris Coyier | 日期：2026-07-30

## 📝 摘要

Chris Coyier 宣布 CodePen 2.0 正式发布——他称这可能是个人职业生涯中最大的成就，投入的工作量甚至超过了最初创建 CodePen 的总和。本文并非面面俱到的更新说明，而是分享了上线首周的几个真实故事：与陌生人通过 Fork 和邀请功能进行协作、Keyframers 组合使用实时协作和 Live View 进行直播、将 MJML 添加为 CodePen Block 来构建邮件模板，以及通过 Pen Editor 直接部署小型网站。这些故事生动展现了 CodePen 2.0 在协作开发、包管理、可扩展性和一键部署方面的关键提升。

## 📋 术语表

| 英文         | 中文         | 说明                                     |
| ------------ | ------------ | ---------------------------------------- |
| CodePen      | CodePen      | 在线前端代码编辑器和社区平台             |
| Pen          | Pen/Pen      | CodePen 上的单个项目/代码片段            |
| Fork         | Fork/派生    | 复制他人的项目到自己的账户中继续开发     |
| npm          | npm          | Node.js 的包管理器                       |
| package.json | package.json | Node.js 项目的依赖和元数据配置文件       |
| Block        | Block/代码块 | CodePen 中可插入的预配置代码模块         |
| MJML         | MJML         | 一种专门用于编写响应式邮件模板的标记语言 |
| Live View    | 实时视图     | CodePen 提供的可分享的实时预览页面       |
| deploy       | 部署         | 将代码发布到可访问的线上地址             |

---

## 正文（双语对照）

Noting perhaps my largest personal career accomplishment, which is [launching CodePen 2.0](https://blog.codepen.io/2026/07/23/two-point-oh/). Far more work, believe it or not, than the entire creation of the original CodePen.

记录一下或许是我个人职业生涯中最大的成就——[CodePen 2.0 正式发布](https://blog.codepen.io/2026/07/23/two-point-oh/)。信不信由你，这个版本投入的工作量远超最初创建 CodePen 时的全部努力。

This isn't the place to describe every detail of what we did and why we did it. If you're interested, perhaps our [Why 2.0? podcast](https://blog.codepen.io/2026/03/05/419-why-2-0/) or the [What's New?](https://codepen.io/2/whats-new) page.

这里不打算逐一说明我们做了什么以及为什么要做。如果你感兴趣，可以去听听我们的 [Why 2.0? 播客](https://blog.codepen.io/2026/03/05/419-why-2-0/)，或者看看 [What's New? 页面](https://codepen.io/2/whats-new)。

Instead, a couple of stories from the first week of launch.

取而代之的，是上线第一周发生的几个小故事。

I was working on a demo with someone I've never met before. It started on their (classic) Pen. They needed to import some other JavaScript, so they used 3 Pens and pulled in the JavaScript from the other two into the main demo. They also needed an npm package. I [forked](https://blog.codepen.io/docs/pens/forking/) the Pen and [invited them](https://blog.codepen.io/docs/pens/privacy-sharing/#inviting-collaborators) as a co-editor, so we could both work on it together anytime. I moved the JavaScript into files on the main Pen, as that's much easier to work with. The npm [package](https://blog.codepen.io/docs/pens/packages/) is in the `package.json` file for easy version management. We both cleaned it up to our liking.

我和一个素未谋面的人一起做了一个 demo。起初是在他的（经典版）Pen 上开始的。他需要引入一些外部 JavaScript，于是他用了 3 个 Pen，把另外两个的 JavaScript 引入到主 demo 中。他还需要一个 npm 包。我 [Fork](https://blog.codepen.io/docs/pens/forking/) 了这个 Pen 并[邀请他](https://blog.codepen.io/docs/pens/privacy-sharing/#inviting-collaborators)作为协作编辑者，这样我们随时都能一起编辑。我把 JavaScript 移到了主 Pen 的文件中，这样操作起来方便多了。npm [包](https://blog.codepen.io/docs/pens/packages/)则放在 `package.json` 文件里，便于版本管理。最后我们都把它整理成了自己喜欢的样子。

[The Keyframers](https://keyframe.rs/) (David and Shaw) got back together and [did a live stream](https://www.youtube.com/watch?v=sgwPEW1gGYM&t=1s) on launch day. They also used the invite feature and [live collaboration](https://arc.net/l/quote/zbptvwfz). They worked together for hours, and while there was a bug or two, it was nothing super major, and it went great. One of my favorite bits was that they shared the [Live View](https://blog.codepen.io/docs/live-view/#live-view) of the Pen, so as they were working on it, we could play with the demo ourselves.

[The Keyframers](https://keyframe.rs/)（David 和 Shaw）重新聚首，在发布当天[做了一场直播](https://www.youtube.com/watch?v=sgwPEW1gGYM&t=1s)。他们也用了邀请功能和[实时协作](https://arc.net/l/quote/zbptvwfz)。他们连续协作了好几个小时，虽然遇到了两个 bug，但都不是什么大问题，整体非常顺利。我最喜欢的部分之一是，他们分享了 Pen 的[实时视图](https://blog.codepen.io/docs/live-view/#live-view)——也就是说，在他们编辑的同时，我们可以自己动手玩那个 demo。

As I was working on the emails we were going to send out about the launch, I was building them in the special language for crafting them: [MJML](https://mjml.io/). I went ahead and added MJML as a block to CodePen so I could just build them right in CodePen. [Works great](https://codepen.io/editor/team/codepen/pen/019f9076-f6cd-7727-ac29-30e936cabbb0), even for [weird stuff](https://codepen.io/editor/chriscoyier/pen/019fae5c-6bef-7ae7-aebd-8732e00b3613). Many more Blocks to come.

在我们准备发送关于此次发布的邮件时，我用专门撰写邮件的语言 [MJML](https://mjml.io/) 来构建它们。于是我把 MJML 作为一个 Block 添加到了 CodePen 中，这样就能直接在 CodePen 里构建邮件了。[效果非常好](https://codepen.io/editor/team/codepen/pen/019f9076-f6cd-7727-ac29-30e936cabbb0)，即使是一些[奇怪的需求](https://codepen.io/editor/chriscoyier/pen/019fae5c-6bef-7ae7-aebd-8732e00b3613)也能胜任。更多 Block 即将推出。

I friggin love how I can [make little websites](https://blog.codepen.io/docs/pens/deployment/) and deploy them right through the Pen Editor. Like the one [for our slideVars library](https://hip-forest-gobbler.codepen.app/) or [codepen.school](https://codepen.school/). It just makes me wanna build a ton of little weird websites.

我超爱我现在可以[创建小网站](https://blog.codepen.io/docs/pens/deployment/)并直接通过 Pen Editor 部署它们。比如[我们 slideVars 库的页面](https://hip-forest-gobbler.codepen.app/)或者 [codepen.school](https://codepen.school/)。这真的让我想建一大堆奇奇怪怪的小网站。

---

> **译者注**：Chris Coyier 是 CodePen 联合创始人，也是 CSS-Tricks 的创建者，前端社区极具影响力的人物。CodePen 2.0 于 2026 年 7 月 23 日正式发布，是自 2012 年上线以来最大规模的重构，从头重写了几乎整个代码库。本文以轻描淡写的笔触展现了这次大版本重构的实际价值——不在于技术堆栈的变更，而在于它让协作、分享和快速构建变得更加自然。
