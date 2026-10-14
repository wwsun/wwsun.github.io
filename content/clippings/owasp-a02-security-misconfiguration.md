---
title: A02 Security Misconfiguration - OWASP Top 10:2025
description: OWASP Top 10:2025
source: https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/
author:
tags:
  - clippings
  - security
---

## 描述

Generally speaking, all data in transit should be encrypted at the [transport layer](https://en.wikipedia.org/wiki/Transport_layer) ([OSI layer](https://en.wikipedia.org/wiki/OSI_model) 4). Previous hurdles such as CPU performance and private key/certificate management are now handled by CPUs having instructions designed to accelerate encryption (eg: [AES support](https://en.wikipedia.org/wiki/AES_instruction_set)) and private key and certificate management being simplified by services like [LetsEncrypt.org](https://letsencrypt.org/) with major cloud vendors providing even more tightly integrated certificate management services for their specific platforms.  
一般来说，所有传输中的数据应在传输层（OSI 第 4 层）进行加密。之前的障碍，如 CPU 性能和私钥/证书管理，现在由设计有加密加速指令的 CPU 处理（例如：AES 支持），而私钥和证书管理通过像 LetsEncrypt.org 这样的服务得到简化，主要云供应商还为其特定平台提供更紧密集成的证书管理服务。

Beyond securing the transport layer, it is important to determine what data needs encryption at rest as well as what data needs extra encryption in transit (at the [application layer](https://en.wikipedia.org/wiki/Application_layer), OSI layer 7). For example, passwords, credit card numbers, health records, personal information, and business secrets require extra protection, especially if that data falls under privacy laws, e.g., EU's General Data Protection Regulation (GDPR), or regulations such as PCI Data Security Standard (PCI DSS). For all such data:  
在保障传输层安全之外，确定哪些数据需要在静止状态下加密，以及哪些数据需要在传输过程中（在应用层，OSI 第 7 层）进行额外加密也很重要。例如，密码、信用卡号、健康记录、个人信息和商业机密需要额外的保护，特别是如果这些数据属于隐私法规的范畴，例如欧盟的通用数据保护条例（GDPR），或 PCI 数据安全标准（PCI DSS）。对于所有此类数据：

- Are any old or weak cryptographic algorithms or protocols used either by default or in older code?  
  是否使用默认设置或旧代码中使用了任何过时或弱加密算法或协议？
- Are default crypto keys in use, are weak crypto keys generated, are keys re-used, or is proper key management and rotation missing?  
  是否使用默认加密密钥？是否生成了弱加密密钥？是否重复使用密钥？是否缺少适当的密钥管理和轮换？
- Are crypto keys checked into source code repositories?  
  加密密钥是否存入了源代码仓库？
- Is encryption not enforced, e.g., are any HTTP headers (browser) security directives or headers missing?  
  加密是否未强制执行，例如，是否缺少任何 HTTP 头部（浏览器）安全指令或头部？
- Is the received server certificate and the trust chain properly validated?  
  接收到的服务器证书和信任链是否正确验证？
- Are initialization vectors ignored, reused, or not generated sufficiently secure for the cryptographic mode of operation? Is an insecure mode of operation such as ECB in use? Is encryption used when authenticated encryption is more appropriate?  
  初始化向量是否被忽略、重复使用，或生成的安全性不足以满足加密操作模式的要求？是否在使用不安全的操作模式，例如 ECB？是否在更合适使用认证加密的情况下使用了加密？
- Are passwords being used as cryptographic keys in the absence of a password based key derivation function?  
  在没有密码派生密钥函数的情况下，密码是否被用作加密密钥？
- Is randomness used that was not designed to meet cryptographic requirements? Even if the correct function is chosen, does it need to be seeded by the developer, and if not, has the developer over-written the strong seeding functionality built into it with a seed that lacks sufficient entropy/unpredictability?  
  是否使用了未设计以满足加密要求的随机性？即使选择了正确的函数，是否需要由开发者进行初始化，如果不是，开发者是否用缺乏足够熵/不可预测性的种子覆盖了其内置的强初始化功能？
- Are deprecated hash functions such as MD5 or SHA1 in use, or are non-cryptographic hash functions used when cryptographic hash functions are needed?  
  是否在使用已弃用的哈希函数，如 MD5 或 SHA1，或者当需要加密哈希函数时是否使用了非加密哈希函数？
- Are cryptographic error messages or side channel information exploitable, for example in the form of padding oracle attacks?  
  加密错误消息或侧信道信息是否可被利用，例如在填充或然攻击的形式中？
- Can the cryptographic algorithm be downgraded or bypassed?  
  加密算法是否可以被降级或绕过？

See references ASVS: Cryptography (V11), Secure Communication (V12) and Data Protection (V14).  
参见参考资料 ASVS：密码学（V11）、安全通信（V12）和数据保护（V14）。

## 如何预防

Do the following, at a minimum, and consult the references:  
至少执行以下操作，并参考参考资料：

- Classify and label data processed, stored, or transmitted by an application. Identify which data is sensitive according to privacy laws, regulatory requirements, or business needs.  
  对应用程序处理、存储或传输的数据进行分类和标记。根据隐私法律、监管要求或业务需求，识别哪些数据是敏感的。
- Store your most sensitive keys in a hardware or cloud-based HSM.  
  将您最敏感的密钥存储在硬件或基于云的 HSM 中。
- Use well-trusted implementations of cryptographic algorithms whenever possible.  
  尽可能使用经过充分验证的加密算法实现。
- Don't store sensitive data unnecessarily. Discard it as soon as possible or use PCI DSS compliant tokenization or even truncation. Data that is not retained cannot be stolen.  
  不要不必要地存储敏感数据。尽快丢弃它，或使用符合 PCI DSS 标准的令牌化甚至截断。不被保留的数据无法被窃取。
- Make sure to encrypt all sensitive data at rest.  
  确保所有敏感数据在静止状态下都经过加密。
- Ensure up-to-date and strong standard algorithms, protocols, and keys are in place; use proper key management.  
  确保使用最新的强标准算法、协议和密钥；使用适当的密钥管理。
- Encrypt all data in transit with protocols >= TLS 1.2 only, with forward secrecy (FS) ciphers, drop support for cipher block chaining (CBC) ciphers, support quantum key change algorithms. For HTTPS enforce encryption using HTTP Strict Transport Security (HSTS). Check everything with a tool.  
  对所有传输中的数据进行加密，仅使用 TLS 1.2 及以上协议，并使用具有前向保密（FS）的密码，弃用密码块链接（CBC）密码，支持量子密钥更换算法。对于 HTTPS，强制使用 HTTP 严格传输安全（HSTS）进行加密。使用工具检查所有内容。
- Disable caching for responses that contain sensitive data. This includes caching in your CDN, web server, and any application caching (eg: Redis).  
  禁用包含敏感数据的响应的缓存。这包括 CDN、Web 服务器和任何应用程序缓存（例如：Redis）中的缓存。
- Apply required security controls as per the data classification.  
  根据数据分类应用所需的安全控制。
- Do not use unencrypted protocols such as FTP, and STARTTLS. Avoid using SMTP for transmitting confidential data.  
  不要使用未加密协议，如 FTP 和 STARTTLS。避免使用 SMTP 传输机密数据。
- Store passwords using strong adaptive and salted hashing functions with a work factor (delay factor), such as Argon2, yescrypt, scrypt or PBKDF2-HMAC-SHA-512. For legacy systems using bcrypt, get more advice at [OWASP Cheat Sheet: Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)  
  使用强自适应和加盐哈希函数存储密码，并使用工作因子（延迟因子），例如 Argon2、yescrypt、scrypt 或 PBKDF2-HMAC-SHA-512。对于使用 bcrypt 的遗留系统，请访问 OWASP 提示页：密码存储获取更多建议
- Initialization vectors must be chosen appropriate for the mode of operation. This could mean using a CSPRNG (cryptographically secure pseudo random number generator). For modes that require a nonce, the initialization vector (IV) does not need a CSPRNG. In all cases, the IV should never be used twice for a fixed key.  
  初始化向量必须根据操作模式选择合适的。这可能意味着使用密码学安全的伪随机数生成器（CSPRNG）。对于需要非数的模式，初始化向量（IV）不需要 CSPRNG。在所有情况下，对于固定密钥，IV 永远不应该被重复使用。
- Always use authenticated encryption instead of just encryption.  
  始终使用认证加密而不是仅加密。
- Keys should be generated cryptographically randomly and stored in memory as byte arrays. If a password is used, then it must be converted to a key via an appropriate password base key derivation function.  
  密钥应该通过密码学随机生成并以字节数组的形式存储在内存中。如果使用密码，则必须通过适当的密码基密钥派生函数将其转换为密钥。
- Ensure that cryptographic randomness is used where appropriate and that it has not been seeded in a predictable way or with low entropy. Most modern APIs do not require the developer to seed the CSPRNG to be secure.  
  确保在适当的地方使用加密随机性，并且没有被以可预测的方式或低熵进行种子化。大多数现代 API 不需要开发者对 CSPRNG 进行种子化以确保安全。
- Avoid deprecated cryptographic functions, block building methods and padding schemes, such as MD5, SHA1, Cipher Block Chaining Mode (CBC), PKCS number 1 v1.5.  
  避免使用已弃用的加密函数、块构建方法和填充方案，例如 MD5、SHA1、密码块链接模式（CBC）、PKCS #1 v1.5。
- Ensure settings and configurations meet security requirements by having them reviewed by security specialists, tools designed for this purpose, or both.  
  通过让安全专家或为此目的设计的工具进行审查，确保设置和配置满足安全要求。
- You need to prepare now for post quantum cryptography (PQC), see reference (ENISA) so that high risk systems are safe no later than the end of 2030.  
  你需要现在为后量子密码学（PQC）做准备，参考（ENISA），以确保高风险系统在 2030 年底之前是安全的。

## 示例攻击场景

**Scenario #1**: A site doesn't use or enforce TLS for all pages or supports weak encryption. An attacker monitors network traffic (e.g., at an insecure wireless network), downgrades connections from HTTPS to HTTP, intercepts requests, and steals the user's session cookie. The attacker then replays this cookie and hijacks the user's (authenticated) session, accessing or modifying the user's private data. Instead of the above they could alter all transported data, e.g., the recipient of a money transfer.  
场景 1：一个网站没有对所有页面使用或强制执行 TLS，或者支持弱加密。攻击者监控网络流量（例如，在不安全的无线网络上），将连接从 HTTPS 降级到 HTTP，拦截请求，并窃取用户的会话 cookie。然后攻击者重放这个 cookie，劫持用户的（经过身份验证的）会话，访问或修改用户的私人数据。或者，他们可以修改所有传输的数据，例如，金钱转账的接收者。

**Scenario #2**: The password database uses unsalted or simple hashes to store everyone's passwords. A file upload flaw allows an attacker to retrieve the password database. All the unsalted hashes can be exposed with a rainbow table of pre-calculated hashes. Hashes generated by simple or fast hash functions may be cracked by GPUs, even if they were salted.  
场景 2：密码数据库使用未加盐或简单的哈希方法来存储所有人的密码。文件上传漏洞允许攻击者检索密码数据库。所有未加盐的哈希值都可以通过预计算的哈希彩虹表暴露。即使加盐了，由简单或快速哈希函数生成的哈希值也可能被 GPU 破解。

## 参考文献

- [OWASP Proactive Controls: C2: Use Cryptography to Protect Data  
  OWASP 主动控制：C2：使用密码学保护数据](https://top10proactive.owasp.org/archive/2024/the-top-10/c2-crypto/)
- [OWASP Application Security Verification Standard (ASVS):](https://owasp.org/www-project-application-security-verification-standard) [V11,](https://github.com/OWASP/ASVS/blob/v5.0.0/5.0/en/0x20-V11-Cryptography.md) [12,](https://github.com/OWASP/ASVS/blob/v5.0.0/5.0/en/0x21-V12-Secure-Communication.md) [14](https://github.com/OWASP/ASVS/blob/v5.0.0/5.0/en/0x23-V14-Data-Protection.md)  
  OWASP 应用程序安全验证标准 (ASVS)：V11、12、14
- [OWASP Cheat Sheet: Transport Layer Protection  
  OWASP 小技巧：传输层保护](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
- [OWASP Cheat Sheet: User Privacy Protection  
  OWASP 小技巧：用户隐私保护](https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Password Storage  
  OWASP 小技巧：密码存储](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Cryptographic Storage  
  OWASP 小技巧：加密存储](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Cheat Sheet: HSTS  
  OWASP 小技巧：HSTS](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)
- [OWASP Testing Guide: Testing for weak cryptography  
  OWASP 测试指南：测试弱加密](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/09-Testing_for_Weak_Cryptography/README)
- [ENISA: A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography  
  ENISA：后量子密码过渡的协调实施路线图](https://digital-strategy.ec.europa.eu/en/library/coordinated-implementation-roadmap-transition-post-quantum-cryptography)
- [NIST Releases First 3 Finalized Post-Quantum Encryption Standards  
  NIST 发布首批 3 项最终确定的量子后加密标准](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards)
