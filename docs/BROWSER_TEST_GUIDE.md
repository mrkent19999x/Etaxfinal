# 🌐 Browser Testing Guide cho Vercel

**Date**: 2025-01-31  
**Test URL**: Cần lấy từ Vercel Dashboard

---

## 📍 Step 1: Tìm Vercel URL

1. Vào **https://vercel.com/dashboard**
2. Chọn project: **Etaxfinal** (hoặc tên project của anh)
3. Copy **Production URL** (ví dụ: `https://etaxfinal.vercel.app`)
4. Hoặc vào tab **Deployments** → Latest → Click **Visit** button

---

## 🧪 Step 2: Test Admin Login

### Bước 1: Navigate đến Admin Login
```
URL: https://your-app.vercel.app/admin/login
```

### Bước 2: Fill Form
- **Email**: `admin@etax.local`
- **Password**: `admin123`

### Bước 3: Click "Đăng nhập"

### Expected Results:

#### ✅ Firebase Configured (Primary):
- Button chuyển sang "Đang đăng nhập..."
- Redirect to `/admin` sau 2-3 giây
- Admin dashboard hiển thị
- Browser Console: No errors

#### ⚠️ Firebase Not Configured (Fallback):
- Button chuyển sang "Đang đăng nhập..."
- Browser Console: `[loginAdmin] API failed, using localStorage fallback`
- Browser Console: `[loginAdmin] Fallback success`
- Redirect to `/admin` sau 2-3 giây
- Admin dashboard hiển thị
- ✅ **Vẫn login được nhờ fallback**

---

## 🧪 Step 3: Test User Login

### Bước 1: Navigate đến User Login
```
URL: https://your-app.vercel.app/login
```

### Bước 2: Fill Form
- **MST**: `00109202830`
- **Password**: `123456`

### Bước 3: Click "Đăng nhập"

### Expected Results:

#### ✅ Firebase Configured (Primary):
- Button chuyển sang "Đang đăng nhập..."
- Redirect to `/` (home) sau 2-3 giây
- Home page hiển thị với MST: `00109202830`
- Browser Console: No errors

#### ⚠️ Firebase Not Configured (Fallback):
- Button chuyển sang "Đang đăng nhập..."
- Browser Console: `[loginUserByMst] API failed, using localStorage fallback`
- Browser Console: `[loginUserByMst] Fallback success`
- Redirect to `/` sau 2-3 giây
- Home page hiển thị với MST: `00109202830`
- ✅ **Vẫn login được nhờ fallback**

---

## 🧪 Step 4: Verify Field Mapping

### Test trên Home Page (`/`):
1. Sau khi login user, verify:
   - ✅ MST hiển thị: "00109202830" (từ `session.mst`)
   - ✅ Name hiển thị: "TỬ XUÂN CHIẾN" hoặc từ profile
   - ❌ KHÔNG có hardcoded "00109202830" trong code

### Test trên Tra Cứu Nghĩa Vụ Thuế (`/tra-cuu-nghia-vu-thue`):
1. Navigate từ home page
2. Verify:
   - ✅ MST hiển thị: `session.mst || "Chưa có MST"`
   - ❌ KHÔNG hiển thị hardcoded "00109202830"

### Test trên Chi Tiết Nghĩa Vụ Thuế (`/chi-tiet-nghia-vu-thue/[id]`):
1. Click vào một nghĩa vụ thuế
2. Verify:
   - ✅ MST hiển thị từ session
   - ❌ KHÔNG hardcoded

### Test trên Thông Tin Người Nộp Thuế (`/thong-tin-nguoi-noop-thue`):
1. Navigate đến trang
2. Verify:
   - ✅ MST hiển thị từ session
   - ❌ KHÔNG hardcoded

---

## 🔍 Browser DevTools Checks

### Console Tab:
Mở F12 → Console, tìm các messages:

**Firebase Working:**
```
[DEBUG] Firebase Admin initialized: { hasDb: true, hasAuth: true }
```

**Firebase Fallback:**
```
[loginUserByMst] API failed (status: 503), using localStorage fallback
[loginUserByMst] Fallback success: { accountId: "user-1", mst: "00109202830" }
```

**No Errors:**
- ❌ Không có red errors
- ⚠️ Warnings về Firebase là OK (fallback sẽ handle)

### Network Tab:
Mở F12 → Network, filter `/api/auth/login`:

**Success (200):**
```
POST /api/auth/login
Status: 200 OK
Response: { "success": true, "user": {...} }
```

**Fallback (503):**
```
POST /api/auth/login
Status: 503 Service Unavailable
Response: { "error": "Firebase Admin chưa sẵn sàng..." }
→ Client sẽ fallback ✅
```

### Application Tab → Cookies:
Sau khi login thành công, check cookies:

**Firebase Login:**
```
etax_session = { "uid": "firebase-uid", "email": "admin@etax.local", "admin": true }
(HttpOnly cookie)
```

**localStorage Fallback:**
```
etax_session = { "uid": "admin-1", "email": "admin@etax.local", "admin": true }
(URL-encoded, non-HttpOnly)
etax_mst = "00109202830" (for user login)
```

---

## 📋 Complete Test Checklist

### Pre-Test:
- [ ] Vercel deployment successful
- [ ] Production URL accessible
- [ ] No build errors in Vercel logs

### Admin Login Test:
- [ ] Navigate to `/admin/login`
- [ ] Form loads correctly
- [ ] Enter credentials
- [ ] Click login
- [ ] Redirect to `/admin` ✅
- [ ] Admin dashboard accessible ✅
- [ ] No console errors ✅

### User Login Test:
- [ ] Navigate to `/login`
- [ ] Form loads correctly
- [ ] Enter MST and password
- [ ] Click login
- [ ] Redirect to home ✅
- [ ] MST displays correctly ✅
- [ ] No console errors ✅

### Field Mapping Verification:
- [ ] Home page MST from session ✅
- [ ] Tra cứu nghĩa vụ thuế: MST not hardcoded ✅
- [ ] Chi tiết nghĩa vụ thuế: MST not hardcoded ✅
- [ ] Thông tin người nộp thuế: MST not hardcoded ✅

### Navigation Test:
- [ ] Home → Tra cứu nghĩa vụ thuế
- [ ] Home → Thông báo
- [ ] Home → Các trang con khác
- [ ] All pages show correct MST from session ✅

---

## 🐛 Debug nếu có lỗi

### Lỗi: "Sai email hoặc mật khẩu"
**Check:**
1. Firebase Console → Firestore → `users` collection có user chưa?
2. Nếu chưa, fallback sẽ work → Check browser console messages
3. Verify credentials đúng

### Lỗi: Redirect loop
**Check:**
1. Browser DevTools → Application → Cookies
2. Verify `etax_session` cookie exists
3. Verify cookie có `uid` field
4. Check middleware logs trong Vercel

### Lỗi: MST không hiển thị
**Check:**
1. Browser DevTools → Application → localStorage
2. Key: `etax_user_session`
3. Verify có `mst` field
4. Check console for session loading errors

---

## ✅ Success Criteria

### Login:
- ✅ Admin login works (Firebase or fallback)
- ✅ User login works (Firebase or fallback)
- ✅ Redirects correctly
- ✅ Session persists

### Field Mapping:
- ✅ No hardcoded MST values
- ✅ All pages use `session.mst`
- ✅ Proper fallback messages

### Performance:
- ✅ Pages load quickly
- ✅ No console errors
- ✅ Smooth navigation

---

**Ready for Testing!** 🚀

**Note**: Nếu Firebase chưa config trên Vercel, fallback sẽ tự động hoạt động và login vẫn thành công!



