export type HyogenRegionKind = "hg-block" | "hg-short";

export type TextRegion = {
  from: number;
  to: number;
  kind: HyogenRegionKind;
};

export type MustacheRegion = {
  from: number;
  to: number;
};

export type HyogenDirectiveMark = {
  from: number;
  to: number;
};

export type TokenType =
  | "keyword"
  | "comment"
  | "string"
  | "number"
  | "operator"
  | "punctuation"
  | "identifier"
  | "pipe"
  | "marker";

export type HyogenToken = {
  from: number;
  to: number;
  type: TokenType;
};

export type HighlighterMarkers = {
  blockOpen: string;
  blockClose: string;
  short: string;
  mustacheOpen: string;
  mustacheClose: string;
  mustacheTripleOpen: string;
  mustacheTripleClose: string;
};

export type HighlighterEmbedding = {
  excludeFences: boolean;
  incomplete: "drop";
};

export type HighlighterComments = {
  line: string;
  blockOpen: string;
  blockClose: string;
};

export type HighlighterIr = {
  name: string;
  version: number;
  markers: HighlighterMarkers;
  /** Exactly matches app RESERVED_WORDS. */
  reservedWords: string[];
  /** reservedWords + keywordsExtra (multi-word allowed). */
  keywords: string[];
  keywordsExtra: string[];
  embedding: HighlighterEmbedding;
  comments: HighlighterComments;
  operators: string[];
  punctuation: string[];
};

export type TokenCategories = {
  keywords: string[];
  multiWordKeywords: string[];
  singleWordKeywords: string[];
  comments: HighlighterComments;
  operators: string[];
  punctuation: string[];
  markers: HighlighterMarkers;
};
