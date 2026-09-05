import { marked } from "marked";

/** Dev-only Markdown → HTML. Not part of the public library API. */
export function markdownToPreviewHtml(markdown: string): string {
  if (typeof markdown !== "string") {
    throw new TypeError("markdownToPreviewHtml expects a string");
  }
  return marked.parse(markdown, { async: false }) as string;
}

export const PREVIEW_CSS = `
:root {
  color-scheme: light;
  --bg: #f7f4ef;
  --fg: #1c1917;
  --muted: #78716c;
  --border: #e7e5e4;
  --accent: #0f766e;
  --panel: #ffffff;
  font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  min-height: 100vh;
}
.layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  min-height: 100vh;
}
.sidebar {
  border-right: 1px solid var(--border);
  background: var(--panel);
  padding: 1rem;
  overflow: auto;
}
.sidebar h1 {
  font-size: 0.95rem;
  margin: 0 0 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}
.tree button {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0.35rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
}
.tree button:hover,
.tree button[aria-current="true"] {
  background: #ecfdf5;
  color: var(--accent);
}
.tree .dir {
  margin: 0.4rem 0 0.15rem;
  color: var(--muted);
  font-size: 0.8rem;
}
.main {
  padding: 1.25rem 1.5rem 2rem;
  overflow: auto;
}
.preview {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  max-width: 52rem;
  line-height: 1.65;
}
.preview pre {
  overflow: auto;
  background: #f5f5f4;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}
.status {
  color: var(--muted);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}
@media (max-width: 800px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { border-right: 0; border-bottom: 1px solid var(--border); }
}
`;
