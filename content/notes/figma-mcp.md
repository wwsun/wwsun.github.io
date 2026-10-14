---
title: "Figma 官方 MCP 配置与使用指南"
tags:
  - figma
  - mcp
  - ai-tools
description: "Figma 官方 MCP 服务器的配置与使用方法，包含 Remote 与 Desktop 两种运行模式，以及在 Antigravity、Cursor、Claude Code 和 VS Code 中的接入步骤。"
source: "https://mcp.figma.com/mcp"
---

Figma 官方提供了基于 Model Context Protocol (MCP) 的服务，供 AI 编程助手直接读取画布节点信息、提取样式与布局，或将代码反馈到画布中。相比早期的社区方案（如 [[figma-context-mcp]]），官方方案支持直接接入 Figma Dev Mode，免去了手动生成和管理 Personal Access Token 的流程。

> [!note] 前置条件
> 使用该功能需要对应文件的查看权限，并且账号拥有 Figma Dev Mode 访问权限（通常需要 Dev Seat）。

---

## Remote 与 Desktop 模式的区别

官方提供两种运行方式：

| 对比项       | Remote 模式（官方托管）                               | Desktop 模式（本地服务）                         |
| :----------- | :---------------------------------------------------- | :----------------------------------------------- |
| **端点地址** | `https://mcp.figma.com/mcp`                           | `http://127.0.0.1:3845/mcp`                      |
| **运行依赖** | 无，走云端 API                                        | 需在后台运行 Figma 桌面客户端                    |
| **认证方式** | 浏览器 OAuth 网页授权                                 | 复用本地桌面端登录态，无需额外认证               |
| **功能支持** | 支持读取设计、Write to canvas、Code to canvas         | 读取设计上下文、生成组件代码                     |
| **适用环境** | Cursor、VS Code、Claude Code 等具备浏览器重定向的环境 | 无法弹出浏览器授权的本地终端、内网环境或快速测试 |

---

## 客户端配置

### 1. Antigravity IDE

配置文件位于 `~/.gemini/config/mcp_config.json`。

**使用 Desktop 模式（免 OAuth 登录）**：

1. 打开 Figma 桌面端并载入设计文件。
2. 按快捷键 `Shift + D` 切换至 Dev Mode。
3. 在右侧面板中找到 **MCP Server**，切换为开启状态（默认监听 `127.0.0.1:3845`）。
4. 在 `~/.gemini/config/mcp_config.json` 中配置：
   ```json
   {
     "mcpServers": {
       "figma-desktop": {
         "serverUrl": "http://127.0.0.1:3845/mcp"
       }
     }
   }
   ```

**使用 Remote 模式**：

```json
{
  "mcpServers": {
    "figma-remote": {
      "serverUrl": "https://mcp.figma.com/mcp"
    }
  }
}
```

_注：Remote 模式首次连接需要拉起浏览器进行 Figma OAuth 授权。_

---

### 2. Cursor

**方式一：安装官方插件**

1. 在 Agent 会话框输入：
   ```text
   /add-plugin figma
   ```
2. 安装后按 `Cmd + Shift + P` 打开 `Cursor Settings`，进入 `Tools & MCP`。
3. 找到 Figma 项点击 **Connect**，在跳出的浏览器页面中点击确认授权。

**方式二：手动添加配置**
在 `Cursor Settings` -> `MCP` -> `Add Custom MCP` 中填入：

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```

保存后点击 Connect 完成网页授权。

---

### 3. Claude Code

可参考 [[claude-code-settings]] 与 [[claude-code-deep-usage-summary]] 了解 MCP 会话与配置管理。

**方式一：官方插件**

```bash
claude plugin install figma@claude-plugins-official
```

安装后在 `claude` 会话中输入 `/plugin`，选择 `figma` 按回车完成认证。

**方式二：CLI 命令添加**

```bash
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
```

在会话中输入 `/mcp`，选中 `figma` -> 选择 `Authenticate` 完成网页授权。

---

### 4. VS Code

1. 按 `Cmd + Shift + P`，选择 **MCP: Open User Configuration**。
2. 在 `mcp.json` 的 `servers` 下添加：
   ```json
   {
     "inputs": [],
     "servers": {
       "figma": {
         "url": "https://mcp.figma.com/mcp",
         "type": "http"
       }
     }
   }
   ```
3. 在 MCP 面板中启动服务并完成浏览器授权。

---

## 使用方法

Figma MCP 的交互通过设计稿链接触发。工具会解析 URL 中的 `fileKey` 和 `node-id` 参数，拉取对应的图层和样式结构。

### 1. 获取目标节点链接

1. 在 Figma 画布中选中需要还原的组件或画板。
2. 右键选择 **Copy link to selection**（或直接复制浏览器地址栏中包含 `node-id` 的完整链接）。

### 2. 调用示例

在会话中提供链接并给出具体的实现要求，例如：

```text
参考以下 Figma 设计稿链接实现对应的 React + Tailwind CSS 组件：
https://www.figma.com/design/AbCdEfGhIjK/MyApp?node-id=123-456

要求：
1. 还原 Auto Layout 的 flex/grid 布局与内边距、外边距和间距；
2. 读取设计稿的颜色与字体样式，优先匹配项目现有的 Tailwind 类名或 CSS 变量；
3. 保留语义化 HTML 标签；
4. 包含基础的响应式适配。
```

AI 助手会根据需要调用 `get_design_context` 获取节点数据，或调用 `get_image` 获取切图资源，并生成匹配代码。

---

## 常见问题排查

> [!warning] 排查清单
>
> - **连接本地服务失败 (`ECONNREFUSED 127.0.0.1:3845`)**：确认 Figma 桌面端已启动，已进入 Dev Mode (`Shift + D`)，且面板中的 MCP Server 开关处于打开状态。
> - **OAuth 授权后状态未刷新**：检查浏览器是否阻止了本地回调（如 `cursor://` 或 `localhost` 重定向）；企业版组织需确认管理员是否启用了第三方集成权限。
> - **无法读取节点或权限报错**：确认登录账号是否能访问该设计文件，以及账号是否分配了有效的 Dev Seat。

---

## 相关笔记

- [[figma-context-mcp]]：基于 Figma REST API 的社区开源 MCP 实现
- [[chrome-devtools-mcp|Chrome DevTools MCP]]：通过 MCP 连接 Chrome 开发者工具进行前端调试
- [[claude-code-settings]]：Claude Code 工具链与 MCP 配置
- [[agent-skills-for-fullstatck-dev]]：全栈开发中常用的 Agent 技能与工具组合
