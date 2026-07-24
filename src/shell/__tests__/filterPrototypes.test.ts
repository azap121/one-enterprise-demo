import { lazy } from 'react';
import type { PrototypeEntry } from '~/projects/types';
import { filterPrototypes, sortPrototypes } from '../filterPrototypes';

const dummy = lazy(() => Promise.resolve({ default: () => null }));

const sample: PrototypeEntry[] = [
  {
    slug: 'a',
    type: 'project',
    designer: 'Annie',
    title: 'Alert Dialog Options',
    description: 'Three MUI-based alert dialog layouts.',
    updatedAt: '2026-04-20',
    component: dummy,
  },
  {
    slug: 'b',
    type: 'lab',
    designer: 'Steven',
    title: 'MUI Component Showcase',
    description: 'Every Material UI primitive Datasite supports.',
    updatedAt: '2026-04-29',
    component: dummy,
  },
  {
    slug: 'c',
    type: 'project',
    designer: 'Steven',
    title: 'Rating System',
    description: 'Three rating interaction patterns.',
    updatedAt: '2026-04-15',
    component: dummy,
  },
];

describe('filterPrototypes', () => {
  it('returns all when filter is empty', () => {
    expect(filterPrototypes(sample, { q: '', type: 'all', designer: 'all' })).toHaveLength(3);
  });
  it('filters by case-insensitive query against title, description, designer', () => {
    expect(filterPrototypes(sample, { q: 'rating', type: 'all', designer: 'all' })).toHaveLength(1);
    expect(filterPrototypes(sample, { q: 'STEVEN', type: 'all', designer: 'all' })).toHaveLength(2);
    expect(filterPrototypes(sample, { q: 'mui-based', type: 'all', designer: 'all' })).toHaveLength(1);
  });
  it('filters by type', () => {
    expect(filterPrototypes(sample, { q: '', type: 'project', designer: 'all' })).toHaveLength(2);
    expect(filterPrototypes(sample, { q: '', type: 'lab', designer: 'all' })).toHaveLength(1);
  });
  it('filters by designer', () => {
    expect(filterPrototypes(sample, { q: '', type: 'all', designer: 'Annie' })).toHaveLength(1);
  });
  it('combines filters', () => {
    expect(filterPrototypes(sample, { q: 'rating', type: 'project', designer: 'Steven' })).toHaveLength(1);
    expect(filterPrototypes(sample, { q: 'rating', type: 'lab', designer: 'Steven' })).toHaveLength(0);
  });
});

describe('sortPrototypes', () => {
  it('sorts by updatedAt descending', () => {
    const sorted = sortPrototypes(sample, 'updated');
    expect(sorted.map((p) => p.slug)).toEqual(['b', 'a', 'c']);
  });
  it('sorts by title ascending', () => {
    const sorted = sortPrototypes(sample, 'name');
    expect(sorted.map((p) => p.slug)).toEqual(['a', 'b', 'c']);
  });
  it('does not mutate input', () => {
    const original = [...sample];
    sortPrototypes(sample, 'name');
    expect(sample).toEqual(original);
  });
});
