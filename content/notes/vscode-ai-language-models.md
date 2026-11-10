---
title: VS Code AI 语言模型配置与 chatLanguageModels.json 规范指南
tags:
  - vscode
  - copilot
  - ai-agent
  - llm
description: 系统梳理 VS Code 中 AI 语言模型体系：接入通道（Copilot/BYOK/端侧）、chatLanguageModels.json 官方规范、自定义端点配置、多场景模型分流与思考强度调优。
source: https://code.visualstudio.com/docs/agent-customization/language-models#_model-configuration-reference
---

随着生成式 AI 深度融入软件工程研发流，现代代码编辑器已不再局限于单一大模型的代码补全，而是演化为多模型协同、多端点分流的智能体工作台。在 VS Code 架构中，语言模型（Language Model）、智能体编排底座（[[anatomy-of-coding-agent-harness|Agent Harness]]，如 [[copilot-cli|Copilot]]、[[claude-code]]、[[opencode]]）与访问凭证通道三者形成了高度解耦的协作关系。

VS Code 官方提供了基于 `chatLanguageModels.json` 的标准声明式配置规范，允许开发者突破平台自带模型池的限制，通过自备密钥（BYOK）、OpenAI 兼容网关以及本地端侧模型，实现多业务场景（对话、行内编辑、补全提示、语音交互、提交日志生成等）的精细化模型调度。

> [!note] 核心主旨
> VS Code 将 AI 能力解构为「模型（推理大脑）」、「Harness（流程与工具编排）」与「接入提供商（认证与计费）」三个正交维度；严格基于官方 `chatLanguageModels.json` 规范，开发者可将任意标准端点、思考强度调节与 Token 预算无缝接入编辑器的各级任务流中。

---

## 核心机制与要点拆解

### 1. 核心概念解耦：Model vs. Harness vs. Provider

在配置 VS Code AI 时，混淆核心概念是导致集成故障的主要原因：

| 维度                    | 职责定义                                                                     | 典型代表                                                    | 决定因素                                       |
| :---------------------- | :--------------------------------------------------------------------------- | :---------------------------------------------------------- | :--------------------------------------------- |
| **Model（模型）**       | 提供底层的语义理解、逻辑推理、代码生成与多模态感知能力                       | GPT-5.5、Claude Sonnet 4.6、DeepSeek-R1、Phi-4-mini         | 推理质量、上下文窗口大小、响应延迟与推理成本   |
| **Harness（编排底座）** | 负责上下文管理、System Prompt 装配、工具调用（Tool Calling）链路与多步骤循环 | GitHub Copilot Agent、[[claude-code]]、[[codex-cli]]        | 任务自治程度、工具生态、会话状态与沙盒执行能力 |
| **Provider（接入方）**  | 提供网络传输端点、身份鉴权认证与用量计费结算                                 | GitHub Copilot、Azure AI Foundry、Anthropic、自定义反代网关 | 计费模式、网络延迟、数据合规政策（如 ZDR）     |

> [!important] 关键约束
> 在 `chatLanguageModels.json` 中配置自定义模型，配置的是 **Model 维度的接入通道**，而非替换编辑器的 Agent Harness。模型必须具备可靠的 Tool Calling 与特定输出格式支持，才能在 Agent 模式下正常驱动文件编辑与终端交互。

---

### 2. 模型接入的三大通道

1. **GitHub Copilot 订阅接入**：
   - 个人订阅或企业管理员在 GitHub 策略中开启「Editor Preview Features」后，可直接在模型选择器中使用官方支持的基座模型（如 Claude 3.5/3.7 Sonnet、GPT-4o、o1、o3-mini 等）；
   - 企业可通过 `chat.defaultModel` 下发全局统一的默认模型。
2. **自备密钥（BYOK）与自定义端点（Custom Endpoint）**：
   - 支持内置提供商协议：`azure`、`openai` 以及通用的 `customendpoint`；
   - 支持主流模型协议形态：`chat-completions`（OpenAI 标准格式）、`responses`（OpenAI 新一代有状态 API）与 `messages`（Anthropic 格式）；
   - 支持接入任意兼容 OpenAI 接口的第三方 AI 网关、OneAPI、LiteLLM 或中继代理。
