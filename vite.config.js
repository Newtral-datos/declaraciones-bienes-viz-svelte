import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// En GitHub Pages el sitio se publica bajo /<repo>/, así que el build necesita
// ese prefijo. En dev seguimos en la raíz: el backoffice (backoffice/server.py)
// sirve /data y /fonts desde ahí y no queremos tocar sus rutas.
const GITHUB_PAGES_BASE = '/declaraciones-bienes-viz-svelte/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? GITHUB_PAGES_BASE : '/',
  plugins: [svelte()],
  css: {
    preprocessorOptions: {
      // Sin esto, Vite 5 usa la API JS antigua de Sass y avisa de que
      // desaparece en Dart Sass 2.
      scss: { api: 'modern-compiler' },
    },
  },
  server: {
    port: 5180,
    open: true,
  },
}));
