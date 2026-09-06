import type { HyogenConfig } from "./types.js";

/**
 * Identity helper for typed `hyogen.config.*` default exports (Vite-style).
 */
export function defineConfig(config: HyogenConfig): HyogenConfig {
  return config;
}
