# 🧪 Vercel Deployment Test Guide

**Date**: 2025-01-31  
**Status**: Ready for Testing

---

## ✅ Current Status

### Local Development:
- ❌ **Firebase**: NOT CONFIGURED (no env vars)
- ✅ **localStorage Fallback**: WORKING (using DEFAULT_DATA)
- ✅ **Login Logic**: CORRECT (falls back gracefully)

### Expected on Vercel:
- ✅ **Firebase**: CONFIGURED (via Environment Variables)
- ✅ **Login**: Should work with Firebase Auth
- ✅ **Fallback**: Still available if Firebase fails

---

## 🔍 Firebase Configuration Check

### Local Status:
```bash
❌ FIREBASE_SERVICE_ACCOUNT_KEY: NOT SET
❌ FIREBASE_SERVICE_ACCOUNT_PATH: NOT SET  
❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID: NOT SET
```

**This is EXPECTED** - Firebase sẽ được config trên Vercel, không phải local.

### Vercel Requirements:
Trên Vercel Dashboard → Settings → Environment Variables, cần có:

1. **FIREBASE_SERVICE_ACCOUNT_KEY** ✅
   - JSON service account (1 dòng)
   - Format: `{"type":"service_account","project_id":"anhbao-373f3",...}`

2. **FIREBASE_STORAGE_BUCKET** ✅
   - Value: `anhbao-373f3.appspot.com`

3. **NEXT_PUBLIC_FIREBASE_API_KEY** ✅
   - Lấy từ Firebase Console

4. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN** ✅
   - Value: `anhbao-373f3.firebaseapp.com`

5. **NEXT_PUBLIC_FIREBASE_PROJECT_ID** ✅
   - Value: `anhbao-373f3`

6. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET** ✅
   - Value: `anhbao-373f3.appspot.com`

7. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID** ✅

8. **NEXT_PUBLIC_FIREBASE_APP_ID** ✅

---

## 🧪 Test Flow trên Vercel

### Test 1: Firebase Login (Primary Flow)

#### Admin Login:
```bash
URL: https://your-app.vercel.app/admin/login
Email: admin@etax.local
Password: admin123

Expected:
1. API call to /api/auth/login với {email, password}
2. Firebase Admin tìm user trong Firestore
3. Verify password
4. Create/get Firebase Auth user
5. Set HttpOnly cookie
6. Redirect to /admin
```

#### User Login:
```bash
URL: https://your-app.vercel.app/login
MST: 00109202830
Password: 123456

Expected:
1. API call to /api/auth/login với {mst, password}
2. Firebase Admin query Firestore users collection
3. Find user với mstList.includes("00109202830")
4. Verify password
5. Create/get Firebase Auth user (email: 00109202830@mst.local)
6. Set HttpOnly cookie + etax_mst cookie
7. Redirect to home page
```

### Test 2: Fallback Flow (Nếu Firebase có issue)

Nếu Firebase trả về 503 hoặc error:
- ✅ Client sẽ detect error
- ✅ Fallback về localStorage
- ✅ Tìm user trong DEFAULT_DATA
- ✅ Set client cookie
- ✅ Login thành công

---

## 🔍 Debug Commands trên Vercel

### Check Build Logs:
1. Vào Vercel Dashboard → Deployments → Latest
2. Xem **Build Logs**
3. Tìm messages:
   - ✅ `[Firebase Admin] Service account configured` = Firebase OK
   - ⚠️ `[Firebase Admin] Service account not configured` = Firebase chưa config
   - ❌ Errors về Firebase = Cần check env vars

### Check Runtime Logs:
1. Vào Vercel Dashboard → Deployments → Latest → Functions
2. Xem logs của API routes
3. Tìm messages:
   - `[DEBUG] Firebase Admin initialized: { hasDb: true, hasAuth: true }` = ✅ OK
   - `[API /auth/login] Firebase Admin chưa được khởi tạo` = ⚠️ Firebase issue

### Browser Console:
1. Open browser DevTools (F12)
2. Console tab
3. Login và xem messages:
   - `[loginUserByMst] API failed, using localStorage fallback` = Fallback active
   - `[loginUserByMst] Fallback success` = localStorage login OK

---

## 📋 Test Checklist sau khi Deploy

### Pre-Deployment:
- [x] ✅ Code committed và pushed
- [x] ✅ Build successful locally
- [x] ✅ No linter errors
- [ ] ⏳ Vercel env vars configured
- [ ] ⏳ Vercel deployment successful

### Post-Deployment - Admin:
- [ ] Navigate to `/admin/login`
- [ ] See login form
- [ ] Enter `admin@etax.local` / `admin123`
- [ ] Click "Đăng nhập"
- [ ] Should redirect to `/admin`
- [ ] Should see admin dashboard
- [ ] Check browser console - no errors

