---
created: 2025-12-18 09:53
url:
tags:
---

### 1. 基本请求

```bash
curl <https://example.com>

```

直接发送 GET 请求，获取网页内容。

### 2. 指定 HTTP 方法

- **GET**（默认）：
    
    ```bash
    curl <https://api.example.com/data>
    
    ```
    
- **POST**：
    
    ```bash
    curl -X POST <https://api.example.com/login>
    
    ```
    
- **PUT、DELETE 等**：
    
    ```bash
    curl -X PUT <https://api.example.com/item/123>
    curl -X DELETE <https://api.example.com/item/123>
    
    ```
    

### 3. 携带数据

- **POST 表单数据**：
    
    ```bash
    curl -d "username=foo&password=bar" <https://api.example.com/login>
    
    ```
    
- **POST JSON**：
    
    ```bash
    curl -H "Content-Type: application/json" -d '{"key":"value"}' <https://api.example.com/api>
    
    ```
    

### 4. 添加请求头

```bash
curl -H "Authorization: Bearer <token>" <https://api.example.com/user>
curl -H "Content-Type: application/json" ...

```

### 5. 保存响应内容到文件

```bash
curl -o result.json <https://api.example.com/data>

```

### 6. 显示请求和响应头信息

- 只显示响应头：
    
    ```bash
    curl -I <https://example.com>
    
    ```
    
- 显示全部过程（包括请求头和响应头）：
    
    ```bash
    curl -v <https://example.com>
    
    ```
    

### 7. 跟踪重定向

```bash
curl -L <https://example.com>

```

### 8. 携带 Cookie

```bash
curl --cookie "user=foo" <https://example.com>

```

### 9. 上传文件

```bash
curl -F "file=@/path/to/file.txt" <https://api.example.com/upload>

```

### 10. 设置超时时间

```bash
curl --max-time 10 <https://example.com>

```
