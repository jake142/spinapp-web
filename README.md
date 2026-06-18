## Deploy

The marketing site is static Astro output in `dist/`.

### Download counter

Counting runs on **Netlify Functions** (`/api/download-count`). Netlify Blobs stores the total.

| Host | What to do |
|------|------------|
| **Netlify** (recommended) | Deploy via GitHub Actions. Counter works on same origin automatically. |
| **Cloudflare Workers** (static) | Set build variable `PUBLIC_COUNTER_API` to your Netlify deploy URL (see GitHub Actions log after deploy). Example: `https://your-site.netlify.app` |

### Netlify deploy

1. Connect the repo on Netlify or use the GitHub Action.
2. Add secrets: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`.
3. Push to `main`.

### Cloudflare Workers (static site)

Cloudflare Workers Builds can keep serving the static site (`npm run build` only). Do **not** add `wrangler.jsonc` unless you migrate fully to Workers server mode.

To show the live counter on Cloudflare, point `PUBLIC_COUNTER_API` at the Netlify URL that hosts the API.

### Local dev

```bash
npm run dev
```

Uses a local file-backed counter. For Netlify functions locally:

```bash
npm run dev:netlify
```
