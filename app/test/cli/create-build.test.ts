import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCliBuild } from "../../src/cli/commands/build.js";
import { runCliCreate } from "../../src/cli/commands/create.js";

const temps: string[] = [];

async function makeTemp(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "hyogen-cli-"));
  temps.push(dir);
  return dir;
}

afterEach(async () => {
  while (temps.length > 0) {
    const dir = temps.pop();
    if (dir) await rm(dir, { recursive: true, force: true });
  }
});

describe("runCliCreate", () => {
  it("scaffolds js project by default", async () => {
    const parent = await makeTemp();
    const target = path.join(parent, "demo");
    const result = await runCliCreate({ targetDir: target });
    expect(result.language).toBe("js");
    const names = await readdir(target);
    expect(names).toEqual(
      expect.arrayContaining([
        "package.json",
        "hyogen.config.js",
        "src",
        ".gitignore",
      ]),
    );
    const pkg = JSON.parse(
      await readFile(path.join(target, "package.json"), "utf8"),
    );
    expect(pkg.scripts.dev).toContain("hyogen-md");
    expect(pkg.scripts.build).toContain("hyogen-md");
  });

  it("scaffolds ts config when language=ts", async () => {
    const parent = await makeTemp();
    const target = path.join(parent, "demo-ts");
    await runCliCreate({ targetDir: target, language: "ts" });
    const names = await readdir(target);
    expect(names).toContain("hyogen.config.ts");
    expect(names).not.toContain("hyogen.config.js");
  });

  it("rejects non-empty target", async () => {
    const target = await makeTemp();
    await writeFile(path.join(target, "keep.txt"), "x");
    await expect(runCliCreate({ targetDir: target })).rejects.toMatchObject({
      code: "parse_error",
    });
  });
});

describe("runCliBuild", () => {
  it("writes markdown to outDir from config", async () => {
    const dir = await makeTemp();
    await mkdir(path.join(dir, "src"), { recursive: true });
    await writeFile(
      path.join(dir, "hyogen.config.js"),
      "export default { input: './src/**/*.md', outDir: './out' }\n",
    );
    await writeFile(path.join(dir, "src", "index.md"), "# Hi\n");

    const logs: string[] = [];
    const result = await runCliBuild({
      cwd: dir,
      log: (message) => logs.push(message),
      errorLog: () => undefined,
    });
    expect(result.files.length).toBeGreaterThan(0);
    const body = await readFile(path.join(dir, "out", "index.md"), "utf8");
    expect(body).toContain("# Hi");
    expect(logs.some((line) => line.includes("build"))).toBe(true);
  });
});
