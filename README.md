## Deploy

Astro site on Cloudflare Workers. Also works on Netlify or any static host.

### Download counter

The live counter uses a hosted counting API from the browser — no server setup on your host. Local dev (`npm run dev`) still uses the file-backed `/api/download-count` endpoint.

### Cloudflare Workers (production)

Connect the repo in Cloudflare Workers Builds. Defaults work — no custom env vars in the dashboard:

| Setting | Value |
|---------|-------|
| **Build command** | `npm ci` |
| **Deploy command** | `npx wrangler deploy` |

`postinstall` runs `astro build` on CI (after `npm ci`) so deploy finds `dist/`. Do **not** add a root `wrangler.jsonc` with only vars — it breaks deploy.

#### Aigent AI proxy

SpinApp is the **traffic guard** in front of Aigent. The worker proxies:

| Host | What gets proxied |
|------|-------------------|
| `spinapp.site` | `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml`; bot-split also **all paths** for AI crawlers |
| `ai.spinapp.site` | **Everything** except `/_astro/*` |

Upstream origin: `https://spinapp.aigent.host` (override via `AIGENT_ORIGIN_URL` if needed).

**DNS:** `ai` CNAME → `spinapp.site`, proxied (orange cloud). Worker route: `*.spinapp.site/*`.

#### Bot-split (always on)

AI crawlers on **`spinapp.site`** get proxied Aigent HTML (same URL, no redirect). Search indexers see the marketing site.

| User-Agent | `spinapp.site` |
|------------|----------------|
| `Googlebot`, `Bingbot`, `DuckDuckBot` | Marketing site |
| `Google`, `Google-Agent`, `Google-Extended`, `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `Claude-User`, `anthropic-ai`, `PerplexityBot`, `Perplexity-User`, `xAI-SearchBot`, `GrokBot`, `DeepSeekBot`, `Applebot-Extended`, `Meta-ExternalAgent`, `Bytespider`, `CCBot`, `Amazonbot`, `YouBot`, `DuckAssistBot`, `Cohere-AI`, `PetalBot`, `GitHub-Copilot`, `Cursor` | Aigent proxy |

**Test:**

```bash
./scripts/test-aigent-proxy.sh
BOT_SPLIT_TEST=1 ./scripts/test-aigent-proxy.sh
```

### Netlify (optional)

Netlify Functions in `netlify/` are kept as a local-dev fallback. `netlify.toml` includes llms.txt proxy redirects if you deploy there instead of Cloudflare.

### Local dev

```bash
npm run dev
```
