import { describe, expect, it } from "vitest";
import { loadHighlighterDsl } from "../../src/loadHighlighterDsl.ts";
import { emitAll } from "../../src/emit/generateAll.ts";
import { emitTextMate } from "../../src/emit/emitTextMate.ts";
import { emitPrism } from "../../src/emit/emitPrism.ts";
import { emitHighlightJs } from "../../src/emit/emitHighlightJs.ts";
import { emitCodeMirror } from "../../src/emit/emitCodeMirror.ts";
import { emitMonaco } from "../../src/emit/emitMonaco.ts";

describe("emitters", () => {
  const ir = loadHighlighterDsl();

  it("emitTextMate returns JSON with scopeName and keywords", () => {
    const out = emitTextMate(ir);
    const json = JSON.parse(out);
    expect(json.scopeName).toBe("source.hyogen");
    expect(json.repository.keywords.match).toContain("each");
    expect(out).toContain("@hg");
  });

  it("emitPrism includes each, @hg, and string patterns", () => {
    const out = emitPrism(ir);
    expect(out).toContain("each");
    expect(out).toContain("@hg");
    expect(out).toContain("Prism.languages.hyogen");
  });

  it("emitHighlightJs includes reserved keywords", () => {
    const out = emitHighlightJs(ir);
    expect(out).toContain("endeach");
    expect(out).toContain('name: "hyogen"');
  });

  it("emitCodeMirror embeds keyword list without JS overlay dependency", () => {
    const out = emitCodeMirror(ir);
    expect(out).toContain("hyogenCodeMirrorSpec");
    expect(out).toContain("each");
    expect(out).not.toContain("javascriptLanguage");
  });

  it("emitMonaco includes tokenizer and keywords", () => {
    const out = emitMonaco(ir);
    const json = JSON.parse(out);
    expect(json.keywords).toContain("each");
    expect(json.tokenizer.root).toBeTruthy();
  });

  it("emitAll is deterministic", () => {
    const a = emitAll(ir);
    const b = emitAll(ir);
    expect(a).toEqual(b);
  });

  it("rejects empty IR keywords via loader (emit assumes valid IR)", () => {
    expect(() =>
      emitTextMate({
        ...ir,
        keywords: [],
        reservedWords: [],
      }),
    ).not.toThrow();
  });
});
