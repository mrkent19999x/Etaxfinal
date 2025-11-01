#!/bin/bash
# Test Vercel Deployment Script
# Usage: ./tools/test-vercel-deployment.sh https://your-app.vercel.app

VERCEL_URL="${1:-https://etaxfinal.vercel.app}"

echo "🧪 Testing Vercel Deployment: $VERCEL_URL"
echo ""

# Test 1: Check if deployment is accessible
echo "📋 Test 1: Check Deployment Accessibility"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL" --max-time 10)
if [ "$RESPONSE" = "200" ]; then
  echo "✅ Deployment accessible (HTTP $RESPONSE)"
else
  echo "❌ Deployment not accessible (HTTP $RESPONSE)"
  exit 1
fi
echo ""

# Test 2: Test Admin Login API
echo "📋 Test 2: Admin Login API"
ADMIN_RESPONSE=$(curl -s -X POST "$VERCEL_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@etax.local","password":"admin123"}' \
  --max-time 10)

if echo "$ADMIN_RESPONSE" | grep -q "success"; then
  echo "✅ Admin login API: Firebase working"
  echo "   Response: $(echo $ADMIN_RESPONSE | head -c 100)..."
elif echo "$ADMIN_RESPONSE" | grep -q "Firebase Admin chưa sẵn sàng"; then
  echo "⚠️  Admin login API: Firebase not configured (fallback will work)"
  echo "   Response: $(echo $ADMIN_RESPONSE | head -c 100)..."
else
  echo "❌ Admin login API: Error"
  echo "   Response: $ADMIN_RESPONSE"
fi
echo ""

# Test 3: Test User Login API
echo "📋 Test 3: User Login API"
USER_RESPONSE=$(curl -s -X POST "$VERCEL_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"mst":"00109202830","password":"123456"}' \
  --max-time 10)

if echo "$USER_RESPONSE" | grep -q "success"; then
  echo "✅ User login API: Firebase working"
  echo "   Response: $(echo $USER_RESPONSE | head -c 100)..."
elif echo "$USER_RESPONSE" | grep -q "Firebase Admin chưa sẵn sàng"; then
  echo "⚠️  User login API: Firebase not configured (fallback will work)"
  echo "   Response: $(echo $USER_RESPONSE | head -c 100)..."
else
  echo "❌ User login API: Error"
  echo "   Response: $USER_RESPONSE"
fi
echo ""

# Test 4: Check pages accessibility
echo "📋 Test 4: Check Pages Accessibility"
PAGES=("/login" "/admin/login")
for PAGE in "${PAGES[@]}"; do
  PAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL$PAGE" --max-time 10)
  if [ "$PAGE_RESPONSE" = "200" ]; then
    echo "✅ $PAGE: Accessible"
  else
    echo "❌ $PAGE: Not accessible (HTTP $PAGE_RESPONSE)"
  fi
done
echo ""

echo "✅ Testing completed!"
echo ""
echo "📝 Next Steps:"
echo "1. Test login flows in browser"
echo "2. Verify field mapping on pages"
echo "3. Check Firebase status in Vercel logs"



