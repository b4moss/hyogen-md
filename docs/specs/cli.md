# CLI（create / hyogen.config / dev / build）

| 項目 | 値 |
|------|-----|
| **状態** | 実装済み（v0.13.0 CLI） |
| **マイルストーン** | [v0.13.0](https://github.com/b4moss/hyogen-md/milestone/4) |
| **関連 Issue** | [#35](https://github.com/b4moss/hyogen-md/issues/35)（config / create）、[#30](https://github.com/b4moss/hyogen-md/issues/30)（執筆用 dev server） |
| **方針** | #30 と #35 は **一体** の CLI 体験として設計・実装する |

旧 `docs/plans/v0.13.0/cli-dev-server.md` から昇格。テスト仕様: [app/test/specs/v0.13.0.md](../../app/test/specs/v0.13.0.md)。

---

## 1. 目的

現状の「`app.js` を書いて `node app.js` で `renderServer` / `build` を呼ぶ」使い方に加え、Vite に近い次の体験を提供する。

1. `create` で最小プロジェクトを生成する
2. `hyogen.config.(js|ts)` で実行設定を宣言する
3. `dev` で執筆中プレビュー（ファイルウォッチ + HMR）を行う
4. `build` で `outDir` へ Markdown を書き出す

ライブラリ本体の公開 API（`renderServer` / `renderClient` / `build` 等）は維持する。CLI はそれらを設定ファイル経由で駆動する層とする。

---

## 2. 非目標（この成果物の範囲外）

- サイトジェネレータ化（Nuxt / VitePress 相当のルーティング・テーマ・本番サイト構築）
- HTML をライブラリ本体の出力にすること（本体は **Markdown only** のまま。プレビュー用 HTML 化は `dev` 専用）
- ブラウザ上でのソース編集・ディスクへの書き戻し
- `preview` サブコマンド（静的出力の再配信）。必要なら後続

---

## 3. 成果物の形

| 項目 | 決定 |
|------|------|
| 配布 | **単一パッケージ** `@b4moss/hyogen-md` に CLI を載せる |
| バイナリ名 | **`hyogen-md`**（`package.json` の `bin`） |
| サブコマンド（v1） | **`create` / `dev` / `build`** |

ローカル実行例:

```bash
npx hyogen-md create
npx hyogen-md dev
npx hyogen-md build
```

---

<a id="create"></a>

## 4. `create`（関連: #35）

### 起動

```bash
npx @b4moss/hyogen-md create
```

追加の `create-*` パッケージは置かない（単一 CLI 方針）。

### 生成物（最小）

| パス | 内容 |
|------|------|
| `package.json` | 依存 `@b4moss/hyogen-md`、scripts（少なくとも `dev` / `build`） |
| `hyogen.config.js` または `hyogen.config.ts` | 下記「設定ファイルの言語」 |
| `src/index.md` | サンプル入口 Markdown |
| `.gitignore` | Node / 出力ディレクトリ等 |

README は任意（最小構成では必須としない）。

### 設定ファイルの言語

`create` は **`--language js|ts`** で選択する。**既定は `js`**。  
読み込み側は `.js` / `.ts`（および `.mjs` / `.cjs`）を受理する。

---

<a id="hyogen-config"></a>

## 5. `hyogen.config.(js|ts)`（関連: #35）

### 記法

Vite 風の **`defineConfig`** を正とする。

```js
import { defineConfig } from "@b4moss/hyogen-md/config";

export default defineConfig({
  input: "./src/**/*.md",
  // outDir: "./out", // 任意。未指定時は ./out
});
```

- export は `defineConfig(...)` の default export
- 型支援は `defineConfig` 経由で提供する（`.ts` および JSDoc 利用時）

### スキーマ（v1）

| キー | 必須 | 既定 | 意味 |
|------|------|------|------|
| `input` | **必須** | — | 入口 Markdown の glob / パス（文字列または配列） |
| `outDir` | 任意 | `./out` | `build` の出力先。`dev` は書き出さない |
| `context` | 任意 | — | テンプレート共通 context |
| `serverContext` | 任意 | — | サーバ専用 context（`build` / `dev` の render に渡す） |
| `dataSources` | 任意 | — | YAML / JSON / CSV のデータソース（[api.md](./api.md)） |
| `root` | 任意 | — | プロジェクトルート |
| `includeUnderscoreEntries` | 任意 | — | `_` 始まりをエントリに含めるか |
| `preserveFrontMatter` | 任意 | — | front matter を出力に残すか |
| `preserveHgComments` | 任意 | — | `@hg` コメントを出力に残すか |

探索順（cwd）: `hyogen.config.ts` → `.mjs` → `.js` → `.cjs`。`--config` で明示可。

`dev` / `build` 共通の土台として同一設定ファイルを読む。モード専用ブロック（`dev: { … }`）は v1 では置かない。

### パッケージ export

**`@b4moss/hyogen-md/config`** から `defineConfig` と設定型を export する。

---

## 6. `build`

- 設定の `input` / `outDir`（と任意オプション）を既存の `build()` API に渡して実行する
- ディスクへの Markdown 出力は **`build` の責務**
- CLI フラグ: `--config <file>`、`--outDir <dir>`（設定の上書き）

---

<a id="dev-server"></a>

## 7. 執筆用 `dev`（関連: #30）

### 役割

Markdown を外部エディタで書きながら、ブラウザでレンダー結果を確認する。変更はファイルウォッチで検知し、**ファイル単位の HMR** でプレビューを更新する。

### UI

| 要素 | 方針 |
|------|------|
| ブラウザ編集 | **しない**（プレビュー専用） |
| レイアウト | **ファイルツリー＋プレビュー**。ソース編集ペインは置かない |
| 複数ファイル | ツリーで選択したエントリをプレビュー |
| 診断 | **CLI / ターミナル中心**（ブラウザオーバーレイは v1 必須としない） |

### HMR

- 変更ファイルと、その依存（include / component 等）を再処理し、該当プレビューを差し替える
- ページ全体リロードはしない（可能な範囲で）
- エントリ全体の再 build や、式／ブロック単位の部分更新は v1 対象外

### 変更検知

- **`input` 配下（および依存解決に必要なパス）をファイルウォッチ**
- 外部エディタでの保存がトリガ

### プレビュー用 HTML 化

- ライブラリ本体は Markdown only のまま
- **`dev` 専用**の薄い Markdown→HTML（marked）と最小 CSS
- 本体の公開 API / npm の主 export には載せない
- docs-site / Playground の見た目の完全流用はしない（必要なら後続で段階追加）

### ディスク出力

- **`dev` は `outDir` に書き出さない**
- レンダー結果はメモリ／dev サーバ内のみ保持
- ディスク出力が必要なら `build` を使う

### CLI フラグ

- `--config <file>`
- `--host`（既定 `127.0.0.1`）
- `--port`（既定 `4173`）

---

## 8. 受け入れ条件

### create / config（#35）

- [x] `npx @b4moss/hyogen-md create` で最小構成が生成される
- [x] create 時に `hyogen.config.js` / `.ts` を選択でき、既定は `.js`（`--language`）
- [x] `defineConfig` で `input` 必須の設定を読める
- [x] `hyogen-md build` が設定に従い `outDir`（既定 `./out`）へ出力する

### dev（#30）

- [x] `hyogen-md dev` がプレビュー用 HTTP サーバを起動する
- [x] ファイルツリーから Markdown を選べる
- [x] 外部エディタで保存すると、該当ファイル（と依存）が HMR 更新される
- [x] ブラウザ上では編集できない
- [x] `dev` 実行中に `outDir` へ成果物が書き出されない
- [x] レンダーエラー／warning がターミナルに出る

---

## 9. 実装メモ

- 既存 API 正本: [specs/api.md](./api.md)
- Playground は VirtualFS＋ブラウザ編集であり、本 `dev`（実ディスク＋外部エディタ）とは役割を分ける: [specs/playground.md](./playground.md)
- 憲章上、CLI は薄い DDD で CRUD Trait 必須ではない: [override-charter.md](../override-charter.md)
- テスト仕様: [app/test/specs/v0.13.0.md](../../app/test/specs/v0.13.0.md)

---

## 10. 関連リンク

| 資源 | URL |
|------|-----|
| Issue #30 | https://github.com/b4moss/hyogen-md/issues/30 |
| Issue #35 | https://github.com/b4moss/hyogen-md/issues/35 |
| Milestone v0.13.0（完了） | https://github.com/b4moss/hyogen-md/milestone/4 |

----

以上
