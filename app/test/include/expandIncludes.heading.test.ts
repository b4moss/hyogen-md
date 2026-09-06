import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { expandIncludes } from "../../src/include/expandIncludes.js";
import { executeHgBlocks } from "../../src/pipeline/executeHgBlocks.js";

describe("expandIncludes heading hierarchy", () => {
  it("shifts child headings based on preceding ATX level", async () => {
    const files: Record<string, string> = {
      "/root/child.md": "# Child title\n\n## Child sub\n",
    };
    const source = [
      "## Section",
      "",
      "<!--@hg",
      "include ./child.md",
      "@endhg-->",
      "",
    ].join("\n");
    const { source: marked, directives } = executeHgBlocks(source);
    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader: async (p) => files[p] ?? (() => { throw new Error(`missing ${p}`); })(),
      root: "/root",
      path: "/root/parent.md",
    });
    assert.match(result, /^### Child title$/m);
    assert.match(result, /^#### Child sub$/m);
  });

  it("leaves headings unchanged when no preceding heading", async () => {
    const files: Record<string, string> = {
      "/root/child.md": "# Child\n",
    };
    const source = "<!--@hg\ninclude ./child.md\n@endhg-->";
    const { source: marked, directives } = executeHgBlocks(source);
    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader: async (p) => files[p]!,
      root: "/root",
      path: "/root/parent.md",
    });
    assert.match(result, /^# Child$/m);
  });

  it("accumulates offsets for nested includes", async () => {
    const files: Record<string, string> = {
      "/root/grand.md": "# Grand title\n",
      "/root/child.md": [
        "# Child title",
        "",
        "<!--@hg",
        "include ./grand.md",
        "@endhg-->",
        "",
      ].join("\n"),
    };
    const source = [
      "## Section",
      "",
      "<!--@hg",
      "include ./child.md",
      "@endhg-->",
      "",
    ].join("\n");
    const { source: marked, directives } = executeHgBlocks(source);
    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader: async (p) => files[p]!,
      root: "/root",
      path: "/root/parent.md",
    });
    assert.match(result, /^### Child title$/m);
    assert.match(result, /^#### Grand title$/m);
  });

  it("clamps nested headings at level 6", async () => {
    const files: Record<string, string> = {
      "/root/child.md": "## Deep\n",
    };
    const source = [
      "##### Almost",
      "",
      "<!--@hg",
      "include ./child.md",
      "@endhg-->",
    ].join("\n");
    const { source: marked, directives } = executeHgBlocks(source);
    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader: async (p) => files[p]!,
      root: "/root",
      path: "/root/parent.md",
    });
    assert.match(result, /^###### Deep$/m);
    assert.doesNotMatch(result, /^#######/m);
  });

  it("ignores fenced fake headings when computing L", async () => {
    const files: Record<string, string> = {
      "/root/child.md": "# Child\n",
    };
    const source = [
      "```",
      "# Not real",
      "```",
      "",
      "<!--@hg",
      "include ./child.md",
      "@endhg-->",
    ].join("\n");
    const { source: marked, directives } = executeHgBlocks(source);
    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader: async (p) => files[p]!,
      root: "/root",
      path: "/root/parent.md",
    });
    assert.match(result, /^# Child$/m);
  });

  it("normalizes Setext child headings to shifted ATX", async () => {
    const files: Record<string, string> = {
      "/root/child.md": "Child setext\n=============\n",
    };
    const source = [
      "## Section",
      "",
      "<!--@hg",
      "include ./child.md",
      "@endhg-->",
    ].join("\n");
    const { source: marked, directives } = executeHgBlocks(source);
    const result = await expandIncludes({
      source: marked,
      directives,
      context: {},
      loader: async (p) => files[p]!,
      root: "/root",
      path: "/root/parent.md",
    });
    assert.match(result, /^### Child setext$/m);
  });
});
