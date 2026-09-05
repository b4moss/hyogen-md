import { extractHgBlockLines } from "../logic/hgBlockUtils.js";
import { scanHgBlocks } from "../parse/scanHgBlocks.js";
import { joinRemovalSeam } from "../pipeline/joinRemovalSeam.js";
import { extractHeadings } from "./extractHeadings.js";
import { formatTocMarkdown } from "./formatTocMarkdown.js";
import { isTocDirectiveLine, parseTocDirective } from "./parseTocDirective.js";

export type ExpandTocOptions = {
  path?: string;
};

/**
 * Replace toc directives with Markdown TOC lists (pipeline step 7).
 * Headings are taken once from the pre-replacement source.
 */
export function expandToc(
  source: string,
  options: ExpandTocOptions = {},
): string {
  const blocks = scanHgBlocks(source);
  const tocBlocks = blocks.filter((block) => {
    const lines = extractHgBlockLines(block.inner);
    return lines.length === 1 && isTocDirectiveLine(lines[0]!);
  });

  if (tocBlocks.length === 0) {
    return source;
  }

  const headings = extractHeadings(source);
  let result = source;

  for (let i = tocBlocks.length - 1; i >= 0; i--) {
    const block = tocBlocks[i]!;
    const { maxLevel } = parseTocDirective(block.inner, options.path);
    const tocMarkdown = formatTocMarkdown(headings, maxLevel);
    const left = result.slice(0, block.start);
    const right = result.slice(block.end);
    result = joinRemovalSeam(joinRemovalSeam(left, tocMarkdown), right);
  }

  return result;
}
