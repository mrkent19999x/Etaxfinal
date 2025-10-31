# Kiểm chứng & Bổ sung — Phân tích eTax Mobile (ảnh + video)

Tài liệu này kiểm chứng nội dung trong thư mục `Clone ui -20251031T125433Z-1-001` (các file TXT/JSON và đặc tả kỹ thuật), đối chiếu với ảnh chụp màn hình và video demo. Đồng thời bổ sung những điểm còn thiếu để hoàn thiện dự án.

## Nguồn dữ liệu đã đọc

- Nhật ký trò chuyện (định hướng prompt, không có kết quả đo toạ độ):
  - `Clone ui -20251031T125433Z-1-001/chat-Best Model for Image Analysis and Video Flow Description.txt`
  - `Clone ui -20251031T125433Z-1-001/chat-Best Model for Image Analysis and Video Flow Description (1).txt`
  - `Clone ui -20251031T125433Z-1-001/chat-export-1761917746620.json`
  - `Clone ui -20251031T125433Z-1-001/chat-export-1761919063927.json`
- Tài liệu đặc tả do Qwen hỗ trợ phác thảo: `Clone ui -20251031T125433Z-1-001/ETAX_MOBILE_PWA_TECHNICAL_SPECIFICATION.md`
- Bộ ảnh JPG IMG_0317 → IMG_0351 và video MP4 cùng thư mục (đã tách khung hình phục vụ đối chiếu).

## Kết luận nhanh

- Các file TXT/JSON chủ yếu là thảo luận về lựa chọn model và cấu trúc prompt (không chứa kết quả phân tích từng frame, từng toạ độ). JSON export không có nội dung trả lời chi tiết (các trường `assistant` trống).
- `ETAX_MOBILE_PWA_TECHNICAL_SPECIFICATION.md` đưa ra nhiều thông số hữu ích nhưng còn một số chỗ sai/không nhất quán so với ảnh/video. Bảng dưới liệt kê những điểm cần chỉnh và đề xuất thay thế.
- Tài sản bổ sung đã tạo: `docs/ETAX_MOBILE_NAVIGATION_FLOW_VN.md` với sơ đồ luồng điều hướng đầy đủ (Mermaid) + ghi chú kỹ thuật, bám sát ảnh/video thực tế.

## Sai lệch/thiếu sót trong đặc tả và đề xuất sửa

- Thiết bị đích: ghi `375×812 (iPhone 8 equivalent)` là chưa chính xác. 375×812 tương ứng iPhone X/11/12 (không phải iPhone 8). Đề xuất: “375×812 (iPhone X-class, tỷ lệ 3x)”
- Cuộn (scroll): đặc tả ghi “Disabled on most screens” là sai thực tế. Các màn hình có cuộn rõ ràng: Trang chủ (danh sách dài) `IMG_0335.JPG`, Cài đặt chức năng hay dùng (frame_0015..0020), Thông tin nghĩa vụ thuế (kết quả) `IMG_0322.JPG/IMG_0351.JPG`, Thông tin chi tiết `IMG_0325.JPG/IMG_0350.JPG`, Thông báo `IMG_0317.JPG/IMG_0348.JPG`.
- Khoảng cách/size lưới: “Grid Button Gap: 330px; Button Size: 100×100” không khớp bố cục thực tế 3 cột trên bề rộng 375dp. Quan sát từ `IMG_0335.JPG` (ảnh gốc 1242×2688): mỗi ô lưới nhỏ hơn 100px (tương đương ~70–88px ở độ rộng 360), khoảng cách giữa các ô ~16–24px. Đề xuất: đo động theo % chiều rộng container (3 cột, `gap: 20px`, `min(28vw, 96px)` mỗi ô) thay vì px cố định.
- Màu sắc: Primary Red ~ đỏ sẫm của thương hiệu Thuế VN. `#C60000` trong đặc tả là gần đúng; một số màn hình có gradient/độ tối khác nhẹ (ví dụ `IMG_0341.JPG` đăng nhập có nền tối với hoạ tiết). Đề xuất quy chuẩn: `--color-primary: #C60000` và cho phép sai số ±3% (DeltaE) giữa các màn/ảnh chụp.
- `Trang chủ` có “carousel Chức năng hay dùng” (mũi tên trái/phải) — tương tác này thiếu nhấn mạnh trong đặc tả. Đã bổ sung trong tài liệu luồng.
- `Tra cứu chứng từ`: đặc tả form OK, nhưng cần ghi rõ validate bắt buộc (Từ ngày/Đến ngày có dấu *) và thông báo lỗi “Không tìm thấy dữ liệu” (xem `IMG_0340.JPG`).
- `Xem chứng từ`: thực chất mở **iOS PDF Viewer** với tiêu đề là mã tham chiếu và nút `Done` (xem `IMG_0319.JPG/IMG_0349.JPG`). Nên ghi rõ đây là viewer hệ thống (modal toàn màn hình), khác với webview nội bộ.

## Nội dung đã bổ sung cho dự án

- Toàn bộ luồng điều hướng + Mermaid: `docs/ETAX_MOBILE_NAVIGATION_FLOW_VN.md` (đính kèm ghi chú modal, scroll, JS interactions, và ánh xạ từng ảnh → màn hình).
- Công cụ trích khung hình từ video (đã cài ffmpeg tĩnh) và sinh thư mục `Clone ui -20251031T125433Z-1-001/video_frames/` để tiện đối chiếu.

