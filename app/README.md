# hyogen.md (`@b4moss/hyogen-md`)

![masthead](https://raw.githubusercontent.com/b4m-oss/hyogen-md/develop/user-docs/hyogen-md-masthead.png)

[![CI](https://github.com/b4moss/hyogen-md/actions/workflows/ci.yml/badge.svg)](https://github.com/b4moss/hyogen-md/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/b4moss/hyogen-md)](https://codecov.io/gh/b4moss/hyogen-md)
[![npm](https://img.shields.io/npm/v/@b4moss/hyogen-md)](https://www.npmjs.com/package/@b4moss/hyogen-md)
[![Release](https://img.shields.io/github/v/release/b4moss/hyogen-md)](https://github.com/b4moss/hyogen-md/releases)
[![License](https://img.shields.io/github/license/b4moss/hyogen-md)](https://github.com/b4moss/hyogen-md/blob/main/LICENSE)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/b4moss/hyogen-md/badge)](https://scorecard.dev/viewer/?uri=github.com/b4moss/hyogen-md)

Extended Markdown template engine for TypeScript / JavaScript.

Control flow and templating live in HTML comments (`@hg` … `@endhg` or `@@` … `@@`), so source files stay preview-friendly. The library outputs **Markdown only** (HTML is left to the consumer).

- **Package name:** `@b4moss/hyogen-md`
- **Product name:** hyogen.md（表現.md）
- **License:** MIT
- **Japanese README:** [README_ja.md](./README_ja.md)
- **Changelog:** [user-docs/changelog.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog.md)
- **Documentation:** [https://hyogenmd.oss.b4m.jp](https://hyogenmd.oss.b4m.jp) (Nuxt Content; not in npm)
- **Playground:** [https://hyogenmd.oss.b4m.jp/playground](https://hyogenmd.oss.b4m.jp/playground) (same site; not in npm)
- **Specs (Japanese, maintainers):** [docs/](https://github.com/b4m-oss/hyogen-md/tree/develop/docs)

> **Homepage:** [https://github.com/b4m-oss/hyogen-md](https://github.com/b4m-oss/hyogen-md)

This file is kept **in sync** at the repository root and at `app/README.md` (npm package root).

---

## Install

```bash
npm install @b4moss/hyogen-md
```

Requires **Node.js >= 24**.

---

## Quick start

### Client / CSR (`@b4moss/hyogen-md/client`)

```ts
import { renderClient } from "@b4moss/hyogen-md/client";

const result = await renderClient(
  { path: "/src/index.md" },
  { siteName: "Demo" },
  {
    loader: async (path) => {
      // resolve path → file contents (virtual FS, fetch, etc.)
      return await readSomewhere(path);
    },
  },
);

console.log(result.markdown);
console.log(result.warnings);
```

### Server / SSR (`@b4moss/hyogen-md`)

```ts
import { renderServer, createNodeLoader } from "@b4moss/hyogen-md";

const result = await renderServer(
  { path: "./pages/index.md" },
  { title: "Hello" },
  {
    loader: createNodeLoader(),
    // serverContext: { apiKey: "…" }, // server-only; not available on renderClient
  },
);
```

### SSG batch (`build`)

```ts
import { build } from "@b4moss/hyogen-md";

const { files, warnings } = await build({
  input: "./src/**/*.md",
  outDir: "./out",
  context: { siteName: "Demo" },
});
```

API details: [docs/specs/api.md](https://github.com/b4m-oss/hyogen-md/blob/develop/docs/specs/api.md).

---

## Repository layout

| Path | Role |
|------|------|
| `app/` | Library published to npm (`files`: `dist`, plus README / LICENSE) |
| `docs-site/` | Documentation site + Playground on [GitHub Pages](https://hyogenmd.oss.b4m.jp) (**not** in npm) |
| `user-docs/` | User-facing docs (e.g. [changelog](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog.md)) |
| `docs/` | Specs and roadmap (**Japanese**, maintainers) |

### Documentation & Playground

**Site:** **[https://hyogenmd.oss.b4m.jp](https://hyogenmd.oss.b4m.jp)** (GitHub Pages; `/ja`, `/en`, `/playground`).  
**Playground:** **[https://hyogenmd.oss.b4m.jp/playground](https://hyogenmd.oss.b4m.jp/playground)**

Local:

```bash
make install-docs
make dev-docs
```

Open `http://localhost:3000` (docs) and `/playground`. Uses `../app` via Vite alias. Virtual FS + `localStorage` only.

---

## Status

This is **0.x**. APIs and output may change until `1.0.0`.  
Published: **`@b4moss/hyogen-md@0.10.0`** (git tag `v0.10.0`).

Playground UX is part of the **v0.10.0** product milestone but is **not** included in the npm tarball.

The coverage badge reflects approximate **statement coverage for `app/`** (library) from Vitest (~84%). Initial release goal is ≥50%. Coverage is uploaded to Codecov from `.github/workflows/quality.yml` on pushes to `main`.

---

## Changelog

See **[user-docs/changelog.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog.md)** (Japanese: [changelog_ja.md](https://github.com/b4m-oss/hyogen-md/blob/develop/user-docs/changelog_ja.md)).

---

## License

[MIT](./LICENSE) © Kohki SHIKATA