3. **本地端侧模型（On-Device Models）**：
   - 依赖本地硬件（NPU/GPU/CPU），通过 WebNN（Web 神经网络 API）与 ONNX Runtime 直接在用户设备本地跑推理；
   - 支持小型紧凑模型（如 Phi-4-mini、Llama 3.2 3B 等）；
   - 适合无网离线开发、机密内网环境或零数据外溢敏感场景。

---

### 3. 多场景模型精细化分流

并非所有编码任务都需要调用昂贵的旗舰推理模型。VS Code 允许根据不同交互通道独立分配模型：

| 交互场景                        | 配置项                                                       | 推荐模型特征                                                    | 适用考量                                            |
| :------------------------------ | :----------------------------------------------------------- | :-------------------------------------------------------------- | :-------------------------------------------------- |
| **Chat 对话与架构重构**         | `chat.defaultModel`                                          | 旗舰大模型 / 推理模型（如 Claude Sonnet、o3-mini、DeepSeek-R1） | 跨文件感知、深层逻辑推演与精准工具调用              |
| **Inline Chat 行内编辑**        | `inlineChat.model`                                           | 低延迟代码模型（如 GPT-4o-mini、轻量级 Sonnet）                 | 秒级生成 Diff、即时局部重构，追求交互跟手度         |
| **Inline Suggestions 代码补全** | `github.copilot.editor.model`                                | 极速流式补全模型                                                | 百毫秒级按键预测，强调高吞吐与极低时延              |
| **Utility Tasks 工具型任务**    | `chat.utilityModel` / `github.copilot.advanced.utilityModel` | 廉价高性价比小模型                                              | 自动生成 Git 提交信息、测试用例骨架、变量重命名建议 |
| **Voice Mode 语音交互**         | `voice.model`                                                | 高吞吐低延迟对话模型                                            | 口语化解析与即时语音应答                            |

---

### 4. 思考能力与上下文窗口预算配比

随着 [[reasoning-model|推理大模型]] 的普及，VS Code 在模型元数据中引入了 `thinking` 与 `supportsReasoningEffort` 规范：

- **Reasoning Effort 传递机制**：
  - `chat-completions` 协议：在请求体顶层发送 `"reasoning_effort": "low" | "medium" | "high"`；
  - `responses` 协议：在请求体发送嵌套对象 `"reasoning": { "effort": "..." }`；
  - `messages` 协议：在请求体发送 `"output_config": { "effort": "..." }`。
- **Token 预算与上下文推导**：
  - VS Code 将 `maxInputTokens` 与 `maxOutputTokens` 之和视为模型的总上下文窗口；
  - 当显式指定 `contextWindow` 时，可省略 `maxInputTokens`，VS Code 会自动计算 `maxInputTokens = contextWindow - maxOutputTokens`；
  - UI 界面直接基于这些数值精确呈现 Token 占用百分比，并触发上下文压缩（Compaction）。

---

## chatLanguageModels.json 官方规范参考

`chatLanguageModels.json` 采用清晰的双层对象结构：**Provider 级别** 声明认证凭据与全局默认协议，**Model 级别** 声明各独立模型的端点、功能标志与参数约束。当两级属性重复时，**Model 级别的取值具备更高优先级**。

### 1. 官方属性字典对照表

#### Provider 级别属性（Provider-level properties）

| 属性名    | 类型     | 必填 | 官方定义与说明                                                                                             |
| :-------- | :------- | :--- | :--------------------------------------------------------------------------------------------------------- |
| `vendor`  | `string` | 是   | 提供商类型标识：`azure`、`openai`，或自定义端点必填的 `customendpoint`                                     |
| `name`    | `string` | 是   | UI 模型选择器中该分组的展示名称（Display Name / Group Name）                                               |
| `apiKey`  | `string` | 否   | 认证 API Key。强烈建议使用输入变量格式（如 `"${input:myApiKey}"`），避免将密钥明文写入配置文件             |
| `apiType` | `string` | 否   | 下属所有模型的默认 API 协议类型：`chat-completions`（默认）、`responses` 或 `messages`。可在单个模型中覆盖 |
| `url`     | `string` | 否   | 自动发现模型的 Base URL。配置后 VS Code 将自动向该端点查询可用模型，而无需手动配置 `models` 数组           |
| `models`  | `array`  | 否   | 手动显式配置的模型对象数组                                                                                 |

#### Model 级别属性（Model-level properties）

