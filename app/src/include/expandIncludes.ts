import { formatWarningMessage } from "../errors/formatMessage.js";
import { resolveIncludePath } from "../io/resolveIncludePath.js";
import { renderChildDocument } from "../pipeline/renderDocument.js";
import { joinRemovalSeam } from "../pipeline/joinRemovalSeam.js";
import {
  findPrecedingHeadingLevel,
  shiftMarkdownHeadings,
} from "../markdown/shiftHeadings.js";
import type { ComponentRegistry } from "../component/ComponentRegistry.js";
import type { VisitStack } from "./VisitStack.js";
import type { HyogenContext, HyogenWarning, IncludeDirective, Loader } from "../types.js";

export type ExpandIncludesOptions = {
  source: string;
  directives: IncludeDirective[];
  context: HyogenContext;
  loader: Loader;
  root?: string;
  path?: string;
  preserveFrontMatter?: boolean;
  preserveHgComments?: boolean;
  visitStack?: VisitStack;
  warnings?: HyogenWarning[];
  registry?: ComponentRegistry;
  constrainToRoot?: boolean;
};

function replaceMarker(
  source: string,
  marker: string,
  replacement: string,
): string {
  const start = source.indexOf(marker);
  if (start < 0) {
    return source;
  }
  const left = source.slice(0, start);
  const right = source.slice(start + marker.length);
  return joinRemovalSeam(joinRemovalSeam(left, replacement), right);
}

export async function expandIncludes(
  options: ExpandIncludesOptions,
): Promise<string> {
  let result = options.source;

  for (const directive of options.directives) {
    const absolutePath = resolveIncludePath(
      options.root,
      directive.path,
      options.path,
      options.path,
      options.constrainToRoot,
      true,
    );

    if (options.visitStack) {
      const circular = options.visitStack.check(absolutePath);
      if (circular.circular) {
        options.warnings?.push({
          code: "circular_include",
          message: formatWarningMessage("circular_include", {
            path: absolutePath,
            from: circular.from,
            via: "include",
          }),
          path: options.path,
          details: {
            path: absolutePath,
            from: circular.from,
            via: "include",
          },
        });
        result = replaceMarker(result, directive.marker, "");
        continue;
      }
      options.visitStack.push(absolutePath);
    }

    try {
      const childSource = await options.loader(absolutePath);

      const childMarkdown = await renderChildDocument(childSource, {
        context: options.context,
        loader: options.loader,
        root: options.root,
        path: absolutePath,
        preserveFrontMatter: options.preserveFrontMatter,
        preserveHgComments: options.preserveHgComments,
        visitStack: options.visitStack,
        warnings: options.warnings,
        registry: options.registry,
      });

      const markerStart = result.indexOf(directive.marker);
      const prefix = markerStart >= 0 ? result.slice(0, markerStart) : result;
      const headingShift = findPrecedingHeadingLevel(prefix);
      const shiftedMarkdown = shiftMarkdownHeadings(childMarkdown, headingShift);

      const replacement =
        options.preserveHgComments && directive.raw
          ? `${directive.raw}\n${shiftedMarkdown}`
          : shiftedMarkdown;

      result = replaceMarker(result, directive.marker, replacement);
    } finally {
      options.visitStack?.pop();
    }
  }

  return result;
}
