## Deploy

Static Astro output in `dist/`. Works on Cloudflare Workers, Netlify, or any static host.

### Download counter

The live counter uses a hosted counting API from the browser — no server setup on your host. Local dev (`npm run dev`) still uses the file-backed `/api/download-count` endpoint.

### Cloudflare Workers (production)

Connect the repo in Cloudflare Workers Builds with build command:

```bash
npm ci && npm run build
```

AI agents visiting the marketing site are redirected to the Morgon presence URL (`MORGON_PRESENCE_URL`).

No `wrangler.jsonc` needed for the marketing site.

Set `MORGON_PRESENCE_URL` in Cloudflare build/runtime variables when the tunnel URL changes, e.g.:

```
https://your-tunnel.trycloudflare.com/presence/spinapp
```

No `wrangler.jsonc` needed for the marketing site.

### Netlify (optional)

Netlify Functions in `netlify/` are kept as a local-dev fallback. You can also deploy the full site to Netlify via GitHub Actions (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` secrets).

### Local dev

```bash
npm run dev
```
