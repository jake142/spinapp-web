/** Traditional search indexers — always see the marketing site when bot-split is on. */
const SEARCH_INDEXER_PATTERNS = [/Googlebot/i, /bingbot/i];

/** AI crawlers — receive proxied Aigent content on spinapp.site (no redirect). */
const AI_ROUTER_PATTERNS = [
  /Google-Extended/i,
  /GPTBot/i,
  /ChatGPT-User/i,
  /ClaudeBot/i,
  /anthropic-ai/i,
  /PerplexityBot/i,
];

export function isBotSplitEnabled(): boolean {
  const flag = import.meta.env.AIGENT_BOT_SPLIT;

  if (typeof flag !== 'string' || flag.length === 0) {
    return false;
  }

  return ['1', 'true', 'yes', 'on', 'ai-only'].includes(flag.toLowerCase());
}

export function isSearchIndexerBot(userAgent: string): boolean {
  return SEARCH_INDEXER_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export function isAiRouterBot(userAgent: string): boolean {
  return AI_ROUTER_PATTERNS.some((pattern) => pattern.test(userAgent));
}
