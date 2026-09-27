# 公開 API

実装済みの公開面（`@b4moss/hyogen-md@0.14.0`）。型・符号の正は `app/src/types.ts` / `app/src/index.ts` / `app/src/client.ts` / `app/src/config/`。

## レンダリング入口

- サーバ向けとクライアント向けで API を分ける
  - **`renderServer`** … SSR / SSG 想定。`serverContext` を渡せる
  - **`renderClient`** … CSR 想定。`serverContext` は渡せない
- SSG 一括は **`build`**

### 入力の解釈

第 1 引数 `string | { path: string }` の意味:

| 形 | 意味 |
|----|------|
| **`string`** | **ソース Markdown 本文**（ファイルパスではない） |
| **`{ path }`** | ディスク上のファイルを読む（`renderServer` は Node 側で FS 読込。`renderClient` は呼び出し側 `loader` 必須） |

## 型（概要）

```ts
type HyogenContext = Record<string, unknown>;

type HyogenDiagnostic = {
  code: string;
  message: string;
  path?: string;
  details?: Record<string, unknown>;
};

type HyogenWarning = HyogenDiagnostic;
type HyogenError = Error & HyogenDiagnostic;

type RenderOptions = {
  preserveFrontMatter?: boolean;
  preserveHgComments?: boolean;
  loader?: Loader;
  root?: string;
  /** エントリ／文書パス（診断・相対解決の基準） */
  path?: string;
  /** true のとき解決先を root 配下に正規化制約する */
  constrainToRoot?: boolean;
};

type DataSourcesMap = Record<string, string>;

type ServerRenderOptions = RenderOptions & {
  serverContext?: HyogenContext;
  /** 変数名 → ルート相対のデータファイルパス（YAML / JSON / CSV） */
  dataSources?: DataSourcesMap;
};

type Loader = (path: string) => Promise<string>;

type RenderResult = {
  markdown: string;
  warnings: HyogenWarning[];
};

type BuildResult = {
  files: { path: string; markdown: string }[];
  warnings: HyogenWarning[];
};
```

## 関数

```ts
declare function renderServer(
  source: string | { path: string },
  context?: HyogenContext,
  options?: ServerRenderOptions,
): Promise<RenderResult>;

declare function renderClient(
  source: string | { path: string },
  context?: HyogenContext,
  options?: RenderOptions,
): Promise<RenderResult>;

type BuildOptions = RenderOptions & {
  input: string | string[];
  outDir: string;
  includeUnderscoreEntries?: boolean;
  context?: HyogenContext;
  serverContext?: HyogenContext;
  dataSources?: DataSourcesMap;
};

declare function build(options: BuildOptions): Promise<BuildResult>;

/**
 * 複数データファイルを読み込み、変数名 → 値の HyogenContext を返す。
 * renderServer / build の dataSources と同じパース規則。
 * 既定 loader は FS のみ（createFsLoader）。リモート URL は拒否。
 */
declare function loadDataSources(
  sources: DataSourcesMap,
  options?: { root?: string; loader?: Loader },
): Promise<HyogenContext>;

/** 診断を api.md 例形式の複数行テキストに整形する。console へは出力しない。 */
declare function formatDiagnosticLog(
  kind: "error" | "warning",
  diagnostic: HyogenDiagnostic,
): string;

declare function createFsLoader(options?: {
  from?: string;
  via?: "include" | "component" | "extend";
}): Loader;
declare function createNodeLoader(options?: {
  from?: string;
  via?: "include" | "component" | "extend";
}): Loader;
declare function isRemotePath(path: string): boolean;
declare function createHyogenError(options: {
  code: string;
  message?: string;
  path?: string;
  details?: Record<string, unknown>;
}): HyogenError;
declare function formatMessage(
  code: string,
  details?: Record<string, unknown>,
): string;
```

### パッケージ export 一覧

| 入口 | export |
|------|--------|
| `@b4moss/hyogen-md` | `renderServer` / `renderClient` / `build` / `loadDataSources` / `createFsLoader` / `createNodeLoader` / `isRemotePath` / `createHyogenError` / `formatMessage` / `formatDiagnosticLog` + 関連型 |
| `@b4moss/hyogen-md/client` | `renderClient` / `createHyogenError` / `formatMessage` / `formatDiagnosticLog` + 関連型（loaders / `loadDataSources` / `build` は載せない） |
| `@b4moss/hyogen-md/config` | `defineConfig` / `loadConfig` / `resolveConfigPath` + `HyogenConfig` / `ResolvedHyogenConfig` |

`formatDiagnosticLog` はメイン・client の両方から export される。

