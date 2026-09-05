export type DocsNavItem = {
  key: string
  path: string
  /** i18n key under `nav.*` (e.g. `home` → `nav.home`). */
  labelKey: string
  /** When set, item is a child of this nav key (shown indented in sidebar). */
  parent?: string
  /** Skip locale prefix (e.g. `/playground`). */
  absolute?: boolean
}

/**
 * Accordion behaviour for nested sidebar groups.
 * - expandable: false → children always visible (legacy indent only)
 * - defaultOpen: initial open state when expandable
 * - persist: remember open/closed per parent key in localStorage
 */
export const docsNavAccordion = {
  expandable: true,
  defaultOpen: false,
  persist: true,
} as const

/**
 * Edit this list to shape the docs sidebar / pager.
 * Labels come from `i18n/locales/{ja,en}.ts` → `nav.<labelKey>`.
 */
export const docsNavItems: DocsNavItem[] = [
  { key: 'home', path: '/', labelKey: 'home' },
  { key: 'install', path: '/install', labelKey: 'install' },
  { key: 'api', path: '/api', labelKey: 'api' },
  { key: 'apiRenderServer', path: '/api/render-server', labelKey: 'apiRenderServer', parent: 'api' },
  { key: 'apiRenderClient', path: '/api/render-client', labelKey: 'apiRenderClient', parent: 'api' },
  { key: 'apiBuild', path: '/api/build', labelKey: 'apiBuild', parent: 'api' },
  { key: 'apiDataSources', path: '/api/data-sources', labelKey: 'apiDataSources', parent: 'api' },
  { key: 'apiLoader', path: '/api/loader', labelKey: 'apiLoader', parent: 'api' },
  { key: 'apiDiagnostics', path: '/api/diagnostics', labelKey: 'apiDiagnostics', parent: 'api' },
  { key: 'apiTypes', path: '/api/types-and-options', labelKey: 'apiTypes', parent: 'api' },
  { key: 'apiErrorCodes', path: '/api/error-codes', labelKey: 'apiErrorCodes', parent: 'api' },
  { key: 'syntax', path: '/syntax', labelKey: 'syntax' },
  { key: 'syntaxFrontMatter', path: '/syntax/front-matter', labelKey: 'syntaxFrontMatter', parent: 'syntax' },
  { key: 'syntaxExpressions', path: '/syntax/expressions', labelKey: 'syntaxExpressions', parent: 'syntax' },
  { key: 'syntaxMethods', path: '/syntax/methods', labelKey: 'syntaxMethods', parent: 'syntax' },
  { key: 'syntaxHgBlocks', path: '/syntax/hg-blocks', labelKey: 'syntaxHgBlocks', parent: 'syntax' },
  { key: 'syntaxDeclarations', path: '/syntax/declarations', labelKey: 'syntaxDeclarations', parent: 'syntax' },
  { key: 'syntaxIncludes', path: '/syntax/includes', labelKey: 'syntaxIncludes', parent: 'syntax' },
  { key: 'syntaxControlFlow', path: '/syntax/control-flow', labelKey: 'syntaxControlFlow', parent: 'syntax' },
  { key: 'syntaxToc', path: '/syntax/toc', labelKey: 'syntaxToc', parent: 'syntax' },
  { key: 'syntaxPaths', path: '/syntax/paths-and-security', labelKey: 'syntaxPaths', parent: 'syntax' },
  { key: 'playground', path: '/playground', labelKey: 'playground', absolute: true },
  { key: 'changelog', path: '/changelog', labelKey: 'changelog' },
]
