<!-- 70b0befd-9800-4995-a79a-33731a1a546e 0f835d0b-656d-4c60-a232-796ade52079c -->
# Fix Registration Section và Thêm Divider Dưới Input

## Mục tiêu

1. Phần "Bạn chưa có tài khoản? Đăng ký ngay": Text to hơn, "Bạn chưa có tài khoản?" căn trái, "Đăng ký ngay" căn phải
2. Phần "Người nước ngoài...": Rộng và dài hơn, chữ to hơn
3. Thêm đường ngang mờ dưới input MST và Password (giống screenshot ban đầu)

## Thay đổi

### File: `src/app/login/page.tsx`

**1. Thêm divider dưới input MST (line ~114)**

- Sau thẻ đóng `</div>` của `flex items-center gap-3`, thêm `<div className="h-px bg-white/80 mt-0" />`

**2. Thêm divider dưới input Password (line ~148 sau thẻ đóng div)**

- Sau thẻ đóng `</div>` của `flex items-center gap-3`, thêm `<div className="h-px bg-white/80 mt-0" />`

**3. Fix layout phần "Bạn chưa có tài khoản?" (line ~230-235)**

- Đổi từ inline sang flex layout: `flex justify-between items-center`
- Tăng text size từ `text-sm` lên `text-base` hoặc `text-[15px]`
- "Bạn chưa có tài khoản?" căn trái
- "Đăng ký ngay" căn phải

**4. Fix layout phần "Người nước ngoài..." (line ~236-241)**

- Tăng text size từ `text-sm` lên `text-base` hoặc `text-[15px]`
- Tăng width nếu cần, có thể thêm `max-w-none` hoặc điều chỉnh padding

### To-dos

- [ ] Giảm gap VNeID button (gap-3 → gap-1.5 hoặc gap-2) để text gần icon hơn
- [ ] Đảm bảo 'Đăng nhập bằng tài khoản' không kéo giãn, 'Định danh điện tử' căn giữa với dòng 1
- [ ] Bỏ focus ring classes từ input MST
- [ ] Bỏ focus ring classes từ input Password