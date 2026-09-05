import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

/**
 * Playground syntax colors via CSS variables on `.playground-root`
 * so light/dark themes switch without recreating the editor.
 */
const playgroundHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "var(--pg-hl-comment)", fontStyle: "italic" },
  { tag: t.lineComment, color: "var(--pg-hl-comment)", fontStyle: "italic" },
  { tag: t.blockComment, color: "var(--pg-hl-comment)", fontStyle: "italic" },
  { tag: t.docComment, color: "var(--pg-hl-comment)", fontStyle: "italic" },
  { tag: t.name, color: "var(--pg-hl-default)" },
  { tag: t.variableName, color: "var(--pg-hl-variable)" },
  { tag: t.propertyName, color: "var(--pg-hl-property)" },
  { tag: t.definition(t.variableName), color: "var(--pg-hl-variable)" },
  { tag: t.definition(t.propertyName), color: "var(--pg-hl-property)" },
  { tag: t.typeName, color: "var(--pg-hl-type)" },
  { tag: t.className, color: "var(--pg-hl-class)" },
  { tag: t.tagName, color: "var(--pg-hl-type)" },
  { tag: t.keyword, color: "var(--pg-hl-keyword)" },
  { tag: t.modifier, color: "var(--pg-hl-keyword)" },
  { tag: t.operator, color: "var(--pg-hl-operator)" },
  { tag: t.punctuation, color: "var(--pg-hl-punctuation)" },
  { tag: t.bracket, color: "var(--pg-hl-punctuation)" },
  { tag: t.number, color: "var(--pg-hl-number)" },
  { tag: t.string, color: "var(--pg-hl-string)" },
  { tag: t.special(t.string), color: "var(--pg-hl-string)" },
  { tag: t.regexp, color: "var(--pg-hl-regexp)" },
  { tag: t.meta, color: "var(--pg-hl-meta)" },
  { tag: t.link, color: "var(--pg-hl-link)", textDecoration: "underline" },
  { tag: t.url, color: "var(--pg-hl-link)" },
  { tag: t.heading, color: "var(--pg-hl-heading)", fontWeight: "bold" },
  { tag: t.heading1, color: "var(--pg-hl-heading)", fontWeight: "bold" },
  { tag: t.heading2, color: "var(--pg-hl-heading)", fontWeight: "bold" },
  { tag: t.heading3, color: "var(--pg-hl-heading)", fontWeight: "bold" },
  { tag: t.heading4, color: "var(--pg-hl-heading)", fontWeight: "bold" },
  { tag: t.heading5, color: "var(--pg-hl-heading)", fontWeight: "bold" },
  { tag: t.heading6, color: "var(--pg-hl-heading)", fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.strong, fontWeight: "bold" },
  { tag: t.monospace, color: "var(--pg-hl-code)" },
  { tag: t.processingInstruction, color: "var(--pg-hl-meta)" },
  { tag: t.atom, color: "var(--pg-hl-number)" },
  { tag: t.bool, color: "var(--pg-hl-keyword)" },
  { tag: t.null, color: "var(--pg-hl-keyword)" },
  { tag: t.literal, color: "var(--pg-hl-number)" },
  { tag: t.contentSeparator, color: "var(--pg-hl-punctuation)" },
]);

export function playgroundSyntaxHighlighting(): Extension {
  return syntaxHighlighting(playgroundHighlightStyle, { fallback: true });
}
