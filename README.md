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

Static output in `dist/`. **Download counting requires Netlify Functions** (included in this repo).

### Netlify (recommended)

1. Create a site at [Netlify](https://app.netlify.com/) from this GitHub repo.
2. Add GitHub Actions secrets on the repo:
   - `NETLIFY_AUTH_TOKEN` — personal access token from Netlify → User settings → Applications
   - `NETLIFY_SITE_ID` — Site configuration → Site details → Site ID
3. Push to `main`. The workflow deploys the built site and enables `/api/download-count`.

Local dev with a working counter:

```bash
npm run dev
```

Plain `astro build` + static hosting (GitHub Pages only) serves downloads, but the counter stays at the static fallback value unless you also deploy the Netlify functions.
