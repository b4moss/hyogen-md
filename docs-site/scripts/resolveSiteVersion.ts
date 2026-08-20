import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const semver = require('semver')

/** Prerelease whose first identifier starts with `doc` (e.g. docs.8, doc.1). */
export function hasDocSuffix(version: string): boolean {
  const bare = String(version).replace(/^v/, '')
  const dash = bare.indexOf('-')
  if (dash < 0) return false
  const firstPre = bare.slice(dash + 1).split('.')[0] || ''
  return /^doc/i.test(firstPre)
}

function readPackageVersion(packageJsonPath: string): string | null {
  try {
    const raw = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      version?: string
    }
    return raw.version ? String(raw.version).replace(/^v/, '') : null
  } catch {
    return null
  }
}

/**
 * Header version: latest SemVer among package versions that do **not** use a
 * `doc*` prerelease suffix (do not strip — pick another version instead).
 *
 * Candidates: `docs-site/package.json` and `app/package.json`.
 */
export function resolveSiteVersion(docsSiteRoot: string): string {
  const repoRoot = path.resolve(docsSiteRoot, '..')
  const candidates = new Set<string>()

  for (const file of [
    path.join(docsSiteRoot, 'package.json'),
    path.join(repoRoot, 'app', 'package.json'),
  ]) {
    const v = readPackageVersion(file)
    if (v) candidates.add(v)
  }

  const usable = [...candidates].filter(
    (v) => semver.valid(v) && !hasDocSuffix(v),
  )

  if (usable.length === 0) return ''
  return semver.rsort(usable)[0] || ''
}
