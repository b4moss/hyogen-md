import type { HighlighterIr } from "../types.ts";
import { normalizeTokenCategories } from "../normalizeTokenCategories.ts";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Emit TextMate / Shiki grammar JSON text. */
export function emitTextMate(ir: HighlighterIr): string {
  const cats = normalizeTokenCategories(ir);
  const single = cats.singleWordKeywords.map(escapeRegExp).join("|");
  const multi = cats.multiWordKeywords
    .map((kw) => escapeRegExp(kw).replace(/ /g, "\\s+"))
    .join("|");

  const keywordMatch = multi
    ? `\\b(?:${multi}|${single})\\b`
    : `\\b(?:${single})\\b`;

  const grammar = {
    name: "Hyogen",
    scopeName: "source.hyogen",
    patterns: [{ include: "#hyogen" }],
    repository: {
      hyogen: {
        patterns: [
          { include: "#comments" },
          { include: "#markers" },
          { include: "#strings" },
          { include: "#numbers" },
          { include: "#keywords" },
          { include: "#operators" },
        ],
      },
      comments: {
        patterns: [
          {
            name: "comment.line.double-slash.hyogen",
            match: `${escapeRegExp(ir.comments.line)}.*$`,
          },
          {
            name: "comment.block.hyogen",
            begin: escapeRegExp(ir.comments.blockOpen),
            end: escapeRegExp(ir.comments.blockClose),
          },
        ],
      },
      markers: {
        patterns: [
          {
            name: "keyword.control.hyogen.marker",
            match: `${escapeRegExp(ir.markers.blockOpen)}\\b|${escapeRegExp(ir.markers.blockClose)}\\b|${escapeRegExp(ir.markers.short)}`,
          },
        ],
      },
      strings: {
        patterns: [
          {
            name: "string.quoted.double.hyogen",
            begin: "\"",
            end: "\"",
            patterns: [{ name: "constant.character.escape.hyogen", match: "\\\\." }],
          },
          {
            name: "string.quoted.single.hyogen",
            begin: "'",
            end: "'",
            patterns: [{ name: "constant.character.escape.hyogen", match: "\\\\." }],
          },
          {
            name: "string.quoted.other.hyogen",
            begin: "`",
            end: "`",
            patterns: [{ name: "constant.character.escape.hyogen", match: "\\\\." }],
          },
        ],
      },
      numbers: {
        name: "constant.numeric.hyogen",
        match: "\\b\\d+(?:\\.\\d+)?\\b",
      },
      keywords: {
        name: "keyword.control.hyogen",
        match: keywordMatch,
      },
      operators: {
        name: "keyword.operator.hyogen",
        match: cats.operators.map(escapeRegExp).join("|"),
      },
    },
  };

  return `${JSON.stringify(grammar, null, 2)}\n`;
}
