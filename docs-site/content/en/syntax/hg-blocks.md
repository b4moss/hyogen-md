---
title: Hyogen Blocks
description: HTML comment blocks with @hg and @@ shorthand syntax.
---

# Hyogen Blocks

hyogen.md logic lives inside HTML comments so Markdown previews stay clean.

## Standard form

```markdown
<!--
@hg
const greeting = "hello"
@endhg
-->
```

Variants that work equally:

```markdown
<!--@hg
const x = 1
@endhg-->
```

```markdown
<!--@hg /* one-line block */ @endhg-->
```

## Shorthand form

`@@` … `@@` is equivalent to `@hg` … `@endhg`:

```markdown
<!--@@
include ./partials/header.md
@@-->
```

```markdown
<!--@@ include ./partials/footer.md @@-->
```

Use `/* */` for inline comments in one-line blocks (not `//`, which ends at newline).


## echo

`echo <expr>` writes the expression result into the document by **replacing the enclosing `@hg` / `@@` comment**.

```markdown
<!--
@hg
const greet = "Hello world!"
echo greet
@endhg
-->
```

Output:

```markdown
Hello world!
```

You can declare in one block and echo in a shorthand block:

```markdown
<!--@hg
const greet = "Hello world!"
@endhg-->
<!--@@ echo greet @@-->
```

Multiple `echo` statements (including inside `for` / `do…while`) concatenate with no separator. `null` / `undefined` become an empty string (same as `{{ }}`).

## What goes inside

| Category | Examples |
|----------|----------|
| Declarations | `const`, `let`, reassignment |
| Output | `echo <expr>` — replace the block with the evaluated string |
| Includes | `include`, `component … as`, `extend` |
| Control flow | `if` / `else` / `each` (structural — wrap Markdown body) |
| Helpers | `toc` / `toc(N)` — see [TOC helper](/en/syntax/toc) |
| Loops | `for (…)`, `do … while` |

See [Declarations](/en/syntax/declarations), [Control flow](/en/syntax/control-flow), and [TOC helper](/en/syntax/toc).

## Code fences are ignored

Hyogen blocks inside fenced code blocks are **not** executed:

````markdown
```html
<!-- @hg const x = 1 @endhg -->
```
````

## Output preservation

By default, hyogen comment blocks are removed from output. Set `preserveHgComments: true` to keep them for debugging.

## JS comments inside blocks

```markdown
<!--
@hg

// line comment

/* block comment */

@endhg
-->
```
