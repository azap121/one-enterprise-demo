import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const BASE_PATH = process.env.BASE_PATH || '/';
const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './public/index.html',
  },
  output: {
    assetPrefix: BASE_PATH,
    cleanDistPath: process.env.NODE_ENV === 'production',
  },
  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
      'process.env.BASE_PATH': JSON.stringify(BASE_PATH),
    },
  },
  server: {
    open: true,
    port: Number(process.env.PORT ?? 9000),
  },
  tools: {
    rspack: {
      resolve: {
        // vendor/@fortawesome packages are file: symlinks — don't dereference
        // them to their real path or rspack loses them outside node_modules
        symlinks: false,
      },
    },
  },
});
