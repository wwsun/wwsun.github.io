---
title: kubectl 基本使用指南
date: 2026-10-21
description: Kubernetes 命令行工具 kubectl 的常用操作速查，涵盖资源查看、日志、进入容器、输出格式与实用技巧
tags:
  - kubernetes
  - cli
  - devops
---

kubectl 是 Kubernetes 集群的命令行管理工具，用于部署应用、查看和管理集群资源、排查问题。

## 基本语法

```bash
kubectl [command] [TYPE] [NAME] [flags]
```

- `command`：操作动词，如 `get`、`describe`、`apply`、`delete`、`logs`、`exec`
- `TYPE`：资源类型，如 `pod`、`deployment`、`service`（支持单复数和简写）
- `NAME`：资源名称
- `flags`：参数，如 `-n` 指定命名空间、`-o` 指定输出格式

## 常用资源类型与简写

- `pods` → `po`
- `deployments` → `deploy`
- `services` → `svc`
- `namespaces` → `ns`
- `statefulsets` → `sts`
- `configmaps` → `cm`
- `nodes` → `no`

## 查看资源

```bash
# 列出指定命名空间下的 Pod
kubectl -n opensandbox get pods

# 显示更多信息（IP、所在节点等）
kubectl -n opensandbox get pods -o wide

# 查看单个资源详情（含事件，排障首选）
kubectl -n opensandbox describe pod <pod-name>

# 查看 YAML / JSON 定义
kubectl -n opensandbox get pod <pod-name> -o yaml
kubectl -n opensandbox get pod <pod-name> -o json

# 用 jsonpath 提取特定字段（如查看 Pod 内容器名）
kubectl -n opensandbox get pod <pod-name> -o jsonpath='{.spec.containers[*].name}'

# 持续监听资源变化
kubectl -n opensandbox get pods -w
```

## 查看日志

```bash
# 查看 Pod 日志
kubectl -n opensandbox logs <pod-name>

# 实时跟踪日志
kubectl -n opensandbox logs -f <pod-name>

# 多容器 Pod 需指定容器
kubectl -n opensandbox logs <pod-name> -c <container-name>

# 查看上一个崩溃容器的日志（排查 CrashLoopBackOff）
kubectl -n opensandbox logs <pod-name> --previous
```

## 进入容器终端

```bash
kubectl -n opensandbox exec -it <pod-name> -- /bin/bash
```

- `-it`：分配交互式终端
- 容器内没有 bash 时（如 alpine 镜像），改用 `/bin/sh`
- 多容器 Pod 加 `-c <container-name>` 指定容器
- 退出终端输入 `exit`

> [!warning] 复制命令的注意点
> 从终端复制命令时不要把提示符（如 `root@host:/#`）一起粘贴进去，否则 bash 会把提示符当成命令名，报 `No such file or directory`。

## 应用与删除配置

```bash
# 应用 YAML 配置（创建或更新）
kubectl apply -f app.yaml

# 删除 YAML 中定义的资源
kubectl delete -f app.yaml

# 按标签删除
kubectl -n opensandbox delete pods -l app=myapp
```

## Deployment 与副本管理

```bash
# 查看 Deployment
kubectl get deployments

# 扩缩容
kubectl scale deployment <name> --replicas=3

# 查看滚动发布状态
kubectl rollout status deployment <name>

# 查看发布历史与回滚
kubectl rollout history deployment <name>
kubectl rollout undo deployment <name>
```

## StatefulSet 说明

StatefulSet 的 Pod 命名规则为 `<statefulset名>-<序号>`，序号从 0 开始：

- `xxx-0` 是第 1 个 Pod，扩容时依次出现 `-1`、`-2`
- 与 Deployment 的随机 Pod 名不同，StatefulSet Pod 名和序号是稳定的，重建后名字不变
- 按序号顺序创建（升序）和删除（降序）

## 命名空间与上下文

```bash
# 查看所有命名空间
kubectl get ns

# 查看所有命名空间的 Pod
kubectl get pods -A

# 查看当前上下文（当前连接的集群）
kubectl config current-context

# 列出并切换上下文
kubectl config get-contexts
kubectl config use-context <context-name>

# 设置默认命名空间（免去每次加 -n）
kubectl config set-context --current --namespace=opensandbox
```

## 实用技巧

```bash
# 查看某资源类型的字段说明（比文档快）
kubectl explain pod.spec.containers

# 试运行，不真正创建（配合 -o yaml 可生成配置）
kubectl run test --image=nginx --dry-run=client -o yaml

# 端口转发：把本地 8080 映射到 Pod 的 80
kubectl -n opensandbox port-forward <pod-name> 8080:80

# 本地与容器间复制文件
kubectl -n opensandbox cp ./local.txt <pod-name>:/tmp/remote.txt
kubectl -n opensandbox cp <pod-name>:/tmp/remote.txt ./local.txt

# 查看资源占用（需 metrics-server）
kubectl top nodes
kubectl top pods -n opensandbox
```

## 排障常用组合

1. `kubectl get pods -n <ns>` 看 Pod 状态是否为 `Running`
2. `kubectl describe pod <name> -n <ns>` 看 Events（拉镜像失败、调度失败等）
3. `kubectl logs <name> -n <ns> [--previous]` 看应用日志
4. `kubectl exec -it <name> -n <ns> -- /bin/sh` 进容器内排查网络、配置、文件
