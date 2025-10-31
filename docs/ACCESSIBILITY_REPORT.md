# 📋 BÁO CÁO KIỂM TRA ACCESSIBILITY (a11y)

**Ngày kiểm tra**: Hôm nay  
**Phạm vi**: Toàn bộ website eTax Mobile  
**Tiêu chuẩn**: WCAG 2.1 Level AA

---

## 🔴 VẤN ĐỀ NGHIÊM TRỌNG (Cần fix ngay)

### 1. **COLOR CONTRAST RATIOS** ❌

**Vấn đề**: Nhiều màu không đạt tỷ lệ tương phản tối thiểu 4.5:1 (text thường) hoặc 3:1 (text lớn)

| Vị trí | Màu chữ / Nền | Tỷ lệ ước tính | Yêu cầu | Trạng thái |
|--------|---------------|----------------|---------|------------|
| Login page | Trắng (#FFFFFF) / Nền trong suốt (white/70) | ~2.5:1 | 4.5:1 | ❌ FAIL |
| Login inputs | placeholder:text-white/70 | ~2.5:1 | 4.5:1 | ❌ FAIL |
| Header | text-white trên #8f1015 | ~4.2:1 | 4.5:1 | ⚠️ CẬN NGƯỠNG |
| Error messages | text-red-400 trên nền trắng | ~3.8:1 | 4.5:1 | ❌ FAIL |
| Sidebar links | text-gray-800 trên white | ~5.1:1 | 4.5:1 | ✅ PASS |

**Giải pháp**: 
- Tăng opacity của placeholder từ 70% lên 90%
- Kiểm tra và tăng contrast cho error messages
- Đảm bảo header text đạt 4.5:1

---

### 2. **SEMANTIC HTML** ❌

**Vấn đề**: Thiếu các thẻ semantic HTML quan trọng

| Vấn đề | Vị trí | Hậu quả |
|--------|--------|---------|
| Không có `<main>` | Tất cả pages | Screen reader không biết nội dung chính |
| Không có `<nav>` | Sidebar menu | Không nhận diện là navigation |
| Không có `<header>` | Header section | Cấu trúc không rõ ràng |
| Heading hierarchy sai | Một số pages | Screen reader hiểu sai cấu trúc |

**Ví dụ từ `page.tsx`**:
```tsx
// Hiện tại: Chỉ dùng div
<div className="etax-header">...</div>

// Nên có:
<header className="etax-header" aria-label="Header chính">
  <nav aria-label="Navigation chính">...</nav>
</header>
<main>...</main>
```

---

### 3. **THIẾU LABELS CHO INPUT** ❌

**Vấn đề**: Input fields không có `<label>` tags, chỉ dùng placeholder

**Vị trí bị ảnh hưởng**:
- `src/app/login/page.tsx` - MST và Password inputs
- `src/app/doi-mat-khau/page.tsx` - Password inputs
- Nhiều form khác

**Ví dụ**:
```tsx
// ❌ SAI - Chỉ có placeholder
<input
  type="text"
  placeholder="Mã số thuế"
  ...
/>

// ✅ ĐÚNG - Có label kèm theo
<label htmlFor="mst-input" className="sr-only">Mã số thuế</label>
<input
  id="mst-input"
  type="text"
  placeholder="Mã số thuế"
  ...
/>
```

**Hậu quả**: 
- Screen reader không đọc được tên trường
- Không đạt WCAG 2.1 Success Criteria 1.3.1 (Info and Relationships)

---

### 4. **KEYBOARD NAVIGATION** ⚠️

**Vấn đề**: 

| Vấn đề | Vị trí | Mức độ |
|--------|--------|--------|
| Input có `outline-none` không có focus ring | login/page.tsx, nhiều forms | 🔴 NGUY HIỂM |
| Không có skip links | Tất cả pages | 🟡 QUAN TRỌNG |
| Buttons không có focus states | Nhiều buttons | 🟡 QUAN TRỌNG |
| Sidebar overlay không trap focus | sidebar.tsx | 🟡 QUAN TRỌNG |

**Ví dụ nguy hiểm**:
```tsx
// ❌ NGUY HIỂM - Mất focus indicator
className="... outline-none ..."

// ✅ AN TOÀN - Có focus ring
className="... focus:outline-none focus:ring-2 focus:ring-red-600 ..."
```

---

## 🟡 VẤN ĐỀ QUAN TRỌNG (Nên fix sớm)

### 5. **ARIA LABELS THIẾU SÓT** 🟡

**Hiện trạng**: 
- Chỉ có **1** `aria-label` trong toàn bộ codebase (login page - toggle password)
- Tất cả icon buttons không có aria-label
- Decorative images không có `aria-hidden="true"`

**Danh sách buttons cần aria-label**:
- Menu button (sidebar toggle)
- Bell button (notifications)  
- QR Code button
- All icon-only buttons trong header
- Close button trong sidebar

**Ví dụ cần fix**:
```tsx
// ❌ THIẾU
<button onClick={() => setSidebarOpen(true)}>
  <Menu className="w-6 h-6" />
</button>

// ✅ ĐÚNG
<button 
  onClick={() => setSidebarOpen(true)}
  aria-label="Mở menu điều hướng"
>
  <Menu className="w-6 h-6" aria-hidden="true" />
</button>
```

---

### 6. **ALT TEXT KHÔNG ĐỦ MÔ TẢ** 🟡

**Vấn đề**: Nhiều alt text quá generic hoặc không mô tả đúng

| Alt text hiện tại | Nên thay bằng | Lý do |
|-------------------|---------------|-------|
| "Logo" | "Logo eTax Mobile - Về trang chủ" | Không rõ ràng |
| "Avatar" | "Ảnh đại diện của {tên người dùng}" | Thiếu context |
| "Navigate to account" | "Xem thông tin tài khoản" | Tiếng Việt phù hợp hơn |
| "Toggle password" | "Hiện/Ẩn mật khẩu" | Rõ ràng hơn |

---

### 7. **THIẾU ROLE ATTRIBUTES** 🟡

**Vấn đề**: Một số elements cần role attributes để screen reader hiểu đúng

- Sidebar overlay cần `role="dialog"` và `aria-modal="true"`
- Loading spinners cần `role="status"` và `aria-live="polite"`
- Error messages cần `role="alert"` và `aria-live="assertive"`

---

## 🔵 CẢI THIỆN TỐT (Nice to have)

### 8. **FOCUS MANAGEMENT** 🔵

- Thêm "Skip to main content" link
- Trap focus trong modals/sidebar
- Focus management khi navigate giữa các pages

### 9. **LANDMARKS** 🔵

- Thêm `<main>` với `id="main-content"`
- Thêm `<nav>` với `aria-label` rõ ràng
- Thêm `<header>` và `<footer>` nếu có

### 10. **FORM VALIDATION** 🔵

- Thêm `aria-invalid="true"` khi input sai
- Thêm `aria-describedby` để link error messages với inputs
- Thêm `required` attribute với `aria-required="true"`

---

## 📊 TỔNG KẾT

| Hạng mục | Trạng thái | Số lượng vấn đề |
|----------|------------|-----------------|
| Color Contrast | ❌ | 4 issues |
| Semantic HTML | ❌ | 5 issues |
| Form Labels | ❌ | 10+ inputs |
| Keyboard Nav | ⚠️ | 5 issues |
| ARIA Labels | 🟡 | 15+ buttons |
| Alt Text | 🟡 | 10+ images |
| Roles | 🟡 | 5 elements |
| **TỔNG CỘNG** | | **50+ issues** |

---

## ✅ KHUYẾN NGHỊ THỨ TỰ ƯU TIÊN

### Ưu tiên 1 - FIX NGAY (🔴)
1. Thêm labels cho tất cả inputs
2. Fix outline-none → thêm focus rings
3. Fix color contrast cho login page
4. Thêm semantic HTML tags

### Ưu tiên 2 - FIX SỚM (🟡)
5. Thêm aria-labels cho icon buttons
6. Cải thiện alt text
7. Thêm skip links
8. Thêm role attributes

### Ưu tiên 3 - CẢI THIỆN (🔵)
9. Focus management
10. Form validation với ARIA

---

## 🛠️ CÔNG CỤ KIỂM TRA

Sau khi fix, nên test bằng:
- **axe DevTools** (Browser extension)
- **WAVE** (Web Accessibility Evaluation Tool)
- **Lighthouse** (Chrome DevTools)
- **Screen reader**: NVDA (Windows) hoặc VoiceOver (Mac)
- **Keyboard only navigation**: Tab, Enter, Space, Arrow keys

---

**Người tạo báo cáo**: Cipher (AI Assistant)  
**Ngày**: Hôm nay

