// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import { devDownloadTracker } from './scripts/dev-download-tracker.mjs';

const counterApiBase = (process.env.PUBLIC_COUNTER_API || '').replace(/\/$/, '');

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), devDownloadTracker()],
    define: {
      'import.meta.env.PUBLIC_COUNTER_API': JSON.stringify(counterApiBase),
    },
  },
});
