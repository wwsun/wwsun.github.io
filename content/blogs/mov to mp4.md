---
title: "在 macOS 上使用 ffmpeg 将 MOV 转换为 MP4"
date: 2026-02-02 18:30:15
tags:
  - macos
  - ffmpeg
  - video
  - conversion
draft: false
description: "使用 ffmpeg 命令行工具在 macOS 上将 MOV 视频文件转换为 MP4 格式的快速指南。"
source: https://ffmpeg.org/documentation.html
---

## 安装 `ffmpeg`

```bash
brew install ffmpeg
```

## mov to mp4

```bash
ffmpeg -i input.mov -vcodec h264 -acodec aac output.mp4
```

详细解释每个部分的含义如下：

---

### 1. `ffmpeg`

这是命令的核心部分，调用了 FFmpeg 这个强大的音视频处理工具。

---

### 2. `i input.mov`

- `i` 表示**输入文件**。
- `input.mov` 是你要转换的源视频文件名（可以是相对或绝对路径）。

---

### 3. `vcodec h264`

- `vcodec` 表示**视频编码器**（Video Codec），指定输出视频文件所采用的视频编码格式。
- `h264` 是一种常用且兼容性极好的视频编码格式，全称是 H.264，也叫 AVC。它被大多数设备和平台支持。

---

### 4. `acodec aac`

- `acodec` 表示**音频编码器**（Audio Codec），指定输出视频文件所采用的音频编码格式。
- `aac` 是一种主流的音频编码格式，全称是 Advanced Audio Coding，同样被大多数设备和平台支持。

---

### 5. `output.mp4`

- 这是**转换后生成的文件名**，指定输出文件的名称和格式（这里是 mp4）。

---

## 总结

这条命令的意思就是：

> 用 FFmpeg 把 input.mov 文件重新编码为 output.mp4，视频编码采用 H.264（h264），音频编码采用 AAC（aac）。

## 扩展说明

- **为什么要指定 `vcodec h264` 和 `acodec aac`？**
  - MOV 文件内部可能用的是其它编码格式（比如 ProRes、PCM 等），而 MP4 最广泛支持的就是 H.264 + AAC 组合，兼容性最好。
- **如果你的 MOV 已经是 H.264/AAC 了，也可以用 `c copy` 直接封装，不重新编码，更快更无损：** 但如果编码格式不兼容 MP4，还是需要重新编码。
  ```
  ffmpeg -i input.mov -c copy output.mp4
  ```
