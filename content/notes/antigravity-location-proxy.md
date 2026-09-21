---
title: Antigravity 报 location 不可用：给单个应用配 Clash 代理
date: 2026-09-20
description: Google Antigravity 调 Google AI 接口被地区限制时，只让该进程走 Clash 代理的方案（不开 TUN / 系统代理）
tags:
  - faq
  - antigravity
  - clash
  - 代理
  - google-ai
source:
---

## 现象与根因

[[Google Antigravity]]（基于 VS Code 的 AI IDE）弹 API 错误，提示 location 不可用。原因是 Google AI 服务（`generativelanguage.googleapis.com` 等）按请求**出口 IP 所在地区**做可用性限制，本地直连是国内 IP 会被拒绝。

> [!warning] 香港节点也会被拒
> Google AI 对 HK 通常直接拒绝，代理节点要选美国、日本或新加坡等。

约束：不开 [[clash|Clash Verge]] 的 TUN 模式和系统代理，只让 Antigravity 这一个进程走代理（macOS 没有按应用设系统代理的能力）。

## 解决步骤

### 1. 确认 Clash 本地混合端口

[[clash|Clash Verge]] → 设置 → 端口设置 → 混合端口：Verge Rev 默认 `7897`，老版 Clash 默认 `7890`。代理地址即 `http://127.0.0.1:7897`（`127.0.0.1` 是本机回环地址，`7897` 是 Clash 在本机开的 HTTP/SOCKS 代理服务端口）。

### 2. 主方案：带环境变量启动 Antigravity

环境变量会传给它真正调 Google API 的 agent 后端进程，覆盖最彻底：

```bash
HTTP_PROXY=http://127.0.0.1:7897 \
HTTPS_PROXY=http://127.0.0.1:7897 \
/Applications/Antigravity.app/Contents/MacOS/Antigravity
```

如果频繁使用，可制作成 Automator 应用或配置 shell alias。

### 3. 辅助方案：settings.json 加 http.proxy

只覆盖编辑器内走 VS Code 网络栈的请求，后端 agent 进程不一定遵守，建议与主方案叠加：

- 打开方式：Antigravity 内 `Cmd+Shift+P` → `Open User Settings (JSON)`；或直接编辑 `~/Library/Application Support/Antigravity/User/settings.json`
- 加入 `"http.proxy": "http://127.0.0.1:7897"`，完全退出并重启生效

### 4. Clash 规则：避免 google 域名命中 DIRECT 或广告拦截

Clash Verge → 订阅页面 → 右键正在用的订阅 → 编辑规则 → 追加规则到前面（prepend）：

```yaml
rules:
  - DOMAIN-SUFFIX,googleapis.com,🚀 节点选择
  - DOMAIN-SUFFIX,google.com,🚀 节点选择
```

> [!tip] 代理组名要照抄
> 第三段换成订阅里真实的代理组名（去「代理」页面照抄，含 emoji 和空格）。这种方式不改订阅文件，订阅更新不会被覆盖。确保 Clash 处于规则模式。

### 5. 节点选择

避开香港，选择美国、日本、新加坡等（实测 JP 东京节点可用）。

## 验证

```bash
# 1. 本地代理端口通不通（应返回节点地区 IP）
curl -x http://127.0.0.1:7897 https://ipinfo.io

# 2. googleapis 可达性（返回 Google 404 页面属正常，根路径即 404）
curl -x http://127.0.0.1:7897 https://www.googleapis.com

# 3. 关键：Google AI 接口地区是否可用
curl -x http://127.0.0.1:7897 "https://generativelanguage.googleapis.com/v1beta/models" -w "\nHTTP %{http_code}\n"
# 403 PERMISSION_DENIED（要 API key）= 地区 OK，服务可达
# location is not supported / FAILED_PRECONDITION = 节点地区不行，换节点
```

最后检查规则是否命中：执行请求后在 Clash Verge「连接」页面搜索 `googleapis`，规则链应是 `DOMAIN-SUFFIX,googleapis.com → 代理组`（正常生效），若显示 DIRECT / REJECT 则表示规则未生效。

用环境变量命令启动 Antigravity 后发起 AI 对话，不再提示 location 错误即完成配置。
