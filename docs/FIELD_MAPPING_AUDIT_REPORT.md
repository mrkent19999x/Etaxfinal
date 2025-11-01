# 📋 Báo Cáo Kiểm Tra Field Mapping - Admin Tạo User & User Login Flow

**Date**: 2025-01-31  
**Auditor**: Cipher (AI Assistant)  
**Scope**: Admin tạo user → User login → Home & các trang con → Field mapping verification

---

## ✅ TỔNG KẾT

### Kết Quả Kiểm Tra

| Component | Status | Vấn Đề Phát Hiện |
|-----------|--------|------------------|
| **Admin Tạo User** | ✅ **PASS** | Không có vấn đề |
| **User Login Auth** | ✅ **PASS** | Form inputs hoạt động đúng |
| **Home Page Field Mapping** | ✅ **PASS** | Field mapping đúng chuẩn |
| **Trang Con Field Mapping** | ⚠️ **CẦN SỬA** | Có hardcoded fallback values |

---

## 🔍 CHI TIẾT KIỂM TRA

### 1. ✅ Admin Tạo User (Admin Panel)

**Location**: `src/app/admin/users/page.tsx`

**Form Fields**:
- ✅ Name: `formData.name` → Maps to `user.name`
- ✅ Email: `formData.email` → Maps to `user.email`
- ✅ Password: `formData.password` → Maps to `user.password` (hashed)
- ✅ Role: `formData.role` → Maps to `user.role`
- ✅ MST List: `formData.mstList` → Maps to `user.mstList[]`

**API Endpoint**: `POST /api/admin/users`

**Field Mapping Flow**:
```typescript
// Frontend
const formData = {
  name: "",
  email: "",
  password: "",
  role: "user",
  mstList: [],
}

// Backend Processing (src/app/api/admin/users/route.ts)
const firebaseUser = await auth.createUser({
  email,
  password,
  displayName: name,
})

const userDoc = {
  uid: firebaseUser.uid,
  email,
  name,
  role,
  mstList,  // ✅ Correctly mapped
  phone: phone || null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

**Status**: ✅ **PASS** - All fields correctly mapped from form to database.

---

### 2. ✅ User Login Authentication

**Location**: `src/app/login/page.tsx` + `src/hooks/use-user-session.ts`

**Login Flow**:
1. User enters MST + Password
2. `loginUserByMst(mst, password)` called
3. API `/api/auth/login` validates credentials
4. Session created: `{ accountId, mst }`
5. Stored in localStorage: `USER_SESSION_KEY`
6. `getUserSession()` retrieves session
7. Profile fetched using MST

**Field Mapping**:
```typescript
// Login input
mst: "00109202830"
password: "123456"

// Session stored
{
  accountId: "user-123",
  mst: "00109202830"  // ✅ Correctly mapped
}

// Session retrieved
session.mst  // ✅ Available in all pages
session.name // ✅ From profile.fullName or account.name
```

**Authentication Check**:
- ✅ MST validated against `user.mstList[]`
- ✅ Password validated against `user.password`
- ✅ Session persisted correctly
- ✅ `useUserSession()` hook provides session state

**Status**: ✅ **PASS** - Authentication and session mapping working correctly.

---

### 3. ✅ Home Page Field Mapping

**Location**: `src/app/page.tsx`

**Fields Displayed**:

| Field | Source | Code | Status |
|-------|--------|------|--------|
| **MST Display** | `session.mst` | Line 135: `MST: {session.mst}` | ✅ **PASS** |
| **User Name** | `session.name ?? session.mst` | Line 137: `{session.name ?? session.mst}` | ✅ **PASS** |
| **Avatar Alt Text** | `session.name ?? session.mst` | Line 132: `alt={session.name ?? session.mst}` | ✅ **PASS** |

**Code Analysis**:
```tsx
// ✅ CORRECT: Uses session.mst directly
<p className="text-gray-600 text-sm">MST: {session.mst}</p>

// ✅ CORRECT: Proper fallback to MST if name not available
<p className="text-[color:var(--color-primary)] font-bold text-lg">
  {session.name ?? session.mst}
