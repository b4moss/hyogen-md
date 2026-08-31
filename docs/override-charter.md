# このプロジェクト独自のルール（憲章をオーバーライドする範囲）

[charter/](./charter/) の内容より **本ファイルを優先**する。PO が必要に応じて追記・改訂する。

---

## Git ブランチ（[git-rule.md](./charter/git-rule.md) への差分）

| 項目 | 憲章 | hyogen-md |
|------|------|-----------|
| フィーチャーブランチ | `feat-*` | **`feat/*`**（スラッシュ区切り） |
| `staging` / `production` | 必要に応じて用意 | **採用しない**。npm は **`release`**、サイトは **`main`** push で CD |
| `main` への直接マージ | 原則禁止 | **docs・README・導線のみ**例外可 → [specs/repository.md](./specs/repository.md) |
| force push 許可 | PO | **`@kohki-shikata`**（`main` のみ） |

---

## バージョン（[versioning-rule.md](./charter/versioning-rule.md) への差分）

- ライブラリ本体は SemVer（[roadmap.md](./roadmap.md)）。
- **docs トラック** **`v0.10.0-docs.n`**（npm 非連動）。
- npm 公開は **`release`** merge → CD。

---

## ドキュメント配置（[doc-rule.md](./charter/doc-rule.md) への差分）

| 項目 | 憲章 | hyogen-md |
|------|------|-----------|
| テスト仕様 | `docs/tests/` | **`app/test/specs/`** |
| 未実装・追加機能 | `docs/plans/` | **GitHub Issues / Milestones**（`docs/plans/README.md` は索引のみ） |
| アーカイブ | `docs/_archived/` | **`docs/_archived/`** |
| 薄い DDD | Web/デスクトップは必須 | CRUD Trait **不要可**（CLI パッケージ） |

`docs/` ルートは [charter/doc-rule.md](./charter/doc-rule.md) に従う。**未実装・追加機能は GitHub Issues が正**。

---

## リモート

- 公開 OSS 正本: **`github`**（`b4moss/hyogen-md`）
- 憲章: **`charter`** remote → `charter/docs` をマージ（[specs/repository.md](./specs/repository.md)）

-----

以上
