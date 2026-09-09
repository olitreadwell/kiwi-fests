#!/usr/bin/env bash
# Boots the production server on a throwaway port and curls every route.
set -euo pipefail

PORT="${SMOKE_PORT:-3521}"
BASE="http://localhost:$PORT"

echo "building..."
npm run build >/dev/null

echo "starting server on port $PORT..."
HOSTNAME="0.0.0.0" PORT="$PORT" node .next/standalone/server.js &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  if curl -fsS "$BASE/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

check() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" != "$expected" ]; then
    echo "FAIL: $label: got $actual, want $expected"
    exit 1
  fi
  echo "ok: $label"
}

check "health status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/health")"
check "hello status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/hello?name=Smoke")"
check "items status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/v1/items")"
check "dataset status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/v1/dataset")"
check "feed status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/feed.xml")"
check "calendar status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/calendar.ics")"
check "items page" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/items")"
check "openapi status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/openapi.json")"
check "docs status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/docs")"
check "homepage status" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")"

echo "running contract test against $BASE..."
BASE_URL="$BASE" node scripts/contract-test.mjs

echo "smoke: all green"
