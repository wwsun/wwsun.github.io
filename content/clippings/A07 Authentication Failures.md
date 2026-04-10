---
title: A07 认证失败
description: OWASP Top 10:2025
source: https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/
author:
tags:
  - clippings
  - security
---

## 描述

当攻击者能够欺骗系统将无效或不正确的用户识别为合法用户时，这种漏洞就存在。如果应用程序：

- Permits automated attacks such as credential stuffing, where the attacker has a breached list of valid usernames and passwords. More recently this type of attack has been expanded to include hybrid password attacks credential stuffing (also known as password spray attacks), where the attacker uses variations or increments of spilled credentials to gain access, for instance trying Password1!, Password2!, Password3! and so on.  
  允许自动化攻击，如凭证填充，其中攻击者拥有被盗的合法用户名和密码列表。最近，这种类型的攻击已扩展到包括混合密码攻击凭证填充（也称为密码喷洒攻击），其中攻击者使用泄露凭证的变化或增量来获取访问权限，例如尝试 Password1!、Password2!、Password3!等等。
- Permits brute force or other automated, scripted attacks that are not quickly blocked.  
  允许暴力破解或其他自动化、脚本攻击且无法快速阻止。
- Permits default, weak, or well-known passwords, such as "Password1" or "admin" username with an "admin" password.  
  允许使用默认、弱密码或常见密码，例如"Password1"或使用"admin"用户名和"admin"密码。
- Allows users to create new accounts with already known-breached credentials.  
  允许用户使用已知的被盗凭证创建新账户。
- Allows use of weak or ineffective credential recovery and forgot-password processes, such as "knowledge-based answers," which cannot be made safe.  
  允许使用弱或无效的凭证恢复和忘记密码流程，例如"基于知识的答案"，这些无法确保安全。
- Uses plain text, encrypted, or weakly hashed passwords data stores (see [A04:2025-Cryptographic Failures](https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/)).  
  使用明文、加密或弱哈希密码数据存储（参见 A04:2025-密码学故障）。
- Has missing or ineffective multi-factor authentication.  
  缺少或无效的多因素认证。
- Allows use of weak or ineffective fallbacks if multi-factor authentication is not available.  
  如果多因素认证不可用，允许使用弱或无效的回退方法。
- Exposes session identifier in the URL, a hidden field, or another insecure location that is accessible to the client.  
  在客户端可访问的 URL、隐藏字段或其他不安全位置暴露会话标识符。
- Reuses the same session identifier after successful login.  
  在成功登录后重复使用相同的会话标识符。
- Does not correctly invalidate user sessions or authentication tokens (mainly single sign-on (SSO) tokens) during logout or a period of inactivity.  
  在注销或非活动期间未能正确使用户会话或认证令牌（主要是单点登录（SSO）令牌）失效。
- Does not correctly assert the scope and intended audience of the provided credentials.  
  未能正确断言所提供凭证的范围和预期受众。

## 如何预防

- Where possible, implement and enforce use of multi-factor authentication to prevent automated credential stuffing, brute force, and stolen credential reuse attacks.  
  在可能的情况下，实施并强制使用多因素认证，以防止自动化凭证注入、暴力破解和被盗凭证重用攻击。
- Where possible, encourage and enable the use of password managers, to help users make better choices.  
  尽可能鼓励并支持用户使用密码管理器，以帮助用户做出更好的选择。
- Do not ship or deploy with any default credentials, particularly for admin users.  
  不要使用任何默认凭证进行发布或部署，特别是管理员用户。
- Implement weak password checks, such as testing new or changed passwords against the top 10,000 worst passwords list.  
  实施弱密码检查，例如将新密码或更改的密码与最差 10,000 个密码列表进行测试。
