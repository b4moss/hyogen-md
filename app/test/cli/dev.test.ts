import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { startDevServer } from "../../src/cli/commands/dev.js";
import {
  buildDependencyIndex,
  collectAffectedEntries,
} from "../../src/cli/dev/dependencyIndex.js";
import { markdownToPreviewHtml } from "../../src/cli/dev/previewHtml.js";
import { buildFileTree } from "../../src/cli/dev/treeIndex.js";
import type { ResolvedHyogenConfig } from "../../src/config/types.js";

const temps: string[] = [];

async function makeTemp(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-dev-"));
  temps.push(dir);
  return dir;
}

afterEach(async () => {
  while (temps.length > 0) {
    const dir = temps.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

describe("markdownToPreviewHtml", () => {
  it("renders headings", () => {
    expect(markdownToPreviewHtml("# Title")).toContain("<h1");
  });

  it("renders paragraphs", () => {
    expect(markdownToPreviewHtml("hello")).toContain("<p>");
  });

  it("rejects non-strings", () => {
    expect(() => markdownToPreviewHtml(1 as unknown as string)).toThrow(
      TypeError,
    );
  });
});

describe("buildFileTree / dependency index", () => {
  it("lists entry files and maps partial dependents", async () => {
    const dir = await makeTemp();
    await mkdir(path.join(dir, "src"), { recursive: true });
    await writeFile(
      path.join(dir, "src", "index.md"),
      "<!--@@ include ./_partial.md @@-->\n# Index\n",
    );
    await writeFile(path.join(dir, "src", "_partial.md"), "partial\n");
    await writeFile(path.join(dir, "src", "about.md"), "# About\n");

    const tree = await buildFileTree({
      input: path.join(dir, "src/**/*.md"),
      root: dir,
    });
    const flat: string[] = [];
    const walk = (nodes: typeof tree) => {
      for (const node of nodes) {
        if (node.type === "file") flat.push(path.basename(node.path));
        if (node.children) walk(node.children);
      }
    };
    walk(tree);
    expect(flat).toEqual(expect.arrayContaining(["index.md", "about.md"]));
    expect(flat).not.toContain("_partial.md");

    const index = await buildDependencyIndex({
      input: path.join(dir, "src/**/*.md"),
      root: dir,
    });
    const affected = collectAffectedEntries(
      index,
      path.join(dir, "src", "_partial.md"),
    );
    expect(affected.some((entry) => entry.endsWith("index.md"))).toBe(true);
    expect(affected.some((entry) => entry.endsWith("about.md"))).toBe(false);
  });
});

describe("startDevServer", () => {
  it("serves tree/preview and does not write outDir", async () => {
    const dir = await makeTemp();
    await mkdir(path.join(dir, "src"), { recursive: true });
    await writeFile(path.join(dir, "src", "index.md"), "# Dev\n");
    const outDir = path.join(dir, "out");
    const config: ResolvedHyogenConfig = {
      input: path.join(dir, "src/**/*.md"),
      outDir,
      configDir: dir,
    };

    const server = await startDevServer({
      config,
      host: "127.0.0.1",
      port: 0,
      log: () => undefined,
      errorLog: () => undefined,
    });

    try {
      const base = server.url.replace(/\/$/, "");
      const treeRes = await fetch(`${base}/api/tree`);
      expect(treeRes.status).toBe(200);
      const treeJson = (await treeRes.json()) as { tree: unknown[] };
      expect(Array.isArray(treeJson.tree)).toBe(true);

      const indexPath = path.join(dir, "src", "index.md");
      const previewRes = await fetch(
        `${base}/api/preview?path=${encodeURIComponent(indexPath)}`,
      );
      expect(previewRes.status).toBe(200);
      const preview = (await previewRes.json()) as { html: string };
      expect(preview.html).toContain("Dev");

      const home = await fetch(`${base}/`);
      const html = await home.text();
      expect(html.toLowerCase()).not.toContain("<textarea");
      expect(html.toLowerCase()).not.toContain("contenteditable");

      await expect(readdirSafe(outDir)).resolves.toBeNull();
    } finally {
      await server.close();
    }
  });
});

async function readdirSafe(dir: string): Promise<string[] | null> {
  try {
    const { readdir } = await import("node:fs/promises");
    return await readdir(dir);
  } catch {
    return null;
  }
}
