const DEFAULT_PRESENCE_BASE =
  "https://federation-mount-cookies-hearings.trycloudflare.com/presence/spinapp";

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

export function morgonPresenceBase(): string {
  const configured = import.meta.env.MORGON_PRESENCE_URL;

  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_PRESENCE_BASE;
}

function stripTrackingParams(url: URL): void {
  for (const key of TRACKING_PARAMS) {
    url.searchParams.delete(key);
  }
}

export async function fetchMorgonText(
  path: string,
  request: Request,
): Promise<{ status: number; body: string }> {
  const incoming = new URL(request.url);
  const base = morgonPresenceBase();
  const target = new URL(`${base}${path}`);
  target.search = incoming.search;
  stripTrackingParams(target);

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: "text/plain, text/markdown, */*",
    },
  });

  return {
    status: upstream.status,
    body: await upstream.text(),
  };
}

export function wantsHtmlDocument(request: Request): boolean {
  const ua = (request.headers.get("User-Agent") ?? "").toLowerCase();

  if (
    ua.includes("go-http-client") ||
    ua.includes("chatgpt") ||
    ua.includes("gptbot") ||
    ua.includes("openai")
  ) {
    return true;
  }

  const accept = (request.headers.get("Accept") ?? "").toLowerCase();

  if (accept.includes("text/plain") && !accept.includes("text/html")) {
    return false;
  }

  return (
    accept.includes("text/html") ||
    accept === "*/*" ||
    accept.startsWith("*/*;")
  );
}

export function llmsHtmlDocument(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="description" content="Official machine-readable knowledge index for SpinApp.">
  <link rel="canonical" href="https://spinapp.site/llms.txt">
  <title>SpinApp — llms.txt</title>
</head>
<body>
<pre>${escaped}</pre>
</body>
</html>`;
}

export async function proxyMorgon(
  path: string,
  request: Request,
  options: { contentType?: string } = {},
): Promise<Response> {
  const incoming = new URL(request.url);
  const base = morgonPresenceBase();
  const target = new URL(`${base}${path}`);
  target.search = incoming.search;
  stripTrackingParams(target);

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: request.headers.get("Accept") ?? "*/*",
    },
  });

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", "no-cache, must-revalidate");

  const contentType =
    options.contentType ?? upstream.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
