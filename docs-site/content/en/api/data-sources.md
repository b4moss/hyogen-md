---
title: dataSources / loadDataSources
description: Load external YAML / JSON / CSV via the public API and bind them as template variables
---

# dataSources / loadDataSources

Load external data files (**YAML / JSON / CSV**) **only through the public API** and bind them as template variables. DSL `import` / `require` cannot read files.

Version: **0.11.0**

```ts
import { renderServer, loadDataSources, build } from '@b4moss/hyogen-md'
```

## Option `dataSources`

Pass a **variable name → file path** map in `renderServer` / `build` options.

```ts
const result = await renderServer('./page.md', {}, {
  root: './site',
  dataSources: {
    site: './data/site.yaml',
    products: './data/products.json',
    rows: './data/rows.csv',
  },
})
```

Map keys become template variable names:

```md
# {{ site.title }}

{{#each products.items}}
- {{ this.name }}
{{/each}}
```

| Item | Rule |
|------|------|
| Paths | Relative to `options.root` (or `.doc_root` / cwd when omitted) |
| Keys | **No constraints** (any string) |
| Size limit | **5MB per file** (`data_source_too_large` when exceeded) |
| Remote URLs | **Unsupported** (`http://` / `https://` → `load_failed`) |
| Client | Passing to `renderClient` throws `data_sources_on_client` (empty `{}` is treated as omitted) |

## Function `loadDataSources`

You can load files first and merge into `context` yourself.

```ts
const fromFiles = await loadDataSources(
  { site: './data/site.yaml' },
  { root: './site' },
)

await renderServer('./page.md', { ...fromFiles, extra: 1 })
```

- Exported only from `@b4moss/hyogen-md` (server package)
- **Not** exported from `@b4moss/hyogen-md/client`
- Same parse rules, size limit, and remote rejection as the `dataSources` option

## Context merge order

For `renderServer` / `build`, shallow-merge in this order (later wins):

1. Result of `loadDataSources(dataSources)`
2. Caller `context`
3. `serverContext`

Front matter is applied even later inside rendering.

## Formats

| Extension | Value bound to the variable |
|-----------|-----------------------------|
| `.json` | `JSON.parse` result (object / array / primitive) |
| `.yaml` / `.yml` | Result from the `yaml` package |
| `.csv` | Header row required → array of objects (all fields are strings) |

### YAML

- Types (dates, numbers, booleans, `null`, …) follow the library defaults
- Alias / anchor are allowed
- Duplicate keys follow the parser default (later wins)
- Invalid YAML → `parse_error`

### CSV (strict)

- RFC 4180 subset (comma, double quotes, `\r\n` / `\n`)
- Blank rows are skipped
- Column-count mismatch → `parse_error`
- **No BOM stripping**
- TSV / other delimiters are unsupported

### Common errors

| Situation | Code |
|-----------|------|
| Empty file | `parse_error` |
| Unsupported extension | `parse_error` (`details.format`) |
| Missing file | `file_not_found` |
| Remote URL | `load_failed` |
| Over 5MB | `data_source_too_large` |

## Behavior in `build`

`dataSources` is loaded **once before the entry loop** and shared across all entries.

```ts
await build({
  input: './pages/**/*.md',
  outDir: './out',
  dataSources: { config: './data/config.yaml' },
})
```

## See also

- [renderServer](/en/api/render-server)
- [build](/en/api/build)
- [Types and options](/en/api/types-and-options)
- [Error codes](/en/api/error-codes)
