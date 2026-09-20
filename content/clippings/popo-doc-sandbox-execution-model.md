---
title: POPO Doc 集成：沙盒直连与主机代理的执行模型决策
description: 一段关于 POPO Doc 集成应直连沙盒还是走主机代理的技术决策讨论，最终结论是走主机代理——因为沙盒有硬性架构边界、容器出网受限、且代理反而代码更少。
tags:
  - clippings
  - sandbox
  - popo
  - architecture
source: 内部技术讨论（无 URL）
created: 2026-08-24
---

## POPO Doc 集成：沙盒直连与主机代理的执行模型决策

> **原文**：内部技术讨论 | 日期：2026-08-24

## 📝 摘要

这是一段关于 POPO Doc 集成方案的技术决策讨论。核心分歧点在于：POPO Doc 工具应该「在沙盒内直连」外部服务，还是「走主机代理」一层。作者最初倾向直连，并以 crea MCP 工具作为先例；但核实后发现自己此前的前提有误——crea 的直连模式仅限本地开发，生产环境实际上走主机代理。最终结论是选择主机代理，理由有三：一是沙盒有硬性架构边界（除 ANTHROPIC_* 外任何业务凭证不得进入容器），二是容器出网受限、能否触达 POPO 内网域名未经验证，三是代理反而代码更少（客户端逻辑仅存主机一份，无需在 sandbox/ 镜像复制、也无需对拍测试）。

## 📋 术语表

| 英文                    | 中文                | 说明                                                               |
| ----------------------- | ------------------- | ------------------------------------------------------------------ |
| sandbox execution model | 沙盒执行模型        | 工具在沙盒内直连外部服务，还是经由主机代理转发的两种模式           |
| host proxy              | 主机代理            | 沙盒工具通过薄封装转发请求到主机侧路由，由主机持有凭证完成外部调用 |
| egress                  | 出网/出站           | 容器向外部网络发起请求的能力                                       |
| 机房网（intranet）      | 内网                | 公司内部网络，`open-inner.popo.netease.com` 所在环境               |
| host-threaded           | 主机注入/主机透传   | 机密从主机环境按次注入容器，而非固化在容器内                       |
| 対拍 test               | 对拍测试            | 双实现并行运行、对比输出以检测漂移的一致性测试                     |
| mirrored client         | 镜像客户端          | 在沙盒内复制一份与主机侧保持同步的客户端逻辑                       |
| drift risk              | 漂移风险            | 双份实现因不同步而产生行为差异的风险                               |
| PMS_U                   | PMS_U（保留）       | 主机持有的业务机密，用于 query_material_library / mws_call         |
| ANTHROPIC_*             | ANTHROPIC_*（保留） | 唯一被允许进入沙盒容器的机密（Anthropic API 密钥）                 |

---

## 正文（双语对照）

Good — Q5, Q7, Q8, Q9 locked. And I read your Q6 note as being about the **sandbox execution model** (direct vs. proxy), not the write-tool input shape — so I'm taking the actual Q6 (inline `markdown` string input) as accepted, and treating "sandbox runs the tool directly, no proxy hop" as a new decision to work through. Say so if I misread.

好的 —— Q5、Q7、Q8、Q9 已锁定。而且我把你的 Q6 备注理解为是关于**沙盒执行模型**（直连 vs 代理），而不是写工具的输入形态——所以我把真正的 Q6（内联 `markdown` 字符串输入）当作已接受，并把「沙盒直接运行工具、不经过代理跳转」当作一项需要梳理的新决策。如果我理解错了，请指出。

---

Your instinct has real precedent: the **crea** MCP tool already calls its external service _directly from inside the sandbox_ (no host proxy) — unlike `query_material_library`/`mws_call`, which proxy only because they need the DB or the host-held `PMS_U`. POPO doc is analogous to crea: external HTTP, its own credentials, no DB. So "direct in sandbox" is a legitimate, existing pattern here.

你的直觉确实有先例：**crea** MCP 工具已经在*沙盒内直接*调用它的外部服务（不经主机代理）——不像 `query_material_library` / `mws_call`，它们走代理只是因为它俩需要数据库或主机持有的 `PMS_U`。POPO doc 与 crea 同理：外部 HTTP、自带凭证、不碰数据库。所以「沙盒内直连」在这里是一个正当的、既有的模式。

---

But it flips two things versus the proxy baseline, and one is an **unverified fact** I need to pin down. Let me check the crea precedent while I frame the decision.

但它相对代理基线会翻转两件事，其中一件是我需要钉死的**未经验证的事实**。我先去核实 crea 这个先例，同时把决策框架搭起来。

---

While that check runs, here's the shape of the decision your Q6 note opens up. "Direct in sandbox" flips two things vs. the proxy baseline:

在核实进行的同时，先看你那条 Q6 备注所引出的决策框架。「沙盒内直连」相对代理基线会翻转两件事：

---

**Axis 1 — where the client logic lives (a cost, known now).**

