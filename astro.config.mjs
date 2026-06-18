// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import { devDownloadTracker } from './scripts/dev-download-tracker.mjs';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), devDownloadTracker()],
  },
});
