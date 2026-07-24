import type { PrototypeDiscipline, PrototypeEntry, PrototypeType } from '~/projects/types';

export type TypeFilter = PrototypeType | 'all';
export type DesignerFilter = string | 'all';
export type DisciplineFilter = PrototypeDiscipline | 'all' | 'hidden';
export type SortMode = 'updated' | 'name';

export interface FilterState {
  q: string;
  type: TypeFilter;
  designer: DesignerFilter;
  discipline: DisciplineFilter;
}

export function filterPrototypes(entries: readonly PrototypeEntry[], state: FilterState): PrototypeEntry[] {
  const q = state.q.trim().toLowerCase();
  return entries.filter((entry) => {
    if (state.type !== 'all' && entry.type !== state.type) return false;
    if (state.designer !== 'all' && entry.designer !== state.designer) return false;
    if (state.discipline !== 'all' && state.discipline !== 'hidden' && entry.discipline !== state.discipline) return false;
    if (q.length === 0) return true;
    const haystack = `${entry.title} ${entry.description} ${entry.designer}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function sortPrototypes(entries: readonly PrototypeEntry[], mode: SortMode): PrototypeEntry[] {
  const out = [...entries];
  if (mode === 'updated') {
    out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } else {
    out.sort((a, b) => a.title.localeCompare(b.title));
  }
  return out;
}
