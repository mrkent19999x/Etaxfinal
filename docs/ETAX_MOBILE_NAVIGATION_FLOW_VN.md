# Sơ đồ luồng điều hướng — eTax Mobile

Tổng hợp từ ảnh chụp màn hình IMG_0317.JPG → IMG_0351.JPG và video demo (tách khung hình 1fps). Tên màn hình sử dụng đúng theo tiêu đề hiển thị trong ứng dụng.

## Màn hình & điểm vào chính

- `Đăng nhập` (IMG_0341)
  - Trường: Mã số thuế, Mật khẩu; liên kết: Quên tài khoản?, Quên mật khẩu?
  - Nút: `Đăng nhập`; tùy chọn: "Đăng nhập bằng tài khoản Định danh điện tử".
  - Thanh dưới có lối tắt: QR tem, Tiện ích, Hỗ trợ, Chia sẻ (theo icon hệ thống).

- `Trang chủ / eTax Mobile` (IMG_0320, IMG_0335, IMG_0338, frame_0001..0012)
  - Thanh trên: Menu (☰), QR quét mã, Chuông (thông báo).
  - Thẻ người dùng: MST + Họ tên (mũi tên để mở menu chi tiết tài khoản).
  - Khối `Chức năng hay dùng` (carousel ngang) + nút cài đặt (⚙) ở góc.
  - Khối `Danh sách nhóm dịch vụ` (grid): Hóa đơn điện tử, Khai thuế, Đăng ký thuế, Hỗ trợ quyết toán thuế TNCN, Nhóm chức năng nộp thuế, Tra cứu nghĩa vụ thuế, Tra cứu thông báo, Tiện ích, Hỗ trợ, Thiết lập cá nhân.

- `Menu chính (Drawer)` (IMG_0321, IMG_0324, IMG_0342, IMG_0346)
  - Mục: Trang chủ, Hóa đơn điện tử, Khai thuế, Đăng ký thuế, Hỗ trợ quyết toán thuế TNCN, Nhóm chức năng nộp thuế, Tra cứu nghĩa vụ thuế, Tra cứu thông báo, Tiện ích, Hỗ trợ, Thiết lập cá nhân, Đăng xuất.

- `Tra cứu thông báo` → `Thông báo` (IMG_0317, IMG_0348)
  - Tabs: Thông báo hành chính của CQT, Biến động nghĩa vụ thuế, Thông báo khác.
  - Tìm kiếm: "Tìm theo nội dung hoặc ngày" + `Nâng cao`.
  - Chạm item → `Chi tiết thông báo` (IMG_0323).

- `Chi tiết thông báo` (IMG_0323)
  - Nội dung: giao dịch nộp thuế, hiển thị Mã tham chiếu.
  - Chạm mã tham chiếu → mở xem chứng từ (PDF iOS).

- `Xem chứng từ (PDF iOS Viewer)` (IMG_0319, IMG_0349)
  - Tiêu đề: mã tham chiếu (ví dụ 11020250044818128), nút `Done` và chia sẻ iOS.

- `Tra cứu nghĩa vụ thuế` (màn hình chọn nhóm) (IMG_0336)
  - Mục: Thông tin nghĩa vụ thuế; Thông tin nghĩa vụ tài chính đất đai; Thông tin nghĩa vụ Lệ phí trước bạ phương tiện.

- `Thông tin nghĩa vụ thuế` (form + kết quả) (IMG_0337 form; IMG_0322, IMG_0351 kết quả)
  - Trường: `Mã số thuế` → `Tra cứu` → hiển thị "Thông tin chi tiết" gồm các nhóm khoản.
  - Chạm khoản → `Thông tin chi tiết`.

- `Thông tin chi tiết` (chi tiết nghĩa vụ) (IMG_0325, IMG_0350)
  - Các trường: ID khoản phải nộp, Số quyết định, Ngày, Chương, Kỳ thuế, Tiểu mục, Địa bàn, Hạn nộp, Số tiền, Số tiền đã nộp, Loại nghĩa vụ, Số tham chiếu, Trạng thái.

