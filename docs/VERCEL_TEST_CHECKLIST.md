# 🧪 Vercel Testing Checklist

**Date**: 2025-01-31  
**Status**: Ready for Testing

---

## 🔍 Step 1: Find Vercel URL

### Option 1: Vercel Dashboard
1. Vào https://vercel.com/dashboard
2. Chọn project `Etaxfinal` (hoặc project name của anh)
3. Copy **Production URL** (ví dụ: `https://etaxfinal.vercel.app`)

### Option 2: GitHub Deployments
1. Vào https://github.com/mrkent19999x/Etaxfinal
2. Click **Environments** → Xem **Vercel** deployment
3. Copy URL từ deployment status

---

## 🧪 Step 2: Test Admin Login

### Test Script:
```bash
# Replace YOUR_VERCEL_URL with actual Vercel URL
VERCEL_URL="https://your-app.vercel.app"

# Test admin login API
curl -X POST "$VERCEL_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@etax.local","password":"admin123"}' \
  -v
```

### Expected Results:

#### If Firebase Configured:
```json
{
  "success": true,
  "user": {
    "id": "firebase-uid",
    "email": "admin@etax.local"
  }
}
```

#### If Firebase Not Configured (Fallback):
```json
{
  "error": "Firebase Admin chưa sẵn sàng - vui lòng thử lại hoặc kiểm tra cấu hình"
}
```
→ Browser sẽ tự động fallback về localStorage ✅

---

## 🧪 Step 3: Test User Login

### Test Script:
```bash
VERCEL_URL="https://your-app.vercel.app"

curl -X POST "$VERCEL_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"mst":"00109202830","password":"123456"}' \
  -v
```

### Expected Results:
Similar to admin login - either Firebase success or fallback.

---

## 🧪 Step 4: Browser Testing

### Open Browser và test:

1. **Admin Login**:
   - Navigate to: `https://your-app.vercel.app/admin/login`
   - Enter: `admin@etax.local` / `admin123`
   - Click "Đăng nhập"
   - Expected: Redirect to `/admin` ✅

2. **User Login**:
   - Navigate to: `https://your-app.vercel.app/login`
   - Enter: `00109202830` / `123456`
   - Click "Đăng nhập"
   - Expected: Redirect to `/` (home) ✅

3. **Field Mapping Verification**:
   - After login, check home page MST display
   - Navigate to `/tra-cuu-nghia-vu-thue`
   - Verify MST không hardcoded ✅
   - Navigate to other pages
   - Verify MST từ session ✅

---

## 📋 Complete Test Checklist

### Pre-Deployment:
- [x] Code pushed to GitHub
- [x] Build successful locally
- [ ] Vercel deployment successful
- [ ] Environment variables configured

### Post-Deployment - Admin:
- [ ] Admin login page loads
- [ ] Login form works
- [ ] Login with `admin@etax.local` / `admin123`
- [ ] Redirects to `/admin`
- [ ] Admin dashboard accessible
- [ ] No console errors

### Post-Deployment - User:
- [ ] User login page loads
- [ ] Login form works
- [ ] Login with MST `00109202830` / `123456`
- [ ] Redirects to home page
- [ ] MST displays correctly on home
- [ ] No console errors

### Post-Deployment - Field Mapping:
- [ ] Home page: MST from `session.mst` ✅
- [ ] Tra cứu nghĩa vụ thuế: MST not hardcoded ✅
- [ ] Chi tiết nghĩa vụ thuế: MST not hardcoded ✅
- [ ] Thông tin người nộp thuế: MST not hardcoded ✅

---

## 🔍 Debug Information

### Check Vercel Logs:
1. Vercel Dashboard → Project → Deployments
2. Click latest deployment → **Functions** tab
3. View logs for:
   - `/api/auth/login` calls
   - Firebase initialization messages
   - Error messages

### Browser Console:
- F12 → Console tab
- Look for:
  - `[loginUserByMst]` messages
  - `[loginAdmin]` messages
  - Firebase errors
  - Cookie messages

---

**Ready for Testing!** 🚀

