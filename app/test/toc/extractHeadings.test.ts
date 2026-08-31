import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { extractHeadings } from "../../src/toc/extractHeadings.js";
import {
  createHeadingSlugger,
  githubSlugify,
} from "../../src/toc/githubHeadingSlug.js";

describe("extractHeadings", () => {
  it("extracts ATX h1–h6", () => {
    const source = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;
    assert.deepEqual(
      extractHeadings(source).map((h) => [h.level, h.text]),
      [
        [1, "H1"],
        [2, "H2"],
        [3, "H3"],
        [4, "H4"],
        [5, "H5"],
        [6, "H6"],
      ],
    );
  });

  it("extracts Setext headings", () => {
    const source = `Title
===

Section
---
`;
    assert.deepEqual(extractHeadings(source), [
      { level: 1, text: "Title" },
      { level: 2, text: "Section" },
    ]);
  });

  it("parses explicit {#id}", () => {
    assert.deepEqual(extractHeadings("## Title {#my-id}"), [
      { level: 2, text: "Title", explicitId: "my-id" },
    ]);
  });

  it("skips fenced code headings", () => {
    const source = `# Real
\`\`\`
# Not
\`\`\`
~~~
## Also
~~~
## After`;
    assert.deepEqual(
      extractHeadings(source).map((h) => h.text),
      ["Real", "After"],
    );
  });

  it("skips HTML comment and hyogen block headings", () => {
    const source = `# Real
<!--
# Comment
-->
<!--@@
## Hyogen
@@-->
## Outside`;
    assert.deepEqual(
      extractHeadings(source).map((h) => h.text),
      ["Real", "Outside"],
    );
  });

  it("still finds body headings when toc comment is present", () => {
    const source = `# A
<!--@@ toc(3) @@-->
## B`;
    assert.deepEqual(
      extractHeadings(source).map((h) => h.text),
      ["A", "B"],
    );
  });

  it("returns [] when no headings", () => {
    assert.deepEqual(extractHeadings("plain text"), []);
  });

  it("skips headings inside unclosed fences", () => {
    const source = `# Before
\`\`\`
# Inside
`;
    assert.deepEqual(
      extractHeadings(source).map((h) => h.text),
      ["Before"],
    );
  });
});

describe("githubHeadingSlug", () => {
  it("slugifies plain titles", () => {
    assert.equal(githubSlugify("Page Title"), "page-title");
  });

  it("uses explicit id as-is", () => {
    const slugger = createHeadingSlugger();
    assert.equal(slugger.slug("Title", "my-id"), "my-id");
  });

  it("strips punctuation and joins with hyphens", () => {
    assert.equal(githubSlugify("Hello, World!"), "hello-world");
  });

  it("appends -1, -2 for duplicates", () => {
    const slugger = createHeadingSlugger();
    assert.equal(slugger.slug("Page Title"), "page-title");
    assert.equal(slugger.slug("Page Title"), "page-title-1");
    assert.equal(slugger.slug("Page Title"), "page-title-2");
  });

  it("keeps Japanese characters (GitHub-compatible)", () => {
    assert.equal(githubSlugify("日本語タイトル"), "日本語タイトル");
  });

  it("returns empty slug for empty text", () => {
    assert.equal(githubSlugify(""), "");
    const slugger = createHeadingSlugger();
    assert.equal(slugger.slug(""), "");
    assert.equal(slugger.slug(""), "-1");
  });
});
