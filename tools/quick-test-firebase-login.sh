#!/bin/bash

# Quick Firebase Login Test Script
# Usage: ./tools/quick-test-firebase-login.sh [local|vercel]

BASE_URL="${1:-local}"
if [ "$BASE_URL" == "local" ]; then
  URL="http://localhost:3000"
elif [ "$BASE_URL" == "vercel" ]; then
  URL="https://etaxfinal.vercel.app"
else
  echo "❌ Invalid argument. Use 'local' or 'vercel'"
  exit 1
fi

echo "🔥 Firebase Login Quick Test"
echo "============================"
echo "Base URL: $URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Admin Login
echo "📋 Testing Admin Login..."
ADMIN_RES=$(curl -s -X POST "$URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"phuctran123@gmail.com","password":"123456"}' \
  -c /tmp/etax_cookies.txt)

if echo "$ADMIN_RES" | grep -q "success"; then
  echo -e "${GREEN}✅ Admin login: SUCCESS${NC}"
else
  echo -e "${RED}❌ Admin login: FAILED${NC}"
  echo "Response: $ADMIN_RES"
fi

# Test Session
echo ""
echo "📋 Testing Session..."
SESSION_RES=$(curl -s -X GET "$URL/api/auth/me" \
  -b /tmp/etax_cookies.txt)

if echo "$SESSION_RES" | grep -q "user"; then
  echo -e "${GREEN}✅ Session check: SUCCESS${NC}"
  echo "User data: $SESSION_RES"
else
  echo -e "${RED}❌ Session check: FAILED${NC}"
  echo "Response: $SESSION_RES"
fi

# Test User Login (logout admin first)
echo ""
echo "📋 Testing User Login..."
USER_RES=$(curl -s -X POST "$URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"mst":"00109202830","password":"123456"}' \
  -c /tmp/etax_cookies_user.txt)

if echo "$USER_RES" | grep -q "success"; then
  echo -e "${GREEN}✅ User login: SUCCESS${NC}"
else
  echo -e "${RED}❌ User login: FAILED${NC}"
  echo "Response: $USER_RES"
fi

# Test User Session
echo ""
echo "📋 Testing User Session..."
USER_SESSION_RES=$(curl -s -X GET "$URL/api/auth/me" \
  -b /tmp/etax_cookies_user.txt)

if echo "$USER_SESSION_RES" | grep -q "mst"; then
  echo -e "${GREEN}✅ User session check: SUCCESS${NC}"
  echo "User data: $USER_SESSION_RES"
else
  echo -e "${RED}❌ User session check: FAILED${NC}"
  echo "Response: $USER_SESSION_RES"
fi

# Cleanup
rm -f /tmp/etax_cookies.txt /tmp/etax_cookies_user.txt

echo ""
echo "============================"
echo "✅ Test completed!"

