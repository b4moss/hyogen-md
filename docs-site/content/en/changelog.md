---
title: Changelog
description: Library release history and the docs-site version track.
---

# Changelog

## Where to find release notes

The canonical changelog for the **library** lives on GitHub:

- [user-docs/changelog.md](https://github.com/b4moss/hyogen-md/blob/main/user-docs/changelog.md) (English)
- [user-docs/changelog_ja.md](https://github.com/b4moss/hyogen-md/blob/main/user-docs/changelog_ja.md) (Japanese)

That file covers npm releases and notable Playground / docs-site changes.

## Docs-site version track

This documentation site uses a separate **docs track** that does not bump the library SemVer:

| Track | Example | What changes |
|-------|---------|--------------|
| Library | `0.13.0` | `@b4moss/hyogen-md` on npm |
| Docs site | `0.10.0-docs.8` | Nuxt site, Playground integration, content pages |

Docs milestones (`docs.5` … `docs.8`) are recorded in the GitHub changelog under tags like `0.10.0-docs.5`. Library features after that (including **0.11.0**–**0.13.0**) ship on the same site when content is updated.

## Current library version

**@b4moss/hyogen-md@0.13.0** — the API, CLI, and syntax documented here match this release.
