import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { build } from "../src/build/build.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";

const docRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.11/build/doc-root",
);

describe("build dataSources (v0.11 / #37)", () => {
  it("expands YAML dataSources across all entries", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-ds-build-"));
    try {
      const result = await build({
        input: ["pages/**/*.md"],
        outDir,
        root: docRoot,
        dataSources: { config: "./data/config.yaml" },
      });

      const byPath = Object.fromEntries(
        result.files.map((file) => [file.path, file.markdown]),
      );
      assert.match(byPath["pages/index.md"]!, /env=production/);
      assert.match(byPath["pages/about.md"]!, /about env=production/);
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("leaves missing dataSources variables empty when omitted", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-ds-build-"));
    try {
      const result = await build({
        input: ["pages/index.md"],
        outDir,
        root: docRoot,
      });
      // Undefined path interpolates to empty string (v0.10 behavior).
      assert.equal(result.files[0]!.markdown.trim(), "env=");
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  it("throws file_not_found when a dataSources file is missing", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "hyogen-ds-build-"));
    try {
      await assert.rejects(
        () =>
          build({
            input: ["pages/index.md"],
            outDir,
            root: docRoot,
            dataSources: { config: "./data/missing.yaml" },
          }),
        (error: unknown) => {
          assertHyogenError(error, "file_not_found");
          return true;
        },
      );
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });
});
