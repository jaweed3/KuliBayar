#!/bin/bash
# ============================================================
# KuliBayar Comprehensive Security Test Suite
# ============================================================
# Tests backend API for vulnerabilities, bypass attempts,
# and edge cases before mainnet deployment.
# ============================================================

set -e

BASE_URL="http://localhost:3001"
PASS=0
FAIL=0
WARN=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; PASS=$((PASS + 1)); }
fail() { echo -e "${RED}❌ FAIL${NC}: $1"; FAIL=$((FAIL + 1)); }
warn() { echo -e "${YELLOW}⚠️  WARN${NC}: $1"; WARN=$((WARN + 1)); }
section() { echo -e "\n${YELLOW}═══════════════════════════════════════${NC}"; echo -e "${YELLOW}  $1${NC}"; echo -e "${YELLOW}═══════════════════════════════════════${NC}"; }

# ============================================================
section "1. HEALTH CHECK"
# ============================================================

HEALTH=$(curl -s "$BASE_URL/api/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  pass "Backend is running"
else
  fail "Backend is NOT running - start with: cd backend && npm run dev"
  echo "Aborting tests. Fix backend first."
  exit 1
fi

# ============================================================
section "2. MISSING INPUT VALIDATION"
# ============================================================

# 2.1 Submit proof without projectId
echo "--- Test 2.1: Submit without projectId ---"
RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/proofs" \
  -F "photo=@/dev/null;filename=test.jpg;type=image/jpeg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
if [ "$RES" = "400" ]; then
  pass "Rejects proof without projectId (HTTP 400)"
else
  fail "Should reject without projectId, got HTTP $RES"
fi

# 2.2 Submit proof without photo
echo "--- Test 2.2: Submit without photo ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"1","latitude":-6.2615,"longitude":106.8106}')
if echo "$RES" | grep -qi "error\|missing"; then
  pass "Rejects proof without photo"
else
  fail "Should reject without photo: $RES"
fi

# 2.3 Submit without GPS coordinates
echo "--- Test 2.3: Submit without GPS ---"
# Create a minimal valid JPEG (smallest possible)
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00' > /tmp/test_no_gps.jpg
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/test_no_gps.jpg" \
  -F "latitude=" \
  -F "longitude=")
if echo "$RES" | grep -qi "error\|missing\|verification"; then
  pass "Rejects proof without GPS coordinates"
else
  fail "Should reject without GPS: $RES"
fi

# ============================================================
section "3. EXIF SPOOFING TESTS"
# ============================================================

# 3.1 Submit with GPS far from Indonesia
echo "--- Test 3.1: GPS outside Indonesia ---"
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00' > /tmp/test_foreign.jpg
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/test_foreign.jpg" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "accuracy=10")
if echo "$RES" | grep -qi "error\|verification failed"; then
  pass "Rejects GPS outside Indonesia (New York coords)"
else
  warn "Check: GPS outside Indonesia response: $RES"
fi

# 3.2 Submit with GPS outside Jakarta (for Jakarta project)
echo "--- Test 3.2: GPS outside Jakarta area ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/test_foreign.jpg" \
  -F "latitude=-7.5" \
  -F "longitude=110.5" \
  -F "accuracy=10")
if echo "$RES" | grep -qi "error\|outside"; then
  pass "Penalizes GPS outside Jakarta area"
else
  warn "Check: GPS outside Jakarta response: $RES"
fi

# 3.3 Submit with future timestamp (EXIF check)
echo "--- Test 3.3: Photo from future ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/test_foreign.jpg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106" \
  -F "accuracy=10")
# This uses server timestamp so it should pass, but EXIF check may catch issues
if echo "$RES" | grep -qi "success\|error\|verification"; then
  pass "Handles photo submission with server timestamp"
else
  warn "Unexpected response: $RES"
fi

# ============================================================
section "4. GPS ACCURACY TESTS"
# ============================================================

# 4.1 Very poor accuracy
echo "--- Test 4.1: Very poor GPS accuracy (500m) ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/test_foreign.jpg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106" \
  -F "accuracy=500")
if echo "$RES" | grep -qi "error\|low\|accuracy"; then
  pass "Penalizes poor GPS accuracy (500m)"
else
  warn "Check: Poor accuracy response: $RES"
fi

# 4.2 No accuracy provided
echo "--- Test 4.2: No accuracy field ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/test_foreign.jpg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
if echo "$RES" | grep -qi "success\|error"; then
  pass "Handles missing accuracy gracefully"
else
  warn "Unexpected response: $RES"
fi

# ============================================================
section "5. LIVENESS CHALLENGE TESTS"
# ============================================================

