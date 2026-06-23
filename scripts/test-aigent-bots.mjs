#!/usr/bin/env node
/** Lightweight bot-routing checks (no build required). */
import assert from 'node:assert/strict';

const SEARCH_INDEXER_PATTERNS = [/Googlebot/i, /bingbot/i, /DuckDuckBot/i];
const AI_ROUTER_PATTERNS = [
  /Google-Extended/i,
  /^Google$/i,
  /Google-Agent/i,
  /GPTBot/i,
  /Meta-WebIndexer/i,
];

function isGeminiWebBotAuth(signatureAgent) {
  return (signatureAgent ?? '').toLowerCase().includes('agent.bot.goog');
}

function isSearchIndexerBot(userAgent) {
  return SEARCH_INDEXER_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function isAiRouterBot(userAgent) {
  return AI_ROUTER_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function isAiCrawler(userAgent, signatureAgent) {
  if (isGeminiWebBotAuth(signatureAgent)) return true;
  return userAgent ? isAiRouterBot(userAgent) : false;
}

assert.equal(isAiCrawler('Google', null), true, 'bare Google UA');
assert.equal(isAiCrawler('Google-Extended', null), true);
assert.equal(isAiCrawler('Mozilla/5.0 (compatible; Google-Agent)', null), true);
assert.equal(
  isAiCrawler('Mozilla/5.0', 'g="https://agent.bot.goog"'),
  true,
  'Signature-Agent Web Bot Auth',
);
assert.equal(
  isAiCrawler('Mozilla/5.0 (compatible; Googlebot/2.1)', null),
  false,
  'Googlebot is search indexer',
);
assert.equal(isSearchIndexerBot('Mozilla/5.0 (compatible; Googlebot/2.1)'), true);
assert.equal(isAiCrawler('Mozilla/5.0 Chrome/120.0', null), false);
assert.equal(
  isAiCrawler('meta-webindexer/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)', null),
  true,
  'Meta-WebIndexer',
);

console.log('aigent-bots checks OK');
