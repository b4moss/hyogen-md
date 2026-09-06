import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { expandControlStructures } from "../../src/control/expandControlStructures.js";
import { renderDocument } from "../../src/pipeline/renderDocument.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";

function hg(line: string): string {
  return `<!--@hg\n${line}\n@endhg-->`;
}

describe("renderDocument v0.14 fence ${}", () => {
  it("interpolates fence ${} from front matter context", async () => {
    const source = [
      "---",
      "var_name: Hello",
      "---",
      "```markdown",
      "# ${var_name}",
      "```",
    ].join("\n");
    const result = await renderDocument(source);
    assert.equal(result.markdown, "```markdown\n# Hello\n```");
  });

  it("interpolates fence ${} while leaving outside ${} literal", async () => {
    const source = [
      "---",
      'x: "in"',
      "---",
      "out ${x}",
      "```",
      "${x}",
      "```",
    ].join("\n");
    const result = await renderDocument(source);
    assert.equal(result.markdown, "out ${x}\n```\nin\n```");
  });

  it("still expands mustache {{ }} inside fences", async () => {
    const source = [
      "---",
      "title: Kept",
      "---",
      "```",
      "{{ title }}",
      "```",
    ].join("\n");
    const result = await renderDocument(source);
    assert.equal(result.markdown, "```\nKept\n```");
  });

  it("propagates parse_error for unclosed fence ${}", async () => {
    await assert.rejects(
      () => renderDocument("```\n${title\n```"),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});

describe("expandControlStructures v0.14 fence ${} in each", () => {
  it("interpolates fence ${} with each binding", async () => {
    const source = [
      hg("each name in items"),
      "```",
      "${name}",
      "```",
      hg("endeach"),
    ].join("\n");
    const result = await expandControlStructures(source, {
      context: { items: ["a", "b"] },
    });
    assert.equal(result, "```\na\n```\n```\nb\n```\n");
  });

  it("allows mustache and fence ${} together in each body", async () => {
    const source = [
      hg("each name in items"),
      "- {{ name }}",
      "```",
      "${name}",
      "```",
      hg("endeach"),
    ].join("\n");
    const result = await expandControlStructures(source, {
      context: { items: ["x"] },
    });
    assert.equal(result, "- x\n```\nx\n```\n");
  });

  it("throws parse_error for invalid fence ${} in each body", async () => {
    const source = [
      hg("each name in items"),
      "```",
      "${name",
      "```",
      hg("endeach"),
    ].join("\n");
    await assert.rejects(
      () =>
        expandControlStructures(source, {
          context: { items: ["a"] },
        }),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
