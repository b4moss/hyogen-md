# hyogen.md - Extended Markdown Template Engine

`hyogen.md`（表現.md）は、Markdownをテンプレートエンジンとして用いる TypeScript ライブラリ（npm パッケージ）である。

開発の最上位方針は [charter/](./charter/)（[b4moss/charter](https://github.com/b4moss/charter) から取り込み）に従う。プロジェクト固有の例外は [override-charter.md](./override-charter.md) を参照。

**未実装・追加機能は [GitHub Issues](https://github.com/b4moss/hyogen-md/issues) / [Milestones](https://github.com/b4moss/hyogen-md/milestones) で管理する**（`docs/` は現行実装の仕様正本）。

## モチベーション

- Markdownの表現力を上げる
- テンプレート・コンポーネントの概念を導入する
- リアルタイムレンダリング（CSR）と静的／サーバレンダリング（SSG / SSR）に両対応する

## ゴール / 非ゴール

### ゴール

- **Front matter 以外は Markdown 互換**であること
  - 制御構文は HTML コメントに閉じ、生ソースのプレビューを壊さない
  - 展開後の出力も通常の Markdown パーサで読める
- テンプレートエンジンとしての能力（include / component / extend / 変数 / ロジック）は、既存エンジン（Pug / Blade / Twig / Mustache）と同系統の体験を提供する

### 非ゴール（現行）

- 任意 JavaScript の評価（`eval` / `new Function` 等）
- **HTML 出力**（Markdown 出力のみ。HTML 化は利用側）
- **ドキュメントサイトを npm に同梱すること**

### 表記

- 正式名称: **`hyogen.md`**（`hyougen.md` は用いない）
- パス・npm・Git 名: **`hyogen-md`**（`@b4moss/hyogen-md`）

---

## ドキュメント構成

メンテナー向け仕様の正は **`docs/`**（**実装済みのみ**）。利用者向けは [ドキュメントサイト](https://hyogenmd.oss.b4m.jp) と README・[`user-docs/`](../user-docs/)。

| パス | 内容 |
|------|------|
| [charter/](./charter/) | 開発憲章 |
| [override-charter.md](./override-charter.md) | 憲章のプロジェクト例外 |
| [roadmap.md](./roadmap.md) | 版一覧・進捗ハブ |
| [specs/](./specs/) | 現行機能の仕様正本 |
| [_archived/](./_archived/) | 完了ロードマップ・歴史 |
| [wishlist.md](./wishlist.md) | PO 個人メモ（未整理のみ） |
| [app/test/specs/](../app/test/specs/) | テスト仕様（TDD 入力） |
| GitHub [Issues](https://github.com/b4moss/hyogen-md/issues) | 未実装・追加機能 |

### specs/ 主要文書

| 文書 | 内容 |
|------|------|
| [api.md](./specs/api.md) | 公開 API・loader・エラー |
| [pipeline.md](./specs/pipeline.md) | 処理パイプライン |
| [templating.md](./specs/templating.md) | include / component / extend |
| [variables.md](./specs/variables.md) | 変数・front matter |
| [logic.md](./specs/logic.md) | if / each / 三項 |
| [dsl.md](./specs/dsl.md) | `@hg` / `@@` DSL |
| [paths.md](./specs/paths.md) | パス解決 |
| [security.md](./specs/security.md) | セキュリティ |
| [playground.md](./specs/playground.md) | Playground |
| [docs-site.md](./specs/docs-site.md) | ドキュメントサイト |
| [distribution.md](./specs/distribution.md) | npm・公開 |
| [repository.md](./specs/repository.md) | ブランチ・CI/CD |
| [development.md](./specs/development.md) | TDD・make コマンド |

---

## 現行版

- npm: **`@b4moss/hyogen-md@0.10.1`**（`app/package.json`）
- 次 Milestone: [v0.11.0](https://github.com/b4moss/hyogen-md/milestone/1)（[roadmap.md](./roadmap.md)）

---

以上
