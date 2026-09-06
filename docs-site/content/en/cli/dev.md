---
title: dev
description: Writing preview server with file tree and HMR.
---

# dev

Starts a local preview server for Markdown you edit in an external editor.

```bash
npx hyogen-md dev
npx hyogen-md dev --port 5173
npx hyogen-md dev --config ./hyogen.config.ts
```

| Flag | Default | Description |
|------|---------|-------------|
| `--config` | auto-discover | Path to `hyogen.config.*` |
| `--host` | `127.0.0.1` | Listen host |
| `--port` | `4173` | Listen port |

Open the printed URL (default `http://127.0.0.1:4173`).

## Behavior

- **Browser:** file tree + rendered preview only — no in-browser source editing
- **Watch:** saves under `input` (and dependencies) trigger file-level HMR
- **Disk:** does **not** write `outDir` (use [`build`](/en/cli/build) for that)
- **Diagnostics:** warnings / errors go to the terminal
- **Loader:** local filesystem only (no remote fetch in `dev`)

This is different from the site [Playground](/playground), which uses a virtual FS and in-browser editing.

## Related

- [Config](/en/cli/config)
- [build](/en/cli/build)
- [Playground](/playground)
