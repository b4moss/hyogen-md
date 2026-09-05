import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  findPrecedingHeadingLevel,
  shiftMarkdownHeadings,
} from "../../src/markdown/shiftHeadings.js";

describe("findPrecedingHeadingLevel", () => {
  it("returns ATX level for a simple prefix", () => {
    assert.equal(findPrecedingHeadingLevel("## Section\n\n"), 2);
  });

  it("returns the nearest preceding heading", () => {
    assert.equal(findPrecedingHeadingLevel("# A\n## B\n\nparagraph\n"), 2);
  });

  it("returns 0 when no heading exists", () => {
    assert.equal(findPrecedingHeadingLevel("just text\n\n"), 0);
    assert.equal(findPrecedingHeadingLevel(""), 0);
  });

  it("detects Setext level 1 and 2", () => {
    assert.equal(findPrecedingHeadingLevel("Title\n===\n\n"), 1);
    assert.equal(findPrecedingHeadingLevel("Title\n---\n\n"), 2);
  });

  it("ignores headings inside fenced code blocks", () => {
    const prefix = ["```", "# Not a heading", "```", ""].join("\n");
    assert.equal(findPrecedingHeadingLevel(prefix), 0);
  });

  it("sees headings after a closed fence", () => {
    const prefix = ["```", "# Not", "```", "", "### After", ""].join("\n");
    assert.equal(findPrecedingHeadingLevel(prefix), 3);
  });

  it("ignores 7+ hash sequences", () => {
    assert.equal(findPrecedingHeadingLevel("####### Too many\n"), 0);
  });

  it("ignores headings in an unclosed fence", () => {
    assert.equal(findPrecedingHeadingLevel("~~~\n# Hidden\n"), 0);
  });
});

describe("shiftMarkdownHeadings", () => {
  it("shifts ATX headings by the given amount", () => {
    assert.equal(
      shiftMarkdownHeadings("# A\n## B", 2),
      "### A\n#### B",
    );
  });

  it("is a no-op when shift is 0 or negative", () => {
    assert.equal(shiftMarkdownHeadings("# A\n## B", 0), "# A\n## B");
    assert.equal(shiftMarkdownHeadings("# A", -1), "# A");
  });

  it("normalizes Setext to ATX when shifting", () => {
    assert.equal(
      shiftMarkdownHeadings("Title\n===", 2),
      "### Title",
    );
    assert.equal(
      shiftMarkdownHeadings("Sub\n---", 1),
      "### Sub",
    );
  });

  it("clamps to heading level 6", () => {
    assert.equal(shiftMarkdownHeadings("##### X", 3), "###### X");
    assert.equal(shiftMarkdownHeadings("## Y", 5), "###### Y");
  });

  it("does not shift content inside fences", () => {
    const input = ["```", "# Keep", "```", "# Out"].join("\n");
    const expected = ["```", "# Keep", "```", "### Out"].join("\n");
    assert.equal(shiftMarkdownHeadings(input, 2), expected);
  });

  it("returns empty string for empty input", () => {
    assert.equal(shiftMarkdownHeadings("", 2), "");
  });
});
