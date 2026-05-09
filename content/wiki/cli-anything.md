---
title: CLI-Anything
tags:
draft: false
description: 让任意软件都能被 AI Agent 驱动
source: https://github.com/HKUDS/CLI-Anything
---

## 🎯 核心功能

### 1. 全自动 7 阶段流水线

CLI-Anything 采用全自动流水线，从代码分析到发布上线，无需人工介入：

1. **🔍 分析** — 扫描源码，将 GUI 操作映射到 API
2. **📐 设计** — 规划命令分组、状态模型、输出格式
3. **🔨 实现** — 构建 Click CLI，包含 REPL、JSON 输出、撤销/重做
4. **📋 规划测试** — 生成 TEST.md，涵盖单元测试和端到端测试计划
5. **🧪 编写测试** — 实现完整测试套件
6. **📝 文档** — 更新 TEST.md，写入测试结果
7. **📦 发布** — 生成 `setup.py`，安装到 PATH

### 2. 多平台支持

CLI-Anything 支持多种 AI 编程工具：

| 平台                   | 状态          | 安装方式      |
| ---------------------- | ------------- | ------------- |
| **Claude Code**        | ✅ 官方支持   | 插件市场安装  |
| **OpenClaw**           | ✅ 支持       | 复制 SKILL.md |
| **OpenCode**           | 🧪 实验性支持 | 复制命令文件  |
| **Codex**              | 🧪 实验性支持 | 社区贡献      |
| **Qodercli**           | ✅ 支持       | 社区贡献      |
| **GitHub Copilot CLI** | ✅ 支持       | 社区贡献      |
| **Cursor**             | 🔮 即将支持   | -             |
| **Windsurf**           | 🔮 即将支持   | -             |

### 3. CLI-Hub 中心仓库

项目于 2026-03-17 推出了 **CLI-Hub**（https://hkuds.github.io/CLI-Anything/），这是一个中心化的 CLI 注册表：

- 一站式浏览和安装所有社区 CLI
- 支持通过单个 `pip` 命令安装
- 贡献者可通过提交 PR 添加新的 CLI

---

## 🏗️ 技术架构

### 核心设计原则

1. **真实软件集成** — CLI 生成合法的项目文件（ODF、MLT XML、SVG），然后交给真实应用去渲染，不是替代品而是结构化接口
2. **灵活的交互模式** — 支持有状态的 REPL 用于 Agent 交互会话，以及子命令模式用于脚本和流水线
3. **一致的使用体验** — 所有生成的 CLI 共享统一的 REPL 界面（repl_skin.py）
4. **Agent 原生设计** — 内置 `--json` 参数输出结构化数据，Agent 通过 `--help` 和 `which` 发现能力
5. **零妥协的依赖策略** — 真实软件是硬性要求，后端缺失时测试直接失败而非跳过

### MCP 后端模式

项目最近引入了 **MCP (Model Context Protocol)** 后端模式，首个实现是浏览器自动化：

- 通过 DOMShell 的 MCP Server 控制浏览器
- 使用 `ls`、`cd`、`grep`、`click` 等 shell 命令而非 DOM 查询
- 相比截图方式减少 50% 的 API 调用

---

## ✅ 测试覆盖

项目拥有完善的多层测试体系：

### 测试层级

| 测试层级                   | 测什么                               | 示例                                                    |
| -------------------------- | ------------------------------------ | ------------------------------------------------------- |
| **单元测试**               | 每个核心函数的隔离验证，使用合成数据 | `test_core.py` — 项目创建、图层操作、滤镜参数           |
| **端到端测试（原生）**     | 项目文件的完整生成流程               | ODF ZIP 结构合法性、MLT XML 正确性、SVG 格式完整性      |
| **端到端测试（真实后端）** | 调用真实软件并验证输出               | LibreOffice → PDF，Blender → PNG                        |
| **CLI 子进程测试**         | 通过 `subprocess.run` 调用已安装命令 | `cli-anything-gimp --json project new` → 合法 JSON 输出 |

### 已验证软件

|      软件       |     领域      |          CLI 命令          |             后端             |    测试数    |
| :-------------: | :-----------: | :------------------------: | :--------------------------: | :----------: |
|    **GIMP**     |   图像编辑    |    `cli-anything-gimp`     |   Pillow + GEGL/Script-Fu    |    ✅ 107    |
|   **Blender**   | 3D 建模与渲染 |   `cli-anything-blender`   |    bpy (Python scripting)    |    ✅ 208    |
|  **Inkscape**   |   矢量图形    |  `cli-anything-inkscape`   | Direct SVG/XML manipulation  |    ✅ 202    |
|  **Audacity**   |   音频制作    |  `cli-anything-audacity`   |      Python wave + sox       |    ✅ 161    |
| **LibreOffice** |   办公套件    | `cli-anything-libreoffice` | ODF generation + headless LO |    ✅ 158    |
| **OBS Studio**  |  直播与录制   | `cli-anything-obs-studio`  |  JSON scene + obs-websocket  |    ✅ 153    |
|  **Kdenlive**   |   视频剪辑    |  `cli-anything-kdenlive`   |   MLT XML + melt renderer    |    ✅ 155    |
|   **Shotcut**   |   视频剪辑    |   `cli-anything-shotcut`   |    Direct MLT XML + melt     |    ✅ 154    |
|    **Zoom**     |   视频会议    |    `cli-anything-zoom`     |    Zoom REST API (OAuth2)    |    ✅ 22     |
|   **Draw.io**   |   图表绘制    |   `cli-anything-drawio`    |  mxGraph XML + draw.io CLI   |    ✅ 138    |
|   **AnyGen**    |  AI 内容生成  |   `cli-anything-anygen`    |       AnyGen REST API        |    ✅ 50     |
|    **合计**     |               |                            |                              | **✅ 1,508** |

