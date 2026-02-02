---
created: 2025-12-11 16:21
url: https://help.obsidian.md/obsidian-flavored-markdown
tags:
  - markdown
  - obsidian
---
## Basic Format

|Syntax|Description|
|---|---|
|`[[Link]]`|[Internal links](https://help.obsidian.md/links)|
|`![[Link]]`|[Embed files](https://help.obsidian.md/embeds)|
|`![[Link#^id]]`|[Block references](https://help.obsidian.md/links#Link%20to%20a%20block%20in%20a%20note)|
|`^id`|[Defining a block](https://help.obsidian.md/links#Link%20to%20a%20block%20in%20a%20note)|
|`[^id]`|[Footnotes](https://help.obsidian.md/syntax#Footnotes)|
|`%%Text%%`|[Comments](https://help.obsidian.md/syntax#Comments)|
|`~~Text~~`|[Strikethroughs](https://help.obsidian.md/syntax#Bold,%20italics,%20highlights)|
|`==Text==`|[Highlights](https://help.obsidian.md/syntax#Bold,%20italics,%20highlights)|
|` ``` `|[Code blocks](https://help.obsidian.md/syntax#Code%20blocks)|
|`- [ ]`|[Incomplete task](https://help.obsidian.md/syntax#Task%20lists)|
|`- [x]`|[Completed task](https://help.obsidian.md/syntax#Task%20lists)|
|`> [!note]`|[Callouts](https://help.obsidian.md/callouts)|
|(see link)|[Tables](https://help.obsidian.md/advanced-syntax#Tables)|

## Callouts

> [!note] Title-only callout

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!faq]- Are callouts foldable?
> Yes! In a foldable callout, the contents are hidden when the callout is collapsed.

You can make a callout foldable by adding a plus (`+`) or a minus (`-`) directly after the type identifier.

```markdown
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```


## Footnotes

```markdown
This is a simple footnote[^1].

[^1]: This is the referenced text.
[^2]: Add 2 spaces at the start of each new line.
  This lets you write footnotes that span multiple lines.
[^note]: Named footnotes still appear as numbers, but can make it easier to identify and link references.
```

This is a simple footnote[^1].

[^1]: This is the referenced text.
[^2]: Add 2 spaces at the start of each new line.
  This lets you write footnotes that span multiple lines.
[^note]: Named footnotes still appear as numbers, but can make it easier to identify and link references.