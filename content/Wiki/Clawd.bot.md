---
created: 2026-01-26 10:09
url: https://clawd.bot/
tags:
---
**clawd.bot = 一个“长期在线的 AI 消息网关 + Agent 宿主”**

https://docs.clawd.bot/

它的核心作用是：

> **把 WhatsApp / Telegram / Discord / iMessage 等聊天平台  
> 桥接到一个或多个 AI Agent（本地或远程）**

你发一条消息 👉 clawd.bot 接住 👉 转给 AI 👉 再把回复发回聊天软件。

# 典型场景

## 1. 自动化监控

**场景：** 你想买火车票，但经常卖光

**ClawdBot 做法：**
```
每天早上 8 点 / 晚上 8 点
  → 查询 12306 余票
  → 有票？发 Discord 消息通知你
  → 没票？静默
```

**你要做的：** 0（设置好就不管了）


## 2. 跨平台消息中转

**场景：** Discord 的消息想同步到 Telegram

**ClawdBot 做法：**
```
Discord 有人 @ 你
  → ClawdBot 收到
  → 转发到你的 Telegram
  → 你在 Telegram 回复
  → ClawdBot 转回 Discord
```

**效果：** 一个 bot 管所有渠道


## 3. 定时任务 + 真实操作

**场景：** 每天早上想知道天气

**ClawdBot 做法：**
```python
# 每天 08:00
weather = fetch_weather("波士顿")
send_discord("#general", f"早安！今天 {weather}")
```


## 4. 复杂研究任务

**场景：** "帮我分析最近 AI 领域的热点"

**ClawdBot 做法：**
```
1. 搜索 Hacker News + Reddit AI 板块
2. 抓取 top 10 讨论
3. 总结关键话题
4. 生成 markdown 报告
5. 发给你
```

**时间：** 2 分钟（你自己查得半小时）


## 5. 代码执行 + 调试

**场景：** "帮我跑个 Python 脚本看看输出"

**ClawdBot 做法：**
```bash
# 收到你的脚本
write_file("test.py", your_code)
exec("python test.py")
# 报错了？
fix_code()
exec("python test.py")
# 成功，返回结果
```

**对比普通 ChatGPT：** 它只能给你代码，你自己复制粘贴去跑


## 6. 生成子代理干活

**场景：** "帮我写个看板应用"（复杂任务）

**ClawdBot 做法：**
```
你：写个看板
我：好的，spawn 一个子 agent
    ↓
子 agent: 
  - 设计架构
  - 写 Next.js 代码
  - 测试运行
  - 完成通知你
```

```
    ↓
你：收到完成的项目
```

**就像 Alex Finn 的 "Henry" 在他吃炸鸡时帮他写应用**



## 7. 文件管理 + 整理

**场景：** "整理我的下载文件夹"

**ClawdBot 做法：**
```bash
ls ~/Downloads
```

```bash
# 发现 100 个文件乱七八糟
分类：
  图片 → ~/Pictures/
  PDF → ~/Documents/
  视频 → ~/Videos/
  删除重复文件
  按日期整理
# 完成，给你报告
```


## 8. API 集成自动化

**场景：** "GitHub 有新 issue 通知我"

**ClawdBot 做法：**
```
每小时检查一次
  → gh api repos/你的仓库/issues
  → 发现新 issue？
  → Discord 通知 + 摘要
```

---

## 9. 数据抓取 + 分析

**场景：** "帮我跟踪竞品价格"

**ClawdBot 做法：**

```
每天中午：
  → 抓取亚马逊商品页
  → 提取价格
  → 记录到 CSV
  → 价格下降？通知你
  → 生成价格趋势图
```


## 10. DevOps 监控 + 响应
```
服务器报警
  → ClawdBot 收到 webhook
  → 检查日志、分析原因
  → 简单问题？自动修复（重启服务）
  → 复杂问题？通知工程师 + 附诊断报告
```

**省下的：** 半夜被叫醒的次数


```
  → 生成合规报表（GDPR / SOC2）
  → 发送给合规团队
  → 归档到云盘
```

**省下的：** 人工整理 2 天 → 自动 2 分钟


## 11. 工单系统桥接
```
Slack 有人说 "创建工单"
  → ClawdBot 问几个问题
```

```
  → 自动填 Jira ticket
  → 分配给相关团队
  → 进度更新同步回 Slack
```

**效果：** 不用离开聊天工具


# 核心区别

| 普通 Chatbot | ClawdBot |
|-------------|----------|
| 输出文字 | **真的执行** |
| 单次对话 | **24/7 运行** |
| 聊完就忘 | **持久记忆** |
| 只能回答 | **主动通知** |
| 一个平台 | **跨平台** |


**简单说：ClawdBot = 远程员工，不是聊天机器人** 🦀

## 不适合的场景

**ClawdBot 不擅长：**
- ❌ 需要毫秒级响应的（高频交易）
- ❌ 严格实时的（医疗监控）
- ❌ 100% 不能出错的（金融结算）
- ❌ 需要物理操作的（机器人控制）

**它擅长：**

- ✅ 重复性工作自动化
- ✅ 信息整合 + 决策辅助
- ✅ 跨系统协调
- ✅ 人机协作（AI 初筛 + 人类决策）

# 技术原理

