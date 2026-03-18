---
title: Rout
tags:
  - agent
  - github
draft: false
description: Routa 是一个面向 AI 开发的多智能体编排平台，让多个 AI Agent 协作完成复杂的开发任务。
source: https://github.com/phodal/routa
---

## 一、项目定位

Routa 是一个**多智能体协调平台**，核心思路是：不再由单个 AI 处理所有事情，而是将开发任务分解给专业角色团队协作完成。

**多协议架构：**

| 协议                          | 路径       | 职责                     |
| ----------------------------- | ---------- | ------------------------ |
| MCP (Model Context Protocol)  | `/api/mcp` | Agent 协作工具，SSE 传输 |
| ACP (Agent Client Protocol)   | `/api/acp` | 派生和管理 Agent 进程    |
| A2A (Agent-to-Agent Protocol) | `/api/a2a` | 跨平台 Agent 联邦通信    |

**双后端架构：**

- **Next.js + TypeScript** — Web 端，Vercel / Postgres / SQLite
- **Rust (Axum)** — 桌面端（Tauri），内嵌服务器 + SQLite
- 两端实现完全相同的 REST API，前端无感知切换

---

## 二、核心领域模型

模型定义位于 `src/core/models/`，数据库 Schema 位于 `src/core/db/schema.ts`。

### Workspace（工作区）— 顶层容器

```typescript
interface Workspace {
  id: string
  title: string
  status: "active" | "archived"
  metadata: Record<string, string>
}
```

所有其他实体（Agent、Task、Note、Codebase）都归属于某个 Workspace。

### Agent（智能体）— 执行单元

```typescript
enum AgentRole {
  ROUTA = "ROUTA", // 协调者：规划、拆分、委托
  CRAFTER = "CRAFTER", // 实现者：写代码、做修改
  GATE = "GATE", // 验证者：审查、验收
  DEVELOPER = "DEVELOPER", // 独行侠：独立完成全流程
}

enum ModelTier {
  SMART = "SMART", // Opus 级别
  BALANCED = "BALANCED", // Sonnet 级别
  FAST = "FAST", // Haiku 级别
}

interface Agent {
  id: string
  role: AgentRole
  modelTier: ModelTier
  workspaceId: string
  parentId?: string // 支持父子树形结构
  status: AgentStatus
}
```

`parentId` 构建 Agent 树：ROUTA 是父节点，CRAFTER/GATE 是子节点。

### Task（任务）— 工作单元

```typescript
interface Task {
  id: string
  title: string
  objective: string
  scope?: string
  acceptanceCriteria?: string[] // 验收标准
  verificationCommands?: string[] // 验证命令
  assignedTo?: string // 分配给哪个 Agent
  status: TaskStatus
  dependencies: string[] // 依赖的 Task ID（DAG）
  parallelGroup?: string // 并行执行组
  verificationVerdict?: VerificationVerdict // GATE 的审查结论
}
```

关键设计：

- `dependencies + parallelGroup` — 支持 DAG 依赖图和并行执行
- `acceptanceCriteria + verificationCommands` — 明确定义"完成"标准，供 GATE 验收

### Note（笔记）— 共享上下文

```typescript
type NoteType = "spec" | "task" | "general"

interface Note {
  id: string // spec Note 固定为 "spec"
  type: NoteType
  content: string
  workspaceId: string
  linkedTaskId?: string // task Note 关联 Task ID
}
```

三种类型各有用途：

| 类型      | 用途                                                       |
| --------- | ---------------------------------------------------------- |
| `spec`    | **规划 Spec**，整个 Session 的意图来源，ID 固定为 `"spec"` |
| `task`    | 由 `@@@task` 块解析生成的结构化任务描述                    |
| `general` | 自由格式的上下文共享文档                                   |

### BackgroundTask — 异步执行队列

与 `Task` 不同，BackgroundTask 是**执行层概念**，代表一次真实的 ACP Session 启动：

```typescript
interface BackgroundTask {
  id: string
  prompt: string
  agentId: string // ACP Provider（claude/opencode）
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"
  triggerSource: "manual" | "schedule" | "webhook" | "polling" | "workflow"
  priority: "HIGH" | "NORMAL" | "LOW"
  // 进度追踪
  toolCallCount?: number
  inputTokens?: number
  outputTokens?: number
  currentActivity?: string
  // 工作流编排
  workflowRunId?: string
  dependsOnTaskIds?: string[]
  taskOutput?: string // 链式传递给下一个任务
}
```

**Task vs BackgroundTask：**

- `Task` — ROUTA 分配给 CRAFTER/GATE 的编排层工作单元
- `BackgroundTask` — 真实启动 ACP Session 的执行层任务，与用户 Browser Session 解耦

