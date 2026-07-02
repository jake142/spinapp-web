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

if [[ "${MARKETING_UA_TEST:-1}" == "1" ]]; then
  echo ""
  echo "=== Marketing site for all UAs on spinapp.site ==="
  for ua in "GPTBot/1.0" "Google-Extended" "Mozilla/5.0 (compatible; Googlebot/2.1)"; do
    mkt_html=$(curl -s "$MARKETING/" -A "$ua" | head -c 800)
    if echo "$mkt_html" | grep -q "bg-spin-600"; then
      pass "$ua on spinapp.site/ → marketing HTML"
    else
      fail "$ua on spinapp.site/ did not get marketing HTML"
    fi
  done
fi

echo ""
echo -e "${GREEN}Aigent integration OK.${NC}"
