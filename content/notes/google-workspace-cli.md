---
title: google-workspace-cli
tags:
  - github
description: Google Workspace CLI (gws) 是一个用 Rust 编写的动态命令行工具，通过运行时解析 Google Discovery Service 的 JSON 文档自动生成命令界面，为所有 Google Workspace API 提供统一的 CLI 访问入口。
source:
---

**Google Workspace CLI (`gws`)** 是一个用 Rust 编写的动态命令行工具，通过运行时解析 Google Discovery Service 的 JSON 文档自动生成命令界面，为 Drive、Gmail、Calendar、Sheets、Docs 等所有 Google Workspace API 提供统一的 CLI 访问入口。面向人类用户和 AI Agent 设计，输出结构化 JSON，内置 40+ Agent Skills。

---

## 技术栈

| 类别            | 技术                                               |
| --------------- | -------------------------------------------------- |
| **语言**        | Rust (98.7%)                                       |
| **CLI 框架**    | clap (v4, derive + string features)                |
| **异步运行时**  | tokio (full features)                              |
| **HTTP 客户端** | reqwest (json, stream, rustls-tls-native-roots)    |
| **认证**        | yup-oauth2 (OAuth2), AES-256-GCM 加密              |
| **密钥存储**    | keyring (OS native: macOS/Windows/Linux)           |
| **序列化**      | serde, serde_json                                  |
| **TUI**         | ratatui + crossterm                                |
| **日志**        | tracing, tracing-subscriber                        |
| **构建工具**    | Cargo (workspace), cargo-dist                      |
| **分发**        | npm (预编译二进制), Homebrew, Nix, GitHub Releases |

---

## 目录结构

```
googleworkspace/cli/
├── Cargo.toml                      # Workspace 根配置
├── README.md                       # 项目文档
├── AGENTS.md                       # Agent 开发指南
├── CONTEXT.md                      # Agent 使用规则
├── docs/
│   └── skills.md                   # Skills 索引文档
├── crates/
│   ├── google-workspace/           # 核心库 crate
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── discovery.rs        # Discovery Document 解析
│   │       ├── services.rs         # 服务注册表 (别名→API 映射)
│   │       ├── client.rs           # HTTP 客户端 + 重试逻辑
│   │       ├── error.rs            # GwsError 枚举 + 退出码
│   │       └── validate.rs         # 路径/URL/资源验证器
│   └── google-workspace-cli/       # CLI 二进制 crate
│       ├── Cargo.toml
│       └── src/
│           ├── main.rs             # 入口点 + 两阶段解析
│           ├── auth.rs             # OAuth2 + Service Account
│           ├── auth_commands.rs    # gws auth 子命令
│           ├── credential_store.rs # AES-256-GCM 加密存储
│           ├── commands.rs         # 动态 clap::Command 构建
│           ├── executor.rs         # HTTP 请求执行 + 分页
│           ├── schema.rs           # gws schema 命令
│           ├── discovery.rs        # Discovery 文档获取
│           ├── helpers/            # Helper 命令 (+verb)
│           │   ├── mod.rs          # Helper trait 定义
│           │   ├── calendar.rs     # Calendar helpers
│           │   ├── chat.rs         # Chat helpers
│           │   ├── docs.rs         # Docs helpers
│           │   ├── drive.rs        # Drive helpers (+upload)
│           │   ├── events.rs       # Events helpers (+subscribe)
│           │   ├── gmail.rs        # Gmail helpers (+send, +triage)
│           │   ├── modelarmor.rs   # Model Armor helpers
│           │   ├── script.rs       # Apps Script helpers
│           │   ├── sheets.rs       # Sheets helpers (+read, +append)
│           │   └── workflows.rs    # Workflow helpers (+standup-report)
│           ├── logging.rs          # 结构化日志初始化
│           ├── timezone.rs         # 时区解析
│           ├── output.rs           # 输出格式化
│           ├── formatter.rs        # 输出格式 (json/table/yaml/csv)
│           ├── generate_skills.rs  # Skill 文件生成
│           ├── setup.rs            # gws auth setup 逻辑
│           ├── setup_tui.rs        # TUI 设置界面
│           ├── text.rs             # 文本处理工具
│           ├── token_storage.rs    # Token 存储抽象
│           ├── fs_util.rs          # 文件系统工具
│           ├── oauth_config.rs     # OAuth 配置
│           └── validate.rs         # 输入验证
└── skills/                         # AI Agent Skills (40+)
    ├── gws-shared/
    ├── gws-drive/
    ├── gws-gmail/
    ├── gws-sheets/
    ├── gws-calendar/
    └── ...                         # 每个服务一个 Skill 目录
```

