---
title: create
description: Scaffold a minimal hyogen.md project with hyogen-md create.
---

# create

Generates a minimal project you can open with `dev` / `build`.

```bash
npx hyogen-md create [dir]
npx hyogen-md create my-site --language ts
```

| Flag | Default | Description |
|------|---------|-------------|
| `[dir]` | current directory | Target folder (must be empty or missing) |
| `--language` | `js` | Config language: `js` or `ts` |

## Generated files

| Path | Content |
|------|---------|
| `package.json` | `dev` / `build` scripts; depends on `@b4moss/hyogen-md` |
| `hyogen.config.js` or `.ts` | `defineConfig({ input: "./src/**/*.md" })` |
| `src/index.md` | Sample entry Markdown |
| `.gitignore` | `node_modules/`, `out/`, … |

After create:

```bash
cd my-site
npm install
npm run dev
```

## Related

- [Config](/en/cli/config)
- [dev](/en/cli/dev)
- [build](/en/cli/build)
