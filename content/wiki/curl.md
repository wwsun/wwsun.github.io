---
title: "curl 指南：接口调试必备"
date: 2026-04-04 23:18:00
tags:
  - devtools/curl
  - network
  - cli
description: "面向开发者的 curl 实战指南，涵盖接口验证、JSON 发送、身份认证及调试调试技巧。"
---

# curl 指南：接口调试必备

`curl` (Client URL) 是开发过程中进行本地接口验证和网络调试的最强工具。比起 Postman 或 Insomnia，它更轻量且易于在脚本或 SSH 环境中使用。

## 1. 快速参考 (Cheat Sheet)

| 参数 | 说明                       | 示例                                  |
| :--- | :------------------------- | :------------------------------------ |
| `-X` | 指定 HTTP 方法             | `-X POST`                             |
| `-H` | 添加请求头                 | `-H "Content-Type: application/json"` |
| `-d` | 发送请求体数据             | `-d '{"id": 1}'`                      |
| `-v` | **详细模式**（显示全过程） | `curl -v localhost:8080`              |
| `-i` | 显示响应头 + 响应体        | `curl -i google.com`                  |
| `-I` | **仅获取响应头** (HEAD)    | `curl -I google.com`                  |
| `-L` | 跟随重定向                 | `curl -L http://bit.ly/xxx`           |
| `-k` | **忽略 SSL 证书检查**      | `curl -k https://localhost:8443`      |
| `-o` | 将响应保存到文件           | `curl -o response.json <url>`         |

---

## 2. 核心场景实战

### GET 请求：获取数据

最简单的方式，直接输入 URL。

```bash
curl https://api.example.com/users?id=123
```

### POST/PUT 请求：发送 JSON

> [!TIP]
> 绝大多数本地接口验证都需要发送 JSON。`-H` 指定头部，`-d` 发送原始数据。

```bash
curl -X POST https://api.example.com/v1/orders \
     -H "Content-Type: application/json" \
     -d '{
       "product_id": "P001",
       "quantity": 2
     }'
```

### 身份认证 (Auth)

- **Bearer Token**: (最常用)
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/profile
  ```
- **Basic Auth**:
  ```bash
  curl -u "username:password" https://api.example.com/admin
  ```

---

## 3. 调试与排障 (Must-Know)

### 详细模式 `-v` (Verbose)

当你不知道请求为什么失败时，**首选 -v**。它会显示：

1. 本地解析过程
2. 请求头（以 `>` 开头）
3. 响应头（以 `<` 开头）
4. 响应体

```bash
curl -v localhost:8080/api/test
```

### 仅查看响应头 `-I`

只想看 HTTP 状态码（200, 404, 500）或 Cache-Control？用 `-I`。

```bash
curl -I https://www.google.com
```

---

## 4. 生产力技巧

### 本地开发必备：忽略 SSL

在本地调试 HTTPS 接口（使用自签名证书）时，`curl` 默认会报错。使用 `-k` 绕过：

```bash
curl -k https://localhost:8443
```

### JSON 美化 (配合 jq)

`curl` 返回的 JSON 通常是压缩的一行。配合 [[jq]] 使用：

```bash
curl -s https://api.example.com/data | jq
```

### 文件上传

使用 `-F` (Form data)，`@` 后接路径：

```bash
curl -X POST https://api.example.com/upload \
     -F "file=@/Users/weiwei/Documents/test.png" \
     -F "type=image"
```

### 保存响应结果

```bash
# 保存到指定文件
curl -o result.json https://api.example.com/large-data

# 使用原文件名保存
curl -O https://example.com/downloads/v1.0.zip
```

---

## 5. 常见组合建议

- **安静且美化**：`curl -s <url> | jq`
- **查看请求链路**：`curl -vL <url>` (详细模式并跟随重定向)
- **模拟移动端**：`curl -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0...)" <url>`

---

## 相关资源

- [[linux-commands]]
- [[jq]] (JSON 处理利器)
