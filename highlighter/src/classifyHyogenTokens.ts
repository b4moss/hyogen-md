import type { HighlighterIr, HyogenToken, TokenType } from "./types.ts";
import { normalizeTokenCategories } from "./normalizeTokenCategories.ts";

export type ClassifyMode = "block" | "mustache";

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentPart(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}

/**
 * Classify hyogen block body or mustache inner text into tokens.
 * Unclosed strings extend to EOF (locked behavior).
 * Unknown glyphs become punctuation fallbacks and never throw.
 */
export function classifyHyogenTokens(
  source: string,
  ir: HighlighterIr,
  mode: ClassifyMode = "block",
): HyogenToken[] {
  if (!source) return [];

  const cats = normalizeTokenCategories(ir);
  const multi = [...cats.multiWordKeywords].sort((a, b) => b.length - a.length);
  const singles = new Set(cats.singleWordKeywords);
  const ops = [...cats.operators].sort((a, b) => b.length - a.length);
  const punct = new Set(cats.punctuation);
  const tokens: HyogenToken[] = [];

  let i = 0;
  while (i < source.length) {
    const ch = source[i]!;

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (source.startsWith(cats.comments.line, i)) {
      let j = i + cats.comments.line.length;
      while (j < source.length && source[j] !== "\n") j += 1;
      tokens.push({ from: i, to: j, type: "comment" });
      i = j;
      continue;
    }

    if (source.startsWith(cats.comments.blockOpen, i)) {
      let j = i + cats.comments.blockOpen.length;
      const close = cats.comments.blockClose;
      while (j < source.length && !source.startsWith(close, j)) j += 1;
      if (j < source.length) j += close.length;
      tokens.push({ from: i, to: j, type: "comment" });
      i = j;
      continue;
    }

    if (mode === "block") {
      const markerCandidates = [
        ir.markers.blockClose,
        ir.markers.blockOpen,
        ir.markers.short,
      ].sort((a, b) => b.length - a.length);
      let matchedMarker: string | null = null;
      for (const m of markerCandidates) {
        if (!source.startsWith(m, i)) continue;
        if (m.startsWith("@") && m !== "@@") {
          const next = source[i + m.length];
          if (next && isIdentPart(next)) continue;
        }
        matchedMarker = m;
        break;
      }
      if (matchedMarker) {
        tokens.push({ from: i, to: i + matchedMarker.length, type: "marker" });
        i += matchedMarker.length;
        continue;
      }
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < source.length) {
        if (source[j] === "\\") {
          j += 2;
          continue;
        }
        if (source[j] === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ from: i, to: j, type: "string" });
      i = j;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(source[i + 1] ?? ""))) {
      let j = i;
      while (j < source.length && /[0-9_]/.test(source[j]!)) j += 1;
      if (source[j] === "." && /[0-9]/.test(source[j + 1] ?? "")) {
        j += 1;
        while (j < source.length && /[0-9_]/.test(source[j]!)) j += 1;
      }
      tokens.push({ from: i, to: j, type: "number" });
      i = j;
      continue;
    }

    let hitMulti: string | null = null;
    for (const kw of multi) {
      if (!source.startsWith(kw, i)) continue;
      const beforeOk = i === 0 || !isIdentPart(source[i - 1]!);
      const after = source[i + kw.length];
      const afterOk = !after || !isIdentPart(after);
      if (beforeOk && afterOk) {
        hitMulti = kw;
        break;
      }
    }
    if (hitMulti) {
      tokens.push({ from: i, to: i + hitMulti.length, type: "keyword" });
      i += hitMulti.length;
      continue;
    }

    if (isIdentStart(ch)) {
      let j = i + 1;
      while (j < source.length && isIdentPart(source[j]!)) j += 1;
      const word = source.slice(i, j);
      const type: TokenType = singles.has(word) ? "keyword" : "identifier";
      tokens.push({ from: i, to: j, type });
      i = j;
      continue;
    }

    if (ch === "|" && source[i + 1] !== "|") {
      tokens.push({ from: i, to: i + 1, type: "pipe" });
      i += 1;
      continue;
    }

    let hitOp: string | null = null;
    for (const op of ops) {
      if (source.startsWith(op, i)) {
        hitOp = op;
        break;
      }
    }
    if (hitOp) {
      tokens.push({ from: i, to: i + hitOp.length, type: "operator" });
      i += hitOp.length;
      continue;
    }

    if (punct.has(ch)) {
      tokens.push({ from: i, to: i + 1, type: "punctuation" });
      i += 1;
      continue;
    }

    tokens.push({ from: i, to: i + 1, type: "punctuation" });
    i += 1;
  }

  return tokens;
}

/** Return keyword token texts found in source (for contract tests). */
export function keywordTexts(
  source: string,
  ir: HighlighterIr,
  mode: ClassifyMode = "block",
): string[] {
  return classifyHyogenTokens(source, ir, mode)
    .filter((t) => t.type === "keyword")
    .map((t) => source.slice(t.from, t.to));
}
