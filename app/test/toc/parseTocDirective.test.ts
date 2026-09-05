import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  isTocDirectiveLine,
  parseTocDirective,
} from "../../src/toc/parseTocDirective.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("parseTocDirective", () => {
  it("parses toc with default maxLevel 6", () => {
    assert.deepEqual(parseTocDirective("toc"), { maxLevel: 6 });
  });

  it("parses toc(1) through toc(6)", () => {
    for (let n = 1; n <= 6; n++) {
      assert.deepEqual(parseTocDirective(`toc(${n})`), { maxLevel: n });
    }
  });

  it("parses trimmed / block inner forms", () => {
    assert.deepEqual(parseTocDirective("  toc(3)  "), { maxLevel: 3 });
    assert.deepEqual(parseTocDirective("\ntoc(2)\n"), { maxLevel: 2 });
    assert.deepEqual(parseTocDirective("@hg toc(4) @endhg"), { maxLevel: 4 });
    assert.deepEqual(parseTocDirective("@@ toc(5) @@"), { maxLevel: 5 });
  });

  it("throws parse_error for invalid max levels", () => {
    for (const src of ["toc(0)", "toc(7)", "toc(-1)"]) {
      try {
        parseTocDirective(src);
        assert.fail(`expected throw for ${src}`);
      } catch (error) {
        assertHyogenError(error, "parse_error");
      }
    }
  });

  it("throws parse_error for non-integer and empty args", () => {
    for (const src of ["toc(3.5)", "toc(1.0)", "toc(abc)", "toc()"]) {
      try {
        parseTocDirective(src);
        assert.fail(`expected throw for ${src}`);
      } catch (error) {
        assertHyogenError(error, "parse_error");
      }
    }
  });

  it("throws parse_error for unsupported forms", () => {
    for (const src of ["toc(3, 4)", "toc 3", "toc\ntoc(2)"]) {
      try {
        parseTocDirective(src);
        assert.fail(`expected throw for ${JSON.stringify(src)}`);
      } catch (error) {
        assertHyogenError(error, "parse_error");
      }
    }
  });
});

describe("isTocDirectiveLine", () => {
  it("detects toc-like lines", () => {
    assert.equal(isTocDirectiveLine("toc"), true);
    assert.equal(isTocDirectiveLine("toc(3)"), true);
    assert.equal(isTocDirectiveLine("toc(0)"), true);
    assert.equal(isTocDirectiveLine("toc(abc)"), true);
  });

  it("rejects non-toc lines", () => {
    assert.equal(isTocDirectiveLine("include ./x.md"), false);
    assert.equal(isTocDirectiveLine("if true"), false);
    assert.equal(isTocDirectiveLine("const x = 1"), false);
    assert.equal(isTocDirectiveLine(""), false);
    assert.equal(isTocDirectiveLine("toc 3"), false);
  });
});
