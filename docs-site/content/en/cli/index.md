---
title: CLI
description: Scaffold, configure, preview, and build with hyogen-md.
---

# CLI

`@b4moss/hyogen-md` ships a **`hyogen-md`** binary for local writing workflows.

| Command | Purpose |
|---------|---------|
| [`create`](/en/cli/create) | Scaffold a minimal project |
| [`config`](/en/cli/config) | `hyogen.config.(js|ts)` + `defineConfig` |
| [`dev`](/en/cli/dev) | Writing preview (file tree + HMR) |
| [`build`](/en/cli/build) | Write rendered Markdown to `outDir` |

```bash
npx hyogen-md create my-site
cd my-site
npm install
npm run dev
npm run build
```

Library APIs (`renderServer`, `renderClient`, `build`, …) stay available for programmatic use. The CLI drives them through a config file.

## Related

- [Install](/en/install)
- [API `build`](/en/api/build)
- [Playground](/playground) — browser editor with a virtual FS (different from `dev`)
