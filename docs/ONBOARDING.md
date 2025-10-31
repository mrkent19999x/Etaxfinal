# Onboarding nhanh cho thành viên mới

## 1. Yêu cầu môi trường
- Node.js >= 18
- npm (hoặc sử dụng npx kèm theo)
- Không cần Firebase CLI (bản mock dùng data-store cục bộ)

## 2. Cài đặt & chạy thử
```bash
npm install
npm run dev
```
- Mở `http://localhost:3000` → trang người dùng cuối (sẽ chuyển hướng về login nếu chưa đăng nhập).
- Mở `http://localhost:3000/admin/login` → khu vực admin.

### Tài khoản demo
| Vai trò | Thông tin |
|---------|-----------|
| Admin | Email `admin@etax.local` — Mật khẩu `admin123` |
| User | MST `00109202830` — Mật khẩu `123456` |

## 3. Data-store & session
- Dữ liệu nằm tại `src/lib/data-store.ts`.
- Các key `localStorage`:
  - `etax_data_store_v1`
  - `etax_admin_session`
  - `etax_user_session`
- Muốn reset về trạng thái mặc định: mở DevTools Console, gọi `resetStore()` (đã export từ `data-store.ts`).

## 4. Luồng kiểm tra nhanh
1. Đăng nhập user → xem trang chủ, sidebar hiển thị đúng tên & MST.
2. Đăng nhập admin → vào `/admin/users` kiểm tra CRUD hoạt động (cập nhật xong nhấn “Lưu cấu hình”).
3. Vào `/admin/mappings` chọn MST kiểm tra danh sách mapping.
4. Chạy `npm run lint` + `npm run build` để đảm bảo không lỗi trước khi bàn giao.

## 5. Khi bàn giao tính năng mới
- Ghi log thay đổi vào README.
- Nếu liên quan quy trình hoặc quy tắc, cập nhật cả `docs/RULES.md` và/hoặc `docs/AGENT.md`.
- Đính kèm hướng dẫn test (bước-by-bước) trong PR/note.
