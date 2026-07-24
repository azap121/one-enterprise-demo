import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '~/routes';
import { haloTheme, haloThemeDark } from '~/theme/halo/theme';
import { ThemeModeProvider, useThemeMode } from '~/theme/ThemeModeContext';

const ThemedRouter = () => {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider theme={mode === 'dark' ? haloThemeDark : haloTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

const el = document.getElementById('halo-app-root');
if (el) {
  const root = createRoot(el);
  root.render(
    <StrictMode>
      <ThemeModeProvider>
        <ThemedRouter />
      </ThemeModeProvider>
    </StrictMode>,
  );
}
