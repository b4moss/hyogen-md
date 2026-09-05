---
title: dataSources / loadDataSources
description: 外部 YAML / JSON / CSV を API 経由で読み、テンプレート変数へバインドする
---

# dataSources / loadDataSources

外部データファイル（**YAML / JSON / CSV**）を **公開 API 経由のみ**で読み、テンプレート変数へバインドします。DSL の `import` / `require` では読めません。

対象バージョン: **0.11.0**

```ts
import { renderServer, loadDataSources, build } from '@b4moss/hyogen-md'
```

## オプション `dataSources`

`renderServer` / `build` の options に、**変数名 → ファイルパス** のマップを渡します。

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

テンプレート側ではマップのキーが変数名になります。

```md
# {{ site.title }}

{{#each products.items}}
- {{ this.name }}
{{/each}}
```

| 項目 | 内容 |
|------|------|
| パス | `options.root`（省略時は `.doc_root` 探索結果または cwd）からの相対パス |
| キー名 | **制約なし**（任意の文字列） |
| ファイル上限 | **5MB / ファイル**（超過は `data_source_too_large`） |
| リモート URL | **非対応**（`http://` / `https://` は `load_failed`） |
| クライアント | `renderClient` に渡すと `data_sources_on_client`（空オブジェクト `{}` は未指定と同義） |

## 関数 `loadDataSources`

先に読み込んで、手動で context に合成することもできます。

```ts
const fromFiles = await loadDataSources(
  { site: './data/site.yaml' },
  { root: './site' },
)

await renderServer('./page.md', { ...fromFiles, extra: 1 })
```

- `@b4moss/hyogen-md`（サーバ向け）のみ export
- `@b4moss/hyogen-md/client` には **含まれません**
- `dataSources` オプションと同じパース・上限・リモート拒否規則

## context へのマージ順

`renderServer` / `build` では次の順で浅いマージ（後勝ち）です。

1. `loadDataSources(dataSources)` の結果
2. 呼び出し側 `context`
3. `serverContext`

front matter はレンダリング内でさらに後から適用されます。

## 対応形式

| 拡張子 | 結果 |
|--------|------|
| `.json` | `JSON.parse` の結果（オブジェクト / 配列 / プリミティブ） |
| `.yaml` / `.yml` | `yaml` パッケージのパース結果 |
| `.csv` | ヘッダー行あり → オブジェクト配列（フィールドはすべて文字列） |

### YAML

- 型（日付・数値・真偽・`null` 等）はライブラリ既定のまま
- alias / anchor は許可
- 重複キーはパーサ既定（後勝ち）
- 不正 YAML → `parse_error`

### CSV（厳格）

- RFC 4180 簡易（カンマ区切り、ダブルクォート、`\r\n` / `\n`）
- 空行はスキップ
- 列数不一致 → `parse_error`
- **BOM 非対応**（除去しない）
- TSV・他区切りは非対応

### 共通エラー

| 状況 | code |
|------|------|
| 空ファイル | `parse_error` |
| 未対応拡張子 | `parse_error`（`details.format`） |
| ファイル欠落 | `file_not_found` |
| リモート URL | `load_failed` |
| 5MB 超 | `data_source_too_large` |

## build での扱い

`dataSources` は **エントリループの前に 1 回**読み込み、全エントリで同一のマージ済み context を使います。

```ts
await build({
  input: './pages/**/*.md',
  outDir: './out',
  dataSources: { config: './data/config.yaml' },
})
```

## 関連

- [renderServer](/ja/api/render-server)
- [build](/ja/api/build)
- [型とオプション](/ja/api/types-and-options)
- [エラーコード](/ja/api/error-codes)
