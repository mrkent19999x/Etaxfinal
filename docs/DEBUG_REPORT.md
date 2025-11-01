# 🐛 Debug Report - Login Issue

**Date**: $(date +"%Y-%m-%d %H:%M:%S")  
**Issue**: Login không hoạt động - trả về "Sai MST hoặc mật khẩu"

---

## 🔍 ROOT CAUSE ANALYSIS

### Vấn đề phát hiện:

1. **❌ Không có .env file thực tế**
   - Chỉ có `.env.example`
   - Firebase service account config chưa được setup

2. **❌ Firebase Admin có thể chưa init**
   - Không có env variables → Firebase Admin fallback về ADC
   - Có thể Firestore chưa có data hoặc không kết nối được

3. **❌ Firestore Query trả về empty**
   - Query `users` collection với `role == "user"` không tìm thấy user
   - MST `00109202830` không tồn tại trong Firestore

---

## 📊 EVIDENCE

### API Response:
```json
{"error":"Sai MST hoặc mật khẩu"}
```

### Browser Console:
```
[loginAdmin] Error: Sai email hoặc mật khẩu
```

### Network Request:
- `POST /api/auth/login` → 401 Unauthorized

---

## 🔧 DEBUGGING STEPS TAKEN

### 1. Added Debug Logging
✅ Thêm console.log vào `/api/auth/login/route.ts`:
- Log Firebase Admin init status
- Log Firestore query results
- Log user matching process
- Log password verification

### 2. Checked Environment
❌ Không có `.env` file thực tế
- Chỉ có `.env.example` với sample data
- Firebase credentials chưa được config

### 3. Tested API Directly
❌ API trả về 401
- MST: `00109202830`
- Password: `123456`
- Result: "Sai MST hoặc mật khẩu"

---

## 💡 HYPOTHESIS

### Hypothesis 1: Firestore không có data
**Probability**: HIGH  
**Evidence**: 
- Query trả về empty hoặc không tìm thấy user
- Default data trong `data-store.ts` chỉ là localStorage fallback

**Test**: Cần check Firestore database

### Hypothesis 2: Firebase Admin chưa init
**Probability**: MEDIUM
**Evidence**:
- Không có .env file
- Firebase Admin có thể fallback về ADC (Application Default Credentials)

**Test**: Check server logs cho Firebase init messages

### Hypothesis 3: Password không match
**Probability**: LOW
**Evidence**:
- Password được store plaintext
- Nếu Firestore có data, password should match

---

## 🎯 SOLUTION OPTIONS

### Option 1: Setup Firebase Service Account (RECOMMENDED)

**Steps**:
1. Tạo `.env.local` file
2. Copy Firebase service account JSON vào `FIREBASE_SERVICE_ACCOUNT_KEY`
3. Restart server
4. Verify Firebase Admin init

**Pros**:
- ✅ Proper Firebase connection
- ✅ Real database
- ✅ Production-ready

**Cons**:
- ⚠️ Cần Firebase credentials

### Option 2: Seed Firestore với test data

**Steps**:
1. Create script để seed Firestore
2. Add default users vào Firestore
3. Test lại login

**Pros**:
- ✅ Quick test
- ✅ Không cần real credentials ngay

**Cons**:
- ⚠️ Chỉ cho development

### Option 3: Use localStorage fallback

**Steps**:
1. Rely on `data-store.ts` localStorage fallback
2. Client-side login với localStorage
3. Bypass Firebase cho development

**Pros**:
- ✅ Works immediately
- ✅ No setup needed

**Cons**:
- ❌ Không test real flow
- ❌ Không production-ready

---

## 📝 RECOMMENDED FIX

### Immediate (Development):
1. ✅ **Use localStorage fallback** cho quick testing
2. ✅ Client-side login với `data-store.ts`
3. ✅ Test UI flows

### Short-term (Proper Setup):
1. ⚠️ **Setup Firebase credentials**
   - Copy service account JSON
   - Create `.env.local`
   - Restart server

2. ⚠️ **Seed Firestore data**
   - Create migration script
   - Add test users
   - Verify data exists

### Long-term (Production):
1. 🔒 **Fix security issues** (hash passwords, signed cookies)
2. 🔒 **Add proper error handling**
3. 🔒 **Add rate limiting**

---

## 🔄 NEXT STEPS

1. **Check Firestore data**: Verify có user với MST `00109202830` không
2. **Check Firebase Admin logs**: Xem có error messages không
3. **Test với localStorage fallback**: Xem client-side login có work không
4. **Setup Firebase properly**: Nếu cần test real flow

---

## 📊 DEBUG CODE ADDED

File: `src/app/api/auth/login/route.ts`

```typescript
// Added debug logs:
- Firebase Admin init status
- Firestore query results  
- User matching process
- Password verification

// To view logs:
// Check server console output
// Or browser network tab → View response
```

---

## ✅ STATUS

- ✅ Debug logging added
- ⏳ Waiting for server restart
- ⏳ Need to check server logs
- ⏳ Need to verify Firestore data

---

## 💬 NOTES

- Server đã được restart để capture logs
- Debug logs sẽ show trong server console
- Cần check cả client-side fallback (`data-store.ts`)