- `Nhóm chức năng nộp thuế` (IMG_0330)
  - Mục: Nộp thuế; Nộp thuế thay; Tra cứu chứng từ nộp thuế; Tự lập giấy nộp tiền; Liên kết/Hủy liên kết tài khoản; Đề nghị xử lý khoản nộp thừa; Tra cứu đề nghị xử lý khoản nộp thừa; Quét QR-Code để nộp thuế.

- `Tra cứu chứng từ` (IMG_0339, IMG_0340, IMG_0326, frame_0025)
  - Trường: Mã tham chiếu; Từ ngày; Đến ngày; `Tra cứu`.
  - Kết quả dạng bảng (IMG_0326) + chọn radio "In chứng từ" → `In chứng từ` (mở PDF iOS). Trường hợp không có dữ liệu: thông báo lỗi đỏ "Không tìm thấy dữ liệu" (IMG_0340).

- `Nộp thuế` (IMG_0344)
  - Tabs: Tất cả | Lệ phí trước bạ | NVTC ...; Trường `Mã số thuế` → `Tra cứu`.

- `Khai thuế` (IMG_0343)
  - Mục: Khai thuế CNKD; Tra cứu hồ sơ khai thuế; Tra cứu hồ sơ khai Lệ phí trước bạ; Tra cứu hồ sơ đất đai.

- `Mẫu số 01/CNKD` (IMG_0334)
  - Thông tin TTHC, nút `Nộp hồ sơ`.

- `Hóa đơn điện tử` (IMG_0333)
  - Mục: Kê khai tờ khai đăng ký HĐĐT; Tờ khai chờ xác thực; Tra cứu tờ khai đăng ký HĐĐT.

- `Hỗ trợ quyết toán thuế TNCN` (IMG_0331)
  - Mục: Hồ sơ quyết toán thuế; Tra cứu thông tin quyết toán; Tra cứu phản ánh QTT gửi đến CQT; Hỗ trợ lập tờ khai quyết toán.

- `Tiện ích` (IMG_0332)
  - Mục: Tra cứu bảng giá tính thuế phương tiện; Tra cứu thông tin NNT; Tra cứu hộ kinh doanh; Công cụ tính thuế TNCN; Quét QR-Code cho Tem rượu/thuốc lá điện tử; Phản hồi về hộ kinh doanh; Tra cứu nguồn gốc QR tem.

- `Hỗ trợ` (IMG_0347)
  - Mục: Hướng dẫn sử dụng; Liên hệ hỗ trợ; Phiên bản ứng dụng.

- `Thiết lập cá nhân` (IMG_0328)
  - Mục: Thiết lập ảnh đại diện; Đổi mật khẩu đăng nhập; Đăng nhập bằng vân tay/FaceID; Đăng ký kênh nhận thông tin; Chức năng hay dùng.

- `Thông tin tài khoản` (IMG_0329)
  - Nút: Thay đổi thông tin; Mã QR-Code thông; Đổi mật khẩu; Xóa tài khoản. Bên dưới là thông tin chi tiết tài khoản.

- `Cài đặt chức năng hay dùng` (frame_0015, frame_0020)
  - Danh sách dài có công tắc bật/tắt để cá nhân hóa các ô trong khối "Chức năng hay dùng" trên Trang chủ.

---

## Sơ đồ luồng điều hướng (Mermaid)

