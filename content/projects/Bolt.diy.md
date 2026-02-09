---
title: Bolt.diy
tags:
  - github
draft: true
description: bolt.diy 是一个完全在浏览器中运行的 AI 驱动全栈 Web 开发环境。它是 Bolt.new 的官方开源版本，其主要区别在于它允许用户为每个提示词选择自己的 LLM 提供商和模型。
source: https://github.com/stackblitz-labs/bolt.diy#
---


## 沙箱数据流转图

```mermaid
graph TD                                                                   
  User[用户/LLM] -->|指令| WorkbenchStore
  WorkbenchStore -->|分发| ActionRunner                                  
  ActionRunner -->|执行命令| WebContainer(Shell)
  ActionRunner -->|写入文件| WebContainer(FS)
  WebContainer(FS) -->|Watch事件| FilesStore
  FilesStore -->|更新| EditorUI[代码编辑器]                              
  WebContainer(Server) -->|HTTP| Preview[预览 Iframe]
```

