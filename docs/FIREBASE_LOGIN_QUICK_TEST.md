# 🔥 Firebase Login Quick Test

## ⚡ Test Nhanh - Checklist

### 🎯 Prerequisites
- [ ] Firebase configured: `.env.local` có đầy đủ env vars
- [ ] Test user tồn tại trong Firestore: `phuctran123@gmail.com` / `123456`
- [ ] Dev server chạy: `npm run dev`

---

## 📋 Quick Test Steps

### 1️⃣ Admin Login Test (Local)

**URL:** `http://localhost:3000/admin/login`

**Test Credentials:**
- Email: `phuctran123@gmail.com` (nếu role=admin) HOẶC `admin@etax.local`
- Password: `123456` (hoặc `admin123`)

**Checklist:**
- [ ] Form load thành công
- [ ] Login thành công (không báo lỗi)
- [ ] Console log: `[loginAdmin]` không có error
- [ ] Redirect về `/admin`
- [ ] Cookie `etax_session` được set (check DevTools > Application > Cookies)
- [ ] API `/api/auth/me` trả về user data đúng

**Quick Test Command (trong Browser Console):**
```javascript
// Test admin login
const testAdmin = async () => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'phuctran123@gmail.com', password: '123456'})
  });
  const data = await res.json();
  console.log('Admin Login Result:', data);
  
  // Check session
  const meRes = await fetch('/api/auth/me');
  const meData = await meRes.json();
  console.log('Session Check:', meData);
  return {login: data, session: meData};
};
testAdmin();
```

---

### 2️⃣ User Login Test (Local)

**URL:** `http://localhost:3000/login`

**Test Credentials:**
- MST: Lấy từ Firestore user `phuctran123@gmail.com` → `mstList[0]` HOẶC `00109202830`
- Password: `123456`

**Checklist:**
- [ ] Form load thành công
- [ ] Login thành công
- [ ] Console log: `[loginUserByMst]` không có error
- [ ] Redirect về `/`
- [ ] Cookie `etax_session` và `etax_mst` được set
- [ ] MST hiển thị đúng trên home page (không hardcoded)

**Quick Test Command (trong Browser Console):**
```javascript
// Test user login
const testUser = async () => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({mst: '00109202830', password: '123456'})
  });
  const data = await res.json();
  console.log('User Login Result:', data);
  
  // Check session
  const meRes = await fetch('/api/auth/me');
  const meData = await meRes.json();
  console.log('Session Check:', meData);
  return {login: data, session: meData};
};
testUser();
```

---

### 3️⃣ Field Mapping Verification

Sau khi login thành công, check các pages:

**Pages to Check:**
- [ ] `/` - MST từ `session.mst` (không hardcoded)
- [ ] `/tra-cuu-nghia-vu-thue` - MST từ session
- [ ] `/chi-tiet-nghia-vu-thue/[id]` - MST từ session
- [ ] `/thong-tin-nguoi-noop-thue` - MST từ session

**Quick Check (Browser Console sau khi login):**
```javascript
// Check MST trong session
const checkMst = async () => {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  console.log('Current MST:', data.user?.mst);
  console.log('MST List:', data.user?.mstList);
  return data.user?.mst;
};
checkMst();
```

---

### 4️⃣ Production Test (Vercel)

**URL:** `https://etaxfinal.vercel.app`

**Test Scenarios:**
- [ ] Admin login: `/admin/login` với credentials như local
- [ ] User login: `/login` với MST và password
- [ ] Session persist sau khi refresh
- [ ] Field mapping đúng trên production

**Quick Test (Browser Console trên Vercel):**
```javascript
// Test admin login trên Vercel
const testProdAdmin = async () => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'phuctran123@gmail.com', password: '123456'})
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Result:', data);
  return data;
};
testProdAdmin();
```

---

## 🐛 Debug Tips

### Check Firebase Connection:
```javascript
// Trong Browser Console
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => console.log('Firebase Status:', data));
```

### Check Console Logs:
- Tìm `[DEBUG]` logs trong terminal (server logs)
- Check `[loginAdmin]` hoặc `[loginUserByMst]` logs trong browser console
- Nếu thấy "Firebase Admin chưa sẵn sàng" → Check env vars

### Check Cookies:
- DevTools > Application > Cookies
- Tìm `etax_session` và `etax_mst`
- `etax_session` phải là HttpOnly (không thấy trong Application tab, chỉ thấy trong Network tab)

---

## ✅ Expected Results

### Admin Login:
```json
{
  "success": true,
  "user": {
    "id": "firebase-uid-here",
    "email": "phuctran123@gmail.com"
  }
}
```

### User Login:
```json
{
  "success": true,
  "user": {
    "id": "firebase-uid-here",
    "mst": "00109202830",
    "name": "Tử Xuân Chiến"
  }
}
```

### Session Check:
```json
{
  "user": {
    "id": "firebase-uid-here",
    "email": "...",
    "role": "admin" | "user",
    "mst": "00109202830", // nếu user
    "name": "..."
  }
}
```

---

## 🚨 Common Issues

1. **503 Error**: Firebase chưa config → Check `.env.local`
2. **401 Error**: Sai credentials hoặc user không tồn tại trong Firestore
3. **Cookie không set**: Check `httpOnly: true` và `secure` flag
4. **MST không hiển thị**: Check `session.mst` có đúng không

---

## 📝 Test Results Template

### Admin Login:
- [ ] ✅ PASS | ❌ FAIL
- Firebase Used: ✅ / ❌
- Fallback Used: ✅ / ❌
- Cookie Set: ✅ / ❌
- Session Valid: ✅ / ❌

### User Login:
- [ ] ✅ PASS | ❌ FAIL
- Firebase Used: ✅ / ❌
- Fallback Used: ✅ / ❌
- Cookie Set: ✅ / ❌
- MST Displayed: ✅ / ❌

### Field Mapping:
- [ ] ✅ PASS | ❌ FAIL
- All pages show correct MST: ✅ / ❌

### Production:
- [ ] ✅ PASS | ❌ FAIL
- Admin login works: ✅ / ❌
- User login works: ✅ / ❌

---

**⏱️ Estimated Time: 5-10 phút cho full test**

