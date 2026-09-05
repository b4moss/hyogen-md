import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defineConfig } from "../../src/config/defineConfig.js";
import { loadConfig, resolveConfigPath } from "../../src/config/loadConfig.js";

const temps: string[] = [];

async function makeTemp(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-config-"));
  temps.push(dir);
  return dir;
}

afterEach(async () => {
  while (temps.length > 0) {
    const dir = temps.pop();
    if (dir) {
      await rm(dir, { recursive: true, force: true });
    }
  }
});

describe("defineConfig", () => {
  it("returns the same config object", () => {
    const config = { input: "./src/**/*.md" };
    expect(defineConfig(config)).toBe(config);
  });

  it("keeps outDir when provided", () => {
    expect(
      defineConfig({ input: "./a.md", outDir: "./dist-md" }).outDir,
    ).toBe("./dist-md");
  });

  it("passthrough of optional context", () => {
    expect(
      defineConfig({ input: "./a.md", context: { site: "x" } }).context,
    ).toEqual({ site: "x" });
  });
});

describe("resolveConfigPath", () => {
  it("finds hyogen.config.js", async () => {
    const dir = await makeTemp();
    const file = path.join(dir, "hyogen.config.js");
    await writeFile(file, "export default { input: './src/**/*.md' }\n");
    await expect(resolveConfigPath({ cwd: dir })).resolves.toBe(file);
  });

  it("prefers .ts over .js when both exist", async () => {
    const dir = await makeTemp();
    await writeFile(path.join(dir, "hyogen.config.js"), "export default {}\n");
    const ts = path.join(dir, "hyogen.config.ts");
    await writeFile(ts, "export default { input: './x.md' }\n");
    await expect(resolveConfigPath({ cwd: dir })).resolves.toBe(ts);
  });

  it("throws when no config exists", async () => {
    const dir = await makeTemp();
    await expect(resolveConfigPath({ cwd: dir })).rejects.toMatchObject({
      code: "file_not_found",
    });
  });
});

describe("loadConfig", () => {
  it("loads js config and defaults outDir to ./out", async () => {
    const dir = await makeTemp();
    await writeFile(
      path.join(dir, "hyogen.config.js"),
      `import { defineConfig } from "file://${path.resolve("src/config/defineConfig.ts")}";
export default defineConfig({ input: "./src/**/*.md" });
`,
    );
    // Simpler: plain object export without importing defineConfig from package
    await writeFile(
      path.join(dir, "hyogen.config.js"),
      "export default { input: './src/**/*.md' }\n",
    );
    const config = await loadConfig({ cwd: dir });
    expect(config.input).toBe(path.resolve(dir, "./src/**/*.md"));
    expect(config.outDir).toBe(path.resolve(dir, "./out"));
    expect(config.configDir).toBe(dir);
  });

  it("loads explicit outDir", async () => {
    const dir = await makeTemp();
    await writeFile(
      path.join(dir, "hyogen.config.js"),
      "export default { input: './pages', outDir: './dist-md' }\n",
    );
    const config = await loadConfig({ cwd: dir });
    expect(config.outDir).toBe(path.resolve(dir, "./dist-md"));
  });

  it("rejects missing input", async () => {
    const dir = await makeTemp();
    await writeFile(path.join(dir, "hyogen.config.js"), "export default {}\n");
    await expect(loadConfig({ cwd: dir })).rejects.toMatchObject({
      code: "parse_error",
    });
  });

  it("rejects non-object default export", async () => {
    const dir = await makeTemp();
    await writeFile(
      path.join(dir, "hyogen.config.js"),
      "export default 42\n",
    );
    await expect(loadConfig({ cwd: dir })).rejects.toMatchObject({
      code: "parse_error",
    });
  });
});
