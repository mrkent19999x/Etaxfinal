<!-- 755816fe-7041-4ca3-9b1c-5f423c6153b0 5fa7d4d8-758e-42ca-bda2-e6782069a138 -->
# Bỏ viewport safe-area để fullscreen

## Mục tiêu

- Giữ nguyên layout front, vị trí như hiện tại
- Bỏ tất cả `env(safe-area-inset-bottom)` để trang fullscreen
- Không còn khoảng trống ở dưới

## Files cần sửa

### File: `src/app/login/page.tsx`

1. **Content container** (dòng 139):

- Hiện tại: `paddingBottom: calc(env(safe-area-inset-bottom, 0px) + 5.5rem)`
- Sửa thành: `paddingBottom: "5.5rem"` (chỉ giữ spacing cho bottom nav, bỏ safe-area)

2. **Bottom nav** (dòng 323):

- Hiện tại: `bottom: "env(safe-area-inset-bottom, 0px)"`
- Sửa thành: `bottom: "0"` hoặc dùng className `bottom-0` (phủ đến tận mép dưới màn hình)

## Chi tiết thay đổi

### Content container:

- Giữ nguyên `paddingTop: env(safe-area-inset-top, 0px)` (cần cho notch)
- Bỏ `env(safe-area-inset-bottom)` khỏi paddingBottom
- Chỉ giữ `5.5rem` để spacing cho bottom nav

### Bottom nav:

- Đổi từ `bottom: env(safe-area-inset-bottom, 0px)` 
- Thành `bottom: 0` (phủ đến tận mép dưới, không có khoảng trống)

## Kết quả mong đợi

- Layout giữ nguyên, vị trí không đổi
- Trang fullscreen: không còn khoảng trống/màn hình xanh ở dưới
- Bottom nav phủ đến tận mép dưới màn hình vật lý