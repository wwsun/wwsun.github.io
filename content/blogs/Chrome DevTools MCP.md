---
title: Chrome DevTools MCP
tags:
  - chrome
  - mcp
draft: false
description: 未命名
source: https://github.com/ChromeDevTools/chrome-devtools-mcp
---
编码代理面临一个根本性问题：它们无法看到自己生成的代码在浏览器中运行时实际执行的操作。他们实际上是在蒙着眼睛编程。

Chrome 开发者工具 MCP 服务器改变了这种情况。AI 编码助理可以直接在 Chrome 中调试网页，并受益于开发者工具的调试功能和性能洞见。这有助于他们更准确地识别和修复问题。

[Model Context Protocol (MCP)](https://www.anthropic.com/news/model-context-protocol) 是一种开放源代码标准，用于将大语言模型 (LLM) 连接到外部工具和数据源。Chrome 开发者工具 MCP 服务器可为 AI 代理添加调试功能。

例如，Chrome DevTools MCP 服务器提供了一种名为 `performance_start_trace` 的工具。当需要调查网站的性能时，LLM 可以使用此工具启动 Chrome、打开您的网站，并使用 Chrome 开发者工具记录性能轨迹。然后，LLM 可以分析性能轨迹，以提出潜在的改进建议。借助 MCP 协议，Chrome 开发者工具 MCP 服务器可以为您的编码代理带来新的调试功能，使其能够更好地构建网站。

如果您想详细了解 MCP 的运作方式，请参阅 [MCP 文档](https://modelcontextprotocol.io/docs/getting-started/intro) 。

## 可以使用它做什么？

以下是一些示例提示，您可以在自己选择的 AI 助理（例如 Gemini CLI）中试用。

### 实时验证代码变更

使用 AI 代理生成修复，然后使用 Chrome 开发者工具 MCP 自动验证解决方案是否按预期运行。

建议尝试的提示：

```
Verify in the browser that your change works as expected.
```

### 诊断网络和控制台错误

让您的代理能够分析网络请求以发现 CORS 问题，或检查控制台日志以了解某项功能未按预期运行的原因。

建议尝试的提示：

```
A few images on localhost:8080 are not loading. What's happening?
```

### 模拟用户行为

导航、填写表单和点击按钮，以重现 bug 并测试复杂的用户流程，同时检查运行时环境。

建议尝试的提示：

```
Why does submitting the form fail after entering an email address?
```

### 调试实时样式和布局问题

让 AI 代理连接到实时网页，检查 DOM 和 CSS，并根据浏览器中的实时数据获取具体建议，以解决复杂的布局问题，例如元素溢出。

建议尝试的提示：

```
The page on localhost:8080 looks strange and off. Check what's happening there.
```

### 自动执行性能审核

指示 AI 代理运行性能轨迹，分析结果，并调查特定的性能问题，例如 LCP 数值过高。

建议尝试的提示：

```
Localhost:8080 is loading slowly. Make it load faster.
```

如需查看所有可用工具的列表，请参阅我们的 [工具参考文档](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md) 。

## 开始使用

如需试用此功能，请将以下配置条目添加到您的 MCP 客户端：

```
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}
```

如需检查其是否正常运行，请在编码代理中运行以下提示：

```
Please check the LCP of web.dev.
```

如需了解详情，请查看 GitHub 上的 [Chrome 开发者工具 MCP 文档](https://github.com/ChromeDevTools/chrome-devtools-mcp/?tab=readme-ov-file#chrome-devtools-mcp) 。
