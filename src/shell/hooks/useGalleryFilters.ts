import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { DisciplineFilter, FilterState, SortMode, TypeFilter } from '../filterPrototypes';

export interface GalleryFilters {
  state: FilterState;
  sort: SortMode;
  setQuery: (q: string) => void;
  setType: (t: TypeFilter) => void;
  setDesigner: (d: string) => void;
  setDiscipline: (d: DisciplineFilter) => void;
  setSort: (s: SortMode) => void;
}

export function useGalleryFilters(): GalleryFilters {
  const [params, setParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isGallery = pathname === '/';

  const state: FilterState = useMemo(
    () => ({
      q: params.get('q') ?? '',
      type: ((): TypeFilter => {
        const v = params.get('type');
        return v === 'project' || v === 'lab' ? v : 'all';
      })(),
      designer: params.get('designer') ?? 'all',
      discipline: ((): DisciplineFilter => {
        const v = params.get('discipline');
        return v === 'product' || v === 'information' || v === 'documentation' || v === 'hidden' || v === 'all' ? v : 'product';
      })(),
    }),
    [params],
  );

  const sort: SortMode = useMemo(() => {
    const v = params.get('sort');
    return v === 'name' ? 'name' : 'updated';
  }, [params]);

  const update = useCallback(
    (key: string, value: string, defaultValue: string) => {
      const next = new URLSearchParams(params);
      if (value === defaultValue || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      if (!isGallery) {
        const qs = next.toString();
        navigate(qs ? `/?${qs}` : '/');
      } else {
        setParams(next);
      }
    },
    [isGallery, navigate, params, setParams],
  );

  return {
    state,
    sort,
    setQuery: (q) => update('q', q, ''),
    setType: (t) => update('type', t, 'all'),
    setDesigner: (d) => update('designer', d, 'all'),
    setDiscipline: (d) => update('discipline', d, 'product'),
    setSort: (s) => update('sort', s, 'updated'),
  };
}
