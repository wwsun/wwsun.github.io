---
created: 2025-12-19 17:01
url:
tags:
---
是 macOS 上用来**把文本写入剪贴板**的命令行工具

pbcopy = pasteboard copy

```bash
# 复制文件内容
pbcopy < file.txt


# 从命令输出复制到剪贴板
cat ~/.ssh/id_ed25519.pub | pbcopy

# 复制当前的目录路径
pwd | pbcopy
```

## pbpaste

`pbpaste` 是从剪贴板读出内容：

```bash
pbpaste > out.txt    # 把剪贴板内容存到文件
pbpaste | wc -l      # 统计剪贴板文本的行数
```