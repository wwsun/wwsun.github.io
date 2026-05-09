---
title: Google Discovery Service
tags:
  - google
  - api
description: Google Discovery Service 是 Google 所有 REST API 的自描述 Schema 中心，每个 API 提供一个 JSON 文档精确描述其资源层级、方法、参数和认证要求。
source:
---

## 一、Discovery 是什么？

Google Discovery Service 是 Google 所有 REST API 的 **自描述 Schema 中心**。每个 API 提供一个 JSON 文档（Discovery Document），精确描述该 API 的：

- 所有资源层级（Resource Hierarchy）
- 所有方法（Method）及其 HTTP verb、URL path
- 所有参数（Parameter）的类型、位置、是否必填
- 请求/响应体的 JSON Schema
- 认证要求（OAuth2 Scopes）
- 媒体上传/下载支持

## 二、Discovery 数据结构全貌

### 2.1 顶层：RestDescription

```rust
pub struct RestDescription {
    pub name: String,            // "drive"
    pub version: String,         // "v3"
    pub title: Option<String>,
    pub description: Option<String>,
    pub root_url: String,        // "https://www.googleapis.com/"
    pub service_path: String,    // "drive/v3/"
    pub schemas: HashMap<String, JsonSchema>,            // 所有类型定义
    pub resources: HashMap<String, RestResource>,        // 资源树
    pub parameters: HashMap<String, MethodParameter>,    // 全局参数
    pub auth: Option<AuthDescription>,                   // OAuth2 Scopes
}
```

### 2.2 资源与方法层级

```
RestDescription
  └── resources: HashMap<String, RestResource>
        └── RestResource
              ├── methods: HashMap<String, RestMethod>     # 当前资源的方法
              └── resources: HashMap<String, RestResource> # 子资源（递归）
```

示例：Drive API 的资源树

```
drive (RestDescription)
  └── files (RestResource)
        ├── methods:
        │   ├── "list"   → GET  /drive/v3/files
        │   ├── "get"    → GET  /drive/v3/files/{fileId}
        │   ├── "create" → POST /drive/v3/files
        │   ├── "update" → PATCH /drive/v3/files/{fileId}
        │   └── "delete" → DELETE /drive/v3/files/{fileId}
        └── resources:
              ├── comments (RestResource)
              │     └── methods: "list", "get", "create", ...
              └── revisions (RestResource)
                    └── methods: "list", "get", ...
```

### 2.3 RestMethod：单个 API 方法

```rust
pub struct RestMethod {
    pub id: Option<String>,                          // "drive.files.list"
    pub description: Option<String>,                 // 方法说明
    pub http_method: String,                         // GET/POST/PUT/PATCH/DELETE
    pub path: String,                                // "files/{fileId}"
    pub flat_path: Option<String>,                   // "files/{fileId}" (简化路径)
    pub parameters: HashMap<String, MethodParameter>,// 方法参数定义
    pub parameter_order: Vec<String>,                // 参数顺序
    pub request: Option<SchemaRef>,                  // 请求体 Schema 引用
    pub response: Option<SchemaRef>,                 // 响应体 Schema 引用
    pub scopes: Vec<String>,                         // 所需 OAuth2 Scopes
    pub supports_media_download: bool,               // 是否支持下载
    pub supports_media_upload: bool,                 // 是否支持上传
    pub media_upload: Option<MediaUpload>,           // 上传端点信息
}
```

### 2.4 MethodParameter：参数定义

```rust
pub struct MethodParameter {
    pub param_type: Option<String>,      // "string"|"integer"|"boolean"
    pub description: Option<String>,     // 参数说明
    pub location: Option<String>,        // "path"|"query"
    pub required: bool,                  // 是否必填
    pub format: Option<String>,          // "date-time"|"byte" 等
    pub default: Option<String>,         // 默认值
    pub enum_values: Option<Vec<String>>,// 枚举值
    pub repeated: bool,                  // 是否可重复（数组）
    pub minimum: Option<String>,
    pub maximum: Option<String>,
    pub deprecated: bool,
}
```

### 2.5 JsonSchema：请求/响应体 Schema

```rust
pub struct JsonSchema {
    pub id: Option<String>,
    pub schema_type: Option<String>,     // "object"|"array"|"string"...
    pub description: Option<String>,
    pub properties: HashMap<String, JsonSchemaProperty>, // 对象属性
    pub schema_ref: Option<String>,      // $ref 引用
    pub items: Option<Box<JsonSchemaProperty>>,          // 数组元素类型
    pub required: Vec<String>,           // 必填字段列表
}

pub struct JsonSchemaProperty {
    pub prop_type: Option<String>,       // 字段类型
    pub description: Option<String>,
    pub schema_ref: Option<String>,      // $ref 引用（嵌套对象）
    pub format: Option<String>,
    pub items: Option<Box<JsonSchemaProperty>>,
    pub read_only: bool,
    pub default: Option<String>,
    pub enum_values: Option<Vec<String>>,
}
```

