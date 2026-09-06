import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { ComponentRegistry } from "../../src/component/ComponentRegistry.js";
import { interpolateExpressions } from "../../src/expr/interpolateExpressions.js";
import { VisitStack } from "../../src/include/VisitStack.js";

function registryWith(
  alias: string,
  componentPath: string,
): ComponentRegistry {
  const registry = new ComponentRegistry();
  registry.register(
    { alias, componentPath, definedAt: "/page.md" },
    [],
  );
  return registry;
}

const common = {
  visitStack: () => new VisitStack(),
  warnings: [] as [],
  path: "/docs/page.md",
  rootDir: "/docs",
};

describe("interpolateExpressions heading hierarchy", () => {
  it("shifts component call output using preceding heading", async () => {
    const result = await interpolateExpressions(
      "## Section\n\n{{ card({}) }}\n",
      {},
      {
        registry: registryWith("card", "./components/card.md"),
        loader: async () => "# Card title\n\nBody line\n",
        visitStack: common.visitStack(),
        warnings: [],
        path: common.path,
        rootDir: common.rootDir,
      },
    );
    assert.match(result, /^### Card title$/m);
    assert.match(result, /Body line/);
    assert.match(result, /^## Section$/m);
  });

  it("allows multiline component output without error", async () => {
    const result = await interpolateExpressions("{{ bad({}) }}", {}, {
      registry: registryWith("bad", "./components/multiline.md"),
      loader: async () => "Line one\nLine two\n",
      visitStack: common.visitStack(),
      warnings: [],
      path: common.path,
      rootDir: common.rootDir,
    });
    assert.equal(result.trim(), "Line one\nLine two");
  });

  it("does not shift non-call expressions", async () => {
    const result = await interpolateExpressions(
      "## Section\n\n{{ title }}\n",
      { title: "# Keep literal" },
    );
    assert.match(result, /# Keep literal/);
    assert.doesNotMatch(result, /### Keep/);
  });

  it("clamps component headings at h6", async () => {
    const result = await interpolateExpressions(
      "##### Deep\n\n{{ card({}) }}\n",
      {},
      {
        registry: registryWith("card", "./c.md"),
        loader: async () => "## Title\n",
        visitStack: common.visitStack(),
        warnings: [],
        path: common.path,
        rootDir: common.rootDir,
      },
    );
    assert.match(result, /^###### Title$/m);
  });
});
