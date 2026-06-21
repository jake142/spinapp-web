/** Traditional search indexers — always see the marketing site when bot-split is on. */
const SEARCH_INDEXER_PATTERNS = [/Googlebot/i, /bingbot/i];

/** AI crawlers — receive proxied Aigent content on spinapp.site (no redirect). */
const AI_ROUTER_PATTERNS = [
  /Google-Extended/i,
  /^Google$/i,
  /Google-Agent/i,
  /GPTBot/i,
  /ChatGPT-User/i,
  /OAI-SearchBot/i,
  /ClaudeBot/i,
  /Claude-Web/i,
  /anthropic-ai/i,
  /PerplexityBot/i,
];

export function isBotSplitEnabled(): boolean {
  const flag = import.meta.env.AIGENT_BOT_SPLIT;

  if (typeof flag === 'string' && ['0', 'false', 'no', 'off'].includes(flag.toLowerCase())) {
    return false;
  }

  return true;
}

export function isSearchIndexerBot(userAgent: string): boolean {
  return SEARCH_INDEXER_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function isAiRouterBot(userAgent: string): boolean {
  return AI_ROUTER_PATTERNS.some((pattern) => pattern.test(userAgent));
}
