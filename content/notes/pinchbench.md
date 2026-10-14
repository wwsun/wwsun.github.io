---
title: PinchBench
tags:
  - llm
  - agent
  - benchmark
description: "PinchBench 是一个用于评估 LLM 模型作为 OpenClaw 编码 Agent 性能的基准测试系统，通过真实世界的任务来测量模型在完整 Agent 环境下的综合表现。"
source: PinchBench
---

## 一句话定位

**PinchBench** 是一个用于评估 LLM 模型作为 OpenClaw 编码 Agent 性能的基准测试系统。它不是测试孤立的模型能力，而是通过真实世界的任务（邮件处理、代码编写、文档分析、日历管理等）来测量模型在完整 Agent 环境下的综合表现。结果汇总在公开排行榜 [pinchbench.com](https://pinchbench.com)。

- 作者：[pinchbench](https://github.com/pinchbench) (由 [kilo.ai](https://kilo.ai) 团队维护)
- 许可证：MIT
- Stars：1,109 | Forks：129
- 主页：https://pinchbench.com

## 技术栈

| 维度       | 选型                                                       |
| ---------- | ---------------------------------------------------------- |
| 语言       | Python 3.10+                                               |
| 包管理     | `uv` (Astral 出品) + `setuptools` / `setuptools-scm`       |
| 依赖       | `pyyaml` (任务解析), `fabric` (远程执行), `paramiko` (SSH) |
| 测试       | `pytest` + `pytest-cov`                                    |
| 代码质量   | `black` (格式化), `ruff` (lint)                            |
| 容器化     | `Dockerfile.benchmark`                                     |
| CI/CD      | GitHub Actions (lint + release + task-count 自动更新)      |
| 运行时环境 | 需要运行中的 OpenClaw 实例                                 |

## 目录结构

```
pinchbench/skill/
├── README.md                          # 项目介绍 + 快速开始指南
├── SKILL.md                           # OpenClaw Skill 定义 (元数据 + 使用说明)
├── pyproject.toml                     # Python 项目配置（入口点: benchmark）
├── LICENSE                            # MIT
├── BENCHMARK_VERSION                  # 版本号文件
├── crab.txt                          # ASCII 艺术 (🦀 启动画面)
├── pinchbench.png                    # 品牌图片
├── Dockerfile.benchmark               # 容器化运行环境
│
├── tasks/                             # 🔴 核心：任务定义目录（53+ 任务）
│   ├── manifest.yaml                  # 任务清单：分类、排序、core 任务集合
│   ├── TASK_TEMPLATE.md               # 新任务编写模板
│   ├── task_sanity.md                 # 冒烟测试
│   ├── task_calendar.md               # 日历事件创建
│   ├── task_stock.md                  # 股票价格查询
│   └── ... (50+ 其他任务)
│       # 分类包括：productivity, research, writing, coding,
│       # analysis, csv_analysis, log_analysis, meeting_analysis
│
├── scripts/                           # 🔴 核心：执行引擎
│   ├── benchmark.py                   # 主入口（1,000+ 行编排逻辑）
│   ├── run.sh                         # 便捷启动脚本（uv run wrapper）
│   ├── lib_tasks.py                   # 任务加载与解析（YAML frontmatter → Task 对象）
│   ├── lib_agent.py                   # OpenClaw Agent 管理（创建/执行/转录提取）
│   ├── lib_grading.py                 # 评分引擎（自动/LLM裁判/混合评分 + 缓存）
│   ├── lib_upload.py                  # 结果上传到排行榜
│   ├── lib_axiom.py                   # Axiom 遥测日志（可选）
│   ├── lib_trend.py                   # 趋势分析（跨多次运行的分数变化）
│   ├── lib_fws.py                     # FWS mock 服务（GWS 集成测试用）
│   ├── lint_argparse_help.py          # CI lint 脚本
│   └── lint_manifest.py               # manifest.yaml 校验脚本
│
├── assets/                            # 测试数据/资产
│   ├── images/                        # 图片识别任务素材（30 张）
│   ├── csvs/                          # CSV 分析任务数据集（9 个）
│   ├── logs/                          # 日志分析任务素材（7 个）
│   ├── meetings/                      # 会议记录素材（4 个）
│   ├── refactor/                      # 代码重构任务素材
│   ├── session_chain/                 # 会话链分析素材（TypeScript）
│   └── *.pdf, *.html, *.py, ...      # 其他独立任务素材
│
├── tests/                             # 单元测试
│   ├── test_lib_grading.py
│   ├── test_lib_trend.py
│   └── test_multi_session.py
│
└── .github/                           # CI 配置
    ├── workflows/lint.yml
    ├── workflows/release.yml
    ├── workflows/update-task-count.yml
    └── benchmark-models.yml
```

## 入口点

### CLI 入口：`scripts/run.sh` → `scripts/benchmark.py`

```bash
# 最简用法
./scripts/run.sh --model openrouter/anthropic/claude-sonnet-4

# 指定套件
./scripts/run.sh --model openrouter/anthropic/claude-sonnet-4 --suite automated-only
./scripts/run.sh --model openrouter/anthropic/claude-sonnet-4 --suite task_calendar,task_stock

# 核心任务快速基准（~25 个代表性任务）
./scripts/run.sh --model openrouter/anthropic/claude-sonnet-4 --core
```

`benchmark.py` 的 `main()` 函数流程：

1. 解析命令行参数
2. 初始化 `BenchmarkRunner`，加载任务
3. 验证模型（通过 OpenRouter API）
4. 创建/配置 OpenClaw Agent
5. 按顺序执行任务（支持并行评分）
6. 对每个任务评分（自动 / LLM 裁判 / 混合）
7. 计算总分数和 Token 效率
8. 上传结果到排行榜

### 编程入口：Task 对象模型

```python
class Task:
    task_id: str           # 如 "task_sanity"
    name: str              # 如 "Sanity Check"
    category: str          # 如 "productivity"
    grading_type: str      # "automated" | "llm_judge" | "hybrid"
    timeout_seconds: int   # 超时时间
    workspace_files: list  # 任务需要的素材文件
    prompt: str            # 发送给 Agent 的提示词
    expected_behavior: str # 预期行为描述
    grading_criteria: list # 评分标准清单
    automated_checks: str  # Python 评分函数代码
    llm_judge_rubric: str  # LLM 裁判评分标准
```

## 核心数据流

```
用户执行 ./scripts/run.sh --model openrouter/anthropic/claude-sonnet-4
  → run.sh: 切换到 skill 根目录
  → uv run scripts/benchmark.py "$@"

benchmark.py: main()
  → _parse_args()                           # 解析 CLI 参数（模型、套件、超时倍数等）
  → BenchmarkRunner(tasks_dir)              # 初始化运行器
  → runner.load_tasks()                     # 从 manifest.yaml 加载任务清单
      → TaskLoader._load_from_manifest()    # 解析 YAML 分类 → 排序 → 逐个加载
          → TaskLoader.load_task(file)      # 解析 Markdown（frontmatter + 段落）
              → 正则提取 YAML frontmatter   # id, name, grading_type, timeout...
              → 按 ## 标题解析段落          # Prompt / Expected Behavior / Grading Criteria...
              → 构建 Task 对象
  → validate_openrouter_model(model)        # 调用 OpenRouter API 验证模型存在
  → ensure_agent_exists(agent_id, model)     # 创建/配置 OpenClaw Agent
      → openclaw agents add bench-xxx       # CLI 创建 Agent
      → 复制 main agent 的 models.json      # 继承模型配置
      → 设置 defaultProvider + defaultModel # 指定测试模型
  → cleanup_agent_sessions(agent_id)         # 清理历史会话

对每个 Task 循环执行：
  → execute_openclaw_task(task)             # lib_agent.py
      → prepare_task_workspace()            # 复制素材文件到 Agent 工作空间
      → 复制主工作空间的 skills/            # 使 Agent 可用已安装的 Skills
      → 检查是否 multi_session 任务         # 支持多轮对话/跨会话测试
      → subprocess: openclaw agent          # 以子进程调用 OpenClaw CLI
          --agent bench-xxx                  # 目标 Agent
          --session-id task_xxx_ts           # 会话 ID
          --message "<prompt>"               # 任务提示词
      → _load_transcript()                  # 从 sessions/*.jsonl 加载对话记录
          → 发现策略：sessions.json → glob → session-id
          → 重试最多 90 次（每次等 1s）
      → _extract_usage_from_transcript()    # 统计 Token 用量和成本
      → 归档 transcript → output_dir/*.jsonl

  → grade_task(task, execution_result)      # lib_grading.py
      ├── grading_type == "automated"
      │   → _grade_automated()
      │       → _extract_grading_code()     # 从 task.md 提取 Python 函数
      │       → exec(grading_code)          # 动态执行评分代码
      │       → grade_func(transcript, workspace) → {criterion: score}
      ├── grading_type == "llm_judge"
      │   → _grade_llm_judge()
      │       → 检查缓存（hash = task_id + transcript + rubric + model）
      │       → _summarize_transcript()     # 压缩对话记录为文本摘要
      │       → _build_judge_prompt()       # 构建评分提示词
      │       → judge_backend == "api"
      │           → call_judge_api()        # 直接 API 调用（OpenRouter/Anthropic/OpenAI/Claude CLI）
      │       → judge_backend == "agent"
      │           → openclaw agent           # 通过 OpenClaw Agent 调用裁判模型
      │       → _parse_judge_text()         # 解析 JSON 响应（多种格式兼容）
      │       → _normalize_judge_response() # 归一化 scores/total/notes
      └── grading_type == "hybrid"
          → _grade_automated() + _grade_llm_judge()
          → _combine_grades()              # 按权重合并分数

  → 记录分数 → grades_by_task_id[task_id]
  → _write_incremental_results()           # 写入部分结果 JSON（外部可监控）

所有任务完成后：
  → _build_and_write_results()             # 构建完整结果 JSON
      → _compute_efficiency_summary()       # Token 效率指标
      → _compute_category_scores()          # 按分类汇总
  → _log_category_summary()                 # 打印分类型得分
  → _log_efficiency_summary()               # 打印效率指标
  → upload_results(output_path)             # 上传到 pinchbench.com 排行榜
  → axiom.run_complete()                    # 可选 Axiom 遥测
```

## 整体架构

```
CLI 层          run.sh → benchmark.py main()           # 命令解析 + 编排
Service 层      BenchmarkRunner                         # 任务调度 + 结果汇总
Core 层         lib_tasks.py / lib_agent.py             # 任务加载 / Agent 执行
Grading 层      lib_grading.py                          # 三重评分体系
Upload 层       lib_upload.py                           # 排行榜上传
Analysis 层     lib_trend.py / lib_axiom.py             # 趋势分析 / 遥测
```

### 评分体系三层模型

```
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│  automated   │  │  llm_judge   │  │   hybrid     │
│  (纯代码)    │  │  (AI 裁判)   │  │  (两者结合)  │
├─────────────┤  ├──────────────┤  ├─────────────┤
│• exec() 执行 │  │• summariz() │  │• automated + │
│  Python 函数│  │  压缩对话    │  │  llm_judge  │
│• 检查文件存在│  │• 构建评分    │  │• weights 合并│
│  正确性      │  │  提示词     │  │  加权平均    │
│• 解析 JSON   │  │• API/Agent  │  │              │
│  输出内容    │  │  调用裁判    │  │              │
│• 返回分值    │  │• 解析 JSON  │  │              │
│  字典        │  │  响应       │  │              │
│              │  │• 缓存结果    │  │              │
└─────────────┘  └──────────────┘  └─────────────┘
```

### 任务状态机

```
[IDLE] → load_tasks() → [LOADED] → ensure_agent_exists() → [READY]
                                      ↓
                                  对每个 Task:
                                   ↓
                          execute_openclaw_task()
                                   ↓
          ┌───────────────────[RUNNING]───────────────────┐
          │                                                │
    成功完成 (exit=0)                             超时/错误
          │                                                │
    [GRADING]                                        [ERROR]
          │                                                │
   自动/LLM/混合评分                                记录失败原因
          │
    [COMPLETE] → grades_by_task_id[task_id]
          ↓
    _write_incremental_results()  # 实时更新部分结果
          ↓
    ─── 所有任务完成 ───
          ↓
    upload_results() → [PUBLISHED]
```

### Token 效率评估维度

PinchBench 不仅评分数，还评估效率：

| 指标                  | 计算方式                  |
| --------------------- | ------------------------- |
| `score_per_1k_tokens` | 总分 / (总 tokens / 1000) |
| `score_per_dollar`    | 总分 / 总成本             |
| `tokens_per_task`     | 总 tokens / 任务数        |
| `cost_per_task_usd`   | 总成本 / 任务数           |

## 核心抽象

- **`Task`**（`scripts/lib_tasks.py`）— 核心领域对象，代表一个基准测试任务
  - 关键字段：`task_id`, `name`, `category`, `grading_type`, `timeout_seconds`, `workspace_files`, `prompt`, `expected_behavior`, `grading_criteria`, `automated_checks`, `llm_judge_rubric`
  - 支持 `sessions` 多轮对话（frontmatter 中定义）

- **`TaskLoader`**（`scripts/lib_tasks.py`）— 任务加载器
  - 从 `tasks/manifest.yaml` 或 glob 发现任务
  - 解析 YAML frontmatter + Markdown 段落的 `.md` 文件
  - 管理分类映射（`category_map`）和顺序

- **`GradeResult`**（`scripts/lib_grading.py`）— 评分结果
  - 关键字段：`task_id`, `score`, `max_score`, `grading_type`, `breakdown`, `notes`
  - 三种评分路径：`_grade_automated()`, `_grade_llm_judge()`, `_combine_grades()`

- **`BenchmarkRunner`**（`scripts/benchmark.py`）— 编排器
  - 管理 Task 加载和 Agent 创建
  - 不直接执行任务（委托给 `execute_openclaw_task` 和 `grade_task`）

- **Agent-Transcript 交互模型**（`scripts/lib_agent.py`）
  - 通过 `subprocess` 调用 `openclaw agent` CLI
  - 从 `sessions/*.jsonl` 解析对话记录
  - 支持 multi-session（多轮对话、跨会话记忆测试）

## 关键文件速查

| 想了解什么                     | 去哪里找                                     |
| ------------------------------ | -------------------------------------------- |
| 项目总体介绍和用法             | `README.md`                                  |
| 所有可用任务列表和分类         | `tasks/manifest.yaml`                        |
| 如何创建新任务                 | `tasks/TASK_TEMPLATE.md`                     |
| 任务加载和解析逻辑             | `scripts/lib_tasks.py`                       |
| Agent 创建、执行、转录提取     | `scripts/lib_agent.py`                       |
| 自动评分 / LLM 裁判 / 混合评分 | `scripts/lib_grading.py`                     |
| 主编排流程和 CLI 参数          | `scripts/benchmark.py` (main 函数)           |
| 排行榜上传逻辑                 | `scripts/lib_upload.py`                      |
| 多轮对话任务如何工作           | `scripts/lib_agent.py` → `sessions` 字段处理 |
| 趋势分析（跨运行）             | `scripts/lib_trend.py`                       |
| CI 配置                        | `.github/workflows/`                         |
| 单元测试                       | `tests/`                                     |

## 核心依赖

| 库                              | 用途                                             |
| ------------------------------- | ------------------------------------------------ |
| `pyyaml`                        | 解析任务文件的 YAML frontmatter 和 manifest.yaml |
| `fabric` (>=3.2.2)              | SSH 远程执行（可能是 GWS 任务需要）              |
| `paramiko`                      | SSH 底层实现                                     |
| `uv`                            | 快速 Python 包管理器，替代 pip/venv              |
| `setuptools` + `setuptools-scm` | 构建和版本管理（从 git tag 自动提取版本号）      |

## 值得关注的设计决策

### 1. 三重评分体系（automated / llm_judge / hybrid）

不是简单地用代码评分或让 GPT 评分，而是提供了混合模式。适合简单的任务（如文件是否存在）用代码跑，复杂的任务（如邮件内容是否得体）用 LLM 裁判。`hybrid` 类型按权重合并两者，非常适合"有客观标准但又有主观判断"的场景。

### 2. 裁判缓存机制（judge cache）

LLM 裁判的评分结果是代价较高的（需要额外 API 调用），所以实现了基于 hash 的缓存（SHA256 of task_id + transcript_summary + rubric + model）。这个设计非常实用：

- 重复运行相同配置的 benchmark 时直接命中缓存
- 节省 API 成本和等待时间
- 可以 `--no-judge-cache` 禁用，`--clear-judge-cache` 清除

### 3. 会话发现的重试策略

OpenClaw 使用自己的 UUID 命名会话文件，不遵循外部传入的 `--session-id`。`_load_transcript()` 实现了一个 90 次重试的发现策略（每 1s 一次），用三种方式查找转录文件：

1. 从 `sessions.json` 解析真实 session ID
2. Glob 最近的 `.jsonl` 文件
3. 尝试传入的 session ID

这种容错设计在分布式/异步系统集成中很常见。

### 4. 并行评分 + 工作空间快照

当启用并行评分时（默认开启），当前任务的评分会提交到后台线程执行，主线程立即进入下一个任务。但下一个任务会重建工作空间，所以需要先对当前任务的工作空间做快照（`_snapshot_workspace_for_grading`），避免评分时读取错误的文件。这个设计非常巧妙地解决了"评分是 I/O 密集型，任务执行是 CPU 密集型"的特性。

### 5. Multi-session 任务支持

任务 frontmatter 中可以定义 `sessions` 数组，支持多轮对话。`new_session: true` 标记会启动全新的 OpenClaw 会话（模拟用户关闭后重新打开 Agent），但工作空间文件保留。这用于测试 Agent 的跨会话记忆能力——Agent 必须从文件系统中"记住"之前的工作。

### 6. 自定义 API 端点支持

通过 `--base-url` 和 `--api-key` 参数可以对接任意 OpenAI 兼容的 API 端点，绕开 OpenRouter。这对于：

- 测试内部部署的模型
- 使用代理/自定义网关
- 测试尚未通过 OpenRouter 提供的新模型

### 7. Core Tasks 快速基准模式

`--core` 参数从 53+ 任务中筛选出 ~25 个代表性任务（覆盖所有分类，优先 automated 评分），让快速基准测试更实用。选择标准写在 `manifest.yaml` 的注释中。

### 8. 增量结果写入

在整个 benchmark 运行过程中，部分结果会被不断写入 JSON 文件。这允许外部工具（如 CI 系统、监控面板）实时轮询进度，而不需要等所有任务执行完毕。

---

_报告生成时间：2026-05-08_
_项目版本：2.0.0-rc1_