---

## 入口点

| 入口         | 路径                                      | 说明                              |
| ------------ | ----------------------------------------- | --------------------------------- |
| **主入口**   | `crates/google-workspace-cli/src/main.rs` | 两阶段 CLI 解析，服务路由         |
| **二进制名** | `gws`                                     | 由 `Cargo.toml` 的 `[[bin]]` 定义 |
| **库入口**   | `crates/google-workspace/src/lib.rs`      | 核心类型和 HTTP 工具              |

### 启动流程 (`main.rs`)

```
main()
  → dotenvy::dotenv()              # 加载 .env
  → logging::init_logging()        # 初始化 tracing
  → run().await
      → 解析 argv，提取 first_arg (服务名)
      → 处理特殊命令: schema, generate-skills, auth
      → parse_service_and_version() # 解析服务名和版本
      → discovery::fetch_discovery_document() # 获取 Discovery JSON
      → commands::build_cli()       # 构建动态命令树
      → cli.try_get_matches_from()  # 二次解析参数
      → executor::execute()         # 执行 API 请求
```

---

## 核心数据流

### 命令执行流程

```
用户输入: gws drive files list --params '{"pageSize": 10}'

  → main.rs: run()
    → 提取服务名 "drive"
    → discovery.rs: fetch_discovery_document("drive", "v3")
      → [远程] GET https://discovery.googleapis.com/discovery/v1/apis/drive/v3/rest
      → 返回 RestDescription (Discovery Document)

    → commands.rs: build_cli(&doc)
      → 遍历 doc.resources 构建 clap::Command 树
      → 注入 helpers (如 +upload)
      → 为每个方法添加 --params, --json, --upload 等参数

    → cli.try_get_matches_from(&sub_args)
      → 解析得到 matches

    → executor.rs: execute()
      → parse_and_validate_inputs()  # 验证参数和 Body
      → build_request()              # 构造 HTTP 请求
      → client.execute().await       # 发送请求
      → handle_response()            # 处理响应
      → formatter::format_output()   # 格式化输出 (json/yaml/csv/table)
```

### Discovery 驱动的动态命令生成

```
Google Discovery Service
  → discovery.rs: RestDescription (serde 反序列化)
    → schemas: HashMap<String, JsonSchema>      # 类型定义
    → resources: HashMap<String, RestResource>  # 资源层级
      → methods: HashMap<String, RestMethod>    # 具体方法
        → http_method: "GET"|"POST"|"PATCH"|"DELETE"
        → path: "/drive/v3/files/{fileId}"
        → parameters: HashMap<String, MethodParameter>
        → request: Option<SchemaRef>   # 请求体 Schema
        → response: Option<SchemaRef>  # 响应体 Schema
        → supports_media_upload: bool
        → supports_media_download: bool

    → commands.rs: build_cli()
      → 递归遍历 resources，为每个 resource 创建子命令
      → 为每个 method 创建子命令
      → 根据 method.parameters 添加 CLI 参数
      → 根据 method.request 决定是否添加 --json
      → 根据 supports_media_upload 决定是否添加 --upload
```

### 认证流程