- **Proxy**: the POPO client logic lives _only_ host-side (`lib/popo-doc-client.ts`, one copy); the sandbox tool is a thin `fetch` to `/api/sandbox-proxy/popo-doc`. No duplication.
- **Direct**: because `sandbox/` is an isolated tsconfig `rootDir` and can't import `@/lib/*` (same reason `sandbox/repair-issues-json.ts` had to be mirrored), the client logic must be **duplicated into `sandbox/`** and kept in sync with a 対拍 test — exactly the drift risk CLAUDE.md's "Sandbox MCP 双实现维护约定" warns about. So "direct" removes a proxy endpoint but adds a mirrored client + alignment test.

**轴 1 —— 客户端逻辑放在哪（这是一个现在就能确定的成本）。**

- **代理**：POPO 客户端逻辑*只*存在于主机侧（`lib/popo-doc-client.ts`，仅一份）；沙盒工具只是一个打到 `/api/sandbox-proxy/popo-doc` 的薄 `fetch`。无重复。
- **直连**：因为 `sandbox/` 是一个隔离的 tsconfig `rootDir`，无法 import `@/lib/*`（这正是 `sandbox/repair-issues-json.ts` 当初必须被镜像的同一个原因），客户端逻辑就**必须被复制进 `sandbox/`**，并用对拍测试保持同步——这恰恰是 CLAUDE.md「Sandbox MCP 双实现维护约定」所警告的漂移风险。所以「直连」去掉了一个代理端点，却增加了一个镜像客户端 + 对齐测试。

---

**Axis 2 — the gating fact (unverified, being checked now).** Direct-in-sandbox only works if:

