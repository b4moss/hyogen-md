import { describe, expect, it } from "vitest";
import { loadHighlighterDsl } from "../../src/loadHighlighterDsl.ts";
import {
  classifyHyogenTokens,
  keywordTexts,
} from "../../src/classifyHyogenTokens.ts";
import { RESERVED_WORDS } from "../../../app/src/logic/reservedWords.ts";

describe("classifyHyogenTokens", () => {
  const ir = loadHighlighterDsl();

  it("marks each/as as keywords", () => {
    const src = "each items as item";
    expect(keywordTexts(src, ir)).toEqual(["each", "as"]);
  });

  it("marks if / endif as keywords", () => {
    expect(keywordTexts("if isNight\nendif", ir)).toEqual(["if", "endif"]);
  });

  it("marks include as keyword", () => {
    expect(keywordTexts('include "./x.md"', ir)).toContain("include");
  });

  it("classifies const, string, and operator", () => {
    const tokens = classifyHyogenTokens('const text = "foo"', ir);
    const types = tokens.map((t) => t.type);
    expect(types).toContain("keyword");
    expect(types).toContain("string");
    expect(types).toContain("operator");
    expect(srcSlice(tokens, 'const text = "foo"', "keyword")).toBe("const");
  });

  it("classifies line and block comments", () => {
    const src = "const x = 1 // c\n/* block */\neach y";
    const tokens = classifyHyogenTokens(src, ir);
    expect(tokens.filter((t) => t.type === "comment")).toHaveLength(2);
  });

  it("classifies mustache pipe and string", () => {
    const inner = 'color | "transparent"';
    const tokens = classifyHyogenTokens(inner, ir, "mustache");
    expect(tokens.some((t) => t.type === "pipe")).toBe(true);
    expect(tokens.some((t) => t.type === "string")).toBe(true);
  });

  it("returns empty for empty input", () => {
    expect(classifyHyogenTokens("", ir)).toEqual([]);
  });

  it("extends unclosed string to EOF", () => {
    const src = 'echo "foo';
    const tokens = classifyHyogenTokens(src, ir);
    const str = tokens.find((t) => t.type === "string")!;
    expect(src.slice(str.from, str.to)).toBe('"foo');
  });

  it("does not throw on unknown glyphs", () => {
    expect(() => classifyHyogenTokens("@@@ ###", ir)).not.toThrow();
  });

  it("recognizes every RESERVED_WORDS entry as keyword", () => {
    for (const word of RESERVED_WORDS) {
      const tokens = classifyHyogenTokens(word, ir);
      expect(tokens).toEqual([{ from: 0, to: word.length, type: "keyword" }]);
    }
  });

  it("recognizes else if as multi-word keyword", () => {
    expect(keywordTexts("else if cond", ir)[0]).toBe("else if");
  });

  it("does not treat eachItem as keyword", () => {
    expect(keywordTexts("eachItem", ir)).toEqual([]);
  });

  it("is case-sensitive (ENDIF is not a keyword)", () => {
    expect(keywordTexts("ENDIF", ir)).toEqual([]);
  });
});

function srcSlice(
  tokens: { from: number; to: number; type: string }[],
  source: string,
  type: string,
): string {
  const t = tokens.find((x) => x.type === type)!;
  return source.slice(t.from, t.to);
}
