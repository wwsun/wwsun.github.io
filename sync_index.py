import os
import re

def get_frontmatter(content):
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        return match.group(1)
    return ""

def get_title(content, filename):
    fm = get_frontmatter(content)
    title_match = re.search(r'^title:\s*(.+)$', fm, re.MULTILINE)
    if title_match:
        return title_match.group(1).strip().strip('"').strip("'")

    match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return os.path.splitext(filename)[0]

def get_description(content, frontmatter):
    desc_match = re.search(r'description:\s*>?-?\n?\s*(.*?)(?=\n[a-z]+:|\Z)', frontmatter, re.DOTALL)
    if desc_match:
        desc = desc_match.group(1).strip()
        desc = re.sub(r'\s+', ' ', desc) # flatten newlines
        desc = desc.strip('"').strip("'")
        if len(desc) > 0 and desc != '>-' and desc != '>':
            # It already has a description, just use it, don't truncate
            return desc

    lines = content.split('\n')
    text_lines = []
    in_frontmatter = False
    for line in lines[:60]:
        if line == '---' and not in_frontmatter:
            in_frontmatter = True
            continue
        if line == '---' and in_frontmatter:
            in_frontmatter = False
            continue
        if in_frontmatter:
            continue
        if line.startswith('#') or line.startswith('>') or line.startswith('!') or line.startswith('[') or line.startswith('```'):
            continue
        clean_line = re.sub(r'[#*`]', '', line)
        clean_line = re.sub(r'\[\[.*?\|(.*?)\]\]', r'\1', clean_line)
        clean_line = re.sub(r'\[\[(.*?)\]\]', r'\1', clean_line)
        clean_line = re.sub(r'!\[.*?\]\(.*?\)', '', clean_line)
        clean_line = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', clean_line)
        clean_line = clean_line.strip()
        if clean_line:
            text_lines.append(clean_line)

    desc = "".join(text_lines)
    if len(desc) > 30:
        return desc[:30] + "..."
    if desc == "":
        return "暂无简介"
    return desc

def update_index(directory):
    index_path = os.path.join(directory, "index.md")

    if not os.path.exists(index_path):
        return

    print(f"Updating {index_path}")

    with open(index_path, 'r', encoding='utf-8') as f:
        index_content = f.read()

    # Extract existing links
    existing_links = {}

    # In index files the format is usually: - [[filename|display]] — desc
    lines = index_content.split('\n')

    for line in lines:
        if line.startswith('- [['):
            match = re.match(r'^-\s+\[\[(.*?)\]\](?:\s+—\s+(.*))?', line)
            if match:
                inner = match.group(1)
                if '|' in inner:
                    filename = inner.split('|')[0].strip()
                else:
                    filename = inner.strip()
                # store the whole line as is, so we preserve exactly the link format and text
                existing_links[filename] = line

    # find where links list starts
    parts = index_content.split('\n- [[')
    if len(parts) > 1:
        header = parts[0]
    else:
        # handle case where list starts exactly at top or there is no list
        if index_content.startswith('- [['):
            header = ""
        else:
            header = index_content.rstrip()

    new_files_list = []

    # add existing
    for key, val in existing_links.items():
        new_files_list.append(val)

    # discover new
    for f in os.listdir(directory):
        if f.endswith('.md') and f != 'index.md' and not f.endswith('.template.md') and not f.endswith('.base'):
            basename = os.path.splitext(f)[0]

            if basename not in existing_links:
                filepath = os.path.join(directory, f)
                with open(filepath, 'r', encoding='utf-8') as mf:
                    content = mf.read()

                fm = get_frontmatter(content)
                title = get_title(content, f)
                desc = get_description(content, fm)

                display = f"[[{basename}|{title}]]" if basename != title else f"[[{basename}]]"
                new_files_list.append(f"- {display} — {desc}")


    # Sort files_list ignoring case to ensure consistent ordering
    def get_sort_key(line):
        m = re.match(r'^-\s+\[\[(.*?)\]\]', line)
        if m:
            inner = m.group(1)
            if '|' in inner:
                return inner.split('|')[1].strip().lower()
            return inner.strip().lower()
        return line.lower()

    new_files_list.sort(key=get_sort_key)

    if header:
        new_index_content = header.rstrip() + "\n\n" + "\n".join([item for item in new_files_list if item.strip()]) + "\n"
    else:
        new_index_content = "\n".join([item for item in new_files_list if item.strip()]) + "\n"

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(new_index_content)

    print(f"Done for {directory}")

for root, dirs, files in os.walk('content'):
    if 'index.md' in files:
        if 'assets' not in root:
            update_index(root)
