---
title: CLI
description: hyogen-md によるスキャフォールド・設定・プレビュー・ビルド
---

# CLI

`@b4moss/hyogen-md` は執筆用の **`hyogen-md`** バイナリを同梱します。

| コマンド | 用途 |
|----------|------|
| [`create`](/ja/cli/create) | 最小プロジェクトの生成 |
| [`config`](/ja/cli/config) | `hyogen.config.(js|ts)` と `defineConfig` |
| [`dev`](/ja/cli/dev) | 執筆プレビュー（ファイルツリー + HMR） |
| [`build`](/ja/cli/build) | レンダー結果を `outDir` へ書き出し |

```bash
npx hyogen-md create my-site
cd my-site
npm install
npm run dev
npm run build
```

ライブラリ API（`renderServer` / `renderClient` / `build` など）はそのまま使えます。CLI は設定ファイル経由でそれらを駆動します。

## 関連

- [インストール](/ja/install)
- [API `build`](/ja/api/build)
- [Playground](/playground) — 仮想 FS のブラウザ編集（`dev` とは別物）
