const DEFAULT_PRESENCE_BASE =
  "https://federation-mount-cookies-hearings.trycloudflare.com/presence/spinapp";

export function morgonPresenceBase(): string {
  const configured = import.meta.env.MORGON_PRESENCE_URL;

  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_PRESENCE_BASE;
}

export async function proxyMorgon(
  path: string,
  request: Request,
  options: { contentType?: string } = {},
): Promise<Response> {
  const incoming = new URL(request.url);
  const target = new URL(path, `${morgonPresenceBase()}/`);
  target.search = incoming.search;

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
