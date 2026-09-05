# Changelog

Library vs Playground-only changes are labeled. Latest formal release: **`v0.12.0`**.

Japanese: [changelog_ja.md](./changelog_ja.md)

### 0.12.0 — Library

- **TOC helper** — `toc` / `toc(N)` expands to a Markdown table of contents after includes / control flow / `{{ }}` (Issue #42)
- **Allowed property `.length`** — array length and string length in expressions (not a method; `length()` remains a parse error) (Issue #45)
- **`echo <expr>`** — replaces the enclosing `@hg` / `@@` block with the evaluated string; multiple / loop echoes concatenate (Issue #53)
- **Data sources wiring** — `dataSources` on `renderServer` / `build`, plus `loadDataSources`; YAML / JSON / CSV; remote URLs rejected; per-file size limit (Issues #36 / #37)
- **Docs site** — TOC, methods (`.length`), `echo`, and data-sources pages (EN/JA)
- **CI/CD** — app / docs gate split; GitHub Pages deploys from the **`doc-site`** branch

### 0.11.0 — Library / tooling

- Require **Node.js >= 24** for development and CI (`engines` in `app/package.json`)
- OpenSSF Scorecard / Code Scanning hardening (excluding fuzzing)
- Align docs-site lockfile with Node 24 / npm
- npm **`@b4moss/hyogen-md@0.11.0`** (git tag `v0.11.0`)

### 0.10.0-docs.8 — Documentation site complete

- Playground integrated at `/playground` (pane resize, theme shared with docs UI)
- English + Japanese API and syntax reference on the site
- Removed standalone `playground/`; tests live in `docs-site/test/playground/`
- README links to the docs site and `/playground`

### 0.10.0-docs.6 — Playground in docs site

- Migrated Playground into `docs-site/` (Nuxt + Vite aliases to `app/`)
- Draggable pane widths; dark / light / system theme on Playground

### 0.10.0-docs.5 — Docs site scaffold

- `docs-site/` with Nuxt Content, EN/JA routes, theme toggle
- Docs site build via `make build-docs`

### 0.10.0-docs.3 — Playground hosting

- Root deploy config for `docs-site/` (requires `app/` for Playground aliases)
- README (en/ja, root + `app/`) links to the public docs site
- Site connect steps in `docs/specs/repository.md`

### 0.10.0-docs.2 — CD / branch protection

- GitHub Actions CD on push to **`release`** (`.github/workflows/publish.yml`); skip if `name@version` already on npm
- Document npm publish secrets and branch protection (`main` / `release` / `develop`) in `docs/specs/repository.md`

### 0.10.0-docs.1 — Repository ops

- Long-lived branches **`main`** / **`release`** (from `develop` at `v0.10.0`); `develop` unchanged
- GitHub Actions CI on PRs to `dev-v*` / `hotfix/*`→`main`; docs CI on `doc-site`
- Spec: [`docs/specs/repository.md`](https://github.com/b4moss/hyogen-md/blob/main/docs/specs/repository.md) (Pages deploys from **`doc-site`**)

### 0.10.0 — Playground UX + first npm publish

Playground (not in npm package):

- Action menus (⋯) for file operations
- `@hg` / `@@` syntax highlighting (JS-approx) and light `{{ }}` marks
- Soft Diagnostics **note** for non-entry files (e.g. layouts); Preview shows source Markdown
- Filer UX (OUT read-only styling, icons); Reset re-renders full `/src` tree into `/out`
- Markdown tab highlighting via highlight.js

Library packaging:

- First publish of `@b4moss/hyogen-md@0.10.0` from `app/` (`dist` + README / LICENSE; `*.map` excluded)
- git tag `v0.10.0` matches npm version
- Docs layout: `docs/` (maintainers), `user-docs/` (changelog, etc.)

### 0.10.0-beta.3

- **Packaging:** exclude `*.map` from npm tarball; explicit Vite `minify: true`
- **Tooling:** expand Makefile (`size` / `pack` / `check` / playground targets)
- **Docs:** README badges (npm, license, node, coverage)

### 0.10.0-beta.2

- **Docs / packaging:** MIT LICENSE, bilingual README + CHANGELOG, `@b4moss/hyogen-md` package name, GitHub homepage.

### 0.10.0-beta.1

- **Docs:** npm first-publish policy (tag ↔ npm version, MIT, README sync, GitHub homepage).

### 0.9.2 — Library

- Tighten extra blank lines in expanded Markdown (`stripHgComments` / layout / include seams). Notable output change vs earlier builds.

### 0.9.1 — Playground

- Exclude `_`-prefixed files/dirs from outDir; sync OUT after SRC rename / unhide.

### 0.9.0 — Playground

- Local playground: virtual FS, filer, CodeMirror, auto-render, preview, diagnostics, demo seed, `localStorage`.

### 0.8.0 — Library

- `formatDiagnosticLog`; `each` + `component` with expression props; cross-spec tests / docs polish.

### 0.7.0 — Library

- `@@` shorthand; ternary / template literals; `for` / `do`–`while`; suspicious context warnings.

### 0.6.0 — Library

- `renderClient` and `@b4moss/hyogen-md/client` browser-oriented entry.

### 0.5.0 — Library

- `build`, `serverContext`, remote loader support.

### 0.4.0 — Library

- `extend` / `block` layout inheritance.

### 0.3.0 — Library

- Declarations and `if` / `each` control blocks; expression operators.

### 0.2.0 — Library

- Path resolution, Node loader, `component`.

### 0.1.0 — Library

- Pipeline MVP: `@hg` blocks, front matter, `{{ }}`, `include`.
