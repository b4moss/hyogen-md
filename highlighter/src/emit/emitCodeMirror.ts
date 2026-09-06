import type { HighlighterIr } from "../types.ts";
import { normalizeTokenCategories } from "../normalizeTokenCategories.ts";

/**
 * Emit a CodeMirror-oriented module:
 * - baked keyword lists
 * - StreamLanguage-friendly token table
 * Consumers (Playground) import this for strict hyogen highlighting.
 */
export function emitCodeMirror(ir: HighlighterIr): string {
  const cats = normalizeTokenCategories(ir);
  const payload = {
    name: ir.name,
    version: ir.version,
    markers: ir.markers,
    reservedWords: ir.reservedWords,
    keywords: cats.keywords,
    multiWordKeywords: cats.multiWordKeywords,
    singleWordKeywords: cats.singleWordKeywords,
    comments: ir.comments,
    operators: ir.operators,
    punctuation: ir.punctuation,
  };

  return `/* Generated from highlighter/dsl — do not edit by hand. */
export const hyogenCodeMirrorSpec = ${JSON.stringify(payload, null, 2)} as const;

export type HyogenCodeMirrorSpec = typeof hyogenCodeMirrorSpec;
`;
}