- During new account creation and password changes validate against lists of known breached credentials (eg: using [haveibeenpwned.com](https://haveibeenpwned.com/)).  
  在新账户创建和密码更改期间，验证已知泄露凭证的列表（例如：使用 haveibeenpwned.com）。
- Align password length, complexity, and rotation policies with [National Institute of Standards and Technology (NIST) 800-63b's guidelines in section 5.1.1](https://pages.nist.gov/800-63-3/sp800-63b.html#:~:text=5.1.1%20Memorized%20Secrets) for Memorized Secrets or other modern, evidence-based password policies.  
  与国家标准化与技术研究院（NIST）800-63b 第 5.1.1 节中针对记忆型密码或其他基于证据的现代密码策略的指南一致地调整密码长度、复杂性和轮换策略。
- Do not force human beings to rotate passwords unless you suspect breach. If you suspect breach, force password resets immediately.  
  除非怀疑发生违规，否则不要强制人类用户轮换密码。如果怀疑发生违规，应立即强制重置密码。
- Ensure registration, credential recovery, and API pathways are hardened against account enumeration attacks by using the same messages for all outcomes (“Invalid username or password.”).  
  通过对所有结果使用相同的信息（“无效用户名或密码”）来加固注册、凭证恢复和 API 路径，以防止账户枚举攻击。
- Limit or increasingly delay failed login attempts but be careful not to create a denial of service scenario. Log all failures and alert administrators when credential stuffing, brute force, or other attacks are detected or suspected.  
  限制或逐渐延迟失败的登录尝试，但要注意不要创建拒绝服务场景。记录所有失败情况，并在检测到或怀疑凭证注入、暴力破解或其他攻击时向管理员发出警报。
- Use a server-side, secure, built-in session manager that generates a new random session ID with high entropy after login. Session identifiers should not be in the URL, be securely stored in a secure cookie, and invalidated after logout, idle, and absolute timeouts.  
  使用服务器端、安全的内置会话管理器，在登录后生成具有高熵的新随机会话 ID。会话标识符不应在 URL 中，应安全地存储在安全的 cookie 中，并在注销、空闲和绝对超时后失效。
- Ideally, use a premade, well-trusted system to handle authentication, identity, and session management. Transfer this risk whenever possible by buying and utilizing a hardened and well tested system.  
  理想情况下，使用预先制作、值得信赖的系统来处理认证、身份和会话管理。尽可能通过购买和使用经过加固和充分测试的系统来转移此风险。
- Verify the intended use of provided credentials, e.g. for JWTs validate `aud`, `iss` claims and scopes  
  验证提供的凭证的预期用途，例如，对于 JWT，验证 `aud` 、 `iss` 声明和范围。

## 示例攻击场景

**Scenario #1:** Credential stuffing, the use of lists of known username and password combinations, is now a very common attack. More recently attackers have been found to ‘increment’ or otherwise adjust passwords, based on common human behavior. For instance, changing ‘Winter2025’ to ‘Winter2026’, or ‘ILoveMyDog6’ to ‘ILoveMyDog7’ or ‘ILoveMyDog5’. This adjusting of password attempts is called a hybrid credential stuffing attack or a password spray attack, and they can be even more effective than the traditional version. If an application does not implement defences against automated threats (brute force, scripts, or bots) or credential stuffing, the application can be used as a password oracle to determine if the credentials are valid and gain unauthorized access.  
场景 1：凭证注入，即使用已知用户名和密码组合的列表，现在已成为一种非常常见的攻击。最近发现攻击者会根据常见的人类行为来“增量”或以其他方式调整密码。例如，将“Winter2025”改为“Winter2026”，或将“ILoveMyDog6”改为“ILoveMyDog7”或“ILoveMyDog5”。这种密码尝试的调整被称为混合凭证注入攻击或密码喷雾攻击，并且它们可能比传统版本更有效。如果应用程序没有实施针对自动化威胁（暴力破解、脚本或机器人）或凭证注入的防御措施，该应用程序可能被用作密码预言机，以确定凭证是否有效并获取未经授权的访问权限。

**Scenario #2:** Most successful authentication attacks occur due to the continued use of passwords as the sole authentication factor. Once considered best practices, password rotation and complexity requirements encourage users to both reuse passwords and use weak passwords. Organizations are recommended to stop these practices per NIST 800-63 and to enforce use of multi-factor authentication on all important systems.  
场景 2：大多数成功的认证攻击是由于继续将密码作为唯一的认证因素。密码轮换和复杂度要求曾被认为是最佳实践，但它们鼓励用户重复使用密码和使用弱密码。根据 NIST 800-63 的建议，组织应停止这些做法，并在所有重要系统上强制使用多因素认证。

**Scenario #3:** Application session timeouts aren't implemented correctly. A user uses a public computer to access an application and instead of selecting "logout," the user simply closes the browser tab and walks away. Another Example for this is, if a Single Sign on (SSO) session can not be closed by a Single Logout (SLO). That is, a single login logs you into, for example, your mail reader, your document system, and your chat system. But logging out happens only to the current system. If an attacker uses the same browser after the victim thinks they have successfully logged out, but with the user still authenticated to some of the applications, then can access the victim's account. The same issue can happen in offices and enterprises when a sensitive application has not been properly exited and a colleague has (temporary) access to the unlocked computer.  
场景 3：应用程序会话超时未正确实现。用户使用公共计算机访问应用程序，而不是选择“注销”，而是直接关闭浏览器标签页并离开。另一个例子是，如果单一登录（SSO）会话不能通过单一注销（SLO）关闭。也就是说，单个登录会同时登录到例如您的邮件阅读器、文档系统和聊天系统。但注销只发生在当前系统。如果攻击者在受害者认为他们已成功注销后使用相同的浏览器，但用户仍然被一些应用程序认证，那么就可以访问受害者的账户。在办公室和企业中，当敏感应用程序未正确退出，而同事（临时）可以访问未锁定的计算机时，同样会发生此问题。
