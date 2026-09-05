---
title: hyogen.config
description: @b4moss/hyogen-md/config の defineConfig によるプロジェクト設定
---

# hyogen.config

`dev` / `build` の実行設定を宣言します。Vite 風の **`defineConfig`** を使います。

```js
import { defineConfig } from "@b4moss/hyogen-md/config";

export default defineConfig({
  input: "./src/**/*.md",
  // outDir: "./out",
});
```

## 探索順

作業ディレクトリから次の順で最初に見つかったファイルを使います。

1. `hyogen.config.ts`
2. `hyogen.config.mjs`
3. `hyogen.config.js`
4. `hyogen.config.cjs`

`dev` / `build` の `--config <file>` で明示できます。

## オプション

| キー | 必須 | 既定 | 意味 |
|------|------|------|------|
| `input` | **必須** | — | 入口パスまたは glob（文字列 / 配列） |
| `outDir` | 任意 | `./out` | **`build` のみ**の出力先（`dev` は書かない） |
| `context` | 任意 | — | テンプレート共通 context |
| `serverContext` | 任意 | — | サーバ専用 context |
| `dataSources` | 任意 | — | YAML / JSON / CSV（[dataSources](/ja/api/data-sources)） |
| `root` | 任意 | — | プロジェクトルート |
| `includeUnderscoreEntries` | 任意 | — | `_` 始まりをエントリに含めるか |
| `preserveFrontMatter` | 任意 | — | front matter を出力に残すか |
| `preserveHgComments` | 任意 | — | `@hg` コメントを出力に残すか |

設定内のパスは、設定ファイルがあるディレクトリ基準で解決されます。

## 関連

- [create](/ja/cli/create)
- [dev](/ja/cli/dev)
- [build](/ja/cli/build)
- [API build](/ja/api/build)
