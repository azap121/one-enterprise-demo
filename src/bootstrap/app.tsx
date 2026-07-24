import { CssBaseline, ThemeProvider } from '@mui/material';
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

const App = () => (
  <ThemeModeProvider>
    <ThemedRouter />
  </ThemeModeProvider>
);

const mount = (el: HTMLElement) => {
  const root = createRoot(el);
  root.render(<App />);
  return () => root.unmount();
};

export { mount };
export default App;
