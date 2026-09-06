import path from "node:path";
import { createFsLoader } from "./createFsLoader.js";
import { isRemotePath } from "./isRemotePath.js";
import { parseDataFile } from "./parseDataFile.js";
import { createHyogenError } from "../errors/createError.js";
import { findDocRoot } from "../paths/findDocRoot.js";
import { resolveTemplatePath } from "../paths/resolveTemplatePath.js";
import type { DataSourcesMap, HyogenContext, HyogenError, Loader } from "../types.js";

/** Max UTF-8 byte length per data source file (5 MiB). */
export const DATA_SOURCE_MAX_BYTES = 5 * 1024 * 1024;

export type LoadDataSourcesOptions = {
  root?: string;
  loader?: Loader;
};

function isHyogenError(error: unknown): error is HyogenError {
  return (
    error instanceof Error &&
    error.name === "HyogenError" &&
    "code" in error &&
    typeof (error as HyogenError).code === "string"
  );
}

function resolveDataRoot(options?: LoadDataSourcesOptions): string {
  if (options?.root) {
    return path.resolve(options.root);
  }
  return findDocRoot(process.cwd()) ?? process.cwd();
}

export async function loadDataSources(
  sources: DataSourcesMap,
  options?: LoadDataSourcesOptions,
): Promise<HyogenContext> {
  const rootDir = resolveDataRoot(options);
  // Remote data sources are rejected below; default to FS-only (no fetch).
  // Using createNodeLoader here reintroduced CodeQL js/request-forgery via
  // writing-preview paths that only ever need local files.
  const loader = options?.loader ?? createFsLoader();
  const context: HyogenContext = {};

  for (const [name, relativePath] of Object.entries(sources)) {
    if (isRemotePath(relativePath)) {
      throw createHyogenError({
        code: "load_failed",
        path: relativePath,
        details: {
          path: relativePath,
          reason: "remote data sources are not supported",
        },
      });
    }

    const resolvedPath = resolveTemplatePath(relativePath, { rootDir });
    let source: string;
    try {
      source = await loader(resolvedPath);
    } catch (error) {
      if (isHyogenError(error)) {
        throw error;
      }
      throw createHyogenError({
        code: "load_failed",
        path: resolvedPath,
        details: {
          path: resolvedPath,
          reason: error instanceof Error ? error.message : "unknown load error",
        },
      });
    }

    const size = Buffer.byteLength(source, "utf8");
    if (size > DATA_SOURCE_MAX_BYTES) {
      throw createHyogenError({
        code: "data_source_too_large",
        path: resolvedPath,
        details: {
          path: resolvedPath,
          size,
          limit: DATA_SOURCE_MAX_BYTES,
        },
      });
    }

    context[name] = await parseDataFile(source, resolvedPath);
  }

  return context;
}
