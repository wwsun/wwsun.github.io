---
title: projj
tags:
  - git
  - repository
description: Manage git repositories with directory conventions.
source: https://github.com/popomore/projj
---

## quick start

```bash
projj init                              # one-time setup
projj add popomore/projj               # clone → ~/projj/github.com/popomore/projj
projj add git@gitlab.com:team/app.git   # clone → ~/projj/gitlab.com/team/app
p projj                                 # jump to repo instantly (shell function)
projj run status --all                  # batch operations across all repos
```

## hooks

`git_config_user`

```js
#!/usr/bin/env node

"use strict"

const fs = require("fs")
const path = require("path")

const cwd = process.cwd()
const gitConfig = path.join(cwd, ".git/config")

if (!fs.existsSync(gitConfig)) {
  return
}

if (cwd.indexOf("g.hz.netease.com") > -1) {
  fs.appendFileSync(
    gitConfig,
    "[user]\n  name = sunweiwei\n  email = sunweiwei01@corp.netease.com\n",
  )
}

if (cwd.indexOf("github.com") > -1) {
  fs.appendFileSync(gitConfig, "[user]\n  name = wwsun\n  email = ww.sun@outlook.com\n")
}
```

## alternatives

- https://github.com/x-motemen/ghq
- https://github.com/siketyan/ghr
