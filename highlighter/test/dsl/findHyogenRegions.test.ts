import { describe, expect, it } from "vitest";
import {
  findHyogenDirectiveMarks,
  findHyogenRegions,
  findMustacheRegions,
} from "../../src/findHyogenRegions.ts";

describe("findHyogenRegions", () => {
  it("finds one multiline <!-- @hg … @endhg --> block", () => {
    const src = `Hello

<!--
@hg
const x = 1
@endhg
-->

World`;
    const regions = findHyogenRegions(src);
    expect(regions).toHaveLength(1);
    expect(regions[0]!.kind).toBe("hg-block");
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("@hg");
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("@endhg");
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("const x");
  });

  it("finds @@ shorthand as hg-short", () => {
    const src = `before <!--@@ const x = 1 @@--> after`;
    const regions = findHyogenRegions(src);
    expect(regions).toHaveLength(1);
    expect(regions[0]!.kind).toBe("hg-short");
  });

  it("keeps fence-outside and drops fence-inside", () => {
    const src = `<!--
@hg
const outer = 1
@endhg
-->

\`\`\`
<!--
@hg
const inner = 2
@endhg
-->
\`\`\``;
    const regions = findHyogenRegions(src);
    expect(regions).toHaveLength(1);
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("outer");
  });

  it("returns empty without hyogen", () => {
    expect(findHyogenRegions("# Hello")).toEqual([]);
  });

  it("drops incomplete @hg without @endhg", () => {
    expect(
      findHyogenRegions(`<!--
@hg
const x = 1
-->`),
    ).toEqual([]);
  });

  it("returns empty for empty string", () => {
    expect(findHyogenRegions("")).toEqual([]);
  });
});

describe("findMustacheRegions", () => {
  it("finds {{ name }}", () => {
    const src = "Hello {{ name }}";
    const regions = findMustacheRegions(src);
    expect(regions).toHaveLength(1);
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toBe("{{ name }}");
  });

  it("prefers triple mustache as one span", () => {
    const src = "{{{ raw }}}";
    const regions = findMustacheRegions(src);
    expect(regions).toHaveLength(1);
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toBe("{{{ raw }}}");
  });

  it("ignores mustache inside fences", () => {
    expect(findMustacheRegions("```\n{{ name }}\n```")).toEqual([]);
  });

  it("keeps pipe inside mustache span", () => {
    const src = '{{ color | "transparent" }}';
    const regions = findMustacheRegions(src);
    expect(regions).toHaveLength(1);
    expect(src.slice(regions[0]!.from, regions[0]!.to)).toContain("|");
  });

  it("drops incomplete {{", () => {
    expect(findMustacheRegions("Hello {{ name")).toEqual([]);
  });
});

describe("findHyogenDirectiveMarks", () => {
  it("marks @hg and @endhg", () => {
    const src = `<!--
@hg
const x = 1
@endhg
-->`;
    const marks = findHyogenDirectiveMarks(src);
    expect(marks).toHaveLength(2);
    expect(src.slice(marks[0]!.from, marks[0]!.to)).toBe("@hg");
    expect(src.slice(marks[1]!.from, marks[1]!.to)).toBe("@endhg");
  });

  it("marks both @@ for shorthand", () => {
    const src = `<!--@@ const x = 1 @@-->`;
    const marks = findHyogenDirectiveMarks(src);
    expect(marks).toHaveLength(2);
    expect(src.slice(marks[0]!.from, marks[0]!.to)).toBe("@@");
    expect(src.slice(marks[1]!.from, marks[1]!.to)).toBe("@@");
  });

  it("returns empty when no regions", () => {
    expect(findHyogenDirectiveMarks("plain")).toEqual([]);
  });
});
