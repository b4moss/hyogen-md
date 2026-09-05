import path from "node:path";
import type { ResolvedHyogenConfig } from "../../config/types.js";
import { formatDiagnosticLog } from "../../errors/formatDiagnosticLog.js";
import { createFsLoader } from "../../io/createFsLoader.js";
import { renderServer } from "../../renderServer.js";
import type { HyogenWarning, Loader, RenderResult } from "../../types.js";
import { markdownToPreviewHtml } from "./previewHtml.js";

export type PreviewPayload = {
  path: string;
  markdown: string;
  html: string;
  warnings: HyogenWarning[];
};

export type DevSession = {
  config: ResolvedHyogenConfig;
  outDir: string;
  renderEntry: (absolutePath: string) => Promise<PreviewPayload>;
};

export function createDevSession(options: {
  config: ResolvedHyogenConfig;
  loader?: Loader;
  errorLog?: (message: string) => void;
}): DevSession {
  const loader = options.loader ?? createFsLoader();
  const errorLog = options.errorLog ?? ((message) => console.error(message));
  const outDir = path.resolve(options.config.outDir);

  return {
    config: options.config,
    outDir,
    async renderEntry(absolutePath: string): Promise<PreviewPayload> {
      const resolved = path.resolve(absolutePath);
      let result: RenderResult;
      try {
        result = await renderServer(
          { path: resolved },
          options.config.context,
          {
            loader,
            root: options.config.root ?? options.config.configDir,
            serverContext: options.config.serverContext,
            dataSources: options.config.dataSources,
            preserveFrontMatter: options.config.preserveFrontMatter,
            preserveHgComments: options.config.preserveHgComments,
          },
        );
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          typeof (error as { code: unknown }).code === "string"
        ) {
          errorLog(
            formatDiagnosticLog("error", {
              code: (error as { code: string }).code,
              message: error instanceof Error ? error.message : String(error),
              path: resolved,
              details: (error as { details?: Record<string, unknown> }).details,
            }),
          );
        }
        throw error;
      }

      for (const warning of result.warnings) {
        errorLog(formatDiagnosticLog("warning", warning));
      }

      return {
        path: resolved,
        markdown: result.markdown,
        html: markdownToPreviewHtml(result.markdown),
        warnings: result.warnings,
      };
    },
  };
}
