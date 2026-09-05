import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { renderServer } from "../src/renderServer.js";
import { assertHyogenError } from "./helpers/assertHyogenError.js";

const docRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/v0.11/render/doc-root",
);

describe("renderServer dataSources (v0.11 / #37)", () => {
  it("binds YAML dataSources into template variables", async () => {
    const result = await renderServer(
      { path: path.join(docRoot, "pages/from-yaml.md") },
      {},
      {
        root: docRoot,
        dataSources: { site: "./data/site.yaml" },
      },
    );
    assert.match(result.markdown, /# Hyogen Site/);
  });

  it("binds JSON dataSources into template variables", async () => {
    const result = await renderServer(
      { path: path.join(docRoot, "pages/from-json.md") },
      {},
      {
        root: docRoot,
        dataSources: { meta: "./data/meta.json" },
      },
    );
    assert.match(result.markdown, /version=0\.11\.0/);
  });

  it("loads multiple YAML and JSON dataSources together", async () => {
    const result = await renderServer(
      { path: path.join(docRoot, "pages/both.md") },
      {},
      {
        root: docRoot,
        dataSources: {
          site: "./data/site.yaml",
          meta: "./data/meta.json",
        },
      },
    );
    assert.match(result.markdown, /Hyogen Site \/ 0\.11\.0/);
  });

  it("lets context override dataSources for the same key", async () => {
    const result = await renderServer(
      { path: path.join(docRoot, "pages/merge-order.md") },
      { shared: "from-context" },
      {
        root: docRoot,
        dataSources: { shared: "./data/site.yaml" },
      },
    );
    // dataSources binds the whole YAML object under `shared`, but context
    // string wins on shallow merge.
    assert.match(result.markdown, /value=from-context/);
  });

  it("lets serverContext override dataSources and context", async () => {
    const result = await renderServer(
      { path: path.join(docRoot, "pages/merge-order.md") },
      { shared: "from-context" },
      {
        root: docRoot,
        dataSources: { shared: "./data/site.yaml" },
        serverContext: { shared: "from-server" },
      },
    );
    assert.match(result.markdown, /value=from-server/);
  });

  it("skips loading when dataSources is omitted", async () => {
    const result = await renderServer("# {{ title }}", { title: "Plain" });
    assert.equal(result.markdown, "# Plain");
  });

  it("throws file_not_found when a dataSources file is missing", async () => {
    await assert.rejects(
      () =>
        renderServer(
          { path: path.join(docRoot, "pages/from-yaml.md") },
          {},
          {
            root: docRoot,
            dataSources: { site: "./data/missing.yaml" },
          },
        ),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });

  it("throws parse_error when a dataSources JSON file is invalid", async () => {
    await assert.rejects(
      () =>
        renderServer(
          { path: path.join(docRoot, "pages/from-json.md") },
          {},
          {
            root: docRoot,
            dataSources: { meta: "./data/invalid.json" },
          },
        ),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });
});
