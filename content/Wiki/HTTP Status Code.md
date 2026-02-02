---
created: 2025-12-19 16:56
url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
tags:
  - http
---
常见状态码如下

###  **1xx 信息响应**

- `100 Continue`：客户端应继续请求。
- `101 Switching Protocols`：服务器已理解请求，正在切换协议。

---

###  **2xx 成功**

- `200 OK`：请求成功。
- `201 Created`：请求成功并创建了新资源。
- `204 No Content`：请求成功，但无返回内容。

---

###  **3xx 重定向**

- `301 Moved Permanently`：资源已永久移动到新位置。
- `302 Found`：临时重定向。
- `304 Not Modified`：资源未修改，可使用缓存版本。

---

###  **4xx 客户端错误**

- `400 Bad Request`：请求格式错误。
- `401 Unauthorized`：需要身份验证。
- `403 Forbidden`：服务器理解请求，但拒绝执行。
- `404 Not Found`：请求的资源不存在。
- `405 Method Not Allowed`：请求方法不被允许。

---

###  **5xx 服务器错误**

- `500 Internal Server Error`：服务器内部错误。
- `502 Bad Gateway`：网关或代理服务器收到无效响应。
- `503 Service Unavailable`：服务器暂时超载或维护。
- `504 Gateway Timeout`：网关超时未收到上游响应。

