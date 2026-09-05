import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { expandToc } from "../../src/toc/expandToc.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("expandToc", () => {
  it("replaces @@ toc(3) with nested list and keeps body headings", () => {
    const source = `# Page Title

<!--@@ toc(3) @@-->

## Section A

### Sub A-1

## Section B
`;
    const result = expandToc(source);
    assert.match(result, /- \[Page Title\]\(#page-title\)/);
    assert.match(result, /  - \[Section A\]\(#section-a\)/);
    assert.match(result, /    - \[Sub A-1\]\(#sub-a-1\)/);
    assert.match(result, /^## Section A$/m);
    assert.doesNotMatch(result, /toc\(3\)/);
  });

  it("supports @hg / @endhg forms", () => {
    const a = expandToc("# T\n\n<!--@hg toc(1) @endhg-->\n\n## S\n");
    assert.match(a, /- \[T\]\(#t\)/);
    assert.doesNotMatch(a, /Section|#s\)/);

    const b = expandToc("# T\n\n<!--@hg\ntoc(2)\n@endhg-->\n\n## S\n");
    assert.match(b, /- \[T\]\(#t\)/);
    assert.match(b, /  - \[S\]\(#s\)/);
  });

  it("expands multiple tocs with independent max levels", () => {
    const source = `# Page

<!--@@ toc(2) @@-->

## A

### A-1

<!--@@ toc(3) @@-->

## B
`;
    const result = expandToc(source);
    const firstToc = result.slice(
      0,
      result.indexOf("## A"),
    );
    assert.match(firstToc, /- \[Page\]\(#page\)/);
    assert.match(firstToc, /  - \[A\]\(#a\)/);
    assert.doesNotMatch(firstToc, /A-1/);

    assert.match(result, /- \[A-1\]\(#a-1\)/);
  });

  it("removes toc with empty replacement when no headings", () => {
    const result = expandToc("<!--@@ toc(3) @@-->\n\nplain\n");
    assert.doesNotMatch(result, /toc/);
    assert.doesNotMatch(result, /^- /m);
    assert.match(result, /plain/);
  });

  it("returns source unchanged when no toc", () => {
    const source = "# Hello\n\n## World\n";
    assert.equal(expandToc(source), source);
  });

  it("throws parse_error for invalid toc args", () => {
    for (const src of [
      "<!--@@ toc(0) @@-->",
      "<!--@@ toc(7) @@-->",
      "<!--@@ toc(abc) @@-->",
    ]) {
      try {
        expandToc(`# H\n\n${src}\n`);
        assert.fail(`expected throw for ${src}`);
      } catch (error) {
        assertHyogenError(error, "parse_error");
      }
    }
  });
});
