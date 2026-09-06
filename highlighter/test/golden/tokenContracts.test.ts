import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadHighlighterDsl } from "../../src/loadHighlighterDsl.ts";
import { classifyHyogenTokens } from "../../src/classifyHyogenTokens.ts";
import { findHyogenRegions } from "../../src/findHyogenRegions.ts";
import { emitAll } from "../../src/emit/generateAll.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const FIXTURES = join(ROOT, "test", "fixtures");

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), "utf8");
}

describe("token contracts / golden", () => {
  const ir = loadHighlighterDsl();

  it("basic-hg-block: each/if/include/endif/endeach are keywords", () => {
    const src = loadFixture("basic-hg-block.md");
    const regions = findHyogenRegions(src);
    expect(regions.length).toBeGreaterThan(0);
    const region = regions[0]!;
    const open = ir.markers.blockOpen.length;
    const close = ir.markers.blockClose.length;
    const inner = src.slice(region.from + open, region.to - close);
    const keywords = classifyHyogenTokens(inner, ir)
      .filter((t) => t.type === "keyword")
      .map((t) => inner.slice(t.from, t.to));
    for (const word of ["const", "if", "each", "include", "endif", "endeach"]) {
      expect(keywords).toContain(word);
    }
  });

  it("fence-noise: no hyogen regions inside fences", () => {
    const src = loadFixture("fence-noise.md");
    expect(findHyogenRegions(src)).toEqual([]);
  });

  it("mustache: pipe token present inside expression", () => {
    const inner = 'color | "transparent"';
    const types = classifyHyogenTokens(inner, ir, "mustache").map((t) => t.type);
    expect(types).toContain("pipe");
    expect(types).toContain("string");
  });

  it("generated artifacts stay in sync with emitAll(ir)", () => {
    const artifacts = emitAll(ir);
    expect(
      readFileSync(
        join(ROOT, "generated", "textmate", "hyogen.tmLanguage.json"),
        "utf8",
      ),
    ).toBe(artifacts.textmate);
    expect(
      readFileSync(join(ROOT, "generated", "prism", "hyogen.js"), "utf8"),
    ).toBe(artifacts.prism);
    expect(
      readFileSync(join(ROOT, "generated", "highlightjs", "hyogen.js"), "utf8"),
    ).toBe(artifacts.highlightjs);
    expect(
      readFileSync(
        join(ROOT, "generated", "codemirror", "hyogenSpec.ts"),
        "utf8",
      ),
    ).toBe(artifacts.codemirror);
    expect(
      readFileSync(
        join(ROOT, "generated", "monaco", "hyogen.monarch.json"),
        "utf8",
      ),
    ).toBe(artifacts.monaco);
  });
});
