# Highlighter

hyogen 向けシンタックスハイライト定義。Issue [#111](https://github.com/b4moss/hyogen-md/issues/111)。

## 方針

- リポジトリ内パッケージ `highlighter/`（**npm 非公開**）
- 共通 DSL（`highlighter/dsl/hyogen.yml`）を正本とし、codegen で各エンジンへ展開
- **厳密な hyogen トークン**（JS 近似パーサは使わない）
- Playground（CodeMirror 6）は生成仕様＋トークン分類を消費する

## 成果物

| エンジン | 生成パス |
|----------|----------|
| TextMate / Shiki | `highlighter/generated/textmate/hyogen.tmLanguage.json` |
| Prism.js | `highlighter/generated/prism/hyogen.js` |
| highlight.js | `highlighter/generated/highlightjs/hyogen.js` |
| CodeMirror 6 | `highlighter/generated/codemirror/hyogenSpec.ts` |
| Monaco | `highlighter/generated/monaco/hyogen.monarch.json` |

再生成: `make generate-hl`（または `npm --prefix highlighter run generate`）

## 埋め込み規則

- フェンス外の `@hg`…`@endhg` / `@@`…`@@` / `{{ }}` / `{{{ }}}` のみ
- 未閉じブロックはハイライト対象外（drop）
- 予約語は `app/src/logic/reservedWords.ts` と一致（`else if` / `toc` は highlighter 追加語）

## Playground

- `docs-site/.../hyogenMarkdown.ts` は Markdown ＋厳密トークン装飾
- 領域検出は `highlighter/src/findHyogenRegions.ts` を再エクスポート

## テスト

- テスト仕様: [`app/test/specs/v0.14.0.md`](../../app/test/specs/v0.14.0.md)
- 実行: `make test-hl` / `make test-pg`
