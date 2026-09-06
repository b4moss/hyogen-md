import type { HighlighterIr, TokenCategories } from "./types.ts";
import { HighlighterDslError } from "./errors.ts";

/** Split keywords into single-word vs multi-word and return normalized categories. */
export function normalizeTokenCategories(ir: HighlighterIr): TokenCategories {
  const singleWordKeywords: string[] = [];
  const multiWordKeywords: string[] = [];
  const seen = new Set<string>();

  for (const kw of ir.keywords) {
    if (!kw || typeof kw !== "string") {
      throw new HighlighterDslError("keywords", "empty string token is not allowed");
    }
    if (seen.has(kw)) {
      throw new HighlighterDslError("keywords", `duplicate entry '${kw}'`);
    }
    seen.add(kw);
    if (kw.includes(" ")) {
      multiWordKeywords.push(kw);
    } else {
      singleWordKeywords.push(kw);
    }
  }

  return {
    keywords: [...ir.keywords],
    multiWordKeywords,
    singleWordKeywords,
    comments: ir.comments,
    operators: [...ir.operators],
    punctuation: [...ir.punctuation],
    markers: ir.markers,
  };
}
