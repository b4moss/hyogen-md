---
title: Methods
description: Allowed method calls and properties in hyogen.md expressions.
---

# Methods

Method calls in `{{ }}` and `@hg` expressions are restricted to a small whitelist. Arbitrary chaining (`.map`, `.trim`, etc.) is not allowed.

## toLocaleString

The only permitted **method** is `.toLocaleString(...)`. Arguments follow JavaScript conventions — the library does not validate them.

```markdown
<!--
@hg
const population = 2825000
@endhg
-->

Population: {{ population.toLocaleString('en-US') }}
```

Output:

```markdown
Population: 2,825,000
```

Works on component props too:

```markdown
{{ population.toLocaleString('ja-JP') }}
```

## Allowed property: `.length`

`.length` is an allowed **property** (not a method). It returns the element count for arrays and the character count for strings.

```markdown
<!--
@hg
const items = [1, 2, 3]
const label = "abcd"
@endhg
-->

{{ items.length }} / {{ label.length }}
```

Output:

```markdown
3 / 4
```

`length()` with parentheses is **not** allowed (`parse_error`).

## Template literals

`.toLocaleString` and `.length` are also allowed inside `` `${…}` `` in `@hg` blocks:

```markdown
<!--
@hg
const n = 1000
const label = `count: ${n.toLocaleString()}`
@endhg
-->
```

## Function calls

The only callable functions are **registered components** (`component … as name`):

```markdown
{{ cityItem({ city: "Osaka", population: 2825000 }) }}
```

There are no built-in functions beyond registered components.

## Not allowed

```markdown
{{ items.map(x => x.name) }}   <!-- parse_error -->
{{ text.trim() }}              <!-- parse_error -->
{{ items.slice(0) }}           <!-- parse_error -->
{{ items.length() }}           <!-- parse_error -->
{{ Math.max(a, b) }}           <!-- parse_error -->
```

Use `@hg` declarations, `echo`, or component templates to prepare values instead.

## Related

- [Expressions](/en/syntax/expressions)
- [Hyogen blocks](/en/syntax/hg-blocks) (`echo`)
- [Includes and components](/en/syntax/includes)
