import type { DataSourcesMap, HyogenContext } from "../types.js";

/**
 * User-facing config for `hyogen.config.(js|ts)`.
 * Maps onto library `build()` / `renderServer()` options.
 */
export type HyogenConfig = {
  /** Entry markdown path(s) or glob(s). Required. */
  input: string | string[];
  /** Build output directory. Defaults to `./out`. Unused by `dev`. */
  outDir?: string;
  context?: HyogenContext;
  serverContext?: HyogenContext;
  dataSources?: DataSourcesMap;
  root?: string;
  includeUnderscoreEntries?: boolean;
  preserveFrontMatter?: boolean;
  preserveHgComments?: boolean;
};

export type ResolvedHyogenConfig = Omit<HyogenConfig, "outDir" | "input"> & {
  input: string | string[];
  outDir: string;
  /** Absolute directory containing the config file. */
  configDir: string;
  /** Absolute path to the config file when loaded from disk. */
  configPath?: string;
};
