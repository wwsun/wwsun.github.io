---
title: OpenSandbox 架构
source: https://open-sandbox.ai/architecture/
created: 2026-06-30
tags:
  - sandbox
  - ai-infrastructure
  - architecture
  - clippings
---

# OpenSandbox 架构

OpenSandbox 是一个面向 AI 应用的通用沙箱平台。它提供客户端 SDK 和工具、协议定义、生命周期控制平面、Docker 和 Kubernetes 运行时后端，以及用于命令执行、文件操作、代码解释器、浏览器自动化、桌面环境和训练工作负载的沙箱内执行组件。

本文档描述当前仓库架构以及公共契约、服务端实现、运行时提供者和沙箱数据平面组件之间的主要边界。

## 架构总览

![OpenSandbox 架构](/assets/architecture-overview.Cg2ApyhO.svg)

OpenSandbox 围绕六个实用层面组织：

1. **客户端层** - SDK、`osb` CLI 和 MCP 服务器，供应用、智能体和运维人员使用。
2. **协议层** - `specs/` 下的 OpenAPI 契约，涵盖生命周期、诊断、沙箱内执行和出口策略。
3. **生命周期控制平面** - `server/` 下的 FastAPI 服务器，负责认证请求、验证配置、持久化服务端管理的记录，并将生命周期工作委托给配置的运行时服务。
4. **运行时后端** - 用于本地和单机部署的 Docker，以及通过 BatchSandbox 和 `kubernetes-sigs/agent-sandbox` 等工作负载提供者的 Kubernetes。
5. **沙箱数据平面** - 用户工作负载容器，加上注入的 `execd` 守护进程、可选的 Jupyter/代码解释器运行时、卷以及可选的出口边车。
6. **网络和安全平面** - 端点解析、服务器代理、Kubernetes Ingress 网关路由、安全端点访问、出口策略执行、资源限制和安全容器运行时。

这种划分是有意为之：SDK 和工具应依赖公共契约，服务器应负责生命周期编排，运行时提供者应负责平台特定的资源创建，而 `execd`/出口组件应负责在沙箱网络和文件系统命名空间内发生的操作。

## 1. 客户端层

客户端层是面向开发者的 OpenSandbox 入口点。

### 1.1 Sandbox SDK

Sandbox SDK 将生命周期操作和沙箱内操作封装在语言原生的 API 之后：

- Python：`sdks/sandbox/python`
- JavaScript/TypeScript：`sdks/sandbox/javascript`
- Java/Kotlin：`sdks/sandbox/kotlin`
- C#/.NET：`sdks/sandbox/csharp`
- Go：`sdks/sandbox/go`

通用能力包括：

- 创建、列出、检查、暂停、恢复、续期和删除沙箱。
- 解析沙箱端口的服务端点。
- 执行命令，支持流式输出和后台状态/日志轮询。
- 管理文件和目录。
- 从 `execd` 读取资源指标。
- 在附加出口边车时检查或修改运行时出口策略。

生成的 OpenAPI 客户端与手写适配器共存。生成代码处理普通的请求/响应 API；手写层处理 SDK 易用性、流式传输、传输生命周期、错误映射和高级模型。

### 1.2 代码解释器 SDK

代码解释器 SDK 基于 Sandbox SDK 和 `execd` 代码执行 API 构建。它们管理代码执行上下文并暴露面向语言的代码执行辅助功能。

官方代码解释器镜像位于 `sandboxes/code-interpreter/` 下。它提供 Python、Java、Node.js 和 Go 运行时，以及 Python、Java、TypeScript/JavaScript、Go 和 Bash 的 Jupyter 内核。具体的语言版本由镜像控制，并通过 `PYTHON_VERSION`、`JAVA_VERSION`、`NODE_VERSION` 和 `GO_VERSION` 等环境变量选择。

### 1.3 CLI 和 MCP

`cli/` 下的 `osb` CLI 是日常沙箱操作的终端接口：

- `osb sandbox`：生命周期和端点管理
- `osb command`：命令执行、后台日志和 Shell 会话
- `osb file`：文件和目录操作
- `osb egress`：运行时出口策略检查和修改
- `osb devops`：底层诊断
- `osb skills`：OpenSandbox 专用的 Agent Skill 安装