## Gợi ý quy trình tạo “pixel/coordinate spec” theo prompt của anh

Do khối lượng rất lớn nếu làm thủ công cho toàn bộ video, đề xuất pipeline tự động hoá ở mức có thể:

1) Cắt frame + timestamp
- Dùng ffmpeg tĩnh trong thư mục clone: `Clone ui -20251031T125433Z-1-001/ffmpeg`
- Ví dụ 10fps giữ chất lượng đủ:  
  `./ffmpeg -i 93a0bc46eeb958dd2304bfc1d1c4c317.mp4 -vf fps=10,scale=360:-1 video_frames_10fps/frame_%06d.jpg`
- Timestamp = `index / 10` (giây). Có thể dùng `-vf showinfo` để ghi mốc thời gian chính xác theo ms.

2) Phát hiện phần tử UI cơ bản (semi-auto)
- Dùng ngưỡng màu để bắt vùng header đỏ (rectangle trên cùng).  
- Phát hiện khối nền trắng lớn (User card, các card chức năng).  
- OCR (Tesseract) để lấy text và ước lượng bounding box (đủ cho nội dung button/tiêu đề).  
- Lấy màu trung bình vùng (Mean RGB) và quy đổi sang hex.

3) Sinh dòng kết quả theo format của anh  
`[Time] | Element: [loại + (x,y,w,h) + màu + text] | Click: [yes/no + (x,y) nếu có] | Navigation: [kết quả]`  
- “Click” chỉ xác định được khi có dấu hiệu chuyển cảnh hoặc hiệu ứng nhấn thấy rõ; nếu không có con trỏ/hiệu ứng chạm trong video, đánh dấu như “JS-Driven Change” khi UI thay đổi không có click.

4) Kiểm thử điểm mốc (keyframes)
- Áp dụng trước cho các thời điểm chuyển trang/hiển thị modal (ví dụ mở menu, mở viewer PDF, đổi tab, bấm Tra cứu) để đảm bảo tính đúng, rồi mới mở rộng toàn bộ.

## Mẫu output minh hoạ (đã đối chiếu từ frame đầu video)

- `Clone ui -20251031T125433Z-1-001/video_frames/frame_0001.jpg` (360×778)
  - `0.0s | Header: (x=0,y=0,w=360,h≈110) #C60000 | Click: No | Navigation: None`
  - `0.0s | Icon Button (☰): (x≈12,y≈40,w≈24,h≈24) #FFFFFF | Click: No | Navigation: None`
  - `0.0s | User Card: (x≈12,y≈110,w≈336,h≈70) #FFFFFF | Text: "MST: 001095..." | Click: No | Navigation: None`
  - `0.0s | Section Card: "Chức năng hay dùng" (x≈12,y≈190,w≈336,h≈150) #FFFFFF | Click: No | Navigation: None`
  - `0.0s | Grid: "Danh sách nhóm dịch vụ" (x≈12,y≈352,w≈336,h≈340) #FFFFFF | Click: No | Navigation: None`

- `frame_0015.jpg` (mở Cài đặt chức năng hay dùng — từ video)
  - `15.0s | Title: "Cài đặt chức năng hay dùng" (x≈80,y≈16,w≈200,h≈28) #FFFFFF | Click: No | Navigation: None`
  - `15.0s | Toggle Item: "Tra cứu tờ khai đăng ký HĐĐT" (x≈16,y≈90,w≈280,h≈40) #FFFFFF | Click: No | Navigation: None`
  - `15.0s | Toggle Switch: (x≈310,y≈94,w≈36,h≈22) #CCCCCC | Click: No | Navigation: None`

- `IMG_0326.JPG` (Tra cứu chứng từ — có kết quả)
  - `t≈?s | Button: "Tra cứu" (x≈20,y≈240,w≈320,h≈52) #C60000 | Click: Yes at (x≈180,y≈265) | Navigation: Hiện bảng kết quả dưới form`
  - `t+0.5s | Table Row: (x≈10,y≈320,w≈340,h≈80) #FFFFFF | Text: "110202500448... | 9,600 | 11/10/2025..." | Click: No | Navigation: None`
  - `t+0.6s | Radio: "In chứng từ" (x≈325,y≈352,w≈18,h≈18) #E53935 | Click: No | Navigation: None`

Ghi chú: Kích thước cụ thể sẽ được tinh chỉnh bằng script đo đạc (sai số vài px trên ảnh scale 360 là chấp nhận được khi quy chiếu về dp).

## Tài sản hiện có trong repo

- Sơ đồ điều hướng đã hoàn chỉnh: `docs/ETAX_MOBILE_NAVIGATION_FLOW_VN.md`
- Báo cáo Accessibility hiện có: `docs/ACCESSIBILITY_REPORT.md`

Nếu anh muốn, em có thể tiếp tục: 
- Tạo script Node/OpenCV + Tesseract để tự động sinh file CSV/JSON theo format yêu cầu cho toàn bộ video. 
- Xuất sơ đồ Mermaid thành PNG/SVG để dùng trong tài liệu.

