---
created: 2026-01-29 14:58
url:
tags:
---
## Github RSS

GitHub provides some official RSS feeds:

- Repo releases: `https://github.com/:owner/:repo/releases.atom`
- Repo commits: `https://github.com/:owner/:repo/commits.atom`
- User activities: `https://github.com/:user.atom`
- Wiki history: `https://github.com/:owner/:repo/wiki.atom`
- Private feed: `https://github.com/:user.private.atom?token=:secret`

>[!note] You can ONLY obtain this url via an [API](https://docs.github.com/en/rest/activity/feeds?apiVersion=2022-11-28) call with a [Personal Access Token](https://github.com/settings/tokens/new) with **ENOUGH** scopes now.