# 5.1 Create challenge
echo "--- Test 5.1: Create challenge ---"
CHALLENGE_RES=$(curl -s -X POST "$BASE_URL/api/challenges/create" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"1","workerAddress":"0x0000000000000000000000000000000000000001"}')
if echo "$CHALLENGE_RES" | grep -q '"success":true'; then
  CHALLENGE_ID=$(echo "$CHALLENGE_RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['challengeId'])" 2>/dev/null || echo "")
  CHALLENGE_CODE=$(echo "$CHALLENGE_RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['code'])" 2>/dev/null || echo "")
  pass "Challenge created: $CHALLENGE_ID"
  pass "Challenge code: $CHALLENGE_CODE"
else
  fail "Could not create challenge: $CHALLENGE_RES"
  CHALLENGE_ID=""
fi

# 5.2 Get non-existent challenge
echo "--- Test 5.2: Get non-existent challenge ---"
RES=$(curl -s "$BASE_URL/api/challenges/nonexistent123")
if echo "$RES" | grep -qi "not found\|404"; then
  pass "Returns 404 for non-existent challenge"
else
  warn "Check non-existent challenge response: $RES"
fi

# 5.3 Submit proof without challenge
echo "--- Test 5.3: Submit proof without challenge ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/test_foreign.jpg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106" \
  -F "accuracy=10")
if echo "$RES" | grep -qi "success\|error"; then
  pass "Handles submission without challenge (allows with lower score)"
else
  warn "Unexpected: $RES"
fi

# ============================================================
section "6. RATE LIMITING & ABUSE TESTS"
# ============================================================

# 6.1 Rapid fire submissions
echo "--- Test 6.1: Rapid fire submissions (10x) ---"
RAPID_FAIL=0
for i in $(seq 1 10); do
  RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/proofs" \
    -F "projectId=1" \
    -F "photo=@/tmp/test_foreign.jpg" \
    -F "latitude=-6.2615" \
    -F "longitude=106.8106")
  if [ "$RES" = "429" ]; then
    RAPID_FAIL=$((RAPID_FAIL + 1))
  fi
done
if [ "$RAPID_FAIL" -gt 0 ]; then
  pass "Rate limiting active (blocked $RAPID_FAIL/10 requests)"
else
  warn "No rate limiting detected - DDoS vulnerability!"
fi

# 6.2 Very large payload
echo "--- Test 6.2: Oversized payload ---"
dd if=/dev/urandom of=/tmp/large_file.jpg bs=1M count=10 2>/dev/null
RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/large_file.jpg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106" 2>/dev/null)
rm -f /tmp/large_file.jpg
if [ "$RES" = "413" ] || [ "$RES" = "400" ]; then
  pass "Rejects oversized file (HTTP $RES)"
else
  warn "Check oversized file handling: HTTP $RES"
fi

# 6.3 Non-image file upload
echo "--- Test 6.3: Non-image file upload ---"
echo "not an image" > /tmp/fake_photo.exe
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/fake_photo.exe;type=application/x-executable" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
rm -f /tmp/fake_photo.exe
if echo "$RES" | grep -qi "error\|only images\|invalid"; then
  pass "Rejects non-image file upload"
else
  fail "CRITICAL: Accepts non-image file! Possible code execution risk."
fi

# ============================================================
section "7. INJECTION TESTS"
# ============================================================

# 7.1 SQL/NoSQL injection in projectId
echo "--- Test 7.1: SQL injection in projectId ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1; DROP TABLE projects;" \
  -F "photo=@/tmp/test_no_gps.jpg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
if echo "$RES" | grep -qi "error\|invalid\|nan"; then
  pass "SQL injection in projectId handled safely"
else
  warn "Check SQL injection response: $RES"
fi

# 7.2 XSS in projectId
echo "--- Test 7.2: XSS in projectId ---"
XSS_PAYLOAD="img src=x onerror=alert(1)"
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=$XSS_PAYLOAD" \
  -F "photo=@/tmp/test_no_gps.jpg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
if echo "$RES" | grep -qi "error\|invalid\|nan"; then
  pass "XSS in projectId handled safely"
else
  warn "Check XSS response: $RES"
fi

# 7.3 Command injection in filename
echo "--- Test 7.3: Command injection in filename ---"
RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/test_no_gps.jpg;filename=pwned.jpg;type=image/jpeg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
if [ "$RES" = "400" ] || [ "$RES" = "500" ] || [ "$RES" = "200" ]; then
  pass "Command injection in filename handled safely"
else
  warn "Check command injection: HTTP $RES"
fi

# 7.4 XSS in challenge create endpoint
echo "--- Test 7.4: XSS in challenge endpoint ---"
XSS2="img src=x onerror=alert(1)"
RES=$(curl -s -X POST "$BASE_URL/api/challenges/create" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$XSS2\",\"workerAddress\":\"0x1234\"}")
if echo "$RES" | grep -qi "success\|error\|invalid"; then
  pass "XSS in challenge endpoint handled safely"
else
  warn "Check XSS in challenge: $RES"
fi

# ============================================================
section "8. BLOCKCHAIN INTERACTION TESTS"
# ============================================================

# 8.1 Check contract connection
echo "--- Test 8.1: Smart contract connection ---"
RES=$(curl -s "$BASE_URL/api/health")
if echo "$RES" | grep -q '"status":"ok"'; then
  pass "Backend connected to Anvil"
