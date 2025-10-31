# Chuẩn hoá Root UI eTax Mobile (Next.js 16)

Mục tiêu: hợp nhất trải nghiệm đăng nhập → trang chủ → trang con theo cùng một khung UI (AppShell), dùng chung token màu/typography, kiểm soát điều hướng/scroll ổn định, và thiết lập quy trình kiểm thử tự động bằng Cursor MCP/Puppeteer.

## Kiến trúc giao diện

- AppShell: `phone-frame` bao quanh mọi màn hình (trừ `/login`).
- Header chung:
  - Component: `src/components/page-header.tsx` cho trang con (Back, Title, Home/Bell).
  - Trang chủ dùng header đặc biệt trong `src/app/page.tsx` (Menu, Logo, QR, Bell) — cùng style `etaxHeaderStyle`.
- Drawer/Sidebar: `src/components/sidebar.tsx` (overlay + panel 3/4 màn hình) — giữ nguyên, gọi trong Trang chủ.
- Guard đăng nhập:
  - `src/components/protected-view.tsx` + `useAuthGuard()` dùng cho trang con nếu cần bảo vệ; trang chủ đã redirect khi chưa login.

## Điều hướng chuẩn

- `/login` → xác thực xong → `/` (Trang chủ)
- Từ `/`: mở Drawer hoặc chọn các ô lưới để vào nhóm/tiểu mục:
  - `/hoa-don-dien-tu`, `/khai-thue`, `/dang-ky-thue`, `/ho-tro-quyet-toan`, `/nhom-chuc-nang-nop-thue`, `/tra-cuu-nghia-vu-thue`, `/thong-bao`, `/tien-ich`, `/ho-tro`, `/thiet-lap-ca-nhan` …
- Trang con dùng `PageHeader` để hiển thị tiêu đề đúng như ảnh chụp màn hình.

## Token hoá thiết kế

- Tệp: `docs/DESIGN_TOKENS.json`
  - colors: primary/surface/textPrimary/textInverse/mutedSurface
  - typography: title/section/body/caption
  - radii, spacing
- Mapping (hiện tại):
  - CSS variables trong `src/app/globals.css`: `--etax-header`, `--etax-red`, … tương ứng `colors.primary`, `colors.mutedSurface`, …
  - Khuyến nghị: dùng `--color-primary: #C60000` → `etax-header` kế thừa từ token.

## Quy ước code UI

- Header trang con: `<PageHeader title="Tên màn hình" />` đặt trên cùng, sticky, safe-area top (đã có trong `header-style.ts`).
- Nội dung cuộn: bao trong `<main className="flex-1 overflow-y-auto">` và thêm `margin-bottom: calc(24px + env(safe-area-inset-bottom))` nếu cần.
- Nút chính (đỏ): Tailwind với màu từ token (ví dụ `bg-[color:var(--etax-header)] text-white rounded-xl h-12`).
- Card trắng: `bg-white rounded-2xl shadow-sm px-4 py-3`.
- Khoảng cách lưới: `grid grid-cols-3 gap-6` (thay vì px cứng); kích thước icon/quadrant: `w-14 h-14`.

## Ánh xạ file → màn hình

Xem `docs/ETAX_MOBILE_NAVIGATION_FLOW_VN.md` (đã đủ chi tiết theo ảnh/video).

## Kiểm thử tự động bằng Cursor MCP

Yêu cầu: mcp.json đã có server `puppeteer` wrapper. Quy trình đề xuất chạy smoke test:

1) Khởi động dev server
- Lệnh: `npm run dev`
- Đợi app sẵn sàng tại `http://localhost:3000`

2) Dùng MCP Puppeteer (trong Cursor) chạy kịch bản:
- Goto `/login` → assert: có text `eTax Mobile` và nút `Đăng nhập`.
- Nếu có mock login: nhập MST + mật khẩu demo → submit → chờ chuyển `pathname === '/'`.
- Ở `/`: assert Header có logo, các icon (Menu, QR, Bell); assert section `Chức năng hay dùng` và `Danh sách nhóm dịch vụ`.
- Mở Drawer (click Menu) → assert các item: `Trang chủ`, `Hoá đơn điện tử`, `Khai thuế`, …; chụp screenshot.
- Điều hướng 3 trang con mẫu: `/tra-cuu-nghia-vu-thue`, `/tra-cuu-chung-tu`, `/thong-bao`
  - Mỗi trang: assert `PageHeader` tiêu đề đúng, kiểm tra có form `Tra cứu` hoặc danh sách.
- Quay lại Home (icon Home trong Header trang con) → assert về `/` thành công.

3) Lưu ảnh chứng cứ
- Dùng MCP Puppeteer `screenshot` mỗi bước vào `evidence/` để so sánh regression.

4) Mẫu prompt cho Cursor (copy/paste):
```
Start the dev server in a terminal: `npm run dev`. When `http://localhost:3000` is ready, use the Puppeteer MCP to:
1) goto http://localhost:3000/login
   - assert h1 contains "eTax Mobile"
   - screenshot as evidence/login.png
2) goto http://localhost:3000/
   - assert text "Chức năng hay dùng"
   - assert text "Danh sách nhóm dịch vụ"
   - screenshot as evidence/home.png
3) Click the menu button (aria-label="Mở menu điều hướng")
   - wait for drawer; assert item text "Hoá đơn điện tử"
   - screenshot as evidence/drawer.png
4) goto http://localhost:3000/tra-cuu-nghia-vu-thue
   - assert header contains "Tra cứu nghĩa vụ thuế"
   - screenshot as evidence/nghia-vu.png
5) goto http://localhost:3000/tra-cuu-chung-tu
   - assert header contains "Tra cứu chứng từ"
   - screenshot as evidence/chung-tu.png
6) goto http://localhost:3000/thong-bao
   - assert header contains "Thông báo"
   - screenshot as evidence/thong-bao.png
```

## Kịch bản E2E nâng cao

- Test form `Tra cứu chứng từ`: điền `Từ ngày/Đến ngày`, submit, chờ hiển thị bảng, assert hàng đầu tiên (khi có mock dữ liệu).
- Test `Chi tiết thông báo`: mở item → assert có text ngày/tiêu đề.
- Test `Xem chứng từ`: chọn `In chứng từ` → (Web) mở tab/pdf viewer → chụp screenshot.

## Dọn dẹp & tối ưu

- Dùng `ProtectedView` cho các trang con yêu cầu đăng nhập để giảm lặp lại logic kiểm tra session.
- Tất cả tiêu đề trang: đặt chuẩn trong `PageHeader` theo đúng tên tiếng Việt trong ảnh.
- Token hoá màu và radius để về sau đổi giao diện chỉ cần sửa token.

## Checklist “chuẩn hoá lần cuối”

- [ ] `/login` không dùng AppShell, còn lại đều bao trong `phone-frame`.
- [ ] Mọi trang con dùng `<PageHeader title="..." />`.
- [ ] Kiểu nút/ô lưới dùng token màu & radius.
- [ ] Drawer hiển thị đủ các mục menu; aria-label/role hợp lệ.
- [ ] Luồng điều hướng: login → home → trang con → back/home hoạt động ổn.
- [ ] Chạy smoke test MCP Puppeteer, lưu ảnh vào `evidence/`.

---

Tham khảo: `docs/ETAX_MOBILE_NAVIGATION_FLOW_VN.md` (luồng) và `docs/ETAX_QWEN_VALIDATION_AND_SUPPLEMENT.md` (ghi chú kiểm chứng & bổ sung).

