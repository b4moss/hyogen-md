---
title: hyogen.config
description: Project config with defineConfig from @b4moss/hyogen-md/config.
---

# hyogen.config

Declare how `dev` and `build` run. Use Vite-style **`defineConfig`**:

```js
import { defineConfig } from "@b4moss/hyogen-md/config";

export default defineConfig({
  input: "./src/**/*.md",
  // outDir: "./out",
});
```

## Discovery

Looking upward from the working directory (first match wins):

1. `hyogen.config.ts`
2. `hyogen.config.mjs`
3. `hyogen.config.js`
4. `hyogen.config.cjs`

Override with `--config <file>` on `dev` / `build`.

## Options

| Key | Required | Default | Meaning |
|-----|----------|---------|---------|
| `input` | **yes** | — | Entry path(s) or glob(s) |
| `outDir` | no | `./out` | Output for **`build`** only (`dev` does not write) |
| `context` | no | — | Shared template context |
| `serverContext` | no | — | Server-only context |
| `dataSources` | no | — | YAML / JSON / CSV map ([dataSources](/en/api/data-sources)) |
| `root` | no | — | Project root |
| `includeUnderscoreEntries` | no | — | Include `_` entries |
| `preserveFrontMatter` | no | — | Keep front matter in output |
| `preserveHgComments` | no | — | Keep `@hg` comments in output |

Paths in the config are resolved relative to the config file directory.

## Related

- [create](/en/cli/create)
- [dev](/en/cli/dev)
- [build](/en/cli/build)
- [API build](/en/api/build)
