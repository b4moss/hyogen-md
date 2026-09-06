---
title: Expressions
description: "Mustache-style {{ }} expressions in hyogen.md."
---

# Expressions

Use `{{ expression }}` in Markdown body text to interpolate values. **Statements are not allowed** — only expressions.

## Variable reference

```markdown
Hello {{ name }}!
```

Member access and computed keys work like JavaScript:

```markdown
{{ user.name }}
{{ items[index] }}
```

## Default values (pipe)

Use `|` for fallback when the left side is falsy (`undefined`, `null`, `""`, `0`, `false`):

```markdown
{{ title | "Untitled" }}
{{ count | 0 }}
```

## Ternary operator

```markdown
{{ isNight ? "Dark" : "Light" }}
```

## Triple braces

`{{{ expression }}}` is supported. **Currently behaves the same as `{{ }}`** (no escaping). Reserved for a future escaping mode.

## Component calls

Registered components are called inside expressions:

```markdown
{{ cityItem({ city: "Osaka", population: 2825000 }) }}
```

See [Includes and components](/en/syntax/includes).

## Fence `${}` interpolation

Inside fenced code blocks (`` ``` `` / `~~~`), `${expr}` expands like a JavaScript template literal:

````markdown
```markdown
# ${title}
```
````

Rules:

- Same allowed expressions as `${}` inside `@hg` backtick strings (`.toLocaleString` / `.length` OK; **no** component calls)
- Outside fences, `${…}` stays literal
- Escape with `\${`
- Separate from Mustache `{{ }}` / `{{{ }}}` (those still expand inside fences)

See also [Hyogen blocks](/en/syntax/hg-blocks).

## What you cannot write

- Statements (`const`, `if`, loops)
- Arbitrary function calls (only registered components)
- Most method calls (only [`.toLocaleString`](/en/syntax/methods); property [`.length`](/en/syntax/methods) is allowed)

Logic belongs in `@hg` blocks. See [Hyogen blocks](/en/syntax/hg-blocks).

## Escaping

`{{ }}` does **not** HTML-escape output. Sanitize downstream if you render to HTML. Suspicious context values may emit warnings — see [Paths and security](/en/syntax/paths-and-security).
