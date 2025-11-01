#!/bin/bash
echo "🧪 TEST TẠO USER VỚI MST (không cần email)"
echo ""

# Test 1: Tạo user với MST, không có email
echo "Test 1: Tạo user với MST 'TEST001', không có email..."
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Cookie: etax_session=$(echo '{"uid":"test-admin","admin":true}' | base64)" \
  -d '{
    "name": "Test User",
    "password": "test123",
    "role": "user",
    "mstList": ["TEST001"]
  }' 2>/dev/null | jq '.' || echo "Lỗi: Cần đăng nhập admin trước"

echo ""
echo "✅ Test hoàn thành!"
echo "📝 Lưu ý: Test này cần session cookie hợp lệ từ admin login"
