// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';
import { devDownloadTracker } from './scripts/dev-download-tracker.mjs';

// https://astro.build/config

/** Baked in at build — avoids wrangler.jsonc breaking Cloudflare Workers Builds deploy. */
const aigentEnv = {
  AIGENT_ORIGIN_URL: 'https://spinapp.aigent.host',
  AIGENT_BOT_SPLIT: 'true',
};

export default defineConfig({
  site: 'https://spinapp.site',
  adapter: cloudflare(),
  vite: {
    define: Object.fromEntries(
      Object.entries(aigentEnv).map(([key, value]) => [
        `import.meta.env.${key}`,
        JSON.stringify(value),
      ]),
    ),
    plugins: [tailwindcss(), devDownloadTracker()],
  },
});
