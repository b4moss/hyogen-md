---
title: 許可メソッド
description: 式で使えるメソッド呼び出しと許可プロパティ
---

# 許可メソッド

`{{ }}` 内および hyogen ブロック内の式で使えるメソッド呼び出しは、現時点では **`.toLocaleString(...)` のみ**です。

```markdown
{{ population.toLocaleString('ja-JP') }}
```

出力例: `2,825,000`

## 許可プロパティ: `.length`

`.length` は **許可プロパティ**です（メソッドではありません）。配列では要素数、文字列では文字数を返します。

```markdown
<!--
@hg
const items = [1, 2, 3]
const label = "abcd"
@endhg
-->

{{ items.length }} / {{ label.length }}
```

出力:

```markdown
3 / 4
```

括弧付きの `length()` は **不可**（`parse_error`）です。

## 引数

メソッド引数は **JavaScript に準拠**します。バリデーションは行いません。

```markdown
{{ price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
```

## テンプレートリテラル内

テンプレートリテラル `` `hello ${...}` `` の `${}` 内でも、許可された式が使えます。`.toLocaleString` と `.length` は **可**です。

```markdown
<!--@hg
const count = 1234567
const msg = `Total: ${count.toLocaleString('ja-JP')}`
@endhg-->

{{ msg }}
```

## 使えないメソッド

次のような一般的なメソッドは **使えません**:

- `.map()` / `.filter()` / `.reduce()`
- `.trim()` / `.slice()`
- `length()`（プロパティ `.length` は可）
- 任意のユーザー定義メソッド

配列操作が必要な場合は、hyogen ブロック内で `each` ループを使うか、context に整形済みの値を渡してください。

## 関数呼び出し

メソッド以外の関数呼び出しは、**component で登録した関数**（`component ... as name` の `name(...)`）のみ許可されています。ビルトイン関数は当面ありません。

## 関連

- [式と変数展開](/ja/syntax/expressions)
- [hyogen ブロック](/ja/syntax/hg-blocks)（`echo`）
- [include と component](/ja/syntax/includes)
