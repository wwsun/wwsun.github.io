---
title: docker-compose
tags:
  - docker
draft: false
description: docker compose 是一个用于定义和运行多容器 Docker 应用程序的工具。
source:
---

**Docker Compose** 是一个用于定义和运行多容器 Docker 应用程序的工具。

在实际开发中，一个 Web 项目通常不只有一个容器。例如，你可能需要一个 Node.js 应用容器、一个 MySQL 数据库容器和一个 Redis 缓存容器。如果手动使用 `docker run` 命令逐个启动，不仅效率低，而且难以管理它们之间的网络连接和挂载卷。

Docker Compose 允许你通过一个 **YAML 文件**（通常命名为 `docker-compose.yml`）来配置应用程序的所有服务。然后，只需一个命令，就可以创建并启动配置文件中的所有服务。

---

## 核心概念

### 1. 配置文件结构 (`docker-compose.yml`)

YAML 文件是 Docker Compose 的灵魂。你主要会接触到以下四个顶层配置：

- **services**: 定义各个容器（如 web, db）。
- **networks**: 定义容器间的网络通信。
- **volumes**: 定义持久化数据的存储卷。
- **environment**: 设置环境变量（如数据库密码）。

### 2. 服务间的通信 (Service Discovery)

在同一个 Compose 项目中，容器之间可以通过 **服务名** 直接通信，而不需要知道对方的 IP 地址。

> **例子**：如果你的数据库服务命名为 `db`，那么你的 Node.js 代码中连接数据库的地址可以直接写成 `mongodb://db:27017`。

### 3. 常用命令流

你不需要记住所有命令，但以下几个是高频使用的：

- `docker-compose up -d`: 后台启动所有服务。
- `docker-compose down`: 停止并移除容器、网络和镜像（注意：这不会删除已命名的 volumes）。
- `docker-compose ps`: 查看当前正在运行的服务状态。
- `docker-compose logs -f [service_name]`: 查看特定服务的实时日志（对调试 Node.js 或 Java 后端非常有用）。

### 4. 环境变量的管理

不要在 YAML 文件中硬编码敏感信息。你可以创建一个 `.env` 文件，Docker Compose 会自动读取它：

```yaml
# docker-compose.yml
services:
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

### 5. 数据持久化 (Volumes)

容器的生命周期是短暂的。如果你删除了数据库容器，里面的数据也会丢失。因此，你必须学会使用 `volumes` 将容器内的数据目录映射到宿主机，或者使用 Docker 管理的具名卷。

---

## 为什么它对全栈开发很重要？

1.  **环境一致性**：无论是你的本地开发环境，还是未来的 Java 生产服务器，只要有 Docker Compose，环境配置就是完全一样的。
2.  **简化依赖**：当你学习 Java 框架（如 Spring Boot）时，可能需要配置消息队列（RabbitMQ）或复杂的数据库。使用 Compose 可以一键搭建起这些复杂的基础设施。
3.  **快速切换**：你可以为不同的项目编写不同的 `docker-compose.yml`，随时启动或关闭整套技术栈，而不会污染你的物理系统。

这是一个非常经典的“全栈开发基础套装”。作为从 Node.js 转向 Java 的开发者，你会发现 Docker Compose 在这种多组件场景下能极大地降低配置复杂度。

假设你的项目目录结构如下：

```text
my-java-app/
├── src/                # Java 源代码
├── pom.xml             # Maven 配置
├── Dockerfile          # 用于构建 Java 应用镜像
└── docker-compose.yml  # Compose 配置文件
```

---

## 如何使用

### 安装 colima + docker-compose

```
brew install docker-compose
```

配置 docker 插件目录，并创建一个符号链接，让 docker 命令能够识别它：

```bash
# 创建 Docker 插件目录
mkdir -p ~/.docker/cli-plugins

# 将 Homebrew 安装的 compose 链接到插件目录
ln -sfn $(brew --prefix)/opt/docker-compose/bin/docker-compose ~/.docker/cli-plugins/docker-compose
```

验证

```bash
docker compose version
> Docker Compose version v2.x.x
```

**在使用 compose 之前，需要先启动 colima 虚拟机**

### 1. 编写 docker-compose.yml

这个文件定义了三个服务的协作方式：

```yaml
version: "3.8"

