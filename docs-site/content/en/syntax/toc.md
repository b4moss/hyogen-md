---
title: TOC helper
description: Generate a Markdown table of contents from page headings with toc / toc(N).
---

# TOC helper

Insert a **Markdown table of contents** built from the document’s headings. Place `toc` or `toc(N)` where you want the list — hyogen expands it after includes, layouts, control flow, and `{{ }}` evaluation.

## Syntax

These forms are equivalent:

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

Omit the argument to include all heading levels (h1–h6):

```markdown
<!--@@ toc @@-->
```

## Argument

| Item | Detail |
|------|--------|
| `N` | Integer **1–6** — maximum heading level (e.g. `toc(3)` → h1–h3) |
| Omitted | All levels through h6 |
| Invalid | Error — stops render (negative, decimal, `0`, `7+`, non-numeric) |

## What headings are included

- **ATX** (`#` … `######`) and **Setext** (`===` / `---`) headings
- Only levels within the max level `N`
- Source is the **final Markdown** after `include` / `extend` / `component` / `if` / `each` / `{{ }}`

Headings that disappear under `if` / `each` are not listed. Multiple TOC directives on one page each generate a full TOC independently.

### Excluded regions

Headings inside these regions are ignored:

- Fenced code blocks (`` ``` `` / `~~~`)
- Hyogen blocks (`@hg` … `@endhg` / `@@` … `@@`)
- HTML comments (`<!-- … -->`)

## Output

- Nested Markdown list with anchor links: `[text](#anchor)`
- Heading text is plain (Markdown emphasis markers stripped)
- No matching headings → empty string (no warning)

### Anchor IDs

1. Explicit ID wins: `## Title {#my-id}` → `#my-id`
2. Otherwise **GitHub-compatible** slug (lowercase, spaces → hyphens, punctuation stripped; duplicates get `-1`, `-2`, …)

## Example

Input:

```markdown
# Page Title

<!--@@ toc(3) @@-->

## Section A

### Sub A-1

## Section B
```

Output (excerpt):

```markdown
# Page Title

- [Page Title](#page-title)
- [Section A](#section-a)
  - [Sub A-1](#sub-a-1)
- [Section B](#section-b)

## Section A
...
```

## Related

- [Hyogen blocks](/en/syntax/hg-blocks) — `@hg` / `@@` forms
- [Includes and components](/en/syntax/includes) — headings from included content
- [Control flow](/en/syntax/control-flow) — `if` / `each` affect which headings remain
