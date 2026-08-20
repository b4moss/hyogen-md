import { copyFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import inject from '@rollup/plugin-inject'
import { resolveSiteVersion } from './scripts/resolveSiteVersion'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const appSrc = path.resolve(rootDir, '../app/src')
const siteVersion = resolveSiteVersion(rootDir)

const docRoutes = [
  '/',
  '/install',
  '/changelog',
  '/api',
  '/api/render-server',
  '/api/render-client',
  '/api/build',
  '/api/loader',
  '/api/diagnostics',
  '/api/types-and-options',
  '/api/error-codes',
  '/syntax',
  '/syntax/front-matter',
  '/syntax/expressions',
  '/syntax/methods',
  '/syntax/hg-blocks',
  '/syntax/declarations',
  '/syntax/includes',
  '/syntax/control-flow',
  '/syntax/paths-and-security',
]

const prerenderRoutes = [
  '/playground',
  ...docRoutes.flatMap((route) => [`/ja${route === '/' ? '' : route}`, `/en${route === '/' ? '' : route}`]),
]

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@nuxt/scripts',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  css: ['~/assets/css/main.css', '~/assets/css/playground.css'],
  runtimeConfig: {
    public: {
      siteName: 'hyogen-md',
      siteVersion,
      githubUrl: 'https://github.com/b4moss/hyogen-md',
      footerText: 'MIT License · 2026 Bicycle for Mind LLC.',
    },
  },
  scripts: {
    registry: {
      googleTagManager: {
        bundle: false,
      },
    },
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },
  content: {
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
        },
      },
    },
  },
  routeRules: {
    '/playground': { ssr: false },
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Documentation for @b4moss/hyogen-md' },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  i18n: {
    locales: [
      { code: 'ja', name: '日本語', language: 'ja-JP', file: 'ja.ts' },
      { code: 'en', name: 'English', language: 'en-US', file: 'en.ts' },
    ],
    defaultLocale: 'ja',
    strategy: 'prefix',
    lazy: true,
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'ja',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  hooks: {
    // Keep literal {{ }} in docs (hyogen syntax) from being parsed as MDC bindings.
    'content:file:beforeParse'(ctx) {
      const file = ctx.file
      if (!file?.body || !String(file.id || file.path || '').endsWith('.md')) return
      const parts = String(file.body).split(/(```[\s\S]*?```)/g)
      file.body = parts
        .map((part, i) => {
          if (i % 2 === 1) return part // fenced code
          return part
            .replaceAll('{{', '&#123;&#123;')
            .replaceAll('}}', '&#125;&#125;')
        })
        .join('')
    },
    'nitro:build:public-assets'(nitro) {
      copyFileSync(
        path.join(nitro.options.rootDir, 'locale-root.html'),
        path.join(nitro.options.output.publicDir, 'index.html'),
      )
    },
  },
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: prerenderRoutes,
    },
  },
  vite: {
    plugins: [
      inject({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    resolve: {
      alias: {
        '@b4moss/hyogen-md/client': path.join(appSrc, 'client.ts'),
        '@b4moss/hyogen-md': path.join(appSrc, 'index.ts'),
        'node:path': 'path-browserify',
        'node:fs': path.join(appSrc, 'shims/fs-browser.ts'),
        'node:fs/promises': path.join(appSrc, 'shims/fs-promises-browser.ts'),
        buffer: path.resolve(rootDir, 'node_modules/buffer/index.js'),
      },
    },
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['buffer', 'yaml', 'path-browserify'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    server: {
      fs: {
        allow: [rootDir, appSrc],
      },
    },
  },
})
