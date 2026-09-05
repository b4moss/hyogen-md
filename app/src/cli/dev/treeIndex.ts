import path from "node:path";
import { collectEntryPaths } from "../../build/collectEntryPaths.js";

export type FileTreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeNode[];
};

/**
 * Build a nested file tree from config `input` globs (entry markdown only).
 */
export async function buildFileTree(options: {
  input: string | string[];
  root?: string;
  includeUnderscoreEntries?: boolean;
}): Promise<FileTreeNode[]> {
  const entries = await collectEntryPaths(options.input, {
    root: options.root,
    includeUnderscoreEntries: options.includeUnderscoreEntries,
  });

  const rootDir = options.root ? path.resolve(options.root) : process.cwd();
  const root: FileTreeNode = {
    name: "",
    path: "",
    type: "directory",
    children: [],
  };

  for (const absolute of entries) {
    const relative = path.relative(rootDir, absolute).replace(/\\/g, "/");
    if (!relative || relative.startsWith("..")) {
      insertPath(root, path.basename(absolute), path.resolve(absolute));
      continue;
    }
    insertPath(root, relative, path.resolve(absolute));
  }

  return root.children ?? [];
}

function insertPath(
  root: FileTreeNode,
  relativePath: string,
  absolutePath: string,
): void {
  const parts = relativePath.split("/").filter(Boolean);
  let current = root;
  let relAccum: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    const isFile = i === parts.length - 1;
    relAccum = [...relAccum, part];
    current.children ??= [];
    let next = current.children.find((child) => child.name === part);
    if (!next) {
      next = {
        name: part,
        path: isFile ? absolutePath : relAccum.join("/"),
        type: isFile ? "file" : "directory",
        children: isFile ? undefined : [],
      };
      current.children.push(next);
      current.children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    }
    current = next;
  }
}
