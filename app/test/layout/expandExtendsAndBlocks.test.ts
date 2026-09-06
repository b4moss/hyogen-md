import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { expandExtendsAndBlocks } from "../../src/layout/expandExtendsAndBlocks.js";
import { VisitStack } from "../../src/include/VisitStack.js";
import { createHyogenError } from "../../src/errors/createError.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("expandExtendsAndBlocks", () => {
  it("throws parse_error for orphan block without extend", async () => {
    const source = [
      "<!--@hg",
      "block contents",
      "@endhg-->",
      "Hello",
      "<!--@hg",
      "endblock",
      "@endhg-->",
    ].join("\n");

    await assert.rejects(
      () =>
        expandExtendsAndBlocks(source, {
          context: {},
          declarationUpdates: {},
          visitStack: new VisitStack(),
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws a plain error when no loader is provided for extend", async () => {
    const source = "<!--@hg\nextend ./layout.md\n@endhg-->";

    await assert.rejects(
      () =>
        expandExtendsAndBlocks(source, {
          context: {},
          declarationUpdates: {},
          visitStack: new VisitStack(),
        }),
      /loader is required when processing extend directives/,
    );
  });

  it("throws parse_error for multiple extend directives", async () => {
    const source = [
      "<!--@hg",
      "extend ./a.md",
      "@endhg-->",
      "<!--@hg",
      "extend ./b.md",
      "@endhg-->",
    ].join("\n");

    await assert.rejects(
      () =>
        expandExtendsAndBlocks(source, {
          context: {},
          declarationUpdates: {},
          loader: async () => "",
          visitStack: new VisitStack(),
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("warns and skips output for a self-referential (immediately circular) extend", async () => {
    const source = "<!--@hg\nextend ./self.md\n@endhg-->";
    const warnings: import("../../src/types.js").HyogenWarning[] = [];

    const result = await expandExtendsAndBlocks(source, {
      path: "/virtual/self.md",
      root: "/virtual",
      context: {},
      declarationUpdates: {},
      loader: async () => {
        throw new Error("loader should not be called for a circular extend");
      },
      visitStack: new VisitStack(),
      warnings,
    });

    assert.equal(result.source, "");
    assert.ok(warnings.some((w) => w.code === "circular_include"));
  });

  it("throws a plain error when the loader resolves to undefined", async () => {
    const source = "<!--@hg\nextend ./layout.md\n@endhg-->";

    await assert.rejects(
      () =>
        expandExtendsAndBlocks(source, {
          path: "/virtual/page.md",
          root: "/virtual",
          context: {},
          declarationUpdates: {},
          loader: async () => undefined as unknown as string,
          visitStack: new VisitStack(),
        }),
      /loader returned undefined/,
    );
  });

  it("throws parse_error when a layout itself contains a non-circular extend", async () => {
    const source = "<!--@hg\nextend ./layoutL.md\n@endhg-->";

    await assert.rejects(
      () =>
        expandExtendsAndBlocks(source, {
          path: "/virtual/page.md",
          root: "/virtual",
          context: {},
          declarationUpdates: {},
          loader: async (loadPath: string) => {
            if (loadPath.endsWith("layoutL.md")) {
              return "<!--@hg\nextend ./layoutM.md\n@endhg-->\nLayout L body";
            }
            return "Layout M body";
          },
          visitStack: new VisitStack(),
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("rewrites file_not_found errors from an include-style loader to via: extend", async () => {
    const source = "<!--@hg\nextend ./missing-layout.md\n@endhg-->";

    await assert.rejects(
      () =>
        expandExtendsAndBlocks(source, {
          path: "/virtual/page.md",
          root: "/virtual",
          context: {},
          declarationUpdates: {},
          loader: async (loadPath: string) => {
            throw createHyogenError({
              code: "file_not_found",
              path: loadPath,
              details: { path: loadPath, from: "/virtual", via: "include" },
            });
          },
          visitStack: new VisitStack(),
        }),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        assert.equal((error as { details?: { via?: string } }).details?.via, "extend");
        return true;
      },
    );
  });
});