---

## 三、数据存储架构

### 多后端驱动选择

Routa 支持三种数据库后端，通过环境变量自动切换，选择优先级如下：

```
ROUTA_DB_DRIVER 环境变量（显式覆盖）
  ↓ 否则检测 DATABASE_URL
  ├── Neon URL  → PostgreSQL Serverless（@neondatabase/serverless，HTTP/WebSocket）
  ├── 标准 URL  → PostgreSQL 标准（postgres-js，TCP 连接池 max=10）
  ├── 无 URL + 非 Serverless → SQLite（better-sqlite3，WAL 模式）
  └── 兜底     → 纯内存 Map（不持久化）
```

驱动选择逻辑位于 `src/core/db/index.ts`，Drizzle Kit 配置位于 `drizzle.config.ts`。

### Store 抽象层（三套实现）

每个实体都有统一接口和三套实现，由 `RoutaSystem` 工厂在启动时注入：

```
接口（TypeScript）           PG 实现                   SQLite 实现              内存实现
WorkspaceStore      ←→  PgWorkspaceStore      / SqliteWorkspaceStore  / InMemoryWorkspaceStore
AgentStore          ←→  PgAgentStore          / SqliteAgentStore      / InMemoryAgentStore
TaskStore           ←→  PgTaskStore           / SqliteTaskStore       / InMemoryTaskStore
NoteStore           ←→  PgNoteStore           / SqliteNoteStore       / CRDTNoteStore（Yjs）
ConversationStore   ←→  PgConversationStore   / SqliteConversationStore / InMemoryConversationStore
AcpSessionStore     ←→  PgAcpSessionStore     / SqliteAcpSessionStore / InMemoryAcpSessionStore
BackgroundTaskStore ←→  PgBackgroundTaskStore / SqliteBackgroundTaskStore / InMemoryBackgroundTaskStore
```

### API 到数据库的完整链路

```
HTTP POST /api/workspaces
  → src/app/api/workspaces/route.ts（Next.js Route Handler）
  → getRoutaSystem()                  // 全局单例（globalThis，HMR 存活）
  → system.workspaceStore.save()
     ├── PgWorkspaceStore → Drizzle ORM → insert().onConflictDoUpdate() → PostgreSQL
     ├── SqliteWorkspaceStore → Drizzle ORM → better-sqlite3 → routa.db
     └── InMemoryWorkspaceStore → Map<string, T>
```

### 特殊存储机制

| 机制                      | 实现                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| **Task 乐观锁**           | `UPDATE tasks SET version=version+1 WHERE id=? AND version=?`，rowCount=0 表示冲突 |
| **Notes CRDT**            | 内存模式使用 Yjs 实现无冲突并发编辑，通过 SSE 广播变更给所有客户端                 |
| **SQLite WAL 模式**       | TypeScript（better-sqlite3）和 Rust（rusqlite）均开启 WAL + 外键约束               |
| **ACP Session 恢复**      | Serverless 进程重启后从 Postgres 查询 Session 记录，自动重建 ClaudeCodeSdkAdapter  |
| **WorkflowRun（待实现）** | 当前工作流运行状态不持久化（`TODO: Implement PgWorkflowRunStore`）                 |

### Migration 管理

| 后端       | 方式                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| PostgreSQL | Drizzle Kit 生成 SQL 文件（`/drizzle/0000_*.sql`），`npm run db:migrate` 执行      |
| SQLite     | 启动时 `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN`（静默忽略错误） |

---

## 四、领域模型协作流程

### 第一阶段：意图解析（用户 → Spec Note）

用户输入自然语言，ROUTA 解析后写入 Spec Note，作为所有下游 Agent 的唯一上下文来源：

```
用户: "实现 JWT 认证系统"
        ↓
ROUTA 解析意图
        ↓
Note(id="spec", type="spec") = {
  content: "# 目标\n实现 JWT 认证...\n\n@@@task\n# 用户登录\n..."
}
```

### 第二阶段：任务拆分（`@@@task` 块解析）

ROUTA 在 Spec 中用 `@@@task` 语法定义任务，由 `src/core/orchestration/task-block-parser.ts` 解析：

```
@@@task
# 用户登录 API
## Objective
实现 /api/auth/login 端点
## Scope
- src/auth/
## Definition of Done
- 返回 JWT token
- 密码哈希验证通过
## Verification
- npm test
@@@
```

解析后生成 Task 对象，存入 TaskStore。

### 第三阶段：任务委托（Orchestrator 核心）

`src/core/orchestration/orchestrator.ts` 的 `delegateTaskWithSpawn` 依次执行 10 步：

