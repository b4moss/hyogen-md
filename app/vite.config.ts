import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "config/index": "src/config/index.ts",
      },
      formats: ["es"],
      fileName: (_format, entryName) =>
        entryName === "index" ? "index.js" : "config/index.js",
    },
    rollupOptions: {
      external: [
        /^node:/,
        "csv-parser",
        "yaml",
        "fast-glob",
        "picomatch",
        "path-browserify",
        "jiti",
      ],
    },
    sourcemap: true,
    minify: true,
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    dts({
      include: ["src/**/*.ts"],
      exclude: ["src/cli/**", "src/**/*.test.ts"],
      rollupTypes: false,
    }),
  ],
});
