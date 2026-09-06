import { loadHighlighterDsl } from "../src/loadHighlighterDsl.ts";
import { writeGenerated } from "../src/emit/generateAll.ts";

const ir = loadHighlighterDsl();
writeGenerated(ir);
console.log("Generated highlighter artifacts for", ir.name, `v${ir.version}`);
