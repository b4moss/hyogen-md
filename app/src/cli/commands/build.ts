import { build } from "../../build/build.js";
import { loadConfig } from "../../config/loadConfig.js";
import { formatDiagnosticLog } from "../../errors/formatDiagnosticLog.js";
import type { BuildResult } from "../../types.js";

export type RunCliBuildOptions = {
  cwd?: string;
  configFile?: string;
  /** Override config outDir when provided. */
  outDir?: string;
  log?: (message: string) => void;
  errorLog?: (message: string) => void;
};

/**
 * Load hyogen.config and invoke library `build()`.
 */
export async function runCliBuild(
  options: RunCliBuildOptions = {},
): Promise<BuildResult> {
  const log = options.log ?? ((message) => console.log(message));
  const errorLog = options.errorLog ?? ((message) => console.error(message));

  const config = await loadConfig({
    cwd: options.cwd,
    configFile: options.configFile,
  });

  const outDir = options.outDir ?? config.outDir;

  const result = await build({
    input: config.input,
    outDir,
    root: config.root,
    context: config.context,
    serverContext: config.serverContext,
    dataSources: config.dataSources,
    includeUnderscoreEntries: config.includeUnderscoreEntries,
    preserveFrontMatter: config.preserveFrontMatter,
    preserveHgComments: config.preserveHgComments,
  });

  for (const warning of result.warnings) {
    errorLog(formatDiagnosticLog("warning", warning));
  }

  log(`hyogen-md build: wrote ${result.files.length} file(s) to ${outDir}`);

  return result;
}
