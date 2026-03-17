# wwsun's Digital Garden

> [!tip]
> 这是一个基于 **Quartz v4** 构建、通过 **Obsidian** 管理的数字花园。它不仅是博客，更是一个互联的知识库。

## 快速开始

### 本地预览

在本地启动预览服务器（支持热重载）：

```bash
npx quartz build --serve
```

### 同步与部署

将更改同步到远程存储库并触发部署：

```bash
npx quartz sync
```

## 存储库结构

- **`content/`**: 花园的核心内容。
  - `blogs/`: 深度长文与原创博客。
  - `wiki/`: 常青笔记与结构化知识。
  - `clippings/`: 经过优化的 Web 剪报与译文。
  - `books/`: 读书笔记与摘要。
  - `projects/`: 特定项目的研究与记录。
- **`.agents/`**: 为 AI 代理定制的自动化技能（Skills）。
- **`quartz.config.ts`**: 站点标题、语言及插件配置。

## 维护与验证

为了保持文档的格式正确，需要定期执行：

- `npm run format`: 应用 Prettier 格式化，保持代码和文档整洁。
- `npm run check`: 运行全局验证，检查断链、类型错误及构建完整性。

---

Powered by [Quartz](https://quartz.jzhao.xyz/) & [Obsidian](https://obsidian.md/).