services:
  # 1. Java 后端应用
  java-app:
    build: .
    container_name: java-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/app_db
      - SPRING_REDIS_HOST=redis-cache
    depends_on:
      - mysql-db
      - redis-cache
    networks:
      - back-tier

  # 2. MySQL 数据库
  mysql-db:
    image: mysql:8.0
    container_name: mysql-container
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: app_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - back-tier

  # 3. Redis 缓存
  redis-cache:
    image: redis:alpine
    container_name: redis-container
    networks:
      - back-tier

# 定义持久化卷
volumes:
  mysql_data:

# 定义内部网络
networks:
  back-tier:
    driver: bridge
```

---

### 2. 三个关键点

#### 服务发现（Service Discovery）

在 Node.js 中你可能习惯了用 `localhost`。但在 Docker Compose 中，**服务名就是域名**。

- 在 Java 的配置文件（如 `application.yml`）中，连接数据库的地址**不要**写 `localhost:3306`，而要写 `mysql-db:3306`。
- 同样，Redis 的 Host 填 `redis-cache`。

#### 依赖顺序（depends_on）

虽然 `depends_on` 能保证 `mysql-db` 在 `java-app` 之前启动，但它**不保证** MySQL 内部的服务已经完全就绪（数据库初始化可能需要几秒钟）。

- **Java 转型建议**：在 Spring Boot 应用中，建议配置连接池的重试机制，或者使用 `wait-for-it.sh` 脚本，防止 Java 应用因为数据库还没准备好而启动失败直接退出。

#### 数据持久化（Volumes）

对于 MySQL，必须映射 `/var/lib/mysql`。

- 如果不写 `volumes`，每次你执行 `docker-compose down` 后，你在数据库里创建的表和数据都会消失。
- 上文使用的是 **Named Volumes** (`mysql_data`)，这是生产环境和本地开发中最推荐的方式，由 Docker 统一管理。

---

### 3. 针对 Java 开发者的 Dockerfile 建议

由于 Java 需要编译过程，建议在 `Dockerfile` 中使用**多阶段构建**（Multi-stage Build），这能显著减小镜像体积：

```dockerfile
# 第一阶段：编译
FROM maven:3.8-openjdk-17 AS build
COPY src /home/app/src
COPY pom.xml /home/app
RUN mvn -f /home/app/pom.xml clean package

# 第二阶段：运行
FROM openjdk:17-jdk-slim
COPY --from=build /home/app/target/*.jar /usr/local/lib/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/usr/local/lib/app.jar"]
```

---

### 4. 常用操作流程

1. `colima start`

2. 进入项目 `cd my-java-project`

3. **启动整套环境**：
   `docker-compose up -d` 或者新方式 `docker compose up`
   （这会下载镜像、创建网络、挂载卷并启动所有容器）

4. **查看 Java 日志**：
   `docker-compose logs -f java-app`
   （当你排查 Spring Boot 启动报错时，这是最常用的命令）

5. **进入 MySQL 命令行**：
   `docker exec -it mysql-container mysql -u root -p`
   （如果你需要手动手动创建表或检查数据）

6. **修改代码后更新**：
   `docker-compose up -d --build java-app`
   （这只会重新构建并重启 Java 服务，而不会影响正在运行的 MySQL 和 Redis）

7. 关闭环境 `docker compose down`

## 容器文件系统配置

在 Docker 中，容器的文件系统是“临时”的。如果你没有配置持久化存储，那么数据只会存在于容器的生命周期内。

推荐使用 Named Volumes，由 Docker 统一管理，不需要关心宿主机的具体路径，性能最好。

```yaml
services:
  db:
    image: mysql:8.0
    volumes:
      - mysql_data:/var/lib/mysql # 映射到 Docker 管理的卷

volumes:
  mysql_data: # 必须在顶层声明
```