- the sandbox container has **outbound egress to POPO open API** — critically `open-inner.popo.netease.com` (机房网, reg/prod), which the in-flight plan §7 explicitly flagged as _not yet confirmed_; and
- POPO creds are reachable in-sandbox — ideally **threaded from host input** (like crea's token / `operatorEmail`), so the secret originates from host env per-run and isn't baked into the container.

**轴 2 —— 那个决定性事实（未经验证，正在核实）。** 沙盒内直连只有在以下条件成立时才可行：

- 沙盒容器具备**到 POPO 开放 API 的出站出网**能力——关键是 `open-inner.popo.netease.com`（机房网，reg/prod），这一点在在途方案的 §7 里被明确标注为*尚未确认*；以及
- POPO 凭证在沙盒内可达——理想情况下是**从主机输入透传**（类似 crea 的 token / `operatorEmail`），让机密每次运行都来自主机环境，而不是固化在容器里。

---

If egress to `open-inner.popo.netease.com` is blocked, **proxy is mandatory** regardless of preference — the host can definitely reach POPO, the sandbox may not.

如果到 `open-inner.popo.netease.com` 的出网被阻断，那么无论偏好如何**代理都是强制项**——主机一定能触达 POPO，沙盒未必。

---

I'm holding my recommendation until the crea/egress check lands, because it decides this. My leaning: if the check shows the sandbox reaches external services directly _and_ creds can be host-threaded → go **direct** (your call, matches the crea precedent, accept the mirrored-client + 対拍 test cost). If egress to the 机房网 host is uncertain → **proxy**, since a working tool beats a cleaner diagram. I'll firm this up the moment the fact arrives.

在 crea/出网核实结果出来之前，我先不下最终建议，因为它决定了结论。我的倾向：如果核实显示沙盒能直连外部服务*且*凭证能由主机透传 → 走**直连**（由你拍板，符合 crea 先例，接受镜像客户端 + 对拍测试的成本）。如果到机房网主机的出网不确定 → 走**代理**，因为一个能跑通的工具胜过一张更干净的架构图。事实一到手我立刻把结论敲定。

---

The check came back and it **corrects the premise** — including something I told you a turn ago, so let me own that directly.

核实结果回来了，它**纠正了前提**——包括我上一轮告诉你的某个东西，所以我直接认账。

---

## What I got wrong, and what the facts say

## 我错在哪，事实又是什么

---

I said crea is a precedent for running direct-in-sandbox. That's only half true: crea's **direct mode is gated to local dev** (`SANDBOX_DIRECT_MODE=1`, container on host VPN). In **production, crea goes through the host proxy** (`app/api/sandbox-proxy/crea/[...path]/route.ts`) — PMS_U never enters the container. So crea is actually a precedent for **proxy**, not direct.

我之前说 crea 是「沙盒内直连」的先例。这只对了一半：crea 的**直连模式仅限本地开发**（`SANDBOX_DIRECT_MODE=1`，容器跑在主机 VPN 上）。在**生产环境，crea 走的是主机代理**（`app/api/sandbox-proxy/crea/[...path]/route.ts`）——PMS_U 从不进入容器。所以 crea 实际上是**代理**的先例，而非直连。

---

The deciding facts:

决定性的几个事实：

---

1. **Hard architectural boundary.** `docs/impl/opensandbox-architecture.md:49-50`: "任何第三方 fetch 必须打到 …/api/sandbox-proxy/_，不持有任何业务凭证" and \**"唯一进容器的机密是 ANTHROPIC__"**. Putting POPO `appId`/`appSecret` into the container would violate this invariant — it's the one rule the sandbox design is built around.

1. **硬性架构边界。** `docs/impl/opensandbox-architecture.md:49-50`：「任何第三方 fetch 必须打到 …/api/sandbox-proxy/_，不持有任何业务凭证」，以及**「唯一进容器的机密是 ANTHROPIC__」**。把 POPO 的 `appId`/`appSecret` 放进容器会违反这条不变量——它正是沙盒设计所围绕的那条唯一规则。

---

2. **Container egress is restricted.** [adapters/sandbox-manager.ts:825](adapters/sandbox-manager.ts:825) literally injects `APP_ENV=prod` for the PRD flow _because_ "沙箱出网受限" — intranet reachable, public egress limited. Reachability of `open-inner.popo.netease.com` from the container is **unverified**, and nothing in the repo grants it.

3. **容器出网受限。** [adapters/sandbox-manager.ts:825](adapters/sandbox-manager.ts:825) 在 PRD 流程里字面上注入了 `APP_ENV=prod`，_正因为_「沙箱出网受限」——内网可达，公网出网受限。容器能否触达 `open-inner.popo.netease.com` **未经验证**，且仓库里没有任何东西授予它这个能力。

---

3. **Proxy is also _less_ code, not more.** I had this backwards last turn. With proxy: the client logic lives **host-only** (`lib/popo-doc-client.ts`, one copy), the sandbox tool is a thin `proxyFetch`, and there's **no** mirrored `sandbox/` client and **no** 対拍 drift test. "Direct" is what would have forced the duplication.

4. **代理反而是*更少*代码，而非更多。** 我上一轮把这点搞反了。走代理：客户端逻辑**只存主机侧**（`lib/popo-doc-client.ts`，一份），沙盒工具只是个薄 `proxyFetch`，**没有**镜像的 `sandbox/` 客户端，也**没有**对拍漂移测试。真正会逼出那份重复的是「直连」。

---

## Revised recommendation on your Q6

## 关于你 Q6 的修订建议

---

➡️ **Go with the host proxy after all** — but note this _serves_ your underlying goal ("don't carry dead weight") better than direct would: it keeps the POPO secret out of the less-trusted container (mandated), doesn't depend on unverified container egress, **and** avoids duplicating the client into `sandbox/`. The only thing it adds is one small host route `app/api/sandbox-proxy/popo-doc/route.ts` that mirrors the existing `dsl-image-asset` / `crea` routes — the host reaches POPO (host egress is unrestricted), the sandbox tool just forwards `x-chat-id` + `x-sandbox-proxy-token`.

➡️ **最终还是走主机代理**——但请注意，这比直连*更好地服务*了你的底层目标（「不要背着死重」）：它把 POPO 机密挡在信任度较低的容器之外（强制要求），不依赖未经验证的容器出网，**而且**避免了把客户端复制进 `sandbox/`。它唯一增加的是一个小小的主机路由 `app/api/sandbox-proxy/popo-doc/route.ts`，镜像现有的 `dsl-image-asset` / `crea` 路由——主机能触达 POPO（主机出网不受限），沙盒工具只需转发 `x-chat-id` + `x-sandbox-proxy-token`。

---

"Direct in sandbox" would only be viable as a **dev-only** mode (like crea's), which means implementing _both_ paths — more work for a marginal local convenience. I recommend against it.

「沙盒内直连」只能作为一种**仅开发**模式才可行（像 crea 那样），这意味着要同时实现*两条*路径——为了一点点本地便利而做更多工作。我不建议这么干。

---

So the honest answer to "不要代理一层" is: here the layer isn't overhead — it's the security boundary, and it's the cheaper option.

所以对「不要代理一层」这句，诚实的回答是：在这里，那一层不是额外开销——它是安全边界，而且它才是更便宜的那个选项。

---

**Your call.** If you accept proxy, the frontier is essentially empty and I'll write up the final landing manifest (files + registration points + verification/commit plan) for one last review. If you still want direct (dev-only) or want to challenge any of this, push back.

**由你拍板。** 如果你接受代理，那么待办基本清零，我会把最终的落地方案清单（文件 + 注册点 + 验证/提交计划）写出来，供最后一次评审。如果你仍想要直连（仅开发模式）或想对以上任何一点提出异议，尽管反驳。

---

> **译者注**：这是一段工程决策讨论的实录，而非正式文章。文中「対拍」（日语汉字写法，对应中文「对拍」）指将两份实现并行运行、对比输出以检测漂移的一致性测试。原文中混用了中英文（如「机房网」「不要代理一层」「沙箱出网受限」等），此处保留原样以忠实呈现讨论语境。
