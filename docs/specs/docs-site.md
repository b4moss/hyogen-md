# ドキュメントサイト

利用者向け公式サイト。**Playground を内包**。npm には同梱しない。  
公開: **https://hyogenmd.oss.b4m.jp**（GitHub Pages、**`doc-site`** ブランチへの push で CD）。

---

## スタック

| 項目 | 方針 |
|------|------|
| パス | リポジトリ直下 `docs-site/` |
| フレームワーク | Nuxt + Nuxt Content |
| Playground | サイト内 `/playground`（[playground.md](./playground.md)） |
| hyogen-md | 開発時 alias で `app/` ソース |
| ホスティング | GitHub Actions → Pages（トリガ: **`doc-site`**）。独自ドメイン `docs-site/public/CNAME` |
| 言語 | `@nuxtjs/i18n` prefix（`/ja/…`、`/en/…`。`/` は locale redirect） |
| UI 殻 | b4moss/git-template `doc-site` 系（ヘッダー・accordion sidebar・gear prefs・pager） |

---

## コンテンツ（v0.12.0 時点）

正は [specs/](./) と [api.md](./api.md)。サイトは利用者向けの説明・例・索引。

- **API**: `renderServer` / `renderClient` / `build` / `dataSources`・`loadDataSources` / loader / 診断・型・エラーコード
- **構文**: front matter、変数、`@hg` / `@@`、制御構造、include / component / extend、許可メソッド（`.toLocaleString`）・許可プロパティ（`.length`）、`echo`、TOC ヘルパ（`toc` / `toc(N)`）、パス・セキュリティ注意
- **その他**: Install、Changelog 導線、GitHub / npm リンク

運用フローの正: [repository.md](./repository.md)。

---

## テーマ

`light` / `dark` / `system` の 3 択。ドキュメント UI と Playground で共有。`localStorage` 永続化。

---

## 関連

- 運用: [repository.md](./repository.md)
- Playground 詳細: [playground.md](./playground.md)

----

以上
