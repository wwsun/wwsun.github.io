---
title: Rout
tags:
  - github
  - agent
draft: false
description: Routa 是一个面向 AI 开发的多智能体编排平台，让多个 AI Agent 协作完成复杂的开发任务。
source: https://github.com/phodal/routa
---
## 一、项目定位

Routa 是一个**多智能体协调平台**，核心思路是：不再由单个 AI 处理所有事情，而是将开发任务分解给专业角色团队协作完成。

**多协议架构：**

| 协议 | 路径 | 职责 |
|------|------|------|
| MCP (Model Context Protocol) | `/api/mcp` | Agent 协作工具，SSE 传输 |
| ACP (Agent Client Protocol) | `/api/acp` | 派生和管理 Agent 进程 |
| A2A (Agent-to-Agent Protocol) | `/api/a2a` | 跨平台 Agent 联邦通信 |

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
  id: string;
  title: string;
  status: "active" | "archived";
  metadata: Record<string, string>;
}
```

所有其他实体（Agent、Task、Note、Codebase）都归属于某个 Workspace。

### Agent（智能体）— 执行单元

```typescript
enum AgentRole {
  ROUTA    = "ROUTA",     // 协调者：规划、拆分、委托
  CRAFTER  = "CRAFTER",   // 实现者：写代码、做修改
  GATE     = "GATE",      // 验证者：审查、验收
  DEVELOPER = "DEVELOPER" // 独行侠：独立完成全流程
}

enum ModelTier {
  SMART    = "SMART",    // Opus 级别
  BALANCED = "BALANCED", // Sonnet 级别
  FAST     = "FAST",     // Haiku 级别
}

interface Agent {
  id: string;
  role: AgentRole;
  modelTier: ModelTier;
  workspaceId: string;
  parentId?: string;    // 支持父子树形结构
  status: AgentStatus;
}
```

`parentId` 构建 Agent 树：ROUTA 是父节点，CRAFTER/GATE 是子节点。

### Task（任务）— 工作单元

```typescript
interface Task {
  id: string;
  title: string;
  objective: string;
  scope?: string;
  acceptanceCriteria?: string[];      // 验收标准
  verificationCommands?: string[];    // 验证命令
  assignedTo?: string;                // 分配给哪个 Agent
  status: TaskStatus;
  dependencies: string[];             // 依赖的 Task ID（DAG）
  parallelGroup?: string;             // 并行执行组
  verificationVerdict?: VerificationVerdict; // GATE 的审查结论
}
```

关键设计：
- `dependencies + parallelGroup` — 支持 DAG 依赖图和并行执行
- `acceptanceCriteria + verificationCommands` — 明确定义"完成"标准，供 GATE 验收

### Note（笔记）— 共享上下文

```typescript
type NoteType = "spec" | "task" | "general"

interface Note {
  id: string;       // spec Note 固定为 "spec"
  type: NoteType;
  content: string;
  workspaceId: string;
  linkedTaskId?: string;   // task Note 关联 Task ID
}
```

三种类型各有用途：

| 类型 | 用途 |
|------|------|
| `spec` | **规划 Spec**，整个 Session 的意图来源，ID 固定为 `"spec"` |
| `task` | 由 `@@@task` 块解析生成的结构化任务描述 |
| `general` | 自由格式的上下文共享文档 |

### BackgroundTask — 异步执行队列

与 `Task` 不同，BackgroundTask 是**执行层概念**，代表一次真实的 ACP Session 启动：

```typescript
interface BackgroundTask {
  id: string;
  prompt: string;
  agentId: string;         // ACP Provider（claude/opencode）
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  triggerSource: "manual" | "schedule" | "webhook" | "polling" | "workflow";
  priority: "HIGH" | "NORMAL" | "LOW";
  // 进度追踪
  toolCallCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  currentActivity?: string;
  // 工作流编排
  workflowRunId?: string;
  dependsOnTaskIds?: string[];
  taskOutput?: string;     // 链式传递给下一个任务
}
```

**Task vs BackgroundTask：**
- `Task` — ROUTA 分配给 CRAFTER/GATE 的编排层工作单元
- `BackgroundTask` — 真实启动 ACP Session 的执行层任务，与用户 Browser Session 解耦

---

## 三、领域模型协作流程

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

| 工具 | 作用 |
|------|------|
| `read_note` | 读取 Spec，了解全局上下文 |
| `update_note` | 更新任务进度笔记 |
| `list_tasks` | 查看分配给自己的任务 |
| `report_to_parent` | 完成后向父 Agent 汇报 |
| `delegate_task_to_agent` | （ROUTA 专用）委托任务给子 Agent |
| `message_agent` | 向其他 Agent 发消息 |

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
delegate(task-A, CRAFTER-1, waitMode="after_all")
delegate(task-B, CRAFTER-2, waitMode="after_all")
delegate(task-C, CRAFTER-3, waitMode="after_all")
// → 内部创建 DelegationGroup，等待全部完成后唤醒 ROUTA
```

### EventBus — 协作的神经系统

`src/core/events/event-bus.ts` 支持三种高级订阅模式：

| 模式 | 说明 |
|------|------|
| `oneShot` | 一次性订阅，事件到达后自动移除 |
| `priority` | 优先级排序，高优先级先收到通知 |
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
        cwd: promptCwd,                         // 每个 Agent 独立工作目录
        model: "claude-sonnet-4-20250514",
        maxTurns: 30,
        permissionMode: "bypassPermissions",    // 无需交互授权，自主运行
        pathToClaudeCodeExecutable: cliPath,    // 显式指定 cli.js（Vercel 打包兼容）
        allowedTools: ["Skill", "Read", "Write", "Edit", "Bash", "Glob", "Grep"],
        env: { CLAUDE_CONFIG_DIR: "/tmp/.claude" },
        // 多轮会话连续性
        ...(shouldContinue && { continue: true }),
        ...(sdkSessionId && { resume: sdkSessionId }),
        persistSession: true,
    }
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
queryOptions.resume = this.sdkSessionId   // 恢复完整历史上下文
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

## 五、任务间隔离机制

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
    childAgentId: agentId,    // 标注来源
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

## 七、关键文件索引

| 文件 | 说明 |
|------|------|
| `src/core/routa-system.ts` | 系统入口，选择存储引擎（InMemory/Postgres/SQLite） |
| `src/core/orchestration/orchestrator.ts` | 多 Agent 编排核心，`delegateTaskWithSpawn` |
| `src/core/orchestration/task-block-parser.ts` | `@@@task` 块解析器 |
| `src/core/orchestration/specialist-prompts.ts` | 各角色系统提示词 |
| `src/core/events/event-bus.ts` | 事件总线（oneShot/priority/waitGroup） |
| `src/core/acp/acp-process-manager.ts` | 多类型 Agent 进程管理器 |
| `src/core/acp/claude-code-sdk-adapter.ts` | Claude Agent SDK 封装（Serverless） |
| `src/core/acp/claude-code-process.ts` | Claude Code 子进程（本地） |
| `src/core/platform/serverless-fs-patch.ts` | Vercel 文件系统补丁 |
| `src/core/tools/agent-tools.ts` | 12 个 MCP 协调工具实现 |
| `src/core/db/schema.ts` | Postgres 完整表结构（Drizzle ORM） |
| `src/core/db/sqlite-schema.ts` | SQLite 表结构（桌面端） |
| `src/core/models/` | 领域模型定义（Agent/Task/Note/Workspace 等） |
