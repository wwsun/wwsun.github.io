---
title: 学习软件系统设计
description:
tags:
  - system-design
  - software-engineering
  - course
  - clippings
source:
---

# 学习软件系统设计

原文：https://www.freecodecamp.org/news/learn-software-system-design/

---

## 课程概述

提升你的系统设计技能！

freeCodeCamp.org YouTube 频道刚刚发布了一门系统设计课程，从基础概念到生产级系统，涵盖数据库、扩展和负载均衡等主题。你将学习构建和保护 API 的实用技术，包括 RESTful 和 GraphQL。

本课程由 **Hayk Simonyan** 开发。

---

## 课程内容

### 1. 简介 (Introduction)

课程概述和学习目标介绍。

### 2. 单服务器架构 (Single Server Setup)

- 最基础的系统架构模式
- 单点部署的优缺点
- 适用场景和局限性

### 3. 数据库：SQL、NoSQL、图数据库 (Databases: SQL, NoSQL, Graph)

- **SQL 数据库**：关系型数据库的核心概念和适用场景
- **NoSQL 数据库**：文档型、键值型、列族型数据库的特点
- **图数据库**：处理复杂关系数据的最佳实践

### 4. 垂直扩展 vs 水平扩展 (Vertical vs Horizontal Scaling)

- **垂直扩展（Scale Up）**：提升单机性能
- **水平扩展（Scale Out）**：增加服务器数量
- 两种扩展策略的权衡和选择

### 5. 负载均衡 (Load Balancing)

- 负载均衡器的工作原理
- 常见算法：轮询、最少连接、IP 哈希等
- 高可用架构中的负载均衡实践

### 6. 健康检查 (Health Checks)

- 服务健康检查机制
- 主动检查 vs 被动检查
- 故障检测和自动恢复

### 7. 单点故障 (Single Point of Failure, SPOF)

- 识别系统中的单点故障
- 消除单点故障的策略
- 冗余设计和故障转移

### 8. API 设计 (API Design)

- API 设计原则和最佳实践
- 版本控制策略
- 错误处理和响应规范

### 9. API 协议 (API Protocols)

- 常见 API 通信协议对比
- 选择合适的协议 for 不同场景

### 10. 传输层：TCP、UDP (Transport Layer: TCP, UDP)

- **TCP**：可靠传输、连接导向
- **UDP**：快速传输、无连接
- 两种协议在系统设计中的选择

### 11. RESTful APIs

- REST 架构风格的核心原则
- HTTP 方法：GET、POST、PUT、DELETE 等
- 资源命名和 URI 设计
- 状态码和响应格式

### 12. GraphQL

- GraphQL 查询语言基础
- 与 REST 的对比
- Schema 设计和 Resolver 实现
- 优点：精确数据获取、减少请求次数

### 13. 认证 (Authentication)

- 用户身份验证机制
- Session、Token、JWT 等方案
- OAuth 2.0 和 SSO 集成

### 14. 授权 (Authorization)

- 权限控制模型：RBAC、ABAC
- 访问控制列表（ACL）
- 安全最佳实践

### 15. 安全 (Security)

- 常见安全威胁和防护措施
- HTTPS/TLS 加密传输
- 输入验证和防注入攻击
- 速率限制和 DDoS 防护

---

## 观看课程

完整课程可在 [freeCodeCamp.org YouTube 频道](https://www.youtube.com/watch?v=C842vFY5kRo) 观看，时长约 **2 小时**。

---

## 学习路径建议

```
基础概念
    ↓
单服务器架构
    ↓
数据库选型
    ↓
扩展策略
    ↓
高可用设计
    ↓
API 设计与安全
```

---

## 关键知识点总结

| 主题     | 核心概念                                    |
| -------- | ------------------------------------------- |
| 扩展性   | 垂直扩展 vs 水平扩展                        |
| 高可用   | 负载均衡、健康检查、消除单点故障            |
| 数据库   | SQL（结构化）、NoSQL（灵活）、Graph（关系） |
| API 风格 | REST（简单通用）、GraphQL（灵活精确）       |
| 传输协议 | TCP（可靠）、UDP（快速）                    |
| 安全     | 认证（身份）、授权（权限）、传输加密        |

---

## 适用人群

- 准备系统设计面试的开发者
- 希望提升架构设计能力的后端工程师
- 想要了解分布式系统基础的技术人员
- 从开发转向架构设计的工程师

---

_课程由 Hayk Simonyan 开发，freeCodeCamp.org 出品_