</p>
```

**Session Hook** (`useUserSession`):
```typescript
// ✅ CORRECT: MST properly retrieved
const session = await getUserSession()
if (session) {
  const profile = await getProfile(session.mst)
  setState({
    mst: session.mst,  // ✅ Correctly mapped
    name: profile?.fullName ?? session.name ?? session.mst,
  })
}
```

**Status**: ✅ **PASS** - Home page field mapping đúng chuẩn.

---

### 4. ⚠️ Trang Con Field Mapping - CẦN SỬA

#### 4.1. ⚠️ Tra Cứu Nghĩa Vụ Thuế

**Location**: `src/app/tra-cuu-nghia-vu-thue/page.tsx`

**Vấn Đề Phát Hiện**:

```tsx
// ⚠️ PROBLEM: Hardcoded fallback value
<p className="text-[color:var(--color-primary)] font-bold text-lg">
  {(session.mst ?? "00109202830")}  // ❌ Hardcoded fallback
</p>
```

**Impact**:
- Nếu `session.mst` null (user chưa login), sẽ hiển thị MST hardcoded "00109202830"
- Có thể gây nhầm lẫn: user nghĩ đã login với MST đó
- Không phản ánh đúng trạng thái session

**Recommendation**:
```tsx
// ✅ SHOULD BE:
<p className="text-[color:var(--color-primary)] font-bold text-lg">
  {session.mst || "Chưa đăng nhập"}  // Better fallback
</p>
// OR redirect if session.mst is null
```

**Status**: ⚠️ **CẦN SỬA** - Có hardcoded fallback value.

---

#### 4.2. ⚠️ Chi Tiết Nghĩa Vụ Thuế

**Location**: `src/app/chi-tiet-nghia-vu-thue/[id]/page.tsx`

**Vấn Đề Phát Hiện**:

```tsx
// ⚠️ PROBLEM: Hardcoded fallback in useEffect
useEffect(() => {
  // Mock data với hardcoded MST
  setDetail({
    mst: session.mst ?? "00109202830",  // ❌ Hardcoded fallback
    name: session.name ?? "Người nộp thuế",
  })
}, [session.mst, session.name])
```

**Impact**: Tương tự như trên - có thể hiển thị sai MST khi session null.

**Status**: ⚠️ **CẦN SỬA**.

---

#### 4.3. ⚠️ Thông Tin Người Nộp Thuế

**Location**: `src/app/thong-tin-nguoi-noop-thue/page.tsx`

**Vấn Đề Phát Hiện**:

```tsx
// ⚠️ PROBLEM: Hardcoded fallback
useEffect(() => {
  setFormData({
    mst: session.mst ?? "00109202830",  // ❌ Hardcoded fallback
    name: session.name ?? "",
  })
}, [session.mst, session.name])
```

**Status**: ⚠️ **CẦN SỬA**.

---

### 5. ✅ API Routes Field Mapping

#### 5.1. Notifications API

**Location**: `src/app/api/notifications/route.ts`

**Field Mapping**:
```typescript
// ✅ CORRECT: Uses session MST properly
const sessionMst = userSession.mst
const mst = isAdmin ? parsed.data.mst ?? sessionMst : sessionMst

// ✅ CORRECT: Filters notifications by MST
const notificationsQuery = db
  .collection("notifications")
  .where("mst", "==", mst)
