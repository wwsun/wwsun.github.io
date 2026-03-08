---
description: The fast path to get up and running your own custom AI Agents.
source: https://nader.substack.com/p/the-complete-guide-to-building-agents?utm_source=tldrai
author:
  - "[[Nader Dabit]]"
created: 2026-01-12
tags:
  - clippings
  - claude-code
  - agent
---

如果你用过 Claude Code，你就会明白 AI 智能体实际上能做些什么：读取文件、运行命令、编辑代码、规划完成任务的步骤。

你知道，它不仅仅是帮助你写代码，它会像一位有思考的工程师那样主动承担问题并逐步解决。

The [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) is the same engine, yours to point at whatever problem you want, so you can easily build agents of your own.  
Claude Agent SDK 是同样的引擎，您可以将其用于任何您想解决的问题，因此您可以轻松地构建属于自己的智能体。

这是 Claude Code 背后的基础设施，以库的形式开放。你可以直接使用智能体循环、内置工具、上下文管理等，几乎所有本来需要自己开发的功能都已包含其中。

本指南将带你从零开始构建一个代码审查智能体。完成后，你将拥有一个能够分析代码库、发现漏洞和安全问题，并返回结构化反馈的工具。

更重要的是，你将了解 SDK 的工作原理，从而能够构建你真正需要的内容。

## What we’re building 我们正在构建的内容

Our code review agent will:  
我们的代码审查代理将会：

1. Analyze a codebase for bugs and security issues  
   分析代码库中的错误和安全问题
2. Read files and search through code autonomously  
   自主读取文件并搜索代码
3. Provide structured, actionable feedback  
   提供结构化、可操作的反馈
4. Track its progress as it works  
   在运行过程中跟踪其进度

## The stack 技术栈

• **Runtime** \- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)  
• 运行时 - Claude Code CLI  
• **SDK** \- [@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)  
• **Language** \- TypeScript • 语言 - TypeScript  
• **Model** \- Claude Opus 4.5  
• 模型 - Claude Opus 4.5

## What the SDK gives youSDK 能为你带来什么

If you’ve built agents with the raw API, you know the pattern: call the model, check if it wants to use a tool, execute the tool, feed the result back, repeat until done. This can get tedious when building anything non-trivial.  
如果你曾经使用原始 API 构建过智能体，你一定熟悉这个流程：调用模型，检查它是否需要使用工具，执行工具，将结果反馈回去，重复这个过程直到完成。当你要构建稍微复杂一些的东西时，这会变得很繁琐。

The SDK handles that loop:  
SDK 会处理该循环：

```markup
// Without the SDK: You manage the loop
let response = await client.messages.create({...});
while (response.stop_reason === "tool_use") {
  const result = yourToolExecutor(response.tool_use);
  response = await client.messages.create({ tool_result: result, ... });
}

// With the SDK: Claude manages it
for await (const message of query({ prompt: "Fix the bug in auth.py" })) {
  console.log(message); // Claude reads files, finds bugs, edits code
}
```

You also get working tools out of the box:  
你还可以直接使用现成的工具：

• **Read - r** ead any file in the working directory  
• 读取 - 读取工作目录中的任何文件  
• **Write - c** reate new files  
• 写入 - 创建新文件  
• **Edit - m** ake precise edits to existing files  
• 编辑 - 对现有文件进行精确编辑  
• **Bash - r** un terminal commands  
• Bash - 运行终端命令  
• **Glob- f** ind files by pattern  
• Glob - 通过模式查找文件  
• **Grep - s** earch file contents with regex  
• Grep - 使用正则表达式搜索文件内容  
• **WebSearch - s** earch the web  
• WebSearch - 搜索网络  
• **WebFetch - f** etch and parse web pages  
• WebFetch - 获取并解析网页

You don’t have to implement any of this yourself.  
你无需自己实现这些内容。

## Prerequisites 前提条件

