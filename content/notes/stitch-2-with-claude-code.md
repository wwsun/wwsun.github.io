---
title: Google Stitch 2 with Claude Code
tags: google, stitch, claude-code
draft: false
description: 未命名
source: https://www.youtube.com/watch?v=EKix32vioss
---

Stitch 现在的定位不再仅仅是一个根据提示词生成漂亮界面的 AI 工具，它正演变为一个「AI 原生软件设计画布」。过去，使用 Stitch 的感觉是「输入提示词，输出 UI」，你生成一个屏幕，如果不满意就重来。现在，Google 正在将其推向构思、迭代、原型设计、协作以及开发者交付的全流程环境。

以意图为中心的设计新范式

## round1: 提示词

```
帮我制作一个叫 'VibeStream' 的原生音乐 App。

布局设计：底部要有三个切换按钮，分别是‘发现音乐’、‘我的音乐库’和‘搜索’。

外观风格：使用酷炫的深色模式。界面要看起来像磨砂玻璃一样，带有半透明的质感。

准备内容：先帮我生成 5 首虚拟的歌曲（包含歌名、歌手和封面图），让我能看到实际效果
```

![[vibestream-v0-design-system-screens.png]]

## round 2: 添加一个“正在播放”的播放器界面

![[vibestream-now-playing-screen.png]]

## round3: 调整 design system

![[vibestream-crimson-edge-design-screens.png]]

## round4: 导出

![[vibestream-fixed-now-playing-export.png]]

## round 5: 在 AI Studio 中实现

Stitch 现在通过 MCP 服务 SDK、技能插件以及对 AI Studio 的导出，接入了更广泛的工具链。这解决了 AI 设计工具长期以来的痛点：交付尴尬。以往你可能只得到一张精美的图片，开发工作仍需从零开始。

Stitch 现在被定位为 AI 智能体与开发工具之间的桥梁。对于独立开发者或快速迭代的团队来说，理想的工具不是给出一张静态图，而是帮助你以最小的摩擦从创意走向可构建的产品。
![[vibestream-gemini-ai-studio-preview.png]]
