import type { HighlighterIr } from "../types.ts";
import { normalizeTokenCategories } from "../normalizeTokenCategories.ts";

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Emit Monaco Monarch language definition JSON. */
export function emitMonaco(ir: HighlighterIr): string {
  const cats = normalizeTokenCategories(ir);
  const keywordAlt = [...cats.multiWordKeywords, ...cats.singleWordKeywords]
    .map((k) => escapeRe(k).replace(/ /g, "\\s+"))
    .join("|");
  const opAlt = cats.operators.map(escapeRe).join("|");

  const monarch = {
    name: "hyogen",
    keywords: cats.keywords,
    operators: cats.operators,
    tokenizer: {
      root: [
        [`\\b(?:${keywordAlt})\\b`, "keyword"],
        [`${escapeRe(ir.comments.line)}.*$`, "comment"],
        [escapeRe(ir.comments.blockOpen), "comment", "@comment"],
        ["@(?:hg\\b|endhg\\b)|@@", "marker"],
        ['"(?:\\\\.|[^\\\\"])*"', "string"],
        ["'(?:\\\\.|[^\\\\'])*'", "string"],
        ["\\d+(?:\\.\\d+)?", "number"],
        [opAlt, "operator"],
        ["[a-zA-Z_$][\\w$]*", "identifier"],
      ],
      comment: [
        [escapeRe(ir.comments.blockClose), "comment", "@pop"],
        [".", "comment"],
      ],
    },
  };

  return `${JSON.stringify(monarch, null, 2)}\n`;
}
