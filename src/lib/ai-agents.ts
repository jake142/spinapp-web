const AI_AGENT_PATTERN =
  /gptbot|chatgpt|oai-searchbot|claudebot|claude-web|anthropic|google-extended|bytespider|ccbot|cohere-ai|perplexity|go-http-client|applebot-extended|meta-externalagent/i;

export function isAiAgent(request: Request): boolean {
  const ua = request.headers.get("user-agent") ?? "";

  if (AI_AGENT_PATTERN.test(ua)) {
    return true;
  }

  // Some browse tools send no useful UA but request machine-readable formats first.
  const accept = (request.headers.get("accept") ?? "").toLowerCase();
  if (
    accept.includes("text/markdown") ||
    (accept.includes("text/plain") && !accept.includes("text/html"))
  ) {
    return true;
  }

  return false;
}

export function isKnowledgePath(pathname: string): boolean {
  if (pathname === "/llms.txt" || pathname === "/ai-knowledge" || pathname === "/search") {
    return true;
  }

  if (pathname.startsWith("/t/")) {
    return true;
  }

  // Let crawlers read robots and sitemap-style discovery files.
  if (pathname === "/robots.txt") {
    return true;
  }

  return false;
}

export function isMarketingPage(pathname: string): boolean {
  if (pathname === "/" || pathname === "/index.html") {
    return true;
  }

  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";

  return lastSegment !== "" && !lastSegment.includes(".");
}
