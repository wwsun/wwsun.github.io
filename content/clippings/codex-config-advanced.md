---
title: Codex 高级配置
description: OpenAI Codex CLI 高级配置选项中文翻译，涵盖模型提供者、审批策略、沙盒、OTel 遥测、指标等
tags:
  - clippings
  - codex
  - openai
  - config
  - cli
source: https://developers.openai.com/codex/config-advanced
---

## 概述

当你需要对提供者（provider）、策略（policy）和集成（integration）进行更精细控制时，使用以下选项。快速入门请参见[基础配置](https://developers.openai.com/codex/config-basic)。

关于项目指导、可复用能力、自定义斜杠命令、子代理工作流和集成的背景知识，请参见[自定义](https://developers.openai.com/codex/concepts/customization)。配置键参考请参见[配置参考](https://developers.openai.com/codex/config-reference)。

## 配置层与来源

### 配置文件（Profiles）

配置文件允许你保存命名配置层，并在 CLI 中切换使用。当你传入 `--profile profile-name` 时，Codex 加载 `~/.codex/config.toml`，然后叠加 `~/.codex/profile-name.config.toml`。文件名可包含字母、数字、连字符和下划线。

为每个配置文件创建单独的 TOML 文件。在配置文件中使用顶级配置键，不要将它们嵌套在 `[profiles.profile-name]` 下。

```toml
# ~/.codex/deep-review.config.toml
model = "gpt-5.5"
model_reasoning_effort = "xhigh"
approval_policy = "on-request"
model_catalog_json = "/Users/me/.codex/model-catalogs/deep-review.json"
```

```bash
codex --profile deep-review
codex exec --profile deep-review "review this change"
```

由于配置文件是位于基础用户配置之上、项目配置和 CLI 配置之下的层，因此只需包含与基础配置不同的值。配置文件也可以覆盖 `model_catalog_json`；当两个文件都设置了它时，Codex 使用配置文件中的值。

在 Codex 0.134.0 及之后版本中，`--profile` 不再从 `config.toml` 中读取 `[profiles.profile-name]`，且顶级 `profile = "profile-name"` 选择器也不再支持。请将旧版配置文件设置迁移到 `~/.codex/profile-name.config.toml`，然后从 `config.toml` 中移除对应的 `[profiles.profile-name]` 表和 `profile = "profile-name"` 选择器。

### 命令行覆盖（-c / --config）

除了编辑 `~/.codex/config.toml`，你还可以从命令行覆盖单次运行的配置：

- 当存在专用标志时优先使用它（例如 `--model`）。
- 使用 `-c` / `--config` 当需要覆盖任意键时。

示例：

```bash
# 专用标志
codex --model gpt-5.4

# 通用键/值覆盖（值是 TOML，而非 JSON）
codex --config model='"gpt-5.4"'
codex --config sandbox_workspace_write.network_access=true
codex --config 'shell_environment_policy.include_only=["PATH","HOME"]'
```

注意事项：

- 键可以使用点号表示法设置嵌套值（例如 `mcp_servers.context7.enabled=false`）。
- `--config` 的值按 TOML 解析。有疑问时请给值加引号，以免 shell 按空格拆分。
- 如果值无法解析为 TOML，Codex 将其视为字符串。

### CODEX_HOME 与本地状态

Codex 将其本地状态存储在 `CODEX_HOME` 下（默认为 `~/.codex`）。

常见文件：

- `config.toml`（本地配置）
- `auth.json`（如果使用基于文件的凭据存储）或你的操作系统密钥链
- `history.jsonl`（如果启用了历史记录持久化）
- 其他用户级状态，如日志和缓存

认证详情（包括凭据存储模式）请参见[认证](https://developers.openai.com/codex/auth)。完整配置键列表请参见[配置参考](https://developers.openai.com/codex/config-reference)。

关于共享默认值、规则和签入仓库或系统路径的技能，请参见[团队配置](https://developers.openai.com/codex/enterprise/admin-setup#team-config)。

## OpenAI 基础 URL

如果你只需要将内置的 OpenAI 提供者指向 LLM 代理、路由器或启用了数据驻留的项目，在 `config.toml` 中设置 `openai_base_url` 即可，无需定义新的提供者。这会更改内置 `openai` 提供者的基础 URL，无需单独的 `model_providers.<id>` 条目。

```toml
openai_base_url = "https://us.api.openai.com/v1"
```

## 项目层配置

除了用户配置外，Codex 还会从仓库内的 `.codex/config.toml` 文件中读取项目范围的覆盖。Codex 从项目根目录向当前工作目录遍历，加载找到的每个 `.codex/config.toml`。如果多个文件定义了同一个键，最接近工作目录的文件胜出。

出于安全考虑，Codex 仅在项目受信任时加载项目范围的配置文件。如果项目不受信任，Codex 忽略项目 `.codex/` 层，包括 `.codex/config.toml`、项目本地钩子和项目本地规则。用户层和系统层保持独立，仍然会被加载。

项目配置中的相对路径（例如 `model_instructions_file`）相对于包含 `config.toml` 的 `.codex/` 文件夹解析。

项目配置文件不能覆盖那些会重定向凭据、修改主机拥有的应用请求元数据、更改提供者认证、选择配置文件或运行机器本地通知/遥测命令的设置。Codex 会在项目本地 `.codex/config.toml` 中忽略以下键，并在启动时打印警告：`openai_base_url`、`chatgpt_base_url`、`apps_mcp_product_sku`、`model_provider`、`model_providers`、`notify`、`profile`、`profiles`、`experimental_realtime_ws_base_url` 和 `otel`。请在用户级 `~/.codex/config.toml` 中设置提供者、通知和遥测键；使用 `--profile profile-name` 和 `~/.codex/profile-name.config.toml` 选择配置文件。

## 生命周期钩子（Hooks）

Codex 也可以从 `hooks.json` 文件或活动配置层旁边的 `config.toml` 中的内联 `[hooks]` 表加载生命周期钩子。

实践中，四个最有用的位置是：

- `~/.codex/hooks.json`
- `~/.codex/config.toml`
- `<repo>/.codex/hooks.json`
- `<repo>/.codex/config.toml`

项目本地钩子仅在项目 `.codex/` 层受信任时加载。用户级钩子独立于项目信任。

内联 TOML 钩子使用与 `hooks.json` 相同的事件结构：

```toml
[[hooks.PreToolUse]]
matcher = "^Bash$"

[[hooks.PreToolUse.hooks]]
type = "command"
command = '/usr/bin/python3 "$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use_policy.py"'
timeout = 30
statusMessage = "Checking Bash command"
```

如果单个层同时包含 `hooks.json` 和内联 `[hooks]`，Codex 会同时加载两者并发出警告。建议每层只使用一种表示形式。

当前事件列表、输入字段、输出行为和限制请参见[钩子](https://developers.openai.com/codex/hooks)。

## 子代理（Subagents）

关于子代理角色配置（`config.toml` 中的 `[agents]`），请参见[子代理](https://developers.openai.com/codex/subagents)。

## 项目根目录发现

Codex 通过从工作目录向上遍历来发现项目配置（例如 `.codex/` 层和 `AGENTS.md`），直到到达项目根目录。

默认情况下，Codex 将包含 `.git` 的目录视为项目根目录。要自定义此行为，在 `config.toml` 中设置 `project_root_markers`：

```toml
# 当目录包含其中任一标记时，将其视为项目根目录。
project_root_markers = [".git", ".hg", ".sl"]
```

设置 `project_root_markers = []` 可跳过搜索父目录，将当前工作目录视为项目根目录。

## 模型提供者（Model Providers）

模型提供者定义了 Codex 如何连接模型（基础 URL、协议、认证和可选的 HTTP 头）。自定义提供者不能重用内置保留的提供者 ID：`openai`、`ollama` 和 `lmstudio`。

定义额外的提供者并将 `model_provider` 指向它们：

```toml
model = "gpt-5.4"
model_provider = "proxy"

[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "http://proxy.example.com"
env_key = "OPENAI_API_KEY"

[model_providers.local_ollama]
name = "Ollama"
base_url = "http://localhost:11434/v1"

[model_providers.mistral]
name = "Mistral"
base_url = "https://api.mistral.ai/v1"
env_key = "MISTRAL_API_KEY"
```

需要时添加请求头：

```toml
[model_providers.example]
http_headers = { "X-Example-Header" = "example-value" }
env_http_headers = { "X-Example-Features" = "EXAMPLE_FEATURES" }
```

### 基于命令的认证

当提供者需要 Codex 从外部凭据助手获取 bearer token 时使用：

```toml
[model_providers.proxy]
name = "OpenAI using LLM proxy"
base_url = "https://proxy.example.com/v1"
wire_api = "responses"

[model_providers.proxy.auth]
command = "/usr/local/bin/fetch-codex-token"
args = ["--audience", "codex"]
timeout_ms = 5000
refresh_interval_ms = 300000
```

认证命令不接收 stdin，必须将 token 打印到 stdout。Codex 会修剪首尾空白字符，将空 token 视为错误，并在 `refresh_interval_ms` 处主动刷新；设置 `refresh_interval_ms = 0` 仅在认证重试后刷新。不要将 `[model_providers.<id>.auth]` 与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 组合使用。

### Amazon Bedrock 提供者

Codex 包含内置的 `amazon-bedrock` 模型提供者。直接将其设置为 `model_provider`；与自定义提供者不同，此内置提供者仅支持嵌套的 AWS 配置文件和区域覆盖。

```toml
model_provider = "amazon-bedrock"
model = "<bedrock-model-id>"

[model_providers.amazon-bedrock.aws]
profile = "default"
region = "eu-central-1"
```

如果省略 `profile`，Codex 使用标准 AWS 凭据链。设置 `region` 为应处理请求的受支持 Bedrock 区域。

完整设置流程、认证选项、支持的模型和功能可用性，请参见[在 Amazon Bedrock 上使用 Codex](https://developers.openai.com/codex/amazon-bedrock)。

### 本地开源提供者（--oss）

Codex 可以针对本地"开源"提供者运行（例如 Ollama 或 LM Studio），传入 `--oss` 即可。如果传入 `--oss` 但未指定提供者，Codex 使用 `oss_provider` 作为默认值。

```toml
# --oss 使用的默认本地提供者
oss_provider = "ollama" # 或 "lmstudio"
```

### Azure 示例

```toml
[model_providers.azure]
name = "Azure"
base_url = "https://YOUR_PROJECT_NAME.openai.azure.com/openai"
env_key = "AZURE_OPENAI_API_KEY"
query_params = { api-version = "2025-04-01-preview" }
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000
```

要更改内置 OpenAI 提供者的基础 URL，请使用 `openai_base_url`；不要创建 `[model_providers.openai]`，因为无法覆盖内置提供者 ID。

### 数据驻留（Data Residency）

启用了[数据驻留](https://help.openai.com/en/articles/9903489-data-residency-and-inference-residency-for-chatgpt)的项目可以创建模型提供者，使用[正确前缀](https://platform.openai.com/docs/guides/your-data#which-models-and-features-are-eligible-for-data-residency)更新 base_url。

```toml
model_provider = "openaidr"
[model_providers.openaidr]
name = "OpenAI Data Residency"
base_url = "https://us.api.openai.com/v1" # 将 'us' 替换为域名前缀
```

## 模型行为覆盖

```toml
model_reasoning_summary = "none"          # 禁用摘要
model_verbosity = "low"                   # 缩短响应
model_supports_reasoning_summaries = true # 强制推理
model_context_window = 128000             # 上下文窗口大小
```

`model_verbosity` 仅适用于使用 Responses API 的提供者。Chat Completions 提供者会忽略此设置。

## 审批与沙盒

### 审批策略与沙盒模式

选择审批严格度（影响 Codex 何时暂停）和沙盒级别（影响文件/网络访问）。

在编辑 `config.toml` 时的操作注意事项，请参见[常见沙盒与审批组合](https://developers.openai.com/codex/agent-approvals-security#common-sandbox-and-approval-combinations)、[可写根目录中的受保护路径](https://developers.openai.com/codex/agent-approvals-security#protected-paths-in-writable-roots)和[网络访问](https://developers.openai.com/codex/agent-approvals-security#network-access)。

关于统一配置文件系统和网络访问的 beta 权限配置文件，请参见[权限](https://developers.openai.com/codex/permissions)。

你还可以使用细粒度审批策略（`approval_policy = { granular = { ... } }`）来允许或自动拒绝各个提示类别。当你想在某些情况下保留正常的交互式审批，但希望其他情况（如 `request_permissions` 或技能脚本提示）自动拒绝时，这很有用。

设置 `approvals_reviewer = "auto_review"` 可将符合条件的交互式审批请求路由到自动审核。这会更改审核者，而非沙盒边界。

使用 `[auto_review].policy` 设置本地审核者策略指令。托管的 `guardian_policy_config` 优先级更高。

```toml
approval_policy = "untrusted"   # 其他选项: on-request, never, 或 { granular = { ... } }
approvals_reviewer = "user"     # 或 "auto_review" 进行自动审核
sandbox_mode = "workspace-write"
allow_login_shell = false       # 可选加固：禁止 shell 工具的登录 shell

# 细粒度审批策略示例：
# approval_policy = { granular = {
#   sandbox_approval = true,
#   rules = true,
#   mcp_elicitations = true,
#   request_permissions = false,
#   skill_approval = false
# } }

[sandbox_workspace_write]
exclude_tmpdir_env_var = false  # 允许 $TMPDIR
exclude_slash_tmp = false       # 允许 /tmp
writable_roots = ["/Users/YOU/.pyenv/shims"]
network_access = false          # 启用出站网络

[auto_review]
policy = """
Use your organization's automatic review policy.
"""
```

### 命名权限配置文件

关于内置配置文件、自定义配置文件语法以及完整的文件系统和网络配置模型，请参见[权限](https://developers.openai.com/codex/permissions)。

### 全权限模式

完全禁用沙盒（仅在环境已隔离进程时使用）：

```toml
sandbox_mode = "danger-full-access"
```

> [!warning] 危险
> `danger-full-access` 模式下 Codex 拥有完整系统访问权限，仅在信任的环境中使用。

### .git/ 和 .codex/ 只读

在 workspace-write 模式下，某些环境保持 `.git/` 和 `.codex/` 只读，即使其余工作区可写。这就是为什么 `git commit` 等命令可能仍需审批才能在沙盒外运行。如果你希望 Codex 跳过特定命令（例如在沙盒外阻止 `git commit`），请使用[规则](https://developers.openai.com/codex/rules)。

## Shell 环境策略

`shell_environment_policy` 控制 Codex 向启动的任何子进程（例如运行模型提议的工具命令时）传递哪些环境变量。从干净启动（`inherit = "none"`）或精简集合（`inherit = "core"`）开始，然后叠加排除、包含和覆盖，避免泄露密钥，同时仍提供任务所需的路径、密钥或标志。

```toml
[shell_environment_policy]
inherit = "none"
set = { PATH = "/usr/bin", MY_FLAG = "1" }
ignore_default_excludes = false
exclude = ["AWS_*", "AZURE_*"]
include_only = ["PATH", "HOME"]
```

模式是大小写不敏感的 glob（`*`、`?`、`[A-Z]`）；`ignore_default_excludes = false` 会在你的 include/exclude 运行之前保留自动的 KEY/SECRET/TOKEN 过滤器。

## MCP 配置

配置详情请参见专门的 [MCP 文档](https://developers.openai.com/codex/mcp)。

## OpenTelemetry（OTel）

启用 OpenTelemetry 日志导出以跟踪 Codex 运行（API 请求、SSE 事件、提示、工具审批/结果）。默认禁用；通过 `[otel]` 启用：

```toml
[otel]
environment = "staging"   # 默认为 "dev"
exporter = "none"         # 设置为 otlp-http 或 otlp-grpc 以发送事件
log_user_prompt = false   # 除非显式启用，否则脱敏用户提示
```

选择导出器：

```toml
# HTTP 导出器
[otel]
exporter = { otlp-http = {
  endpoint = "https://otel.example.com/v1/logs",
  protocol = "binary",
  headers = { "x-otlp-api-key" = "${OTLP_TOKEN}" }
}}

# gRPC 导出器
[otel]
exporter = { otlp-grpc = {
  endpoint = "https://otel.example.com:4317",
  headers = { "x-otlp-meta" = "abc123" }
}}
```

如果 `exporter = "none"`，Codex 记录事件但不发送任何内容。导出器异步批量处理并在关闭时刷新。事件元数据包括服务名称、CLI 版本、环境标签、对话 ID、模型、沙盒/审批设置以及每个事件的字段（参见[配置参考](https://developers.openai.com/codex/config-reference)）。

### 发出的事件类型

Codex 为运行和工具使用发出结构化日志事件。代表性事件类型包括：

- `codex.conversation_starts`（模型、推理设置、沙盒/审批策略）
- `codex.api_request`（尝试次数、状态/成功、持续时间和错误详情）
- `codex.sse_event`（流事件类型、成功/失败、持续时间，以及 `response.completed` 上的 token 计数）
- `codex.websocket_request` 和 `codex.websocket_event`（请求持续时间及每条消息的类型/成功/错误）
- `codex.user_prompt`（长度；除非显式启用，否则内容脱敏）
- `codex.tool_decision`（批准/拒绝以及决策来自配置还是用户）
- `codex.tool_result`（持续时间、成功、输出片段）

### OTel 指标

启用 OTel 指标管道后，Codex 发出 API、流和工具活动的计数器和持续时间直方图。

以下每个指标还包含默认元数据标签：`auth_mode`、`originator`、`session_source`、`model` 和 `app.version`。

| 指标                                  | 类型      | 字段                | 描述                                            |
| ------------------------------------- | --------- | ------------------- | ----------------------------------------------- |
| `codex.api_request`                   | counter   | `status`, `success` | 按 HTTP 状态和成功/失败统计的 API 请求计数      |
| `codex.api_request.duration_ms`       | histogram | `status`, `success` | API 请求持续时间（毫秒）                        |
| `codex.sse_event`                     | counter   | `kind`, `success`   | 按事件类型和成功/失败统计的 SSE 事件计数        |
| `codex.sse_event.duration_ms`         | histogram | `kind`, `success`   | SSE 事件处理持续时间（毫秒）                    |
| `codex.websocket.request`             | counter   | `success`           | 按成功/失败统计的 WebSocket 请求计数            |
| `codex.websocket.request.duration_ms` | histogram | `success`           | WebSocket 请求持续时间（毫秒）                  |
| `codex.websocket.event`               | counter   | `kind`, `success`   | 按类型和成功/失败统计的 WebSocket 消息/事件计数 |
| `codex.websocket.event.duration_ms`   | histogram | `kind`, `success`   | WebSocket 消息/事件处理持续时间（毫秒）         |
| `codex.tool.call`                     | counter   | `tool`, `success`   | 按工具名称和成功/失败统计的工具调用计数         |
| `codex.tool.call.duration_ms`         | histogram | `tool`, `success`   | 按工具名称和结果统计的工具执行持续时间（毫秒）  |

关于遥测的安全和隐私指导，请参见[安全](https://developers.openai.com/codex/agent-approvals-security#monitoring-and-telemetry)。

## 指标（Metrics）

默认情况下，Codex 会定期向 OpenAI 发送少量匿名使用和健康数据。这有助于检测 Codex 是否运行异常，以及了解正在使用哪些功能和配置选项，以便 Codex 团队专注于最重要的事项。这些指标不包含任何个人身份信息（PII）。指标收集独立于 OTel 日志/链路导出。

如果要在整台机器上完全禁用指标收集，在配置中设置分析标志：

```toml
[analytics]
enabled = false
```

### 默认上下文字段

适用于每个事件/指标：

- `auth_mode`：`swic` | `api` | `unknown`。
- `model`：使用的模型名称。
- `app.version`：Codex 版本。

### 指标目录

以下指标名称省略了 `codex.` 前缀。大多数指标名称集中在 `codex-rs/otel/src/metrics/names.rs` 中；在该文件外发出的功能特定指标也包含在此处。如果指标包含 `tool` 字段，它反映的是内部使用的工具（例如 `apply_patch` 或 `shell`），不包含实际 shell 命令或补丁内容。

#### 运行时和模型传输

| 指标                                            | 类型      | 字段                 | 描述                                            |
| ----------------------------------------------- | --------- | -------------------- | ----------------------------------------------- |
| `api_request`                                   | counter   | `status`, `success`  | 按 HTTP 状态和成功/失败统计的 API 请求计数      |
| `api_request.duration_ms`                       | histogram | `status`, `success`  | API 请求持续时间（毫秒）                        |
| `sse_event`                                     | counter   | `kind`, `success`    | 按事件类型和成功/失败统计的 SSE 事件计数        |
| `sse_event.duration_ms`                         | histogram | `kind`, `success`    | SSE 事件处理持续时间（毫秒）                    |
| `websocket.request`                             | counter   | `success`            | 按成功/失败统计的 WebSocket 请求计数            |
| `websocket.request.duration_ms`                 | histogram | `success`            | WebSocket 请求持续时间（毫秒）                  |
| `websocket.event`                               | counter   | `kind`, `success`    | 按类型和成功/失败统计的 WebSocket 消息/事件计数 |
| `websocket.event.duration_ms`                   | histogram | `kind`, `success`    | WebSocket 消息/事件处理持续时间（毫秒）         |
| `responses_api_overhead.duration_ms`            | histogram |                      | WebSocket 响应的 Responses API 开销计时         |
| `responses_api_inference_time.duration_ms`      | histogram |                      | WebSocket 响应的 Responses API 推理计时         |
| `responses_api_engine_iapi_ttft.duration_ms`    | histogram |                      | Responses API 引擎 IAPI 首 token 时间           |
| `responses_api_engine_service_ttft.duration_ms` | histogram |                      | Responses API 引擎服务首 token 时间             |
| `responses_api_engine_iapi_tbt.duration_ms`     | histogram |                      | Responses API 引擎 IAPI token 间隔时间          |
| `responses_api_engine_service_tbt.duration_ms`  | histogram |                      | Responses API 引擎服务 token 间隔时间           |
| `transport.fallback_to_http`                    | counter   | `from_wire_api`      | WebSocket 到 HTTP 回退计数                      |
| `remote_models.fetch_update.duration_ms`        | histogram |                      | 获取远程模型定义的时间                          |
| `remote_models.load_cache.duration_ms`          | histogram |                      | 加载远程模型缓存的时间                          |
| `startup_prewarm.duration_ms`                   | histogram | `status`             | 启动预热持续时间（按结果）                      |
| `startup_prewarm.age_at_first_turn_ms`          | histogram | `status`             | 启动预热在第一个真实回合解决时的存活时间        |
| `cloud_requirements.fetch.duration_ms`          | histogram |                      | 工作区管理的云端需求获取持续时间                |
| `cloud_requirements.fetch_attempt`              | counter   | 见注释               | 工作区管理的云端需求获取尝试                    |
| `cloud_requirements.fetch_final`                | counter   | 见注释               | 工作区管理的云端需求最终获取结果                |
| `cloud_requirements.load`                       | counter   | `trigger`, `outcome` | 工作区管理的云端需求加载结果                    |

#### 回合和工具活动

| 指标                                   | 类型      | 字段                                                                      | 描述                                        |
| -------------------------------------- | --------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| `turn.e2e_duration_ms`                 | histogram |                                                                           | 完整回合的端到端时间                        |
| `turn.ttft.duration_ms`                | histogram |                                                                           | 回合首 token 时间                           |
| `turn.ttfm.duration_ms`                | histogram |                                                                           | 回合首个模型输出项时间                      |
| `turn.network_proxy`                   | counter   | `active`, `tmp_mem_enabled`                                               | 托管网络代理在回合中是否活跃                |
| `turn.memory`                          | counter   | `read_allowed`, `feature_enabled`, `config_use_memories`, `has_citations` | 每回合记忆读取可用性和记忆引用使用          |
| `turn.tool.call`                       | histogram | `tmp_mem_enabled`                                                         | 回合中的工具调用次数                        |
| `turn.token_usage`                     | histogram | `token_type`, `tmp_mem_enabled`                                           | 每回合按 token 类型统计的 token 使用量      |
| `tool.call`                            | counter   | `tool`, `success`                                                         | 按工具名称和成功/失败统计的工具调用计数     |
| `tool.call.duration_ms`                | histogram | `tool`, `success`                                                         | 按工具名称和结果统计的工具执行持续时间      |
| `tool.unified_exec`                    | counter   | `tty`                                                                     | 按 TTY 模式统计的统一 exec 工具调用         |
| `approval.requested`                   | counter   | `tool`, `approved`                                                        | 工具审批请求结果                            |
| `mcp.call`                             | counter   | 见注释                                                                    | MCP 工具调用结果                            |
| `mcp.call.duration_ms`                 | histogram | 见注释                                                                    | MCP 工具调用持续时间                        |
| `mcp.tools.list.duration_ms`           | histogram | `cache`                                                                   | MCP 工具列表持续时间，含缓存命中/未命中状态 |
| `mcp.tools.fetch_uncached.duration_ms` | histogram |                                                                           | 未命中缓存的 MCP 工具获取持续时间           |
| `mcp.tools.cache_write.duration_ms`    | histogram |                                                                           | Codex Apps MCP 工具缓存写入持续时间         |
| `hooks.run`                            | counter   | `hook_name`, `source`, `status`                                           | 按钩子名称、来源和状态统计的钩子运行计数    |
| `hooks.run.duration_ms`                | histogram | `hook_name`, `source`, `status`                                           | 钩子运行持续时间（毫秒）                    |

#### 线程、任务和功能

| 指标                              | 类型      | 字段                  | 描述                                        |
| --------------------------------- | --------- | --------------------- | ------------------------------------------- |
| `feature.state`                   | counter   | `feature`, `value`    | 与默认值不同的功能值                        |
| `status_line`                     | counter   |                       | 会话以配置的状态行启动                      |
| `model_warning`                   | counter   |                       | 发送给模型的警告                            |
| `thread.started`                  | counter   | `is_git`              | 新线程创建，标记工作目录是否在 Git 仓库中   |
| `conversation.turn.count`         | counter   |                       | 每个线程的用户/助手回合数，在线程结束时记录 |
| `thread.fork`                     | counter   | `source`              | 通过复刻现有线程创建新线程                  |
| `thread.rename`                   | counter   |                       | 线程重命名                                  |
| `thread.side`                     | counter   | `source`              | 创建侧面对话                                |
| `thread.skills.enabled_total`     | histogram |                       | 为新线程启用的技能数量                      |
| `thread.skills.kept_total`        | histogram |                       | 提示渲染后保留的已启用技能数量              |
| `thread.skills.truncated`         | histogram |                       | 技能渲染是否截断了已启用技能列表            |
| `task.compact`                    | counter   | `type`                | 每次压缩类型计数                            |
| `task.review`                     | counter   |                       | 触发的审查次数                              |
| `task.undo`                       | counter   |                       | 触发的撤销操作次数                          |
| `task.user_shell`                 | counter   |                       | 用户 shell 操作次数                         |
| `shell_snapshot`                  | counter   | 见注释                | shell 快照是否成功                          |
| `shell_snapshot.duration_ms`      | histogram | `success`             | shell 快照耗时                              |
| `skill.injected`                  | counter   | `status`, `skill`     | 按技能统计的技能注入结果                    |
| `plugins.startup_sync`            | counter   | `transport`, `status` | 精选插件启动同步尝试                        |
| `plugins.startup_sync.final`      | counter   | `transport`, `status` | 精选插件最终启动同步结果                    |
| `multi_agent.spawn`               | counter   | `role`                | 按角色统计的代理生成                        |
| `multi_agent.resume`              | counter   |                       | 代理恢复                                    |
| `multi_agent.nickname_pool_reset` | counter   |                       | 代理昵称池重置                              |

#### 记忆和本地状态

| 指标                           | 类型      | 字段                      | 描述                                  |
| ------------------------------ | --------- | ------------------------- | ------------------------------------- |
| `memory.phase1`                | counter   | `status`                  | 记忆阶段 1 作业计数                   |
| `memory.phase1.e2e_ms`         | histogram |                           | 记忆阶段 1 端到端持续时间             |
| `memory.phase1.output`         | counter   |                           | 记忆阶段 1 输出写入                   |
| `memory.phase1.token_usage`    | histogram | `token_type`              | 记忆阶段 1 token 使用量               |
| `memory.phase2`                | counter   | `status`                  | 记忆阶段 2 作业计数                   |
| `memory.phase2.e2e_ms`         | histogram |                           | 记忆阶段 2 端到端持续时间             |
| `memory.phase2.input`          | counter   |                           | 记忆阶段 2 输入计数                   |
| `memory.phase2.token_usage`    | histogram | `token_type`              | 记忆阶段 2 token 使用量               |
| `memories.usage`               | counter   | `kind`, `tool`, `success` | 按类型、工具和成功/失败统计的记忆使用 |
| `external_agent_config.detect` | counter   | 见注释                    | 按迁移项类型统计的外部代理配置检测    |
| `external_agent_config.import` | counter   | 见注释                    | 按迁移项类型统计的外部代理配置导入    |
| `db.backfill`                  | counter   | `status`                  | 初始状态数据库回填结果                |
| `db.backfill.duration_ms`      | histogram | `status`                  | 初始状态数据库回填持续时间            |
| `db.error`                     | counter   | `stage`                   | 状态数据库操作错误                    |

#### Windows 沙盒

| 指标                                             | 类型      | 字段                                      | 描述                                |
| ------------------------------------------------ | --------- | ----------------------------------------- | ----------------------------------- |
| `windows_sandbox.setup_success`                  | counter   | `originator`, `mode`                      | Windows 沙盒设置成功                |
| `windows_sandbox.setup_failure`                  | counter   | `originator`, `mode`                      | Windows 沙盒设置失败                |
| `windows_sandbox.setup_duration_ms`              | histogram | `result`, `originator`, `mode`            | Windows 沙盒设置持续时间            |
| `windows_sandbox.elevated_setup_success`         | counter   |                                           | 提权 Windows 沙盒设置成功           |
| `windows_sandbox.elevated_setup_failure`         | counter   | 见注释                                    | 提权 Windows 沙盒设置失败           |
| `windows_sandbox.elevated_setup_canceled`        | counter   | 见注释                                    | 取消的提权 Windows 沙盒设置         |
| `windows_sandbox.elevated_setup_duration_ms`     | histogram | `result`                                  | 提权 Windows 沙盒设置持续时间       |
| `windows_sandbox.elevated_prompt_shown`          | counter   |                                           | 提权沙盒设置提示显示                |
| `windows_sandbox.elevated_prompt_accept`         | counter   |                                           | 提权沙盒设置提示接受                |
| `windows_sandbox.elevated_prompt_use_legacy`     | counter   |                                           | 用户从提权提示中选择旧版沙盒        |
| `windows_sandbox.elevated_prompt_quit`           | counter   |                                           | 用户从提权提示中退出                |
| `windows_sandbox.fallback_prompt_shown`          | counter   |                                           | 回退沙盒提示显示                    |
| `windows_sandbox.fallback_retry_elevated`        | counter   |                                           | 用户从回退提示中重试提权设置        |
| `windows_sandbox.fallback_use_legacy`            | counter   |                                           | 用户从回退提示中选择旧版沙盒        |
| `windows_sandbox.fallback_prompt_quit`           | counter   |                                           | 用户从回退提示中退出                |
| `windows_sandbox.legacy_setup_preflight_failed`  | counter   | 见注释                                    | 旧版 Windows 沙盒设置预检失败       |
| `windows_sandbox.setup_elevated_sandbox_command` | counter   |                                           | 提权沙盒设置命令调用                |
| `windows_sandbox.createprocessasuserw_failed`    | counter   | `error_code`, `path_kind`, `exe`, `level` | Windows `CreateProcessAsUserW` 失败 |

## 反馈控制

默认情况下，Codex 允许用户通过 `/feedback` 发送反馈。要在整台机器上禁用反馈收集，更新配置：

```toml
[feedback]
enabled = false
```

禁用后，`/feedback` 显示禁用消息，Codex 拒绝反馈提交。

## 推理事件显示

### 隐藏推理输出

如果你希望减少嘈杂的"推理"输出（例如在 CI 日志中），可以抑制它：

```toml
hide_agent_reasoning = true
```

### 显示原始推理内容

如果你希望在模型发出原始推理内容时显示它：

```toml
show_raw_agent_reasoning = true
```

仅在对你工作流可接受时启用原始推理。某些模型/提供者（如 `gpt-oss`）不发出原始推理；在这种情况下，此设置没有可见效果。

## Notify 通知

使用 `notify` 在 Codex 发出支持的事件（目前仅 `agent-turn-complete`）时触发外部程序。这对于桌面弹窗、聊天 webhook、CI 更新或任何内置 TUI 通知未覆盖的旁路警报很有用。

```toml
notify = ["python3", "/path/to/notify.py"]
```

响应 `agent-turn-complete` 的 `notify.py` 示例：

```python
#!/usr/bin/env python3
import json, subprocess, sys

def main() -> int:
    notification = json.loads(sys.argv[1])
    if notification.get("type") != "agent-turn-complete":
        return 0
    title = f"Codex: {notification.get('last-assistant-message', 'Turn Complete!')}"
    message = " ".join(notification.get("input-messages", []))
    subprocess.check_output([
        "terminal-notifier",
        "-title", title,
        "-message", message,
        "-group", "codex-" + notification.get("thread-id", ""),
        "-activate", "com.googlecode.iterm2",
    ])
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

脚本接收单个 JSON 参数。常见字段包括：

- `type`（目前为 `agent-turn-complete`）
- `thread-id`（会话标识符）
- `turn-id`（回合标识符）
- `cwd`（工作目录）
- `input-messages`（导致回合的用户消息）
- `last-assistant-message`（最后的助手消息文本）

将脚本放在磁盘某处并将 `notify` 指向它。

### `notify` vs `tui.notifications`

- `notify` 运行外部程序（适合 webhook、桌面通知器、CI 钩子）。
- `tui.notifications` 内置于 TUI，可按事件类型过滤（例如 `agent-turn-complete` 和 `approval-requested`）。
- `tui.notification_method` 控制 TUI 如何发出终端通知（`auto`、`osc9` 或 `bel`）。
- `tui.notification_condition` 控制 TUI 通知是否仅在终端 `unfocused`（失焦）时触发还是 `always`（始终触发）。

在 `auto` 模式下，Codex 优先使用 OSC 9 通知（某些终端解释为桌面通知的终端转义序列），否则回退到 BEL（`\x07`）。

参见[配置参考](https://developers.openai.com/codex/config-reference)获取确切键名。

## 历史记录持久化

默认情况下，Codex 在 `CODEX_HOME` 下保存本地会话记录（例如 `~/.codex/history.jsonl`）。要禁用本地历史记录持久化：

```toml
[history]
persistence = "none"
```

要限制历史文件大小，设置 `history.max_bytes`。当文件超过限制时，Codex 删除最旧的条目并压缩文件，同时保留最新记录。

```toml
[history]
max_bytes = 104857600 # 100 MiB
```

## 文件引用链接

如果你使用的终端/编辑器集成支持，Codex 可以将文件引用渲染为可点击链接。配置 `file_opener` 选择 Codex 使用的 URI 方案：

```toml
file_opener = "vscode" # 或 cursor, windsurf, vscode-insiders, none
```

示例：像 `/home/user/project/main.py:42` 这样的引用可以被重写为可点击的 `vscode://file/...:42` 链接。

## AGENTS.md 与项目文档

Codex 读取 `AGENTS.md`（及相关文件），并在会话的第一个回合中包含有限的项目指导。两个配置项控制此行为：

- `project_doc_max_bytes`：从每个 `AGENTS.md` 文件中读取多少内容
- `project_doc_fallback_filenames`：当目录级别缺少 `AGENTS.md` 时尝试的额外文件名

详细说明请参见[使用 AGENTS.md 自定义指令](https://developers.openai.com/codex/guides/agents-md)。

## TUI 设置

不带子命令运行 `codex` 会启动交互式终端 UI（TUI）。Codex 在 `[tui]` 下暴露一些 TUI 专属配置，包括：

- `tui.notifications`：启用/禁用通知（或限制为特定类型）
- `tui.notification_method`：选择 `auto`、`osc9` 或 `bel` 进行终端通知
- `tui.notification_condition`：选择 `unfocused` 或 `always` 控制通知触发时机
- `tui.animations`：启用/禁用 ASCII 动画和微光效果
- `tui.alternate_screen`：控制交替屏幕使用（设置为 `never` 保留终端回滚缓冲区）
- `tui.show_tooltips`：在欢迎屏幕上显示或隐藏入门提示

`tui.notification_method` 默认为 `auto`。在 `auto` 模式下，当终端似乎支持时，Codex 优先使用 OSC 9 通知，否则回退到 BEL（`\x07`）。

完整键列表请参见[配置参考](https://developers.openai.com/codex/config-reference)。