```mermaid
flowchart TD
  A[Đăng nhập] -->|Đăng nhập| B[Trang chủ / eTax Mobile]

  %% Thanh trên Trang chủ
  B -->|☰ Menu| M[Menu chính (Drawer)]
  B -->|Chuông| N[Thông báo]
  B -->|⚙ trong 'Chức năng hay dùng'| C[ Cài đặt chức năng hay dùng ]

  %% Menu chính (điều hướng song song)
  M --> B
  M --> HDE[Hóa đơn điện tử]
  M --> KT[Khai thuế]
  M --> DK[Đăng ký thuế]
  M --> QTT[Hỗ trợ quyết toán thuế TNCN]
  M --> NT[Nhóm chức năng nộp thuế]
  M --> NV[Tra cứu nghĩa vụ thuế]
  M --> TB[Tra cứu thông báo]
  M --> TI[Tiện ích]
  M --> HT[Hỗ trợ]
  M --> TL[Thiết lập cá nhân]

  %% Thông báo
  N -->|Chọn item| CTB[Chi tiết thông báo]
  TB --> N
  CTB -->|Chạm mã tham chiếu| PDF[ Xem chứng từ (PDF iOS) ]
  PDF -->|Done| CTB

  %% Tra cứu nghĩa vụ thuế
  NV --> NV1[Tra cứu nghĩa vụ thuế]
  NV1 -->|Chọn 'Thông tin nghĩa vụ thuế'| NV2[Thông tin nghĩa vụ thuế (form)]
  NV2 -->|Tra cứu| NV3[Thông tin nghĩa vụ thuế (kết quả)]
  NV3 -->|Chọn khoản| CT[Thông tin chi tiết]
  CT -->|Back| NV3

  %% Nhóm chức năng nộp thuế
  B -->|Grid: Nhóm chức năng nộp thuế| NT
  NT --> Nop[Nộp thuế]
  Nop -->|Tra cứu| NopR[Kết quả tra cứu nộp thuế]
  NT --> TCCT[Tra cứu chứng từ]
  TCCT -->|Tra cứu| TLKQ[Kết quả (bảng)]
  TLKQ -->|Chọn 'In chứng từ'| PDF
  TLKQ -->|Không có dữ liệu| TCCT

  %% Khai thuế
  B -->|Grid: Khai thuế| KT
  KT --> CNKD[Khai thuế CNKD]
  CNKD --> MS01[Mẫu số 01/CNKD]
  MS01 -->|Nộp hồ sơ| MS01_Sub[Tiến trình nộp hồ sơ]

  %% Hóa đơn điện tử
  B -->|Grid: Hóa đơn điện tử| HDE

  %% Đăng ký thuế
  B -->|Grid: Đăng ký thuế| DK

  %% Tiện ích / Hỗ trợ / Thiết lập cá nhân
  B -->|Grid: Tiện ích| TI
  B -->|Grid: Hỗ trợ| HT
  B -->|Grid: Thiết lập cá nhân| TL
  TL -->|Chọn 'Chức năng hay dùng'| C
  TL -->|Chọn 'Đổi mật khẩu'| DDMK[Đổi mật khẩu]
```

Ghi chú: "Kết quả tra cứu nộp thuế" không có ảnh trực tiếp trong bộ dữ liệu; các bước được suy diễn từ màn hình `Nộp thuế` và mẫu kết quả ở phần nghĩa vụ/tra cứu chứng từ.

---

## Ghi chú tương tác và kỹ thuật

- Cuộn (scroll):
  - `Trang chủ` (khối danh sách dịch vụ dài) – IMG_0335.
  - `Cài đặt chức năng hay dùng` – danh sách dài, có thể cuộn (frame_0015..0020).
  - `Thông tin nghĩa vụ thuế (kết quả)` – nội dung nhiều mục (IMG_0322, IMG_0351).
  - `Thông tin chi tiết` – danh mục trường dài (IMG_0325, IMG_0350).
  - `Thông báo` – danh sách (IMG_0317, IMG_0348).

- Modal/Popup:
  - Chọn ngày (icon lịch trong `Tra cứu chứng từ`) → mở date picker hệ thống iOS (không chụp trong ảnh nhưng thể hiện qua icon lịch và bàn phím số) — IMG_0339, IMG_0340, IMG_0326.
  - `Menu chính (Drawer)` là overlay trượt từ trái (IMG_0321, IMG_0346).
  - `Xem chứng từ (PDF iOS Viewer)` mở dưới dạng trình xem hệ thống với nút `Done` (IMG_0319, IMG_0349).