| 属性名                     | 类型      | 必填     | 官方定义与说明                                                                                                            |
| :------------------------- | :-------- | :------- | :------------------------------------------------------------------------------------------------------------------------ |
| `id`                       | `string`  | 是       | 发送至后端 API 的真实模型标识（对于 Azure/Foundry 为 Deployment Name）                                                    |
| `name`                     | `string`  | 是       | 模型选择器（Model Picker）中向用户展示的显示名称                                                                          |
| `url`                      | `string`  | 是       | 该模型的完整 HTTP 端点 URL（推荐直接提供含 `/v1/...` 路径的完整地址）                                                     |
| `apiType`                  | `string`  | 否       | 针对该模型覆盖 Provider 级的协议类型（`chat-completions`、`responses` 或 `messages`）                                     |
| `contextWindow`            | `number`  | 否       | 模型的完整上下文窗口（输入 + 输出 Token 总数，如 `1000000`）。配置后可省略 `maxInputTokens`                               |
| `maxInputTokens`           | `number`  | 条件必填 | 模型允许的最大输入 Token 数量。未配置 `contextWindow` 时必填                                                              |
| `maxOutputTokens`          | `number`  | 是       | 模型单次响应允许的最大输出 Token 数量                                                                                     |
| `toolCalling`              | `boolean` | 是       | 声明模型是否支持 Tool Calling / Function Calling（Agent 模式驱动文件编辑/终端必须为 `true`）                              |
| `vision`                   | `boolean` | 是       | 声明模型是否支持多模态图像输入                                                                                            |
| `modelOptions`             | `object`  | 否       | 随每次请求透传的模型推理参数对象，例如 `{"temperature": 0.2, "top_p": 0.9}`                                               |
| `thinking`                 | `boolean` | 否       | 声明模型是否具备思考/推理能力，默认为 `false`                                                                             |
| `supportsReasoningEffort`  | `array`   | 否       | 声明模型接受的思考强度级别列表，如 `["low", "medium", "high"]`。配置后 UI 将自动呈现 Thinking Effort 调节滑块             |
| `reasoningEffortFormat`    | `string`  | 否       | 转发思考强度的请求体格式（`chat-completions`、`responses` 或 `messages`）。未设置时根据 URL 自动推断                      |
| `editTools`                | `array`   | 否       | 模型支持的代码编辑工具数组（`find-replace`、`multi-find-replace`、`apply-patch`、`code-rewrite`）。未指定时编辑器自动优选 |
| `streaming`                | `boolean` | 否       | 是否启用流式输出，默认为 `true`                                                                                           |
| `zeroDataRetentionEnabled` | `boolean` | 否       | 声明端点是否开启零数据留存（ZDR）。开启后 Responses API 不发送 `previous_response_id`，默认为 `false`                     |
| `statefulResponses`        | `boolean` | 否       | Responses API 是否维护前序会话状态，默认为 `true`。若对接无状态后端需设为 `false`，全量重传对话历史                       |
| `requestHeaders`           | `object`  | 否       | 请求时附加的额外 HTTP 请求头对象，支持 `${apiKey}` 动态插值；敏感安全保留头将被自动过滤                                   |

---

### 2. 官方标准配置范例与解析

以下范例全部取自 VS Code 官方文档标准实现，涵盖 Anthropic 原生规范、企业网关自定义头、Azure 部署及无状态代理。

#### 范例一：Anthropic 官方 Messages API 端点（Claude Sonnet）

```json
[
  {
    "name": "Anthropic",
    "vendor": "customendpoint",
    "apiKey": "${input:anthropicApiKey}",
    "apiType": "messages",
    "models": [
      {
        "id": "claude-sonnet-4-6",
        "name": "Claude Sonnet 4.6",
        "url": "https://api.anthropic.com/v1/messages",
        "toolCalling": true,
        "vision": true,
        "maxInputTokens": 200000,
        "maxOutputTokens": 64000
      }
    ]
  }
]
```

> [!tip] 规范解析
>
> - **Messages 协议自动封装**：当 `apiType` 声明为 `messages` 时，VS Code 会自动采用 Anthropic 规范构建 Payload，并将默认认证头推断为 `x-api-key`；
> - **密钥加密占位符**：`${input:anthropicApiKey}` 会在首次加载时唤起输入框，随后存入系统 SecretStorage；
> - **上下文窗口配比**：`maxInputTokens`（200,000）+ `maxOutputTokens`（64,000）构成了 264k 的总可用上下文。

---

#### 范例二：企业 AI 网关（自定义请求头 + 思考强度 + 推理参数）

