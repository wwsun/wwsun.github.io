---
title: release-it
date: 2026-02-02 17:12:18
tags:
  - npm
draft: false
description: Automate versioning and package publishing
source: https://github.com/release-it/release-it
---
```bash
npm init release-it
```

## config

`.release-it.json`

```json
{
  "git": {
    "commitMessage": "chore: release v${version}",
    "tagName": "v${version}",
    "requireCleanWorkingDir": true
  },
  "npm": {
    "publish": true
  },
  "github": {
    "release": false
  },
  "gitlab": {
    "release": false
  },
  "plugins": {
    "@release-it/conventional-changelog": {
      "preset": "angular",
      "infile": "CHANGELOG.md"
    }
  }
}

```

https://github.com/release-it/release-it/blob/main/docs/configuration.md