`sdks/mcp/sandbox/python` 下的 MCP 服务器向支持 MCP 的客户端（如 Claude Code 和 Cursor）暴露聚焦的沙箱生命周期、命令和文本文件工具。

## 2. 协议层

OpenSandbox 将 `specs/` 视为公共契约的单一事实来源。

### 2.1 生命周期 API

`specs/sandbox-lifecycle.yml` 定义生命周期 API，由服务器以基础路径 `/v1` 提供服务。

主要资源组：

- **Sandboxes**：从镜像或快照创建、列表、获取、删除、暂停、恢复、续期过期时间以及解析端口端点。
- **Snapshots**：从沙箱创建持久快照、列出快照、获取快照状态和删除快照。

重要的请求特性：

- `image` 或 `snapshotId` 启动源。
- `entrypoint`、环境变量、元数据和透明的 `extensions`。
- `resourceLimits` 用于 CPU、内存、GPU 以及未来的资源键。
- `platform` 约束。
- `volumes` 用于主机路径、平台管理的命名卷/PVC 和 OSSFS。
- `networkPolicy` 用于出口边车配置。
- `secureAccess` 用于需要端点凭证的 Kubernetes Ingress 网关部署。

### 2.2 诊断 API

`specs/diagnostic-api.yml` 为沙箱日志和事件定义尽最大努力的诊断描述符。服务器还暴露实用的 DevOps 诊断路由，为运维和 AI 排障工作流返回纯文本。

### 2.3 Execd API

`specs/execd-api.yaml` 定义 `components/execd/` 暴露的沙箱内执行 API。

主要能力：

- 健康检查：`GET /ping`
- 代码上下文和执行：`/code/contexts`、`/code/context`、`/code`
- Bash 会话：`/session`
- 命令：`/command`、命令状态和后台命令日志
- 文件和目录：`/files/*`、`/directories`
- 指标：`/metrics`、`/metrics/watch`

命令和代码执行使用 Server-Sent Events 进行流式输出。当前 `execd` 实现还包括 `/pty` 下的交互式 PTY WebSocket 端点，用于长生命周期 Shell 会话。

### 2.4 Egress API

`specs/egress-api.yaml` 定义出口边车直接暴露的运行时策略 API：

- `GET /policy`
- `PATCH /policy`

通过解析出口边车端口的沙箱端点来访问该 API。当启用边车认证时，调用方必须包含生命周期端点解析 API 返回的端点头部。

## 3. 生命周期控制平面

`server/` 下的生命周期服务器是一个 FastAPI 应用。它负责请求验证、API 密钥认证、服务器配置、生命周期编排、端点格式化、诊断和服务端管理的持久化。

### 3.1 服务器结构

核心包：

- `opensandbox_server/main.py`：应用启动、中间件、路由注册、运行时验证和续期意图启动。
- `opensandbox_server/api/`：生命周期路由、代理路由、池路由、诊断路由以及请求/响应模式。
- `opensandbox_server/services/`：生命周期服务接口及 Docker/Kubernetes 实现。
- `opensandbox_server/services/k8s/`：Kubernetes 工作负载提供者、端点解析、卷/出口辅助、Informer 支持和提供者特定映射。
- `opensandbox_server/repositories/`：持久化适配器，当前用于服务端管理的快照记录。
- `opensandbox_server/integrations/renew_intent/`：可选的访问即自动续期集成。
- `opensandbox_server/middleware/`：API 密钥认证和请求 ID 中间件。

### 3.2 运行时服务选择

服务器从 `[runtime].type` 中选择恰好一个生命周期实现：

- `docker` → `DockerSandboxService`
- `kubernetes` → `KubernetesSandboxService`

两个实现都满足相同的 `SandboxService` 接口，因此 API 路由保持精简，将行为委托给服务。运行时特定的细节保持在服务边界之后。

### 3.3 服务器持久化

`[store]` 配置选择服务端管理的元数据存储。默认为 `~/.opensandbox/opensandbox.db` 的 SQLite。快照元数据是首个持久化的服务器资源；未来的持久记录应复用同一仓库边界。

### 3.4 服务器代理和端点解析

生命周期端点 API 返回沙箱内服务端口的可访问地址。根据运行时和配置，端点可能是：

- Docker 主机/网桥映射端点。
- Kubernetes Ingress 网关端点。
- 当 `use_server_proxy=true` 时，位于 `/sandboxes/{sandboxId}/proxy/{port}` 下的服务器代理 URL。

