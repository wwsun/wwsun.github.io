---
title: SKILL.md Frontmatter 完整字段
tags:
  - skills
description: SKILL.md Frontmatter 完整字段
source: https://code.claude.com/docs/en/skills
---

## 基础字段

**`name`**（可选）
显示在 skill 列表中的名称，不影响调用命令。命令名来自目录名，只有 plugin root SKILL.md 例外。建议显式设置，避免依赖目录名 fallback。

**`description`**（强烈推荐）
Claude 自动触发 skill 的核心依据。Put the key use case first——每个 skill 的 `description` + `when_to_use` 合并文本在 skill 列表中最多截断至 1536 字符，所以重点词要靠前。

**`when_to_use`**（可选）
补充触发场景，比如触发短语或示例请求。追加到 `description` 后面，共享 1536 字符上限。

**`argument-hint`**（可选）
autocomplete 提示，比如 `[issue-number]` 或 `[filename] [format]`。

**`arguments`**（可选）
声明具名参数，支持 `$name` 占位符替换。用空格分隔或 YAML list。

---

## 调用控制

**`disable-model-invocation: true`**
只有你能通过 `/skill-name` 触发，Claude 不会自动加载。同时也阻止该 skill 被预加载到 subagent 中。

**`user-invocable: false`**
只有 Claude 能自动触发，不出现在 `/` 菜单中。适合背景知识类 skill。

> ⚠️ `disable-model-invocation: true` + `user-invocable: false` 同时设置 = 完全不可达的 skill，小心别搬石头砸脚。

---

## 工具权限

**`allowed-tools`**（可选）
Skill 激活期间 Claude 可免提示使用的工具。接受空格/逗号分隔的字符串或 YAML list。注意：这只是预批准，不是限制——其他工具仍然可调用。

```yaml
allowed-tools: Bash(git add *) Bash(git commit *) Read
```

**`disallowed-tools`**（可选）
Skill 激活期间从 Claude 可用工具池中移除的工具。限制在你发下一条消息时自动解除。适合用于自动化循环中禁止 `AskUserQuestion` 等。

---

## 模型与性能

**`model`**（可选）
Skill 激活时使用的模型。覆盖仅在本轮有效，不保存到设置中；下次你发消息后恢复会话模型。接受与 `/model` 相同的值，或 `inherit` 保持当前模型。

**`effort`**（可选）
Skill 激活时的 effort 级别，覆盖会话 effort 设置。选项：`low`、`medium`、`high`、`xhigh`、`max`；可用级别取决于模型。

---

## 执行上下文

**`context: fork`**（可选）
在 forked subagent 中隔离运行 skill，不携带当前对话历史。适合内容复杂、不想污染主 context 的场景。

**`agent`**（可选）
配合 `context: fork` 使用，指定用哪个 subagent 类型。内置选项：`Explore`、`Plan`、`general-purpose`，或 `.claude/agents/` 中的自定义 agent。

**`paths`**（可选）
Glob patterns，限制 skill 何时被自动激活。只有在处理匹配 pattern 的文件时，Claude 才会自动加载该 skill。适合 monorepo 中只在特定子包生效的 skill。

**`shell`**（可选）
`` !`command` `` 动态注入使用的 shell，默认 `bash`，可选 `powershell`（Windows，需设 `CLAUDE_CODE_USE_POWERSHELL_TOOL=1`）。

---

## 生命周期钩子

**`hooks`**（可选）
绑定到该 skill 生命周期的 hooks，格式与 hooks 配置文件相同。

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./validate.sh"
```

---

## 元数据（社区约定）

以下字段官方不解析，但在 skill 分享生态（如 tonsofskills.com）中有共识：

```yaml
version: 1.0.0
author: Your Name <you@example.com>
license: MIT
compatible-with: claude-code
tags: [git, workflow]
```

---

## 一张速查表

| 字段                       | 用途               |
| -------------------------- | ------------------ |
| `name`                     | 列表显示名称       |
| `description`              | 触发依据（最重要） |
| `when_to_use`              | 补充触发场景       |
| `argument-hint`            | autocomplete 提示  |
| `arguments`                | 具名参数声明       |
| `disable-model-invocation` | 仅手动调用         |
| `user-invocable`           | 隐藏 `/` 菜单      |
| `allowed-tools`            | 预批准工具         |
| `disallowed-tools`         | 临时禁用工具       |
| `model`                    | 覆盖使用模型       |
| `effort`                   | 覆盖推理强度       |
| `context`                  | `fork` 隔离运行    |
| `agent`                    | subagent 类型      |
| `paths`                    | 路径限定触发       |
| `shell`                    | 动态注入 shell     |
| `hooks`                    | skill 级别钩子     |
