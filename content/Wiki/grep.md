---
created: 2025-12-18 09:52
url:
tags:
---
grep 是你进行代码搜索、日志排查等日常开发中极其重要的命令行工具。以下是你一定要掌握的 grep 基础及常用用法：

### 1. 基本语法

```bash
grep [选项] "搜索内容" 文件名
```

### 2. 常用选项

- `i`：忽略大小写（ignore case）
- `r` 或 `R`：递归搜索（目录下所有文件）
- `n`：显示匹配的行号（number）
- `v`：反向匹配（显示不包含关键词的行）
- `l`：只显示文件名（文件名列表，list）
- `c`：只显示匹配的行数（count）
- `A N`：显示匹配行及其后 N 行（after）
- `B N`：显示匹配行及其前 N 行（before）
- `C N`：显示匹配行及前后各 N 行（context）


### 3. 常用场景举例

### 代码查找

```bash
grep "functionName" *.js
grep -rn "api/v1" src/

```

### 日志排查

```bash
grep "ERROR" app.log
grep -i "timeout" /var/log/nginx/error.log

```

### 多文件递归查找

```bash
grep -r "TODO" .

```

### 统计匹配行数

```bash
grep -c "404" access.log

```

### 排除匹配内容

```bash
grep -v "DEBUG" server.log

```

### 匹配并显示行号

```bash
grep -n "console.log" *.js

```

### 只显示包含关键字的文件名

```bash
grep -rl "axios" src/

```


### 4. 正则表达式（进阶）

- `^pattern`：匹配以 pattern 开头的行
- `pattern$`：匹配以 pattern 结尾的行
- `.*`：匹配任意字符（通配）
- `foo|bar`：匹配 foo 或 bar


### 5. 配合其他命令

- `管道符 |`：与其他命令组合
- `find . -name "*.js" | xargs grep "fetch"`
