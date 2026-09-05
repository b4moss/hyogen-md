import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { renderDocument } from "../../src/pipeline/renderDocument.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("renderDocument v0.12", () => {
  it("expands array and string .length in body", async () => {
    const source = [
      "<!--@hg",
      'const items = [1, 2, 3]',
      'const label = "abcd"',
      "@endhg-->",
      "count={{ items.length }} chars={{ label.length }}",
    ].join("\n");
    const result = await renderDocument(source);
    assert.equal(result.markdown, "\ncount=3 chars=4");
  });

  it("echoes const value into the document body", async () => {
    const source = [
      "<!--@hg",
      'const greet = "Hello world!"',
      "echo greet",
      "@endhg-->",
    ].join("\n");
    const result = await renderDocument(source);
    assert.equal(result.markdown, "Hello world!");
  });

  it("echoes via @@ after a declaration block", async () => {
    const source = [
      "<!--@hg",
      'const greet = "Hello world!"',
      "@endhg-->",
      "<!--@@ echo greet @@-->",
    ].join("\n");
    const result = await renderDocument(source);
    assert.match(result.markdown, /Hello world!/);
  });

  it("rejects .slice() in body expressions", async () => {
    await assert.rejects(
      () =>
        renderDocument(
          [
            "<!--@hg",
            "const items = [1, 2, 3]",
            "@endhg-->",
            "{{ items.slice(0) }}",
          ].join("\n"),
        ),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
