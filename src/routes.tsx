import { createBrowserRouter, Navigate } from 'react-router-dom';
import { registry } from './projects/registry';
import { Activity, GalleryHome, GalleryWrapper, NotFound, ProductShellPreview, PrototypeFrame } from './shell';

export const router = createBrowserRouter(
  [
    { path: '/shell-preview', element: <ProductShellPreview /> },
    // Bare domain lands on the One Enterprise Deal OS demo; the gallery index lives at /gallery.
    { path: '/', element: <Navigate to="/projects/paza-one-enterprise-deal-os" replace /> },
    {
      element: <GalleryWrapper />,
      children: [
        { path: '/gallery', element: <GalleryHome /> },
        { path: '/activity', element: <Activity /> },
        ...registry.map((entry) => ({
          path: `/${entry.type === 'project' ? 'projects' : 'labs'}/${entry.slug}`,
          element: <PrototypeFrame entry={entry} />,
        })),
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: process.env.BASE_PATH || '/' },
);