```
① 检查委托深度（最多 2 层，防止无限递归）
② 解析 SpecialistConfig（角色系统提示词、模型等级）
③ 获取 Task 内容
④ 确定 ACP Provider（claude / opencode / codex）
⑤ 创建子 Agent 记录（parentId = ROUTA）
⑥ 构建委托 Prompt（任务内容 + 角色系统提示）
⑦ 更新 Task：status → IN_PROGRESS，assignedTo = 子 Agent ID
⑧ 派生真实 ACP 子进程（Claude Code / OpenCode）
⑨ 在 UI 侧栏注册子 Session
⑩ 发布 TASK_ASSIGNED 事件到 EventBus
```

### 第四阶段：子 Agent 执行

子 Agent（CRAFTER）通过 MCP 连接回 Routa，可调用 12 个协调工具：

| 工具                     | 作用                             |
| ------------------------ | -------------------------------- |
| `read_note`              | 读取 Spec，了解全局上下文        |
| `update_note`            | 更新任务进度笔记                 |
| `list_tasks`             | 查看分配给自己的任务             |
| `report_to_parent`       | 完成后向父 Agent 汇报            |
| `delegate_task_to_agent` | （ROUTA 专用）委托任务给子 Agent |
| `message_agent`          | 向其他 Agent 发消息              |

### 第五阶段：完成汇报与父 Agent 唤醒

```
CRAFTER 调用 report_to_parent({ summary, success: true })
        ↓
EventBus.emit(REPORT_SUBMITTED)
        ↓
Orchestrator.handleReportSubmitted()
  → Task.status = COMPLETED
  → Task.completionSummary = summary
  → Agent.status = COMPLETED
        ↓
wakeParent() → 发送唤醒 Prompt 给 ROUTA Session
        ↓
ROUTA 决定下一步：委托 GATE 验收 or 继续下个任务
```

**自动汇报兜底**：若子 Agent 完成后忘记调用 `report_to_parent`，Orchestrator 在 2 秒后自动触发 `autoReportIfNeeded`。

### 并行执行（`after_all` 模式）

多个 CRAFTER 并行执行，等全部完成后再唤醒 ROUTA：

```typescript
// 三个 CRAFTER 并行
delegate(task - A, CRAFTER - 1, (waitMode = "after_all"))
delegate(task - B, CRAFTER - 2, (waitMode = "after_all"))
delegate(task - C, CRAFTER - 3, (waitMode = "after_all"))
// → 内部创建 DelegationGroup，等待全部完成后唤醒 ROUTA
```

### EventBus — 协作的神经系统

`src/core/events/event-bus.ts` 支持三种高级订阅模式：

| 模式        | 说明                              |
| ----------- | --------------------------------- |
| `oneShot`   | 一次性订阅，事件到达后自动移除    |
| `priority`  | 优先级排序，高优先级先收到通知    |
| `waitGroup` | 等待组，所有 Agent 完成后触发回调 |

---

## 四、Claude Agent SDK 执行机制

### 两种执行路径

```
运行时环境
├── 本地 / Tauri 桌面  →  ClaudeCodeProcess（子进程，stream-json）
└── Serverless（Vercel）→  ClaudeCodeSdkAdapter（官方 SDK）
```

`AcpProcessManager` 用独立 Map 管理各类进程：

```typescript
private processes = new Map<string, ManagedProcess>()              // ACP 子进程
private claudeProcesses = new Map<string, ManagedClaudeProcess>()  // Claude Code 进程
private claudeCodeSdkAdapters = new Map<string, ...>()             // SDK 实例
private opencodeAdapters = new Map<string, ...>()                  // OpenCode 实例
```

### ClaudeCodeSdkAdapter 执行细节

`src/core/acp/claude-code-sdk-adapter.ts` 封装官方 SDK：

```typescript
const stream = query({
  prompt: text,
  options: {
    cwd: promptCwd, // 每个 Agent 独立工作目录
    model: "claude-sonnet-4-20250514",
    maxTurns: 30,
    permissionMode: "bypassPermissions", // 无需交互授权，自主运行
    pathToClaudeCodeExecutable: cliPath, // 显式指定 cli.js（Vercel 打包兼容）
    allowedTools: ["Skill", "Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    env: { CLAUDE_CONFIG_DIR: "/tmp/.claude" },
    // 多轮会话连续性
    ...(shouldContinue && { continue: true }),
    ...(sdkSessionId && { resume: sdkSessionId }),
    persistSession: true,
  },
})
```

**消息流转换**：SDK 的 `SDKMessage` 转换为 ACP `session/update` JSON-RPC 通知：

