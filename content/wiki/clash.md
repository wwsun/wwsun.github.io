---
title: Clash
tags:
  - vpn
draft: false
description: clash
source:
---
## 1. 工具选型：2026 年的“退役”与“新生”

建议告别已停止维护的 ClashX/Pro，转向现代内核：

* **首选：Clash Verge Rev** (基于 Mihomo 内核)
* **理由**：支持 Hysteria2、VLESS 等最新协议，其 **Merge (合并) 模式** 是处理自定义规则的神器，不会因订阅更新而覆盖你的本地配置。
* https://github.com/clash-verge-rev/clash-verge-rev



* **备选：Stash (Mac 版)**
* **理由**：UI 精美，极致的 macOS 原生体验，适合追求“装好即用、低能耗”的非折腾阶段。
* https://stash.ws/



---

## 2. 配置文件与目录管理

作为开发者，理解 `~/.config/clash`（或 Verge 对应的目录）是基础：

* **精简目录**：定期清理 `cache.db`。如果遇到节点延迟显示不准或 DNS 解析死循环，删掉它重启即可。
* **数据库更新**：确保 `Country.mmdb` (GeoIP 数据库) 保持最新，否则 `GEOIP,CN,DIRECT` 规则会失效，导致国内网站访问变慢。

---

## 3. 规则自定义：优先级与自动化

这是你之前最关心的问题。**核心原则：由特化到通用，自上而下。**

**最佳规则排序：**

1. **Local/Direct**：公司内网域名、本地测试域名（如 `*.local`, `localhost`）。
2. **Custom Proxy**：你手动添加的特定科研、开发站点。
3. **External RuleSets**：通过 `rule-providers` 引入的社区维护规则（如 Apple、Google、社交媒体分流）。
4. **GeoIP**：`GEOIP,CN,DIRECT`（中国 IP 直连）。
5. **Final/Match**：最后的兜底代理。

自定义规则参考： https://www.clashverge.dev/guide/rules.html


---

## 4. 增强模式 (TUN)：接管终端与开发环境

作为技术专家，你经常需要 `npm install` 或 `git push`，普通的系统代理往往无法接管这些流量。

* **开启 TUN 模式**：这是 ClashX Pro 的“增强模式”或 Verge 的“TUN Mode”。
* **优势**：它会创建一个虚拟网卡，强制接管所有不遵循 HTTP Proxy 设置的软件（如 Terminal、Docker、Spotify）。
* **DNS 优化**：务必开启 `fake-ip` 模式，并配置合理的 `nameserver`，以防止开发环境中出现 DNS 污染。

---

## 5. 性能优化清单

* **日志级别**：将 `log-level` 设为 `error`。频繁的 `info` 日志会产生大量磁盘 IO，增加 CPU 负担。
* **自动测速**：配置 `url-test` 策略组。
> **公式示例**：`interval: 600, tolerance: 50` (每10分钟测速一次，延迟差在 50ms 内不频繁切换，保证连接稳定性)。


* **UDP 转发**：如果需要打游戏或进行语音通话，确保配置中开启了 `udp: true`。

