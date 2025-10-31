# Playbook cho agent

## 1. Bối cảnh dự án
- Mục tiêu: mô phỏng giao diện eTax Mobile thành web/PWA full screen để demo trải nghiệm người dùng cuối, đồng thời có giao diện admin tạo dữ liệu.
- Công nghệ: Next.js 16 (App Router), Tailwind CSS 4, TypeScript, data-store cục bộ (localStorage).
- Không sử dụng Firebase/Cloud Functions trong bản mock; toàn bộ dữ liệu nằm ở `src/lib/data-store.ts`.

## 2. Quy trình agent phải tuân thủ
1. Đọc `docs/RULES.md` → `docs/ONBOARDING.md` trước khi chạy lệnh.
2. Kiểm tra data-store: hiểu rõ cấu trúc `StoredData`, các key trong `localStorage`.
3. Khi sửa UI: giữ nguyên layout gốc (commit 2a165e5) trừ khi có chỉ đạo thay đổi.
4. Khi sửa admin: bảo đảm logic vẫn dùng data-store, không gọi API ngoài.
5. Mọi thay đổi phải cập nhật lại README/docs nếu ảnh hưởng quy trình.

## 3. Checklist trước khi làm việc
- [ ] Đã đọc RULES mới nhất?
- [ ] Đã chạy `npm run lint` & `npm run build` sau khi chỉnh sửa?
- [ ] Đã cập nhật tài liệu nếu thao tác thay đổi luồng làm việc/toàn cục?
- [ ] Đã giữ nguyên tài khoản mặc định (admin + user demo) để QA dễ kiểm tra?

## 4. Công cụ & script
- Lệnh chính: `npm run dev`, `npm run lint`, `npm run build`.
- Nếu cần reset dữ liệu mock: dùng `resetStore()` trong console (xem hướng dẫn ở `docs/ONBOARDING.md`).
- Assets UI nằm trong `public/assets`. Không đổi tên trừ khi cập nhật toàn bộ tham chiếu.

## 5. Khi cần mở rộng
- Muốn nối backend thật → tạo service mới, thay thế các hàm trong `data-store.ts`, giữ nguyên interface (hàm `createAccount`, `loginAdmin`, `getMapping`...).
- Muốn thêm màn hình: tạo route mới dưới `src/app/`, cập nhật README và (nếu cần) thêm bước test ở docs.

Luôn ghi nhớ: agent được phép tối ưu code nhưng **không** bật thêm dependency ngoài danh sách đã phê duyệt nếu không có chỉ đạo của anh Nghĩa.
