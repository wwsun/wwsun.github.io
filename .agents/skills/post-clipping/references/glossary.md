# 术语参考表

> 已定译术语的规范译法。翻译新文章时先查此表；文中术语已收录的直接沿用表中译法，未收录的根据上下文定译，并在归档时按英文首字母排序追加到本表。同一术语的译法一旦收录即固定，不再更改。

| 英文                             | 中文                    | 说明                                                                                         |
| -------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| `<dialog>`                       | `<dialog>` 元素         | 原生 HTML 对话框元素，支持模态和顶层行为                                                     |
| agent                            | 智能体                  | 能自主执行任务的 AI 程序，文中指作者组建的「AI 员工」                                        |
| agent harness                    | 智能体编排框架          | 管理和编排智能体的基础设施层，包括系统提示词、工具集成等                                     |
| agent skill                      | 智能体技能              | 结构化的提示词文件，加载进智能体上下文以改变其行为                                           |
| agentic capabilities             | 智能体能力              | 能够自主规划、调用工具并执行多步任务的能力                                                   |
| agentic coding                   | 智能体编码              | 模型自主完成多步骤、复杂编码任务的能力                                                       |
| agentic lineage                  | 智能体血缘              | 记录智能体为何做出某个决策的可追溯链路，是传统数据血缘在「为什么」维度上的扩展               |
| AI coding agents                 | AI 编程智能体           | 辅助编写代码的 AI 工具，如 Gemini CLI、Claude Code、Copilot CLI 等                           |
| alignment                        | 对齐                    | 确保 AI 系统行为符合人类意图和价值观的研究领域                                               |
| allowed tools                    | 允许的工具              | 无需每次请求许可即可由 Copilot 运行的工具白名单                                              |
| allowlist                        | 白名单                  | 明确允许 Copilot 执行的操作清单                                                              |
| ANTHROPIC_*                      | ANTHROPIC_*（保留）     | 唯一被允许进入沙盒容器的机密（Anthropic API 密钥）                                           |
| API key                          | API 密钥                | 用于标识应用程序的长期凭证                                                                   |
| Arc-AGI 3                        | ARC-AGI 3               | 评估模型解决新颖问题的评测基准                                                               |
| artifacts                        | 工件                    | Claude 生成的独立交互式内容（如 HTML 页面），可作为引用传递给智能体                          |
| AskUserQuestion                  | AskUserQuestion 工具    | Claude 用于向用户提出澄清问题的内置工具                                                      |
| attacker-defender asymmetry      | 攻防不对称              | 攻击方与防御方在成本和难度上的结构性差距                                                     |
| Authorization header             | Authorization 头        | HTTP 请求中携带认证信息的请求头                                                              |
| auto-memory                      | 自动记忆                | Claude 自动保存与工作相关的记忆，无需用户手动操作                                            |
| Baseline                         | Baseline                | Web 平台特性兼容性基准，由 Chrome 推动的标准                                                 |
| Baseline 2025                    | 基线 2025               | MDN 的浏览器兼容性分级，表示跨主流浏览器已广泛可用                                           |
| Bearer Token                     | 承载令牌                | 一种谁持有谁就能访问的安全令牌                                                               |
| biological threats               | 生物威胁                | AI 被用于设计或制造生物武器的风险                                                            |
| blast radius                     | 爆炸半径                | 安全事故可能影响的范围                                                                       |
| Block                            | Block/代码块            | CodePen 中可插入的预配置代码模块                                                             |
| brand damage                     | 品牌信任损耗            | 因决策失误导致用户对品牌的信任和好感度下降                                                   |
| business rule                    | 业务规则                | 决定业务行为合法性与逻辑的规则，与基础设施代码相对                                           |
| C2PA                             | C2PA                    | 内容来源与真实性联盟的开放标准，记录文件来源                                                 |
| canUseTool                       | canUseTool 回调         | 查询选项中传入的回调，Claude 需要用户输入时触发                                              |
| capability model                 | 能力模型                | 描述智能体可执行操作的受治理清单，回答「能做什么」；携带权限、前置条件与可逆性               |
| capital expenses (CapEx)         | 资本支出                | 用于购置或升级长期资产的投入                                                                 |
| Caveman                          | Caveman                 | 压缩 AI 输出、只留精炼符号的技能                                                             |
| checkpoint                       | 检查点                  | 会话上下文被压缩时生成的摘要快照                                                             |
| circular revenues                | 循环收入                | 少数公司之间相互投资和采购形成的封闭收入链条                                                 |
| classification                   | 安全分类器              | 检测并阻止模型执行不安全请求的防护机制                                                       |
| Claude Cowork                    | Claude Cowork           | Anthropic 推出的团队协作类智能体产品，被视为 Claude Code 的换皮版本                          |
| Claude Max                       | Claude Max              | Anthropic 面向重度用户的高价订阅套餐，分 100 美元/月（5x）和 200 美元/月（20x）两档          |
| Claude Pro                       | Claude Pro              | Anthropic 面向个人用户的入门级订阅套餐，价格为 20 美元/月                                    |
| CLEC                             | 竞争性本地交换运营商    | 2000 年电信泡沫中大量涌现又迅速消失的电信公司                                                |
| Code of Practice                 | 行为准则                | 欧盟《AI 生成内容透明度行为准则》，约 190 个签署方                                           |
| codebase archaeology             | 代码库考古              | 在改动之前系统性地理解既有代码结构、行为与约束的过程                                         |
| CodePen                          | CodePen                 | 在线前端代码编辑器和社区平台                                                                 |
| Codex                            | Codex                   | OpenAI 推出的编程智能体产品，与 Claude Code 存在直接竞争关系                                 |
| commandFor / commandfor          | commandFor 属性         | 将按钮变为「命令调用器」，值为被控制元素的 ID                                                |
| compaction                       | 压缩                    | 自动汇总对话历史、保留关键信息的上下文管理机制                                               |
| Container Queries                | 容器查询                | 基于父容器尺寸而非视口宽度进行响应式布局的 CSS 特性                                          |
| content credential               | 内容凭证                | 文件元数据中加密签名的来源说明                                                               |
| context engineering              | 上下文工程              | 系统化地设计和组装智能体所见上下文（系统提示词、Skills、记忆等）的工程实践                   |
| context window                   | 上下文窗口              | 模型一次能处理的输入 Token 上限                                                              |
| Context7                         | Context7                | 按需拉取特定版本库文档的技能                                                                 |
| CSS Anchor Positioning           | CSS 锚点定位            | 允许一个元素基于另一个元素定位的 CSS 新特性                                                  |
| custom instructions              | 自定义指令              | 用户或仓库提供的指令文件，用于约束 Copilot 的行为与规范                                      |
| Cyber Verification Program (CVP) | 网络安全验证计划        | Anthropic 为企业和研究人员提供的受限网络安全测试通道                                         |
| data as a product                | 数据即产品              | 每个数据集像 API 一样有署名所有者、发布契约与版本化生命周期                                  |
| data contract                    | 数据契约                | 以代码形式声明数据集的 schema、质量规则与新鲜度 SLA 的约定，把「schema 即法律」落到 CI/CD 里 |
| declarative                      | 声明式                  | 直接描述「是什么/要什么」，而非编写实现步骤                                                  |
| deferred loading                 | 延迟加载                | 工具的完整定义在智能体主动搜索后才加载，避免占用上下文                                       |
| delegate                         | 委派                    | 把任务交给云端 Copilot 智能体异步执行                                                        |
| delegated access                 | 委托访问                | 智能体以调用者本人的权限行动，而非宽泛的服务账户                                             |
| dependency map                   | 依赖图                  | 描述模块之间依赖关系的图谱                                                                   |
| deploy                           | 部署                    | 将代码发布到可访问的线上地址                                                                 |
| Desktop extension (DXT)          | 桌面扩展                | Claude Desktop 应用中用于一键安装本地 MCP 服务器的打包格式                                   |
| Deslop                           | Deslop                  | 清除 AI 生成痕迹（slop）的技能                                                               |
| dialog                           | 对话框                  | 浏览器原生模态对话框元素                                                                     |
| diseconomies of scale            | 规模不经济              | 规模扩大反而导致单位成本上升的反常现象                                                       |
| distillation                     | 蒸馏                    | 用小模型学习大模型输出的技术，可大幅降低训练计算成本                                         |
| domain model                     | 领域模型                | 描述业务实体及其关系的定义，回答「有什么」；只被查询，从不被执行                             |
| drift risk                       | 漂移风险                | 双份实现因不同步而产生行为差异的风险                                                         |
| dual-use                         | 双重用途                | 同一技术可同时用于有益和有害目的                                                             |
| economies of scale               | 规模经济                | 规模扩大带来单位成本下降的正向效应                                                           |
| effort setting                   | 努力程度设置            | 用户可调参数，决定模型投入多少计算资源以在智能和成本间取舍                                   |
| egress                           | 出网/出站               | 容器向外部网络发起请求的能力                                                                 |
| embedding                        | 嵌入                    | 将文本映射为高维向量的表示方式，用于语义检索                                                 |
| entry point                      | 入口点                  | 业务流程开始执行的位置（API、队列、定时任务、脚本等）                                        |
| EU AI Act                        | 欧盟《人工智能法案》    | 要求 AI 系统提供商标记 AI 生成内容                                                           |
| evals                            | 评估                    | 用带标注的测试集量化模型或系统质量的机制                                                     |
| exponential backoff              | 指数退避                | 重试失败请求时逐次成倍延长等待时间的策略                                                     |
| fan-in / fan-out                 | 扇入 / 扇出             | 一个模块被依赖的广度 / 一个模块依赖他人的广度                                                |
| fine-tuning                      | 微调                    | 在预训练模型上针对特定任务或风格继续训练                                                     |
| free tier                        | 免费档                  | 产品不收取费用、面向所有用户的档位                                                           |
| Fork                             | Fork/派生               | 复制他人的项目到自己的账户中继续开发                                                         |
| freshness SLA                    | 新鲜度 SLA              | 规定数据必须在指定时限内完成刷新的服务级别协议，超时即视为过期数据                           |
| frontier intelligence            | 前沿智能                | 指当前最先进的 AI 模型能力边界                                                               |
| frontier models                  | 前沿模型                | 当前能力最强的 AI 模型                                                                       |
| Frontier-Bench                   | Frontier-Bench          | 评估模型完成复杂软件工程任务的前沿基准测试                                                   |
| gotchas                          | 暗坑                    | 代码库中的反直觉设计或陷阱，需要在配置文件中特别说明                                         |
| GraphRAG                         | GraphRAG                | 微软提出的图检索增强生成方法，用社区检测处理传统 RAG 无法回答的抽象查询                      |
| guardrails                       | 护栏                    | AI 系统的安全防护机制，用于限制有害输出                                                      |
| Head of Growth                   | 增长负责人              | 企业内负责用户增长策略的高管职位                                                             |
| held-out test set                | 留存测试集              | 迭代优化工具时不参与调优、专门用来检验是否过拟合的独立测试集                                 |
| Hermes                           | Hermes                  | 一种 Agent 运行时框架                                                                        |
| high-impact workflows            | 高影响力工作流          | 频繁执行且对业务结果影响大的关键任务场景，是工具设计应优先覆盖的对象                         |
| host proxy                       | 主机代理                | 沙盒工具通过薄封装转发请求到主机侧路由，由主机持有凭证完成外部调用                           |
| host-threaded                    | 主机注入/主机透传       | 机密从主机环境按次注入容器，而非固化在容器内                                                 |
| idempotent                       | 幂等                    | 重复执行多次与执行一次产生相同效果的性质                                                     |
| implicit contract                | 隐式契约                | 未用接口声明的、外部消费者依赖的隐性约定（响应结构、事件格式等）                             |
| industrial-scale distillation    | 工业级蒸馏              | 大规模、系统性地通过蒸馏复制先进模型能力的行为                                               |
| infinite sessions                | 无限会话                | 通过智能压缩自动管理上下文、不担心耗尽上下文的会话机制                                       |
| INP                              | 交互到下次绘制          | Interaction to Next Paint，衡量交互响应性的性能指标                                          |
| interleaved thinking             | 交织式思考              | 允许模型在多次工具调用之间穿插推理过程的扩展思考功能                                         |
| Internet Archive                 | 互联网档案馆            | 长期保存网页历史快照的非营利数字图书馆                                                       |
| Invoker Commands API             | 调用器命令 API          | 声明式地把行为赋给按钮、进而控制交互元素的新 Web API                                         |
| judgement                        | 判断力                  | 模型在无显式规则的情况下，根据上下文做出合理决策的能力                                       |
| just-in-time credentials         | 即时凭证                | 为单个具体任务签发、短时有效的临时凭证，任务完成即失效                                       |
| JWT                              | JWT（JSON Web Token）   | 一种结构化、自包含、加密签名的令牌格式                                                       |
| knowledge graph                  | 知识图谱                | 用图结构存储实体及其关系，支持深度不确定的遍历推理                                           |
| landing page                     | 落地页                  | 用户从搜索结果或广告点击后到达的营销页面                                                     |
| landmark                         | 地标                    | 用于标识页面主要区域的语义角色（如 nav、main）                                               |
| least privilege                  | 最小权限                | 只授予完成任务所必需权限的安全原则                                                           |
| legacy codebase                  | 遗留代码库              | 由他人编写、缺乏文档、长期演进的老旧代码系统                                                 |
| lethal trifecta                  | 致命三要素              | Simon Willison 提出的三个危险条件：能访问私有数据、接触不可信内容、具备对外通信渠道          |
| Linear                           | Linear                  | 项目管理/工单跟踪工具                                                                        |
| Live View                        | 实时视图                | CodePen 提供的可分享的实时预览页面                                                           |
| magic value                      | 魔法值                  | 代码中含义不明的硬编码数值或常量                                                             |
| MCP                              | MCP（模型上下文协议）   | 连接智能体与外部工具的开放协议                                                               |
| MCP server                       | MCP 服务器              | 模型上下文协议服务器，为智能体提供工具能力                                                   |
| me-in-the-loop                   | 人在环内                | 关键决策仍需人工参与的工作模式                                                               |
| medallion architecture           | 奖章架构                | 按 Bronze/Silver/Gold 分层组织数据的分析型数据设计模式，智能体只读 Gold 及以上               |
| memory layer                     | 记忆层                  | 为跨会话或跨用户保存上下文的系统                                                             |
| middle-mile fiber                | 中程光纤                | 连接数据中心与主干网络的中间传输层光纤                                                       |
| mirrored client                  | 镜像客户端              | 在沙盒内复制一份与主机侧保持同步的客户端逻辑                                                 |
| MJML                             | MJML                    | 一种专门用于编写响应式邮件模板的标记语言                                                     |
| Mnemosyne                        | Mnemosyne               | 一个记忆库系统，为智能体提供持久记忆                                                         |
| Modern Web Guidance              | 现代 Web 指南           | Chrome 团队推出的智能体技能集，嵌入现代 Web 平台指南到 AI 编码工作流                         |
| modular training strategies      | 模块化训练策略          | Anthropic 提出的提高开源权重模型安全性的训练方法                                             |
| monorepo                         | 单仓库                  | 将多个项目集中在单一代码仓库中的管理模式                                                     |
| multi-agent orchestration        | 多智能体编排            | 由多个智能体通过图结构协作完成任务的架构模式                                                 |
| multiSelect                      | 多选                    | 是否允许用户选择多个选项                                                                     |
| namespacing                      | 命名空间化              | 按服务或资源为工具名加前缀/后缀分组，避免代理混淆相似工具                                    |
| NICAR                            | NICAR                   | 美国计算机辅助报道年会，是数据新闻记者的行业会议                                             |
| NIP                              | NIP                     | Nostr Implementation Possibility，Nostr 协议规范编号                                         |
| Nostr                            | Nostr                   | 去中心化社交协议，基于密钥对和事件                                                           |
| npm                              | npm                     | Node.js 的包管理器                                                                           |
| OAuth 2.0                        | OAuth 2.0               | 开放授权协议，常用于第三方授权                                                               |
| Obsidian                         | Obsidian                | 基于本地 Markdown 的笔记/知识库软件                                                          |
| onboarding                       | 上手                    | 新加入项目时快速熟悉代码库的过程                                                             |
| Opaque token                     | 不透明令牌              | 对客户端无意义的随机字符串令牌                                                               |
| open-weights models              | 开源权重模型            | 公开模型权重参数但可能不公开训练数据或代码的 AI 模型                                         |
| OSS-Fuzz                         | OSS-Fuzz                | 评估模型发现和利用软件漏洞能力的评测                                                         |
| over-engineering                 | 过度设计                | 为尚未出现或不存在的问题提前引入不必要的复杂度                                               |
| package.json                     | package.json            | Node.js 项目的依赖和元数据配置文件                                                           |
| pagination                       | 分页                    | 把工具返回结果拆分为多页返回，避免单次响应占用过多上下文                                     |
| Pen                              | Pen/Pen                 | CodePen 上的单个项目/代码片段                                                                |
| permission mode                  | 权限模式                | 如 acceptEdits、bypassPermissions、plan 等模式                                               |
| permission rule                  | 权限规则                | 决定工具调用是否自动批准的规则                                                               |
| PermissionResultAllow            | 允许结果                | 回调返回的「允许」响应类型                                                                   |
| PermissionResultDeny             | 拒绝结果                | 回调返回的「拒绝」响应类型                                                                   |
| pricing grid                     | 定价表格                | 官网对比各套餐功能与价格的表格                                                               |
| plan mode                        | 计划模式                | 在写代码前先生成结构化实施计划的模式                                                         |
| PMS_U                            | PMS_U（保留）           | 主机持有的业务机密，用于 query_material_library / mws_call                                   |
| popover                          | 弹出层                  | 浏览器原生支持的浮层元素，通过 `popover` 属性声明                                            |
| Popover API                      | 弹出框 API              | 浏览器原生弹出框能力，无需 JavaScript 实现                                                   |
| PreToolUse                       | PreToolUse 钩子         | 在其余流程之前执行、可允许/拒绝/修改请求的钩子                                               |
| progressive disclosure           | 渐进式披露              | 按需加载信息的设计模式，只在必要时提供上下文，而非一次性全部给出                             |
| progressive enhancement          | 渐进增强                | 先保证基本功能，再对高级浏览器增强体验的策略                                                 |
| prompt cache                     | 提示词缓存              | 缓存对话前缀以降低 Token 消耗和延迟的机制                                                    |
| prompt engineering               | 提示词工程              | 通过精心设计提示文本（如工具描述）引导模型行为的技术                                         |
| prompt injection                 | 提示注入                | 通过投毒内容劫持智能体行为并窃取数据的攻击方式                                               |
| prop drilling                    | 属性层层传递            | 通过多层组件逐级传递 props 的反模式                                                          |
| prosumer                         | 专业消费者              | 介于普通消费者与专业用户之间、对产品功能要求更高的用户群体                                   |
| quarantine pattern               | 隔离模式                | 不合规数据在进入智能体可见存储前被拦截并转入死信队列的熔断机制                               |
| random number generator          | 随机数生成器            | 用于在候选词之间做随机选择的机制                                                             |
| ratepayers                       | 缴费用户                | 公共事业（电力、水务）的终端付费用户                                                         |
| refactoring                      | 重构                    | 在不改变外部行为的前提下改善代码内部结构                                                     |
| Refresh token                    | 刷新令牌                | 用于换取新访问令牌的长效令牌                                                                 |
| reranker                         | 重排器                  | 对初步检索结果重新排序以提升相关性的组件                                                     |
| ResponseFormat                   | 响应格式枚举            | 工具参数中让代理选择返回「详细版」或「简洁版」内容的设计                                     |
| retrieval                        | 检索                    | 从外部知识源获取相关信息再喂给模型                                                           |
| retrieval-augmented generation   | 检索增强生成            | 结合信息检索与文本生成的技术，简称 RAG                                                       |
| RSC                              | React Server Components | React 服务端组件                                                                             |
| rubrics                          | 评定标准                | 一组用于评估输出质量的参考标准，可让验证智能体据此评判结果                                   |
| rug-pulled                       | 过河拆桥                | 服务或承诺被提供方突然撤销，使依赖它的用户措手不及                                           |
| sandbox execution model          | 沙盒执行模型            | 工具在沙盒内直连外部服务，还是经由主机代理转发的两种模式                                     |
| scaling laws                     | 缩放定律                | 描述模型规模、数据量和计算量对性能影响的经验规律                                             |
| scheduler.yield()                | scheduler.yield()       | 将主线程控制权交还给浏览器的调度 API                                                         |
| Scope                            | 权限范围                | 令牌所授权访问的资源范围                                                                     |
| semantic HTML                    | 语义化 HTML             | 使用有意义的标签和属性来表达文档结构                                                         |
| semantic layer                   | 语义层                  | 对指标与业务实体含义的声明式定义层，把分析师脑中的上下文搬进数据本身                         |
| semantic model                   | 语义模型                | 描述指标如何计算的版本化定义，回答「数字怎么算」；编译为一致的 SQL                           |
| Sentry                           | Sentry                  | 应用性能监控与错误追踪平台                                                                   |
| sharding                         | 分片                    | 将数据或负载拆分到多个节点以扩展容量的手段                                                   |
| side effect                      | 副作用                  | 函数除返回值外对外部状态产生的可观察影响（写库、发消息、发邮件等）                           |
| specs                            | 规格说明                | 定义项目需求和技术规范的文件                                                                 |
| state-of-the-art (SOTA)          | 最先进水平              | 在特定评测中达到的最佳性能                                                                   |
| stranded investments             | 沉没投资                | 已投入但因项目终止无法收回的资产                                                             |
| streaming input                  | 流式输入                | 在任务中途向 Claude 发送新指令的能力                                                         |
| sub-agent                        | 子智能体                | 为完成子任务而在独立上下文中生成的智能体                                                     |
| sub-agents                       | 子智能体                | 由主智能体派生、并行执行子任务的小型智能体                                                   |
| suggestions                      | 建议项                  | 回调第三个参数携带的、可避免重复询问的权限更新建议                                           |
| Superpowers                      | Superpowers             | 强制端到端软件工程工作流的智能体技能包                                                       |
| SWE-bench Verified               | SWE-bench Verified      | 评估模型自主解决真实软件工程问题能力的权威基准测试                                           |
| SynthID-Text                     | SynthID-Text            | Google DeepMind 于 2024 年在 Nature 发表的水印技术                                           |
| system prompt                    | 系统提示词              | 在每次对话开始时注入模型的全局指令，定义其行为和产品上下文                                   |
| TDD (Test-Driven Development)    | 测试驱动开发            | 先写失败测试再实现、最后重构的开发方法                                                       |
| testing culture                  | 「做测试」文化          | 企业中即便点子看起来不靠谱也倾向于先小范围上线测试、用数据验证的做法                         |
| token                            | Token                   | 语言模型生成文本的最小单位                                                                   |
| tool affordances                 | 工具行动空间            | 代理能够感知并借助工具采取的行动方式的集合，源自人机交互中的“示能”概念                       |
| top layer                        | 顶层                    | 浏览器渲染中位于所有元素之上的特殊层级，用于 dialog、popover 等                              |
| traces and spans                 | 追踪与跨度              | 从分布式系统可观测性借用的审计模型：一条 trace 记录端到端工作流，每个 span 是一个步骤        |
| truncation                       | 截断                    | 工具响应过长时只保留部分内容，并提示代理如何获取剩余信息                                     |
| trust bonfire                    | 信任大火                | 比喻因失误或欠缺透明沟通而迅速烧掉的用户信任                                                 |
| updatedInput / updated_input     | 修改后的输入            | 允许时可选返回的、经过修改的工具输入                                                         |
| updatedPermissions               | 更新权限                | 回显建议的权限规则，让后续匹配调用跳过询问                                                   |
| vector database                  | 向量数据库              | 存储和检索向量嵌入的数据库，用于语义相似度搜索                                               |
| verifier agent                   | 验证智能体              | 根据评定标准检查其他智能体输出的专用子智能体                                                 |
| watermark detection API          | 水印检测 API            | Anthropic 即将提供的检测文本是否由 Claude 生成的服务                                         |
| watermarking                     | 水印                    | 在生成文本中嵌入可检测模式，用于判断文本来源                                                 |
| write-back                       | 写回                    | 智能体不止读数据，还能创建记录、更新系统、触发工作流                                         |
| 対拍 test                        | 对拍测试                | 双实现并行运行、对比输出以检测漂移的一致性测试                                               |
| 机房网（intranet）               | 内网                    | 公司内部网络，`open-inner.popo.netease.com` 所在环境                                         |