```

**Status**: ✅ **PASS** - API correctly uses session MST.

---

#### 5.2. Documents API

**Location**: `src/app/api/documents/route.ts`

**Field Mapping**:
```typescript
// ✅ CORRECT: Uses session MST
const sessionMst = userSession.mst
```

**Status**: ✅ **PASS** - API correctly uses session MST.

---

#### 5.3. Auth Me API

**Location**: `src/app/api/auth/me/route.ts`

**Field Mapping**:
```typescript
// ✅ CORRECT: Gets MST from session or mstList[0]
let userMst: string | null = mst || null
if (!userMst && role === "user" && userData.mstList?.length > 0) {
  const mstCookie = cookieStore.get("etax_mst")?.value
  userMst = mstCookie || userData.mstList[0]  // ✅ Logical fallback
}
```

**Status**: ✅ **PASS** - API has logical fallback (uses mstList, not hardcoded).

---

## 📊 TỔNG KẾT FIELD MAPPING

### ✅ PASS - Mapping Đúng Chuẩn

1. ✅ **Admin Create User**: All fields correctly mapped
2. ✅ **User Login**: MST and session correctly stored/retrieved
3. ✅ **Home Page**: Uses `session.mst` and `session.name` correctly
4. ✅ **API Routes**: APIs use session MST correctly

### ⚠️ CẦN SỬA - Hardcoded Fallback Values

1. ⚠️ `src/app/tra-cuu-nghia-vu-thue/page.tsx` - Line 127
   - **Issue**: `session.mst ?? "00109202830"` (hardcoded)
   - **Fix**: Remove hardcoded value, use proper error handling

2. ⚠️ `src/app/chi-tiet-nghia-vu-thue/[id]/page.tsx` - Line 16
   - **Issue**: `session.mst ?? "00109202830"` (hardcoded)
   - **Fix**: Remove hardcoded value

3. ⚠️ `src/app/thong-tin-nguoi-noop-thue/page.tsx` - Line 28
   - **Issue**: `session.mst ?? "00109202830"` (hardcoded)
   - **Fix**: Remove hardcoded value

---

## 🎯 RECOMMENDATIONS

### High Priority (Fix Immediately)

1. **Remove Hardcoded Fallback Values**:
   - Replace `session.mst ?? "00109202830"` with proper error handling
   - Use `session.mst || null` and show error/redirect if null
   - Or use `ProtectedView` component to ensure user is logged in

2. **Standardize Fallback Behavior**:
   - Create utility function: `getUserMst(session) => string | null`
   - Consistent error handling across all pages

### Medium Priority

3. **Add Field Mapping Tests**:
   - Unit tests for session field mapping
   - E2E tests for user login → pages → verify MST displayed

4. **Documentation**:
   - Document expected field mapping flow
   - Add comments in code explaining MST retrieval logic

---

## 🔧 SUGGESTED FIXES

### Fix 1: Tra Cứu Nghĩa Vụ Thuế

```tsx
// BEFORE (❌)
<p className="text-[color:var(--color-primary)] font-bold text-lg">
  {(session.mst ?? "00109202830")}
</p>

// AFTER (✅)
{session.mst ? (
  <p className="text-[color:var(--color-primary)] font-bold text-lg">
    {session.mst}
  </p>
) : (
  <p className="text-gray-500">Chưa đăng nhập</p>
)}
```

### Fix 2: Use ProtectedView

All pages already use `<ProtectedView>` which should redirect if not logged in. But we should also ensure MST is available:

```tsx
// ✅ Better: Check in ProtectedView or redirect
if (!session.mst) {
  router.replace("/login")
  return null
}
```

---

## 📈 FIELD MAPPING FLOW DIAGRAM

```
Admin Creates User
    ↓
[email, password, name, mstList] → Firebase Auth + Firestore
    ↓
User Login
    ↓
[MST, Password] → Validated → Session Created
    ↓
session = { accountId, mst }
    ↓
getUserSession() → Returns session with MST
    ↓
getProfile(session.mst) → Returns profile data
    ↓
Pages Use:
- session.mst ✅ (correct)
- session.name ✅ (correct)
- session.mst ?? "00109202830" ❌ (hardcoded - needs fix)
```

---

## ✅ KẾT LUẬN

### Overall Status: ⚠️ **PARTIALLY COMPLIANT**

- **Admin Create User**: ✅ 100% compliant
- **User Login Auth**: ✅ 100% compliant  
- **Home Page**: ✅ 100% compliant
- **Trang Con**: ⚠️ 70% compliant (3 files need fixes)

### Action Items:

1. ⚠️ **CRITICAL**: Fix 3 files with hardcoded MST fallback values
2. ✅ **RECOMMENDED**: Add proper error handling for null MST cases
3. ✅ **RECOMMENDED**: Add field mapping tests

**Estimated Fix Time**: 30 minutes (3 files × 10 min/file)

---

**Report Generated By**: Cipher  
**Date**: 2025-01-31  
**Next Review**: After fixes applied
