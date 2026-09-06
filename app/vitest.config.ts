import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,js}"],
      exclude: [
        "src/shims/**",
        "src/cli/bin.ts",
        "src/config/index.ts",
        "src/**/*.d.ts",
        "src/**/types.ts",
      ],
      thresholds: {
        lines: 90,
        statements: 90,
      },
    },
  },
});