```json
[
  {
    "name": "Gateway",
    "vendor": "customendpoint",
    "apiKey": "${input:myApiKey}",
    "models": [
      {
        "id": "my-model",
        "name": "My Model",
        "url": "https://gateway.example.com/v1/chat/completions",
        "toolCalling": true,
        "vision": false,
        "maxInputTokens": 128000,
        "maxOutputTokens": 16000,
        "thinking": true,
        "supportsReasoningEffort": ["low", "medium", "high"],
        "reasoningEffortFormat": "chat-completions",
        "modelOptions": {
          "temperature": 0.2,
          "top_p": 0.9
        },
        "requestHeaders": {
          "Authorization": "Bearer ${apiKey}",
          "Ocp-Apim-Subscription-Key": "my-subscription-key"
        }
      }
    ]
  }
]
```

> [!tip] 规范解析
>
> - **自定义请求头与 `${apiKey}` 替换**：在 `requestHeaders` 中声明通用鉴权头（如 `Authorization: Bearer ${apiKey}`）或网关专有头（如 `Ocp-Apim-Subscription-Key`）。VS Code 识别到知名鉴权头后，会自动抑制默认推断的认证头，防止凭证冲突；
> - **思考强度与格式**：启用 `thinking: true` 并传入 `supportsReasoningEffort` 候选档位，配合 `reasoningEffortFormat: "chat-completions"`，编辑器将以顶层字段 `"reasoning_effort"` 向网关下发思考配置；
> - **通用推理参数透传**：通过 `modelOptions` 锁定 `temperature: 0.2` 与 `top_p: 0.9`，确保代码生成的严谨度与确定性。

---

#### 范例三：Azure OpenAI 部署配置

```json
[
  {
    "name": "Azure",
    "vendor": "azure",
    "models": [
      {
        "id": "<my-deployment-name>",
        "name": "GPT-5.5",
        "url": "https://<my-endpoint>.openai.azure.com",
        "toolCalling": true,
        "vision": true,
        "maxInputTokens": 200000,
        "maxOutputTokens": 64000
      }
    ]
  }
]
```

> [!tip] 规范解析
>
> - **Azure 专用 Vendor**：使用 `vendor: "azure"`，模型 `id` 填写 Azure AI Foundry 上的部署名称（Deployment Name）；
> - **自动认证适配**：针对 Azure 格式的 URL，VS Code 会自动匹配并发送 `api-key` 请求头。

---

#### 范例四：无状态 Responses API 端点避坑配置

```json
{
  "apiType": "responses",
  "statefulResponses": false
}
```

> [!warning] 核心避坑警示
> OpenAI 新一代 `responses` 协议在官方实现中默认假设服务端为有状态（`statefulResponses: true`），依赖 `previous_response_id` 进行轻量化增量通信。如果你的模型部署在**无状态第三方网关、反向代理或本地聚合服务**后方，网关无法识别该 ID，会导致模型丢失历史工具调用结果并抛出 `missing-tool-call` 错误。此时**必须显式将 `statefulResponses` 设置为 `false`**，强制 VS Code 全量重发会话历史。若端点开启了零数据留存（`zeroDataRetentionEnabled: true`），系统亦会自动全量发送历史。

---

## 最佳实践与排错清单

1. **总 Token 窗口平衡校验**：
   - 确保 `maxInputTokens + maxOutputTokens` 精确等于或略小于物理模型的上下文限制；若输入 + 输出之和超标，VS Code 上下文管理器会在截断临界点引发异常崩溃。使用 `contextWindow` 时可省去手动输入计算。
2. **Tool Calling 必开原则**：
   - 如果自定义模型要作为 `@workspace`、Agent 会话或文件编辑使用，`toolCalling` 必须设置为 `true`；若模型实际上不支持原生 Function Calling，Agent 将无法读取文件或执行终端命令。
3. **企业组织策略优先权**：
   - 企业管理员通过 GitHub Copilot 管理控制台下发的组织默认模型（`Org default`）在新建会话时具备最高优先级，但工程师仍可在当前单会话内通过 Model Picker 自由临时切换；原有老会话始终保持其创建时的绑定模型。
4. **端侧模型适用边界**：
   - 端侧模型（如 3B 级别小模型）首选用于快速语义搜索、提交日志撰写及单行补全，不建议强行分配至复杂架构重构或全仓库依赖推理任务中。