1. Node.js 18+ installed 已安装 Node.js 18 及以上版本
2. An Anthropic API key ([get one here](https://console.anthropic.com/))  
   一个 Anthropic API 密钥（在这里获取）

## Getting started 入门

**Step 1: Install Claude Code CLI  
步骤 1：安装 Claude Code CLI**

The Agent SDK uses Claude Code as its runtime:  
Agent SDK 使用 Claude Code 作为其运行时环境：

```markup
npm install -g @anthropic-ai/claude-code
```

After installing, run **claude** in your terminal and follow the prompts to authenticate.  
安装完成后，在终端中运行 claude，并按照提示进行身份验证。

**Step 2: Create your project  
步骤 2：创建你的项目**

```markup
mkdir code-review-agent && cd code-review-agent
npm init -y
npm install @anthropic-ai/claude-agent-sdk
npm install -D typescript @types/node tsx
```

Step 3: Set your API key  
步骤 3：设置你的 API 密钥

```markup
export ANTHROPIC_API_KEY=your-api-key
```

## Your first agent 你的第一个智能体

Create **agent.ts**:创建 agent.ts：

```markup
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  for await (const message of query({
    prompt: "What files are in this directory?",
    options: {
      model: "opus",
      allowedTools: ["Glob", "Read"],
      maxTurns: 250
    }
  })) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(block.text);
        }
      }
    }

    if (message.type === "result") {
      console.log("\nDone:", message.subtype);
    }
  }
}

main();
```

Run it:运行它：

```markup
npx tsx agent.ts
```

Claude will use the **Glob** tool to list files and tell you what it found.  
Claude 将使用 Glob 工具列出文件，并告诉你它找到了什么。

## Understanding the message stream理解消息流

The **query()** function returns an async generator that streams messages as Claude works. Here are the key message types:  
query() 函数返回一个异步生成器，在 Claude 工作时以流的方式传递消息。以下是主要的消息类型：

```markup
for await (const message of query({ prompt: "..." })) {
  switch (message.type) {
    case "system":
      // Session initialization info
      if (message.subtype === "init") {
        console.log("Session ID:", message.session_id);
        console.log("Available tools:", message.tools);
      }
      break;

    case "assistant":
      // Claude's responses and tool calls
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log("Claude:", block.text);
        } else if ("name" in block) {
          console.log("Tool call:", block.name);
        }
      }
      break;

    case "result":
      // Final result
      console.log("Status:", message.subtype); // "success" or error type
      console.log("Cost:", message.total_cost_usd);
      break;
  }
}
```

## Building a code review agent构建代码审查代理

Now let’s build something useful. Create **review-agent.ts**:  
现在让我们构建一些有用的东西。创建 review-agent.ts：

```markup
import { query } from "@anthropic-ai/claude-agent-sdk";

async function reviewCode(directory: string) {
  console.log(\`\n🔍 Starting code review for: ${directory}\n\`);

  for await (const message of query({
    prompt: \`Review the code in ${directory} for:
1. Bugs and potential crashes
2. Security vulnerabilities
3. Performance issues
4. Code quality improvements

Be specific about file names and line numbers.\`,
    options: {
      model: "opus",
      allowedTools: ["Read", "Glob", "Grep"],
      permissionMode: "bypassPermissions", // Auto-approve read operations
      maxTurns: 250
    }
  })) {
    // Show Claude's analysis as it happens
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(block.text);
        } else if ("name" in block) {
          console.log(\`\n📁 Using ${block.name}...\`);
        }
      }
    }

    // Show completion status
    if (message.type === "result") {
      if (message.subtype === "success") {
        console.log(\`\n✅ Review complete! Cost: $${message.total_cost_usd.toFixed(4)}\`);
      } else {
        console.log(\`\n❌ Review failed: ${message.subtype}\`);
      }
    }
  }
}

// Review the current directory
reviewCode(".");
```

**Testing It Out 测试一下**

Create a file with some intentional issues. Create **example.ts**:  
创建一个包含一些故意问题的文件。创建 example.ts：

```markup
function processUsers(users: any) {
  for (let i = 0; i <= users.length; i++) { // Off-by-one error
    console.log(users[i].name.toUpperCase()); // No null check
  }
}

function connectToDb(password: string) {
  const connectionString = \`postgres://admin:${password}@localhost/db\`;
  console.log("Connecting with:", connectionString); // Logging sensitive data
}

async function fetchData(url) { // Missing type annotation
  const response = await fetch(url);
  return response.json(); // No error handling
}
```

Run the review:运行审查：

bash

```markup
npx tsx review-agent.ts
```

Claude will identify the bugs, security issues, and suggest fixes.  
Claude 会识别漏洞、安全问题，并提出修复建议。

## Adding Structured Output 添加结构化输出

For programmatic use, you’ll want structured data. The SDK supports JSON Schema output:  
对于编程用途，您会需要结构化数据。SDK 支持 JSON Schema 输出：

```markup
import { query } from "@anthropic-ai/claude-agent-sdk";

const reviewSchema = {
  type: "object",
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          category: { type: "string", enum: ["bug", "security", "performance", "style"] },
          file: { type: "string" },
          line: { type: "number" },
          description: { type: "string" },
          suggestion: { type: "string" }
        },
        required: ["severity", "category", "file", "description"]
      }
    },
    summary: { type: "string" },
    overallScore: { type: "number" }
  },
  required: ["issues", "summary", "overallScore"]
};

async function reviewCodeStructured(directory: string) {
  for await (const message of query({
    prompt: \`Review the code in ${directory}. Identify all issues.\`,
    options: {
      model: "opus",
      allowedTools: ["Read", "Glob", "Grep"],
      permissionMode: "bypassPermissions",
      maxTurns: 250,
      outputFormat: {
        type: "json_schema",
        schema: reviewSchema
      }
    }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      const review = message.structured_output as {
        issues: Array<{
          severity: string;
          category: string;
          file: string;
          line?: number;
          description: string;
          suggestion?: string;
        }>;
        summary: string;
        overallScore: number;
      };

      console.log(\`\n📊 Code Review Results\n\`);
      console.log(\`Score: ${review.overallScore}/100\`);
      console.log(\`Summary: ${review.summary}\n\`);

      for (const issue of review.issues) {
        const icon = issue.severity === "critical" ? "🔴" :
                     issue.severity === "high" ? "🟠" :
                     issue.severity === "medium" ? "🟡" : "🟢";
        console.log(\`${icon} [${issue.category.toUpperCase()}] ${issue.file}${issue.line ? \`:${issue.line}\` : ""}\`);
        console.log(\`   ${issue.description}\`);
        if (issue.suggestion) {
          console.log(\`   💡 ${issue.suggestion}\`);
        }
        console.log();
      }
    }
  }
}

reviewCodeStructured(".");
```

## Handling permissions 权限处理

By default, the SDK asks for approval before executing tools. You can customize this:  
默认情况下，SDK 在执行工具前会请求批准。你可以自定义这一行为：

**Permission modes 权限模式**

```markup
options: {
  // Standard mode - prompts for approval
  permissionMode: "default",

  // Auto-approve file edits
  permissionMode: "acceptEdits",

  // No prompts (use with caution)
  permissionMode: "bypassPermissions"
}
```

**Custom permission handler  
自定义权限处理程序**

For fine-grained control, use **canUseTool**:  
要进行细粒度控制，请使用 canUseTool：

```markup
options: {
  canUseTool: async (toolName, input) => {
    // Allow all read operations
    if (["Read", "Glob", "Grep"].includes(toolName)) {
      return { behavior: "allow", updatedInput: input };
    }

    // Block writes to certain files
    if (toolName === "Write" && input.file_path?.includes(".env")) {
      return { behavior: "deny", message: "Cannot modify .env files" };
    }

    // Allow everything else
    return { behavior: "allow", updatedInput: input };
  }
}
```

## Creating subagents 创建子代理

For complex tasks, you can create specialized subagents:  
对于复杂任务，您可以创建专门的子代理：

```markup
import { query, AgentDefinition } from "@anthropic-ai/claude-agent-sdk";

async function comprehensiveReview(directory: string) {
  for await (const message of query({
    prompt: \`Perform a comprehensive code review of ${directory}.
Use the security-reviewer for security issues and test-analyzer for test coverage.\`,
    options: {
      model: "opus",
      allowedTools: ["Read", "Glob", "Grep", "Task"], // Task enables subagents
      permissionMode: "bypassPermissions",
      maxTurns: 250,
      agents: {
        "security-reviewer": {
          description: "Security specialist for vulnerability detection",
          prompt: \`You are a security expert. Focus on:
- SQL injection, XSS, CSRF vulnerabilities
- Exposed credentials and secrets
- Insecure data handling
- Authentication/authorization issues\`,
          tools: ["Read", "Grep", "Glob"],
          model: "sonnet"
        } as AgentDefinition,

        "test-analyzer": {
          description: "Test coverage and quality analyzer",
          prompt: \`You are a testing expert. Analyze:
- Test coverage gaps
- Missing edge cases
- Test quality and reliability
- Suggestions for additional tests\`,
          tools: ["Read", "Grep", "Glob"],
          model: "haiku" // Use faster model for simpler analysis
        } as AgentDefinition
      }
    }
  })) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(block.text);
        } else if ("name" in block && block.name === "Task") {
          console.log(\`\n🤖 Delegating to: ${(block.input as any).subagent_type}\`);
        }
      }
    }
  }
}

comprehensiveReview(".");
```

## Session management 会话管理

For multi-turn conversations, capture and resume sessions:  
对于多轮对话，捕获并恢复会话：

```markup
import { query } from "@anthropic-ai/claude-agent-sdk";

async function interactiveReview() {
  let sessionId: string | undefined;

  // Initial review
  for await (const message of query({
    prompt: "Review this codebase and identify the top 3 issues",
    options: {
      model: "opus",
      allowedTools: ["Read", "Glob", "Grep"],
      permissionMode: "bypassPermissions",
      maxTurns: 250
    }
  })) {
    if (message.type === "system" && message.subtype === "init") {
      sessionId = message.session_id;
    }
    // ... handle messages
  }

  // Follow-up question using same session
  if (sessionId) {
    for await (const message of query({
      prompt: "Now show me how to fix the most critical issue",
      options: {
        resume: sessionId, // Continue the conversation
        allowedTools: ["Read", "Glob", "Grep"],
        maxTurns: 250
      }
    })) {
      // Claude remembers the previous context
    }
  }
}
```

## Using hooks 使用钩子

Hooks let you intercept and customize agent behavior:  
钩子允许你拦截并自定义代理行为：

```markup
import { query, HookCallback, PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk";

const auditLogger: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name === "PreToolUse") {
    const preInput = input as PreToolUseHookInput;
    console.log(\`[AUDIT] ${new Date().toISOString()} - ${preInput.tool_name}\`);
  }
  return {}; // Allow the operation
};

const blockDangerousCommands: HookCallback = async (input, toolUseId, { signal }) => {
  if (input.hook_event_name === "PreToolUse") {
    const preInput = input as PreToolUseHookInput;
    if (preInput.tool_name === "Bash") {
      const command = (preInput.tool_input as any).command || "";
      if (command.includes("rm -rf") || command.includes("sudo")) {
        return {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: "Dangerous command blocked"
          }
        };
      }
    }
  }
  return {};
};

for await (const message of query({
  prompt: "Clean up temporary files",
  options: {
    model: "opus",
    allowedTools: ["Bash", "Glob"],
    maxTurns: 250,
    hooks: {
      PreToolUse: [
        { hooks: [auditLogger] },
        { matcher: "Bash", hooks: [blockDangerousCommands] }
      ]
    }
  }
})) {
  // ...
}
```

## Adding custom tools with 添加自定义工具与

**[MCP](https://platform.claude.com/docs/en/agent-sdk/mcp)**

Extend Claude with custom tools using Model Context Protocol:  
使用模型上下文协议通过自定义工具扩展 Claude：

```markup
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// Create a custom tool
const customServer = createSdkMcpServer({
  name: "code-metrics",
  version: "1.0.0",
  tools: [
    tool(
      "analyze_complexity",
      "Calculate cyclomatic complexity for a file",
      {
        filePath: z.string().describe("Path to the file to analyze")
      },
      async (args) => {
        // Your complexity analysis logic here
        const complexity = Math.floor(Math.random() * 20) + 1; // Placeholder
        return {
          content: [{
            type: "text",
            text: \`Cyclomatic complexity for ${args.filePath}: ${complexity}\`
          }]
        };
      }
    )
  ]
});

// Use streaming input for MCP servers
async function* generateMessages() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content: "Analyze the complexity of main.ts"
    }
  };
}

for await (const message of query({
  prompt: generateMessages(),
  options: {
    model: "opus",
    mcpServers: {
      "code-metrics": customServer
    },
    allowedTools: ["Read", "mcp__code-metrics__analyze_complexity"],
    maxTurns: 250
  }
})) {
  // ...
}
```

## Cost tracking 费用跟踪

Track API costs for billing:  
跟踪 API 费用以便计费：

```markup
for await (const message of query({ prompt: "..." })) {
  if (message.type === "result" && message.subtype === "success") {
    console.log("Total cost:", message.total_cost_usd);
    console.log("Token usage:", message.usage);

    // Per-model breakdown (useful with subagents)
    for (const [model, usage] of Object.entries(message.modelUsage)) {
      console.log(\`${model}: $${usage.costUSD.toFixed(4)}\`);
    }
  }
}
```

## Production code review agent生产代码审查代理

Here’s a production-ready agent that ties everything together:  
这是一个将所有内容整合在一起的可用于生产环境的智能体：

```markup
import { query, AgentDefinition } from "@anthropic-ai/claude-agent-sdk";

interface ReviewResult {
  issues: Array<{
    severity: "low" | "medium" | "high" | "critical";
    category: "bug" | "security" | "performance" | "style";
    file: string;
    line?: number;
    description: string;
    suggestion?: string;
  }>;
  summary: string;
  overallScore: number;
}

const reviewSchema = {
  type: "object",
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          category: { type: "string", enum: ["bug", "security", "performance", "style"] },
          file: { type: "string" },
          line: { type: "number" },
          description: { type: "string" },
          suggestion: { type: "string" }
        },
        required: ["severity", "category", "file", "description"]
      }
    },
    summary: { type: "string" },
    overallScore: { type: "number" }
  },
  required: ["issues", "summary", "overallScore"]
};

async function runCodeReview(directory: string): Promise<ReviewResult | null> {
  console.log(\`\n${"=".repeat(50)}\`);
  console.log(\`🔍 Code Review Agent\`);
  console.log(\`📁 Directory: ${directory}\`);
  console.log(\`${"=".repeat(50)}\n\`);

  let result: ReviewResult | null = null;

  for await (const message of query({
    prompt: \`Perform a thorough code review of ${directory}.

Analyze all source files for:
1. Bugs and potential runtime errors
2. Security vulnerabilities
3. Performance issues
4. Code quality and maintainability

Be specific with file paths and line numbers where possible.\`,
    options: {
      model: "opus",
      allowedTools: ["Read", "Glob", "Grep", "Task"],
      permissionMode: "bypassPermissions",
      maxTurns: 250,
      outputFormat: {
        type: "json_schema",
        schema: reviewSchema
      },
      agents: {
        "security-scanner": {
          description: "Deep security analysis for vulnerabilities",
          prompt: \`You are a security expert. Scan for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Sensitive data exposure
- Insecure dependencies\`,
          tools: ["Read", "Grep", "Glob"],
          model: "sonnet"
        } as AgentDefinition
      }
    }
  })) {
    // Progress updates
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if ("name" in block) {
          if (block.name === "Task") {
            console.log(\`🤖 Delegating to: ${(block.input as any).subagent_type}\`);
          } else {
            console.log(\`📂 ${block.name}: ${getToolSummary(block)}\`);
          }
        }
      }
    }

    // Final result
    if (message.type === "result") {
      if (message.subtype === "success" && message.structured_output) {
        result = message.structured_output as ReviewResult;
        console.log(\`\n✅ Review complete! Cost: $${message.total_cost_usd.toFixed(4)}\`);
      } else {
        console.log(\`\n❌ Review failed: ${message.subtype}\`);
      }
    }
  }

  return result;
}

function getToolSummary(block: any): string {
  const input = block.input || {};
  switch (block.name) {
    case "Read": return input.file_path || "file";
    case "Glob": return input.pattern || "pattern";
    case "Grep": return \`"${input.pattern}" in ${input.path || "."}\`;
    default: return "";
  }
}

function printResults(result: ReviewResult) {
  console.log(\`\n${"=".repeat(50)}\`);
  console.log(\`📊 REVIEW RESULTS\`);
  console.log(\`${"=".repeat(50)}\n\`);

  console.log(\`Score: ${result.overallScore}/100\`);
  console.log(\`Issues Found: ${result.issues.length}\n\`);
  console.log(\`Summary: ${result.summary}\n\`);

  const byCategory = {
    critical: result.issues.filter(i => i.severity === "critical"),
    high: result.issues.filter(i => i.severity === "high"),
    medium: result.issues.filter(i => i.severity === "medium"),
    low: result.issues.filter(i => i.severity === "low")
  };

  for (const [severity, issues] of Object.entries(byCategory)) {
    if (issues.length === 0) continue;

    const icon = severity === "critical" ? "🔴" :
                 severity === "high" ? "🟠" :
                 severity === "medium" ? "🟡" : "🟢";

    console.log(\`\n${icon} ${severity.toUpperCase()} (${issues.length})\`);
    console.log("-".repeat(30));

    for (const issue of issues) {
      const location = issue.line ? \`${issue.file}:${issue.line}\` : issue.file;
      console.log(\`\n[${issue.category}] ${location}\`);
      console.log(\`  ${issue.description}\`);
      if (issue.suggestion) {
        console.log(\`  💡 ${issue.suggestion}\`);
      }
    }
  }
}

// Run the review
async function main() {
  const directory = process.argv[2] || ".";
  const result = await runCodeReview(directory);

  if (result) {
    printResults(result);
  }
}

main().catch(console.error);
```

Run it:运行它：

```markup
npx tsx review-agent.ts ./src
```

## What’s next 接下来是什么

The code review agent covers the essentials: query(), allowedTools, structured output, subagents, and permissions.  
代码审查代理涵盖了基础内容：query()、allowedTools、结构化输出、子代理和权限。

If you want to go deeper:  
如果你想进一步深入了解：

More capabilities 更多功能

- [File checkpointing](https://platform.claude.com/docs/en/agent-sdk/file-checkpointing) \- track and revert file changes  
  文件检查点 - 跟踪并恢复文件更改
- [Skills](https://platform.claude.com/docs/en/agent-sdk/skills) \- package reusable capabilities  
  技能 - 打包可复用的功能

Production deployment 生产部署

- [Hosting](https://platform.claude.com/docs/en/agent-sdk/hosting) \- deploy in containers and CI/CD  
  托管 - 在容器和 CI/CD 中部署
- [Secure deployment](https://platform.claude.com/docs/en/agent-sdk/secure-deployment) \- sandboxing and credential management  
  安全部署 - 沙箱机制与凭证管理

Full reference 完整参考

- [TypeScript SDK reference  
  TypeScript SDK 参考](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [Python SDK reference Python SDK 参考](https://platform.claude.com/docs/en/agent-sdk/python)
