# 配布・公開

npm パッケージとリポジトリ公開の決定事項。運用フローは [repository.md](./repository.md)。

---

## npm

| 項目 | 方針 |
|------|------|
| パッケージ名 | **`@b4moss/hyogen-md`** |
| Node | **`>=24`**（`app/package.json` `engines`） |
| 公開物 | `dist/`（ソースマップ除外）+ `LICENSE` + `README.md` + `README_ja.md`。Playground・docs-site・highlighter は **非同梱** |
| ライセンス | MIT |
| 初回公開 | **v0.10.0 済み** |
| 現行版 | **`app/package.json` を正**（執筆時点: **0.14.0**） |
| tag ↔ version | **一致**させる |
| publish | **`release` ブランチ** merge → CD（Trusted Publishing / OIDC） |
| 公開前 | `build` / `test` / `npm pack --dry-run` |

### パッケージ表面

| 項目 | 値 |
|------|-----|
| `bin` | `hyogen-md` → `./dist/cli.js` |
| `exports["."]` | メイン（`renderServer` / `build` 等） |
| `exports["./client"]` | ブラウザ向け（`renderClient` 等） |
| `exports["./config"]` | `defineConfig` / `loadConfig` / `resolveConfigPath` |

詳細 API: [api.md](./api.md) / CLI: [cli.md](./cli.md)。

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
| highlighter | リポジトリ内 `highlighter/`（npm 非公開。engines は別途 `>=22` 可） |

---

## 表記

- 製品名: **`hyogen.md`**
- パス・npm・Git 名: **`hyogen-md`**

----

以上
