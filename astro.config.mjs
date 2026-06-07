import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// Sanctuary site for jaindisha.in.
// Static homepage now; /admin + /api/* opt into SSR later via `export const prerender = false`.
// The Netlify adapter is wired from M0 so adding server routes at M2+ needs no config change.
export default defineConfig({
  site: 'https://jaindisha.in',
  output: 'static',
  adapter: netlify(),
});