服务器代理支持 HTTP 和 WebSocket 流量，还与可选的访问即续期行为集成。

## 4. 运行时后端

### 4.1 Docker 运行时

Docker 运行时是本地和单机后端。它直接与 Docker 守护进程通信，管理容器、定时器、标签、卷、端口、可选边车和快照。

核心职责：

- 拉取公共或私有镜像，包括每次请求的仓库认证。
- 创建具有 CPU、内存、GPU、平台、能力、AppArmor、seccomp、PID 和安全运行时设置的容器。
- 将 `execd` 二进制从 `[runtime].execd_image` 放入沙箱，并在启动用户入口点之前安装引导启动器。
- 支持 `host`、`bridge` 和自定义用户定义网络的网络模式。
- 在非主机网络模式下为 `execd` 和用户服务端点分配主机端口。
- 在服务器重启后恢复现有托管容器的过期定时器。
- 支持主机绑定挂载、通过 `pvc` 卷模型的 Docker 命名卷以及 OSSFS 支持的挂载。
- 当请求了 `networkPolicy` 且 Docker 网络兼容时附加出口边车。
- 创建 Docker 支持的持久快照作为本地镜像，并从这些快照镜像恢复沙箱。

Docker 暂停/恢复使用容器级别的暂停/恢复。Docker 快照通过公共快照 API 暴露。

### 4.2 Kubernetes 运行时

Kubernetes 运行时将实际的工作负载创建委托给 `kubernetes.workload_provider` 选择的工作负载提供者。

支持的提供者：

- `batchsandbox` - 由 OpenSandbox 的 Kubernetes 控制器和 `BatchSandbox` CRD 支持的默认提供者。
- `agent-sandbox` - `kubernetes-sigs/agent-sandbox` 的提供者。

Kubernetes 服务器路径处理：

- Kubernetes 客户端初始化和可选的 Informer 支持的读取。
- 从镜像请求创建工作负载；当快照记录支持恢复时，`snapshotId` 启动解析为存储的可恢复镜像。
- BatchSandbox 和 agent-sandbox 清单的模板合并。
- 每次请求的镜像拉取密钥（在提供者支持时）。
- 资源限制和 GPU 转换为 Kubernetes 扩展资源。
- 平台约束和安全运行时的 RuntimeClass 集成。
- 卷、出口边车和安全端点访问注解。
- 通过直接工作负载数据或 Ingress 网关配置进行端点解析。
- 暂停/恢复委托给提供者。
- 来自 Kubernetes 资源的纯文本诊断。

### 4.3 BatchSandbox 控制器

`kubernetes/` 下的 Kubernetes 控制器实现 OpenSandbox 专用的 CRD，用于高吞吐量和池化沙箱交付：

- `BatchSandbox`：从 Pod 模板创建一个或多个沙箱副本。
- `Pool`：维护预热资源以实现快速分配。
- `SandboxSnapshot`：Kubernetes 暂停/恢复使用的内部 rootfs 快照记录。

BatchSandbox 同时支持基于模板的创建和通过 `extensions.poolRef` 的基于池的创建。它还支持批处理和强化学习风格工作负载的可选任务编排。

Kubernetes 暂停/恢复通过 `BatchSandbox.spec.replicas=1` 的 rootfs 快照实现：暂停将沙箱根文件系统提交为 OCI 镜像并释放运行时资源；恢复重写工作负载模板以使用快照镜像并重建运行时，同时保留沙箱 ID。

公共快照 API 当前有 Docker 支持的运行时实现。Kubernetes 暂停/恢复使用控制器的内部 `SandboxSnapshot` 流程；公共快照 API 的通用 Kubernetes 实现是单独的运行时关注点。

## 5. 沙箱数据平面

每个沙箱运行用户的镜像和入口点，并在其周围注入 OpenSandbox 控制进程。

### 5.1 Execd

`components/execd/` 是一个用 Gin 构建的 Go 守护进程。它在沙箱内运行并暴露执行 API。

职责：

- 通过 SSE 流式传输的 Shell 命令执行。
- 后台命令状态和增量日志检索。
- 持久的 Bash 会话。
- 通过 WebSocket 的交互式 PTY 会话。
- 文件和目录操作。
- Jupyter 支持的代码上下文和代码执行。
- 本地 CPU/内存指标和可选的 OpenTelemetry 指标导出。
- 通过 `X-EXECD-ACCESS-TOKEN` 的可选共享访问令牌执行。

