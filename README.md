## Deploy

Static Astro output in `dist/`. Works on Cloudflare Workers, Netlify, or any static host.

### Download counter

The live counter uses a hosted counting API from the browser — no server setup on your host. Local dev (`npm run dev`) still uses the file-backed `/api/download-count` endpoint.

### Cloudflare Workers (production)

Connect the repo in Cloudflare Workers Builds with build command:

```bash
npm ci && npm run build
```

`/llms.txt` and `/llms-full.txt` on the marketing site are proxied live from Aigent. On `ai.spinapp.site`, all AI paths (`/full`, `/t/*`, `/search`, etc.) proxy to Aigent (Cloudflare middleware). No AI agent redirects.

Optional override — set `AIGENT_ORIGIN_URL` in Cloudflare build/runtime variables to the Aigent base URL (no trailing slash), e.g.:

```
https://spinapp.aigent.host
```

When `ai.spinapp.site` DNS is fully wired, you can switch to `https://ai.spinapp.site`.

No `wrangler.jsonc` needed for the marketing site.

### Netlify (optional)

Netlify Functions in `netlify/` are kept as a local-dev fallback. You can also deploy the full site to Netlify via GitHub Actions (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` secrets).

### Local dev

```bash
npm run dev
```
