---
created: 2025-12-18 09:49
url:
tags:
  - ssh
---
macOS 自带 SSH 客户端（`ssh`、`ssh-keygen` 等），无需额外安装。
## 密钥生成

```
# 推荐使用 ED25519 算法 
ssh-keygen -t ed25519 -C "<your_email>" 

ssh-keygen -t ed25519 -C "ww.sun@outlook.com" 
ssh-keygen -t ed25519 -C "sunweiwei01@corp.xxx.com"
```

### 密钥类型选择

| 场景                 | 推荐命令                                    |
| ------------------ | --------------------------------------- |
| **日常使用（首选）**       | `ssh-keygen -t ed25519 -C "your_email"` |
| **需要最大兼容性**        | `ssh-keygen -t rsa -b 4096`             |
| **连接云服务/GitHub**   | `ssh-keygen -t ed25519`                 |
| **企业合规要求 NIST**    | `ssh-keygen -t ecdsa -b 384`            |
| **硬件安全密钥 (FIDO2)** | `ssh-keygen -t ed25519-sk`              |
[[ssh 密钥类型对比]]

### 添加私钥到 ssh-agent

```
ssh-add id_ed25519
```

### 拷贝公钥到平台

```
pbcopy < ~/.ssh/id_ed25519.pub
```

### 配置验证

```bash
ssh -F ~/.ssh/config -T git@github.com

# 如果配置了 config
ssh -T git@github.com
```

### 查看实际使用的配置

```bash
ssh -G hostname
```

### 登陆服务器

```bash
ssh 用户名@服务器地址
# 例如：
ssh root@192.168.1.10
ssh ubuntu@example.com
```

## 常用配置

常用的配置如下：
config 文件编写示例，没有的话，自己 touch 一个 `touch ~/.ssh/config`

```yaml
Host *
  UseKeychain yes
  AddKeysToAgent yes

Host github.com
  HostName github.com
  IdentityFile ~/.ssh/id_ed25519

Host netease.com
  HostName g.hz.netease.com
  Port 22222
  User sunweiwei01
  PreferredAuthentications publickey
  IdentityFile ~/.ssh/netease

```

## 必备的基础配置

### 服务器别名配置

```bash
Host prod
    Hostname 192.168.1.100
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_rsa_prod

Host dev
    Hostname dev.example.com
    User developer
    Port 2222

```

使用：`ssh prod` 而不是 `ssh deploy@192.168.1.100`

### 通配符配置

```bash
Host *.example.com
    User admin
    IdentityFile ~/.ssh/company_key

Host 10.0.*
    User root
    StrictHostKeyChecking no

```

## 重要的安全配置

```bash
Host *
    # 禁用密码认证，强制使用密钥
    PasswordAuthentication no

    # 启用主机密钥检查
    StrictHostKeyChecking yes

    # 设置连接超时
    ConnectTimeout 10

    # 保持连接活跃
    ServerAliveInterval 60
    ServerAliveCountMax 3

```

## 跳板机（Jump Host）配置

```bash
Host jump
    Hostname bastion.example.com
    User jumpuser

Host internal-server
    Hostname 10.0.1.50
    User appuser
    ProxyJump jump
    # 或者使用旧语法
    # ProxyCommand ssh -W %h:%p jump

```

## 多密钥管理

```bash
Host github-work
    Hostname github.com
    User git
    IdentityFile ~/.ssh/id_rsa_work
    IdentitiesOnly yes

Host github-personal
    Hostname github.com
    User git
    IdentityFile ~/.ssh/id_rsa_personal
    IdentitiesOnly yes

```

使用：

```bash
git clone git@github-work:company/repo.git
git clone git@github-personal:myuser/repo.git

```

## 端口转发配置

```bash
Host tunnel
    Hostname remote-server.com
    User tunneluser
    # 本地端口转发
    LocalForward 8080 localhost:80
    # 远程端口转发
    RemoteForward 9000 localhost:3000
    # 动态端口转发（SOCKS代理）
    DynamicForward 1080

```

## 性能优化配置

```bash
Host *
    # 启用连接复用
    ControlMaster auto
    ControlPath ~/.ssh/sockets/%r@%h-%p
    ControlPersist 600

    # 启用压缩
    Compression yes

    # 禁用不必要的功能
    ForwardAgent no
    ForwardX11 no

```

## 调试和故障排除

```bash
Host debug-server
    Hostname problem-server.com
    User debuguser
    # 启用详细日志
    LogLevel DEBUG3
    # 或者临时使用：ssh -vvv debug-server

```

## 包含其他配置文件

```bash
# 在主配置文件开头
Include ~/.ssh/config.d/*

```

## 权限设置（重要！）

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/id_rsa*
chmod 644 ~/.ssh/id_rsa*.pub

```