## 三、Discovery 文档的获取与缓存

### 3.1 获取流程

```
用户输入: gws drive files list

  main.rs: parse_service_and_version()
    → 提取服务名 "drive"
    → 通过 services.rs 的 SERVICE 注册表解析:
      "drive" → api_name="drive", version="v3"
    → 支持 --api-version 覆盖版本

  discovery::fetch_discovery_document("drive", "v3")

    步骤 1: 输入验证
      → validate_api_identifier("drive")  # 只允许 [a-zA-Z0-9\-_.]
      → validate_api_identifier("v3")     # 防止路径遍历注入

    步骤 2: 检查本地缓存
      → 缓存路径: ~/.config/gws/cache/drive_v3.json
      → TTL: 24 小时
      → 缓存命中 → 直接解析返回

    步骤 3: 远程获取（缓存未命中或过期）
      → 主 URL: https://www.googleapis.com/discovery/v1/apis/drive/v3/rest
      → 备用 URL: https://drive.googleapis.com/$discovery/rest?version=v3
         （用于 Forms、Keep、Meet 等新 API）

    步骤 4: 写入缓存
      → 保存到 ~/.config/gws/cache/drive_v3.json
```

### 3.2 双层 Discovery 源

```rust
// 第一层：标准 Discovery   URL
// https://www.googleapis.com/discovery/v1/apis/{service}/{version}/rest
let url = format!(
    "https://www.googleapis.com/discovery/v1/apis/{}/{}/rest",
    service, version
);

// 第二层：$discovery 端点（fallback）
// https://{service}.googleapis.com/$discovery/rest?version={version}
// 用于 Forms、Keep、Meet 等使用新式 API 设置的服务
let alt_url = format!("https://{service}.googleapis.com/$discovery/rest");
```

### 3.3 安全验证

```rust
// API 标识符验证 —— 防止路径遍历和注入
pub fn validate_api_identifier(s: &str) -> Result<&str, GwsError> {
    // 只允许 [a-zA-Z0-9\-_.] 字符
    // 拒绝: 路径遍历 (../)、查询注入 (?)、片段注入 (#)、URL编码绕过 (%)
}
```

## 四、从 Discovery 到 CLI 命令树

### 4.1 入口流程（main.rs）

```
run()
  → 解析 first_arg (服务名)
  → 处理特殊命令 (schema/generate-skills/auth)
  → 对于 workflow 服务：使用空的 RestDescription（合成服务）
  → 对于其他服务：fetch_discovery_document()
  → commands::build_cli(&doc)   # 动态构建命令树
  → cli.try_get_matches_from()  # 二次解析参数
  → helpers::handle() 或 executor::execute_method()
```

### 4.2 命令树构建（commands.rs）

```
build_cli(doc: &RestDescription)

  步骤 1: 创建根命令 "gws"
    → 设置 about 文本（来自 doc.description）
    → 添加全局参数:
      - --sanitize     (Model Armor 模板)
      - --dry-run      (本地验证)
      - --format       (json/table/yaml/csv)
    → subcommand_required(true)

  步骤 2: 注入 Helper 命令（如果有）
    → helpers::get_helper(&doc.name)
    → helper.inject_commands(root, doc)  # 添加 +verb 命令

  步骤 3: 构建资源子命令（递归）
    → 遍历 doc.resources
    → build_resource_command("files", &doc.resources["files"])
```

### 4.3 资源命令构建（递归）

```
build_resource_command(name: "files", resource: &RestResource)

  步骤 1: 创建子命令 "files"
    → about: "Operations on the 'files' resource"

  步骤 2: 为每个方法创建子命令（按字母排序）
    为 "create" 方法:
      → 创建 "create" 子命令
      → about: 从 method.description 截取（CLI_DESCRIPTION_LIMIT 字符）
      → 添加标准参数:
        - --params   (URL/Query 参数的 JSON 字符串)
        - --output   (二进制响应输出路径)
      → 如果 method.request 存在:
        - 添加 --json   (请求体的 JSON 字符串)
      → 如果 method.supports_media_upload:
        - 添加 --upload              (上传文件路径)
        - 添加 --upload-content-type (MIME 类型)
      → 添加分页参数:
        - --page-all   (自动分页)
        - --page-limit (最大页数，默认 10)
        - --page-delay (页间延迟，默认 100ms)

  步骤 3: 为子资源构建命令（递归）
    → build_resource_command("comments", &resource.resources["comments"])
    → build_resource_command("revisions", &resource.resources["revisions"])

  步骤 4: 如果没有任何子命令和子资源，返回 None（不显示此命令）
```

