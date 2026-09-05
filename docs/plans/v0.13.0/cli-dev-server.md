# CLI（create / hyogen.config / dev / build）

| 項目 | 値 |
|------|-----|
| **状態** | 仕様詳細 |
| **マイルストーン** | [v0.13.0](https://github.com/b4moss/hyogen-md/milestone/4) |
| **関連 Issue** | [#35](https://github.com/b4moss/hyogen-md/issues/35)（config / create）、[#30](https://github.com/b4moss/hyogen-md/issues/30)（執筆用 dev server） |
| **方針** | #30 と #35 は **一体** の CLI 体験として設計・実装する |

実装完了後は本ファイルを `docs/specs/` へ移す（[doc-rule.md](../../charter/doc-rule.md)）。

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

`create` 実行時に **`js` / `ts` を選択**させる。**既定は `js`**。  
読み込み側は最初から `.js` / `.ts` の両方を受理する。

---

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
| `input` | **必須** | — | 入口 Markdown の glob / パス |
| `outDir` | 任意 | `./out` | `build` の出力先。`dev` は書き出さない |
| その他（`context` / `dataSources` / loader 相当 等） | 任意 | — | 既存 `build` / `renderServer` オプションに対応する範囲で後日詳細可。v1 の必須は `input` のみ |

`dev` / `build` 共通の土台として同一設定ファイルを読む。モード専用ブロック（`dev: { … }`）は v1 では必須としない。

### パッケージ export

CLI 設定用に例えば `@b4moss/hyogen-md/config` を追加する（実装時に `exports` を更新）。

---

## 6. `build`

- 設定の `input` / `outDir`（と任意オプション）を既存の `build()` API に渡して実行する
- ディスクへの Markdown 出力は **`build` の責務**

---

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
- **`dev` 専用**の薄い Markdown→HTML（marked / markdown-it 等）と最小 CSS
- 本体の公開 API / npm の主 export には載せない
- docs-site / Playground の見た目の完全流用はしない（必要なら後続で段階追加）

### ディスク出力

- **`dev` は `outDir` に書き出さない**
- レンダー結果はメモリ／dev サーバ内のみ保持
- ディスク出力が必要なら `build` を使う

---

## 8. 受け入れ条件（案）

### create / config（#35）

- [ ] `npx @b4moss/hyogen-md create` で最小構成が生成される
- [ ] create 時に `hyogen.config.js` / `.ts` を選択でき、既定は `.js`
- [ ] `defineConfig` で `input` 必須の設定を読める
- [ ] `hyogen-md build` が設定に従い `outDir`（既定 `./out`）へ出力する

### dev（#30）

- [ ] `hyogen-md dev` がプレビュー用 HTTP サーバを起動する
- [ ] ファイルツリーから Markdown を選べる
- [ ] 外部エディタで保存すると、該当ファイル（と依存）が HMR 更新される
- [ ] ブラウザ上では編集できない
- [ ] `dev` 実行中に `outDir` へ成果物が書き出されない
- [ ] レンダーエラー／warning がターミナルに出る

---

## 9. 実装時のメモ

- 既存 API 正本: [specs/api.md](../../specs/api.md)
- Playground は VirtualFS＋ブラウザ編集であり、本 `dev`（実ディスク＋外部エディタ）とは役割を分ける: [specs/playground.md](../../specs/playground.md)
- 憲章上、CLI は薄い DDD で CRUD Trait 必須ではない: [override-charter.md](../../override-charter.md)
- 実装開始時に [charter/tdd.md](../../charter/tdd.md) に従い `docs/tests/` または `app/test/specs/` へテスト仕様を追加する

---

## 10. 関連リンク

| 資源 | URL |
|------|-----|
| Issue #30 | https://github.com/b4moss/hyogen-md/issues/30 |
| Issue #35 | https://github.com/b4moss/hyogen-md/issues/35 |
| Milestone v0.13.0 | https://github.com/b4moss/hyogen-md/milestone/4 |

----

以上
