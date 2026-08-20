import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const appSrc = path.resolve(rootDir, '../app/src')
const playgroundDir = path.join(rootDir, 'app/components/playground')

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^(?:\.\.\/){3}components\/playground(.*)$/,
        replacement: `${playgroundDir}$1`,
      },
      { find: '@b4moss/hyogen-md/client', replacement: path.join(appSrc, 'client.ts') },
      { find: '@b4moss/hyogen-md', replacement: path.join(appSrc, 'index.ts') },
      { find: 'node:path', replacement: 'path-browserify' },
      { find: 'node:fs', replacement: path.join(appSrc, 'shims/fs-browser.ts') },
      { find: 'node:fs/promises', replacement: path.join(appSrc, 'shims/fs-promises-browser.ts') },
      { find: 'buffer', replacement: path.resolve(rootDir, 'node_modules/buffer/index.js') },
    ],
  },
  define: {
    global: 'globalThis',
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
})
