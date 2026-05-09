---
created: 2025-12-11 10:33
source: https://code.claude.com/docs/en/hooks
tags:
  - agent
  - claude-code
title: Claude Code
description: Claude Code 使用指南，涵盖 CLAUDE.md 配置、settings.json 自定义、权限跳过、Skill 加载限制与 Hooks 事件驱动自动化。
---

## claude.md

1. WHAT：项目结构、技术栈
2. WHY：项目目的、各模块作用
3. HOW：如何运行、测试、验证

## 自定义配置

```json
# 编辑或新增 `settings.json` 文件
# MacOS & Linux 为 `~/.claude/settings.json`
# Windows 为`用户目录/.claude/settings.json`
# 新增或修改里面的 env 字段
# 注意替换里面的 `your_zhipu_api_key` 为您上一步获取到的 API Key
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
  }
}
# 再编辑或新增 `.claude.json` 文件
# MacOS & Linux 为 `~/.claude.json`
# Windows 为`用户目录/.claude.json`
# 新增 `hasCompletedOnboarding` 参数
{
  "hasCompletedOnboarding": true
}
```

- GLM + Claude Code https://docs.bigmodel.cn/cn/guide/develop/claude

## 常用权限跳过配置

```
{
  "permissions": {
    "allow": [
      "Bash(date:*)",
      "Bash(echo:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(wc:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(sort:*)",
      "Bash(grep:*)",
      "Bash(tr:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git tag:*)"
      "Bash(mvn:*)"
    ]
  }
}
```

## skill 加载限制

```json
// .claude/settings.json（项目级）或 ~/.claude/settings.json（全局）
{
  "skillOverrides": {
    "legacy-context": "name-only", // 只显示名称，不自动加载内容
    "deploy": "off", // 完全禁用
    "pdf": "user-invocable-only" // 只能手动 /pdf 调用，不自动触发
  }
}
```

分层设置

```
~/.claude/settings.json          ← 全局：关掉不属于当前工作流的 global skills
.claude/settings.json            ← 项目共享：项目级 skill 的开关，提交到 git
.claude/settings.local.json      ← 个人覆盖：本机特有的关闭项，gitignore
```

## 禁用 ai commit

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

## Hooks

钩子允许在 Claude Code 特定事件发生时自动执行 shell 命令，实现自动化工作流。

| 钩子事件            | 触发时机        | 常用场景               |
| ------------------- | --------------- | ---------------------- |
| `SessionStart`      | 新会话开始      | 初始化环境、加载配置   |
| `SessionEnd`        | 会话结束        | 清理资源、生成报告     |
| `PreToolUse`        | 工具执行前      | 验证、修改工具输入     |
| `PostToolUse`       | 工具执行后      | 日志记录、触发后续操作 |
| `UserPromptSubmit`  | 用户提交提示后  | 添加上下文、权限检查   |
| `PermissionRequest` | 请求权限时      | 自动审批/拒绝权限      |
| `PreCompact`        | 对话压缩前      | 保存重要信息           |
| `SubagentStart`     | 子代理启动      | 监控、日志             |
| `SubagentStop`      | 子代理停止      | 收集结果               |
| `Stop`              | Claude 停止工作 | 通知、清理             |
| `Notification`      | 通知事件        | 自定义通知处理         |

### Config demo

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here"
          }
        ]
      }
    ]
  }
}
```

### 例子：代码提交前自动格式化

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "bash -c 'if echo \"$CLAUDE_TOOL_INPUT\" | grep -q \"git commit\"; then cd $CLAUDE_PROJECT_DIR && npm run format; fi'"
      }
    ]
  }
}
```

### 钩子命令可通过环境变量访问上下文

```
$CLAUDE_PROJECT_DIR    # 项目目录
$CLAUDE_FILE_PATH      # 当前操作的文件路径
$CLAUDE_TOOL_INPUT     # 工具输入参数 (JSON)
$CLAUDE_TOOL_OUTPUT    # 工具输出结果 (JSON)
```