- 1 行目: `[hyogen:{kind}] {code}`
- 以降: `details` の各キーを `  {key}: {value}`（インデント 2 スペース）。値は `String(value)`。`undefined` のキーは省略
- `diagnostic.path` も `path` 行として含める。`details.path` がある場合はそちらを優先
- ライブラリ本体は **自動で console 出力しない**（呼び出し側が使うユーティリティ）

### サーバ専用 context

- **別引数 `serverContext`** を採用する
- `renderServer` / `build` のみ `serverContext` を受け取れる
- `renderClient` の options に `serverContext` 相当が渡された場合は **エラー**（`server_context_on_client`）
- context に秘密キー名を機械検出する機能は **設けない**（API 分離とドキュメントで防ぐ）

```ts
await renderServer(
  { path: "./page.md" },
  { title: "public" },
  { serverContext: { apiKey: "secret" } },
);
```

## データソースのインポート

外部データ（**YAML / JSON / CSV**）を **API 側のみ**で読み、テンプレート変数へバインドする。DSL の `import` / `require` は **引き続き禁止**（[dsl.md](./dsl.md)）。`renderServer` / `build` への配線は **v0.12.0** で完了。

### オプション `dataSources`

`renderServer` / `build` の options に **変数名 → ファイルパス** のマップを渡す。

```ts
await renderServer(
  { path: "./page.md" },
  {},
  {
    root: "./site",
    dataSources: {
      site: "./data/site.yaml",
      products: "./data/products.json",
      rows: "./data/rows.csv",
    },
  },
);
```

- パスは `options.root`（省略時は `.doc_root` 探索結果または cwd）からの **相対パス**
- **リモート URL**（`http://` / `https://`）は **非対応**。検出したら **`load_failed`**（`details.reason` にリモート非対応である旨を入れる）。`file_not_found` にはしない
- `renderClient` に `dataSources` を渡した場合は **`data_sources_on_client`** で中断（空オブジェクト `{}` は未指定と同義で許容）
- マップの **キー名に制約はない**（任意の文字列。危険キーへの式アクセスは既存の [security.md](./security.md) / DSL 規則に任せる）
- 各データファイルのソース上限は **5MB（5 × 1024 × 1024 バイト）/ ファイル**。超過は **`data_source_too_large`**

### 関数 `loadDataSources`

プログラムから先に読み込み、手動で context に合成してもよい。

```ts
const fromFiles = await loadDataSources(
  { site: "./data/site.yaml" },
  { root: "./site" },
);
await renderServer({ path: "./page.md" }, { ...fromFiles, extra: 1 });
```

`@b4moss/hyogen-md`（サーバ向け）のみ export。`@b4moss/hyogen-md/client` には **載せない**。

`renderServer` / `build` の `dataSources` と同じパース・上限・リモート拒否規則を適用する。既定 loader は **`createFsLoader`（FS のみ）**。`createNodeLoader` は include / component / extend 用の Node 既定（FS + 許可リモート fetch）。

### context へのマージ順

`renderServer` / `build` では次の順で浅いマージ（[variables.md](./variables.md)）:

1. `loadDataSources(dataSources)` の結果
2. 呼び出し側 `context`（`build` の `options.context`）
3. `serverContext`

同名キーは **後勝ち**。front matter は `renderDocument` 内でさらに後から適用される（従来どおり）。

### 形式別パース

| 拡張子 | パース結果（変数に束縛される値） |
|--------|--------------------------------|
| `.json` | `JSON.parse` の結果（オブジェクト / 配列 / プリミティブ） |
| `.yaml` / `.yml` | `yaml` パッケージでパースした結果 |
| `.csv` | **ヘッダー行あり**の CSV → **オブジェクト配列**（1 行 = 1 レコード。フィールドはすべて文字列） |

共通:

- 空ファイル → **`parse_error`**
- 未対応拡張子 → **`parse_error`**（`details.format` に拡張子）
- 拡張子判定は path 末尾（大文字小文字は区別しない）

YAML（厳格・ライブラリ既定に従う）:

- 日付・数値・真偽・`null` 等の型は **`yaml` パッケージの既定**のまま束縛する（追加の型正規化はしない）
- alias / anchor は **許可**（パーサが解決した結果を使う）
- 重複キーは **パーサ既定**（後勝ち）
- 不正 YAML → **`parse_error`**

CSV（厳格）:

- **`csv-parser`**（npm）を `Readable.from` 経由の薄いラッパで利用。RFC 4180 簡易（カンマ区切り、ダブルクォートでフィールド囲み・エスケープ、`\r\n` / `\n` 改行）
- 空行は **スキップ**
- データ行の列数がヘッダーと不一致 → **`parse_error`**
- **BOM 非対応**（先頭 BOM は除去しない。ヘッダー名に混入しうる）
- TSV・セミコロン区切り等は **非対応**（未対応形式と同様 `parse_error`）