在 Docker 中，服务器将 `execd` 放入容器并安装引导脚本。在 Kubernetes BatchSandbox 模板模式下，初始化容器将 `execd` 和 `bootstrap.sh` 从配置的 `execd_image` 复制到主沙箱容器挂载的 `emptyDir` 卷中。

### 5.2 代码解释器运行时

代码解释器沙箱镜像在沙箱内启动 Jupyter。`execd` 通过 HTTP/WebSocket 与 Jupyter 通信，并将 Jupyter 内核消息转换为 OpenSandbox 流事件。

代码解释器 SDK 是可选的更高级客户端。底层执行 API 仍然通过 Sandbox SDK 和直接的 `execd` 客户端可用。

### 5.3 卷

生命周期 API 暴露与运行时无关的卷模型：

- `host`：绑定允许的主机路径。
- `pvc`：平台管理的命名存储。Docker 将其映射为 Docker 命名卷；Kubernetes 将其映射为 PersistentVolumeClaim。
- `ossfs`：通过服务器/运行时集成挂载阿里云 OSS。

运行时提供者以不同方式验证和实现这些卷定义，但 API 形状保持共享。

### 5.4 出口边车

`components/egress/` 从沙箱网络命名空间执行出站网络策略。

能力：

- FQDN 和通配符域名的允许/拒绝规则。
- `dns` 模式用于 DNS 过滤。
- `dns+nft` 模式用于 DNS 加 nftables 对解析的 IP 和 CIDR/IP 规则进行执行（在支持时）。
- 通过 `/policy` 进行运行时策略检查和修改。
- 可选的边车认证。
- 可选的平台强制始终允许和始终拒绝覆盖。
- 实验性的透明 HTTPS MITM 模式。

Docker 将出口边车作为独立容器启动，并在边车网络命名空间中运行主沙箱容器。Kubernetes 将出口边车附加到 Pod 规格中，并从主沙箱容器中移除 `NET_ADMIN`，以便只有边车能修改网络规则。

## 6. 网络和访问

### 6.1 Ingress

`components/ingress/` 是一个面向 Kubernetes 的 HTTP/WebSocket 反向代理。它监听沙箱资源并将流量路由到沙箱端口。

支持的路由模式：

- 头部模式：`OpenSandbox-Ingress-To: <sandbox-id>-<port>` 或主机解析。
- URI 模式：`/<sandbox-id>/<port>/<path>`。
- 通过服务器端点格式化的通配符主机模式。

对于 `BatchSandbox`，Ingress 从 `sandbox.opensandbox.io/endpoints` 注解读取端点数据。对于 `agent-sandbox`，它读取 `status.serviceFQDN`。

### 6.2 安全访问

`secureAccess` 当前支持通过 Ingress 网关模式暴露的 Kubernetes 沙箱。启用时，服务器分配端点凭证并在端点响应中返回必要的请求头。当配置了网关安全访问签名密钥时，也支持签名路由令牌。

### 6.3 访问即自动续期

可选的续期意图集成在检测到访问时延长沙箱 TTL。它可以通过服务器代理请求或通过 Redis 传递的 Ingress 网关事件触发。按沙箱的参与由 `extensions["access.renew.extend.seconds"]` 创建参数控制。

## 7. 核心流程

### 7.1 沙箱创建

```text
客户端 / SDK / CLI / MCP
  -> POST /v1/sandboxes
  -> FastAPI 生命周期服务器验证请求和配置
  -> 选定的运行时服务创建 Docker 容器或 Kubernetes 工作负载
  -> 运行时部署 execd 和可选的 egress/volume/network 配置
  -> 沙箱达到 Running 状态或报告 Failed（附状态原因/消息）
```

从 API 角度来看，创建是异步的。客户端应轮询 `GET /v1/sandboxes/{sandboxId}` 或使用 SDK 的就绪辅助工具。

### 7.2 命令、文件和代码执行

```text
客户端
  -> 从沙箱元数据或服务器代理解析 execd 端点
  -> 在需要时携带 X-EXECD-ACCESS-TOKEN 调用 execd API
  -> execd 运行命令、文件操作、会话、PTY 或 Jupyter 代码执行
  -> execd 流式返回 SSE/WebSocket 输出或结构化响应
```