### 4.4 两阶段 CLI 解析

这是 gws 架构的核心创新：

```
阶段 1: 预解析
  用户输入: gws drive files get --params '{"fileId":"abc"}'

  → 提取 first_arg = "drive"
  → 其他参数全部忽略
  → 根据 "drive" 获取 Discovery Document

阶段 2: 动态构建 + 完整解析
  → 从 Discovery Document 构建完整命令树:
    gws
      └── files
            ├── list
            ├── get    [--params, --output, --page-all, ...]
            ├── create  [--params, --json, --upload, ...]
            └── ...

  → cli.try_get_matches_from(sub_args)
    解析: files + get + --params '{"fileId":"abc"}'
  → 返回 matches，包含解析后的参数值
```

## 五、Path 模板渲染

### 5.1 RFC 6570 路径模板

Discovery Document 中的 path 采用 RFC 6570 URI 模板语法：

| 模板语法   | 含义                   | 示例 input            | 渲染结果              |
| ---------- | ---------------------- | --------------------- | --------------------- |
| `{fileId}` | 标准展开，编码特殊字符 | `abc/123`             | `abc%2F123`           |
| `{+name}`  | 保留 `/` 的分段展开    | `projects/p1/locs/us` | `projects/p1/locs/us` |

### 5.2 flatPath vs path 选择逻辑

```rust
// 优先使用 flatPath，但当其占位符与参数名不匹配时回退到 path
// 例如 Slides API 的 bug:
//   flatPath: "v1/presentations/{presentationsId}"  (拼写错误，复数)
//   path:     "v1/presentations/{+presentationId}"  (正确)
//   parameter: "presentationId" (单数)
let path_template = match method.flat_path {
    Some(fp) if all_path_params_match(fp, method.parameters) => fp,
    _ => method.path.as_str(),
};
```

### 5.3 参数分离逻辑

```
build_url(doc, method, params):

  1. 提取路径参数
    → extract_template_path_parameters(path_template)
    → 返回 {"fileId"}

  2. 分离参数
    对于 params 中的每个 (key, value):
      → 如果 key 在路径参数中 → 跳过（后续渲染）
      → 如果 key.location == "path" 但不在模板中 → 报错
      → 如果 key.repeated → 展开 JSON 数组为多个查询参数
      → 否则 → 添加到 query_params

  3. 渲染路径
    → render_path_template(path_template, params)
    → {fileId} → encode_path_segment("abc/123") → "abc%2F123"
    → {+name} → encode_path_preserving_slashes(...) → 保留斜杠

  4. 拼接完整 URL
    → 如果是上传 → 使用 media_upload.simple.path 端点
    → 否则 → base_url + 渲染后的 path
```

## 六、Schema 验证

### 6.1 请求体验证

```
executor::execute_method()
  → parse_and_validate_inputs()
    → 如果 method.request 存在:
      → validate_body_against_schema(body, schema_name, doc)
        → 递归遍历 JSON 对象
        → 检查必填字段 (schema.required)
        → 检查字段类型 (prop_type)
        → 检查未知字段
        → 检查枚举值 (enum_values)
        → 递归验证 $ref 引用
        → 验证数组子项
        → 验证嵌套对象
```

### 6.2 验证规则

```rust
fn validate_property(value, prop_schema, doc, path, errors):
  1. 如果有 $ref → 递归验证引用类型
  2. 类型检查: string/integer/number/boolean/array/object
  3. 数组子项验证
  4. 嵌套对象属性验证
  5. 枚举值验证
```

### 6.3 错误格式

```
验证失败时返回统一的错误格式:
{
  "error": {
    "code": 400,
    "message": "Request body failed schema validation:\n- name: Missing required property 'status'\n- count: Expected type 'integer', found string"
  }
}
```

## 七、特殊处理

### 7.1 合成服务（workflow）

```rust
// workflow 服务没有对应的 Discovery Document
// 使用空的 RestDescription，完全由 Helper 命令驱动
let doc = if api_name == "workflow" {
    RestDescription {
        name: "workflow".to_string(),
        description: Some("Cross-service productivity workflows".to_string()),
        ..Default::default()
    }
};
```

### 7.2 服务注册表

`services.rs` 维护了 18 个已知服务及其别名映射：

