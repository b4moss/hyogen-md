---
title: hyogen-md
description: Documentation for @b4moss/hyogen-md — a Markdown templating library.
---

# hyogen-md

Official documentation for **@b4moss/hyogen-md** — a Markdown-first templating engine.

Write templates in extended Markdown (hyogen.md): YAML front matter, `{{ }}` expressions, and logic in HTML-comment blocks. Render on the server (SSR / SSG) or in the browser (CSR).

## Sections

### [Install](/en/install)

Install the package and run your first CLI, `renderServer`, or `renderClient` example.

### [CLI](/en/cli)

- [`create`](/en/cli/create) — scaffold a project
- [`hyogen.config`](/en/cli/config) — `defineConfig`
- [`dev`](/en/cli/dev) — writing preview + HMR
- [`build`](/en/cli/build) — write Markdown to `outDir`

### [API reference](/en/api)

- [`renderServer`](/en/api/render-server) — server-side rendering
- [`renderClient`](/en/api/render-client) — client-side rendering
- [`build`](/en/api/build) — batch SSG
- [Loader](/en/api/loader), [Diagnostics](/en/api/diagnostics), [Types](/en/api/types-and-options), [Error codes](/en/api/error-codes)

### [Template syntax](/en/syntax)

- [Front matter](/en/syntax/front-matter), [Expressions](/en/syntax/expressions), [Hyogen blocks](/en/syntax/hg-blocks)
- [Includes & components](/en/syntax/includes), [Control flow](/en/syntax/control-flow), [TOC helper](/en/syntax/toc)
- [Paths & security](/en/syntax/paths-and-security)

### [Playground](/playground)

Interactive editor with virtual file system, live preview, and diagnostics.

### [Changelog](/en/changelog)

Release history and how the docs-site version track relates to the npm package.

## Links

- [npm: @b4moss/hyogen-md](https://www.npmjs.com/package/@b4moss/hyogen-md)
- [GitHub](https://github.com/b4m-oss/hyogen-md)
