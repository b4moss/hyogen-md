import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import {
  classifyHyogenTokens,
  findHyogenRegions,
  findMustacheRegions,
  irFromCodeMirrorSpec,
  type HighlighterIr,
} from "../../../../../highlighter/src/index.ts";
import { hyogenCodeMirrorSpec } from "../../../../../highlighter/generated/codemirror/hyogenSpec.ts";

const TOKEN_CLASS: Record<string, string> = {
  keyword: "cm-hg-keyword",
  comment: "cm-hg-comment",
  string: "cm-hg-string",
  number: "cm-hg-number",
  operator: "cm-hg-operator",
  punctuation: "cm-hg-punctuation",
  identifier: "cm-hg-identifier",
  pipe: "cm-hg-pipe",
  marker: "cm-hg-directive",
};

function markFor(type: string) {
  const cls = TOKEN_CLASS[type] ?? "cm-hg-identifier";
  return Decoration.mark({ class: cls });
}

function buildBodyDecoration(docText: string, ir: HighlighterIr): DecorationSet {
  const ranges: { from: number; to: number; value: ReturnType<typeof Decoration.mark> }[] =
    [];

  for (const region of findHyogenRegions(docText)) {
    const openLen =
      region.kind === "hg-block"
        ? ir.markers.blockOpen.length
        : ir.markers.short.length;
    const closeLen =
      region.kind === "hg-block"
        ? ir.markers.blockClose.length
        : ir.markers.short.length;
    const innerFrom = region.from + openLen;
    const innerTo = region.to - closeLen;
    if (innerTo <= innerFrom) continue;
    const inner = docText.slice(innerFrom, innerTo);
    for (const tok of classifyHyogenTokens(inner, ir, "block")) {
      ranges.push({
        from: innerFrom + tok.from,
        to: innerFrom + tok.to,
        value: markFor(tok.type),
      });
    }
  }

  for (const region of findMustacheRegions(docText)) {
    const text = docText.slice(region.from, region.to);
    const triple = text.startsWith("{{{");
    const openLen = triple ? 3 : 2;
    const closeLen = triple ? 3 : 2;
    const innerFrom = region.from + openLen;
    const innerTo = region.to - closeLen;
    if (innerTo <= innerFrom) continue;
    const inner = docText.slice(innerFrom, innerTo);
    for (const tok of classifyHyogenTokens(inner, ir, "mustache")) {
      ranges.push({
        from: innerFrom + tok.from,
        to: innerFrom + tok.to,
        value: markFor(tok.type),
      });
    }
  }

  ranges.sort((a, b) => a.from - b.from || a.to - b.to);
  return Decoration.set(
    ranges.map((r) => r.value.range(r.from, r.to)),
    true,
  );
}

/**
 * Strict hyogen token decorations for fence-outside `@hg`/`@@` bodies
 * and mustache inners. Does not use a JavaScript language overlay.
 */
export function hyogenBodyHighlight(): Extension {
  const ir = irFromCodeMirrorSpec(hyogenCodeMirrorSpec);

  const plugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildBodyDecoration(view.state.doc.toString(), ir);
      }

      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.decorations = buildBodyDecoration(
            update.state.doc.toString(),
            ir,
          );
        }
      }
    },
    { decorations: (v) => v.decorations },
  );

  const theme = EditorView.baseTheme({
    ".cm-hg-keyword": { color: "var(--pg-hl-keyword)", fontWeight: "600" },
    ".cm-hg-comment": {
      color: "var(--pg-hl-comment)",
      fontStyle: "italic",
    },
    ".cm-hg-string": { color: "var(--pg-hl-string)" },
    ".cm-hg-number": { color: "var(--pg-hl-number)" },
    ".cm-hg-operator": { color: "var(--pg-hl-operator)" },
    ".cm-hg-punctuation": { color: "var(--pg-hl-punctuation)" },
    ".cm-hg-identifier": { color: "var(--pg-hl-variable)" },
    ".cm-hg-pipe": { color: "var(--pg-hl-operator)", fontWeight: "600" },
  });

  return [plugin, theme];
}