```
stream_event(text_delta)      →  agent_message_chunk   （实时文字流）
stream_event(thinking_delta)  →  agent_thought_chunk   （思维链流）
stream_event(tool_use start)  →  tool_call             （工具调用开始）
assistant(tool_use blocks)    →  tool_call_update      （工具调用完成）
result(error)                 →  error notification
```

### 多轮会话连续性

同一 Agent 跨多次 `prompt()` 调用保持上下文：

```typescript
// 第一次 prompt：创建新 Session，SDK 返回 sdkSessionId
this.sdkSessionId = systemMsg.session_id

// 父 Agent 被唤醒后再次 prompt：
queryOptions.continue = true
queryOptions.resume = this.sdkSessionId // 恢复完整历史上下文
```

### Serverless 文件系统补丁

`src/core/platform/serverless-fs-patch.ts` 在 SDK 导入前注入，拦截 `fs` 模块，将所有 `~/.claude/**` 写入重定向到 `/tmp/.claude/**`（Vercel Lambda 下 home 目录只读）：

```
/home/sbx_user1051/.claude/debug/uuid.txt
           ↓ monkey-patch 拦截
/tmp/.claude/debug/uuid.txt
           ↓ 若 /tmp 也失败
内存 Map 兜底（非关键日志）
```

---

## 五、Serverless 完整对话流程

> 以下以 Vercel 部署、`provider=claude-code-sdk`、用户发送一条消息为例，完整追踪每个模块的动作。

### 阶段 0：建立 SSE 长连接（客户端主动）

```
浏览器
  GET /api/acp?sessionId=xxx
  → route.ts GET handler
  → store.attachSse(sessionId, controller)  // 绑定 ReadableStream controller
  → store.flushPending(sessionId)           // 发送此前已缓冲的通知（若有）
  → setInterval(30s) → ": heartbeat\n\n"   // 维持连接，检测死连接
  ← 200 text/event-stream（长连接，持续开放）
```

### 阶段 1：创建 Session（`session/new`）

```
浏览器
  POST /api/acp { method: "session/new", params: { provider: "claude-code-sdk", cwd, role, workspaceId, idempotencyKey? } }
  → route.ts POST handler

  [1] 幂等性检查（idempotencyCache）
      → 已有相同 key → 直接返回缓存的 sessionId，终止

  [2] sessionId = uuidv4()

  [3] manager.createClaudeCodeSdkSession(sessionId, cwd, forwardSessionUpdate, instanceConfig)
        → AgentInstanceFactory.createClaudeCodeSdkAdapter()
            → 按 role/specialistId 解析模型层级（SMART/BALANCED/FAST → Opus/Sonnet/Haiku）
            → new ClaudeCodeSdkAdapter(cwd, onNotification, { model, baseUrl, apiKey })
        → adapter.connect()
            → 检查 ANTHROPIC_AUTH_TOKEN / ANTHROPIC_API_KEY
            → process.env.ANTHROPIC_API_KEY = effectiveApiKey  // 注入给 cli.js 子进程
            → process.env.CLAUDE_CONFIG_DIR = "/tmp/.claude"   // Vercel 只读文件系统规避
            → this.sessionId = "claude-sdk-{timestamp}"
            → this._alive = true
        → adapter.createSession()  // 仅设置内部标识，SDK 无需显式建 Session
        → claudeCodeSdkAdapters.set(sessionId, { adapter, acpSessionId, ... })

  [4] 若 role === "ROUTA"
        → initRoutaOrchestrator({ crafterProvider, gateProvider, cwd })
        → system.tools.createAgent({ role: AgentRole.ROUTA, workspaceId })
        → orchestrator.registerAgentSession(routaAgentId, sessionId)
        → 注册 notificationHandler / sessionRegistrationHandler

  [5] 若 specialistId 存在
        → PostgresSpecialistStore.get(specialistId)  // 查 DB
        → specialistSystemPrompt = specialist.systemPrompt + roleReminder

  [6] store.upsertSession({ sessionId, cwd, workspaceId, provider, role, ... })
        → 写入 HttpSessionStore.sessions（内存 Map）
        → 创建 AgentEventBridge（语义事件转换器）
        → 触发 maybeCleanup()（每 5 分钟清理过期 Session）

  [7] persistSessionToDb({ id: sessionId, ... })
        → 写入 Postgres acp_sessions 表（Serverless 重启后恢复用）

  [8] recordTrace(cwd, sessionStartTrace)  // 写 session_start 审计记录

  ← 返回 { sessionId, provider, role, routaAgentId }
```

### 阶段 2：用户发送消息（`session/prompt`）

