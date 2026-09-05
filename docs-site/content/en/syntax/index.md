---
title: Template Syntax
description: hyogen.md template syntax — expressions, blocks, includes, and control flow.
---

# Template Syntax

hyogen.md extends Markdown with HTML-comment directives and Mustache-style expressions. Everything below is available in **@b4moss/hyogen-md@0.10.0**.

## Two layers

| Layer | Where | What you can write |
|-------|-------|-------------------|
| **Expressions** | `{{ }}` / `{{{ }}}` in Markdown body | Expressions only — no statements |
| **Logic blocks** | `<!-- @hg … @endhg -->` or `<!--@@ … @@-->` | Declarations, includes, `if` / `each`, and more |

## Topics

### Data and output

- [Front matter](/en/syntax/front-matter) — YAML metadata and component props
- [Expressions](/en/syntax/expressions) — `{{ }}`, defaults, ternary
- [Methods](/en/syntax/methods) — `.toLocaleString`, allowed property `.length`

### Blocks and directives

- [Hyogen blocks](/en/syntax/hg-blocks) — `@hg` / `@endhg` and `@@` shorthand
- [Declarations](/en/syntax/declarations) — `const`, `let`, reassignment
- [Includes and components](/en/syntax/includes) — `include`, `component … as`, `extend` + `block`
- [Control flow](/en/syntax/control-flow) — `if` / `else` / `each`
- [TOC helper](/en/syntax/toc) — `toc` / `toc(N)` table of contents

### Safety

- [Paths and security](/en/syntax/paths-and-security) — `.doc_root`, `_` partials, XSS notes

## Minimal example

```markdown
---
title: Greeting
---

# {{ title }}

<!--
@hg
const name = "world"
@endhg
-->

Hello {{ name | "stranger" }}!
```

Rendered:

```markdown
# Greeting

Hello world!
```

Try it in the [Playground](/playground).
