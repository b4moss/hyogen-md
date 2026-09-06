# 配布・公開

npm パッケージとリポジトリ公開の決定事項。運用フローは [repository.md](./repository.md)。

---

## npm

| 項目 | 方針 |
|------|------|
| パッケージ名 | **`@b4moss/hyogen-md`** |
| 公開物 | `app/dist` のみ（Playground・docs-site は **非同梱**） |
| ライセンス | MIT |
| 初回公開 | **v0.10.0 済み** |
| 現行版 | **`app/package.json` を正**（執筆時点: **0.13.0**） |
| tag ↔ version | **一致**させる |
| publish | **`release` ブランチ** merge → CD（Trusted Publishing / OIDC） |
| 公開前 | `build` / `test` / `npm pack --dry-run` |

---

## リポジトリ・ドキュメント

| 項目 | 方針 |
|------|------|
| 公開 GitHub | **`b4moss/hyogen-md`**（homepage） |
| README | 英語 `README.md` を根と `app/README.md` で同期。日本語 `README_ja.md` |
| CHANGELOG | `user-docs/changelog.md`（日本語: `changelog_ja.md`） |
| メンテナー向け spec | **`docs/` 日本語** |
| 利用者向け | ドキュメントサイト + README + `user-docs/` |
| docs トラック | **`v0.10.0-docs.n`**（npm version は上げない） |

---

## 表記

- 製品名: **`hyogen.md`**
- パス・npm・Git 名: **`hyogen-md`**

----

以上