```
浏览器
  POST /api/acp { method: "session/prompt", params: { sessionId, prompt: "...", skillName? } }
  → route.ts POST handler

  [1] 提取 promptText（支持 string | Array<{type,text}>）

  [2] 若 skillName 存在 → resolveSkillContent(skillName, cwd)  // 从 ~/.claude/skills/ 读取

  [3] Session 存在性检查（内存 + 异步查 Postgres）
      → 不存在 → 自动创建（走阶段 1 的 SDK 路径）

  [4] 若 ROUTA 角色且首次 prompt
      → buildCoordinatorPrompt({ agentId, workspaceId, userRequest: promptText })
          // 注入协调者系统提示 + 可用工具列表
      → store.markFirstPromptSent(sessionId)

  [5] 若自定义 Specialist 且首次 prompt
      → promptText = specialistSystemPrompt + "\n\n---\n\n" + promptText
      → store.markFirstPromptSent(sessionId)

  [6] store.pushUserMessage(sessionId, promptText)
      → 写入 messageHistory（内存）
      → ProviderAdapter.normalize() → TraceRecorder.recordFromUpdate()  // 记录 user_message trace

  [7] manager.isClaudeCodeSdkSessionAsync(sessionId)
      → 内存有 → 直接返回 true
      → 内存无（冷启动） → 查 Postgres acp_sessions

  [8] adapter = manager.getOrRecreateClaudeCodeSdkAdapter(sessionId, forwardSessionUpdate)
      → 内存有 adapter → 直接返回
      → 内存无（冷启动）：
          → 查 Postgres → 恢复到 HttpSessionStore
          → new ClaudeCodeSdkAdapter(cwd, onNotification) → adapter.connect()
          → claudeCodeSdkAdapters.set(sessionId, ...)

  [9] store.enterStreamingMode(sessionId)
      → streamingSessionIds.add(sessionId)  // 关键！防止 SSE 重复推送

  [10] ReadableStream + adapter.promptStream(promptText, sessionId, skillContent)
       ← 立即返回 Response(stream, { Content-Type: text/event-stream })
       // 接下来进入阶段 3（流式并发）
```

### 阶段 3：SDK 流式执行（与 HTTP 响应体并发）

```
adapter.promptStream()（AsyncGenerator）

  [1] this.abortController = new AbortController()
      this._hasSeenStreamTextDelta = false
      shouldContinue = !_isFirstPrompt && sdkSessionId !== null

  [2] 构建 queryOptions：
      {
        cwd, model, maxTurns: 30,
        permissionMode: "bypassPermissions",
        allowDangerouslySkipPermissions: true,
        pathToClaudeCodeExecutable: "/var/task/node_modules/.../cli.js",
        settingSources: ["user", "project"],
        allowedTools: ["Skill","Read","Write","Edit","Bash","Glob","Grep"],
        env: { CLAUDE_CONFIG_DIR: "/tmp/.claude" },
        persistSession: true,
        ...(shouldContinue && { continue: true, resume: sdkSessionId }),
        ...(skillContent && { systemPrompt: { type:"preset", preset:"claude_code", append: skillContent } }),
      }

  [3] stream = query({ prompt: text, options: queryOptions })
      → SDK 内部 spawn cli.js 子进程（JSONL 通信）

  [4] for await (const msg of stream):

      msg.type === "system"
        → 捕获 sdkSessionId（首次）

      msg.type === "stream_event" (text_delta)
        → notification = { method:"session/update", params:{ sessionUpdate:"agent_message_chunk", content:{text} } }
        → onNotification(notification)  // = forwardSessionUpdate
             → store.pushNotification(notification)
                  ① 写入 messageHistory
                  ② ProviderAdapter.normalize() → TraceRecorder  // 追加文本到缓冲区
                  ③ AgentEventBridge.process() → dispatchAgentEvent()
                  ④ updateBackgroundTaskProgress()  // 若是后台任务
                  ⑤ streamingSessionIds.has(sessionId) → true → 跳过 SSE controller push！
        → yield `data: ${JSON.stringify(notification)}\n\n`
             → route ReadableStream controller.enqueue() → 写入 HTTP 响应体 → 浏览器实时收到

      msg.type === "stream_event" (thinking_delta)
        → 同上，sessionUpdate = "agent_thought_chunk"

      msg.type === "stream_event" (content_block_start, tool_use)
        → sessionUpdate = "tool_call"（工具调用开始）

      msg.type === "assistant" (tool_use block)
        → detectAgentRenameFromMessage()  // 检测 set_agent_name
        → sessionUpdate = "tool_call_update"（工具调用完成）

      msg.type === "result"
        → 记录 stopReason / usage（inputTokens / outputTokens）

  [5] 流结束
      _isFirstPrompt = false
      yield turn_complete 事件（含 stopReason + usage）

  [6] route 的 ReadableStream.start() 收到 generator 返回：
      store.flushAgentBuffer(sessionId)       // 将缓冲的文本写成 trace 记录
      store.exitStreamingMode(sessionId)      // streamingSessionIds.delete(sessionId)
      saveHistoryToDb(sessionId, store.getConsolidatedHistory(sessionId))
          → consolidateMessageHistory()       // 合并数百个 chunk → 单条 agent_message
          → PgAcpSessionStore.saveHistory()   // 持久化到 Postgres
      controller.close()                      // HTTP 响应结束
```

