---
title: "在 macOS 上将 SVG 转换为 PNG"
date: 2026-02-02 18:06:11
tags:
  - macos
  - svg
  - png
  - imagemagick
  - librsvg
draft: false
description: "如何在 macOS 上使用 ImageMagick 或 rsvg-convert 将 SVG 图像转换为 PNG。"
url: https://imagemagick.org/
---

## imagemagick

```bash
# 安装
brew install imagemagick

# 转换
convert -background none -density 300 input.svg output.png

# 指定尺寸
convert -background none -resize 1024x1024 input.svg output.png
```

## rsvg-convert

```bash
# 安装
brew install librsvg

# 转换
rsvg-convert -w 1024 -h 1024 input.svg -o output.png

# 只指定宽度，高度自动按比例
rsvg-convert -w 1024 input.svg -o output.png
```
