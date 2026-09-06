/**
 * Playground re-exports region helpers from the repo-local highlighter package
 * so docs-site and codegen share one source of truth.
 */
export {
  findFenceRanges,
  findHyogenRegions,
  findHyogenDirectiveMarks,
  findMustacheRegions,
  type HyogenRegionKind,
  type TextRegion,
  type MustacheRegion,
  type HyogenDirectiveMark,
} from "../../../../../highlighter/src/findHyogenRegions.ts";