### 7.3 服务暴露

```text
客户端
  -> GET /v1/sandboxes/{sandboxId}/endpoints/{port}
  -> 服务器返回 Docker 映射、Ingress 网关或服务器代理端点
  -> 当安全访问或边车认证需要时，客户端包含返回的请求头
  -> HTTP/WebSocket 流量到达目标沙箱端口
```

### 7.4 出口策略

```text
创建请求携带 networkPolicy
  -> 服务器验证 [egress] 配置
  -> 运行时附加带初始策略的出口边车
  -> 沙箱出站 DNS/网络流量由边车过滤
  -> 客户端可解析出口端点并在运行时 PATCH /policy
```

### 7.5 暂停、恢复和快照

```text
暂停/恢复
  -> 生命周期服务器委托给运行时提供者
  -> Docker 暂停/恢复容器
  -> BatchSandbox 使用 rootfs 快照提交/重建（支持的单副本沙箱）

公共快照 API
  -> 服务器持久化快照元数据
  -> Docker 运行时将沙箱提交为可恢复镜像
  -> 从快照创建时解析该镜像并启动新沙箱
```

## 8. 设计原则

### 协议优先

公共行为从 `specs/` 中的 OpenAPI 契约开始。SDK 和客户端应对齐这些契约，生成的输出应从源规范重新生成，而不是将打补丁作为唯一修复方式。

### 控制平面 vs 数据平面

生命周期服务器应负责编排和验证。平台特定的配置属于运行时服务/提供者。沙箱内操作属于 `execd` 和出口边车。

### 运行时无关的 API，运行时特定的执行

生命周期 API 使用共享概念，如资源限制、卷、端点、网络策略和元数据。Docker 和 Kubernetes 可以在保持 API 契约的前提下以不同方式实现这些概念。

### 安全默认 + 显式逃生门

服务器支持 API 密钥认证、非认证模式的启动护栏、资源限制、能力裁剪、可选的安全运行时、出口控制、端点头部和平台特定的网络隔离。更宽松的模式仅用于本地开发或运维人员的显式选择。

### 可观测的失败

沙箱状态包含 `state`、`reason`、`message` 和转换时间。`execd` 暴露指标，服务器暴露诊断信息，Ingress/Egress/Execd 支持日志和 OpenTelemetry 指标（在实现的地方），请求 ID 会传播以便调试。

## 9. 常见用例

- **编程智能体**：在隔离沙箱中运行 Claude Code、Gemini CLI、Codex CLI、Qwen Code、Kimi CLI 或其他 Agent 工具。
- **AI 代码执行**：通过命令/文件/代码解释器 API 执行模型生成的代码，并获得流式反馈。
- **浏览器自动化**：在可控的文件系统和网络行为下运行 Chrome 或 Playwright。
- **远程开发**：通过沙箱端点暴露 VS Code Web、桌面、VNC 或开发服务器。
- **强化学习和评估工作负载**：使用 Kubernetes BatchSandbox、Pool 和任务编排实现高吞吐量沙箱交付。
- **企业隔离**：结合安全运行时、Ingress、Egress、端点访问头部和 Kubernetes 部署控制。

## 10. 参考

- [快速入门](/getting-started/)
- [Sandbox 生命周期规范](https://github.com/opensandbox-group/OpenSandbox/blob/main/specs/sandbox-lifecycle.yml)
- [诊断规范](https://github.com/opensandbox-group/OpenSandbox/blob/main/specs/diagnostic-api.yml)
- [Sandbox 执行规范](https://github.com/opensandbox-group/OpenSandbox/blob/main/specs/execd-api.yaml)
- [Egress 规范](https://github.com/opensandbox-group/OpenSandbox/blob/main/specs/egress-api.yaml)
- [Server](/components/server)
- [服务器配置](https://github.com/opensandbox-group/OpenSandbox/blob/main/server/configuration.md)
- [Execd](/components/execd)
- [Ingress](/components/ingress)
- [Egress](/components/egress)
- [Kubernetes](/kubernetes/)
- [暂停与恢复](/guides/pause-resume)
- [安全容器运行时指南](/guides/secure-container)
- [网络隔离](/architecture/network-isolation)
- [CLI](/cli/)
- [MCP 服务器](/sdks/mcp)
- [示例](/examples/)
