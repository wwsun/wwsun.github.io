---
title: 什么是 Bearer Token？理解 API 认证
description: Postman 博客关于 Bearer Token 工作原理、类型、安全实践及测试方法的入门指南
tags:
  - clippings
  - api
  - authentication
  - oauth2
  - security
source: https://blog.postman.com/what-is-a-bearer-token/
created: 2026-08-13
author: Postman
---

## 什么是 Bearer Token？理解 API 认证

> **原文**：[What is a Bearer Token? Understanding API Authentication](https://blog.postman.com/what-is-a-bearer-token/) | 作者：Postman | 日期：2026-08-13

## 📝 摘要

本文系统介绍了 API 认证中的 Bearer Token（承载令牌）。Bearer Token 是一种安全令牌，其核心原则是「谁持有令牌，谁就拥有访问权限」，由 RFC 6750 定义，常用于 OAuth 2.0。文章讲解了 Bearer Token 的完整工作流程与 HTTP 头格式，对比了不透明令牌（Opaque）、JWT 和刷新令牌三种类型，并说明了 Bearer Token 与 API Key 的区别。最后给出了一系列安全最佳实践、Postman 测试技巧以及常见错误与排障指南。

## 📋 术语表

| 英文                 | 中文                  | 说明                                   |
| -------------------- | --------------------- | -------------------------------------- |
| Bearer Token         | 承载令牌              | 一种谁持有谁就能访问的安全令牌         |
| OAuth 2.0            | OAuth 2.0             | 开放授权协议，常用于第三方授权         |
| Authorization header | Authorization 头      | HTTP 请求中携带认证信息的请求头        |
| JWT                  | JWT（JSON Web Token） | 一种结构化、自包含、加密签名的令牌格式 |
| Opaque token         | 不透明令牌            | 对客户端无意义的随机字符串令牌         |
| Refresh token        | 刷新令牌              | 用于换取新访问令牌的长效令牌           |
| API key              | API 密钥              | 用于标识应用程序的长期凭证             |
| Scope                | 权限范围              | 令牌所授权访问的资源范围               |

---

## 正文（双语对照）

What is a Bearer Token? Understanding API Authentication

什么是 Bearer Token？理解 API 认证

### Quick answer

### 快速回答

Bearer tokens authenticate API requests by granting access to whoever possesses the token, passed in the Authorization header as `Authorization: Bearer `. They're commonly used with OAuth 2.0 and provide a simple way to secure APIs without requiring complex cryptographic signing for each request.

Bearer Token（承载令牌）通过「谁持有令牌就授予谁访问权限」的方式来认证 API 请求，它通过 `Authorization: Bearer ` 的形式放在 Authorization 头中传递。Bearer Token 通常与 OAuth 2.0 一起使用，为保护 API 提供了一种简单方式，无需为每个请求进行复杂的加密签名。

This guide explains how bearer tokens work in practice, when to use them, and how to test authenticated requests during API development.

本指南将讲解 Bearer Token 的实际工作原理、何时使用它们，以及如何在 API 开发过程中测试经过认证的请求。

## What is a bearer token?

## 什么是 Bearer Token？

A bearer token is a security token that grants access to whoever holds it. The name "bearer" means that anyone with the token can access protected resources without additional proof of identity. Think of it like a concert ticket: whoever holds it can enter.

Bearer Token 是一种安全令牌，谁持有它，谁就获得访问权限。「bearer（承载者）」这个名字意味着，任何持有该令牌的人都可以访问受保护资源，而无需额外的身份证明。可以把它想象成一张演唱会门票：谁拿着票，谁就能进场。

Bearer tokens are defined by RFC 6750 and are most commonly used with OAuth 2.0. When a client needs to access protected resources, it includes the bearer token in the Authorization header of each HTTP request. The server validates the token and grants access if it's valid.

Bearer Token 由 RFC 6750 定义，最常与 OAuth 2.0 一起使用。当客户端需要访问受保护资源时，它会在每个 HTTP 请求的 Authorization 头中包含该 Bearer Token。服务器验证令牌，若有效则授予访问权限。

## How bearer tokens work

## Bearer Token 如何工作

The typical flow:

典型的流程如下：

1. Client authenticates with credentials (username/password or OAuth flow).
2. Server generates and returns a bearer token.
3. Client stores the token securely.
4. Client includes token in Authorization header for each request.
5. Server validates token and grants or denies access.
6. Token expires after predetermined time.

7. 客户端使用凭据（用户名/密码或 OAuth 流程）进行认证。
8. 服务器生成并返回一个 Bearer Token。
9. 客户端安全地存储该令牌。
10. 客户端在每个请求的 Authorization 头中包含该令牌。
11. 服务器验证令牌，并授予或拒绝访问。
12. 令牌在预定时间后过期。

### Bearer token format

### Bearer Token 的格式

Bearer tokens follow a specific format in HTTP headers:

Bearer Token 在 HTTP 头中遵循特定的格式：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The format consists of the scheme identifier "Bearer", a space, and the token value. The token itself can be a random string or a structured format, such as JSON Web Token (JWT).

该格式由方案标识符「Bearer」、一个空格和令牌值组成。令牌本身可以是一个随机字符串，也可以是结构化格式，例如 JSON Web Token（JWT）。

## Example: Using bearer tokens

## 示例：使用 Bearer Token

Here's what a complete API request with bearer token authentication looks like. First, authenticate to receive a bearer token:

下面是一个使用 Bearer Token 认证的完整 API 请求的示例。首先，进行认证以获取 Bearer Token：

```
POST /api/auth/login HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "username": "developer@example.com",
  "password": "secure_password"
}
```

The server responds with a token:

服务器返回一个令牌：

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Now use the bearer token to access protected resources:

现在使用该 Bearer Token 访问受保护资源：

```
GET /api/users/profile HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

The server validates the token and returns the requested data.

服务器验证令牌并返回请求的数据。

## Types of bearer tokens

## Bearer Token 的类型

Bearer tokens come in different formats, each with specific characteristics.

Bearer Token 有不同的格式，每种格式都有特定的特性。

### Opaque tokens

### 不透明令牌（Opaque Tokens）

Opaque tokens are random strings with no meaning to clients. The server maintains a database that maps tokens to user information and permissions. They're simple to implement and easy to revoke, but they require server-side storage.

不透明令牌是对客户端没有意义的随机字符串。服务器维护一个数据库，将令牌映射到用户信息和权限。它们实现简单、易于撤销，但需要服务器端存储。

### JSON Web Tokens (JWT)

### JSON Web Token（JWT）

JWTs are structured tokens that encode information directly within the token itself.

JWT 是一种结构化令牌，将信息直接编码在令牌本身之中。

The three parts of a JWT include:

JWT 由三个部分组成：

1. Header
2. Payload
3. Signature

4. 头部（Header）
5. 载荷（Payload）
6. 签名（Signature）

JWTs are self-contained, cryptographically signed, and enable stateless authentication, which makes them ideal for microservices and distributed systems.

JWT 是自包含的、经过加密签名的，并支持无状态认证，这使它们非常适合微服务和分布式系统。

### Refresh tokens

### 刷新令牌（Refresh Tokens）

Refresh tokens are long-lived bearer tokens used specifically to get new access tokens without requiring re-authentication. They're commonly used in mobile and single-page applications to maintain persistent sessions.

刷新令牌是一种长效的 Bearer Token，专门用于获取新的访问令牌，而无需重新认证。它们常用于移动应用和单页应用，以维持持久会话。

## Bearer tokens vs API keys

## Bearer Token 与 API Key 的区别

Understanding the difference between bearer tokens and API keys helps you choose the right authentication method.

了解 Bearer Token 和 API Key 之间的区别，有助于你选择合适的认证方法。

| Authentication type | Bearer token                   | API key                      |
| ------------------- | ------------------------------ | ---------------------------- |
| Purpose             | User or session authentication | Application identification   |
| Lifespan            | Temporary (minutes to hours)   | Long-lived (months to years) |
| Revocation          | Expires automatically          | Manual revocation required   |
| User context        | Tied to a specific user        | Tied to the application      |

| 认证类型   | Bearer Token       | API Key            |
| ---------- | ------------------ | ------------------ |
| 用途       | 用户或会话认证     | 应用程序标识       |
| 生命周期   | 临时（分钟到小时） | 长效（数月至数年） |
| 撤销方式   | 自动过期           | 需手动撤销         |
| 用户上下文 | 绑定特定用户       | 绑定应用程序       |

Use bearer tokens when authenticating individual users, implementing OAuth 2.0, or requiring automatic expiration. Use API keys to identify applications, manage rate limits, or facilitate simple server-to-server communication.

在认证单个用户、实现 OAuth 2.0 或需要自动过期时，使用 Bearer Token。在标识应用程序、管理速率限制或实现简单的服务器间通信时，使用 API Key。

## Security best practices

## 安全最佳实践

Bearer tokens require careful handling to prevent security vulnerabilities.

Bearer Token 需要谨慎处理，以防止安全漏洞。

### Always use HTTPS

### 始终使用 HTTPS

Bearer tokens must be transmitted over HTTPS. Without encryption, tokens can be intercepted and used by attackers.

Bearer Token 必须通过 HTTPS 传输。如果没有加密，令牌可能会被拦截并被攻击者利用。

### Implement token expiration

### 实现令牌过期

Short-lived tokens reduce risk if compromised. Typical access token lifespans range from 5 minutes to 1 hour. Use refresh tokens for longer sessions without repeatedly exposing credentials.

短生命周期的令牌在被泄露时能降低风险。典型的访问令牌寿命从 5 分钟到 1 小时不等。对于更长的会话，使用刷新令牌，避免反复暴露凭据。

### Secure token storage

### 安全地存储令牌

Never log tokens in console, include them in URLs, or store them carelessly in localStorage. Instead:

绝不要在控制台中打印令牌、将其包含在 URL 中，或随意存储在 localStorage 中。相反，应该：

- Use HTTP-only cookies when appropriate
- Store in-memory for single-page applications
- Use secure device storage for mobile apps
- Clear tokens on logout

- 在适当的时候使用 HTTP-only Cookie
- 对于单页应用，存储在内存中
- 对于移动应用，使用安全的设备存储
- 注销时清除令牌

### Validate tokens properly

### 正确验证令牌

Servers must validate tokens thoroughly before granting access:

服务器在授予访问权限之前，必须彻底验证令牌：

- Verify signature (for JWTs)
- Check expiration time
- Validate issuer and audience
- Check revocation status if implemented

- 验证签名（对于 JWT）
- 检查过期时间
- 验证签发者（issuer）和受众（audience）
- 如果实现了撤销机制，检查撤销状态

## Testing bearer tokens in Postman

## 在 Postman 中测试 Bearer Token

Postman gives you a simple way to test APIs that use bearer token authentication.

Postman 为你提供了一种简单的方式来测试使用 Bearer Token 认证的 API。

### Basic setup

### 基础设置

1. Open your request in Postman.
2. Navigate to the **Authorization** tab.
3. Select **Bearer Token** from the **Type** dropdown.
4. Enter your token in the **Token** field.
5. Click **Send**.

6. 在 Postman 中打开你的请求。
7. 导航到 **Authorization**（认证）标签页。
8. 在 **Type**（类型）下拉框中选择 **Bearer Token**。
9. 在 **Token** 字段中输入你的令牌。
10. 点击 **Send**（发送）。

Postman automatically formats the Authorization header correctly.

Postman 会自动正确格式化 Authorization 头。

### Using variables

### 使用变量

Store tokens as environment or collection variables for easier management:

将令牌存储为环境变量或集合变量，以便于管理：

1. Create an environment variable called `bearer_token`.
2. In the **Authorization** tab, use `{{bearer_token}}`.
3. Update the variable value when you receive new tokens.

4. 创建一个名为 `bearer_token` 的环境变量。
5. 在 **Authorization** 标签页中使用 `{{bearer_token}}`。
6. 当你收到新令牌时，更新该变量的值。

For collection-level authentication, configure it once in the collection settings so that all requests inherit the authentication.

对于集合级别的认证，只需在集合设置中配置一次，这样所有请求都会继承该认证。

### Automating token refresh

### 自动化令牌刷新

Use Postman's pre-request scripts to automatically obtain fresh tokens:

使用 Postman 的预请求脚本自动获取新的令牌：

```
const tokenExpiry = pm.environment.get('token_expiry');
const now = Date.now();

if (!tokenExpiry || now >= tokenExpiry) {
  pm.sendRequest({
    url: 'https://api.example.com/auth/token',
    method: 'POST',
    header: {'Content-Type': 'application/json'},
    body: {
      mode: 'raw',
      raw: JSON.stringify({
        client_id: pm.environment.get('client_id'),
        client_secret: pm.environment.get('client_secret')
      })
    }
  }, (err, response) => {
    const jsonData = response.json();
    pm.environment.set('bearer_token', jsonData.access_token);
    pm.environment.set('token_expiry', now + (jsonData.expires_in * 1000));
  });
}
```

## Common mistakes to avoid

## 需要避免的常见错误

### Missing the "Bearer" prefix

### 缺少「Bearer」前缀

The Authorization header requires the scheme identifier:

Authorization 头需要方案标识符：

**Wrong:** `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**错误示例：** `Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（缺少 `Bearer` 前缀）

### Using tokens over HTTP

### 通过 HTTP 使用令牌

Never transmit bearer tokens over unencrypted connections. Always use HTTPS.

绝不要通过未加密的连接传输 Bearer Token。始终使用 HTTPS。

### Storing tokens insecurely

### 不安全地存储令牌

Avoid logging tokens or storing them without proper security measures. Use appropriate storage mechanisms for your platform and always clear tokens on logout.

避免打印令牌，或在没有适当安全措施的情况下存储它们。为你的平台使用适当的存储机制，并在注销时始终清除令牌。

### Ignoring token expiration

### 忽略令牌过期

Always check token expiration and handle expired tokens gracefully by implementing refresh logic.

始终检查令牌过期时间，并通过实现刷新逻辑来优雅地处理已过期的令牌。

## Troubleshooting

## 排障指南

### 401 Unauthorized errors

### 401 未授权错误

When you receive a 401 status code, the token is invalid or missing. Common causes include expired tokens, missing "Bearer" prefix, or incorrect token format. Verify the token format and obtain a fresh token if it's expired.

当你收到 401 状态码时，说明令牌无效或缺失。常见原因包括令牌过期、缺少「Bearer」前缀或令牌格式不正确。请验证令牌格式，如果已过期则获取新令牌。

### 403 Forbidden errors

### 403 禁止访问错误

A 403 status indicates the token is valid but lacks necessary permissions. Verify that the token scopes match the resource requirements and check the user's permissions in the system.

403 状态表示令牌有效，但缺少必要的权限。请验证令牌的权限范围（scope）是否与资源要求匹配，并检查用户在系统中的权限。

### Token not being accepted

### 令牌未被接受

If the server consistently rejects valid tokens, verify that you've included the "Bearer" prefix, there are no extra spaces, the header name is exactly "Authorization", and you're using HTTPS.

如果服务器持续拒绝有效令牌，请确认你已包含「Bearer」前缀、没有多余空格、头名称正好是「Authorization」，并且你正在使用 HTTPS。

### Quick reference

### 快速参考

| Question                 | Answer                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| What is a bearer token?  | A security token that grants access to whoever possesses it.                                     |
| How is it formatted?     | `Authorization: Bearer <token> ` in the HTTP header.                                             |
| Bearer token vs API key? | Bearer tokens are temporary and user-specific; API keys are long-lived and application-specific. |
| Are they secure?         | Yes, when used over HTTPS with proper expiration and storage.                                    |
| How long do they last?   | Typically 5 minutes to 1 hour for access tokens.                                                 |
| Can they be revoked?     | Yes, through revocation lists or token versioning.                                               |

| 问题                               | 回答                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------- |
| 什么是 Bearer Token？              | 一种谁持有谁就能访问的安全令牌。                                          |
| 它的格式是怎样的？                 | 在 HTTP 头中为 `Authorization: Bearer <token>`。                          |
| Bearer Token 与 API Key 有何区别？ | Bearer Token 是临时的、面向特定用户的；API Key 是长效的、面向特定应用的。 |
| 它们安全吗？                       | 是的，前提是通过 HTTPS 使用，并有适当的过期时间和存储方式。               |
| 它们能持续多久？                   | 访问令牌通常为 5 分钟到 1 小时。                                          |
| 它们能被撤销吗？                   | 可以，通过撤销列表或令牌版本化实现。                                      |

---

> **译者注**：原文中「Missing the "Bearer" prefix」一节的错误示例代码与正确格式相同，疑似原站排版笔误。译文已根据该节语境修正为「缺少 `Bearer` 前缀」的正确错误示例。