> 全部 1,508 项测试 **100% 通过** — 1,073 项单元测试 + 435 项端到端测试

---

## 💡 为什么是 CLI？

项目选择 CLI 作为 Agent 与软件交互的接口，原因如下：

- **结构化、可组合** — 文本命令天然匹配 LLM 的输入格式，可自由串联成复杂工作流
- **轻量且通用** — 几乎零开销，跨平台运行，不依赖额外环境
- **自描述** — 一个 `--help` 就能让 Agent 自动发现所有功能
- **久经验证** — Claude Code 每天通过 CLI 执行数以千计的真实任务
- **Agent 友好** — 结构化 JSON 输出，Agent 无需任何额外解析
- **确定且可靠** — 输出稳定一致，Agent 行为可预测

---

## 🚀 快速上手

### 环境要求

- **Python 3.10+**
- 目标软件已安装
- 支持的 AI 编程工具之一

### Claude Code 使用示例

```bash
# 添加 CLI-Anything 插件市场
/plugin marketplace add HKUDS/CLI-Anything

# 安装插件
/plugin install cli-anything

# 为 GIMP 生成完整的 CLI（7 个阶段全自动）
/cli-anything:cli-anything ./gimp

# 或从 GitHub 仓库构建
/cli-anything:cli-anything https://github.com/blender/blender
```

### 使用生成的 CLI

```bash
# 安装到 PATH
cd gimp/agent-harness && pip install -e .

# 随处可用
cli-anything-gimp --help
cli-anything-gimp project new --width 1920 --height 1080 -o poster.json
cli-anything-gimp --json layer add -n "Background" --type solid --color "#1a1a2e"

# 进入交互式 REPL
cli-anything-gimp
```

---

## 🔧 适用场景

| 类别                   | 典型软件                                                        |
| ---------------------- | --------------------------------------------------------------- |
| **📂 GitHub 开源项目** | VSCodium、WordPress、Calibre、Zotero、Joplin、Logseq、Penpot    |
| **🤖 AI/ML 平台**      | Stable Diffusion WebUI、ComfyUI、InvokeAI、Open WebUI、Kohya_ss |
| **📊 数据与分析**      | JupyterLab、Apache Superset、Metabase、DBeaver、KNIME           |
| **💻 开发工具**        | Jenkins、Gitea、Portainer、pgAdmin、SonarQube、ArgoCD           |
| **🎨 创意与媒体**      | Blender、GIMP、OBS Studio、Audacity、Krita、Kdenlive、Shotcut   |
| **📐 图表与可视化**    | Draw.io、Mermaid、PlantUML、Excalidraw、yEd                     |
| **🔬 科学计算**        | ImageJ、FreeCAD、QGIS、ParaView、Gephi、KiCad                   |
| **🏢 企业与办公**      | NextCloud、GitLab、Grafana、LibreOffice、AppFlowy、Odoo         |
| **📞 通信与协作**      | Zoom、Jitsi Meet、BigBlueButton、Mattermost                     |

---

## 📊 项目优势对比

| **现有痛点**                    | **CLI-Anything 的解法**                       |
| ------------------------------- | --------------------------------------------- |
| 🤖 "AI 用不了真正的专业工具"    | 直接对接真实软件后端 — 完整的专业能力，零妥协 |
| 💸 "GUI 自动化三天两头崩"       | 告别截图、点击和 RPA 的脆弱性，纯命令行操控   |
| 📊 "Agent 需要结构化数据"       | 内置 JSON 输出供 Agent 直接消费               |
| 🔧 "定制集成太贵了"             | 一个插件就能为任意代码库自动生成 CLI          |
| ⚡ "原型和生产之间差十万八千里" | 1,508+ 测试用例，全部在真实软件上验证通过     |

---

## 📝 最新动态

| 日期       | 更新内容                                                            |
| ---------- | ------------------------------------------------------------------- |
| 2026-03-17 | 推出 CLI-Hub 中心注册表                                             |
| 2026-03-16 | 新增 SKILL.md 自动生成（每个生成的 CLI 都包含 AI 可发现的技能定义） |
| 2026-03-15 | 支持 OpenClaw，修复 Windows `cygpath` 问题                          |
| 2026-03-14 | 修复 GIMP Script-Fu 路径注入漏洞，新增日文文档                      |
| 2026-03-13 | Qodercli 插件正式合并                                               |
| 2026-03-12 | Codex skill 集成落地                                                |
| 2026-03-11 | 新增 Zoom 视频会议支持（第 11 款支持的应用）                        |

---

## 🎓 总结

CLI-Anything 是一个具有前瞻性的项目，它解决了 AI Agent 与现有专业软件之间的鸿沟问题。通过将任何软件转化为 Agent 原生的 CLI 工具，它让 Agent 能够直接操控真实的专业软件，而不需要脆弱的 GUI 自动化或覆盖面有限的 API。

项目的核心优势在于：

1. **全自动化的生成流程** — 7 阶段流水线无需人工介入
2. **生产级的质量保障** — 1,508 项测试 100% 通过
3. **多平台兼容性** — 支持 Claude Code、OpenClaw、OpenCode、Codex 等主流平台
4. **真实软件集成** — 直接调用软件后端，功能零妥协

对于需要将现有软件生态接入 AI Agent 的开发者和团队来说，CLI-Anything 是一个值得关注和尝试的工具。