### 双通道数据流对比

| 通道               | 激活条件              | 内容                  | 用途                    |
| ------------------ | --------------------- | --------------------- | ----------------------- |
| HTTP 响应体（SSE） | `session/prompt` 期间 | 每条 SDK 事件         | 本次 prompt 的实时流    |
| SSE GET 长连接     | streaming 模式结束后  | 后续非 streaming 事件 | 后台任务、子 Agent 通知 |

两通道通过 `streamingSessionIds` Set 互斥——streaming 期间 `pushNotification()` 跳过 SSE GET 推送，避免浏览器收到重复事件。

### 冷启动恢复流程（Serverless 重启）

```
新请求到达，sessionId 对应的 adapter 不在内存
  → manager.getOrRecreateClaudeCodeSdkAdapter()
  → getHttpSessionStore().getSession(sessionId) → undefined（内存已清）
  → getPostgresDatabase() → PgAcpSessionStore.get(sessionId)
  → 找到记录（provider="claude-code-sdk", cwd=...）
  → store.upsertSession(dbSession)  // 恢复到内存
  → new ClaudeCodeSdkAdapter(cwd, onNotification)
  → adapter.connect()               // 重新验证 API key
  → adapter._isFirstPrompt = true   // 新实例，下次 prompt 不会 continue
  → claudeCodeSdkAdapters.set(sessionId, ...)
  → 继续处理 prompt（历史上下文由 SDK 的 persistSession 机制保持）
```

---

## 六、任务间隔离机制

隔离发生在五个层次：

### 层 1：进程级隔离

每个子 Agent 是独立进程（或 SDK 实例），互不共享内存：

```
ROUTA   → claudeProcesses["session-001"] (pid=1234)
CRAFTER → claudeProcesses["session-002"] (pid=1235)
GATE    → claudeProcesses["session-003"] (pid=1236)
```

### 层 2：工作目录（cwd）隔离

Orchestrator 委托时为每个子 Agent 传入独立 `cwd`，决定文件操作范围：

```typescript
await this.spawnChildAgent(childSessionId, agentId, provider, cwd, ...)
// → query({ options: { cwd: promptCwd } })
```

### 层 3：三层会话 ID 隔离

```
routaAgentId   → 业务层 Agent 记录（存数据库）
sessionId      → AcpProcessManager 的 Map Key（进程索引）
sdkSessionId   → Claude SDK 内部 ID（用于 resume 多轮会话）
```

子 Agent 的通知定向转发给父 Session，不广播：

```typescript
this.notificationHandler(parentSessionId, {
  ...params,
  childAgentId: agentId, // 标注来源
  childSessionId: sessionId,
})
```

### 层 4：MCP URL 参数隔离

子 Agent 的 MCP URL 携带 `wsId` 和 `sid`，确保工具调用作用域正确：

```
http://localhost:3000/api/mcp?wsId={workspaceId}&sid={parentSessionId}
```

每个子 Agent 的 MCP URL 不同，服务端据此路由到正确的 Session 和 Workspace。

### 层 5：委托深度限制

Orchestrator 在每次委托前检查深度，最多 2 层，防止无限递归委托：

```typescript
const depthCheck = await checkDelegationDepth(this.system.agentStore, callerAgentId)
if (!depthCheck.allowed) {
  return errorResult(depthCheck.error!)
}
```

---

## 六、完整协作流程图

