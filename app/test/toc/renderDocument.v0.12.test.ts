import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { renderServer } from "../../src/renderServer.js";
import { expandToc } from "../../src/toc/expandToc.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.12",
);

function fixture(relativePath: string): string {
  return readFileSync(path.join(fixtureDir, relativePath), "utf8");
}

describe("renderServer / TOC integration (v0.12)", () => {
  it("renders basic toc(3) nested list", async () => {
    const result = await renderServer(fixture("basic/page.md"));
    assert.match(result.markdown, /- \[Page Title\]\(#page-title\)/);
    assert.match(result.markdown, /  - \[Section A\]\(#section-a\)/);
    assert.match(result.markdown, /    - \[Sub A-1\]\(#sub-a-1\)/);
    assert.match(result.markdown, /^## Section A$/m);
    assert.doesNotMatch(result.markdown, /\[Deep H4\]|#deep-h4/);
    assert.doesNotMatch(result.markdown, /toc\(/);
  });

  it("supports shorthand and @hg forms", async () => {
    for (const file of [
      "forms/shorthand.md",
      "forms/hg-block.md",
      "forms/hg-endhg.md",
    ]) {
      const result = await renderServer(fixture(file));
      assert.match(result.markdown, /- \[Title\]\(#title\)/);
      assert.match(result.markdown, /  - \[Section\]\(#section\)/);
    }
  });

  it("respects max level and default toc", async () => {
    const toc3 = await renderServer(fixture("max-level/toc3.md"));
    assert.match(toc3.markdown, /H3/);
    assert.doesNotMatch(toc3.markdown, /\[H4\]/);

    const all = await renderServer(fixture("max-level/toc-default.md"));
    assert.match(all.markdown, /\[H6\]\(#h6\)/);
  });

  it("excludes fenced / comment / hyogen-internal headings", async () => {
    const fenced = await renderServer(fixture("exclusions/fenced.md"));
    assert.doesNotMatch(fenced.markdown, /\[Not a heading\]|\[Also not\]/);
    assert.match(fenced.markdown, /\[After fence\]/);

    // Invalid directive body would fail earlier stages; expandToc still skips
    // headings inside residual hyogen comment spans.
    const hyogen = expandToc(fixture("exclusions/hyogen-block.md"));
    assert.doesNotMatch(hyogen, /\[Inside hyogen\]/);
    assert.match(hyogen, /\[Outside\]/);

    const comment = await renderServer(fixture("exclusions/html-comment.md"));
    assert.doesNotMatch(comment.markdown, /\[Comment heading\]/);
    assert.match(comment.markdown, /\[Outside\]/);
  });

  it("handles anchors, duplicates, decoration, setext, empty, multi", async () => {
    const explicit = await renderServer(fixture("anchors/explicit-id.md"));
    assert.match(explicit.markdown, /\[Title\]\(#my-id\)/);

    const dup = await renderServer(fixture("anchors/duplicate.md"));
    assert.match(dup.markdown, /\[Dup\]\(#dup\)/);
    assert.match(dup.markdown, /\[Dup\]\(#dup-1\)/);
    assert.match(dup.markdown, /\[Dup\]\(#dup-2\)/);

    const decorated = await renderServer(fixture("anchors/decorated.md"));
    assert.match(decorated.markdown, /\[Bold and code\]\(#bold-and-code\)/);

    const setext = await renderServer(fixture("setext/setext.md"));
    assert.match(setext.markdown, /- \[Page Title\]\(#page-title\)/);
    assert.match(setext.markdown, /  - \[Section A\]\(#section-a\)/);

    const empty = await renderServer(fixture("empty/no-headings.md"));
    assert.doesNotMatch(empty.markdown, /^- /m);
    assert.match(empty.markdown, /No headings here/);

    const multi = await renderServer(fixture("multi/two-tocs.md"));
    assert.match(multi.markdown, /\[A-1\]\(#a-1\)/);
  });

  it("builds TOC after include / if / expr", async () => {
    const root = path.join(fixtureDir, "pipeline/doc-root");

    const withInclude = await renderServer(
      { path: path.join(root, "pages/with-include.md") },
      undefined,
      { root },
    );
    assert.match(withInclude.markdown, /\[Included Section\]/);
    assert.match(withInclude.markdown, /\[Included Sub\]/);

    const withIf = await renderServer(
      { path: path.join(root, "pages/with-if.md") },
      undefined,
      { root },
    );
    assert.doesNotMatch(withIf.markdown, /Hidden Branch/);
    assert.match(withIf.markdown, /\[Visible Branch\]/);

    const withExpr = await renderServer(
      { path: path.join(root, "pages/with-expr.md") },
      { title: "Dynamic Title" },
      { root },
    );
    assert.match(withExpr.markdown, /\[Dynamic Title\]\(#dynamic-title\)/);
    assert.match(withExpr.markdown, /^## Dynamic Title$/m);
  });

  it("leaves no toc markers even with preserveHgComments", async () => {
    const result = await renderServer(fixture("basic/page.md"), undefined, {
      preserveHgComments: true,
    });
    assert.match(result.markdown, /- \[Page Title\]/);
    assert.doesNotMatch(result.markdown, /toc\(/);
  });

  it("rejects invalid toc(0) with parse_error", async () => {
    try {
      await renderServer("# H\n\n<!--@@ toc(0) @@-->\n");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });
});
