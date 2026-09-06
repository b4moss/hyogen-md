import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  evaluateExpression,
  evaluateExpressionAsync,
} from "../../src/expr/evaluateExpression.js";
import { parseExpression } from "../../src/expr/parseExpression.js";
import { ComponentRegistry } from "../../src/component/ComponentRegistry.js";
import { VisitStack } from "../../src/include/VisitStack.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("evaluateExpression", () => {
  it("resolves identifier from context", async () => {
    const node = parseExpression("title");
    assert.equal(
      await evaluateExpression(node, { context: { title: "Hello" } }),
      "Hello",
    );
  });

  it("resolves nested member access", async () => {
    const node = parseExpression("meta.id");
    assert.equal(
      await evaluateExpression(node, { context: { meta: { id: 1 } } }),
      1,
    );
  });

  it("uses default pipe fallback for unbound identifiers", async () => {
    const node = parseExpression('color | "transparent"');
    assert.equal(await evaluateExpression(node, { context: {} }), "transparent");
  });

  it("treats zero as falsy in default pipe", async () => {
    const node = parseExpression('count | "none"');
    assert.equal(
      await evaluateExpression(node, { context: { count: 0 } }),
      "none",
    );
  });

  it("treats false as falsy in default pipe", async () => {
    const node = parseExpression('flag | "yes"');
    assert.equal(
      await evaluateExpression(node, { context: { flag: false } }),
      "yes",
    );
  });

  it("returns undefined for missing intermediate properties", async () => {
    const node = parseExpression("a.b.c");
    assert.equal(await evaluateExpression(node, { context: {} }), undefined);
  });

  it("throws forbidden_property_access for __proto__ identifier", async () => {
    const node = parseExpression("__proto__");
    await assert.rejects(
      () => evaluateExpression(node, { context: {} }),
      (error: unknown) => {
        assertHyogenError(error, "forbidden_property_access");
        return true;
      },
    );
  });

  it("returns array length via member access", async () => {
    const node = parseExpression("items.length");
    assert.equal(
      await evaluateExpression(node, { context: { items: [1, 2, 3] } }),
      3,
    );
  });

  it("returns string length via member access", async () => {
    const node = parseExpression("s.length");
    assert.equal(
      await evaluateExpression(node, { context: { s: "abc" } }),
      3,
    );
  });

  it("returns undefined for null.length", async () => {
    const node = parseExpression("x.length");
    assert.equal(
      await evaluateExpression(node, { context: { x: null } }),
      undefined,
    );
  });

  it("evaluates subtraction, multiplication, and division", async () => {
    assert.equal(
      await evaluateExpression(parseExpression("5 - 2"), { context: {} }),
      3,
    );
    assert.equal(
      await evaluateExpression(parseExpression("3 * 4"), { context: {} }),
      12,
    );
    assert.equal(
      await evaluateExpression(parseExpression("9 / 3"), { context: {} }),
      3,
    );
  });

  it("evaluates !== and != comparisons", async () => {
    assert.equal(
      await evaluateExpression(parseExpression("1 !== 2"), { context: {} }),
      true,
    );
    assert.equal(
      await evaluateExpression(parseExpression('1 != "2"'), { context: {} }),
      true,
    );
  });

  it("evaluates <= and > comparisons", async () => {
    assert.equal(
      await evaluateExpression(parseExpression("2 <= 2"), { context: {} }),
      true,
    );
    assert.equal(
      await evaluateExpression(parseExpression("3 > 2"), { context: {} }),
      true,
    );
  });

  it("short-circuits && without evaluating the right side", async () => {
    let evaluatedRight = false;
    const node = parseExpression("flag && greet({})");
    const registry = new ComponentRegistry();
    await evaluateExpression(node, {
      context: { flag: false },
      registry,
      loader: async () => {
        evaluatedRight = true;
        return "";
      },
      visitStack: new VisitStack(),
    });
    assert.equal(evaluatedRight, false);
  });

  it("short-circuits || without evaluating the right side", async () => {
    let evaluatedRight = false;
    const node = parseExpression("flag || greet({})");
    const registry = new ComponentRegistry();
    await evaluateExpression(node, {
      context: { flag: true },
      registry,
      loader: async () => {
        evaluatedRight = true;
        return "";
      },
      visitStack: new VisitStack(),
    });
    assert.equal(evaluatedRight, false);
  });

  it("evaluates the right side of && when the left is truthy", async () => {
    assert.equal(
      await evaluateExpression(parseExpression("true && false"), {
        context: {},
      }),
      false,
    );
  });

  it("evaluates the right side of || when the left is falsy", async () => {
    assert.equal(
      await evaluateExpression(parseExpression('0 || "fallback"'), {
        context: {},
      }),
      "fallback",
    );
  });

  it("returns undefined for member access on a number", async () => {
    const node = parseExpression("n.value");
    assert.equal(
      await evaluateExpression(node, { context: { n: 42 } }),
      undefined,
    );
  });

  it("returns undefined for member access on undefined", async () => {
    const node = parseExpression("x.value");
    assert.equal(
      await evaluateExpression(node, { context: {} }),
      undefined,
    );
  });

  it("throws parse_error for a call when no registry/loader/visitStack are provided", async () => {
    const node = parseExpression("greet({})");
    await assert.rejects(
      () => evaluateExpression(node, { context: {} }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an unregistered component", async () => {
    const node = parseExpression("greet({})");
    await assert.rejects(
      () =>
        evaluateExpression(node, {
          context: {},
          registry: new ComponentRegistry(),
          loader: async () => "",
          visitStack: new VisitStack(),
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an unsupported method node", async () => {
    await assert.rejects(
      () =>
        evaluateExpression(
          {
            type: "method",
            object: { type: "literal", value: "x" },
            method: "toUpperCase",
            args: [],
          },
          { context: {} },
        ),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("returns undefined for toLocaleString() on null", async () => {
    const node = parseExpression("n.toLocaleString()");
    assert.equal(
      await evaluateExpression(node, { context: { n: null } }),
      undefined,
    );
  });

  it("returns undefined for toLocaleString() on undefined", async () => {
    const node = parseExpression("n.toLocaleString()");
    assert.equal(
      await evaluateExpression(node, { context: {} }),
      undefined,
    );
  });

  it("returns undefined for a template part that evaluates to null/undefined", async () => {
    const node = parseExpression("`value: ${x}`");
    assert.equal(
      await evaluateExpression(node, { context: { x: null } }),
      "value: ",
    );
  });

  it("returns undefined for an unrecognized node type", async () => {
    assert.equal(
      await evaluateExpression(
        { type: "unknown" } as unknown as Parameters<typeof evaluateExpression>[0],
        { context: {} },
      ),
      undefined,
    );
  });

  it("supports evaluateExpressionAsync (deprecated helper)", async () => {
    const node = parseExpression("title");
    assert.equal(
      await evaluateExpressionAsync(node, { title: "Hello" }),
      "Hello",
    );
  });
});