```
用户
 │ 发起请求
 ▼
ROUTA ACP Session
 │ 写 Spec Note (id="spec")
 │ 解析 @@@task 块 → Task[]
 │ 调用 MCP 工具: delegate_task_to_agent
 ▼
Orchestrator.delegateTaskWithSpawn()
 │ 创建 Agent 记录 (role=CRAFTER, parentId=ROUTA)
 │ Task.status → IN_PROGRESS
 │ 派生 ACP 子进程（Claude Code / OpenCode）
 │ MCP URL = /api/mcp?wsId=X&sid=parentSession
 ▼
CRAFTER ACP Session（独立进程）
 │ 读 Spec Note → 理解全局上下文
 │ 执行编码工作（Bash/Edit/Write...）
 │ 调用 MCP 工具: report_to_parent
 ▼
EventBus.emit(REPORT_SUBMITTED)
 │
Orchestrator.handleReportSubmitted()
 │ Task.status → COMPLETED
 │ Agent.status → COMPLETED
 │ wakeParent() → 发 Prompt 给 ROUTA Session
 ▼
ROUTA 收到汇报
 │ 委托 GATE 验收
 ▼
GATE ACP Session（独立进程）
 │ 读 Task.acceptanceCriteria
 │ 执行 Task.verificationCommands
 │ 写入 verificationVerdict (APPROVED / NOT_APPROVED)
 │ report_to_parent
 ▼
ROUTA 收到最终结果 → 告知用户
```

---

## 七、部署说明

### 部署形态总览

```
构建目标
├── Vercel Serverless   默认 next build，DATABASE_URL → Neon Postgres
├── Docker 容器         STANDALONE + esbuild，默认 SQLite，可切 Postgres
└── Tauri 桌面应用      STATIC export + 内嵌 Node.js 服务器 + SQLite
```

---

### 一、Vercel 部署（推荐）

#### 1. 数据库准备（Neon Serverless Postgres）

在 [neon.tech](https://neon.tech) 创建项目，获取 `DATABASE_URL`，格式为：

```
postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

执行数据库迁移：

```bash
DATABASE_URL=<your-url> npm run db:migrate
```

#### 2. 环境变量配置（Vercel Dashboard → Settings → Environment Variables）

| 变量                    | 必须 | 说明                                         |
| ----------------------- | ---- | -------------------------------------------- |
| `DATABASE_URL`          | 是   | Neon Postgres 连接串                         |
| `ANTHROPIC_AUTH_TOKEN`  | 是   | Claude Code SDK 认证 Token                   |
| `ANTHROPIC_BASE_URL`    | 否   | 自定义 API 端点（如智谱 GLM）                |
| `ANTHROPIC_MODEL`       | 否   | 默认模型（如 `GLM-4.7`）                     |
| `API_TIMEOUT_MS`        | 否   | 请求超时，默认 55000（低于 Vercel 60s 限制） |
| `CLAUDE_CONFIG_DIR`     | 否   | 自动设为 `/tmp/.claude`，可不填              |
| `GITHUB_TOKEN`          | 否   | GitHub 集成功能                              |
| `GITHUB_WEBHOOK_SECRET` | 否   | Webhook 验签                                 |

#### 3. 关键构建配置（vercel.json）

```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build",
  "crons": [{ "path": "/api/schedules/tick", "schedule": "* * * * *" }]
}
```

- `--legacy-peer-deps`：解决 MCP/ACP SDK 间的 peer dependency 冲突
- Cron Job：每分钟调用 `/api/schedules/tick`，驱动定时任务和 GitHub 轮询

#### 4. cli.js 强制包含（next.config.ts）

Vercel file-tracing 无法自动发现动态加载的 `cli.js`，配置强制包含：

```typescript
outputFileTracingIncludes: {
  "/api/**": [
    "./node_modules/@anthropic-ai/claude-agent-sdk/**/*",
    "./.claude/skills/**/*",
    ".agents/skills/**/*",
  ],
},
```

#### 5. 部署流程

```bash
# 方式 A：连接 GitHub 仓库，Vercel 自动部署
# 方式 B：手动部署
npm i -g vercel
vercel --prod
```

---

### 二、Docker 部署

#### 1. 默认模式（SQLite，零依赖）

```bash
docker compose up -d
# 访问 http://localhost:3000
# 数据持久化到 ./data/routa.db
```

容器默认环境变量：

```
ROUTA_DB_DRIVER=sqlite
NODE_ENV=production
PORT=3000
```

#### 2. Postgres 模式

```bash
docker compose --profile postgres up -d
```

会额外启动 PostgreSQL 16 容器（端口 5432），并自动配置 `DATABASE_URL`。

#### 3. 三阶段构建原理

```
阶段 1 deps:    node:22-alpine + apk add python3/make/g++ + npm ci
阶段 2 builder: ROUTA_DESKTOP_STANDALONE=1 next build
                → node scripts/build-docker.mjs
                   ① esbuild 编译 sqlite.ts / sqlite-stores.ts / sqlite-schema.ts → CJS
                   ② 复制 better-sqlite3 原生 .node 插件及依赖
