import path from "node:path";
import { buildDependencyGraph } from "../../build/buildDependencyGraph.js";
import { collectEntryPaths } from "../../build/collectEntryPaths.js";
import { createNodeLoader } from "../../io/createNodeLoader.js";
import type { Loader } from "../../types.js";

export type DependencyIndex = {
  entries: string[];
  /** Absolute dependency path → absolute entry paths that depend on it. */
  dependentsByPath: Map<string, Set<string>>;
  /** All watched absolute paths (entries + dependencies). */
  watchPaths: string[];
};

function normalizePath(filePath: string): string {
  return path.resolve(filePath);
}

/**
 * Build reverse dependency index for file-level HMR.
 */
export async function buildDependencyIndex(options: {
  input: string | string[];
  root?: string;
  includeUnderscoreEntries?: boolean;
  loader?: Loader;
}): Promise<DependencyIndex> {
  const loader = options.loader ?? createNodeLoader();
  const entries = (
    await collectEntryPaths(options.input, {
      root: options.root,
      includeUnderscoreEntries: options.includeUnderscoreEntries,
    })
  ).map(normalizePath);

  const graph =
    entries.length === 0
      ? {
          entries,
          dependencies: [] as string[],
          nodes: [] as string[],
          edges: [] as { from: string; to: string; kind: string }[],
        }
      : await buildDependencyGraph(entries, loader, {
          root: options.root,
          constrainToRoot: options.root !== undefined,
        });

  const dependentsByPath = new Map<string, Set<string>>();

  const addDependent = (dep: string, entry: string) => {
    const key = normalizePath(dep);
    const value = normalizePath(entry);
    let set = dependentsByPath.get(key);
    if (!set) {
      set = new Set();
      dependentsByPath.set(key, set);
    }
    set.add(value);
  };

  for (const entry of entries) {
    addDependent(entry, entry);
  }

  const reverse = new Map<string, Set<string>>();
  for (const edge of graph.edges) {
    const to = normalizePath(edge.to);
    const from = normalizePath(edge.from);
    let set = reverse.get(to);
    if (!set) {
      set = new Set();
      reverse.set(to, set);
    }
    set.add(from);
  }

  const entrySet = new Set(entries);
  for (const node of graph.nodes.map(normalizePath)) {
    const reachableImporters = new Set<string>();
    const queue = [...(reverse.get(node) ?? [])];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (seen.has(current)) continue;
      seen.add(current);
      if (entrySet.has(current)) {
        reachableImporters.add(current);
      }
      for (const parent of reverse.get(current) ?? []) {
        queue.push(parent);
      }
    }
    for (const entry of reachableImporters) {
      addDependent(node, entry);
    }
    if (entrySet.has(node)) {
      addDependent(node, node);
    }
  }

  const watchPaths = [
    ...new Set([...graph.nodes.map(normalizePath), ...entries]),
  ];

  return { entries, dependentsByPath, watchPaths };
}

/**
 * Resolve which entries must re-render after `changedPaths` change.
 */
export function collectAffectedEntries(
  index: DependencyIndex,
  changedPaths: string | string[],
): string[] {
  const changed = Array.isArray(changedPaths) ? changedPaths : [changedPaths];
  const affected = new Set<string>();
  for (const filePath of changed) {
    const deps = index.dependentsByPath.get(normalizePath(filePath));
    if (!deps) continue;
    for (const entry of deps) {
      affected.add(entry);
    }
  }
  return [...affected].sort();
}
