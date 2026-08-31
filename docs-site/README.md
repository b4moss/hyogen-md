# Documentation site (v0.10.0-docs.8+)

Nuxt Content site for **@b4moss/hyogen-md**, based on the [b4moss/git-template `doc-site`](https://github.com/b4moss/git-template/tree/doc-site) shell. Spec: [`dev-docs/docs-site.md`](../dev-docs/docs-site.md).

Production: **https://hyogenmd.oss.b4m.jp** (GitHub Pages).

## Commands

```bash
npm install
make dev-docs      # http://localhost:3000
make build-docs    # static output → .output/public
make test-pg       # Playground vitest
```

## Structure

- `app/` — Nuxt 4 app (shell UI, layouts, pages, playground)
- `content/en/`, `content/ja/` — locale-split markdown (Content 3 collections)
- `i18n/locales/` — sidebar / chrome copy
- `public/CNAME` — `hyogenmd.oss.b4m.jp`
- Routes: `/ja/…`, `/en/…`, `/playground` (unprefixed), `/` → locale redirect