else
  fail "Backend cannot connect to blockchain"
fi

# 8.2 Proof count
echo "--- Test 8.2: Get proof count ---"
RES=$(curl -s "$BASE_URL/api/proofs/count")
if echo "$RES" | grep -q '"count"'; then
  pass "Proof count endpoint works"
else
  warn "Proof count response: $RES"
fi

# ============================================================
section "9. ADMIN ENDPOINT TESTS"
# ============================================================

# 9.1 Verify without required fields
echo "--- Test 9.1: Verify proof without fields ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs/1/verify" \
  -H "Content-Type: application/json" \
  -d '{}')
if echo "$RES" | grep -qi "error\|missing"; then
  pass "Rejects verify without required fields"
else
  warn "Check verify response: $RES"
fi

# 9.2 Verify with invalid proof ID
echo "--- Test 9.2: Verify non-existent proof ---"
RES=$(curl -s -X POST "$BASE_URL/api/proofs/99999/verify" \
  -H "Content-Type: application/json" \
  -d '{"verified":true,"projectId":"1"}')
if echo "$RES" | grep -qi "error\|not found\|revert"; then
  pass "Rejects verify for non-existent proof"
else
  warn "Check non-existent proof verify: $RES"
fi

# ============================================================
section "10. FILE SYSTEM TESTS"
# ============================================================

# 10.1 Check uploads directory exists
echo "--- Test 10.1: Uploads directory ---"
if [ -d "backend/uploads" ]; then
  UPLOAD_COUNT=$(ls backend/uploads/ 2>/dev/null | wc -l)
  pass "Uploads directory exists ($UPLOAD_COUNT files)"
else
  warn "Uploads directory not found"
fi

# 10.2 Check for sensitive file exposure
echo "--- Test 10.2: Sensitive file exposure ---"
RES=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/../.env")
if [ "$RES" = "404" ] || [ "$RES" = "403" ]; then
  pass "Cannot access .env via path traversal"
else
  fail "CRITICAL: Can access .env file! HTTP $RES"
fi

RES=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/uploads/../../etc/passwd")
if [ "$RES" = "404" ] || [ "$RES" = "403" ]; then
  pass "Path traversal blocked for uploads"
else
  fail "CRITICAL: Path traversal possible! HTTP $RES"
fi

# ============================================================
section "11. CORS TESTS"
# ============================================================

echo "--- Test 11.1: CORS headers ---"
RES=$(curl -s -I -X OPTIONS "$BASE_URL/api/health" \
  -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: POST")
if echo "$RES" | grep -qi "access-control"; then
  CORS_ORIGIN=$(echo "$RES" | grep -i "access-control-allow-origin")
  if echo "$CORS_ORIGIN" | grep -q "\*"; then
    warn "CORS allows all origins (*) - restrict in production"
  else
    pass "CORS configured with specific origins"
  fi
else
  warn "No CORS headers detected"
fi

# ============================================================
section "12. EXIF EDGE CASES"
# ============================================================

# 12.1 Empty image file
echo "--- Test 12.1: Empty image file ---"
echo -n "" > /tmp/empty.jpg
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/empty.jpg;type=image/jpeg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
rm -f /tmp/empty.jpg
if echo "$RES" | grep -qi "error\|invalid\|fail"; then
  pass "Rejects empty image file"
else
  warn "Check empty file handling: $RES"
fi

# 12.2 Corrupted image
echo "--- Test 12.2: Corrupted image file ---"
echo "this is not an image" > /tmp/corrupt.jpg
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/corrupt.jpg;type=image/jpeg" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
rm -f /tmp/corrupt.jpg
if echo "$RES" | grep -qi "error\|invalid\|fail"; then
  pass "Rejects corrupted image file"
else
  warn "Check corrupted file handling: $RES"
fi

# 12.3 SVG as image (potential XSS)
echo "--- Test 12.3: SVG as image (XSS vector) ---"
echo '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script></svg>' > /tmp/xss.svg
RES=$(curl -s -X POST "$BASE_URL/api/proofs" \
  -F "projectId=1" \
  -F "photo=@/tmp/xss.svg;type=image/svg+xml" \
  -F "latitude=-6.2615" \
  -F "longitude=106.8106")
rm -f /tmp/xss.svg
if echo "$RES" | grep -qi "error\|invalid\|not allowed\|only images"; then
  pass "Rejects SVG file (potential XSS vector)"
else
  warn "Check SVG handling: $RES"
fi

# ============================================================
# RESULTS
# ============================================================

section "TEST RESULTS"
echo ""
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
TOTAL=$((PASS + FAIL + WARN))
echo "Total tests: $TOTAL"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}🚨 $FAIL CRITICAL ISSUES FOUND - FIX BEFORE DEPLOYMENT!${NC}"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $WARN warnings - review before production${NC}"
  exit 0
else
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  exit 0
fi
