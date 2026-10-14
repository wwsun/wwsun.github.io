---
title: A01 错误访问控制 - OWASP Top 10:2025 --- A01 Broken Access Control - OWASP Top 10:2025
description: OWASP Top 10:2025
source: https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/
author:
tags:
  - clippings
  - security
---

## 描述

访问控制强制执行策略，使用户无法超出其预期权限范围。失败通常会导致未经授权的信息披露、所有数据的修改或破坏，或执行超出用户权限范围的业务功能。常见的访问控制漏洞包括：

- Violation of the principle of least privilege, commonly known as deny by default, where access should only be granted for particular capabilities, roles, or users, but is available to anyone.  
  违反最小权限原则，通常称为默认拒绝，即访问权限应仅授予特定的功能、角色或用户，但实际上任何人都可以访问。
- Bypassing access control checks by modifying the URL (parameter tampering or force browsing), internal application state, or the HTML page, or by using an attack tool that modifies API requests.  
  通过修改 URL（参数篡改或强制浏览）、内部应用程序状态或 HTML 页面来绕过访问控制检查，或使用修改 API 请求的攻击工具。
- Permitting viewing or editing someone else's account by providing its unique identifier (insecure direct object references)  
  通过提供其唯一标识符来允许查看或编辑他人的账户（不安全的直接对象引用）
- An accessible API with missing access controls for POST, PUT, and DELETE.  
  具有缺失访问控制的、可访问的 API，用于 POST、PUT 和 DELETE 操作。
- Elevation of privilege. Acting as a user without being logged in or or gaining privileges beyond those expected of the logged in user (e.g. admin access).  
  权限提升。未经登录或获得超出登录用户预期权限的行为（例如管理员访问权限）。
- Metadata manipulation, such as replaying or tampering with a JSON Web Token (JWT) access control token, a cookie or hidden field manipulated to elevate privileges, or abusing JWT invalidation.  
  元数据操作，例如重放或篡改 JSON Web Token（JWT）访问控制令牌、被操纵以提升权限的 Cookie 或隐藏字段，或滥用 JWT 使其失效。
- CORS misconfiguration allows API access from unauthorized or untrusted origins.  
  CORS 配置错误允许 API 从未授权或不受信任的源访问。
- Force browsing (guessing URLs) to authenticated pages as an unauthenticated user or to privileged pages as a standard user.  
  强制浏览（猜测 URL）以未身份验证用户身份访问受保护页面，或以标准用户身份访问特权页面。

## 如何预防

访问控制仅在实现于可信的服务器端代码或无服务器 API 时才有效，此时攻击者无法修改访问控制检查或元数据。

- Except for public resources, deny by default.  
  除公共资源外，默认拒绝访问。
- Implement access control mechanisms once and reuse them throughout the application, including minimizing Cross-Origin Resource Sharing (CORS) usage.  
  一次性实现访问控制机制，并在整个应用程序中重复使用，包括最小化跨源资源共享（CORS）的使用。
- Model access controls should enforce record ownership rather than allowing users to create, read, update, or delete any record.  
  访问控制模型应强制执行记录所有权，而不是允许用户创建、读取、更新或删除任何记录。
- Unique application business limit requirements should be enforced by domain models.  
  领域模型应强制执行独特的应用程序业务限制要求。
- Disable web server directory listing and ensure file metadata (e.g.,.git) and backup files are not present within web roots.  
  禁用 Web 服务器目录列表，并确保文件元数据（例如，.git）和备份文件不在 Web 根目录中。
- Log access control failures, alert admins when appropriate (e.g., repeated failures).  
  记录访问控制失败，并在适当的时候（例如，重复失败）向管理员发出警报。
- Implement rate limits on API and controller access to minimize the harm from automated attack tooling.  
  对 API 和控制器访问实施速率限制，以减少自动化攻击工具造成的损害。
- Stateful session identifiers should be invalidated on the server after logout. Stateless JWT tokens should be short-lived to minimize the window of opportunity for an attacker. For longer-lived JWTs, consider using refresh tokens and following OAuth standards to revoke access.  
  服务器端应在用户登出后使会话标识失效。无状态 JWT 令牌应生命周期短，以缩小攻击者可利用的时间窗口。对于生命周期较长的 JWT，考虑使用刷新令牌并遵循 OAuth 标准来撤销访问权限。
- Use well-established toolkits or patterns that provide simple, declarative access controls.  
  使用提供简单、声明式访问控制的成熟工具包或模式。

Developers and QA staff should include functional access control in their unit and integration tests.  
开发人员和 QA 人员应在他们的单元测试和集成测试中包含功能访问控制。

## 示例攻击场景

**Scenario #1:** The application uses unverified data in an SQL call that is accessing account information:  
场景 1：应用程序在访问账户信息时使用未经验证的数据进行 SQL 调用：

```js
pstmt.setString(1, request.getParameter("acct"));
ResultSet results = pstmt.executeQuery( );
```

An attacker can simply modify the browser's 'acct' parameter to send any desired account number. If not correctly verified, the attacker can access any user's account.  
攻击者可以简单地修改浏览器的 'acct' 参数以发送任何所需的账户号码。如果未正确验证，攻击者可以访问任何用户的账户。

```js
https://example.com/app/accountInfo?acct=notmyacct
```

**Scenario #2:** An attacker simply forces browsers to target URLs. Admin rights are required for access to the admin page.  
场景 2：攻击者强制浏览器针对 URL。访问管理员页面需要管理员权限。

```js
https://example.com/app/getappInfo
https://example.com/app/admin_getappInfo
```

If an unauthenticated user can access either page, it's a flaw. If a non-admin can access the admin page, this is a flaw.  
如果未经身份验证的用户可以访问任意页面，则存在漏洞。如果非管理员可以访问管理员页面，这也是一个漏洞。

**Scenario #3:** An application puts all of their access control in their front-end. While the attacker cannot get to `https://example.com/app/admin_getappInfo` due to JavaScript code running in the browser, they can simply execute:  
场景 3：一个应用程序将所有访问控制都放在了前端。虽然攻击者由于浏览器中运行的 JavaScript 代码无法访问 `https://example.com/app/admin_getappInfo` ，但他们可以简单地执行：

```js
$ curl https://example.com/app/admin_getappInfo
```

从命令行。

## References. 参考文献。

- [OWASP Proactive Controls: C1: Implement Access Control  
  OWASP 主动控制：C1：实施访问控制](https://top10proactive.owasp.org/archive/2024/the-top-10/c1-accesscontrol/)
- [OWASP Application Security Verification Standard: V8 Authorization  
  OWASP 应用安全验证标准：V8 授权](https://github.com/OWASP/ASVS/blob/master/5.0/en/0x17-V8-Authorization.md)
- [OWASP Testing Guide: Authorization Testing  
  OWASP 测试指南：授权测试](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/README)
- [OWASP Cheat Sheet: Authorization  
  OWASP 小技巧：授权](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [PortSwigger: Exploiting CORS misconfiguration  
  PortSwigger：利用 CORS 配置错误](https://portswigger.net/blog/exploiting-cors-misconfigurations-for-bitcoins-and-bounties)
- [OAuth: Revoking Access OAuth：撤销访问权限](https://www.oauth.com/oauth2-servers/listing-authorizations/revoking-access/)
