// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';
import { devDownloadTracker } from './scripts/dev-download-tracker.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://spinapp.site',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss(), devDownloadTracker()],
  },
});
