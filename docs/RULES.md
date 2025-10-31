# Quy tắc làm việc (bắt buộc đọc)

## Rule 1 – Bảo toàn kiến trúc mock
- Không thêm/chỉnh sửa để dự án phụ thuộc Firebase, Cloud Functions, hay backend ngoài khi chưa có yêu cầu chính thức.
- Mọi dữ liệu phải đi qua `src/lib/data-store.ts` (hoặc lớp abstraction kế thừa cùng interface).

## Rule 2 – Giữ nguyên ngôn ngữ & phong cách UI
- UI mô phỏng đúng bản mobile; chỉ chỉnh sửa khi anh Nghĩa yêu cầu.
- Văn bản giao diện giữ nguyên tiếng Việt chuẩn, không đổi sang ngôn ngữ khác.

## Rule 3 – Tuân thủ quy trình kiểm tra
- Trước khi giao: chạy `npm run lint` và `npm run build` (bắt buộc).
- Nếu build/lint báo lỗi phải xử lý hoặc ghi chú rõ ràng lý do.

## Rule 4 – Cập nhật tài liệu khi thay đổi luồng
- Mọi thay đổi ảnh hưởng dữ liệu, mapping, hoặc hành vi đăng nhập → cập nhật README + docs tương ứng.
- Không bỏ trống/tự ý xóa tài liệu hiện có.

## Rule 5 – Quản lý tài khoản mẫu
- Không đổi mật khẩu/email mặc định của admin/user demo trừ khi được yêu cầu.
- Nếu thêm tài khoản demo mới phải ghi rõ trong README và ONBOARDING.

## Rule 6 – Giới hạn dependency
- Chỉ cài thêm package mới khi thật sự cần và đã báo trước.
- Ưu tiên dependency hiện có (Next.js, lucide-react, Tailwind, v.v.).

## Rule 7 – Git/Versioning
- Tạo nhánh riêng khi làm việc (nếu dùng git). Không commit trực tiếp lên production branch.
- Viết commit message rõ ràng (tiếng Việt được khuyến khích).

## Rule 8 – An toàn dữ liệu
- Không commit credential thật.
- Nếu tích hợp backend, dùng biến môi trường `.env.local` và cập nhật hướng dẫn trong docs.

Vi phạm bất kỳ rule nào ở trên có thể khiến agent bị revert thay đổi hoặc yêu cầu làm lại. Hãy luôn đọc lại file này khi bắt đầu một nhiệm vụ mới.