```
gws auth setup
  → auth_commands.rs: handle_auth_command()
    → setup.rs: run_setup()
      → 检查 gcloud 是否安装
      → gcloud projects create / apis enable
      → 创建 OAuth Desktop client
      → credential_store.rs: encrypt_and_store()
        → AES-256-GCM 加密
        → 密钥存储到 OS keyring 或 ~/.config/gws/.encryption_key

gws auth login
  → auth_commands.rs: handle_login()
    → yup-oauth2: 启动本地回调服务器
    → 浏览器 OAuth 授权
    → token_storage.rs: 存储 access_token + refresh_token

gws drive files list
  → auth.rs: get_token()
    → 优先: GOOGLE_WORKSPACE_CLI_TOKEN 环境变量
    → 其次: credentials.json (Service Account)
    → 最后: token_storage (OAuth refresh)
  → 在 HTTP Header 添加: Authorization: Bearer {token}
```

---

## 整体架构

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│  CLI 层 (google-workspace-cli)                              │
│  ├── main.rs          → 入口、两阶段解析、路由              │
│  ├── commands.rs      → 动态 clap 命令构建                  │
│  ├── auth_commands.rs → auth 子命令                         │
│  └── helpers/         → +verb 辅助命令                      │
├─────────────────────────────────────────────────────────────┤
│  业务编排层                                                 │
│  ├── executor.rs      → HTTP 请求构建、执行、分页           │
│  ├── schema.rs        → Schema 内省命令                     │
│  ├── generate_skills.rs → Skill 文件生成                   │
│  └── setup.rs/setup_tui.rs → 初始化向导                   │
├─────────────────────────────────────────────────────────────┤
│  核心逻辑层 (google-workspace)                              │
│  ├── discovery.rs     → Discovery Document 解析             │
│  ├── services.rs      → 服务注册表                          │
│  ├── client.rs        → HTTP 客户端 + 重试                  │
│  ├── error.rs         → 错误类型 + 退出码                   │
│  └── validate.rs      → 输入验证工具                        │
├─────────────────────────────────────────────────────────────┤
│  适配器层                                                   │
│  ├── auth.rs          → OAuth2 / Service Account            │
│  ├── credential_store.rs → AES-256-GCM 加密                │
│  ├── token_storage.rs → Token 持久化                        │
│  └── client.rs        → reqwest HTTP 客户端                │
├─────────────────────────────────────────────────────────────┤
│  外部系统                                                   │
│  ├── Google Discovery Service (https://discovery.googleapis.com)
│  ├── Google OAuth2 (https://oauth2.googleapis.com)          │
│  └── Google Workspace APIs (drive, gmail, sheets...)        │
└─────────────────────────────────────────────────────────────┘
```

### 两阶段 CLI 解析

这是 `gws` 的核心设计创新：

```
阶段 1: 预解析 (main.rs)
  → 只解析服务名 (drive, gmail, sheets...)
  → 忽略其他所有参数

阶段 2: 动态构建 + 完整解析 (commands.rs)
  → 根据服务名获取 Discovery Document
  → 动态构建完整的 clap::Command 树
  → 重新解析所有参数

优势:
  - 不需要硬编码每个 API 的参数
  - Google 新增 API 端点时自动支持
  - 每个服务都有完整的 --help
```

---

## 核心抽象

### 1. `RestDescription` (`discovery.rs`)

Discovery Document 的顶层结构

- **关键字段**: `name`, `version`, `schemas`, `resources`, `auth`
- **作用**: 描述整个 API 的结构

### 2. `RestResource` (`discovery.rs`)

API 资源（如 drive/files）

- **关键字段**: `methods`, `resources` (嵌套子资源)
- **作用**: 支持资源层级（如 `drive.files.comments`）

### 3. `RestMethod` (`discovery.rs`)

单个 API 方法

- **关键字段**: `id`, `http_method`, `path`, `parameters`, `request`, `response`, `scopes`
- **作用**: 描述一个 HTTP 端点的完整信息

### 4. `Helper` Trait (`helpers/mod.rs`)

服务特定的辅助命令

- **方法**: `inject_commands()`, `handle()`
- **作用**: 为服务添加 `+send`, `+upload` 等高级命令
- **实现**: `calendar`, `drive`, `gmail`, `sheets` 等模块

### 5. `ServiceEntry` (`services.rs`)

服务注册表条目

- **关键字段**: `aliases`, `api_name`, `version`, `description`
- **作用**: 将用户输入的别名映射到 Discovery API 名称

### 6. `GwsError` (`error.rs`)

统一错误类型

- **变体**: `Discovery`, `Auth`, `Validation`, `Http`, `Io`
- **作用**: 统一错误处理，提供结构化 JSON 错误输出

---

## 关键文件速查

| 想了解什么                  | 去哪里找                                         |
| --------------------------- | ------------------------------------------------ |
| Discovery Document 结构定义 | `crates/google-workspace/src/discovery.rs`       |
| 服务别名注册表              | `crates/google-workspace/src/services.rs`        |
| 动态命令构建逻辑            | `crates/google-workspace-cli/src/commands.rs`    |
| API 请求执行                | `crates/google-workspace-cli/src/executor.rs`    |
| OAuth2 认证流程             | `crates/google-workspace-cli/src/auth.rs`        |
| Helper 命令 trait           | `crates/google-workspace-cli/src/helpers/mod.rs` |
| 错误类型定义                | `crates/google-workspace/src/error.rs`           |
| 输出格式化                  | `crates/google-workspace-cli/src/formatter.rs`   |
| 两阶段 CLI 解析入口         | `crates/google-workspace-cli/src/main.rs`        |

---

## 核心依赖

| 库             | 用途                             |
| -------------- | -------------------------------- |
| **clap**       | CLI 参数解析，支持动态子命令构建 |
| **tokio**      | 异步运行时                       |
| **reqwest**    | HTTP 客户端，支持流和代理        |
| **yup-oauth2** | OAuth2 认证流程                  |
| **serde**      | JSON 序列化/反序列化             |
| **keyring**    | OS 密钥链存储                    |
| **aes-gcm**    | AES-256-GCM 加密                 |
| **ratatui**    | TUI 界面 (setup 向导)            |
| **tracing**    | 结构化日志                       |

---

## 值得关注的设计决策

### 1. **Schema-Driven 动态命令生成**

不同于传统 CLI 硬编码每个子命令，`gws` 在运行时从 Google Discovery Service 获取 API Schema 并动态构建命令树。这意味着：

- Google 新增 API 端点时 `gws` 自动支持
- 不需要发布新版本即可使用新功能
- 每个服务都有完整的 `--help` 文档

### 2. **两阶段 CLI 解析**

第一阶段只提取服务名，第二阶段根据 Discovery Document 构建完整命令树后重新解析。这种设计使得动态命令生成成为可能，同时保持了良好的用户体验。

### 3. **Helper 命令设计哲学**

Helper 命令（如 `+send`, `+upload`）只在 Discovery 命令无法优雅实现时才添加：

- ✅ 多步骤编排（如创建 Pub/Sub 订阅）
- ✅ 格式转换（如 Markdown → Docs）
- ✅ 多 API 组合（如邮件分类）
- ❌ 不包装单个 API 调用（避免重复）

### 4. **AI Agent 优先设计**

- 所有输出都是结构化 JSON
- 内置 40+ Agent Skills
- `--dry-run` 支持安全测试
- `--page-all` 自动分页
- `--fields` 字段过滤（保护上下文窗口）

### 5. **安全设计**

- 凭证使用 AES-256-GCM 加密
- 密钥存储在 OS 密钥链
- 支持 Service Account 和 OAuth2
- 输入验证防止路径遍历攻击
