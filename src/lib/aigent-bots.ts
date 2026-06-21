/** Traditional search indexers — always see the marketing site when bot-split is on. */
const SEARCH_INDEXER_PATTERNS = [/Googlebot/i, /bingbot/i, /DuckDuckBot/i];

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
  /Claude-User/i,
  /anthropic-ai/i,
  /PerplexityBot/i,
  /Perplexity-User/i,
  /xAI-SearchBot/i,
  /GrokBot/i,
  /Grok-DeepSearch/i,
  /Grok/i,
  /DeepSeekBot/i,
  /DeepSeek-Crawler/i,
  /DeepSeek-User/i,
  /Applebot-Extended/i,
  /Meta-ExternalAgent/i,
  /FacebookExternalHit/i,
  /Bytespider/i,
  /TikTokSpider/i,
  /CCBot/i,
  /Amazonbot/i,
  /YouBot/i,
  /DuckAssistBot/i,
  /Cohere-AI/i,
  /PetalBot/i,
  /GitHub-Copilot/i,
  /Cursor/i,
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
