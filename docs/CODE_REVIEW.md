# 📋 Code Review Report

## 🔍 Tổng Quan

Review code cho eTax Web Application - hệ thống quản lý thuế điện tử.

**Date**: $(date)
**Reviewer**: Cipher (AI Assistant)

---

## ✅ ĐIỂM MẠNH

1. **Cấu trúc rõ ràng**: Tách biệt admin và user routes
2. **Type safety**: Sử dụng TypeScript tốt
3. **Security**: HttpOnly cookies, middleware protection
4. **Separation of concerns**: Hooks, services, components tách biệt rõ

---

## 🔴 VẤN ĐỀ NGHIÊM TRỌNG

### 1. **SECURITY: Plaintext Password Storage**

**File**: `src/app/api/auth/login/route.ts`

**Vấn đề**:
```typescript
// Line 32, 95: So sánh password plaintext
if (userData.password !== password) {
  return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 })
}
```

**Rủi ro**: 🔴 NGUY HIỂM - Password lưu plaintext trong Firestore

**Fix**:
- Hash password với bcrypt hoặc Argon2
- So sánh hash thay vì plaintext
- Migration script cho existing users

### 2. **SECURITY: Session Cookie không được ký**

**File**: `src/app/api/auth/login/route.ts`, `src/middleware.ts`

**Vấn đề**:
```typescript
cookieStore.set("etax_session", JSON.stringify(sessionData), {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: MAX_AGE,
  path: "/",
})
```

**Rủi ro**: 🟡 CẨN THẬN - Session có thể bị tampering

**Fix**:
- Dùng signed cookies (Next.js `cookies().set()` với secret)
- Hoặc dùng JWT signed với secret key
- Validate session signature trong middleware

### 3. **SECURITY: No Rate Limiting**

**File**: `src/app/api/auth/login/route.ts`

**Vấn đề**: Không có rate limiting cho login endpoint

**Rủi ro**: 🟡 CẨN THẬN - Brute force attacks

**Fix**:
- Implement rate limiting (5 attempts per 15 minutes)
- Use Redis hoặc in-memory store
- Lock account sau nhiều lần thất bại

---

## 🟡 VẤN ĐỀ CẦN CẢI THIỆN

### 4. **Error Handling: Generic Error Messages**

**File**: `src/app/api/auth/login/route.ts`

**Vấn đề**:
```typescript
} catch (error: any) {
  console.error("[API /auth/login]", error)
  return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
}
```

**Issue**: Error message quá generic, không giúp debug

**Fix**:
- Log đầy đủ error với context
- Trả về error message phù hợp (không leak sensitive info)
- Use error tracking (Sentry, etc.)

### 5. **Performance: N+1 Query Problem**

**File**: `src/app/api/auth/login/route.ts`

**Vấn đề**:
```typescript
// Line 85-99: Loop qua tất cả users
const usersSnapshot = await db.collection("users").where("role", "==", "user").get()
for (const doc of usersSnapshot.docs) {
  if (userData.mstList?.includes(normalizedMst)) {
    // ...
  }
}
```

**Issue**: Fetch tất cả users rồi filter trong memory

**Fix**:
- Tạo Firestore index cho `mstList` array
- Hoặc tạo collection riêng cho MST mappings
- Use compound query nếu có thể

### 6. **Type Safety: `any` Type Usage**

**File**: `src/app/api/auth/login/route.ts`

**Vấn đề**: Dùng `any` type cho error và userData

**Fix**:
- Define proper interfaces
- Use type guards

### 7. **Middleware: Missing CSRF Protection**

**File**: `src/middleware.ts`

**Vấn đề**: Không có CSRF token validation cho POST requests

**Fix**:
- Implement CSRF tokens
- Validate origin header

---

## 🔵 SUGGESTIONS (Best Practices)

### 8. **Code Quality: Magic Numbers**

**File**: `src/app/api/auth/login/route.ts`

```typescript
const MAX_AGE = 60 * 60 * 8 // 8 hours
```

**Suggestion**: Move to config file

### 9. **Testing: No Unit Tests**

**Issue**: Không có unit tests cho API routes và hooks

**Suggestion**: 
- Viết tests cho critical paths
- Test auth flows
- Test error cases

### 10. **Documentation: Missing API Docs**

**Suggestion**: 
- Add OpenAPI/Swagger docs
- Document request/response formats
- Document error codes

---

## 📊 TÓM TẮT

| Category | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟡 Warning | 4 |
| 🔵 Suggestion | 3 |
| **Total** | **10** |

---

## 🎯 PRIORITY FIXES

### High Priority (Do ngay)
1. ✅ Hash passwords (CRITICAL)
2. ✅ Sign session cookies (HIGH)
3. ✅ Add rate limiting (HIGH)

### Medium Priority (Trong sprint)
4. Fix N+1 query issue
5. Improve error handling
6. Add unit tests

### Low Priority (Backlog)
7. Add CSRF protection
8. Improve documentation
9. Refactor magic numbers

---

## 📝 NOTES

- Code structure tốt, dễ maintain
- Cần tập trung vào security fixes trước
- Testing infrastructure cần được setup





