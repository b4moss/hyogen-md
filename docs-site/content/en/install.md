---
title: Install
description: Install @b4moss/hyogen-md and render your first template.
---

# Install

```bash
npm install @b4moss/hyogen-md
```

Requires **Node.js >= 24**.

The package ships these entry points:

| Entry | Use case |
|-------|----------|
| `@b4moss/hyogen-md` | Node — SSR, SSG, loaders, `build` |
| `@b4moss/hyogen-md/client` | Browser — `renderClient` |
| `@b4moss/hyogen-md/config` | CLI config — `defineConfig` |
| `hyogen-md` (bin) | CLI — `create` / `dev` / `build` |

## Quick start (CLI)

```bash
npx hyogen-md create my-site
cd my-site
npm install
npm run dev    # http://127.0.0.1:4173
npm run build  # write Markdown to ./out
```

See the [CLI guide](/en/cli) for `hyogen.config`, flags, and `dev` vs Playground.

## Quick start (server)

Use `renderServer` on Node (SSR or SSG). A default file-system loader is used when you omit `options.loader`.

```ts
import { renderServer } from '@b4moss/hyogen-md'

const { markdown, warnings } = await renderServer(
  '# Hello {{ name }}',
  { name: 'world' },
)

console.log(markdown)
// # Hello world
```

Render a file by path:

```ts
const result = await renderServer({ path: './pages/index.md' }, {
  title: 'My site',
})
```

Pass secrets only through `serverContext` — they are merged into the render context on the server but must never be sent to the client bundle:

```ts
await renderServer('./page.md', { title: 'Public' }, {
  serverContext: { apiKey: process.env.API_KEY },
})
```

## Quick start (client)

Use `renderClient` in the browser. You **must** provide a `loader` that returns source text for each path. The library does not fetch files on its own in the browser.

```ts
import { renderClient } from '@b4moss/hyogen-md/client'

const files: Record<string, string> = {
  'index.md': '# Hello {{ name }}',
}

const loader = async (path: string) => {
  const source = files[path]
  if (!source) throw new Error(`missing: ${path}`)
  return source
}

const { markdown } = await renderClient(
  { path: 'index.md' },
  { name: 'world' },
  { loader },
)
```

## Next steps

- [CLI](/en/cli) — create / config / dev / build
- [API reference](/en/api) — `renderServer`, `renderClient`, `build`, loaders, diagnostics
- [Template syntax](/en/syntax) — `{{ }}`, `@hg` blocks, includes, components
- [Playground](/playground) — try templates in the browser
