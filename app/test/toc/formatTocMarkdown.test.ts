import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { formatTocMarkdown } from "../../src/toc/formatTocMarkdown.js";

describe("formatTocMarkdown", () => {
  const sample = [
    { level: 1, text: "Page Title" },
    { level: 2, text: "Section A" },
    { level: 3, text: "Sub A-1" },
    { level: 2, text: "Section B" },
  ];

  it("nests by (level - minLevel) * 2 spaces", () => {
    const md = formatTocMarkdown(sample, 3);
    assert.equal(
      md,
      [
        "- [Page Title](#page-title)",
        "  - [Section A](#section-a)",
        "    - [Sub A-1](#sub-a-1)",
        "  - [Section B](#section-b)",
      ].join("\n"),
    );
  });

  it("filters by maxLevel", () => {
    const md = formatTocMarkdown(sample, 2);
    assert.equal(
      md,
      [
        "- [Page Title](#page-title)",
        "  - [Section A](#section-a)",
        "  - [Section B](#section-b)",
      ].join("\n"),
    );
    assert.doesNotMatch(md, /Sub A-1/);
  });

  it("plainifies decorations and uses plain text for anchors", () => {
    const md = formatTocMarkdown(
      [{ level: 2, text: "**Bold** and `code`" }],
      6,
    );
    assert.equal(md, "- [Bold and code](#bold-and-code)");
  });

  it("prefers explicit ids", () => {
    const md = formatTocMarkdown(
      [{ level: 2, text: "Title", explicitId: "my-id" }],
      6,
    );
    assert.equal(md, "- [Title](#my-id)");
  });

  it("assigns duplicate suffixes across full heading list before filter", () => {
    const headings = [
      { level: 1, text: "Foo" },
      { level: 3, text: "Foo" },
      { level: 2, text: "Foo" },
    ];
    const md = formatTocMarkdown(headings, 2);
    assert.equal(
      md,
      ["- [Foo](#foo)", "  - [Foo](#foo-2)"].join("\n"),
    );
  });

  it("returns empty string for no items", () => {
    assert.equal(formatTocMarkdown([], 3), "");
    assert.equal(
      formatTocMarkdown([{ level: 4, text: "Deep" }], 3),
      "",
    );
  });
});
