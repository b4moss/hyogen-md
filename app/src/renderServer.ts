import { mergeContext } from "./context/mergeContext.js";
import { createNodeLoader } from "./io/createNodeLoader.js";
import { loadDataSources } from "./io/loadDataSources.js";
import { resolveRenderInput } from "./paths/resolveRenderInput.js";
import { renderDocument } from "./pipeline/renderDocument.js";
import type { HyogenContext, RenderResult, ServerRenderOptions } from "./types.js";

export async function renderServer(
  input: string | { path: string },
  context?: HyogenContext,
  options?: ServerRenderOptions,
): Promise<RenderResult> {
  const loader = options?.loader ?? createNodeLoader();
  const resolved = await resolveRenderInput(input, { root: options?.root });
  const root = resolved.rootDir ?? options?.root;

  const dataSources = options?.dataSources;
  const fromFiles =
    dataSources && Object.keys(dataSources).length > 0
      ? await loadDataSources(dataSources, { root, loader })
      : {};

  const mergedContext = mergeContext(
    fromFiles,
    context,
    options?.serverContext,
  );

  return renderDocument(resolved.source, {
    context: mergedContext,
    loader,
    root,
    path: resolved.entryPath ?? options?.path,
    constrainToRoot: resolved.constrainToRoot,
    preserveFrontMatter: options?.preserveFrontMatter,
    preserveHgComments: options?.preserveHgComments,
  });
}