### build での扱い

- `dataSources` は **エントリループの前に 1 回**読み込み、全エントリで同一のマージ済み context を使う（`context` / `serverContext` と同様）

## loader

`include` / `component` / `extend` のパスを解決し、ソース文字列を返す。

- 戻り値は `(path: string) => Promise<string>` で足りる（メタデータは後で拡張可）
- **ブラウザ**: 呼び出し側が必須。同一オリジン想定
- **Node（`renderServer` / `build`）**: 省略時は **`createNodeLoader`**（FS + 許可されたリモート fetch）
- **`loadDataSources`**: 省略時は **`createFsLoader`**（FS のみ。リモートは事前拒否）
- 失敗時は `file_not_found` または `load_failed` で **中断**。`ENOENT` 等は hyogen エラーに包む

## 入力の指定（SSG / 一括）

- 個別パス列挙 + **glob**
- glob 方言: **Vite / JS エコシステムで一般的な glob**（実装は **picomatch + fast-glob**）
- SSG 既定: **エントリ指定 → 依存を辿って走査**（`build`）
- `_` partial（`build` / CLI build のみ）:
  - **リテラルパス**は `_` でも常にエントリに含める
  - **glob マッチ**は既定で除外。含めるには `includeUnderscoreEntries: true`
  - `renderServer` 単発は `_` フィルタを適用しない

## オプション（デフォルト）

| オプション | デフォルト |
|------------|------------|
| front matter を出力に残す | OFF |
| hyogen HTML コメントを出力に残す | OFF |
| リモート include / component（Node） | 許可 |

## エラー・警告コード

英語メッセージテンプレート: [messages.en.json](./messages.en.json)

### 中断するエラー

| code | 状況 |
|------|------|
| `file_not_found` | include / component / extend 先が存在しない |
| `frontmatter_too_large` | front matter ソースが 64KB 超 |
| `duplicate_component_alias` | 同名 `component ... as` の二重登録 |
| `alias_collision` | `as` 名の衝突（変数・親子再登録含む） |
| `forbidden_property_access` | 危険キーへのアクセス |
| `parse_error` | ホワイトリスト外構文・不正 DSL |
| `server_context_on_client` | `renderClient` に `serverContext` 相当 |
| `data_sources_on_client` | `renderClient` に `dataSources` |
| `data_source_too_large` | データソースファイルが 5MB 超 |
| `load_failed` | loader のその他失敗（データソースのリモート URL 拒否を含む） |

### 中断しない警告

| code | 状況 |
|------|------|
| `circular_include` | 循環参照（当該取り込みスキップ） |
| `nest_limit_exceeded` | `if` / `each` 構造ネスト合計 20 超（スキップ） |
| `extend_in_component` | component 内の extend（スキップ） |
| `prop_type_mismatch` | props 型不一致（値は `undefined`） |
| `prop_missing` | `isRequired` なのに欠落（値は `undefined`） |
| `prop_unknown` | 未知の props キー（**無視**） |
| `suspicious_context_value` | context 値が危険っぽい（改変しない） |

ログ出力例:

```text
[hyogen:error] file_not_found
  path: ./missing.md
  from: ./page.md
  via: include
```

## TOC 専用ヘルパ（v0.12.0）

構文・見出し抽出・出力形式は [toc.md](./toc.md) が正。レンダリング API（`renderServer` / `renderClient` / `build`）のシグネチャ変更は不要（パイプライン内で自動処理）。

## CLI / 設定（v0.13.0）

バイナリ `hyogen-md`（`create` / `dev` / `build`）と設定ファイルの正本は [cli.md](./cli.md)。

パッケージ export:

```ts
// @b4moss/hyogen-md/config
import {
  defineConfig,
  loadConfig,
  resolveConfigPath,
} from "@b4moss/hyogen-md/config";
import type { HyogenConfig, ResolvedHyogenConfig } from "@b4moss/hyogen-md/config";

export default defineConfig({
  input: "./src/**/*.md",
  // outDir: "./out",
});
```

- `defineConfig` … 型付きの恒等関数
- `loadConfig` / `resolveConfigPath` … 公開 API（CLI も利用）。プログラムから設定を読む用途向け
- 英語メッセージカタログのランタイム正本は `app/src/errors/messages.en.json`（本ディレクトリの [messages.en.json](./messages.en.json) は docs 側の写し）

## 後続候補（未実装）

（現時点なし）

## 関連

- CLI: [cli.md](./cli.md)
- TOC: [toc.md](./toc.md)
- パイプライン: [pipeline.md](./pipeline.md)
- パス: [paths.md](./paths.md)
- セキュリティ: [security.md](./security.md)

---

以上