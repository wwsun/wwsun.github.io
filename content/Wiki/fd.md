---
created: 2025-12-15 21:15
url: https://github.com/sharkdp/fd
tags:
  - linux
---
在 macOS 或 Linux 下，`fd` 是一个非常高效且现代化的文件查找工具。你可以用它快速查找特定名字的文件或目录。

### 1. 查找特定文件

比如查找当前目录下所有名为 `config.json` 的文件：

```bash
fd config.json

```

### 2. 查找特定目录

如果你只想查找目录（而不是文件），用 `-t d` 参数，例如查找名为 `node_modules` 的所有目录：

```bash
fd node_modules -t d

```

再比如查找名为 `.git` 的所有目录：

```bash
fd .git -t d

```

### 3. 在指定目录下查找

比如只在 `~/Projects` 目录下查找：

```bash
fd .git -t d ~/Projects

```

### 4. 查找特定后缀的文件

比如查找所有 `.py` 文件：

```bash
fd .py

```

或者更精确一点（只匹配后缀）：

```bash
fd -e py

```

### 5. 显示绝对路径

如果想显示绝对路径，加 `-a` 参数：

```bash
fd .git -t d -a

```

---

## 总结常用参数

- `t d`：只查找目录（directory）
- `t f`：只查找文件（file）
- `e ext`：按扩展名查找
- `a`：显示绝对路径
- `-hidden`：包括隐藏文件和目录
- `x <command>`：对查找到的每个结果执行命令

---

### 举例

查找所有名为 `build` 的目录（含隐藏的）并显示绝对路径：

```bash
fd build -t d -a --hidden

```

---

如需更复杂的用法或者有特殊需求可以继续提问！