export type ExtractedHeading = {
  level: number;
  text: string;
  explicitId?: string;
};

const SETEXT_EQUALS = /^=+[ \t]*$/;
const SETEXT_DASHES = /^-+[ \t]*$/;
const FENCE_OPEN = /^(```|~~~)/;
const EXPLICIT_ID_TAIL = /\{#([A-Za-z][\w:.-]*)\}\s*$/;

type ScanState = {
  inFence: false | { marker: string };
  inHtmlComment: boolean;
};

/**
 * Parse trailing `{#id}` without nested quantifiers (CodeQL js/polynomial-redos).
 * Equivalent to `/^(.*?)\s*\{#([A-Za-z][\w:.-]*)\}\s*$/` but linear-time.
 */
function parseHeadingText(raw: string): {
  text: string;
  explicitId?: string;
} {
  const idMatch = EXPLICIT_ID_TAIL.exec(raw);
  if (idMatch && idMatch.index !== undefined) {
    return {
      text: raw.slice(0, idMatch.index).trim(),
      explicitId: idMatch[1]!,
    };
  }
  return { text: raw.trim() };
}

/**
 * Parse an ATX heading line without nested quantifiers (CodeQL js/polynomial-redos).
 * Equivalent to `/^(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/`.
 */
function parseAtxHeading(line: string): ExtractedHeading | null {
  let level = 0;
  while (level < line.length && level < 6 && line[level] === "#") {
    level += 1;
  }
  if (level === 0) {
    return null;
  }
  // More than 6 leading `#` is not an ATX heading (CommonMark).
  if (level === 6 && level < line.length && line[level] === "#") {
    return null;
  }
  if (level >= line.length || (line[level] !== " " && line[level] !== "\t")) {
    return null;
  }

  let textStart = level;
  while (
    textStart < line.length &&
    (line[textStart] === " " || line[textStart] === "\t")
  ) {
    textStart += 1;
  }
  if (textStart >= line.length) {
    return null;
  }

  let end = line.length;
  while (end > textStart && (line[end - 1] === " " || line[end - 1] === "\t")) {
    end -= 1;
  }

  // Optional closing sequence: [ \t]+#+
  let textEnd = end;
  if (end > textStart && line[end - 1] === "#") {
    let hashStart = end - 1;
    while (hashStart > textStart && line[hashStart - 1] === "#") {
      hashStart -= 1;
    }
    if (
      hashStart > textStart &&
      (line[hashStart - 1] === " " || line[hashStart - 1] === "\t")
    ) {
      let ws = hashStart - 1;
      while (ws >= textStart && (line[ws] === " " || line[ws] === "\t")) {
        ws -= 1;
      }
      textEnd = ws + 1;
    }
  }

  if (textEnd <= textStart) {
    return null;
  }

  const parsed = parseHeadingText(line.slice(textStart, textEnd));
  return { level, ...parsed };
}

function advanceHtmlComment(
  line: string,
  state: ScanState,
  startIndex: number,
): void {
  let i = startIndex;
  while (i < line.length) {
    if (!state.inHtmlComment) {
      const open = line.indexOf("<!--", i);
      if (open === -1) {
        return;
      }
      state.inHtmlComment = true;
      i = open + 4;
      continue;
    }
    const close = line.indexOf("-->", i);
    if (close === -1) {
      return;
    }
    state.inHtmlComment = false;
    i = close + 3;
  }
}

function lineIsEntirelyInSkippedRegion(
  line: string,
  state: ScanState,
): boolean {
  if (state.inFence) {
    return true;
  }
  if (state.inHtmlComment) {
    return true;
  }
  // Whole-line HTML comment (possibly hyogen)
  const trimmed = line.trim();
  if (trimmed.startsWith("<!--") && trimmed.endsWith("-->") && trimmed.length >= 7) {
    return true;
  }
  // Line that only opens a comment (multi-line)
  if (trimmed.startsWith("<!--") && !trimmed.includes("-->")) {
    return true;
  }
  return false;
}

/**
 * Extract ATX / Setext headings from Markdown.
 * Skips fenced code (``` / ~~~), HTML comments, and hyogen blocks (comments).
 */
export function extractHeadings(source: string): ExtractedHeading[] {
  const lines = source.split(/\r?\n/);
  const headings: ExtractedHeading[] = [];
  const state: ScanState = { inFence: false, inHtmlComment: false };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (state.inFence) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith(state.inFence.marker) &&
        /^(`{3,}|~{3,})\s*$/.test(trimmed)
      ) {
        state.inFence = false;
      }
      continue;
    }

    if (state.inHtmlComment) {
      advanceHtmlComment(line, state, 0);
      continue;
    }

    const fenceMatch = FENCE_OPEN.exec(line.trimStart());
    if (fenceMatch) {
      const marker = fenceMatch[1]!;
      const after = line.trimStart().slice(marker.length);
      // Same-line close is rare; treat opening fence as starting a fence
      if (!after.includes(marker)) {
        state.inFence = { marker };
      }
      continue;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith("<!--")) {
      advanceHtmlComment(line, state, line.indexOf("<!--"));
      // Single-line comment: advanceHtmlComment closes it; multi-line stays open
      continue;
    }

    if (lineIsEntirelyInSkippedRegion(line, state)) {
      continue;
    }

    const atx = parseAtxHeading(line);
    if (atx) {
      headings.push(atx);
      continue;
    }

    // Setext: current line is text, next is === or ---
    const next = lines[i + 1];
    if (
      next !== undefined &&
      line.trim().length > 0 &&
      !line.trimStart().startsWith("#") &&
      !line.trimStart().startsWith(">") &&
      !line.trimStart().startsWith("|")
    ) {
      if (SETEXT_EQUALS.test(next)) {
        const parsed = parseHeadingText(line.trim());
        headings.push({ level: 1, ...parsed });
        i += 1;
        continue;
      }
      if (SETEXT_DASHES.test(next) && next.trim().length >= 1) {
        // Prefer thematic break of only --- with blank above; with text above → setext h2
        const parsed = parseHeadingText(line.trim());
        headings.push({ level: 2, ...parsed });
        i += 1;
        continue;
      }
    }
  }

  return headings;
}