| 别名                   | API 名称        | 版本       |
| ---------------------- | --------------- | ---------- |
| drive                  | drive           | v3         |
| gmail                  | gmail           | v1         |
| sheets                 | sheets          | v4         |
| calendar               | calendar        | v3         |
| admin-reports, reports | admin           | reports_v1 |
| docs                   | docs            | v1         |
| slides                 | slides          | v1         |
| tasks                  | tasks           | v1         |
| people                 | people          | v1         |
| chat                   | chat            | v1         |
| classroom              | classroom       | v1         |
| forms                  | forms           | v1         |
| keep                   | keep            | v1         |
| meet                   | meet            | v2         |
| events                 | workspaceevents | v1         |
| modelarmor             | modelarmor      | v1         |
| workflow, wf           | workflow        | v1         |
| script                 | script          | v1         |

未注册的 API 可以通过 `<apiName>:<version>` 语法直接访问。

## 八、完整数据流图

```
┌──────────────────────────────────────────────────────────────────────┐
│ 用户输入                                                              │
│ gws drive files get --params '{"fileId":"abc123","fields":"name,id"}'│
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                        main.rs: run()
                               │
                    ┌──────────▼──────────┐
                    │ 提取 first_arg      │
                    │ = "drive"           │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ parse_service_and   │
                    │ _version()          │
                    │ "drive" → (drive,v3)│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ fetch_discovery_    │
                    │ document("drive",   │
                    │          "v3")      │
                    │                     │
                    │ ① 验证输入          │
                    │ ② 检查缓存 (24h)    │
                    │ ③ 获取远程 Schema   │
                    │ ④ 写入本地缓存      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ RestDescription     │
                    │ {                   │
                    │   name: "drive",    │
                    │   version: "v3",    │
                    │   root_url: "https://│
                    │     www.googleapis. │
                    │     com/",          │
                    │   schemas: {...},   │
                    │   resources: {      │
                    │     "files": {      │
                    │       methods: {    │
                    │         "get": {    │
                    │           http_method│
                    │           : "GET",  │
                    │           path:     │
                    │            "/files/ │
                    │            {fileId}"│
                    │           ...       │
                    │         }           │
                    │       }             │
                    │     }               │
                    │   }                 │
                    │ }                   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ commands::build_cli │
                    │ (&doc)              │
                    │                     │
                    │ → 创建根命令 gws    │
                    │ → 注入 globals      │
                    │ → 注入 helpers      │
                    │ → 递归构建资源命令  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ clap::Command 树    │
                    │ gws                 │
                    │  ├── --sanitize     │
                    │  ├── --dry-run      │
                    │  ├── --format       │
                    │  └── files          │
                    │       ├── list      │
                    │       ├── get       │
                    │       │  ├── --params│
                    │       │  └── --output│
                    │       └── create    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ try_get_matches_from│
                    │ ("files","get",    │
                    │  "--params","{...}")│
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ resolve_method_from │
                    │ _matches()          │
                    │ → 找到目标方法 get   │
                    │ → 提取 params_json   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ executor::execute   │
                    │ _method()           │
                    │                     │
                    │ ① parse_and_        │
                    │    validate_inputs  │
                    │    → 解析 --params  │
                    │    → 验证 Schema    │
                    │    → 构建 URL       │
                    │    → 分离 query     │
                    │                     │
                    │ ② build_http_request│
                    │    → 认证头         │
                    │    → 查询参数       │
                    │    → 请求体         │
                    │                     │
                    │ ③ execute HTTP      │
                    │    → 发送请求       │
                    │    → 处理响应       │
                    │    → 自动分页       │
                    │    → 格式化输出     │
                    └──────────┬──────────┘
                               │
                               ▼
                    JSON/Table/YAML/CSV 输出
```

## 九、设计亮点总结

| 设计决策               | 说明                                                  |
| ---------------------- | ----------------------------------------------------- |
| **动态命令生成**       | 不硬编码任何 API 端点，完全由 Discovery Document 驱动 |
| **两阶段解析**         | 先获取 Schema 再解析参数，优雅处理动态命令树          |
| **24 小时缓存**        | 减少 Discovery API 调用，同时确保 Schema 不过时       |
| **双层 Discovery URL** | 兼容新旧两种 Google API 端点模式                      |
| **严格输入验证**       | API 标识符、资源名、文件路径都有完整的安全验证        |
| **flatPath 降级**      | 处理 Discovery Document 的命名不一致问题              |
| **RFC 6570 兼容**      | 支持 `{+var}` 展开语法，保留层级路径                  |
| **Schema 验证**        | 请求体在发送前验证，减少无效 API 调用                 |
| **合成服务**           | 无 Discovery 的 workflow 服务使用空描述 + Helper 驱动 |
