---
title: build（CLI）
description: hyogen.config に従いレンダー結果を outDir へ書き出す
---

# build（CLI）

`hyogen.config.*` を読み、ライブラリの [`build`](/ja/api/build) API を呼び出します。

```bash
npx hyogen-md build
npx hyogen-md build --outDir ./dist
npx hyogen-md build --config ./hyogen.config.ts
```

| フラグ | 既定 | 説明 |
|--------|------|------|
| `--config` | 自動探索 | `hyogen.config.*` のパス |
| `--outDir` | 設定値（`./out`） | 出力ディレクトリの上書き |

レンダー済み Markdown を `outDir` へ書き出します。警告は `formatDiagnosticLog` 経由で stderr に出ます。

CLI を使わずプログラムから一括 SSG する場合は、`@b4moss/hyogen-md` から `build` を直接 import してください。

## 関連

- [設定](/ja/cli/config)
- [dev](/ja/cli/dev)
- [API build](/ja/api/build)
