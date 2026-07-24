import { useCallback, useState } from 'react';

const STORAGE_KEY = 'halo-gallery:hidden-slugs';

function readHidden(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored) as string[]);
  } catch {}
  return new Set();
}

function writeHidden(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function useHiddenPrototypes() {
  const [hidden, setHidden] = useState<Set<string>>(readHidden);

  const hideSlug = useCallback((slug: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.add(slug);
      writeHidden(next);
      return next;
    });
  }, []);

  const showSlug = useCallback((slug: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      writeHidden(next);
      return next;
    });
  }, []);

  return { hidden, hideSlug, showSlug };
}
