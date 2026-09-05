import { describe, expect, it } from 'vitest'
import { escapeMdcMustaches } from '../app/utils/escapeMdcMustaches'

describe('escapeMdcMustaches', () => {
  it('leaves inline code mustaches intact', () => {
    const input =
      '- [テンプレート構文](/ja/syntax) — `@hg` ブロックや `{{ }}` の書き方'
    expect(escapeMdcMustaches(input)).toBe(input)
  })

  it('leaves fenced code mustaches intact', () => {
    const input = ['```ts', "const result = await renderServer('# Hello {{ name }}', {", "  name: 'world',", '})', '```'].join(
      '\n',
    )
    expect(escapeMdcMustaches(input)).toBe(input)
  })

  it('escapes bare mustaches in prose', () => {
    expect(escapeMdcMustaches('See {{ name }} here.')).toBe(
      'See &#123;&#123; name &#125;&#125; here.',
    )
  })

  it('does not escape front matter', () => {
    const input = [
      '---',
      'title: Expressions',
      'description: "Mustache-style {{ }} expressions"',
      '---',
      '',
      'Use `{{ }}` in body.',
      '',
      'Bare {{ x }} outside code.',
    ].join('\n')

    const out = escapeMdcMustaches(input)
    expect(out).toContain('description: "Mustache-style {{ }} expressions"')
    expect(out).toContain('Use `{{ }}` in body.')
    expect(out).toContain('Bare &#123;&#123; x &#125;&#125; outside code.')
  })
})
