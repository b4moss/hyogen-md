export type ExtractedHeading = {
  level: number;
  text: string;
  explicitId?: string;
};

const ATX_PATTERN = /^(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/;
const EXPLICIT_ID_PATTERN = /^(.*?)\s*\{#([A-Za-z][\w:.-]*)\}\s*$/;
const SETEXT_EQUALS = /^=+[ \t]*$/;
const SETEXT_DASHES = /^-+[ \t]*$/;
const FENCE_OPEN = /^(```|~~~)/;

type ScanState = {
  inFence: false | { marker: string };
  inHtmlComment: boolean;
};

function parseHeadingText(raw: string): {
  text: string;
  explicitId?: string;
} {
  const idMatch = EXPLICIT_ID_PATTERN.exec(raw);
  if (idMatch) {
    return { text: idMatch[1]!.trim(), explicitId: idMatch[2]! };
  }
  return { text: raw.trim() };
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

    const atx = ATX_PATTERN.exec(line);
    if (atx) {
      const level = atx[1]!.length;
      const parsed = parseHeadingText(atx[2]!);
      headings.push({ level, ...parsed });
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
