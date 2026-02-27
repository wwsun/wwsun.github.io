---
title: TAURI
tags:
draft: false
description: 创建跨平台应用
source: https://v2.tauri.app/
---
Tauri 是一个应用构建工具包，让你可以使用 Web 技术为所有主流桌面操作系统构建软件。核心库已使用 Rust 为你编写，而用户界面几乎可以使用任何前端框架编写。它包含一个可选的且支持摇树优化的 JavaScript API，用于便捷地访问底层系统；一个带有代码签名和产物核实的桌面二进制打包器；一个确保用户始终使用最新版本的安全更新程序；一个广泛的插件系统；以及对通知和应用托盘等操作系统级集成的支持。

Tauri 既易于使用，又方便扩展。对于 Rust 编程语言的新手，Tauri 提供了一个舒适的学习环境，伴随你一同成长。一旦你安装了 Rust，创建你的第一个应用只需运行 create-tauri-app 即可。但如果你更愿意留在 100% Rust 的安全与舒适区，你完全不需要使用 Node.js。

## 项目结构


```
.
├── package.json
├── index.html
├── src/
│   ├── main.js
├── src-tauri/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── icons/
│   │   ├── icon.png
│   │   ├── icon.icns
│   │   └── icon.ico
│   └── capabilities/
│       └── default.json
```

## TAO

一个跨平台的应用程序窗口创建库，支持所有主要平台，如 Windows、macOS、Linux、iOS 和 Android。用 Rust 编写，它是 winit 的一个分支，我们根据自己的需要进行了扩展—例如菜单栏和系统托盘。

## WRY

WRY 是一个跨平台的 WebView 渲染库，用 Rust 编写，支持所有主要桌面平台，如 Windows、macOS 和 Linux。Tauri 使用 WRY 作为抽象层，负责确定使用哪个 Webview（以及如何进行交互）。

