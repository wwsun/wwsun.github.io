---
title: npm-check
tags:
  - nodejs
  - npm
draft: false
description: npm-check
source: https://github.com/dylang/npm-check
---
## 交互式升级

`npm-check -u`

## 使用指南

```
Usage
  $ npm-check <path> <options>

Path
  Where to check. Defaults to current directory. Use -g for checking global modules.

Options
  -u, --update          Interactive update.
  -y, --update-all      Uninteractive update. Apply all updates without prompting.
  -g, --global          Look at global modules.
  -s, --skip-unused     Skip check for unused packages.
  -p, --production      Skip devDependencies.
  -d, --dev-only        Look at devDependencies only (skip dependencies).
  -i, --ignore          Ignore dependencies based on succeeding glob.
  -E, --save-exact      Save exact version (x.y.z) instead of caret (^x.y.z) in package.json.
  --specials            List of depcheck specials to include in check for unused dependencies.
  --no-color            Force or disable color output.
  --no-emoji            Remove emoji support. No emoji in default in CI environments.
  --debug               Show debug output. Throw in a gist when creating issues on github.

Examples
  $ npm-check           # See what can be updated, what isn't being used.
  $ npm-check ../foo    # Check another path.
  $ npm-check -gu       # Update globally installed modules by picking which ones to upgrade.
```

