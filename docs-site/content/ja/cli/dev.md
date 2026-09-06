---
title: dev
description: ファイルツリーと HMR 付きの執筆プレビューサーバ
---

# dev

外部エディタで Markdown を書きながら、ブラウザでレンダー結果を確認します。

```bash
npx hyogen-md dev
npx hyogen-md dev --port 5173
npx hyogen-md dev --config ./hyogen.config.ts
```

| フラグ | 既定 | 説明 |
|--------|------|------|
| `--config` | 自動探索 | `hyogen.config.*` のパス |
| `--host` | `127.0.0.1` | 待ち受けホスト |
| `--port` | `4173` | 待ち受けポート |

表示された URL（既定 `http://127.0.0.1:4173`）を開きます。

## 振る舞い

- **ブラウザ:** ファイルツリー + プレビューのみ（ソース編集なし）
- **ウォッチ:** `input` 配下（と依存）の保存でファイル単位 HMR
- **ディスク:** **`outDir` には書き出さない**（書き出しは [`build`](/ja/cli/build)）
- **診断:** 警告・エラーはターミナルへ
- **loader:** ローカル FS のみ（`dev` ではリモート fetch なし）

サイトの [Playground](/playground)（仮想 FS・ブラウザ編集）とは役割が異なります。

## 関連

- [設定](/ja/cli/config)
- [build](/ja/cli/build)
- [Playground](/playground)
