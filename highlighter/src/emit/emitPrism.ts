import type { HighlighterIr } from "../types.ts";
import { normalizeTokenCategories } from "../normalizeTokenCategories.ts";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Emit a Prism.js language definition module. */
export function emitPrism(ir: HighlighterIr): string {
  const cats = normalizeTokenCategories(ir);
  const keywordPattern = cats.keywords
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((kw) => escapeRegExp(kw).replace(/ /g, "\\s+"))
    .join("|");

  const markerPattern = [
    escapeRegExp(ir.markers.blockOpen) + "\\b",
    escapeRegExp(ir.markers.blockClose) + "\\b",
    escapeRegExp(ir.markers.short),
  ].join("|");

  return `/* Generated from highlighter/dsl — do not edit by hand. */
(function (Prism) {
  Prism.languages.hyogen = {
    comment: [
      { pattern: /${escapeRegExp(ir.comments.line)}.*/, greedy: true },
      { pattern: /${escapeRegExp(ir.comments.blockOpen)}[\\s\\S]*?${escapeRegExp(ir.comments.blockClose)}/, greedy: true },
    ],
    marker: { pattern: /${markerPattern}/, alias: "keyword" },
    string: {
      pattern: /"(?:\\\\.|[^\\\\"])*"|'(?:\\\\.|[^\\\\'])*'|\`(?:\\\\.|[^\\\\\`])*\`/,
      greedy: true,
    },
    number: /\\b\\d+(?:\\.\\d+)?\\b/,
    keyword: /\\b(?:${keywordPattern})\\b/,
    operator: /${cats.operators.map(escapeRegExp).join("|")}/,
    punctuation: /[${escapeRegExp(cats.punctuation.join(""))}]/,
  };
})(typeof Prism !== "undefined" ? Prism : { languages: {} });
`;
}
