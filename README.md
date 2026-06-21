## Deploy

Astro site on Cloudflare Workers. Also works on Netlify or any static host.

### Download counter

The live counter uses a hosted counting API from the browser — no server setup on your host. Local dev (`npm run dev`) still uses the file-backed `/api/download-count` endpoint.

### Cloudflare Workers (production)

Connect the repo in Cloudflare Workers Builds:

| Setting | Value |
|---------|-------|
| **Build command** | `npm ci && npm run build` |
| **Deploy command** | `npx wrangler deploy --config dist/server/wrangler.json` |

Do **not** run bare `npx wrangler deploy` — it reads root `wrangler.jsonc` (vars only) and fails. Astro merges those vars into `dist/server/wrangler.json` during build; deploy must use that file.

Env vars live in `wrangler.jsonc` (merged at build time). Dashboard Variables get wiped on deploy.

#### Aigent AI proxy

SpinApp is the **traffic guard** in front of Aigent. The worker proxies:

| Host | What gets proxied |
|------|-------------------|
| `spinapp.site` | `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml`; with `AIGENT_BOT_SPLIT=true` also **all paths** for AI crawlers (see below) |
| `ai.spinapp.site` | **Everything** except `/_astro/*` |

Upstream origin: `https://spinapp.aigent.host` (not `ai.spinapp.site` — that loops).

**Your checklist (SpinApp / Cloudflare):**

1. **DNS** — `ai` CNAME → `spinapp.site`, **proxied (orange cloud)**
2. **Worker route** — `*.spinapp.site/*` or `ai.spinapp.site/*` on the Workers project
3. **Env vars** — defined in `wrangler.jsonc` (survives deploy; dashboard copies get wiped)
4. **Deploy** — push to `main`, wait for Workers build
5. **One-time purge** — Caching → Custom Purge → `https://ai.spinapp.site/robots.txt`

#### Bot-split (enabled by default)

`AIGENT_BOT_SPLIT=true` in `wrangler.jsonc` — AI crawlers hitting **`spinapp.site`** get proxied Aigent HTML (same URL, no redirect). Traditional indexers still see the marketing site.

| User-Agent | Behavior on `spinapp.site` |
|------------|----------------------------|
| `Googlebot`, `Bingbot` | Marketing site (SEO) |
| `Google-Extended`, `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot` | Proxied Aigent content |

To disable: set `AIGENT_BOT_SPLIT` to `false` in `wrangler.jsonc` and redeploy.

```bash
# AI bot → Aigent HTML on marketing domain
curl -sI https://spinapp.site/ -A "GPTBot/1.0" | head -5

# Indexer → Astro marketing
curl -sI https://spinapp.site/ -A "Mozilla/5.0 (compatible; Googlebot/2.1)" | head -5
```

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
