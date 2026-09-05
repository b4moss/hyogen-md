---
title: TOC ヘルパ
description: toc / toc(N) でページ見出しから Markdown の目次を生成する
---

# TOC ヘルパ

ページ内の見出しから **Markdown の目次（TOC）** を生成します。置きたい位置に `toc` または `toc(N)` を書きます。`include` / レイアウト / 制御構造 / `{{ }}` の評価が終わったあとに展開されます。

## 構文

次の形式はすべて等価です。

```markdown
<!--@@ toc(3) @@-->
```

```markdown
<!--
@hg
toc(3)
@endhg
-->
```

```markdown
<!--@hg toc(3) @endhg-->
```

引数を省略すると、見出しレベル h1〜h6 をすべて対象にします。

```markdown
<!--@@ toc @@-->
```

## 引数

| 項目 | 内容 |
|------|------|
| `N` | 整数 **1〜6**。対象とする見出しの最大レベル（例: `toc(3)` → h1〜h3） |
| 省略時 | h6 まで（全レベル） |
| 不正値 | **エラー**で中断（負数・小数・`0`・`7` 以上・非数値） |

## どの見出しが対象か

- **ATX**（`#` … `######`）と **Setext**（`===` / `---`）の見出し
- 引数 `N` で指定した最大レベル以内のみ
- 抽出元は `include` / `extend` / `component` / `if` / `each` / `{{ }}` 完了後の **最終 Markdown**

`if` / `each` で消えた見出しは一覧に出ません。同一ページに TOC を複数置いても、それぞれ独立に全文から生成します。

### 除外領域

次の領域 **内部** の見出しは対象外です。

- フェンス付きコードブロック（`` ``` `` / `~~~`）
- hyogen ブロック（`@hg` … `@endhg` / `@@` … `@@`）
- HTML コメント（`<!-- … -->`）

## 出力形式

- 見出しレベルに応じてインデントした Markdown リスト
- 各項目はアンカーリンク: `[テキスト](#anchor)`
- 見出しテキストはプレーン（`**bold**` などの装飾記号を除去）
- 該当見出しが 0 件のときは **空文字**（警告なし）

### アンカー ID

1. 明示 ID がある場合（例: `## Title {#my-id}`）→ `#my-id` を優先
2. それ以外 → **GitHub 互換**の自動生成（小文字化、空白→ハイフン、記号除去。重複時は `-1`, `-2`, …）

## 例

入力:

```markdown
# Page Title

<!--@@ toc(3) @@-->

## Section A

### Sub A-1

## Section B
```

出力（抜粋）:

```markdown
# Page Title

- [Page Title](#page-title)
- [Section A](#section-a)
  - [Sub A-1](#sub-a-1)
- [Section B](#section-b)

## Section A
...
```

## 関連

- [hyogen ブロック](/ja/syntax/hg-blocks) — `@hg` / `@@` の書き方
- [include と component](/ja/syntax/includes) — 取り込み先の見出しも対象
- [制御構造](/ja/syntax/control-flow) — `if` / `each` で残る見出しが変わる
