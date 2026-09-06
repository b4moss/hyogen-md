import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { executeStatementList } from "../../src/logic/executeStatement.js";
import {
  isExecutableBlockSource,
  parseStatementList,
} from "../../src/logic/parseStatement.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("statements v0.7", () => {
  it("runs for loop summing 0..2", async () => {
    const statements = parseStatementList(`
      let sum = 0
      for (let i = 0; i < 3; i = i + 1) {
        sum = sum + i
      }
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.sum, 3);
  });

  it("runs do…while", async () => {
    const statements = parseStatementList(`
      let n = 0
      do {
        n = n + 1
      } while (n < 3)
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.n, 3);
  });

  it("supports ++ and compound assign", async () => {
    const statements = parseStatementList(`
      let i = 0
      i++
      ++i
      i += 2
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.i, 4);
  });

  it("supports nested for", async () => {
    const statements = parseStatementList(`
      let total = 0
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          total = total + 1
        }
      }
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.total, 4);
  });

  it("throws parse_error for empty for condition", () => {
    try {
      parseStatementList("for (;;) { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for bare while", () => {
    try {
      parseStatementList("while (x) { x = x + 1 }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for for-of", () => {
    try {
      parseStatementList("for (x of y) { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for for-in", () => {
    try {
      parseStatementList("for (x in y) { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unclosed brace", () => {
    try {
      parseStatementList("for (let i = 0; i < 1; i++) { i = i + 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for empty statement block (empty string)", () => {
    try {
      parseStatementList("");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for statement block that is only a comment", () => {
    try {
      parseStatementList("// just a comment");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for trailing tokens after valid statement", () => {
    try {
      parseStatementList("let x = 1 ) ");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unexpected '==' in assignment", () => {
    try {
      parseStatementList("x == 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for bare identifier statement", () => {
    try {
      parseStatementList("x");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for ++ without identifier", () => {
    try {
      parseStatementList("++ 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for const without '='", () => {
    try {
      parseStatementList("const x");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for let without '='", () => {
    try {
      parseStatementList("let x");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for reserved word used as identifier in declaration", () => {
    try {
      parseStatementList("const if = 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for reserved word used as identifier in assignment", () => {
    try {
      parseStatementList("if = 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for for without '(' ", () => {
    try {
      parseStatementList("for x { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for for missing '{' after header", () => {
    try {
      parseStatementList("for (let i = 0; i < 1; i++) i = i + 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("supports for with empty init and update clauses", async () => {
    const statements = parseStatementList(`
      let i = 0
      for (; i < 3; ) {
        i = i + 1
      }
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.i, 3);
  });

  it("supports for header string literals containing semicolons", async () => {
    const statements = parseStatementList(`
      let s = ""
      for (let i = 0; i < 2; i++) {
        s = s + ";"
      }
    `);
    const context: Record<string, unknown> = {};
    await executeStatementList(statements, context);
    assert.equal(context.s, ";;");
  });

  it("throws parse_error for do missing '{' after do", () => {
    try {
      parseStatementList("do x = 1 } while (x < 1)");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for do missing '}' to close body", () => {
    try {
      parseStatementList("do { x = 1 while (x < 1)");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for do missing 'while' after body", () => {
    try {
      parseStatementList("do { x = 1 }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for do-while missing '(' after while", () => {
    try {
      parseStatementList("do { x = 1 } while x < 1)");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for do-while with empty condition", () => {
    try {
      parseStatementList("do { x = 1 } while ()");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for trailing unmatched '}' after a valid statement", () => {
    try {
      parseStatementList("let x = 1\n}");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for a statement starting with '='", () => {
    try {
      parseStatementList("= 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for const with no identifier before '='", () => {
    try {
      parseStatementList("const = 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for for…of even when the header has three clauses", () => {
    try {
      parseStatementList("for (x of y; 1; ) { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for do with no closing '}' at all", () => {
    try {
      parseStatementList("do { x = 1");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  it("throws parse_error for unexpected token in for clause", () => {
    try {
      parseStatementList("for (let i = 0 extra; i < 1; i++) { }");
      assert.fail("expected throw");
    } catch (error) {
      assertHyogenError(error, "parse_error");
    }
  });

  describe("isExecutableBlockSource", () => {
    it("returns false for empty/whitespace/comment-only source", () => {
      assert.equal(isExecutableBlockSource(""), false);
      assert.equal(isExecutableBlockSource("   "), false);
      assert.equal(isExecutableBlockSource("// nothing here"), false);
    });

    it("returns true for recognized executable statement starts", () => {
      assert.equal(isExecutableBlockSource("const x = 1"), true);
      assert.equal(isExecutableBlockSource("let x = 1"), true);
      assert.equal(isExecutableBlockSource("echo x"), true);
      assert.equal(isExecutableBlockSource("for (;;) {}"), true);
      assert.equal(isExecutableBlockSource("do { } while (x)"), true);
      assert.equal(isExecutableBlockSource("++x"), true);
      assert.equal(isExecutableBlockSource("--x"), true);
      assert.equal(isExecutableBlockSource("x = 1"), true);
      assert.equal(isExecutableBlockSource("x++"), true);
      assert.equal(isExecutableBlockSource("x += 1"), true);
    });

    it("returns false for non-executable source", () => {
      assert.equal(isExecutableBlockSource("someExpr.value"), false);
    });
  });

  describe("executeStatement compound/update guards", () => {
    it("throws parse_error for ++ on a const binding", async () => {
      const statements = parseStatementList("i++");
      const context: Record<string, unknown> = { i: 0 };
      await assert.rejects(
        () =>
          executeStatementList(statements, context, {
            constBindings: new Set(["i"]),
          }),
        (error: unknown) => {
          assertHyogenError(error, "parse_error");
          return true;
        },
      );
    });

    it("throws parse_error for ++ on an undeclared variable", async () => {
      const statements = parseStatementList("i++");
      await assert.rejects(
        () => executeStatementList(statements, {}),
        (error: unknown) => {
          assertHyogenError(error, "parse_error");
          return true;
        },
      );
    });

    it("throws parse_error for compound assignment on a const binding", async () => {
      const statements = parseStatementList("i += 1");
      const context: Record<string, unknown> = { i: 0 };
      await assert.rejects(
        () =>
          executeStatementList(statements, context, {
            constBindings: new Set(["i"]),
          }),
        (error: unknown) => {
          assertHyogenError(error, "parse_error");
          return true;
        },
      );
    });

    it("throws parse_error for compound assignment on an undeclared variable", async () => {
      const statements = parseStatementList("i += 1");
      await assert.rejects(
        () => executeStatementList(statements, {}),
        (error: unknown) => {
          assertHyogenError(error, "parse_error");
          return true;
        },
      );
    });

    it("supports -=, *=, and /= compound assignment operators", async () => {
      const statements = parseStatementList(
        ["let a = 10", "a -= 3", "let b = 4", "b *= 5", "let c = 20", "c /= 4"].join(
          "\n",
        ),
      );
      const context: Record<string, unknown> = {};
      await executeStatementList(statements, context);
      assert.equal(context.a, 7);
      assert.equal(context.b, 20);
      assert.equal(context.c, 5);
    });
  });
});
