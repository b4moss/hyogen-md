import { access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createJiti } from "jiti";
import { createHyogenError } from "../errors/createError.js";
import type { HyogenConfig, ResolvedHyogenConfig } from "./types.js";

const CONFIG_CANDIDATES = [
  "hyogen.config.ts",
  "hyogen.config.mjs",
  "hyogen.config.js",
  "hyogen.config.cjs",
] as const;

export type LoadConfigOptions = {
  /** Directory to search for config. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Explicit config file path (absolute or cwd-relative). */
  configFile?: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertValidInput(input: unknown): asserts input is string | string[] {
  if (typeof input === "string") {
    if (input.trim() === "") {
      throw createHyogenError({
        code: "parse_error",
        path: "<config>",
        details: {
          path: "<config>",
          message: "`input` must not be empty",
        },
      });
    }
    return;
  }
  if (Array.isArray(input) && input.every((v) => typeof v === "string")) {
    if (input.length === 0 || input.some((v) => v.trim() === "")) {
      throw createHyogenError({
        code: "parse_error",
        path: "<config>",
        details: {
          path: "<config>",
          message: "`input` array is invalid",
        },
      });
    }
    return;
  }
  throw createHyogenError({
    code: "parse_error",
    path: "<config>",
    details: {
      path: "<config>",
      message: "`input` is required as a string or string[]",
    },
  });
}

export async function resolveConfigPath(
  options: LoadConfigOptions = {},
): Promise<string> {
  const cwd = path.resolve(options.cwd ?? process.cwd());

  if (options.configFile) {
    const explicit = path.isAbsolute(options.configFile)
      ? options.configFile
      : path.resolve(cwd, options.configFile);
    try {
      await access(explicit);
      return explicit;
    } catch {
      throw createHyogenError({
        code: "file_not_found",
        path: explicit,
        details: {
          path: explicit,
          from: cwd,
          via: "config",
        },
      });
    }
  }

  for (const name of CONFIG_CANDIDATES) {
    const candidate = path.join(cwd, name);
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }

  throw createHyogenError({
    code: "file_not_found",
    path: cwd,
    details: {
      path: path.join(cwd, "hyogen.config.*"),
      from: cwd,
      via: "config",
    },
  });
}

async function importConfigModule(configPath: string): Promise<unknown> {
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
  });
  try {
    return await jiti.import(configPath);
  } catch (firstError) {
    try {
      return await import(pathToFileURL(configPath).href);
    } catch {
      const reason =
        firstError instanceof Error ? firstError.message : String(firstError);
      throw createHyogenError({
        code: "load_failed",
        path: configPath,
        details: { path: configPath, reason },
      });
    }
  }
}

function unwrapDefaultExport(mod: unknown): unknown {
  if (!isPlainObject(mod)) {
    return mod;
  }
  if ("default" in mod) {
    return mod.default;
  }
  return mod;
}

function resolveMaybePath(
  value: string | undefined,
  configDir: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return path.isAbsolute(value) ? value : path.resolve(configDir, value);
}

function resolveInput(
  input: string | string[],
  configDir: string,
): string | string[] {
  if (typeof input === "string") {
    return resolveMaybePath(input, configDir)!;
  }
  return input.map((item) => resolveMaybePath(item, configDir)!);
}

/**
 * Load and normalize `hyogen.config.*`.
 * Ensures `outDir` defaults to `./out` (resolved against the config directory).
 */
export async function loadConfig(
  options: LoadConfigOptions = {},
): Promise<ResolvedHyogenConfig> {
  const configPath = await resolveConfigPath(options);
  const configDir = path.dirname(configPath);
  const mod = unwrapDefaultExport(await importConfigModule(configPath));

  if (!isPlainObject(mod)) {
    throw createHyogenError({
      code: "parse_error",
      path: configPath,
      details: {
        path: configPath,
        message: "config must default-export an object",
      },
    });
  }

  assertValidInput(mod.input);
  const raw = mod as HyogenConfig;

  const outDir = resolveMaybePath(raw.outDir ?? "./out", configDir)!;
  const root = resolveMaybePath(raw.root, configDir);

  return {
    ...raw,
    input: resolveInput(raw.input, configDir),
    outDir,
    root,
    configDir,
    configPath,
  };
}
