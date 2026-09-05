/**
 * Markdown heading helpers for include/component hierarchy shifting.
 * ATX + Setext; code fences (``` / ~~~) are excluded.
 */

export type FenceState = {
  active: boolean;
  marker: "`" | "~" | null;
  length: number;
};

const SETEXT_UNDERLINE = /^( {0,3})(=+|-+)[ \t]*$/;
const FENCE_OPEN = /^( {0,3})(`{3,}|~{3,})(.*)$/;

function isSpaceOrTab(ch: string | undefined): boolean {
  return ch === " " || ch === "\t";
}

/**
 * Parse an ATX heading line without nested quantifiers (CodeQL js/polynomial-redos).
 * Supports optional 0–3 space indent, bare hashes, and optional closing `#` sequence.
 */
function parseAtxHeadingLine(
  line: string,
): { indent: string; level: number; text: string } | null {
  let i = 0;
  while (i < line.length && i < 3 && line[i] === " ") {
    i += 1;
  }
  const indent = line.slice(0, i);

  let level = 0;
  while (i < line.length && level < 6 && line[i] === "#") {
    level += 1;
    i += 1;
  }
  if (level === 0) {
    return null;
  }
  // More than 6 leading `#` is not an ATX heading (CommonMark).
  if (level === 6 && i < line.length && line[i] === "#") {
    return null;
  }

  if (i >= line.length) {
    return { indent, level, text: "" };
  }
  // e.g. `#foo` without space — not a heading in CommonMark
  if (!isSpaceOrTab(line[i])) {
    return null;
  }

  while (i < line.length && isSpaceOrTab(line[i])) {
    i += 1;
  }

  let end = line.length;
  while (end > i && isSpaceOrTab(line[end - 1])) {
    end -= 1;
  }

  // Optional closing sequence: [ \t]+#+
  let textEnd = end;
  if (end > i && line[end - 1] === "#") {
    let hashStart = end - 1;
    while (hashStart > i && line[hashStart - 1] === "#") {
      hashStart -= 1;
    }
    if (hashStart > i && isSpaceOrTab(line[hashStart - 1])) {
      let ws = hashStart - 1;
      while (ws >= i && isSpaceOrTab(line[ws])) {
        ws -= 1;
      }
      textEnd = ws + 1;
    }
  }

  return { indent, level, text: line.slice(i, textEnd) };
}

export function createFenceState(): FenceState {
  return { active: false, marker: null, length: 0 };
}

/** Update fence state for a single line; returns whether the line is inside a fence (including fence markers). */
export function consumeFenceLine(state: FenceState, line: string): boolean {
  const match = FENCE_OPEN.exec(line);
  if (!state.active) {
    if (match) {
      const fence = match[2]!;
      state.active = true;
      state.marker = fence[0] as "`" | "~";
      state.length = fence.length;
      return true;
    }
    return false;
  }

  // Inside fence: closing requires same char and at least open length, no info string
  if (match) {
    const fence = match[2]!;
    const info = (match[3] ?? "").trim();
    if (
      fence[0] === state.marker &&
      fence.length >= state.length &&
      info.length === 0
    ) {
      state.active = false;
      state.marker = null;
      state.length = 0;
    }
  }
  return true;
}

export function parseAtxHeadingLevel(line: string): number | null {
  const parsed = parseAtxHeadingLine(line);
  return parsed ? parsed.level : null;
}

export function parseSetextUnderlineLevel(line: string): number | null {
  const match = SETEXT_UNDERLINE.exec(line);
  if (!match) {
    return null;
  }
  return match[2]![0] === "=" ? 1 : 2;
}

function isBlankLine(line: string): boolean {
  for (let i = 0; i < line.length; i++) {
    if (!isSpaceOrTab(line[i])) {
      return false;
    }
  }
  return true;
}

function looksLikeSetextContent(line: string): boolean {
  if (isBlankLine(line)) {
    return false;
  }
  if (parseAtxHeadingLevel(line) !== null) {
    return false;
  }
  if (FENCE_OPEN.test(line)) {
    return false;
  }
  // Indented code (4 spaces) — skip as setext content
  if (line.startsWith("    ") || line.startsWith("\t")) {
    return false;
  }
  return true;
}

/**
 * Return the heading level of the nearest heading before the end of `prefix`.
 * Returns 0 when none found.
 */
export function findPrecedingHeadingLevel(prefix: string): number {
  const lines = prefix.split("\n");
  const fence = createFenceState();
  let lastLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (consumeFenceLine(fence, line)) {
      continue;
    }

    const atx = parseAtxHeadingLevel(line);
    if (atx !== null) {
      lastLevel = atx;
      continue;
    }

    const setext = parseSetextUnderlineLevel(line);
    if (setext !== null && i > 0) {
      const prev = lines[i - 1]!;
      // Previous line must not have been inside fence; we skipped fence lines.
      // Also previous must be setext-capable content and not itself an underline-only blank.
      if (looksLikeSetextContent(prev)) {
        lastLevel = setext;
      }
    }
  }

  return lastLevel;
}

function clampHeadingLevel(level: number): number {
  if (level < 1) {
    return 1;
  }
  if (level > 6) {
    return 6;
  }
  return level;
}

function toAtxHeading(level: number, text: string): string {
  const trimmed = text.trim();
  const marks = "#".repeat(clampHeadingLevel(level));
  return trimmed.length === 0 ? marks : `${marks} ${trimmed}`;
}

/**
 * Shift all headings in `markdown` by `shift` levels (clamped to 6).
 * Setext headings are normalized to ATX when shift is applied (shift > 0).
 * When shift <= 0, returns markdown unchanged.
 */
export function shiftMarkdownHeadings(markdown: string, shift: number): string {
  if (shift <= 0 || markdown.length === 0) {
    return markdown;
  }

  const lines = markdown.split("\n");
  const fence = createFenceState();
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (consumeFenceLine(fence, line)) {
      out.push(line);
      continue;
    }

    // Setext: content + underline → single ATX line
    const setext = parseSetextUnderlineLevel(line);
    if (setext !== null && out.length > 0) {
      const prev = out[out.length - 1]!;
      if (looksLikeSetextContent(prev)) {
        out[out.length - 1] = toAtxHeading(setext + shift, prev);
        // drop underline
        continue;
      }
    }

    const atx = parseAtxHeadingLine(line);
    if (atx !== null) {
      out.push(atx.indent + toAtxHeading(atx.level + shift, atx.text));
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}
