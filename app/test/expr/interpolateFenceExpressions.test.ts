import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { interpolateFenceExpressions } from "../../src/expr/interpolateFenceExpressions.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

describe("interpolateFenceExpressions", () => {
  it("replaces ${} inside backtick fences", async () => {
    const source = "```\n# ${title}\n```";
    const result = await interpolateFenceExpressions(source, {
      title: "Hello",
    });
    assert.equal(result, "```\n# Hello\n```");
  });

  it("replaces multiple ${} in one fence", async () => {
    const source = "```\n${a}-${b}\n```";
    const result = await interpolateFenceExpressions(source, {
      a: "X",
      b: "Y",
    });
    assert.equal(result, "```\nX-Y\n```");
  });

  it("replaces ${} inside tilde fences", async () => {
    const source = "~~~\n# ${title}\n~~~";
    const result = await interpolateFenceExpressions(source, {
      title: "Hello",
    });
    assert.equal(result, "~~~\n# Hello\n~~~");
  });

  it("evaluates member, pipe, and ternary expressions", async () => {
    const source = [
      "```",
      "${user.name}",
      '${title | "fallback"}',
      '${flag ? "Y" : "N"}',
      "```",
    ].join("\n");
    const result = await interpolateFenceExpressions(source, {
      user: { name: "Ada" },
      title: "",
      flag: true,
    });
    assert.equal(result, "```\nAda\nfallback\nY\n```");
  });

  it("allows .length and .toLocaleString inside ${}", async () => {
    const source = "```\n${items.length} ${n.toLocaleString('en-US')}\n```";
    const result = await interpolateFenceExpressions(source, {
      items: [1, 2, 3],
      n: 1234,
    });
    assert.equal(result, "```\n3 1,234\n```");
  });

  it("leaves ${} outside fences untouched", async () => {
    const source = "before ${title}\n```\n${title}\n```\nafter ${title}";
    const result = await interpolateFenceExpressions(source, {
      title: "Hello",
    });
    assert.equal(
      result,
      "before ${title}\n```\nHello\n```\nafter ${title}",
    );
  });

  it("does not expand escaped \\${ inside fences", async () => {
    const source = "```\n\\${title}\n```";
    const result = await interpolateFenceExpressions(source, {
      title: "Hello",
    });
    assert.equal(result, "```\n${title}\n```");
  });

  it("renders unbound identifiers as empty string", async () => {
    const source = "```\n[${missing}]\n```";
    const result = await interpolateFenceExpressions(source, {});
    assert.equal(result, "```\n[]\n```");
  });

  it("treats unclosed fences as fence-through-EOF", async () => {
    const source = "```\n# ${title}";
    const result = await interpolateFenceExpressions(source, {
      title: "Hello",
    });
    assert.equal(result, "```\n# Hello");
  });

  it("throws parse_error for unclosed ${", async () => {
    await assert.rejects(
      () => interpolateFenceExpressions("```\n${title\n```", {}),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for component calls inside ${}", async () => {
    await assert.rejects(
      () =>
        interpolateFenceExpressions('```\n${greet({ name: "Ada" })}\n```', {}),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for unsupported methods inside ${}", async () => {
    await assert.rejects(
      () => interpolateFenceExpressions("```\n${name.slice(0)}\n```", {
        name: "Ada",
      }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws parse_error for invalid expression syntax inside ${}", async () => {
    await assert.rejects(
      () => interpolateFenceExpressions("```\n${a ? b}\n```", { a: true, b: 1 }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
