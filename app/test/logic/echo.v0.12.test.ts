import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { executeStatementList } from "../../src/logic/executeStatement.js";
import {
  isExecutableBlockSource,
  parseStatementList,
} from "../../src/logic/parseStatement.js";
import { executeDeclarations } from "../../src/logic/executeDeclarations.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("echo v0.12", () => {
  it("parses echo identifier", () => {
    const statements = parseStatementList("echo greet");
    assert.equal(statements.length, 1);
    assert.equal(statements[0]!.kind, "echo");
  });

  it("treats echo-only source as executable", () => {
    assert.equal(isExecutableBlockSource("echo greet"), true);
  });

  it("executes echo into chunks", async () => {
    const statements = parseStatementList('echo "hi"');
    const echoChunks: string[] = [];
    await executeStatementList(statements, {}, { echoChunks });
    assert.deepEqual(echoChunks, ["hi"]);
  });

  it("concatenates multiple echoes", async () => {
    const statements = parseStatementList('echo "a"\necho "b"');
    const echoChunks: string[] = [];
    await executeStatementList(statements, {}, { echoChunks });
    assert.deepEqual(echoChunks, ["a", "b"]);
  });

  it("stringifies nullish echo as empty", async () => {
    const statements = parseStatementList("echo missing");
    const echoChunks: string[] = [];
    await executeStatementList(statements, {}, { echoChunks });
    assert.deepEqual(echoChunks, [""]);
  });

  it("replaces @hg block with echo output", async () => {
    const source = [
      "A",
      "<!--@hg",
      'const greet = "Hello world!"',
      "echo greet",
      "@endhg-->",
      "B",
    ].join("\n");
    const { source: result, context } = await executeDeclarations(source);
    assert.equal(context.greet, "Hello world!");
    assert.equal(result, "A\nHello world!\nB");
  });

  it("supports @@ echo shorthand with prior declaration", async () => {
    const source = [
      "<!--@hg",
      'const greet = "Hi"',
      "@endhg-->",
      "<!--@@ echo greet @@-->",
    ].join("\n");
    const { source: result } = await executeDeclarations(source);
    assert.equal(result, "\nHi");
  });

  it("accumulates echo inside for", async () => {
    const source = [
      "<!--@hg",
      "let s = \"\"",
      "for (let i = 0; i < 3; i++) {",
      '  echo "x"',
      "}",
      "@endhg-->",
    ].join("\n");
    const { source: result } = await executeDeclarations(source);
    assert.equal(result, "xxx");
  });

  it("rejects echo without expression", () => {
    assert.throws(
      () => parseStatementList("echo"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("rejects const echo as reserved word", () => {
    assert.throws(
      () => parseStatementList("const echo = 1"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
