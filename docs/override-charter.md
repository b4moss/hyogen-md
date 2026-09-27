# このプロジェクト独自のルール（憲章をオーバーライドする範囲）

[charter/](./charter/) の内容より **本ファイルを優先**する。PO が必要に応じて追記・改訂する。

憲章の取り込み元: [b4moss/charter](https://github.com/b4moss/charter) **v1.2.0**（`main` の `docs/` / OKF v0.1）。

---

## Git ブランチ（[git-rule.md](./charter/git-rule.md) への差分）

| 項目 | 憲章 | hyogen-md |
|------|------|-----------|
| フィーチャーブランチ | `feat-*` | **`feat/*`**（スラッシュ区切り） |
| `staging` / `production` | 必要に応じて用意 | **採用しない**。npm は **`release`**、サイトは **`doc-site`** push で CD |
| CI ゲート | 昇格 PR でも CI | **`dev-v*` 向け PR**（および **`hotfix/*` → `main`**）のみ。`develop` / `main` / `release` への通常昇格では CI を再実行しない |
| `dev-v*` への直接 push | （憲章に明記なし） | **禁止**（PR 経由のみ。Ruleset 強制は PO が管理画面で後日） |
| `main` への直接マージ | 原則禁止 | **npm 同梱 README・配布導線のみ**例外可。サイト公開は **`doc-site`** → [specs/repository.md](./specs/repository.md) |
| force push 許可 | PO | **`@kohki-shikata`**（`main` のみ） |

---

## バージョン（[versioning-rule.md](./charter/versioning-rule.md) への差分）

- ライブラリ本体は SemVer（[roadmap.md](./roadmap.md)）。
- **docs トラック** **`v0.10.0-docs.n`**（npm 非連動）。
- npm 公開は **`release`** merge → CD。

---

## ドキュメント配置（[doc-rule.md](./charter/doc-rule.md) / [OKF](./charter/okf/) への差分）

| 項目 | 憲章（OKF v0.1） | hyogen-md |
|------|------------------|-----------|
| pillar | `docs/README.md` | **`docs/README.md`**（旧 `main.md`） |
| テスト仕様 | `docs/tests/{domain}/`（SemVer フォルダ禁止） | **ドメイン索引は `docs/tests/`**。版別の詳細 TDD 入力はこれまでどおり **`app/test/specs/vX.Y.Z.md`**（アプリテストの書き換えはしない） |
| specs | ドメイン別 | **ドメイン単位のフラットファイル**（`specs/{domain}.md`）。サブフォルダ化は任意 |
| 未実装・追加機能 | `docs/plans/` | **GitHub Issues / Milestones**（`docs/plans/README.md` は索引のみ） |
| アーカイブ | `docs/_archived/` | **`docs/_archived/`** |
| 薄い DDD | Web/デスクトップは必須 | CRUD Trait **不要可**（CLI パッケージ） |

`docs/` ルートは [charter/doc-rule.md](./charter/doc-rule.md) と [charter/okf/](./charter/okf/) に従う。**未実装・追加機能は GitHub Issues が正**。

---

## リモート

- 公開 OSS 正本: **`github`**（`b4moss/hyogen-md`）
- 憲章: **`charter`** remote → **`charter/main`** の `docs/` を取り込む（[specs/repository.md](./specs/repository.md)）。かつての `docs` 専用ブランチは使わない

-----

以上