阶段 3 runner:  最小镜像，EXPOSE 3000，健康检查 /api/health
```

#### 4. 自定义环境变量

```bash
# docker-compose.yml 或 .env 文件
ANTHROPIC_AUTH_TOKEN=your-token
ANTHROPIC_MODEL=claude-sonnet-4-20250514
DATABASE_URL=postgresql://...   # 可选，不填则用 SQLite
```

---

### 三、Tauri 桌面应用部署

#### 1. 本地构建

```bash
# 安装 Rust 工具链
rustup target add aarch64-apple-darwin   # macOS ARM

# 开发模式（同时启动 Next.js dev server）
cd apps/desktop && npm run tauri dev

# 生产构建
npm run tauri build
```

#### 2. 构建流程

```
node scripts/prepare-frontend.mjs
  ① ROUTA_BUILD_STATIC=1  → 临时移走 src/app/api/（纯前端构建）
  ② next build (output: export) → out/
  ③ 恢复 src/app/api/
  ④ 复制 out/ → apps/desktop/src-tauri/frontend/
        ↓
ROUTA_DESKTOP_SERVER_BUILD=1 + ROUTA_DESKTOP_STANDALONE=1
  → 独立 Node.js 服务器构建到 .next-desktop/standalone/
  → esbuild 编译 SQLite 模块 → chunks/db/
  → 复制 better-sqlite3 .node 插件
  → 整体打包到 apps/desktop/src-tauri/bundled/desktop-server/
        ↓
Tauri 打包
  → macOS: .dmg / .app
  → Linux: .deb / .AppImage
  → Windows: .msi / .exe
```

#### 3. CI 自动构建（GitHub Actions）

推送 `v*` 标签触发四平台矩阵构建：

| 平台           | 架构  | 产物                 |
| -------------- | ----- | -------------------- |
| macOS latest   | arm64 | `.dmg` / `.app`      |
| macOS latest   | x64   | `.dmg` / `.app`      |
| Ubuntu 22.04   | x64   | `.deb` / `.AppImage` |
| Windows latest | x64   | `.msi` / `.exe`      |

```bash
git tag v0.3.0 && git push origin v0.3.0
# → 自动触发 tauri-release.yml → 创建 GitHub Release Draft
```

---

### 四、Rust 后端模式（可选）

当需要替换 Next.js API Routes 时，可启用 Rust 后端（Axum）：

```bash
# 启动 Rust 服务器
cargo run -p routa-cli -- server  # 监听 :3210

# 配置 Next.js 代理到 Rust
ROUTA_RUST_BACKEND_URL=http://localhost:3210 npm run dev
```

`next.config.ts` 的 `beforeFiles` 重写规则会将所有 `/api/*` 请求转发到 Rust，完全跳过 Next.js API Routes。

---

### 五、数据库迁移命令速查

```bash
# Postgres
npm run db:generate          # 生成迁移文件
npm run db:migrate           # 执行迁移
npm run db:push              # 直接推送 schema（跳过迁移文件）
npm run db:push:ci           # CI 模式（--strict=false）
npm run db:studio            # 打开 Drizzle Studio 可视化

# SQLite
npm run db:sqlite:generate   # 生成 SQLite 迁移文件
npm run db:sqlite:push       # 推送 SQLite schema
```

---

## 八、关键文件索引

| 文件                                           | 说明                                               |
| ---------------------------------------------- | -------------------------------------------------- |
| `src/core/routa-system.ts`                     | 系统入口，选择存储引擎（InMemory/Postgres/SQLite） |
| `src/core/orchestration/orchestrator.ts`       | 多 Agent 编排核心，`delegateTaskWithSpawn`         |
| `src/core/orchestration/task-block-parser.ts`  | `@@@task` 块解析器                                 |
| `src/core/orchestration/specialist-prompts.ts` | 各角色系统提示词                                   |
| `src/core/events/event-bus.ts`                 | 事件总线（oneShot/priority/waitGroup）             |
| `src/core/acp/acp-process-manager.ts`          | 多类型 Agent 进程管理器                            |
| `src/core/acp/claude-code-sdk-adapter.ts`      | Claude Agent SDK 封装（Serverless）                |
| `src/core/acp/claude-code-process.ts`          | Claude Code 子进程（本地）                         |
| `src/core/platform/serverless-fs-patch.ts`     | Vercel 文件系统补丁                                |
| `src/core/tools/agent-tools.ts`                | 12 个 MCP 协调工具实现                             |
| `src/core/db/schema.ts`                        | Postgres 完整表结构（Drizzle ORM）                 |
| `src/core/db/sqlite-schema.ts`                 | SQLite 表结构（桌面端）                            |
| `src/core/models/`                             | 领域模型定义（Agent/Task/Note/Workspace 等）       |
