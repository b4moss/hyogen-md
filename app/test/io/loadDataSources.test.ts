import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";
import { loadDataSources } from "../../src/io/loadDataSources.js";
import { assertHyogenError } from "../helpers/assertHyogenError.js";
import type { Loader } from "../../src/types.js";

const fixtureDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/v0.11/data",
);

describe("loadDataSources (v0.11)", () => {
  it("loads a YAML file into context", async () => {
    const result = await loadDataSources(
      { site: "./site.yaml" },
      { root: fixtureDir },
    );
    assert.equal((result.site as { title?: string }).title, "Hyogen Site");
  });

  it("loads multiple data files", async () => {
    const result = await loadDataSources(
      {
        site: "./site.yaml",
        products: "./products.json",
      },
      { root: fixtureDir },
    );
    assert.equal((result.site as { title?: string }).title, "Hyogen Site");
    assert.equal((result.products as { count?: number }).count, 2);
  });

  it("loads top-level JSON arrays", async () => {
    const result = await loadDataSources(
      { items: "./items-array.json" },
      { root: fixtureDir },
    );
    assert.deepEqual(result.items, ["a", "b"]);
  });

  it("loads CSV files as object arrays", async () => {
    const result = await loadDataSources(
      { rows: "./rows.csv" },
      { root: fixtureDir },
    );
    assert.deepEqual(result.rows, [
      { id: "1", name: "Alpha" },
      { id: "2", name: "Beta" },
    ]);
  });

  it("returns an empty object for an empty map", async () => {
    const result = await loadDataSources({}, { root: fixtureDir });
    assert.deepEqual(result, {});
  });

  it("throws file_not_found for missing files", async () => {
    await assert.rejects(
      () =>
        loadDataSources(
          { missing: "./missing.yaml" },
          { root: fixtureDir },
        ),
      (error: unknown) => {
        assertHyogenError(error, "file_not_found");
        return true;
      },
    );
  });

  it("throws parse_error when file content is invalid", async () => {
    await assert.rejects(
      () =>
        loadDataSources(
          { broken: "./invalid.json" },
          { root: fixtureDir },
        ),
      (error: unknown) => {
        assertHyogenError(error, "parse_error");
        return true;
      },
    );
  });

  it("throws load_failed when loader throws", async () => {
    const loader: Loader = async () => {
      throw new Error("boom");
    };

    await assert.rejects(
      () =>
        loadDataSources({ site: "./site.yaml" }, {
          root: fixtureDir,
          loader,
        }),
      (error: unknown) => {
        assertHyogenError(error, "load_failed");
        return true;
      },
    );
  });

  it("throws load_failed for https remote data source paths", async () => {
    await assert.rejects(
      () =>
        loadDataSources(
          { site: "https://example.com/data/site.yaml" },
          { root: fixtureDir },
        ),
      (error: unknown) => {
        assertHyogenError(error, "load_failed");
        assert.match(String((error as { details?: { reason?: string } }).details?.reason), /remote/i);
        return true;
      },
    );
  });

  it("throws load_failed for http remote data source paths", async () => {
    await assert.rejects(
      () =>
        loadDataSources(
          { meta: "http://example.com/meta.json" },
          { root: fixtureDir },
        ),
      (error: unknown) => {
        assertHyogenError(error, "load_failed");
        return true;
      },
    );
  });

  it("throws data_source_too_large when source exceeds 5MB", async () => {
    const limit = 5 * 1024 * 1024;
    const oversized = "x".repeat(limit + 1);
    const loader: Loader = async () => oversized;

    await assert.rejects(
      () =>
        loadDataSources({ big: "./big.json" }, {
          root: fixtureDir,
          loader,
        }),
      (error: unknown) => {
        assertHyogenError(error, "data_source_too_large");
        const details = (error as { details?: { size?: number; limit?: number } }).details;
        assert.equal(details?.size, limit + 1);
        assert.equal(details?.limit, limit);
        return true;
      },
    );
  });

  it("allows a data source that is exactly 5MB", async () => {
    const limit = 5 * 1024 * 1024;
    // Valid JSON string of exact byte length via loader bypassing parse size of quotes —
    // use a YAML scalar that parses cleanly: pad after a short prefix.
    const prefix = "title: ";
    const value = "y".repeat(limit - prefix.length);
    const source = `${prefix}${value}`;
    assert.equal(Buffer.byteLength(source, "utf8"), limit);

    const loader: Loader = async () => source;
    const result = await loadDataSources(
      { site: "./exact.yaml" },
      { root: fixtureDir, loader },
    );
    assert.equal(typeof (result.site as { title?: string }).title, "string");
  });
});
