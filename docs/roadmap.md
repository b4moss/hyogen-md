# 開発ロードマップ

[SemVer](https://semver.org/) に従う。`v0.n.0` を機能塊の区切りとする（日付の約束はしない）。  
`v1.0.0` 引き上げは PO 判断。

**未実装・追加機能の管理は [GitHub Issues](https://github.com/b4moss/hyogen-md/issues) / [Milestones](https://github.com/b4moss/hyogen-md/milestones) を正**とする。

---

## 現行 npm

**`@b4moss/hyogen-md@0.10.1`**（`app/package.json` を正）。詳細: [specs/distribution.md](./specs/distribution.md)。

---

## 完了（v0.1.0 — v0.10.x）

| 版 | 要約 | 詳細 |
|----|------|------|
| v0.1.0 — v0.8.0 | ライブラリコア | [_archived/roadmap/](./_archived/roadmap/) |
| v0.9.0 — v0.9.2 | Playground 基盤・outDir `_` 除外・空行改善 | 同上 / [specs/playground.md](./specs/playground.md) / [pipeline.md](./specs/pipeline.md) |
| v0.10.0 | Playground UX + npm 初回公開 | [_archived/roadmap/v0.10.0.md](./_archived/roadmap/v0.10.0.md) |
| v0.10.0-docs | リポジトリ整備・GitHub Pages | [_archived/roadmap/v0.10.0-docs.md](./_archived/roadmap/v0.10.0-docs.md) |
| v0.10.0-docs.5 — 8 | ドキュメントサイト + Playground 内包 | [specs/docs-site.md](./specs/docs-site.md) |

---

## 予定（優先順）

| Milestone | 内容 |
|-----------|------|
| [v0.11.0](https://github.com/b4moss/hyogen-md/milestone/1) | データソースのインポート（API） |
| [v0.12.0](https://github.com/b4moss/hyogen-md/milestone/3) | TOC 専用ヘルパ、許可プロパティ `.length`、`echo` 本文展開 |
| [v0.13.0](https://github.com/b4moss/hyogen-md/milestone/4) | 許可メソッド追加（`.slice` 等）、見出し階層適合（[#50](https://github.com/b4moss/hyogen-md/issues/50)） |
| [Until v1.0.0](https://github.com/b4moss/hyogen-md/milestone/2) | v1.0.0 までの横断タスク |
| [After v1.0.0](https://github.com/b4moss/hyogen-md/milestone/5) | v1.0.0 以降に検討 |

---

## 運用メモ

| 項目 | 内容 |
|------|------|
| 追加機能 | GitHub Issue 起票 → Milestone 割当。実装完了後 [specs/](./specs/) を更新 |
| テスト | [charter/tdd.md](./charter/tdd.md) + [specs/development.md](./specs/development.md)。入力は `app/test/specs/` |
| ブランチ | `feat/*` → `dev-vX.Y.Z` → `develop` → `main` → `release` → [specs/repository.md](./specs/repository.md) |
| docs トラック | `v0.10.0-docs.n`（npm 非連動） |
| 完了版 | チェックリストは [_archived/roadmap/](./_archived/roadmap/) へ |

---

以上
