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

SpinApp is the **traffic guard** in front of Aigent. The worker proxies:

| Host | What gets proxied |
|------|-------------------|
| `spinapp.site` | `/llms.txt`, `/llms-full.txt` only |
| `ai.spinapp.site` | **Everything** except `/_astro/*` |

Upstream origin: `https://spinapp.aigent.host` (not `ai.spinapp.site` — that loops).

**Your checklist (SpinApp / Cloudflare):**

1. **DNS** — `ai` CNAME → `spinapp.site`, **proxied (orange cloud)**
2. **Worker route** — `*.spinapp.site/*` or `ai.spinapp.site/*` on the Workers project
3. **Env var** — `AIGENT_ORIGIN_URL` = `https://spinapp.aigent.host`
4. **Deploy** — push to `main`, wait for Workers build
5. **One-time purge** — Caching → Custom Purge → `https://ai.spinapp.site/robots.txt`

**Test:**

```bash
./scripts/test-aigent-proxy.sh
```

Or manually:

```bash
curl -sI https://spinapp.site/llms.txt        # 200
curl -sI https://ai.spinapp.site/faq.md       # 200
curl -sI https://ai.spinapp.site/facts.json   # 200
curl -s  https://ai.spinapp.site/robots.txt   # must include GPTBot
```

**Code:** `src/lib/aigent.ts` + `src/middleware.ts` + head tags in `Layout.astro`.

### Netlify (optional)

Netlify Functions in `netlify/` are kept as a local-dev fallback. `netlify.toml` includes llms.txt proxy redirects if you deploy there instead of Cloudflare.

### Local dev

```bash
npm run dev
```
