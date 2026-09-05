/** Strip common Markdown decorations from heading display text. */
export function plainifyHeadingText(text: string): string {
  let s = text.trim();

  // Images then links (keep alt / label text)
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  s = s.replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1");

  // Bold / italic / strikethrough / code (repeat for light nesting)
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
    s = s.replace(/__([^_]+)__/g, "$1");
    s = s.replace(/~~([^~]+)~~/g, "$1");
    s = s.replace(/\*([^*]+)\*/g, "$1");
    s = s.replace(/_([^_]+)_/g, "$1");
    s = s.replace(/`([^`]+)`/g, "$1");
  }

  return s.trim();
}
