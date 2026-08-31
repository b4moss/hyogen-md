import type { ExtractedHeading } from "./extractHeadings.js";
import { createHeadingSlugger } from "./githubHeadingSlug.js";
import { plainifyHeadingText } from "./plainifyHeadingText.js";

/**
 * Build a nested Markdown TOC list from headings.
 * Anchors are assigned for *all* headings (document order) before filtering by maxLevel,
 * so duplicate suffixes match full-document GitHub IDs.
 */
export function formatTocMarkdown(
  headings: ExtractedHeading[],
  maxLevel: number,
): string {
  if (headings.length === 0) {
    return "";
  }

  const slugger = createHeadingSlugger();
  const anchored = headings.map((heading) => {
    const text = plainifyHeadingText(heading.text);
    const anchor = slugger.slug(text, heading.explicitId);
    return { level: heading.level, text, anchor };
  });

  const items = anchored.filter((h) => h.level <= maxLevel);
  if (items.length === 0) {
    return "";
  }

  const minLevel = Math.min(...items.map((h) => h.level));
  return items
    .map((item) => {
      const indent = " ".repeat((item.level - minLevel) * 2);
      return `${indent}- [${item.text}](#${item.anchor})`;
    })
    .join("\n");
}
