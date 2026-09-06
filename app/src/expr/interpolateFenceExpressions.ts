import { createHyogenError } from "../errors/createError.js";
import {
  consumeFenceLine,
  createFenceState,
} from "../markdown/shiftHeadings.js";
import type { InterpolateExpressionsOptions } from "../types.js";
import { evaluateExpression } from "./evaluateExpression.js";
import { parseExpression } from "./parseExpression.js";

type LinePart = {
  content: string;
  eol: string;
};

function splitPreservingEol(source: string): LinePart[] {
  const parts: LinePart[] = [];
  let i = 0;
  while (i < source.length) {
    const nl = source.indexOf("\n", i);
    if (nl === -1) {
      parts.push({ content: source.slice(i), eol: "" });
      break;
    }
    let content = source.slice(i, nl);
    let eol = "\n";
    if (content.endsWith("\r")) {
      content = content.slice(0, -1);
      eol = "\r\n";
    }
    parts.push({ content, eol });
    i = nl + 1;
  }
  return parts;
}

/** Read `${...}` body starting at `start` (index of first char after `${`). */
function readTemplateExpression(
  source: string,
  start: number,
  path?: string,
): { expr: string; end: number } {
  let depth = 1;
  let index = start;
  let inString: '"' | "'" | "`" | null = null;

  while (index < source.length) {
    const ch = source[index]!;

    if (inString) {
      if (ch === "\\") {
        index += 2;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      index++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      index++;
      continue;
    }

    if (ch === "{") {
      depth++;
      index++;
      continue;
    }

    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return {
          expr: source.slice(start, index),
          end: index + 1,
        };
      }
      index++;
      continue;
    }

    index++;
  }

  throw createHyogenError({
    code: "parse_error",
    path,
    details: { message: "unclosed template expression" },
  });
}

function isEscapedDollar(source: string, dollarIndex: number): boolean {
  let backslashes = 0;
  let j = dollarIndex - 1;
  while (j >= 0 && source[j] === "\\") {
    backslashes++;
    j--;
  }
  return backslashes % 2 === 1;
}

async function interpolateDollarExpressions(
  text: string,
  context: InterpolateExpressionsOptions["context"],
  options: Omit<InterpolateExpressionsOptions, "context"> & { path?: string },
): Promise<string> {
  const path = options.path;
  let result = "";
  let i = 0;

  while (i < text.length) {
    const dollar = text.indexOf("${", i);
    if (dollar === -1) {
      result += text.slice(i);
      break;
    }

    if (isEscapedDollar(text, dollar)) {
      result += text.slice(i, dollar - 1);
      result += "${";
      i = dollar + 2;
      continue;
    }

    result += text.slice(i, dollar);
    const { expr, end } = readTemplateExpression(text, dollar + 2, path);
    const node = parseExpression(expr.trim(), path, { allowCalls: false });
    const value = await evaluateExpression(node, {
      ...options,
      context,
      path,
      parentContext: options.parentContext ?? context,
    });
    result += value === undefined || value === null ? "" : String(value);
    i = end;
  }

  return result;
}

/**
 * Interpolate JS-style `${expr}` only inside fenced code blocks (``` / ~~~).
 * Mustache `{{ }}` is not handled here. Outside fences, `${}` stays literal.
 */
export async function interpolateFenceExpressions(
  source: string,
  context: InterpolateExpressionsOptions["context"],
  options: Omit<InterpolateExpressionsOptions, "context"> & {
    path?: string;
  } = {},
): Promise<string> {
  const lines = splitPreservingEol(source);
  if (lines.length === 0) {
    return source;
  }

  const fence = createFenceState();
  let result = "";
  let insideBuffer = "";
  let bufferingInside = false;

  const flushInside = async () => {
    if (!bufferingInside) {
      return;
    }
    result += await interpolateDollarExpressions(insideBuffer, context, options);
    insideBuffer = "";
    bufferingInside = false;
  };

  for (const { content, eol } of lines) {
    const inside = consumeFenceLine(fence, content);
    const chunk = content + eol;
    if (inside) {
      if (!bufferingInside) {
        bufferingInside = true;
        insideBuffer = "";
      }
      insideBuffer += chunk;
    } else {
      await flushInside();
      result += chunk;
    }
  }

  await flushInside();
  return result;
}
