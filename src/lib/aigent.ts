const DEFAULT_AIGENT_ORIGIN = "https://spinapp.aigent.host";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
]);

/** Aigent AI site base URL (no trailing slash). Override via AIGENT_ORIGIN_URL in Cloudflare. */
export function aigentOriginUrl(): string {
  const configured = import.meta.env.AIGENT_ORIGIN_URL;

  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_AIGENT_ORIGIN;
}

export function aigentLlmsUrl(): string {
  return `${aigentOriginUrl()}/llms.txt`;
}

/** Proxy live llms.txt from Aigent — URL stays spinapp.site/llms.txt (status 200, not redirect). */
export async function proxyLlmsTxt(request: Request): Promise<Response> {
  let upstream: Response;

  try {
    upstream = await fetch(aigentLlmsUrl(), {
      headers: {
        Accept: request.headers.get("Accept") ?? "text/plain, */*",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "fetch failed";

    return new Response(`llms.txt unavailable: ${message}`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!upstream.ok) {
    return new Response(`llms.txt upstream returned ${upstream.status}`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const headers = new Headers();

  for (const [key, value] of upstream.headers.entries()) {
    if (HOP_BY_HOP.has(key.toLowerCase())) {
      continue;
    }

    headers.set(key, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
