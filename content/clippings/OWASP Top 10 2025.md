---
title: OWASP Top 10:2025 --- Introduction
description: OWASP Top 10:2025
source: https://owasp.org/Top10/2025/0x00_2025-Introduction/
author:
  - owasp
tags:
  - clippings
  - security
---

## 2025 年 TOP 10 有哪些变化

2025 年的十大安全风险中新增了两个类别，并对一个类别进行了整合。我们尽可能保持关注根本原因而非症状。鉴于软件工程和软件安全的复杂性，创建十个完全没有重叠的类别基本上是不可能的。

![[owasp-top10-2021-to-2025.png]]

- **[A01:2025 - Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/)** maintains its position at #1 as the most serious application security risk; the contributed data indicates that on average, 3.73% of applications tested had one or more of the 40 Common Weakness Enumerations (CWEs) in this category. As indicated by the dashed line in the above figure, Server-Side Request Forgery (SSRF) has been rolled into this category.  
  A01:2025 - 访问控制缺陷仍然保持在第一位，作为最严重的应用程序安全风险；贡献的数据表明，平均有 3.73%的应用程序测试中存在此类别中的 40 个常见弱点枚举（CWE）中的一个或多个。正如上图中的虚线所示，服务器端请求伪造（SSRF）已被整合到此类别中。
- **[A02:2025 - Security Misconfiguration](https://owasp.org/Top10/2025/A02_2025-Security_Misconfiguration/)** moved up from #5 in 2021 to #2 in 2025. Misconfigurations are more prevalent in the data for this cycle. 3.00% of the applications tested had one or more of the 16 CWEs in this category. This is not surprising, as software engineering is continuing to increase the amount of an application’s behavior that is based on configurations.  
  A02:2025 - 安全配置错误从 2021 年的第 5 位上升至 2025 年的第 2 位。在此周期中，配置错误在数据中更为普遍。3.00%的应用程序测试中存在此类别中的 16 个 CWE 中的一个或多个。这并不令人意外，因为软件工程正在不断增加应用程序行为中基于配置的部分。
- **[A03:2025 - Software Supply Chain Failures](https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/)** is an expansion of [A06:2021-Vulnerable and Outdated Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/) to include a broader scope of compromises occurring within or across the entire ecosystem of software dependencies, build systems, and distribution infrastructure. This category was overwhelmingly voted a top concern in the community survey. This category has 5 CWEs and a limited presence in the collected data, but we believe this is due to challenges in testing and hope that testing catches up in this area. This category has the fewest occurrences in the data, but also the highest average exploit and impact scores from CVEs.  
  A03:2025 - 软件供应链故障是对 A06:2021-易受攻击和过时的组件的扩展，以包含更广泛的软件依赖关系、构建系统和分发基础设施中发生的妥协范围。该类别在社区调查中获得了压倒性的投票，成为首要关注点。该类别包含 5 个 CWE，但在收集的数据中存在有限的存在，但我们认为这是由于测试挑战所致，并希望测试能在该领域迎头赶上。该类别在数据中的发生次数最少，但 CVE 的平均利用和影响评分最高。
- **[A04:2025 - Cryptographic Failures](https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/)** falls two spots from #2 to #4 in the ranking. The contributed data indicates that, on average, 3.80% of applications have one or more of the 32 CWEs in this category. This category often leads to sensitive data exposure or system compromise.  
  A04:2025 - 密码学故障在排名中从第 2 位降至第 4 位。贡献的数据表明，平均而言，3.80%的应用程序包含该类别中的 32 个 CWE 之一或多个。该类别通常会导致敏感数据泄露或系统妥协。
- **[A05:2025 - Injection](https://owasp.org/Top10/2025/A05_2025-Injection/)** falls two spots from #3 to #5 in the ranking, maintaining its position relative to Cryptographic Failures and Insecure Design. Injection is one of the most tested categories, with the greatest number of CVEs associated with the 38 CWEs in this category. Injection includes a range of issues from Cross-site Scripting (high frequency/low impact) to SQL Injection (low frequency/high impact) vulnerabilities.  
  A05:2025 - 注入攻击在排名中从第 3 位下降到第 5 位，与加密失败和设计不安全保持相对位置。注入攻击是最常被测试的类别之一，与该类别中的 38 个 CWE 相关联的 CVE 数量最多。注入攻击包括从跨站脚本（高频/低影响）到 SQL 注入（低频/高影响）漏洞等一系列问题。
- **[A06:2025 - Insecure Design](https://owasp.org/Top10/2025/A06_2025-Insecure_Design/)** slides two spots from #4 to #6 in the ranking as Security Misconfiguration and Software Supply Chain Failures leapfrog it. This category was introduced in 2021, and we have seen noticeable improvements in the industry related to threat modeling and a greater emphasis on secure design.  
  A06:2025 - 设计不安全在排名中从第 4 位下降到第 6 位，因为安全配置错误和软件供应链失败跳过了它。这个类别于 2021 年引入，我们观察到行业在威胁建模方面有显著改进，并且更加重视安全设计。
- **[A07:2025 - Authentication Failures](https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/)** maintains its position at #7 with a slight name change (prevously it was “ [Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/) ") to more accurately reflect the 36 CWEs in this category. This category remains important, but the increased use of standardized frameworks for authentication appears to be having beneficial effects on the occurrences of authentication failures.  
  A07:2025 - 认证失败保持在第 7 位，名称略有更改（之前为“身份识别和认证失败”），以更准确地反映该类别中的 36 个 CWE。这个类别仍然很重要，但认证标准化框架的日益普及似乎对认证失败的 occurrences 产生了积极影响。
- **[A08:2025 - Software or Data Integrity Failures](https://owasp.org/Top10/2025/A08_2025-Software_or_Data_Integrity_Failures/)** continues at #8 in the list. This category is focused on the failure to maintain trust boundaries and verify the integrity of software, code, and data artifacts at a lower level than Software Supply Chain Failures.  
  A08:2025 - 软件或数据完整性故障继续位列第 8。此类别专注于未能维护信任边界，并在软件、代码和数据工件层面低于软件供应链故障的完整性验证。
- **[A09:2025 - Security Logging & Alerting Failures](https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/)** retains its position at #9. This category has a slight name change (previously [Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/) ”) to emphasize the importance of the alerting functionality needed to induce appropriate action on relevant logging events. Great logging with no alerting is of minimal value in identifying security incidents. This category will always be underrepresented in the data, and was again voted into a position in the list from the community survey participants.  
  A09:2025 - 安全日志记录与告警故障保持第 9 位。此类别名称略有更改（此前为“安全日志记录与监控故障”），以强调需要通过告警功能来诱导对相关日志事件采取适当行动的重要性。良好的日志记录而无告警在识别安全事件中的价值微乎其微。此类别在数据中始终代表性不足，并且再次通过社区调查参与者投票位列清单之中。
- **[A10:2025 - Mishandling of Exceptional Conditions](https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/)** is a new category for 2025. This category contains 24 CWEs focusing on improper error handling, logical errors, failing open, and other related scenarios stemming from abnormal conditions that systems may encounter.  
  A10:2025 - 异常情况处理不当是 2025 年新增的类别。此类别包含 24 个 CWE，专注于不当的错误处理、逻辑错误、开放失败以及其他源自系统可能遇到的异常条件的相关场景。
