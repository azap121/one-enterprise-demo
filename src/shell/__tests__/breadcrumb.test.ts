import { lazy } from 'react';
import type { PrototypeEntry } from '~/projects/types';
import { computeBreadcrumb } from '../breadcrumb';

const dummy = lazy(() => Promise.resolve({ default: () => null }));
const entry: PrototypeEntry = {
  slug: 'annie-alert-dialog-options',
  type: 'project',
  designer: 'Annie',
  title: 'Alert Dialog Options',
  description: '',
  updatedAt: '2026-04-29',
  component: dummy,
};

describe('computeBreadcrumb', () => {
  it('returns just the gallery label on /', () => {
    expect(computeBreadcrumb('/', [])).toEqual({
      segments: [{ label: 'Datasite Design Prototypes', href: null }],
      backHref: null,
    });
  });
  it('returns gallery + designer + title for a known prototype path', () => {
    const result = computeBreadcrumb('/projects/annie-alert-dialog-options', [entry]);
    expect(result.segments).toEqual([
      { label: 'Datasite Design Prototypes', href: '/' },
      { label: 'Annie', href: null },
      { label: 'Alert Dialog Options', href: null },
    ]);
    expect(result.backHref).toBe('/');
  });
  it('returns gallery label with link home for an unknown prototype path', () => {
    expect(computeBreadcrumb('/projects/does-not-exist', [entry]).segments).toEqual([
      { label: 'Datasite Design Prototypes', href: '/' },
    ]);
  });
  it('makes the gallery label clickable on top-level routes like /activity', () => {
    expect(computeBreadcrumb('/activity', [entry]).segments).toEqual([
      { label: 'Datasite Design Prototypes', href: '/' },
    ]);
  });
  it('handles labs paths', () => {
    const lab: PrototypeEntry = { ...entry, type: 'lab', slug: 'foo' };
    const result = computeBreadcrumb('/labs/foo', [lab]);
    expect(result.segments[2].label).toBe('Alert Dialog Options');
  });
});
