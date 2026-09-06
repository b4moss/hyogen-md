import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { HighlighterDslError } from "./errors.ts";
import type { HighlighterIr } from "./types.ts";
import { normalizeTokenCategories } from "./normalizeTokenCategories.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_DSL_PATH = join(ROOT, "dsl", "hyogen.yml");

type RawDsl = {
  name?: unknown;
  version?: unknown;
  markers?: Record<string, unknown>;
  reserved_words?: unknown;
  keywords_extra?: unknown;
  keywords?: unknown;
  embedding?: Record<string, unknown>;
  comments?: Record<string, unknown>;
  operators?: unknown;
  punctuation?: unknown;
};

function requireString(
  obj: Record<string, unknown> | undefined,
  key: string,
  path: string,
): string {
  const value = obj?.[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new HighlighterDslError(path, `missing or empty string field '${key}'`);
  }
  return value;
}

function requireStringArray(
  value: unknown,
  fieldPath: string,
  opts: { allowEmpty?: boolean } = {},
): string[] {
  if (!Array.isArray(value)) {
    throw new HighlighterDslError(fieldPath, "must be an array of strings");
  }
  if (!opts.allowEmpty && value.length === 0) {
    throw new HighlighterDslError(fieldPath, "must not be empty");
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string" || item.length === 0) {
      throw new HighlighterDslError(fieldPath, "entries must be non-empty strings");
    }
    if (seen.has(item)) {
      throw new HighlighterDslError(fieldPath, `duplicate entry '${item}'`);
    }
    seen.add(item);
    out.push(item);
  }
  return out;
}

function parseAndValidate(raw: RawDsl): HighlighterIr {
  if (!raw || typeof raw !== "object") {
    throw new HighlighterDslError("<root>", "root must be a mapping");
  }

  if (typeof raw.name !== "string" || !raw.name) {
    throw new HighlighterDslError("name", "missing or empty string field 'name'");
  }
  if (typeof raw.version !== "number" || !Number.isFinite(raw.version)) {
    throw new HighlighterDslError("version", "missing numeric field 'version'");
  }

  if (raw.keywords != null) {
    throw new HighlighterDslError(
      "keywords",
      "unknown field 'keywords' (use reserved_words + keywords_extra)",
    );
  }

  const knownMarkerKeys = new Set([
    "block_open",
    "block_close",
    "short",
    "mustache_open",
    "mustache_close",
    "mustache_triple_open",
    "mustache_triple_close",
  ]);
  for (const key of Object.keys(raw.markers ?? {})) {
    if (!knownMarkerKeys.has(key)) {
      throw new HighlighterDslError(
        `markers.${key}`,
        `unknown token/marker field '${key}'`,
      );
    }
  }

  const markers = {
    blockOpen: requireString(raw.markers, "block_open", "markers.block_open"),
    blockClose: requireString(raw.markers, "block_close", "markers.block_close"),
    short: requireString(raw.markers, "short", "markers.short"),
    mustacheOpen: requireString(raw.markers, "mustache_open", "markers.mustache_open"),
    mustacheClose: requireString(
      raw.markers,
      "mustache_close",
      "markers.mustache_close",
    ),
    mustacheTripleOpen: requireString(
      raw.markers,
      "mustache_triple_open",
      "markers.mustache_triple_open",
    ),
    mustacheTripleClose: requireString(
      raw.markers,
      "mustache_triple_close",
      "markers.mustache_triple_close",
    ),
  };

  const reservedWords = requireStringArray(raw.reserved_words, "reserved_words");
  const keywordsExtra = requireStringArray(raw.keywords_extra ?? [], "keywords_extra", {
    allowEmpty: true,
  });

  for (const extra of keywordsExtra) {
    if (reservedWords.includes(extra)) {
      throw new HighlighterDslError(
        "keywords_extra",
        `duplicate entry '${extra}' already in reserved_words`,
      );
    }
  }

  if (!raw.embedding || typeof raw.embedding !== "object") {
    throw new HighlighterDslError("embedding", "missing mapping field 'embedding'");
  }
  if (raw.embedding.exclude_fences !== true) {
    throw new HighlighterDslError("embedding.exclude_fences", "must be true");
  }
  if (raw.embedding.incomplete !== "drop") {
    throw new HighlighterDslError("embedding.incomplete", "must be 'drop'");
  }

  const comments = {
    line: requireString(raw.comments, "line", "comments.line"),
    blockOpen: requireString(raw.comments, "block_open", "comments.block_open"),
    blockClose: requireString(raw.comments, "block_close", "comments.block_close"),
  };

  const operators = requireStringArray(raw.operators, "operators");
  const punctuation = requireStringArray(raw.punctuation, "punctuation");

  const ir: HighlighterIr = {
    name: raw.name,
    version: raw.version,
    markers,
    reservedWords,
    keywords: [...reservedWords, ...keywordsExtra],
    keywordsExtra,
    embedding: {
      excludeFences: true,
      incomplete: "drop",
    },
    comments,
    operators,
    punctuation,
  };

  normalizeTokenCategories(ir);
  return ir;
}

/** Load and validate highlighter DSL into a normalized IR. */
export function loadHighlighterDsl(dslPath: string = DEFAULT_DSL_PATH): HighlighterIr {
  let rawText: string;
  try {
    rawText = readFileSync(dslPath, "utf8");
  } catch (err) {
    throw new HighlighterDslError(
      dslPath,
      `failed to read file: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let raw: RawDsl;
  try {
    raw = parseYaml(rawText) as RawDsl;
  } catch (err) {
    throw new HighlighterDslError(
      dslPath,
      `invalid YAML: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return parseAndValidate(raw);
}

/** Validate a YAML string in memory. */
export function loadHighlighterDslFromSource(yamlSource: string): HighlighterIr {
  let raw: RawDsl;
  try {
    raw = parseYaml(yamlSource) as RawDsl;
  } catch (err) {
    throw new HighlighterDslError(
      "<memory>",
      `invalid YAML: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  return parseAndValidate(raw);
}
