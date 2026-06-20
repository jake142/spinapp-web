const DEFAULT_LLMS_ORIGIN = "https://ai.spinapp.site";

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

/** Base URL for Aigent AI site (no trailing slash). Override via MORGON_PRESENCE_URL in Cloudflare. */
export function llmsOriginUrl(): string {
  const configured = import.meta.env.MORGON_PRESENCE_URL;

  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_LLMS_ORIGIN;
}

export function llmsOriginTarget(): string {
  return `${llmsOriginUrl()}/llms.txt`;
}

/** Proxy live llms.txt from Aigent — URL stays spinapp.site/llms.txt (status 200, not redirect). */
export async function proxyLlmsTxt(request: Request): Promise<Response> {
  const upstream = await fetch(llmsOriginTarget(), {
    headers: {
      Accept: request.headers.get("Accept") ?? "text/plain, */*",
    },
  });

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
