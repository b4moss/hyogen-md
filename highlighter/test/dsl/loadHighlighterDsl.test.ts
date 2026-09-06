import { describe, expect, it } from "vitest";
import {
  HighlighterDslError,
  loadHighlighterDsl,
  loadHighlighterDslFromSource,
} from "../../src/index.ts";
import { normalizeTokenCategories } from "../../src/normalizeTokenCategories.ts";
import { RESERVED_WORDS } from "../../../app/src/logic/reservedWords.ts";

const MINIMAL_DSL = `
name: hyogen
version: 1
markers:
  block_open: "@hg"
  block_close: "@endhg"
  short: "@@"
  mustache_open: "{{"
  mustache_close: "}}"
  mustache_triple_open: "{{{"
  mustache_triple_close: "}}}"
reserved_words:
  - if
  - each
keywords_extra: []
embedding:
  exclude_fences: true
  incomplete: drop
comments:
  line: "//"
  block_open: "/*"
  block_close: "*/"
operators:
  - "="
punctuation:
  - "("
  - ")"
`;

describe("loadHighlighterDsl", () => {
  it("loads repo DSL into IR with markers, keywords, embedding", () => {
    const ir = loadHighlighterDsl();
    expect(ir.name).toBe("hyogen");
    expect(ir.markers.blockOpen).toBe("@hg");
    expect(ir.markers.blockClose).toBe("@endhg");
    expect(ir.markers.short).toBe("@@");
    expect(ir.embedding.excludeFences).toBe(true);
    expect(ir.embedding.incomplete).toBe("drop");
    expect(ir.keywords.length).toBeGreaterThan(0);
  });

  it("matches app RESERVED_WORDS exactly (no missing / no extra reserved)", () => {
    const ir = loadHighlighterDsl();
    expect(new Set(ir.reservedWords)).toEqual(RESERVED_WORDS);
  });

  it("encodes fence exclusion and incomplete=drop embedding rules", () => {
    const ir = loadHighlighterDslFromSource(MINIMAL_DSL);
    expect(ir.embedding).toEqual({ excludeFences: true, incomplete: "drop" });
  });

  it("rejects missing required fields with path in message", () => {
    expect(() =>
      loadHighlighterDslFromSource(`
name: hyogen
version: 1
`),
    ).toThrow(HighlighterDslError);
    try {
      loadHighlighterDslFromSource(`name: hyogen\nversion: 1\n`);
    } catch (err) {
      expect(err).toBeInstanceOf(HighlighterDslError);
      expect(String(err)).toMatch(/markers/);
    }
  });

  it("rejects unknown token/marker fields", () => {
    expect(() =>
      loadHighlighterDslFromSource(
        MINIMAL_DSL.replace(
          "mustache_triple_close: \"}}}\"",
          "mustache_triple_close: \"}}}\"\n  weird: true",
        ),
      ),
    ).toThrow(/markers\.weird/);
  });

  it("rejects empty reserved_words", () => {
    expect(() =>
      loadHighlighterDslFromSource(
        MINIMAL_DSL.replace(
          /reserved_words:[\s\S]*?keywords_extra:/,
          "reserved_words: []\nkeywords_extra:",
        ),
      ),
    ).toThrow(/reserved_words/);
  });
});

describe("normalizeTokenCategories", () => {
  it("treats else if as a multi-word keyword", () => {
    const ir = loadHighlighterDsl();
    const cats = normalizeTokenCategories(ir);
    expect(cats.multiWordKeywords).toContain("else if");
    expect(cats.singleWordKeywords).toContain("each");
    expect(cats.singleWordKeywords).not.toContain("else if");
  });

  it("keeps comment openers in comments category", () => {
    const cats = normalizeTokenCategories(loadHighlighterDsl());
    expect(cats.comments.line).toBe("//");
    expect(cats.comments.blockOpen).toBe("/*");
  });

  it("rejects duplicate keywords", () => {
    const ir = loadHighlighterDsl();
    ir.keywords = [...ir.keywords, "each"];
    expect(() => normalizeTokenCategories(ir)).toThrow(/duplicate/);
  });

  it("rejects empty string tokens", () => {
    const ir = loadHighlighterDsl();
    ir.keywords = ["", "if"];
    expect(() => normalizeTokenCategories(ir)).toThrow(/empty/);
  });
});
