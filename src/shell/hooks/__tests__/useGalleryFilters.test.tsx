import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useGalleryFilters } from '../useGalleryFilters';

function wrap(initial: string) {
  return ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>;
}

describe('useGalleryFilters', () => {
  it('reads defaults when URL has no params', () => {
    const { result } = renderHook(() => useGalleryFilters(), { wrapper: wrap('/') });
    expect(result.current.state).toEqual({ q: '', type: 'all', designer: 'all' });
    expect(result.current.sort).toBe('updated');
  });

  it('reads from URL query params', () => {
    const { result } = renderHook(() => useGalleryFilters(), {
      wrapper: wrap('/?q=foo&type=lab&designer=Annie&sort=name'),
    });
    expect(result.current.state).toEqual({ q: 'foo', type: 'lab', designer: 'Annie' });
    expect(result.current.sort).toBe('name');
  });

  it('updates URL when setters are called', () => {
    const { result } = renderHook(() => useGalleryFilters(), { wrapper: wrap('/') });
    act(() => result.current.setQuery('rating'));
    expect(result.current.state.q).toBe('rating');
    act(() => result.current.setType('project'));
    expect(result.current.state.type).toBe('project');
    act(() => result.current.setDesigner('Annie'));
    expect(result.current.state.designer).toBe('Annie');
    act(() => result.current.setSort('name'));
    expect(result.current.sort).toBe('name');
  });

  it('clears a filter when setting to default', () => {
    const { result } = renderHook(() => useGalleryFilters(), {
      wrapper: wrap('/?q=foo&type=lab'),
    });
    act(() => result.current.setQuery(''));
    act(() => result.current.setType('all'));
    expect(result.current.state).toEqual({ q: '', type: 'all', designer: 'all' });
  });
});
