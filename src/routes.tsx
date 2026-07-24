import { createBrowserRouter } from 'react-router-dom';
import { registry } from './projects/registry';
import { Activity, GalleryHome, GalleryWrapper, NotFound, ProductShellPreview, PrototypeFrame } from './shell';

export const router = createBrowserRouter(
  [
    { path: '/shell-preview', element: <ProductShellPreview /> },
    {
      element: <GalleryWrapper />,
      children: [
        { path: '/', element: <GalleryHome /> },
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
