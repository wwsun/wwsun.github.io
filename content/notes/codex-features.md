---
title: Codex CLI 功能特性
tags:
  - codex
draft: false
description: 未命名
source: https://developers.openai.com/codex/cli/features
---

Codex 支持超越聊天的工作流。使用本指南了解每个功能解锁了什么以及何时使用它。

---

## 交互模式运行

Codex 启动全屏终端 UI，可以读取你的仓库、进行编辑，并在你们一起迭代时运行命令。每当你想要一个可以实时审查 Codex 操作的对话式工作流时使用它。

```bash
codex
```

你也可以在命令行上指定初始提示词。

```bash
codex "向我解释这个代码库"
```

会话打开后，你可以：

- 直接在编辑器中发送提示词、代码片段或截图（参见[图像输入](#图像输入)）
- 观看 Codex 在进行更改前解释其计划，并内联批准或拒绝步骤
- 在 TUI 中阅读语法高亮的 markdown 代码块和差异，然后使用 `/theme` 预览和保存首选主题
- 使用 `/clear` 清空终端并开始新的聊天，或按 **Ctrl+L** 清屏而不开始新对话
- 使用 `/copy` 或按 **Ctrl+O** 复制最新完成的 Codex 输出。如果一轮仍在运行，Codex 会复制最近完成的输出而不是进行中的文本
- 在 Codex 运行时按 **Tab** 排队后续文本、斜杠命令或 `!` shell 命令供下一轮使用
- 使用 **上/下箭头** 在编辑器中导航草稿历史；Codex 恢复先前的草稿文本和图像占位符
- 按 **Ctrl+R** 从编辑器搜索提示词历史，然后按 **Enter** 接受匹配或 **Esc** 取消
- 按 **Ctrl+C** 或使用 `/exit` 关闭交互式会话

---

## 恢复对话

Codex 在本地存储你的记录，因此你可以从上次离开的地方继续，而不必重复上下文。当你想重新打开具有相同仓库状态和指令的早前线程时，使用 `resume` 子命令。

- `codex resume` 启动最近交互式会话的选择器。高亮一个运行以查看其摘要，然后按 **Enter** 重新打开它
- `codex resume --all` 显示当前工作目录之外的会话，因此你可以重新打开任何本地运行
- `codex resume --last` 跳过选择器，直接跳转到当前工作目录的最近会话（添加 `--all` 忽略当前工作目录过滤器）
- `codex resume <run-id>` 针对特定运行。你可以从选择器、`/status` 或 `~/.codex/sessions/` 下的文件复制 ID

非交互式自动化运行也可以恢复：

```bash
codex exec resume --last "修复你发现的竞态条件"
codex exec resume 7f9f9a2e-1b3c-4c7a-9b0e-.... "实施计划"
```

每个恢复的运行保留原始记录、计划历史和批准，因此 Codex 可以使用先前的上下文，同时你提供新的指令。如果需要，在恢复前使用 `--cd` 覆盖工作目录或使用 `--add-dir` 添加额外根目录来引导环境。

---

## 将 TUI 连接到远程应用服务器

远程 TUI 模式让你在另一台机器上运行 Codex 应用服务器，并从另一台机器使用 Codex 终端 UI。这在代码、凭证或执行环境位于远程主机，但你想要本地交互式 TUI 体验时很有用。

在应该拥有工作区并运行命令的机器上启动应用服务器：

```bash
codex app-server --listen ws://127.0.0.1:4500
```

然后从运行 TUI 的机器连接：

```bash
codex --remote ws://127.0.0.1:4500
```

要从另一台机器访问，将应用服务器绑定到可访问的接口，例如：

```bash
codex app-server --listen ws://0.0.0.0:4500
```

`--remote` 仅接受显式的 `ws://host:port` 和 `wss://host:port` 地址。对于纯 WebSocket 连接，优先使用本地主机地址或 SSH 端口转发。如果你将监听器暴露到本地主机之外，请在真实远程使用之前配置认证，并将经过认证的非本地连接放在 TLS 后面。

Codex 支持以下 WebSocket 认证模式用于远程 TUI 连接：

### 无 WebSocket 认证

最适合本地主机监听器或 SSH 端口转发的连接。Codex 可以在没有认证的情况下启动非本地监听器，但会记录警告，启动横幅会提醒你在真实远程使用之前配置认证。

### 能力令牌 (Capability token)

在应用服务器主机上的文件中存储共享令牌，使用 `--ws-auth capability-token --ws-token-file /abs/path/to/token` 启动服务器，然后在 TUI 主机上将相同令牌设置到环境变量中，并通过 `--remote-auth-token-env <VAR_NAME>` 传递。

### 签名承载令牌 (Signed bearer token)

在应用服务器主机上的文件中存储 HMAC 共享密钥，使用 `--ws-auth signed-bearer-token --ws-shared-secret-file /abs/path/to/secret` 启动服务器，并让 TUI 通过 `--remote-auth-token-env <VAR_NAME>` 发送签名的 JWT 承载令牌。共享密钥必须至少 32 字节。签名令牌使用 HS256，必须包含 `exp`；当这些声明或服务器选项存在时，Codex 还会验证 `nbf`、`iss` 和 `aud`。

### 创建能力令牌

在应用服务器主机上，生成只有你的用户能读取的权限的随机令牌文件：

```bash
TOKEN_FILE="$HOME/.codex/codex-app-server-token"
install -d -m 700 "$(dirname "$TOKEN_FILE")"
openssl rand -base64 32 > "$TOKEN_FILE"
chmod 600 "$TOKEN_FILE"
```

像对待密码一样对待令牌文件，如果泄露则重新生成。

然后使用该令牌文件启动应用服务器。例如，在 TLS 代理后面使用能力令牌：

```bash
# 远程主机
TOKEN_FILE="$HOME/.codex/codex-app-server-token"
codex app-server \
  --listen ws://0.0.0.0:4500 \
  --ws-auth capability-token \
  --ws-token-file "$TOKEN_FILE"

# TUI 主机
export CODEX_REMOTE_AUTH_TOKEN="$(ssh devbox 'cat ~/.codex/codex-app-server-token')"
codex --remote wss://codex-devbox.example.com:4500 \
  --remote-auth-token-env CODEX_REMOTE_AUTH_TOKEN
```

TUI 在 WebSocket 握手期间将远程认证令牌作为 `Authorization: Bearer <token>` 发送。Codex 仅通过 `wss://` URL 或主机为 `localhost`、`127.0.0.1` 或 `::1` 的 `ws://` URL 发送这些令牌，因此如果客户端需要通过网络进行认证，请将非本地远程监听器放在 TLS 后面。

---

## 模型和推理

对于 Codex 中的大多数任务，`gpt-5.4` 是推荐的模型。它将 `gpt-5.3-codex` 的行业领先编码能力带到 OpenAI 的旗舰前沿模型，将前沿编码性能与更强的推理、原生计算机使用和更广泛的专业工作流相结合。对于超快速任务，ChatGPT Pro 订阅者可以在研究预览中访问 GPT-5.3-Codex-Spark 模型。

使用 `/model` 命令在会话中切换模型，或在启动 CLI 时指定一个。

```bash
codex --model gpt-5.4
```

[了解更多关于 Codex 中可用模型的信息](https://developers.openai.com/codex/models)。

---

## 功能标志

Codex 包含一小套功能标志。使用 `features` 子命令检查可用的功能，并在配置中持久化更改。

```bash
codex features list              # 列出所有功能标志
codex features enable unified_exec     # 启用功能
codex features disable shell_snapshot  # 禁用功能
```

`codex features enable <flag>` 和 `codex features disable <flag>` 写入 `~/.codex/config.toml`。如果你使用 `--profile` 启动 Codex，Codex 会将更改存储在该配置文件中，而不是根配置。

---

## 子代理

使用 Codex 子代理工作流并行化更大的任务。有关设置、角色配置（`config.toml` 中的 `[agents]`）和示例，参见[子代理](https://developers.openai.com/codex/subagents)。

Codex 仅在你明确要求时才生成子代理。因为每个子代理都进行自己的模型和工具工作，子代理工作流比可比的单代理运行消耗更多令牌。

---

## 图像输入

附加截图或设计规范，让 Codex 可以 alongside 你的提示词读取图像细节。你可以将图像粘贴到交互式编辑器中，或在命令行上提供文件。

```bash
codex -i screenshot.png "解释这个错误"
```

```bash
codex --image img1.png,img2.jpg "总结这些图表"
```

Codex 接受 PNG 和 JPEG 等常见格式。对于两个或更多图像，使用逗号分隔的文件名，并将它们与文本指令结合以添加上下文。

---

## 图像生成

让 Codex 直接在 CLI 中生成或编辑图像。这适用于图标、横幅、插图、精灵表和占位图等素材。如果你想让 Codex 转换或扩展现有素材，请随提示词附加参考图像。

你可以用自然语言询问，或通过在你的提示词中包含 `$imagegen` 显式调用图像生成技能。

内置图像生成使用 `gpt-image-2`，计入你的通用 Codex 使用限制，根据图像质量和大小，平均比没有图像生成的类似轮次快 3-5 倍使用包含限制。有关详情，参见[定价](https://developers.openai.com/codex/pricing#image-generation-usage-limits)。有关提示词技巧和模型详情，参见[图像生成指南](https://developers.openai.com/api/docs/guides/image-generation)。

对于大批量的图像生成，在你的环境变量中设置 `OPENAI_API_KEY`，并让 Codex 通过 API 生成图像，以便应用 API 定价。

---

## 语法高亮和主题

TUI 语法高亮围栏 markdown 代码块和文件差异，使代码在审查和调试期间更容易扫描。

使用 `/theme` 打开主题选择器，实时预览主题，并将你的选择保存到 `~/.codex/config.toml` 中的 `tui.theme`。你也可以在 `$CODEX_HOME/themes` 下添加自定义 `.tmTheme` 文件，并在选择器中选择它们。

---

## 运行本地代码审查

在 CLI 中输入 `/review` 打开 Codex 的审查预设。CLI 启动一个专门的审查器，读取你选择的差异，并在不触碰你的工作树的情况下报告优先的、可操作的发现在默认情况下它使用当前会话模型；在 `config.toml` 中设置 `review_model` 来覆盖。

- **针对基础分支审查**：让你选择本地分支；Codex 找到与其上游的合并基础，对比你的工作，并在你打开 Pull Request 之前突出显示最大风险
- **审查未提交的更改**：检查所有已暂存、未暂存或未跟踪的内容，因此你可以在提交之前解决问题
- **审查提交**：列出最近的提交，并让 Codex 读取你选择的 SHA 的确切更改集
- **自定义审查指令**：接受你自己的措辞（例如，"关注可访问性回归"），并用该提示运行相同的审查器

每次运行都作为记录中的自己的轮次出现，因此你可以在代码演变时重新运行审查并比较反馈。

---

## 网页搜索

Codex 附带第一方网页搜索工具。对于 Codex CLI 中的本地任务，Codex 默认启用网页搜索，并从网页搜索缓存提供结果。缓存是 OpenAI 维护的网页结果索引，因此缓存模式返回预索引结果而不是获取实时页面。这减少了来自任意实时内容的提示词注入暴露，但你仍应将网页结果视为不受信任的。如果你使用 `--yolo` 或另一个[完全访问沙箱设置](https://developers.openai.com/codex/agent-approvals-security)，网页搜索默认为实时结果。要获取最新数据，为单次运行传递 `--search` 或在[配置基础](https://developers.openai.com/codex/config-basic)中设置 `web_search = "live"`。你也可以设置 `web_search = "disabled"` 来关闭该工具。

每当 Codex 查找某些内容时，你会在记录或 `codex exec --json` 输出中看到 `web_search` 项。

---

## 使用输入提示词运行

当你只需要快速答案时，使用单个提示词运行 Codex 并跳过交互式 UI。

```bash
codex "解释这个代码库"
```

Codex 将读取工作目录，制定计划，并在退出前将响应流式传输回你的终端。将其与 `--path` 等标志配对以针对特定目录，或 `--model` 以预先调整行为。

---

## Shell 补全

通过为你的 shell 安装生成的补全脚本来加速日常使用：

```bash
codex completion bash
codex completion zsh
codex completion fish
```

在你的 shell 配置文件中运行补全脚本以为新会话设置补全。例如，如果你使用 `zsh`，你可以将以下内容添加到 `~/.zshrc` 文件的末尾：

```bash
# ~/.zshrc
eval "$(codex completion zsh)"
```

启动新会话，输入 `codex`，然后按 **Tab** 查看补全。如果你看到 `command not found: compdef` 错误，在 `eval "$(codex completion zsh)"` 行之前将 `autoload -Uz compinit && compinit` 添加到你的 `~/.zshrc` 文件，然后重启你的 shell。

---

## 审批模式

审批模式定义 Codex 在停止确认之前可以做多少。在交互式会话中使用 `/permissions` 随着你的舒适度变化切换模式。

| 模式                        | 说明                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| **Auto（自动，默认）**      | 让 Codex 读取文件、编辑并在工作目录内运行命令。它在触碰该范围之外的任何内容或使用网络之前仍会询问 |
| **Read-only（只读）**       | 将 Codex 保持在咨询模式。它可以浏览文件，但在你批准计划之前不会进行更改或运行命令                 |
| **Full Access（完全访问）** | 授予 Codex 在你的机器上跨机器工作的能力，包括网络访问，无需询问。仅在信任仓库和任务时谨慎使用     |

Codex 始终显示其操作的记录，因此你可以用你通常的 git 工作流审查或回滚更改。

---

## 脚本化 Codex

使用 `exec` 子命令自动化工作流或将 Codex 接入你现有的脚本。这以非交互方式运行 Codex，将最终计划和结果通过管道传回 `stdout`。

```bash
codex exec "修复 CI 失败"
```

将 `exec` 与 shell 脚本结合以构建自定义工作流，例如自动更新变更日志、分类问题或在 PR 发布之前执行编辑检查。

---

## 使用 Codex Cloud

`codex cloud` 命令让你无需离开终端即可分类和启动 [Codex Cloud 任务](https://developers.openai.com/codex/cloud)。不带参数运行它以打开交互式选择器，浏览活动或已完成的任务，并将更改应用到你的本地项目。

你也可以直接从终端启动任务：

```bash
codex cloud exec --env ENV_ID "总结开放的 Bug"
```

添加 `--attempts`（1-4）以在你希望 Codex Cloud 生成多个解决方案时请求 best-of-N 运行。例如，`codex cloud exec --env ENV_ID --attempts 3 "总结开放的 Bug"`。

环境 ID 来自你的 Codex Cloud 配置 — 使用 `codex cloud` 并按 **Ctrl+O** 选择环境，或使用 Web 仪表板确认确切值。认证遵循你现有的 CLI 登录，如果提交失败，命令以非零退出，因此你可以将其接入脚本或 CI。

---

## 斜杠命令

斜杠命令让你快速访问专业工作流，如 `/review`、`/fork` 或你自己的可重用提示词。Codex 自带一组内置命令，你也可以在 `config.toml` 中定义自定义命令。

---

## 功能特性总结

| 功能            | 用途                 | 命令/方式                 |
| --------------- | -------------------- | ------------------------- |
| **交互模式**    | 实时对话式编码       | `codex`                   |
| **恢复会话**    | 继续之前的工作       | `codex resume`            |
| **远程 TUI**    | 远程服务器 + 本地 UI | `codex --remote ws://...` |
| **图像输入**    | 截图/设计稿分析      | `codex -i image.png`      |
| **图像生成**    | 生成/编辑图像        | `$imagegen` 或自然语言    |
| **代码审查**    | 本地 PR 式审查       | `/review`                 |
| **网页搜索**    | 获取外部信息         | 自动或 `--search`         |
| **非交互执行**  | 脚本/自动化          | `codex exec "..."`        |
| **子代理**      | 并行任务处理         | 配置 `[agents]`           |
| **Codex Cloud** | 云端任务执行         | `codex cloud exec`        |
| **主题定制**    | 语法高亮主题         | `/theme`                  |
| **审批模式**    | 安全控制             | `/permissions`            |

---

_原文来自 OpenAI Developers 文档_
