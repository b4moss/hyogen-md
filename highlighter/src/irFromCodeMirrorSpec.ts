import type { HighlighterIr } from "../types.ts";

/** Minimal shape shared with generated/codemirror/hyogenSpec.ts */
export type HyogenCodeMirrorSpecLike = {
  name: string;
  version: number;
  markers: HighlighterIr["markers"];
  reservedWords: string[];
  keywords: string[];
  keywordsExtra?: string[];
  comments: HighlighterIr["comments"];
  operators: string[];
  punctuation: string[];
};

/** Build a HighlighterIr from the generated CodeMirror spec (browser-safe). */
export function irFromCodeMirrorSpec(spec: HyogenCodeMirrorSpecLike): HighlighterIr {
  const keywordsExtra =
    spec.keywordsExtra ??
    spec.keywords.filter((k) => !spec.reservedWords.includes(k));

  return {
    name: spec.name,
    version: spec.version,
    markers: spec.markers,
    reservedWords: [...spec.reservedWords],
    keywords: [...spec.keywords],
    keywordsExtra,
    embedding: {
      excludeFences: true,
      incomplete: "drop",
    },
    comments: spec.comments,
    operators: [...spec.operators],
    punctuation: [...spec.punctuation],
  };
}
