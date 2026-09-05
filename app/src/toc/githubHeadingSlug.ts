/**
 * GitHub-compatible heading slug (no external deps).
 * Explicit IDs are used as-is; otherwise lowercase, strip punctuation, spaces→`-`.
 * Duplicate base slugs get `-1`, `-2`, … suffixes (GitHub behavior).
 */

const PUNCTUATION =
  /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;

export type HeadingSlugger = {
  slug(text: string, explicitId?: string): string;
};

export function createHeadingSlugger(): HeadingSlugger {
  const seen = new Map<string, number>();

  return {
    slug(text: string, explicitId?: string): string {
      const base =
        explicitId !== undefined && explicitId.length > 0
          ? explicitId
          : githubSlugify(text);

      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      if (count === 0) {
        return base;
      }
      return `${base}-${count}`;
    },
  };
}

/** One-shot slug without duplicate tracking. */
export function githubSlugify(text: string): string {
  return text.toLowerCase().replace(PUNCTUATION, "").replace(/\s+/g, "-");
}
