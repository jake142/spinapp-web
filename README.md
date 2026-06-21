## Deploy

Astro site on Cloudflare Workers. Also works on Netlify or any static host.

### Download counter

The live counter uses a hosted counting API from the browser — no server setup on your host. Local dev (`npm run dev`) still uses the file-backed `/api/download-count` endpoint.

### Cloudflare Workers (production)

Connect the repo in Cloudflare Workers Builds:

```bash
npm ci && npm run build
```

#### Aigent AI proxy

This site proxies AI content from Aigent to `ai.spinapp.site` and `/llms.txt` on the root domain.

**DNS** — CNAME `ai` → `spinapp.site`, proxied (orange).

**Worker route** — Domains → Add Route `*.spinapp.site/*` (or `ai.spinapp.site/*`). Custom Domain UI often fails; route works.

**Env var** — Workers → Settings → Variables:

```
AIGENT_ORIGIN_URL = https://spinapp.aigent.host
```

Not `https://ai.spinapp.site` — that loops.

**Code** — `src/lib/aigent.ts` + `src/middleware.ts` (already in repo). Redeploy after changes.

Test: `https://ai.spinapp.site/llms.txt` and `https://spinapp.site/llms.txt` should return 200.

### Netlify (optional)

Netlify Functions in `netlify/` are kept as a local-dev fallback. You can also deploy the full site to Netlify via GitHub Actions (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` secrets).

### Local dev

```bash
npm run dev
```
