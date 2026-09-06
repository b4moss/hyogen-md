import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { playgroundSyntaxHighlighting } from "./playgroundHighlightStyle";
import type { Extension } from "@codemirror/state";
import {
  findHyogenDirectiveMarks,
  findMustacheRegions,
} from "./findHyogenRegions";
import { hyogenBodyHighlight } from "./hyogenBodyHighlight";

const hyogenDirectiveMark = Decoration.mark({ class: "cm-hg-directive" });
const mustacheMark = Decoration.mark({ class: "cm-hg-mustache" });

function buildHyogenDirectiveDecoration(docText: string): DecorationSet {
  const ranges = findHyogenDirectiveMarks(docText).map((mark) =>
    hyogenDirectiveMark.range(mark.from, mark.to),
  );
  return Decoration.set(ranges, true);
}

function buildMustacheDecoration(docText: string): DecorationSet {
  const ranges = findMustacheRegions(docText).map((region) =>
    mustacheMark.range(region.from, region.to),
  );
  return Decoration.set(ranges, true);
}

const hyogenDirectiveHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildHyogenDirectiveDecoration(
        view.state.doc.toString(),
      );
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildHyogenDirectiveDecoration(
          update.state.doc.toString(),
        );
      }
    }
  },
  { decorations: (v) => v.decorations },
);

const mustacheHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildMustacheDecoration(view.state.doc.toString());
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.decorations = buildMustacheDecoration(
          update.state.doc.toString(),
        );
      }
    }
  },
  { decorations: (v) => v.decorations },
);

const hyogenDirectiveTheme = EditorView.baseTheme({
  ".cm-hg-directive": {
    color: "var(--pg-hg-directive)",
    backgroundColor:
      "color-mix(in srgb, var(--pg-hg-directive) 12%, transparent)",
    borderRadius: "2px",
  },
});

const mustacheTheme = EditorView.baseTheme({
  ".cm-hg-mustache": {
    color: "var(--pg-hg-mustache)",
    backgroundColor:
      "color-mix(in srgb, var(--pg-hg-mustache) 12%, transparent)",
    borderRadius: "2px",
  },
});

/**
 * Markdown + strict hyogen token highlight for fence-outside `@hg`/`@@`
 * regions and mustache inners (no JavaScript language overlay).
 */
export function hyogenMarkdown(): Extension {
  return [
    markdown({ base: markdownLanguage }),
    playgroundSyntaxHighlighting(),
    hyogenBodyHighlight(),
    hyogenDirectiveHighlight,
    hyogenDirectiveTheme,
    mustacheHighlight,
    mustacheTheme,
  ];
}
