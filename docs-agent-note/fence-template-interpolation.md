# Agent note: fence `${}` interpolation (#125)

状態: 実装済み（ブランチ）。正本への転記は **main 側**で行うこと。

## 転記先

- `docs/specs/variables.md` — 本文バインディングに「コードフェンス内 `${}`」節を追加
- `docs/specs/pipeline.md` — `{{ }}` の直後にフェンス `${}` ステップを明記
- `docs/specs/dsl.md` — 「コードフェンス内の HTML コメント」付近で、フェンス内 `${}` は展開・`@hg` は無視と対比

## 転記用文言（案）

### variables.md

```markdown
### コードフェンス内の `${}`

コードフェンス（`` ``` `` / `~~~`）内では、JS テンプレートリテラルと同型の `${expr}` を展開する。

- 式の意味は `@hg` テンプレートリテラル内 `${}` と同じ（許可式のみ、`.toLocaleString` / `.length` 可、component 呼び出し不可）
- フェンス外の `${…}` はリテラルのまま
- `\${` は展開しない
- `{{ }}` / `{{{ }}}` とは別系統（マスタッシュの挙動は変更しない）
```

### pipeline.md

`{{ }}` 評価の直後・TOC 展開の前に「コードフェンス内 `${}` 展開」を 1 ステップ追加する。

### dsl.md

コードフェンス節に追記: hyogen ブロックは無視するが、本文の `${expr}` は上記 variables 規則で展開する。

## 実装箇所

- `app/src/expr/interpolateFenceExpressions.ts`
- `app/src/pipeline/renderDocument.ts`（`interpolateExpressions` 直後）
- `app/src/control/expandControlStructures.ts`（each 本体、同様）
- テスト仕様: `app/test/specs/v0.14.0.md`
- テスト: `app/test/expr/interpolateFenceExpressions.test.ts`, `app/test/pipeline/renderDocument.v0.14.test.ts`

----

以上
