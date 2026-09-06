import { describe, expect, it } from "vitest";
// Vite raw import — avoid node:fs (stubbed in this Vitest env)
import previewPaneSource from "../../../app/components/playground/components/PreviewPane.vue?raw";

/**
 * Guard the HTML preview CSS contract for fenced code:
 * site-wide `pre` is dark (Shiki), while playground themes need readable
 * light/dark fence bodies after `${}` interpolation expands into fences.
 */
describe("PreviewPane fence contrast CSS", () => {
  it("scopes accent-soft to inline code only (not pre > code)", () => {
    expect(previewPaneSource).toMatch(/:not\(pre\)\s*>\s*code/);
    expect(previewPaneSource).toMatch(/pre code[\s\S]*background:\s*transparent/);
  });

  it("styles fenced pre with playground theme tokens", () => {
    expect(previewPaneSource).toMatch(
      /\.preview__html[\s\S]*pre[\s\S]*background:\s*var\(--bg-deep\)/,
    );
    expect(previewPaneSource).toMatch(
      /\.preview__html[\s\S]*pre[\s\S]*color:\s*var\(--ink\)/,
    );
  });
});
