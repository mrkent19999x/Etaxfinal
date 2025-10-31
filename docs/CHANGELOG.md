# Changelog

Sử dụng file này để ghi lại các thay đổi đáng chú ý. Mỗi entry gồm ngày, người thực hiện (nếu cần), và mô tả ngắn gọn.

## 2025-10-31 – Khởi tạo project mock mới
- Dựng `etax-web-new` từ Next.js 16, Tailwind 4.
- Import toàn bộ UI mobile (20+ màn) từ commit ổn định.
- Viết lại data-store cục bộ (`src/lib/data-store.ts`) cho admin & user.
- Thêm các trang admin: đăng nhập, quản lý user, mapping MST.
- Tạo bộ docs: `README`, `RULES`, `AGENT`, `ONBOARDING`.

## Mẫu entry cho lần sau
```
### YYYY-MM-DD – Người thực hiện (tùy chọn)
- [Frontend] Mô tả ngắn (ví dụ: thêm trang ...).
- [Backend] ...
- [Docs] Cập nhật ...
```
