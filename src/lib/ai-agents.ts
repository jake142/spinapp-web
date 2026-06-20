const AI_AGENT_PATTERN =
  /gptbot|chatgpt|oai-searchbot|claudebot|claude-web|claude-user|anthropic|google-extended|google-agent|googleother|\bgemini\b|\bbard\b|bytespider|tiktokspider|ccbot|cohere-ai|perplexitybot|perplexity-user|perplexity|go-http-client|applebot-extended|applebot|meta-externalagent|facebookexternalhit|xai-searchbot|grokbot|x-ai-grok|grok-deepsearch|bingbot|bingpreview|duckassistbot|duckduckbot|petalbot|amazonbot|youbot|github-copilot|copilot/i;

const DEFAULT_MORGON_PRESENCE =
  "https://federation-mount-cookies-hearings.trycloudflare.com/presence/spinapp";

/** Paths that should always route to Morgon — even for human Chrome UAs (Gemini browser reads these). */
const MORGON_DISCOVERY_PATHS = new Set([
  "/llms.txt",
  "/llms-full.txt",
  "/ai.txt",
  "/.well-known/ai.txt",
]);

export function morgonPresenceUrl(): string {
  const configured = import.meta.env.MORGON_PRESENCE_URL;

  if (typeof configured === "string" && configured.length > 0) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_MORGON_PRESENCE;
}

export function morgonLlmsUrl(): string {
  return `${morgonPresenceUrl()}/llms.txt`;
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

export function isMorgonDiscoveryPath(pathname: string): boolean {
  const normalized = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  return MORGON_DISCOVERY_PATHS.has(normalized);
}

export function shouldRedirectToMorgon(pathname: string): boolean {
  if (isMorgonDiscoveryPath(pathname)) {
    return true;
  }

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

export function redirectTarget(pathname: string): string {
  if (pathname === "/llms.txt" || pathname === "/llms-full.txt") {
    return morgonLlmsUrl();
  }

  if (pathname === "/ai.txt" || pathname === "/.well-known/ai.txt") {
    return `${morgonPresenceUrl()}/.well-known/ai.json`;
  }

  return morgonPresenceUrl();
}
