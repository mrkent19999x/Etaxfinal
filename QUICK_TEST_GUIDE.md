# ⚡ Quick Test Guide - Vercel Deployment

**Anh Nghĩa ơi, em đã chuẩn bị xong! Giờ anh test trên Vercel như sau:**

---

## 🎯 Cách Test Nhanh

### 1️⃣ Tìm Vercel URL
1. Vào **https://vercel.com/dashboard**
2. Chọn project **Etaxfinal** (hoặc tên project của anh)
3. Copy URL (ví dụ: `https://etaxfinal.vercel.app`)

### 2️⃣ Test Admin Login
```
URL: https://your-app.vercel.app/admin/login
Email: admin@etax.local
Password: admin123
```
→ Click "Đăng nhập" → Should redirect to `/admin` ✅

### 3️⃣ Test User Login  
```
URL: https://your-app.vercel.app/login
MST: 00109202830
Password: 123456
```
→ Click "Đăng nhập" → Should redirect to home ✅

### 4️⃣ Verify Field Mapping
- Home page: MST hiển thị `00109202830` (từ session) ✅
- `/tra-cuu-nghia-vu-thue`: MST không hardcoded ✅
- `/chi-tiet-nghia-vu-thue/[id]`: MST không hardcoded ✅
- `/thong-tin-nguoi-noop-thue`: MST không hardcoded ✅

---

## 🔍 Check Browser Console (F12)

### Nếu Firebase Working:
```
[DEBUG] Firebase Admin initialized: { hasDb: true, hasAuth: true }
```

### Nếu Firebase Not Configured (Fallback):
```
[loginUserByMst] API failed, using localStorage fallback
[loginUserByMst] Fallback success ✅
```
→ **Vẫn login được!** ✅

---

## ✅ Expected Results

- ✅ Admin login works
- ✅ User login works  
- ✅ Field mapping đúng (không hardcoded)
- ✅ Pages load correctly
- ✅ No console errors

---

**Anh test thử và báo em kết quả nhé!** 🚀



