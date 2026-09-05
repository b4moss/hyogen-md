---
title: build (CLI)
description: Write rendered Markdown to outDir using hyogen.config.
---

# build (CLI)

Loads `hyogen.config.*` and calls the library [`build`](/en/api/build) API.

```bash
npx hyogen-md build
npx hyogen-md build --outDir ./dist
npx hyogen-md build --config ./hyogen.config.ts
```

| Flag | Default | Description |
|------|---------|-------------|
| `--config` | auto-discover | Path to `hyogen.config.*` |
| `--outDir` | from config (`./out`) | Override output directory |

Writes rendered Markdown files to `outDir`. Warnings are printed to stderr via `formatDiagnosticLog`.

For programmatic batch SSG without the CLI, import `build` from `@b4moss/hyogen-md` directly.

## Related

- [Config](/en/cli/config)
- [dev](/en/cli/dev)
- [API build](/en/api/build)
