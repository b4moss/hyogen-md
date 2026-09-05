# Changelog

ライブラリ変更と Playground 専用を区別して記載します。最新の正式リリースは **`v0.12.0`** です。

English: [changelog.md](./changelog.md)

### 0.12.0 — ライブラリ

- **TOC ヘルパ** — `toc` / `toc(N)` を include / 制御構造 / `{{ }}` の後に Markdown 目次へ展開（Issue #42）
- **許可プロパティ `.length`** — 式内で配列の要素数・文字列の文字数（メソッド `length()` は引き続き parse error）（Issue #45）
- **`echo <式>`** — 囲む `@hg` / `@@` ブロックを評価結果文字列で置換。複数・ループ内は連結（Issue #53）
- **データソース配線** — `renderServer` / `build` の `dataSources` と `loadDataSources`。YAML / JSON / CSV。リモート URL 拒否・ファイルサイズ上限（Issue #36 / #37）
- **ドキュメントサイト** — TOC・許可プロパティ（`.length`）・`echo`・dataSources ページ（英日）
- **CI/CD** — app / docs ゲート分離。GitHub Pages は **`doc-site`** ブランチからデプロイ

### 0.11.0 — ライブラリ / ツールチェーン

- 開発・CI を **Node.js >= 24** に統一（`app/package.json` の `engines`）
- OpenSSF Scorecard / Code Scanning 対応（Fuzzing 除く）
- docs-site lockfile を Node 24 / npm に同期
- npm **`@b4moss/hyogen-md@0.11.0`**（git tag `v0.11.0`）

### 0.10.0-docs.8 — ドキュメントサイト完成

- Playground を `/playground` に統合（ペイン幅ドラッグ・テーマ共有）
- API / 構文リファレンス（英日）をサイトに掲載
- 単独 `playground/` を削除。テストは `docs-site/test/playground/`
- README からドキュメントサイトと `/playground` へ導線

### 0.10.0-docs.6 — Playground をサイト内へ移植

- `docs-site/` へ Playground 統合（Vite alias で `app/` 参照）
- ペイン幅ドラッグ可変、dark / light / system テーマ

### 0.10.0-docs.5 — ドキュメントサイト骨格

- Nuxt Content、`docs-site/`、英日ルート、テーマ切替
- `make build-docs` による静的生成

### 0.10.0-docs.3 — Playground 公開

- `docs-site/` をビルドするデプロイ設定（Playground alias のため `app/` も必要）
- README（英・日、根・`app/`）から公開ドキュメントサイトへ導線
- サイト接続手順は `docs/specs/repository.md`

### 0.10.0-docs.2 — CD / ブランチ保護

- **`release`** への push で npm publish（`.github/workflows/publish.yml`）。既存 `name@version` はスキップ
- npm 公開用シークレットと branch protection（`main` / `release` / `develop`）を `docs/specs/repository.md` に記載

### 0.10.0-docs.1 — リポジトリ運用

- 長期ブランチ **`main`** / **`release`**（`v0.10.0` 時点の `develop` から）。`develop` は維持
- GitHub Actions CI（PR base: `dev-v*` / `hotfix/*`→`main`）。docs CI は `doc-site`
- 仕様: [`docs/specs/repository.md`](https://github.com/b4moss/hyogen-md/blob/main/docs/specs/repository.md)（Pages の production は **`doc-site`**）

### 0.10.0 — Playground UX + npm 初回公開

Playground（npm 非同梱）:

- ファイル操作のアクションメニュー（⋯）
- `@hg` / `@@` シンタックスハイライト（JS 近似）と `{{ }}` の軽い装飾
- 非エントリ向け Diagnostics **note**（例: layout）。Preview はソース Markdown
- ファイラー UX（OUT の read-only 見た目、アイコン）。Reset 時は `/src` 全体を `/out` へ再 render
- Markdown タブの highlight.js 色分け

ライブラリ配布:

- `app/` から `@b4moss/hyogen-md@0.10.0` を初回公開（`dist` + README / LICENSE。`*.map` 除外）
- git tag `v0.10.0` と npm 版を一致
- ドキュメント構成: `docs/`（メンテナー）、`user-docs/`（changelog 等）

### 0.10.0-beta.3

- **Packaging:** npm tarball から `*.map` を除外。Vite `minify: true` を明示
- **Tooling:** Makefile 拡充（`size` / `pack` / `check` / playground 向け）
- **Docs:** README バッジ（npm / license / node / coverage）

### 0.10.0-beta.2

- **Docs / packaging:** MIT LICENSE、日英 README + CHANGELOG、パッケージ名 `@b4moss/hyogen-md`、GitHub homepage

### 0.10.0-beta.1

- **Docs:** npm 初回公開方針（tag ↔ npm 版、MIT、README 同期、GitHub homepage）

### 0.9.2 — ライブラリ

- 展開後 Markdown の余分な空行を引き締め。以前のビルドより出力が変わりうる

### 0.9.1 — Playground

- `_` 始まりのファイル / ディレクトリを outDir から除外。SRC リネーム・アンハイライト時の OUT 同期

### 0.9.0 — Playground

- ローカル Playground: 仮想 FS、ファイラー、CodeMirror、自動 render、プレビュー、診断、デモシード、`localStorage`

### 0.8.0 — ライブラリ

- `formatDiagnosticLog`、`each` + `component`（式 props）、横断テスト / docs 仕上げ

### 0.7.0 — ライブラリ

- `@@` ショートハンド、三項・テンプレートリテラル、`for` / `do`–`while`、suspicious context 警告

### 0.6.0 — ライブラリ

- `renderClient` と `@b4moss/hyogen-md/client` 公開面

### 0.5.0 — ライブラリ

- `build`、`serverContext`、リモート loader

### 0.4.0 — ライブラリ

- `extend` / `block` レイアウト継承

### 0.3.0 — ライブラリ

- 宣言と `if` / `each`、演算子式

### 0.2.0 — ライブラリ

- パス解決、Node loader、`component`

### 0.1.0 — ライブラリ

- パイプライン MVP: `@hg`、front matter、`{{ }}`、`include`
