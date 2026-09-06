---
title: API Reference
description: Public API for @b4moss/hyogen-md — rendering, build, loaders, and diagnostics.
---

# API Reference

Public APIs for **@b4moss/hyogen-md**. Data-source APIs are available since **0.12.0**. CLI / `defineConfig` since **0.13.0**.

## Rendering

| Function | Package | Description |
|----------|---------|-------------|
| [`renderServer`](/en/api/render-server) | `@b4moss/hyogen-md` | Server-side render (SSR / SSG). Accepts `serverContext`. |
| [`renderClient`](/en/api/render-client) | `@b4moss/hyogen-md/client` | Client-side render (CSR). Requires a custom `loader`. |
| [`build`](/en/api/build) | `@b4moss/hyogen-md` | Batch SSG — glob input, walk dependencies, write `outDir`. |

## Config (CLI)

| Export | Package | Description |
|--------|---------|-------------|
| `defineConfig` | `@b4moss/hyogen-md/config` | Typed helper for `hyogen.config.(js|ts)` — see [CLI config](/en/cli/config) |

## Data sources

| Export | Description |
|--------|-------------|
| [`dataSources` / `loadDataSources`](/en/api/data-sources) | Load YAML / JSON / CSV and bind them as template variables |

## Loaders

| Export | Package | Description |
|--------|---------|-------------|
| [`createNodeLoader`](/en/api/loader) | `@b4moss/hyogen-md` | Default Node loader — local FS + remote `https://` fetch. |
| [`createFsLoader`](/en/api/loader) | `@b4moss/hyogen-md` | File-system loader only (no remote fetch). |
| `isRemotePath` | `@b4moss/hyogen-md` | Utility — returns `true` for `http://` / `https://` paths. |

## Diagnostics

| Export | Package | Description |
|--------|---------|-------------|
| [`formatDiagnosticLog`](/en/api/diagnostics) | both | Format a warning or error as multi-line log text. |
| `formatMessage` | both | Resolve a diagnostic code to an English message. |
| `createHyogenError` | both | Construct a `HyogenError` with a known code. |

## Types and options

- [Types and options](/en/api/types-and-options) — `HyogenContext`, `RenderOptions`, `BuildOptions`, `RenderResult`
- [Error and warning codes](/en/api/error-codes) — full table of diagnostic codes

## Import map

```ts
// Node (full surface)
import {
  renderServer,
  renderClient,
  build,
  loadDataSources,
  createNodeLoader,
  createFsLoader,
  formatDiagnosticLog,
} from '@b4moss/hyogen-md'

// Config (CLI)
import { defineConfig } from '@b4moss/hyogen-md/config'

// Browser (client-safe subset)
import { renderClient, formatDiagnosticLog } from '@b4moss/hyogen-md/client'
```
