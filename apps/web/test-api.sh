#!/bin/bash

# API Testing Script
# Make sure your Next.js dev server is running on port 3001

BASE_URL="http://localhost:3001"
API_BASE_URL="http://localhost:3000"  # Your backend API

echo "🧪 Testing API endpoints..."
echo "================================"

# Test 1: Check if Next.js server is running
echo "1. Testing Next.js server health..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL"

echo ""

# Test 2: Test Auth0 token endpoint (this might fail without auth)
echo "2. Testing Auth0 token endpoint..."
curl -s -w "Status: %{http_code}\n" "$BASE_URL/api/auth/token" | head -5

echo ""

# Test 3: Test backend API directly (portfolios)
echo "3. Testing backend portfolios endpoint..."
curl -s -w "Status: %{http_code}\n" "$API_BASE_URL/portfolios" | head -5

echo ""

# Test 4: Test backend API (transactions)
echo "4. Testing backend transactions endpoint..."
curl -s -w "Status: %{http_code}\n" "$API_BASE_URL/transactions" | head -5

echo ""

# Test 5: Test with authentication header (you'll need to replace TOKEN)
echo "5. Testing with auth header (replace TOKEN)..."
echo "curl -H 'Authorization: Bearer YOUR_TOKEN' $API_BASE_URL/portfolios"

echo ""

# Test 6: Test specific portfolio positions (replace PORTFOLIO_ID)
echo "6. Testing portfolio positions (replace PORTFOLIO_ID)..."
echo "curl -H 'Authorization: Bearer YOUR_TOKEN' $API_BASE_URL/portfolios/PORTFOLIO_ID/positions"

echo ""
echo "✅ Test script complete!"
echo ""
echo "📝 To get an auth token:"
echo "1. Open browser dev tools"
echo "2. Go to your app at $BASE_URL"
echo "3. Login and check Network tab for /api/auth/token response"
echo "4. Copy the accessToken value"
echo ""
echo "🔧 Then test with:"
echo "curl -H 'Authorization: Bearer YOUR_TOKEN' -H 'Content-Type: application/json' $API_BASE_URL/portfolios"