- Màn hình tĩnh:
  - `Hỗ trợ`, `Hóa đơn điện tử`, `Khai thuế`, `Đăng ký thuế`, `Nhóm chức năng nộp thuế`, `Tiện ích`, `Thiết lập cá nhân` — dạng lưới danh mục, không nội dung động.

- Tương tác/logic JS đáng chú ý:
  - `Cài đặt chức năng hay dùng`: lưu trạng thái bật/tắt (toggle) cho từng tính năng, đồng bộ hiển thị ở Trang chủ (frame_0015..0020 → các icon trong khối "Chức năng hay dùng").
  - `Tra cứu chứng từ`: validate trường bắt buộc (Từ ngày, Đến ngày — dấu *) và hiển thị thông báo lỗi đỏ "Không tìm thấy dữ liệu" khi không có kết quả (IMG_0340).
  - `Tra cứu nghĩa vụ thuế`: yêu cầu `Mã số thuế` trước khi `Tra cứu`; kết quả có thể mở từng chi tiết.
  - `Trang chủ` – carousel ngang cho `Chức năng hay dùng` (có phím điều hướng trái/phải), hiệu ứng trượt.
  - `Nộp thuế`: điều hướng theo tab (Tất cả | Lệ phí trước bạ | NVTC ...), tải dữ liệu theo tab.
  - Mở PDF từ bảng `Tra cứu chứng từ`/`Chi tiết thông báo`: chọn radio "In chứng từ" hoặc chạm mã tham chiếu để mở viewer iOS.

---

## Bản đồ ảnh → màn hình (tham chiếu nhanh)

- IMG_0341 → Đăng nhập
- IMG_0320, IMG_0335, IMG_0338, frame_0001..0012 → Trang chủ
- IMG_0321, IMG_0324, IMG_0342, IMG_0346 → Menu chính (Drawer)
- IMG_0317, IMG_0348 → Thông báo; IMG_0323 → Chi tiết thông báo
- IMG_0319, IMG_0349 → Xem chứng từ (PDF iOS Viewer)
- IMG_0336 → Tra cứu nghĩa vụ thuế (chọn nhóm)
- IMG_0337 → Thông tin nghĩa vụ thuế (form); IMG_0322, IMG_0351 → Thông tin nghĩa vụ thuế (kết quả)
- IMG_0325, IMG_0350 → Thông tin chi tiết
- IMG_0330 → Nhóm chức năng nộp thuế
- IMG_0339, IMG_0340, IMG_0326, frame_0025 → Tra cứu chứng từ (+ kết quả)
- IMG_0344 → Nộp thuế
- IMG_0343 → Khai thuế; IMG_0334 → Mẫu số 01/CNKD
- IMG_0333 → Hóa đơn điện tử
- IMG_0331 → Hỗ trợ quyết toán thuế TNCN
- IMG_0332 → Tiện ích
- IMG_0328 → Thiết lập cá nhân; IMG_0329 → Thông tin tài khoản
- frame_0015..0020 → Cài đặt chức năng hay dùng

---

## Ghi chú thực thi luồng

- Từ `Đăng nhập` → `Trang chủ` là luồng mặc định sau xác thực.
- Hầu hết tính năng có thể truy cập theo 2 đường: từ Grid `Trang chủ` hoặc từ `Menu chính (Drawer)`.
- Các luồng in/xem chứng từ xuất hiện ở 2 nơi: `Tra cứu chứng từ` (chọn In) và `Chi tiết thông báo` (chạm mã tham chiếu).

---

Nếu cần, có thể sinh ảnh sơ đồ từ Mermaid (hoặc chuyển sang PlantUML) để nhúng vào tài liệu/presentation.

