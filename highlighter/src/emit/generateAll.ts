import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { HighlighterIr } from "../types.ts";
import { emitTextMate } from "./emitTextMate.ts";
import { emitPrism } from "./emitPrism.ts";
import { emitHighlightJs } from "./emitHighlightJs.ts";
import { emitCodeMirror } from "./emitCodeMirror.ts";
import { emitMonaco } from "./emitMonaco.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const GENERATED_DIR = join(ROOT, "generated");

export type GeneratedArtifacts = {
  textmate: string;
  prism: string;
  highlightjs: string;
  codemirror: string;
  monaco: string;
};

export function emitAll(ir: HighlighterIr): GeneratedArtifacts {
  return {
    textmate: emitTextMate(ir),
    prism: emitPrism(ir),
    highlightjs: emitHighlightJs(ir),
    codemirror: emitCodeMirror(ir),
    monaco: emitMonaco(ir),
  };
}

export function writeGenerated(ir: HighlighterIr, outDir: string = GENERATED_DIR): GeneratedArtifacts {
  const artifacts = emitAll(ir);
  const targets: Array<[string, string]> = [
    [join(outDir, "textmate", "hyogen.tmLanguage.json"), artifacts.textmate],
    [join(outDir, "prism", "hyogen.js"), artifacts.prism],
    [join(outDir, "highlightjs", "hyogen.js"), artifacts.highlightjs],
    [join(outDir, "codemirror", "hyogenSpec.ts"), artifacts.codemirror],
    [join(outDir, "monaco", "hyogen.monarch.json"), artifacts.monaco],
  ];

  for (const [path, content] of targets) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
  }

  return artifacts;
}
