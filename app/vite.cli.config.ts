import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: true,
    rollupOptions: {
      input: "src/cli/bin.ts",
      output: {
        format: "es",
        entryFileNames: "cli.js",
        dir: "dist",
      },
      external: [
        /^node:/,
        "cac",
        "chokidar",
        "jiti",
        "marked",
        "ws",
        "csv-parser",
        "yaml",
        "fast-glob",
        "picomatch",
        "path-browserify",
      ],
    },
    sourcemap: true,
    minify: false,
    emptyOutDir: false,
    target: "node24",
  },
});
