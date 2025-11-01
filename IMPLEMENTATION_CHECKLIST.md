# 📋 CHECKLIST - Những Gì Cần Làm Tiếp Theo

## ✅ ĐÃ HOÀN THÀNH

- ✅ Password hashing với bcryptjs
- ✅ Signed cookies với JWT
- ✅ Rate limiting
- ✅ MST query optimization (mst_to_user collection)
- ✅ MST duplicate detection
- ✅ Code đã được update

---

## 🎯 CẦN LÀM NGAY

### 1. Set Environment Variables

**File:** `.env.local` (hoặc Vercel Environment Variables)

```bash
# Generate COOKIE_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Thêm vào .env.local:
COOKIE_SECRET=<generated-secret-here>
```

**Lưu ý:** 
- COOKIE_SECRET **BẮT BUỘC** cho signed cookies
- Phải có ít nhất 32 ký tự
- Production phải dùng secret khác với development

---

### 2. Run Migration Scripts

#### A. Hash Existing Passwords

```bash
# Hash passwords trong Firestore
node tools/migrate-passwords-to-hash.js --firestore

# Hoặc hash cả localStorage (nếu cần)
node tools/migrate-passwords-to-hash.js
```

**Lưu ý:**
- Script sẽ hash tất cả passwords chưa được hash
- Backward compatible: Plaintext passwords cũ vẫn hoạt động
- Check logs để xem bao nhiêu passwords đã được migrate

#### B. Create mst_to_user Collection

```bash
# Tạo mst_to_user collection từ existing users
node tools/migrate-mst-to-user-collection.js
```

**Lưu ý:**
- Script sẽ tạo documents trong `mst_to_user` collection
- Mỗi MST → userId mapping
- Detect và warn về duplicate MSTs
- Check logs để xem có duplicates không

---

### 3. Test Full Flow

#### A. Start Dev Server

```bash
npm run dev
```

#### B. Test Admin Login

1. Go to: `http://localhost:3000/admin/login`
2. Login với:
   - Email: `admin@etax.local`
   - Password: `admin123`
3. Check:
   - ✅ Redirect to `/admin`
   - ✅ Cookie `etax_session` được set (check DevTools)
   - ✅ Cookie là JWT token (không phải JSON string)

#### C. Test User Login

1. Go to: `http://localhost:3000/login`
2. Login với:
   - MST: `00109202830`
   - Password: `123456`
3. Check:
   - ✅ Redirect to `/`
   - ✅ Cookies được set
   - ✅ Session có MST info

#### D. Test Rate Limiting

```bash
# Test rate limit - login sai 6 lần
for i in {1..7}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected:**
- Lần 1-5: Status 401
- Lần 6: Status 429 (Rate Limited)

#### E. Test Admin Functions

1. **Create User:**
   - Go to `/admin/users`
   - Click "Tạo user mới"
   - Nhập email, password, name, mstList
   - Check:
     - ✅ User được tạo
     - ✅ Password được hash trong Firestore
     - ✅ `mst_to_user` documents được tạo

2. **Update User:**
   - Edit user, thay đổi mstList
   - Check:
     - ✅ `mst_to_user` được sync
     - ✅ Old MSTs được remove nếu cần

3. **Test Duplicate MST:**
   - Try tạo user với MST đã tồn tại
   - Check:
     - ✅ Error: "MST đã được sử dụng"
     - ✅ Error code: `MST_DUPLICATE`

---

## 🔧 OPTIONAL - Production Setup

### 1. Upstash Redis (cho Rate Limiting Production)

**Nếu không dùng:** Rate limiting sẽ dùng in-memory (ok cho dev, nhưng không shared giữa servers)

**Nếu dùng:**

1. Tạo Upstash Redis database: https://console.upstash.com/
2. Get REST URL và Token
3. Set env vars:
   ```bash
   UPSTASH_REDIS_REST_URL=<your-url>
   UPSTASH_REDIS_REST_TOKEN=<your-token>
   ```

---

### 2. Vercel Deployment

1. **Set Environment Variables trong Vercel:**
   - `COOKIE_SECRET` (required)
   - `FIREBASE_SERVICE_ACCOUNT_KEY` hoặc `FIREBASE_SERVICE_ACCOUNT_BASE64`
   - `UPSTASH_REDIS_*` (optional)

2. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: Add password hashing, signed cookies, rate limiting"
   git push
   ```

3. **Run Migrations trên Production:**
   - Connect to Firebase Production
   - Run migration scripts

---

## 🐛 TROUBLESHOOTING

### Problem: Cookies không work

**Check:**
- COOKIE_SECRET đã set chưa?
- Check console logs: có error về cookie secret không?
- Dev mode: cookies có thể không secure (httpOnly: true nhưng secure: false)

### Problem: Rate limiting không hoạt động

**Check:**
- In-memory store chỉ work trong cùng process
- Restart server sẽ reset rate limit
- Production: dùng Upstash Redis

### Problem: Login chậm với nhiều users

**Check:**
- Đã run `migrate-mst-to-user-collection.js` chưa?
- Check Firestore: có collection `mst_to_user` không?
- Check logs: query có dùng `mst_to_user` hay vẫn loop all users?

### Problem: Password không match sau khi hash

**Check:**
- Old passwords vẫn phải plaintext để backward compatible
- New passwords sẽ được hash tự động
- Run migration để hash old passwords

---

## 📝 NEXT STEPS (Optional Improvements)

Các tính năng này đã được plan nhưng chưa implement (optional):

1. **MST Format Validation** - Validate MST format (10 số, etc.)
2. **Error Codes Enum** - Structured error codes cho tất cả APIs
3. **Security Logging** - Log failed logins, unauthorized access
4. **Password Policy** - Min length, complexity requirements
5. **Password Change Audit** - Log khi admin change password

Có thể implement sau nếu cần.

---

## ✅ VERIFICATION CHECKLIST

Trước khi deploy production, verify:

- [ ] COOKIE_SECRET đã set
- [ ] Migration scripts đã chạy
- [ ] Admin login works
- [ ] User login works
- [ ] Rate limiting works (test với 6+ attempts)
- [ ] Password hashing works (check Firestore)
- [ ] Signed cookies work (check DevTools)
- [ ] MST optimization works (check logs)
- [ ] Duplicate detection works (try create duplicate MST)
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. Check logs trong console
2. Check DevTools > Network tab
3. Check Firestore console
4. Review error messages (có code và details)

**Files quan trọng:**
- `src/lib/password-utils.ts` - Password hashing
- `src/lib/cookie-utils.ts` - Signed cookies
- `src/lib/rate-limit.ts` - Rate limiting
- `src/app/api/auth/login/route.ts` - Login logic
- `tools/migrate-*.js` - Migration scripts

---

**Date Created:** 2024
**Status:** ✅ Code Ready - Cần setup env vars và run migrations

