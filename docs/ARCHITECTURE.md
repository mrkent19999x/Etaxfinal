# Sơ đồ kiến trúc dự án

## Tổng quan
- **Frontend:** Next.js 16 (App Router), Tailwind CSS 4, TypeScript.
- **Data layer:** `src/lib/data-store.ts` – lưu dữ liệu tại `localStorage`, cung cấp API cho admin & user.
- **Session:**
  - Admin: `getAdminSession()`, `loginAdmin()`, `logoutAdmin()`.
  - User: `getUserSession()`, `loginUserByMst()`, `logoutUser()`.
- **UI:**
  - Người dùng cuối: route `src/app/**` (30+ trang) – tiêu chuẩn PWA.
  - Admin: `src/app/admin/**` – đăng nhập riêng + dashboard + quản lý user/mapping.

```
┌────────────────────────────────────────────────────────────────────┐
│                              Next.js App                           │
│                                                                    │
│  ┌──────────────┐   ┌────────────────┐   ┌─────────────────────┐   │
│  │ Người dùng   │   │   data-store   │   │       Admin         │   │
│  │ (app/*.tsx)  │   │ (lib/data-…ts) │   │ (app/admin/*.tsx)   │   │
│  └──────────────┘   └────────────────┘   └─────────────────────┘   │
│         ▲                ▲             ▲          │                 │
│         │                │             │          │ fetch/update    │
│     useUserSession()     │             │      useFirebaseAuth()     │
│         │                │             │          │                 │
│   localStorage (user) ◄──┘             └──► localStorage (admin)    │
└────────────────────────────────────────────────────────────────────┘
```

## Tệp quan trọng
- `src/lib/data-store.ts`: định nghĩa `StoredData`, CRUD cho account/mapping/profile.
- `src/hooks/use-user-session.ts`: quản lý session người dùng cuối.
- `src/hooks/use-firebase-auth.ts`: quản lý session admin (tên cũ giữ nguyên, nhưng dùng local store).
- `src/app/layout.tsx`: metadata PWA, theme, manifest.
- `public/`: chứa asset UI (logo, icon, manifest, sw.js).

## Luồng đăng nhập
1. Người dùng vào `/login` → gọi `session.login(mst, password)` → ghi `etax_user_session`.
2. Sau khi đăng nhập, `useUserSession()` cung cấp MST + tên cho mọi trang.
3. Admin vào `/admin/login` → form gọi `login(email, password)` → ghi `etax_admin_session`.
4. Admin Dashboard sử dụng `useRequireAdmin()` để chặn truy cập trái phép.

## Ghi chú mở rộng
- Khi gắn backend thật: thay các hàm trong `data-store.ts` bằng API call, giữ nguyên interface để UI không phải sửa nhiều.
- Khi thêm route mới: tuân thủ folder structure trong `src/app/`, cập nhật README và docs liên quan.
