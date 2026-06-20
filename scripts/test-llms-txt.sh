#!/usr/bin/env bash
# Verify Aigent proxy on spinapp.site and ai.spinapp.site.
# Usage:
#   ./scripts/test-llms-txt.sh
#   SITE=https://ai.spinapp.site ./scripts/test-llms-txt.sh

set -euo pipefail

MARKETING_SITE="${MARKETING_SITE:-https://spinapp.site}"
AI_SITE="${AI_SITE:-https://ai.spinapp.site}"
ORIGIN="${AIGENT_ORIGIN:-https://spinapp.aigent.host}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $*"; }
fail() { echo -e "${RED}FAIL${NC} $*"; exit 1; }

check_200() {
  local url="$1"
  local headers
  headers=$(curl -sI "$url")
  local http_status
  http_status=$(echo "$headers" | head -1 | tr -d '\r')
  local location
  location=$(echo "$headers" | grep -i "^location:" || true)

  if echo "$http_status" | grep -q "200"; then
    pass "$url → $http_status"
  else
    fail "$url → expected 200, got $http_status"
  fi

  if [[ -n "$location" ]]; then
    fail "$url → unexpected redirect: $location"
  fi
}

echo "=== Aigent proxy test ==="
echo "Marketing: $MARKETING_SITE"
echo "AI host:   $AI_SITE"
echo "Origin:    $ORIGIN"
echo ""

check_200 "$MARKETING_SITE/llms.txt"
body=$(curl -s "$MARKETING_SITE/llms.txt" | head -c 200)
if [[ "$body" == "# SpinApp"* ]]; then
  pass "spinapp.site/llms.txt body looks like Aigent index"
else
  fail "spinapp.site/llms.txt body unexpected"
fi

check_200 "$AI_SITE/full"
full_body=$(curl -s "$AI_SITE/full" -H "Accept: text/html" | head -c 300)
if echo "$full_body" | grep -q "complete knowledge"; then
  pass "ai.spinapp.site/full proxies full dump"
else
  fail "ai.spinapp.site/full missing expected content"
fi

check_200 "$AI_SITE/t/spinapp-setup-wizard-getting-started.md"
topic_body=$(curl -s "$AI_SITE/t/spinapp-setup-wizard-getting-started.md" -H "Accept: text/markdown" | head -c 200)
if echo "$topic_body" | grep -q "four-step"; then
  pass "ai.spinapp.site/t/*.md proxies topic markdown"
else
  fail "ai.spinapp.site/t/*.md body unexpected"
fi

echo ""
echo -e "${GREEN}Aigent proxy OK.${NC}"
