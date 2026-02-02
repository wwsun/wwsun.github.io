---
created: 2025-12-11 10:33
url: https://code.claude.com/docs/en/hooks
tags:
  - claude-code
  - agent
---
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

## Hooks

钩子允许在 Claude Code 特定事件发生时自动执行 shell 命令，实现自动化工作流。

|钩子事件|触发时机|常用场景|
|---|---|---|
|`SessionStart`|新会话开始|初始化环境、加载配置|
|`SessionEnd`|会话结束|清理资源、生成报告|
|`PreToolUse`|工具执行前|验证、修改工具输入|
|`PostToolUse`|工具执行后|日志记录、触发后续操作|
|`UserPromptSubmit`|用户提交提示后|添加上下文、权限检查|
|`PermissionRequest`|请求权限时|自动审批/拒绝权限|
|`PreCompact`|对话压缩前|保存重要信息|
|`SubagentStart`|子代理启动|监控、日志|
|`SubagentStop`|子代理停止|收集结果|
|`Stop`|Claude 停止工作|通知、清理|
|`Notification`|通知事件|自定义通知处理|

## Config demo

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

## 例子：代码提交前自动格式化

```json
{  
  "hooks": {  
    "PreToolUse": [  
      {  
        "matcher": "Bash",  
        "command": "bash -c 'if echo \"$CLAUDE_TOOL_INPUT\" | grep -q \"git commit\"; then cd $CLAUDE_PROJECT_DIR && npm run format; fi'"  
      }  
    ]  
  }  
}
```

## 钩子命令可通过环境变量访问上下文

```
$CLAUDE_PROJECT_DIR    # 项目目录  
$CLAUDE_FILE_PATH      # 当前操作的文件路径  
$CLAUDE_TOOL_INPUT     # 工具输入参数 (JSON)  
$CLAUDE_TOOL_OUTPUT    # 工具输出结果 (JSON)
```

