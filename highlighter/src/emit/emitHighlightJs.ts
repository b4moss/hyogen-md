import type { HighlighterIr } from "../types.ts";
import { normalizeTokenCategories } from "../normalizeTokenCategories.ts";

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Emit a highlight.js language definition module. */
export function emitHighlightJs(ir: HighlighterIr): string {
  const cats = normalizeTokenCategories(ir);
  const keywords = cats.keywords.join(" ");
  const opAlt = cats.operators
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join("|");

  return [
    "/* Generated from highlighter/dsl — do not edit by hand. */",
    "/** @type {(hljs: any) => any} */",
    "export default function hyogen(hljs) {",
    "  return {",
    '    name: "hyogen",',
    '    aliases: ["hg"],',
    "    keywords: {",
    `      keyword: ${JSON.stringify(keywords)},`,
    "    },",
    "    contains: [",
    `      hljs.COMMENT(${JSON.stringify(ir.comments.line)}, /$/),`,
    "      hljs.COMMENT(",
    `        ${JSON.stringify(ir.comments.blockOpen)},`,
    `        ${JSON.stringify(ir.comments.blockClose)},`,
    "      ),",
    "      {",
    '        className: "meta",',
    "        begin: /@(?:hg\\b|endhg\\b)|@@/,",
    "      },",
    "      hljs.QUOTE_STRING_MODE,",
    "      hljs.APOS_STRING_MODE,",
    "      hljs.C_NUMBER_MODE,",
    "      {",
    '        className: "operator",',
    `        begin: /${opAlt}/,`,
    "      },",
    "    ],",
    "  };",
    "}",
    "",
  ].join("\n");
}
