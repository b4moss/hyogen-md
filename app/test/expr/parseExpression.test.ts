import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { parseExpression } from "../../src/expr/parseExpression.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseExpression", () => {
  it("parses identifier", () => {
    const node = parseExpression("title");
    assert.equal(node.type, "identifier");
  });

  it("parses member access", () => {
    const node = parseExpression("object.key");
    assert.equal(node.type, "member");
  });

  it("parses default pipe", () => {
    const node = parseExpression('color | "transparent"');
    assert.equal(node.type, "default");
  });

  it("parses registered-style function calls", () => {
    const node = parseExpression('greet({ name: "Ada" })');
    assert.equal(node.type, "call");
    if (node.type === "call") {
      assert.equal(node.callee, "greet");
      assert.deepEqual(node.args, {
        name: { type: "literal", value: "Ada" },
      });
    }
  });

  it("parses expression values in call arguments", () => {
    const node = parseExpression("cityItem({ city: item.name, population: 1 })");
    assert.equal(node.type, "call");
    if (node.type === "call") {
      assert.equal(node.args.city?.type, "member");
      assert.deepEqual(node.args.population, { type: "literal", value: 1 });
    }
  });

  it("parses ternary expressions", () => {
    const node = parseExpression("a ? b : c");
    assert.equal(node.type, "ternary");
  });

  it("throws parse_error for bracket access", () => {
    try {
      parseExpression("arr[0]");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("parses arithmetic expressions", () => {
    const node = parseExpression("1 + 2");
    assert.equal(node.type, "binary");
  });

  it("throws parse_error for empty input", () => {
    try {
      parseExpression("   ");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("rejects length() as unsupported method", () => {
    assert.throws(
      () => parseExpression("items.length()"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("rejects slice() as unsupported method", () => {
    assert.throws(
      () => parseExpression("items.slice(0)"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("parses the null and undefined literals", () => {
    assert.deepEqual(parseExpression("null"), { type: "literal", value: null });
    assert.deepEqual(parseExpression("undefined"), {
      type: "literal",
      value: undefined,
    });
  });

  it("parses an empty object literal", () => {
    const node = parseExpression("{}");
    assert.deepEqual(node, { type: "literal", value: {} });
  });

  it("parses an empty array literal", () => {
    const node = parseExpression("[]");
    assert.deepEqual(node, { type: "literal", value: [] });
  });

  it("parses object literals with a trailing comma", () => {
    const node = parseExpression('{ a: 1, b: 2, }');
    assert.deepEqual(node, {
      type: "literal",
      value: { a: 1, b: 2 },
    });
  });

  it("parses array literals with a trailing comma", () => {
    const node = parseExpression("[1, 2, 3,]");
    assert.deepEqual(node, { type: "literal", value: [1, 2, 3] });
  });

  it("parses nested object and array literals", () => {
    const node = parseExpression('{ list: [1, "two", true, null], nested: { x: 1 } }');
    assert.deepEqual(node, {
      type: "literal",
      value: { list: [1, "two", true, null], nested: { x: 1 } },
    });
  });

  it("parses toLocaleString() with multiple literal arguments", () => {
    const node = parseExpression(
      "n.toLocaleString('en-US', { minimumFractionDigits: 2 })",
    );
    assert.equal(node.type, "method");
    if (node.type === "method") {
      assert.deepEqual(node.args, ["en-US", { minimumFractionDigits: 2 }]);
    }
  });

  it("parses toLocaleString() with no arguments", () => {
    const node = parseExpression("n.toLocaleString()");
    assert.equal(node.type, "method");
    if (node.type === "method") {
      assert.deepEqual(node.args, []);
    }
  });

  it("throws parse_error for trailing tokens after a full expression", () => {
    assert.throws(
      () => parseExpression("1 + 2 3"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for a member access missing the property name", () => {
    assert.throws(
      () => parseExpression("a."),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an object literal missing a closing brace", () => {
    assert.throws(
      () => parseExpression("{ a: 1"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an object literal with a missing colon", () => {
    assert.throws(
      () => parseExpression("{ a 1 }"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an object literal with an invalid key", () => {
    assert.throws(
      () => parseExpression("{ 1: 2 }"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an object literal with a non-literal value", () => {
    assert.throws(
      () => parseExpression("{ a: b }"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an object literal missing ',' or '}'", () => {
    assert.throws(
      () => parseExpression("{ a: 1 b: 2 }"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an array literal missing a closing bracket", () => {
    assert.throws(
      () => parseExpression("[1, 2"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an array literal missing ',' or ']'", () => {
    assert.throws(
      () => parseExpression("[1 2]"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an invalid number literal", () => {
    assert.throws(
      () => parseExpression("1.2.3"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an unterminated string literal", () => {
    assert.throws(
      () => parseExpression('"unterminated'),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for a string with an unterminated escape", () => {
    assert.throws(
      () => parseExpression('"abc\\'),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for call arguments missing '{'", () => {
    assert.throws(
      () => parseExpression("greet(1)"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for call arguments with a missing property name", () => {
    assert.throws(
      () => parseExpression("greet({ : 1 })"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for call arguments with a missing colon", () => {
    assert.throws(
      () => parseExpression("greet({ name 1 })"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for call arguments missing ',' or '}'", () => {
    assert.throws(
      () => parseExpression("greet({ a: 1 b: 2 })"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for call arguments missing a closing ')'", () => {
    assert.throws(
      () => parseExpression("greet({}"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("parses call with empty argument list", () => {
    const node = parseExpression("greet()");
    assert.equal(node.type, "call");
    if (node.type === "call") {
      assert.deepEqual(node.args, {});
    }
  });

  it("throws parse_error for an unterminated template literal escape", () => {
    assert.throws(
      () => parseExpression('`abc\\'),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for an unterminated template expression", () => {
    assert.throws(
      () => parseExpression("`${a"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("parses template literals containing a nested string with braces", () => {
    const node = parseExpression('`${a === "}"}`');
    assert.equal(node.type, "template");
  });

  it("throws parse_error for a negative number missing digits", () => {
    assert.throws(
      () => parseExpression("1 - -"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
