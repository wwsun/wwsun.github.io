---
title: Deno vs Bun
date: 2026-02-06 14:38:41
tags:
draft: false
description: Deno vs Bun
source:
---
| **特性**       | **Deno**            | **Bun**                       |
| ------------ | ------------------- | ----------------------------- |
| **内核引擎**     | V8 (Google)         | JavaScriptCore (Apple/WebKit) |
| **开发语言**     | Rust                | Zig                           |
| **首要目标**     | 安全、稳定、标准合规          | 极致的速度、全能工具链                   |
| **包管理**      | 原生支持 URL 导入及 JSR    | 内置高性能包管理器（兼容 `node_modules`）  |
| **Node 兼容性** | 通过 `node:` 前缀实现高度兼容 | 目标是“无缝替换”，兼容性极强               |
| **单文件执行**    | 支持编译为单个可执行文件        | 支持编译为单个可执行文件                  |
