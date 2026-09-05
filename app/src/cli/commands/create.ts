import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHyogenError } from "../../errors/createError.js";

export type CreateLanguage = "js" | "ts";

export type RunCliCreateOptions = {
  /** Target directory to scaffold into. Defaults to cwd. */
  targetDir?: string;
  language?: CreateLanguage;
  packageName?: string;
};

async function pathExists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function packageJsonContents(packageName: string): string {
  return `${JSON.stringify(
    {
      name: packageName,
      private: true,
      type: "module",
      scripts: {
        dev: "hyogen-md dev",
        build: "hyogen-md build",
      },
      dependencies: {
        "@b4moss/hyogen-md": "^0.13.0",
      },
    },
    null,
    2,
  )}\n`;
}

function configContents(): string {
  return `import { defineConfig } from "@b4moss/hyogen-md/config";

export default defineConfig({
  input: "./src/**/*.md",
  // outDir: "./out",
});
`;
}

function sampleMarkdown(): string {
  return `# Hello hyogen.md

This project was created with \`hyogen-md create\`.

Edit this file and run \`npm run dev\` to preview.
`;
}

function gitignoreContents(): string {
  return `node_modules/
out/
dist/
.DS_Store
`;
}

/**
 * Scaffold a minimal hyogen.md project.
 */
export async function runCliCreate(
  options: RunCliCreateOptions = {},
): Promise<{ targetDir: string; language: CreateLanguage }> {
  const language: CreateLanguage = options.language ?? "js";
  if (language !== "js" && language !== "ts") {
    throw createHyogenError({
      code: "parse_error",
      path: "<create>",
      details: {
        path: "<create>",
        message: `language must be "js" or "ts" (got ${String(options.language)})`,
      },
    });
  }

  const targetDir = path.resolve(options.targetDir ?? process.cwd());
  const parent = path.dirname(targetDir);

  if (!(await pathExists(parent))) {
    throw createHyogenError({
      code: "file_not_found",
      path: parent,
      details: { path: parent, from: targetDir, via: "create" },
    });
  }

  if (await pathExists(targetDir)) {
    const entries = await readdir(targetDir);
    if (entries.length > 0) {
      throw createHyogenError({
        code: "parse_error",
        path: targetDir,
        details: {
          path: targetDir,
          message: "target directory is not empty",
        },
      });
    }
  } else {
    await mkdir(targetDir, { recursive: true });
  }

  const baseName = path.basename(targetDir);
  const packageName = options.packageName ?? (baseName || "hyogen-project");

  await mkdir(path.join(targetDir, "src"), { recursive: true });
  await writeFile(
    path.join(targetDir, "package.json"),
    packageJsonContents(packageName),
    "utf8",
  );
  await writeFile(
    path.join(
      targetDir,
      language === "ts" ? "hyogen.config.ts" : "hyogen.config.js",
    ),
    configContents(),
    "utf8",
  );
  await writeFile(
    path.join(targetDir, "src", "index.md"),
    sampleMarkdown(),
    "utf8",
  );
  await writeFile(
    path.join(targetDir, ".gitignore"),
    gitignoreContents(),
    "utf8",
  );

  return { targetDir, language };
}
