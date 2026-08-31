# プレイグラウンド

ドキュメントサイト内の動作確認 UI。**npm パッケージには含めない**。  
公開 URL: **https://hyogenmd.oss.b4m.jp/playground**（[docs-site.md](./docs-site.md) と同一デプロイ）。

ライブラリ API の正: [api.md](./api.md)（`renderClient` / loader）。

---

## 配置・スタック

| 項目 | 方針 |
|------|------|
| コード | `docs-site/components/playground/`（Nuxt ページ `/playground`） |
| テスト | `docs-site/test/playground/` |
| フレームワーク | Vue + TypeScript、CodeMirror 6 |
| hyogen-md | 開発時 alias で `app/` ソースを参照 |
| 単独 `playground/` | **削除済み**（v0.10.0-docs.6 でサイト内統合） |

---

## 仮想 FS

| 項目 | 方針 |
|------|------|
| 実ディスク | 操作しない（ブラウザ内のみ） |
| 領域 | `src`（編集可）と `outDir`（読取専用） |
| `_` partial | `src` に置ける。outDir には書かずツリーにも出さない（[pipeline.md](./pipeline.md) と一致） |
| 永続化 | `localStorage` |
| Reset | デモシードへ戻し、永続化も上書き |

---

## UI

| 項目 | 方針 |
|------|------|
| ファイラー | 左ペイン。`src` / `outDir` を区別 |
| ファイル操作 | アクションメニュー（⋯）で create / rename / delete |
| ペイン幅 | ファイラー／エディタ／プレビュー間をドラッグ可変（最小幅あり。幅は `localStorage` 保存可） |
| シンタックスハイライト | `@hg` … `@endhg` と `@@` 内（CM6 のみ。コードフェンス内は対象外 → [dsl.md](./dsl.md)） |
| テーマ | dark / light / system。サイトと共有（[docs-site.md](./docs-site.md)） |
| プレビュー | 展開後 Markdown と HTML 見た目の両方 |
| HTML 化 | Playground 側（hyogen-md は Markdown のみ） |
| render | 入力デバウンス付き自動。開いている 1 ファイルのみ outDir 更新 |
| 診断 | エラー／警告パネル。非エントリ ParseError は note |
| context | UI なし（シード固定） |

展開後 Markdown の余分な空行は **Playground 側で CSS 補正しない**（[pipeline.md](./pipeline.md)）。

---

## 初期シード

extend / if / each / component 等を触れる小さなデモプロジェクト。

---

## テスト

- 純ロジック（仮想 FS、loader、写像、永続化／Reset）: 単体テスト
- UI: 手動確認
- テスト仕様: [app/test/specs/v0.9.0.md](../../app/test/specs/v0.9.0.md)、[v0.10.0.md](../../app/test/specs/v0.10.0.md)

----

以上
