---
created: 2026-01-13 15:10
url: https://dev.to/googleai/nano-banana-pro-prompting-guide-strategies-1h9n
tags:
---
Nano-Banana Pro 是一个“思考型”模型。它不仅仅是匹配关键词；它能够理解意图、物理规律和构图。

1. ==编辑，而不是重新生成。==
2. 使用自然语言和完整的句子。
3. 具体且描述性。
4. 提供上下文（Why & For Whom）

## 信息图最佳实践

- 主题：“关于[主题]的信息图”
- 数据背景：“使用关于[主题]的[年份]真实世界数据。”
- 视觉风格：“赛博朋克霓虹 / 等距 3D / 复古羊皮纸 / 简洁企业扁平风。”
- 布局：“使用路线图流程 / 树状图布局 / 剖面切割图。”
- 长宽比：移动/社交 9:16 竖屏，桌面 16:9 横屏
- 图形类型：路线图、剖面图、树状图、仪表盘

https://www.reddit.com/r/promptingmagic/comments/1p3mypm/how_to_visualize_anything_with_ai_a_masterclass/

## 信息图

```
"Generate a clean, modern infographic summarizing the key financial highlights from this earnings report. Include charts for 'Revenue Growth' and 'Net Income', and highlight the CEO's key quote in a stylized pull-quote box."
```

![[Pasted image 20260113151316.png]]

## 使用 Google 搜索进行信息查证

Nano-Banana Pro 利用 Google 搜索，根据实时数据、当前事件或事实核实生成图像，从而减少在时事话题上的幻觉。

```
"Visualize the current stock value of the main tech companies and the current trends. For each add some explanation on what happened recently which could explain that trend."
```

![[Pasted image 20260113151434.png]]

```
"Generate an infographic of the best times to visit the U.S. National Parks in 2025 based on current travel trends."

Generate an infographic of the best times to visit the China 5A Parks in 2026 based on current travel trends.
```

![[Pasted image 20260113152124.png]]

## 结构控制与布局指导

输入图片不仅限于角色参考或需要编辑的主题。你可以用它们来严格控制最终输出的构图和布局。对于需要将草图、线框图或特定网格布局转化为精美资源的设计师来说，这是一项颠覆性的功能。

- - 草图与手稿：上传手绘草图，精确定义文本和对象的位置。
- - 线框图：使用现有布局或线框图的截图，生成高保真度的 UI 模型。
- - 网格：使用网格图片，强制模型生成用于基于方块的游戏或 LED 显示屏的资源。

```
"Create a mock-up for a [product] following these guidelines."
```

![[Pasted image 20260113151659.png]]


## 参考

- https://www.reddit.com/r/promptingmagic/comments/1p3mypm/how_to_visualize_anything_with_ai_a_masterclass/
- 