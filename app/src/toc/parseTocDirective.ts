import { createHyogenError } from "../errors/createError.js";
import { extractHgBlockLines } from "../logic/hgBlockUtils.js";

export type TocDirective = {
  maxLevel: number;
};

/** True when a single line looks like a toc directive (args validated later). */
export function isTocDirectiveLine(line: string): boolean {
  return /^toc(\(.*\))?$/.test(line.trim());
}

/**
 * Parses a toc / toc(N) directive from a block inner or a single source line.
 * N defaults to 6; must be an integer 1–6 when present.
 */
export function parseTocDirective(
  source: string,
  path?: string,
): TocDirective {
  const lines = extractHgBlockLines(source);
  if (lines.length !== 1) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: {
        message: "toc directive must be a single line",
      },
    });
  }

  const line = lines[0]!;
  if (line === "toc") {
    return { maxLevel: 6 };
  }

  const match = /^toc\((.*)\)$/.exec(line);
  if (!match) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: { message: `invalid toc directive: ${line}` },
    });
  }

  const arg = match[1]!;
  if (!/^[1-6]$/.test(arg)) {
    throw createHyogenError({
      code: "parse_error",
      path,
      details: {
        message: `invalid toc max level: ${arg || "(empty)"} (expected integer 1–6)`,
      },
    });
  }

  return { maxLevel: Number(arg) };
}
