---
title: "Linux 常用排错与开发命令"
date: 2026-04-03
tags:
  - linux
  - devops
  - wiki
---

作为 Web 开发者，登录服务器排查问题是家常便饭。以下是必备且最高频的命令集合，按场景分类。

## 1. 进程管理与端口查看

当你遇到 "Port already in use" 或服务死锁时，这些命令是首选。

### 查看特定端口的进程

```bash
# 查看 8080 端口被哪个进程占用
lsof -i :8080

# 或者使用 netstat (需 sudo 权限查看 PID)
sudo netstat -tunlp | grep :8080
```

### 查找并杀死进程

```bash
# 查找关键词为 'node' 的进程
ps -ef | grep node

# 强行杀死 PID 为 1234 的进程
kill -9 1234
```

> [!tip] 优雅退出
> 优先尝试 `kill 1234` (SIGTERM)，让程序有机会处理善后工作。只有卡死时才使用 `kill -9`。

---

## 2. 文件过滤与日志监控

查看错误日志是排错的核心。

### 实时滚动查看日志

```bash
# 查看最后 100 行并持续追踪
tail -n 100 -f access.log
```

### 搜索关键字 (Grep)

```bash
# 在所有 .log 文件中搜索 'ERROR'
grep "ERROR" *.log

# 查看匹配行及其后 5 行（查看上下文）
grep -A 5 "exception" error.log

# 递归查找目录下包含某个字符串的所有文件
grep -r "API_KEY" ./src
```

### 分页查看

```bash
# 比 cat 更好用，支持搜索和跳转
less system.log
# (进入后按 / 搜索，按 q 退出)
```

---

## 3. 系统状态与性能观察

磁盘满了、内存爆了、CPU 飙升？

### 整体负载

```bash
# 实时查看 CPU 和内存占用高的进程
top
# 推荐安装更美观的 htop
htop
```

### 磁盘与文件大小

```bash
# 查看磁盘剩余空间
df -h

# 查看当前目录下各文件/文件夹大小（深度为 1）
du -sh * | sort -hr
```

### 内存情况

```bash
# 查看内存总量、已用和剩余
free -h
```

---

## 4. 网络诊断

### 测试接口连通性

```bash
# 测试 API，显示响应头
curl -I https://api.example.com

# 检查远程端口是否开启
telnet 1.2.3.4 80
# 或者使用 nc
nc -zv 1.2.3.4 80
```

### 域名解析排查

```bash
# 查看 DNS 解析指向
dig example.com
```

---

## 5. 文件传输与远程连接

### 远程登录

关于 SSH 的详细配置，请参考 [[ssh]]。

### 拷贝文件 (SCP)

```bash
# 将本地文件拷贝到服务器
scp ./bundle.zip user@remote:/var/www/
```

---

## 6. 其他常用技巧

### 查找文件

```bash
# 按名称查找当前目录下的文件
find . -name "index.html"
```

### 修改权限

```bash
# 递归修改目录及其子文件所有者
chown -R www-data:www-data /var/www/html

# 设置文件权限 (建议只在必要时修改)
chmod 644 config.json
```

> [!warning] 慎用 777
> 永远不要在生产环境下对整个 web 目录使用 `chmod -R 777`。

---

## 关联阅读

- [[nginx]] - Nginx 配置与排错
- [[ssh]] - SSH 进阶实战
