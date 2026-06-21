#!/usr/bin/env bash
# Verify SpinApp ↔ Aigent proxy integration.
set -euo pipefail

MARKETING="${MARKETING:-https://spinapp.site}"
AI="${AI:-https://ai.spinapp.site}"
ORIGIN="${ORIGIN:-https://spinapp.aigent.host}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
pass() { echo -e "${GREEN}PASS${NC} $*"; }
fail() { echo -e "${RED}FAIL${NC} $*"; exit 1; }

check_200() {
  local url="$1"
  local code
  code=$(curl -sI "$url" | head -1)
  if echo "$code" | grep -q "200"; then pass "$url → $code"; else fail "$url → $code"; fi
}

echo "=== Aigent proxy test ==="
echo "Marketing: $MARKETING"
echo "AI host:   $AI"
echo "Origin:    $ORIGIN"
echo ""

check_200 "$MARKETING/llms.txt"
check_200 "$AI/"
check_200 "$AI/faq.md"
check_200 "$AI/facts.json"
check_200 "$AI/robots.txt"

robots=$(curl -s "$AI/robots.txt" -H "Cache-Control: no-cache")
if echo "$robots" | grep -q "GPTBot"; then
  pass "ai.spinapp.site/robots.txt includes GPTBot"
else
  fail "ai.spinapp.site/robots.txt missing GPTBot — purge CF cache for $AI/robots.txt"
fi

llms=$(curl -s "$MARKETING/llms.txt" | head -c 200)
if echo "$llms" | grep -q "SpinApp"; then
  pass "spinapp.site/llms.txt has SpinApp content"
else
  fail "spinapp.site/llms.txt unexpected content"
fi

if [[ "${BOT_SPLIT_TEST:-0}" == "1" ]]; then
  echo ""
  echo "=== Bot-split (requires AIGENT_BOT_SPLIT=true in Cloudflare) ==="
  ai_html=$(curl -s "$MARKETING/" -A "GPTBot/1.0" | head -c 400)
  if echo "$ai_html" | grep -q "official AI knowledge summary"; then
    pass "GPTBot on spinapp.site/ gets Aigent HTML"
  else
    fail "GPTBot on spinapp.site/ did not get Aigent HTML — is AIGENT_BOT_SPLIT enabled?"
  fi
  mkt_html=$(curl -s "$MARKETING/" -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" | head -c 400)
  if echo "$mkt_html" | grep -q "Laravel local dev"; then
    pass "Googlebot on spinapp.site/ gets marketing HTML"
  else
    fail "Googlebot on spinapp.site/ did not get marketing HTML"
  fi
fi

echo ""
echo -e "${GREEN}Aigent integration OK.${NC}"
