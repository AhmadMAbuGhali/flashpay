import type { Locale } from "@/lib/translations";

export type TranslationTree = Record<string, unknown>;
export type LocaleContentMap = Record<Locale, TranslationTree>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMergeTranslations<T extends TranslationTree>(base: T, override: TranslationTree | null | undefined): T {
  if (!override) {
    return base;
  }

  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const currentValue = result[key];

    if (isPlainObject(currentValue) && isPlainObject(value)) {
      result[key] = deepMergeTranslations(currentValue, value);
      continue;
    }

    result[key] = value;
  }

  return result as T;
}

export function flattenTranslationTree(tree: TranslationTree, prefix = ""): Array<{ key: string; value: string }> {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      return [{ key: path, value }];
    }

    if (isPlainObject(value)) {
      return flattenTranslationTree(value, path);
    }

    return [];
  });
}

export function buildTranslationOverride(entries: Array<{ key: string; value: string }>): TranslationTree {
  const root: Record<string, unknown> = {};

  for (const entry of entries) {
    const segments = entry.key.split(".");
    let current: Record<string, unknown> = root;

    segments.forEach((segment, index) => {
      const isLeaf = index === segments.length - 1;

      if (isLeaf) {
        current[segment] = entry.value;
        return;
      }

      if (!isPlainObject(current[segment])) {
        current[segment] = {};
      }

      current = current[segment] as Record<string, unknown>;
    });
  }

  return root;
}