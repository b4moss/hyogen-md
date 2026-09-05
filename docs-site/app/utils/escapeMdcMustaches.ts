/**
 * Escape `{{` / `}}` so Nuxt Content MDC does not treat them as bindings,
 * while leaving fenced and inline code untouched so they render/copy correctly.
 *
 * YAML front matter is also left alone (descriptions may mention `{{ }}`).
 */
export function escapeMdcMustaches(body: string): string {
  if (!body) return body

  let prefix = ''
  let content = body
  if (body.startsWith('---')) {
    const end = body.indexOf('\n---', 3)
    if (end !== -1) {
      const closeEnd = end + 4 // \n---
      prefix = body.slice(0, closeEnd)
      content = body.slice(closeEnd)
    }
  }

  // Split on fenced code blocks first, then protect inline code in prose segments.
  const fencedParts = content.split(/(```[\s\S]*?```)/g)
  const escaped = fencedParts
    .map((part, i) => {
      if (i % 2 === 1) return part
      return part
        .split(/(`[^`]*`)/g)
        .map((seg, j) => {
          if (j % 2 === 1) return seg
          return seg.replaceAll('{{', '&#123;&#123;').replaceAll('}}', '&#125;&#125;')
        })
        .join('')
    })
    .join('')

  return prefix + escaped
}
