# 🧪 Test Security Improvements & Logic Changes

## 📋 Checklist Test Full Flow

### Prerequisites
- [ ] Set `COOKIE_SECRET` trong env vars (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Firebase configured (optional - có localStorage fallback)
- [ ] Dev server running: `npm run dev`

---

## 🎯 Test 1: Password Hashing

### Test Steps:
1. **Create new user** qua admin panel với password mới
2. **Check Firestore**: Password phải là hash (bắt đầu với `$2a$` hoặc `$2b$`)
3. **Login với password**: Phải login được thành công
4. **Login với wrong password**: Phải fail

### Expected:
- ✅ New passwords được hash trong Firestore
- ✅ Login thành công với hashed password
- ✅ Old plaintext passwords vẫn hoạt động (backward compatible)

---

## 🎯 Test 2: Signed Cookies

### Test Steps:
1. **Login** (admin hoặc user)
2. **Check cookie** trong DevTools:
   - Cookie `etax_session` phải là JWT token (không phải JSON string)
   - Token format: `eyJ...` (base64 encoded)
3. **Try tamper cookie**: Sửa cookie → Should fail verification
4. **Logout và login lại**: Cookie mới phải được sign

### Expected:
- ✅ Cookies là JWT signed tokens
- ✅ Tampered cookies bị reject
- ✅ Legacy JSON cookies vẫn work (backward compatible)

---

## 🎯 Test 3: Rate Limiting

### Test Steps:
1. **Try login với wrong credentials** 6 lần liên tiếp
2. **Check response**:
   - Lần 1-5: 401 Unauthorized
   - Lần 6: 429 Too Many Requests
3. **Check headers**: Phải có `X-RateLimit-*` headers
4. **Wait 15 minutes** (hoặc reset rate limit) → Should work again

### Expected:
- ✅ Block sau 5 attempts
- ✅ Return 429 với error code `RATE_LIMIT_EXCEEDED`
- ✅ Headers có rate limit info

---

## 🎯 Test 4: MST Query Optimization

### Test Steps:
1. **Run migration**: `node tools/migrate-mst-to-user-collection.js`
2. **Check Firestore**: Collection `mst_to_user` được tạo
3. **Login với MST**: Check logs - không thấy loop all users
4. **Performance**: Login phải nhanh hơn (với nhiều users)

### Expected:
- ✅ Query `mst_to_user/{mst}` thay vì loop
- ✅ Login nhanh hơn với nhiều users
- ✅ Fallback to loop nếu `mst_to_user` chưa có data

---

## 🎯 Test 5: MST Duplicate Detection

### Test Steps:
1. **Create user A** với MST `00109202830`
2. **Try create user B** với cùng MST → Should fail
3. **Check error**: Phải có code `MST_DUPLICATE`
4. **Update user A** remove MST → Should succeed
5. **Create user B** với MST đó → Should succeed

### Expected:
- ✅ Reject duplicate MST khi create
- ✅ Reject duplicate MST khi update
- ✅ Error có code và message rõ ràng

---

## 🎯 Test 6: Admin Full Flow

### Test Steps:
1. **Go to** `/admin/login`
2. **Login** với admin credentials
3. **Check redirect** → `/admin`
4. **Create user** với email, password, mstList
5. **Check user list** → User xuất hiện
6. **Update user** → Change MST list
7. **Check `mst_to_user`** → Updated correctly
8. **Delete user** → User removed + `mst_to_user` cleaned

### Expected:
- ✅ Login flow works
- ✅ Create user với hashed password
- ✅ `mst_to_user` được sync
- ✅ Update/Delete syncs correctly

---

## 🎯 Test 7: User Login Flow

### Test Steps:
1. **Go to** `/login`
2. **Login** với MST và password
3. **Check redirect** → `/`
4. **Check session**: `/api/auth/me` trả về đúng MST
5. **Logout** → Session cleared

### Expected:
- ✅ Login với MST works
- ✅ Session có MST info
- ✅ Optimized query được dùng
- ✅ Logout clears cookies

---

## 🎯 Test 8: Error Handling

### Test Cases:
1. **Invalid credentials** → 401 với error message
2. **Missing fields** → 400 với error message
3. **Rate limit** → 429 với code và reset time
4. **Duplicate MST** → 400 với code `MST_DUPLICATE`
5. **Firebase not configured** → 503 với fallback message

### Expected:
- ✅ All errors có structure rõ ràng
- ✅ Error codes (nếu implemented)
- ✅ User-friendly messages

---

## 🚀 Quick Test Commands

### Test Local:
```bash
# Run test script
node tools/test-security-improvements.js local

# Test login API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@etax.local","password":"admin123"}'

# Test rate limiting
for i in {1..7}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

### Test Vercel:
```bash
node tools/test-security-improvements.js vercel
```

---

## ✅ Expected Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Password Hashing | ✅ | New passwords hashed, old still work |
| Signed Cookies | ✅ | JWT tokens, backward compatible |
| Rate Limiting | ✅ | 5 attempts / 15 min, in-memory dev |
| MST Optimization | ✅ | Query collection instead of loop |
| Duplicate Detection | ✅ | Validation on create/update |
| Error Codes | ⚠️ | Basic structure, codes optional |
| Security Logging | ⏳ | Not yet implemented |
| Password Policy | ⏳ | Not yet implemented |

---

## 📝 Notes

- **Backward Compatibility**: Tất cả changes đều backward compatible
- **Migration Required**: 
  - Run `migrate-passwords-to-hash.js` để hash existing passwords
  - Run `migrate-mst-to-user-collection.js` để tạo `mst_to_user` collection
- **Environment Variables**:
  - `COOKIE_SECRET` (required)
  - `UPSTASH_REDIS_REST_URL` (optional, for production rate limiting)
  - `UPSTASH_REDIS_REST_TOKEN` (optional, for production rate limiting)

