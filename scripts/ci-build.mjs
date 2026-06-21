#!/usr/bin/env node
/**
 * Cloudflare Workers Builds often runs `npm ci` then `npx wrangler deploy`
 * without a separate astro build step. Build on CI after install so deploy works.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (!process.env.CI || process.env.NETLIFY === 'true') {
  process.exit(0);
}

if (existsSync('dist/server/entry.mjs')) {
  process.exit(0);
}

console.log('[ci-build] Running astro build for Cloudflare deploy…');
execSync('npm run build', { stdio: 'inherit' });
