#!/usr/bin/env bash
# Verify spinapp.site/llms.txt proxies Aigent content (200, not redirect).
# Usage:
#   ./scripts/test-llms-txt.sh
#   LLMS_ORIGIN=https://ai.spinapp.site ./scripts/test-llms-txt.sh

set -euo pipefail

SITE="${SITE:-https://spinapp.site}"
LLMS_ORIGIN="${LLMS_ORIGIN:-https://ai.spinapp.site}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $*"; }
fail() { echo -e "${RED}FAIL${NC} $*"; exit 1; }

echo "=== llms.txt proxy test ==="
echo "Site:   $SITE/llms.txt"
echo "Origin: $LLMS_ORIGIN/llms.txt"
echo ""

headers=$(curl -sI "$SITE/llms.txt")
http_status=$(echo "$headers" | head -1 | tr -d '\r')
location=$(echo "$headers" | grep -i "^location:" || true)

if echo "$http_status" | grep -q "200"; then
  pass "$http_status (no redirect)"
else
  fail "Expected 200, got: $http_status"
fi

if [[ -n "$location" ]]; then
  fail "Unexpected redirect: $location"
fi

body=$(curl -s "$SITE/llms.txt" | head -c 500)
upstream=$(curl -s "$LLMS_ORIGIN/llms.txt" | head -c 500)

if [[ -n "$body" && "$body" == "$upstream" && "$body" == "# SpinApp"* ]]; then
  pass "Body matches Aigent llms.txt"
else
  fail "Body mismatch with $LLMS_ORIGIN/llms.txt"
fi

echo ""
echo -e "${GREEN}llms.txt proxy OK.${NC}"
