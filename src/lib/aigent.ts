const DEFAULT_AIGENT_ORIGIN = 'https://spinapp.aigent.host';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
]);

/** Aigent AI site base URL (no trailing slash). Override via AIGENT_ORIGIN_URL in Cloudflare. */
export function aigentOriginUrl(): string {
  const configured = import.meta.env.AIGENT_ORIGIN_URL;

  if (typeof configured === 'string' && configured.length > 0) {
    return configured.replace(/\/$/, '');
  }

  return DEFAULT_AIGENT_ORIGIN;
}

export function isAiSubdomain(host: string): boolean {
  return host.startsWith('ai.');
}

export function shouldProxyToAigent(pathname: string, host: string): boolean {
  if (isAiSubdomain(host)) {
    return !pathname.startsWith('/_astro/');
  }

  // Main marketing site — brief llms files only on root domain.
  return pathname === '/llms.txt' || pathname === '/llms-full.txt';
}

/** Proxy Aigent AI endpoints — path preserved, URL stays on spinapp.site / ai.spinapp.site. */
export async function proxyAigent(request: Request): Promise<Response> {
  const incoming = new URL(request.url);
  const origin = new URL(aigentOriginUrl());
  const upstreamUrl = `${origin.origin}${incoming.pathname}${incoming.search}`;

  const requestHeaders = new Headers();
  requestHeaders.set(
    'Accept',
    request.headers.get('Accept') ?? 'text/html, text/plain, */*',
  );

  const userAgent = request.headers.get('User-Agent');
  if (userAgent) {
    requestHeaders.set('User-Agent', userAgent);
  }

  const signatureAgent = request.headers.get('Signature-Agent');
  if (signatureAgent) {
    requestHeaders.set('Signature-Agent', signatureAgent);
  }

  // Laravel uses the public AI host for links in HTML / llms.txt.
  if (incoming.hostname !== origin.hostname) {
    requestHeaders.set('X-Forwarded-Host', incoming.hostname);
    requestHeaders.set('X-Forwarded-Proto', incoming.protocol.replace(':', ''));
    const clientIp = request.headers.get('CF-Connecting-Ip');
    if (clientIp) {
      requestHeaders.set('X-Forwarded-For', clientIp);
    }
  }

  let upstream: Response;

  try {
    upstream = await fetch(upstreamUrl, { headers: requestHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'fetch failed';

    return new Response(`Aigent proxy unavailable: ${message}`, {
      status: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (!upstream.ok) {
    return new Response(`Aigent upstream returned ${upstream.status} for ${incoming.pathname}`, {
      status: upstream.status === 404 ? 404 : 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const responseHeaders = new Headers();

  for (const [key, value] of upstream.headers.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase())) {
      continue;
    }

    responseHeaders.set(key, value);
  }

  // Avoid stale edge cache (e.g. old static robots.txt stub on ai.spinapp.site).
  if (isAiSubdomain(incoming.hostname)) {
    responseHeaders.delete('etag');
    responseHeaders.set('Cache-Control', 'public, max-age=300, must-revalidate');
    responseHeaders.set('CDN-Cache-Control', 'max-age=300');
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
