const AI_AGENT_PATTERN =
  /gptbot|chatgpt|oai-searchbot|claudebot|claude-web|anthropic|google-extended|bytespider|ccbot|cohere-ai|perplexity|go-http-client|applebot-extended|meta-externalagent/i;

const DEFAULT_MORGON_PRESENCE =
  "https://federation-mount-cookies-hearings.trycloudflare.com/presence/spinapp";

export function morgonPresenceUrl(): string {
  const configured = import.meta.env.MORGON_PRESENCE_URL;

  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_MORGON_PRESENCE;
}

export function isAiAgent(request: Request): boolean {
  const ua = (request.headers.get("user-agent") ?? "").toLowerCase();

  if (AI_AGENT_PATTERN.test(ua)) {
    return true;
  }

  const accept = (request.headers.get("accept") ?? "").toLowerCase();

  return (
    accept.includes("text/markdown") ||
    (accept.includes("text/plain") && !accept.includes("text/html"))
  );
}

export function shouldRedirectToMorgon(pathname: string): boolean {
  if (pathname.startsWith("/_astro/") || pathname.startsWith("/downloads/")) {
    return false;
  }

  if (pathname.startsWith("/api/")) {
    return false;
  }

  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";

  if (lastSegment.includes(".")) {
    return false;
  }

  return true;
}
