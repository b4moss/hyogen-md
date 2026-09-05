import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { collectDependencies } from "../../src/build/collectDependencies.js";
import { executeDeclarations } from "../../src/logic/executeDeclarations.js";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";

describe("toc early passthrough", () => {
  const tocOnly = "<!--@@ toc(3) @@-->\n\n# Hello\n";

  it("executeHgBlocks keeps toc and does not treat it as a directive", () => {
    const result = executeHgBlocks(tocOnly);
    assert.match(result.source, /toc\(3\)/);
    assert.equal(result.directives.length, 0);
  });

  it("collectDependencies ignores toc without throwing", () => {
    assert.deepEqual(collectDependencies(tocOnly), []);
  });

  it("executeDeclarations leaves toc in place", async () => {
    const result = await executeDeclarations(tocOnly);
    assert.match(result.source, /toc\(3\)/);
  });

  it("invalid toc(0) still passes early stages", () => {
    const source = "<!--@@ toc(0) @@-->\n";
    assert.match(executeHgBlocks(source).source, /toc\(0\)/);
    assert.deepEqual(collectDependencies(source), []);
  });
});
