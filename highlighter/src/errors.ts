export class HighlighterDslError extends Error {
  readonly path: string;

  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "HighlighterDslError";
    this.path = path;
  }
}