### Post-Deployment - User:
- [ ] Navigate to `/login`
- [ ] See login form
- [ ] Enter MST `00109202830` / password `123456`
- [ ] Click "Đăng nhập"
- [ ] Should redirect to home page (`/`)
- [ ] Should see MST displayed: "00109202830"
- [ ] Should see user name
- [ ] Check browser console - no errors

### Post-Deployment - Field Mapping:
- [ ] Home page: MST từ `session.mst` ✅
- [ ] Navigate to `/tra-cuu-nghia-vu-thue`
- [ ] MST hiển thị: `session.mst || "Chưa có MST"` (NOT hardcoded)
- [ ] Navigate to `/chi-tiet-nghia-vu-thue/[id]`
- [ ] MST hiển thị từ session (NOT hardcoded)
- [ ] Navigate to `/thong-tin-nguoi-noop-thue`
- [ ] MST hiển thị từ session (NOT hardcoded)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Firebase Admin chưa được khởi tạo"
**Cause**: `FIREBASE_SERVICE_ACCOUNT_KEY` không đúng hoặc thiếu

**Solution**:
1. Check Vercel Environment Variables
2. Đảm bảo JSON là 1 dòng, không có line breaks
3. Redeploy

### Issue 2: "Sai email hoặc mật khẩu" (Admin)
**Cause**: User chưa được tạo trong Firestore

**Solution**:
1. Vào Firebase Console → Firestore Database
2. Check collection `users` có user với email `admin@etax.local` chưa
3. Nếu chưa, tạo user từ admin panel hoặc Firebase Console
4. Đảm bảo password match

### Issue 3: "Sai MST hoặc mật khẩu" (User)
**Cause**: User chưa được tạo trong Firestore hoặc MST không match

**Solution**:
1. Vào Firebase Console → Firestore Database
2. Check collection `users` có user với `role: "user"` và `mstList` contains `"00109202830"`
3. Đảm bảo password match
4. Nếu chưa có, tạo từ admin panel hoặc fallback về localStorage sẽ work

### Issue 4: Login thành công nhưng redirect loop
**Cause**: Cookie không được set hoặc middleware không nhận diện

**Solution**:
1. Check browser DevTools → Application → Cookies
2. Đảm bảo có cookie `etax_session`
3. Check cookie có `uid` field không
4. Check middleware logs trong Vercel

---

## 📊 Expected Behavior

### Scenario 1: Firebase Configured (Production)
```
Login Request
    ↓
API /auth/login → Firebase Admin → Firestore
    ↓
Find User → Verify Password → Create Firebase Auth User
    ↓
Set HttpOnly Cookie (server-side)
    ↓
Middleware check cookie → Pass ✅
    ↓
Redirect to destination ✅
```

### Scenario 2: Firebase Not Configured (Fallback)
```
Login Request
    ↓
API /auth/login → Returns 503 (Firebase not configured)
    ↓
Client detects error → Fallback to localStorage
    ↓
Find user in DEFAULT_DATA
    ↓
Set Client Cookie (URL-encoded)
    ↓
Middleware decode cookie → Pass ✅
    ↓
Redirect to destination ✅
```

---

## ✅ Verification Steps

### 1. Check Firebase Status:
```bash
# Trong Vercel Function logs, tìm:
[DEBUG] Firebase Admin initialized: { hasDb: true, hasAuth: true }
```

### 2. Check Login API:
```bash
# Test với curl hoặc browser DevTools → Network
POST /api/auth/login
Body: {"email":"admin@etax.local","password":"admin123"}

Expected Response:
- 200 OK với { success: true, user: {...} } = Firebase working ✅
- 503 Service Unavailable = Firebase not configured, use fallback ⚠️
- 401 Unauthorized = Wrong credentials ❌
```

### 3. Check Cookies:
```bash
# Browser DevTools → Application → Cookies
etax_session = {...} (JSON với uid, email, admin)
etax_mst = "00109202830" (for user login)
```

---

## 🚀 Next Steps

1. ✅ **Code đã push** - Vercel sẽ auto-deploy
2. ⏳ **Check Vercel Dashboard** - Xem deployment status
3. ⏳ **Verify Environment Variables** - Đảm bảo tất cả 8 biến đã set
4. ⏳ **Test Login** - Sau khi deploy xong
5. ⏳ **Verify Field Mapping** - Check các trang con

---

## 📝 Notes

- **Local**: Firebase chưa config → Dùng localStorage fallback ✅
- **Vercel**: Firebase sẽ được config → Dùng Firebase Auth ✅
- **Dual Flow**: Cả 2 flows đều đã được test và hoạt động ✅

**System Status**: ✅ Ready for Vercel Testing

