import type { PrototypeEntry } from '~/projects/types';

export interface BreadcrumbSegment {
  label: string;
  href: string | null;
}

export interface Breadcrumb {
  segments: BreadcrumbSegment[];
  backHref: string | null;
}

const ROOT_LABEL = 'Halo';

export function computeBreadcrumb(pathname: string, registry: readonly PrototypeEntry[], search = ''): Breadcrumb {
  const isRoot = pathname === '/' || pathname === '';
  const hasFilters = search.length > 0;
  const rootHref = isRoot && !hasFilters ? null : '/';

  const match = pathname.match(/^\/(projects|labs)\/([^/]+)\/?$/);
  if (!match) {
    return { segments: [{ label: ROOT_LABEL, href: rootHref }], backHref: null };
  }
  const [, , slug] = match;
  const entry = registry.find((e) => e.slug === slug);
  if (!entry) {
    return { segments: [{ label: ROOT_LABEL, href: rootHref }], backHref: null };
  }
  return {
    segments: [
      { label: ROOT_LABEL, href: '/' },
      { label: entry.designer, href: `/?designer=${encodeURIComponent(entry.designer)}&discipline=all` },
      { label: entry.title, href: null },
    ],
    backHref: '/',
  };
}
