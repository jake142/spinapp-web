#!/usr/bin/env bash
# Verify spinapp.site/llms.txt proxies Morgon content (200, not redirect).
# Usage:
#   ./scripts/test-llms-txt.sh
#   MORGON_PRESENCE=https://….trycloudflare.com/presence/marc-mckenzie ./scripts/test-llms-txt.sh

set -euo pipefail

SITE="${SITE:-https://spinapp.site}"
MORGON_PRESENCE="${MORGON_PRESENCE:-https://transform-participant-portrait-francisco.trycloudflare.com/presence/marc-mckenzie}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $*"; }
fail() { echo -e "${RED}FAIL${NC} $*"; exit 1; }

echo "=== llms.txt proxy test ==="
echo "Site:   $SITE/llms.txt"
echo "Morgon: $MORGON_PRESENCE/llms.txt"
echo ""

headers=$(curl -sI "$SITE/llms.txt")
status=$(echo "$headers" | head -1 | tr -d '\r')
location=$(echo "$headers" | grep -i "^location:" || true)

if echo "$status" | grep -q "200"; then
  pass "$status (no redirect)"
else
  fail "Expected 200, got: $status"
fi

if [[ -n "$location" ]]; then
  fail "Unexpected redirect: $location"
fi

body=$(curl -s "$SITE/llms.txt" | head -c 500)
upstream=$(curl -s "$MORGON_PRESENCE/llms.txt" | head -c 500)

if [[ -n "$body" && "$body" == "$upstream" ]]; then
  pass "Body matches Morgon llms.txt"
else
  fail "Body mismatch with Morgon upstream"
fi

echo ""
echo -e "${GREEN}llms.txt proxy OK.${NC}"
