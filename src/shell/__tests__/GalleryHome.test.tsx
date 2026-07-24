import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { PrototypeEntry } from '~/projects/types';
import { GalleryHome } from '../GalleryHome';

jest.mock('~/projects/registry', () => {
  const dummy = jest.requireActual('react').lazy(() => Promise.resolve({ default: () => null }));
  const sample: PrototypeEntry[] = [
    {
      slug: 'a',
      type: 'project',
      designer: 'Annie',
      title: 'Alert Dialog Options',
      description: 'MUI alerts',
      updatedAt: '2026-04-20',
      component: dummy,
    },
    {
      slug: 'b',
      type: 'lab',
      designer: 'Steven',
      title: 'MUI Showcase',
      description: 'Every MUI primitive',
      updatedAt: '2026-04-29',
      component: dummy,
    },
  ];
  return { registry: sample };
});

function renderHome(initial = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/" element={<GalleryHome />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GalleryHome', () => {
  it('renders all prototype cards by default', () => {
    renderHome();
    expect(screen.getByText('Alert Dialog Options')).toBeInTheDocument();
    expect(screen.getByText('MUI Showcase')).toBeInTheDocument();
    expect(screen.getByText('2 prototypes')).toBeInTheDocument();
  });

  it('filters by search query', async () => {
    renderHome();
    await userEvent.type(screen.getByRole('searchbox'), 'showcase');
    expect(screen.queryByText('Alert Dialog Options')).not.toBeInTheDocument();
    expect(screen.getByText('MUI Showcase')).toBeInTheDocument();
  });

  it('filters by type chip', async () => {
    renderHome();
    await userEvent.click(screen.getByRole('button', { name: /^Labs$/i }));
    expect(screen.queryByText('Alert Dialog Options')).not.toBeInTheDocument();
    expect(screen.getByText('MUI Showcase')).toBeInTheDocument();
  });
});
