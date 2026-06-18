# spinapp-web

Marketing site for [SpinApp](https://github.com/jake142/spinapp) — built with Astro and Tailwind CSS.

## Development

```bash
nvm use 22
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The download link is synced from the latest `.dmg` in `../spinapp/release/` and copied to `public/downloads/` before each dev/build.

## Deploy

Static output in `dist/`. **Download counting needs a server route** — production uses **Cloudflare Workers** (see `wrangler.toml`).

### Cloudflare Workers (production)

The site uses **@astrojs/cloudflare** with a server route at `/api/download-count`. The adapter provisions a KV namespace automatically — no manual binding needed.

Cloudflare Workers Builds should use:
- **Build command:** `npm ci && npm run build`
- **Deploy command:** `npx wrangler deploy`

### Netlify (optional)

Netlify Functions in `netlify/` are an alternative backend. Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` GitHub secrets to use the deploy workflow.

### Local dev

```bash
npm run dev
```

Uses a local file-backed counter. For a production-like test:

```bash
npm run preview:cf
```
