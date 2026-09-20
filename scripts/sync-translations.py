#!/usr/bin/env python3
"""
从 Obsidian 源库（netease-work）同步 Translations 与 Learning 内容到本网志 content 目录。

同步映射：
- Translations/*.md            → content/clippings/
- Learning/<子目录>/**/*.md     → content/notes/<子目录>/

同步规则：
- 跳过源库的 index.md 与非 markdown 文件
- 增量同步：正文（frontmatter 之外的部分）一致则跳过，避免重复与无谓改动
- frontmatter 规范化：
  * clippings：date → created，tags 中 translation → clippings（缺失时补上）
  * notes：标题清理 emoji，补充子目录标签（english-learning / coding 等）
  * 无 frontmatter 的文件自动生成（title 取自源 index.md 映射或正文标题，date 取自文件名）
- 内容规范化：清理标题中的 emoji、wikilink 去路径前缀（[[Translations/xxx]] → [[xxx]]）
- 同步完成后自动调用仓库根目录的 sync_index.py 刷新所有 index.md

用法：
  python3 scripts/sync-translations.py              # 实际同步并刷新索引
  python3 scripts/sync-translations.py --dry-run    # 只预览，不写文件
  python3 scripts/sync-translations.py --skip-index # 同步文件但跳过索引刷新
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# 源库根目录与本站 content 目录
SRC = Path("/Users/weiwei/obsidian-vault/netease-work")
ROOT = Path(__file__).resolve().parent.parent
DST = ROOT / "content"

# prettier 结果缓存：避免每次同步都为未变化的源文件重复调用 prettier
CACHE_FILE = ROOT / ".sync-cache" / "sync-translations.json"

# 清理 emoji（含变体选择符、ZWJ）
EMOJI_RE = re.compile(
    "["
    "\U0001F000-\U0001FAFF"  # Emoticons、Misc Symbols and Pictographs、补充符号
    "\U0001FB00-\U0001FBFF"
    "\U00002700-\U000027BF"  # Dingbats
    "\U00002600-\U000026FF"  # Misc symbols
    "\U00002B00-\U00002BFF"
    "\U0000FE00-\U0000FE0F"  # 变体选择符
    "\u200d"  # ZWJ
    "]+"
)

FM_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)

# 源库 wikilink 路径形式：[[Translations/xxx]] 或 [[Learning/<sub>/xxx]]
WIKILINK_PATH_RE = re.compile(
    r"\[\[(Translations|Learning/[A-Za-z0-9_-]+)/([^\]|]+)(\|[^\]]*)?\]\]"
)

# 源 index.md 列表行：- [[path/name|display]] - desc
INDEX_LINE_RE = re.compile(r"^-\s+\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\s*(?:[-—]\s*(.*))?$")

# 子目录 → 默认标签
SUBDIR_TAGS = {"english": "english-learning"}

# 子目录 index 骨架（供 sync_index.py 填充）
SUBDIR_INDEX_INFO = {
    "english": ("English", "每日技术英语精读、周报与词汇库。"),
    "coding": ("Coding", "Coding 相关的学习笔记。"),
}

# notes/index.md 中子目录导航行
SUBDIR_NAV = {
    "english": ("英语学习", "每日技术英语精读、周报与词汇库。"),
    "coding": ("Coding 学习笔记", "Coding 相关的学习笔记。"),
}


def clean_emoji(text: str) -> str:
    """去除 emoji 并整理多余空白。"""
    text = EMOJI_RE.sub("", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def split_frontmatter(text: str) -> tuple[str | None, str]:
    m = FM_RE.match(text)
    if m:
        return m.group(1), text[m.end():]
    return None, text


def extract_tags(fm: str) -> tuple[list[str], int, int] | None:
    """提取 frontmatter 中 tags 的值项与所在范围，返回 (items, start, end)。"""
    m = re.search(r"^tags:[ \t]*(.*)$", fm, re.MULTILINE)
    if not m:
        return None
    start = m.start()
    val_line = m.group(1).strip()
    pos = m.end() + 1  # tags 行末尾，跳到下一行起点
    items: list[str] = []

    if not val_line:
        # 块式：tags: 后跟缩进的 - item 行
        for line in fm[pos:].split("\n"):
            mm = re.match(r"^[ \t]+-\s*(.*)$", line)
            if mm:
                items.append(mm.group(1).strip())
                pos += len(line) + 1
            elif line.strip() == "":
                pos += len(line) + 1
                break
            else:
                break
    else:
        # flow 式（单行或多行）：tags: a, b, c 或 tags: [a, b, c]
        buff = val_line
        if "[" in buff:
            # 方括号 flow：收集续行直到闭合
            while "]" not in buff:
                line, _, _ = fm[pos:].partition("\n")
                if not line.strip():
                    break
                buff += " " + line.strip()
                pos += len(line) + 1
        else:
            # 无方括号 flow：行尾带逗号时继续收集缩进行
            while buff.rstrip().endswith(","):
                line, _, _ = fm[pos:].partition("\n")
                if not line.strip() or not line.startswith((" ", "\t")):
                    break
                buff += " " + line.strip()
                pos += len(line) + 1
        items = [t.strip() for t in buff.strip().strip("[]").split(",") if t.strip()]
    return items, start, pos


def write_tags_block(items: list[str]) -> str:
    return "tags:\n" + "".join(f"  - {item}\n" for item in items)


def has_tag(fm: str, tag: str) -> bool:
    extracted = extract_tags(fm)
    return extracted is not None and tag in extracted[0]


def ensure_tag(fm: str, tag: str) -> str:
    """frontmatter 中确保存在指定标签，输出统一为块式 tags。"""
    extracted = extract_tags(fm)
    if extracted is None:
        # 没有 tags 字段：在 frontmatter 末尾追加块式 tags
        return fm.rstrip() + f"\ntags:\n  - {tag}\n"
    items, start, end = extracted
    if tag not in items:
        items.append(tag)
    return fm[:start] + write_tags_block(items) + fm[end:]


def replace_tag(fm: str, old: str, new: str) -> str:
    """frontmatter 中标签替换，输出统一为块式 tags。"""
    extracted = extract_tags(fm)
    if extracted is None:
        return fm
    items, start, end = extracted
    items = [new if t == old else t for t in items]
    return fm[:start] + write_tags_block(items) + fm[end:]


def clean_fm_title(fm: str) -> str:
    """清理 frontmatter 中 title 行的 emoji。"""
    def repl(m: re.Match) -> str:
        return m.group(1) + clean_emoji(m.group(2))
    return re.sub(r"^(title:\s*)(.*)$", repl, fm, flags=re.MULTILINE)


def convert_wikilinks(body: str) -> str:
    """将 [[Translations/xxx]]、[[Learning/<sub>/xxx]] 转为最短路径链接。"""
    def repl(m: re.Match) -> str:
        base = os.path.basename(m.group(2))
        alias = m.group(3) or ""
        return f"[[{base}{alias}]]"
    return WIKILINK_PATH_RE.sub(repl, body)


def clean_body_heading(body: str) -> str:
    """清理正文首个标题中的 emoji（支持一级标题与无标记首行标题）。"""
    lines = body.split("\n")
    for i, line in enumerate(lines):
        if line.startswith("# "):
            lines[i] = clean_emoji(line)
            return "\n".join(lines)
    # 无一级标题时（如每日精读文件），清理首个非空行的 emoji
    for i, line in enumerate(lines):
        stripped = line.strip()
        if (
            stripped
            and not stripped.startswith(">")
            and not stripped.startswith("```")
            and not stripped.startswith("!")
        ):
            if EMOJI_RE.search(line):
                lines[i] = clean_emoji(line)
            break
    return "\n".join(lines)


def date_from_name(name: str) -> str | None:
    """从文件名提取日期，如 20260830-sentence.md → 2026-08-30。"""
    m = re.match(r"(\d{4})(\d{2})(\d{2})", name)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    return None


def parse_source_index(index_path: Path) -> dict[str, tuple[str, str]]:
    """解析源库 index.md，返回 {文件名: (标题, 描述)}。"""
    result: dict[str, tuple[str, str]] = {}
    if not index_path.exists():
        return result
    for line in index_path.read_text(encoding="utf-8").splitlines():
        m = INDEX_LINE_RE.match(line.strip())
        if not m:
            continue
        name = os.path.basename(m.group(1))
        title = clean_emoji(m.group(2)) if m.group(2) else name
        desc = clean_emoji(m.group(3)) if m.group(3) else ""
        result[name] = (title, desc)
    return result


def build_frontmatter(title: str, tag: str, desc: str = "", date: str | None = None) -> str:
    """为无 frontmatter 的文件生成 frontmatter 内容（不含 --- 包裹，由调用方拼装）。"""
    lines = [f"title: {yaml_quote(title)}", "tags:", f"  - {tag}"]
    if desc:
        lines.append(f"description: {yaml_quote(desc)}")
    if date:
        lines.append(f"date: {date}")
    return "\n".join(lines)


def first_heading(body: str, fallback: str) -> str:
    """取正文第一个一级标题（清理 emoji），无则回退到正文首行。"""
    for line in body.split("\n"):
        if line.startswith("# "):
            title = clean_emoji(line[2:])
            if title:
                return title
    # 无一级标题时取首个非空行（清理 emoji 与 markdown 标记）
    for line in body.split("\n"):
        line = clean_emoji(line.strip())
        if line and not line.startswith(">") and not line.startswith("```"):
            return line
    return fallback


def transform(
    src_path: Path, kind: str, subdir: str | None, index_map: dict[str, tuple[str, str]]
) -> tuple[str, str]:
    """转换源文件内容，返回 (frontmatter, body)。"""
    text = src_path.read_text(encoding="utf-8")
    fm, body = split_frontmatter(text)

    if fm is None:
        # 生成 frontmatter
        if kind == "notes" and subdir:
            title, desc = index_map.get(src_path.stem, ("", ""))
            # 源库 index 中的 "sentence" 为占位符，回退到正文首行
            if not title or title == "sentence":
                title = first_heading(body, src_path.stem)
            if not desc or desc == "sentence":
                desc = title
            tag = SUBDIR_TAGS.get(subdir, subdir)
            fm = build_frontmatter(title, tag, desc, date_from_name(src_path.stem))
        else:
            title = first_heading(body, src_path.stem)
            fm = build_frontmatter(title, "clippings", title, date_from_name(src_path.stem))
    elif kind == "clippings":
        fm = replace_tag(fm, "translation", "clippings")
        fm = ensure_tag(fm, "clippings")
        fm = re.sub(r"^date:", "created:", fm, flags=re.MULTILINE)
        fm = clean_fm_title(fm)
    else:
        fm = clean_fm_title(fm)
        if subdir:
            fm = ensure_tag(fm, SUBDIR_TAGS.get(subdir, subdir))

    body = convert_wikilinks(body)
    body = clean_body_heading(body)
    return fm, body


def ensure_subdir_index(subdir: str, dry_run: bool) -> None:
    """为 notes/<子目录> 创建 index.md 骨架（sync_index.py 会填充列表）。"""
    if subdir not in SUBDIR_INDEX_INFO:
        return
    title, desc = SUBDIR_INDEX_INFO[subdir]
    idx = DST / "notes" / subdir / "index.md"
    if idx.exists():
        return
    content = (
        f"---\ntitle: {title}\ndraft: false\ndescription: {desc}\n---\n\n"
        f"# {title} — 索引\n\n> {desc}\n"
    )
    if dry_run:
        print(f"  [index] 将创建 {idx.relative_to(ROOT)}")
    else:
        idx.parent.mkdir(parents=True, exist_ok=True)
        idx.write_text(content, encoding="utf-8")
        print(f"  [index] 已创建 {idx.relative_to(ROOT)}")


def ensure_notes_nav(dry_run: bool) -> None:
    """在 notes/index.md 中添加子目录导航行。"""
    notes_index = DST / "notes" / "index.md"
    text = notes_index.read_text(encoding="utf-8")
    added = []
    for subdir, (display, desc) in SUBDIR_NAV.items():
        if f"[[{subdir}/index" in text:
            continue
        line = f"- [[{subdir}/index|{display}]] — {desc}"
        added.append(line)
    if not added:
        return
    if dry_run:
        print(f"  [index] 将向 notes/index.md 添加导航：{added}")
        return
    # 追加到现有列表末尾
    new_text = text.rstrip() + "\n" + "\n".join(added) + "\n"
    notes_index.write_text(new_text, encoding="utf-8")
    print(f"  [index] notes/index.md 已添加 {len(added)} 条子目录导航")


def prettier_norm(text: str, filepath: str) -> str | None:
    """用 prettier 规范化文本（stdin → stdout），失败返回 None。"""
    try:
        result = subprocess.run(
            ["npx", "prettier", "--stdin-filepath", filepath],
            input=text,
            capture_output=True,
            text=True,
            cwd=ROOT,
            timeout=30,
        )
        if result.returncode == 0:
            return result.stdout
    except (OSError, subprocess.TimeoutExpired):
        pass
    return None


def refresh_index() -> None:
    """调用仓库根目录的 sync_index.py 刷新所有 index.md。"""
    script = ROOT / "sync_index.py"
    if not script.exists():
        print(f"[warn] 未找到 {script}，跳过索引刷新")
        return
    print(f"  正在运行 sync_index.py ...")
    result = subprocess.run(
        [sys.executable, str(script)], cwd=ROOT, capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"[error] sync_index.py 执行失败：\n{result.stderr}")
    else:
        print(result.stdout.strip())


def collect_jobs() -> list[tuple[Path, Path, str, str | None]]:
    """收集所有同步任务 (源路径, 目标路径, kind, 子目录)。"""
    jobs: list[tuple[Path, Path, str, str | None]] = []

    trans_dir = SRC / "Translations"
    if trans_dir.is_dir():
        for f in sorted(trans_dir.glob("*.md")):
            if f.name == "index.md":
                continue
            jobs.append((f, DST / "clippings" / f.name, "clippings", None))

    learning = SRC / "Learning"
    if learning.is_dir():
        for sub in sorted(p for p in learning.iterdir() if p.is_dir()):
            subdir = sub.name.lower()
            for f in sorted(sub.rglob("*.md")):
                if f.name == "index.md":
                    continue
                rel = f.relative_to(sub)
                jobs.append((f, DST / "notes" / subdir / rel, "notes", subdir))

    return jobs


def load_cache() -> dict:
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def save_cache(cache: dict) -> None:
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="同步 Translations 与 Learning 内容")
    parser.add_argument("--dry-run", action="store_true", help="只预览，不写文件")
    parser.add_argument("--skip-index", action="store_true", help="跳过索引刷新")
    parser.add_argument("--force", action="store_true", help="忽略正文一致性检查，强制重新转换所有文件")
    parser.add_argument("--no-format", action="store_true", help="跳过 prettier 格式化")
    args = parser.parse_args()

    jobs = collect_jobs()
    if not jobs:
        print("未发现待同步的源文件，请检查源库路径。")
        return 1

    index_maps: dict[str, dict[str, tuple[str, str]]] = {}
    for src_path, dst_path, kind, subdir in jobs:
        if kind == "notes" and subdir and subdir not in index_maps:
            index_maps[subdir] = parse_source_index(src_path.parent / "index.md")

    cache = load_cache()
    stats = {"created": [], "updated": [], "skipped": []}

    for src_path, dst_path, kind, subdir in jobs:
        rel = dst_path.relative_to(ROOT)
        cache_key = str(rel)
        src_hash = hashlib.sha256(src_path.read_bytes()).hexdigest()

        # 源未变化时复用缓存的 prettier 结果，避免重复调用 prettier
        entry = cache.get(cache_key)
        if entry and entry.get("src_hash") == src_hash:
            new_text = entry["text"]
        else:
            fm, body = transform(src_path, kind, subdir, index_maps.get(subdir or "", {}))
            new_text = "---\n" + fm + "\n---\n" + body
            if not args.no_format:
                formatted = prettier_norm(new_text, str(dst_path))
                if formatted is not None:
                    new_text = formatted
            cache[cache_key] = {"src_hash": src_hash, "text": new_text}

        if dst_path.exists() and not args.force:
            old_text = dst_path.read_text(encoding="utf-8")
            if old_text.strip() == new_text.strip():
                stats["skipped"].append(rel)
                continue
            stats["updated"].append(rel)
            action = "更新"
        elif dst_path.exists():
            stats["updated"].append(rel)
            action = "更新"
        else:
            stats["created"].append(rel)
            action = "创建"

        print(f"[{action}] {rel}")
        if not args.dry_run:
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            dst_path.write_text(new_text, encoding="utf-8")

    if not args.dry_run:
        save_cache(cache)

    print()
    print(f"创建 {len(stats['created'])} 个文件，更新 {len(stats['updated'])} 个文件，"
          f"跳过 {len(stats['skipped'])} 个文件。")

    if args.dry_run:
        print("\n[dry-run] 未写入任何文件。去掉 --dry-run 后实际执行。")
        return 0

    # 为 notes 子目录准备 index 骨架与导航
    touched_subdirs = {j[3] for j in jobs if j[3]}
    for subdir in sorted(touched_subdirs):
        ensure_subdir_index(subdir, dry_run=False)
    if touched_subdirs:
        ensure_notes_nav(dry_run=False)

    if not args.skip_index:
        print()
        refresh_index()

    # 格式化 index.md（sync_index.py 重新生成后）
    if not args.no_format:
        index_files = [DST / "clippings" / "index.md", DST / "notes" / "index.md"]
        index_files += [DST / "notes" / s / "index.md" for s in sorted(touched_subdirs)]
        existing = [f for f in index_files if f.exists()]
        if existing:
            print()
            print("  正在用 prettier 格式化 index.md ...")
            for f in existing:
                result = subprocess.run(
                    ["npx", "prettier", "--write", str(f)],
                    capture_output=True,
                    text=True,
                    cwd=ROOT,
                )
                if result.returncode != 0:
                    print(f"[warn] prettier 格式化 {f} 失败")

    print("\n同步完成。建议运行 `npm run check` 验证链接与构建完整性。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
