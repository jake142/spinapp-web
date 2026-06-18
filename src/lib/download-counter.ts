export const COUNTER_KEY = "spinapp-macos-downloads";
export const COUNTER_API = "https://countapi.mileshilliard.com/api/v1";

export function isLocalDev(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export async function fetchDownloadCount(): Promise<{ count: number; updatedAt: string | null } | null> {
  try {
    const res = await fetch(`${COUNTER_API}/get/${COUNTER_KEY}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const count = Number.parseInt(String(data.value ?? "0"), 10);
      if (!Number.isNaN(count)) {
        return { count, updatedAt: null };
      }
    }
  } catch {
    // fall through to local endpoints
  }

  for (const endpoint of ["/api/download-count", "/api/download-count.json"]) {
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (typeof data.count === "number") {
        return { count: data.count, updatedAt: data.updatedAt ?? null };
      }
    } catch {
      // try next endpoint
    }
  }

  return null;
}

export async function trackDownload(file: string): Promise<{ count: number; updatedAt: string | null } | null> {
  if (isLocalDev(window.location.hostname)) {
    try {
      const res = await fetch(`/api/download-count?file=${encodeURIComponent(file)}`, {
        method: "POST",
        keepalive: true,
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number") {
          return { count: data.count, updatedAt: data.updatedAt ?? null };
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  try {
    const res = await fetch(`${COUNTER_API}/hit/${COUNTER_KEY}`, { keepalive: true });
    if (!res.ok) return null;
    const data = await res.json();
    const count = Number.parseInt(String(data.value ?? "0"), 10);
    if (Number.isNaN(count)) return null;
    return { count, updatedAt: null };
  } catch {
    return null;
  }
}
