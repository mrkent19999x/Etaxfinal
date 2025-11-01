# 🎯 PLAN: Fix Fullscreen PWA cho iPhone 17 (10-2025)

## 📊 PHÂN TÍCH HIỆN TRẠNG

### Vấn đề:
- PWA không fullscreen trên iPhone 17
- Vẫn còn khoảng trống/màn hình xanh ở dưới
- Trang login bị scroll (không muốn scroll)

### Root Cause (Sau khi investigate):
1. **CSS Selector chưa đủ mạnh**: `body:has(.phone-frame)` có thể không override hết các style từ Tailwind/Next.js
2. **HTML element chưa được override**: Chỉ override `body`, chưa override `html`
3. **Safe-area-inset-bottom vẫn còn**: Có thể còn được apply ở chỗ khác
4. **Viewport meta có thể bị override**: Next.js có thể inject thêm style

---

## 💡 SOLUTION: Override CSS Mạnh Hơn + HTML Element

### Strategy:
1. **Override cả `html` và `body`** khi có `.phone-frame`
2. **Dùng `!important` cho TẤT CẢ properties** liên quan đến fullscreen
3. **Thêm CSS cho `html`** (hiện tại chỉ có `body`)
4. **Remove ALL safe-area-inset-bottom** từ mọi nơi
5. **Force position: fixed** cho cả html và body

---

## 🔧 CODE FIXES

### File 1: `src/app/globals.css`

**Vị trí**: Sau dòng 254 (sau `body:has(.phone-frame)`)

**Thêm CSS mới cho `html`**:

```css
/* Override HTML element khi có phone-frame - FULLSCREEN TRIỆT ĐỂ */
html:has(.phone-frame) {
  overflow: hidden !important;
  height: 100svh !important;
  min-height: 100svh !important;
  max-height: 100svh !important;
  position: fixed !important;
  width: 100% !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  padding: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin: 0 !important;
  overscroll-behavior: none !important;
  overscroll-behavior-y: none !important;
  overscroll-behavior-x: none !important;
  -webkit-overflow-scrolling: none !important;
  -webkit-overscroll-behavior: none !important;
  -webkit-overscroll-behavior-y: none !important;
  -webkit-overscroll-behavior-x: none !important;
  touch-action: none !important;
  -webkit-touch-callout: none !important;
  -webkit-user-drag: none !important;
  background: #103b90 !important;
}

/* Strengthen body override - đảm bảo không có gap */
body:has(.phone-frame) {
  overflow: hidden !important;
  height: 100svh !important;
  min-height: 100svh !important;
  max-height: 100svh !important;
  position: fixed !important;
  width: 100% !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  padding: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important; /* QUAN TRỌNG: Bỏ safe-area-inset-bottom */
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin: 0 !important;
  overscroll-behavior: none !important;
  overscroll-behavior-y: none !important;
  overscroll-behavior-x: none !important;
  -webkit-overflow-scrolling: none !important;
  -webkit-overscroll-behavior: none !important;
  -webkit-overscroll-behavior-y: none !important;
  -webkit-overscroll-behavior-x: none !important;
  touch-action: none !important;
  -webkit-touch-callout: none !important;
  -webkit-user-drag: none !important;
  background: #103b90 !important;
  /* THÊM: Force remove safe-area từ body */
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}

/* Override cả html và body cùng lúc - DOUBLE LAYER */
html:has(.phone-frame),
body:has(.phone-frame) {
  /* Force fullscreen - không còn cách nào escape được */
  box-sizing: border-box !important;
  -webkit-box-sizing: border-box !important;
  -moz-box-sizing: border-box !important;
}
```

### File 2: `src/app/layout.tsx`

**Kiểm tra**: Đảm bảo viewport config đúng:

```typescript
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // ✅ Đã có
  themeColor: "#cc0000",
  interactiveWidget: "resizes-content",
}
```

**✅ Đã đúng rồi, không cần sửa.**

---

## 📋 CHECKLIST TEST TRÊN IPHONE 17

### 🔴 CRITICAL CHECKS (Phải pass 100%)

#### 1. **PWA Installation & Launch**
- [ ] Mở Safari trên iPhone 17
- [ ] Navigate đến `http://192.168.1.176:3000/login`
- [ ] Tap nút "Share" (hộp với mũi tên)
- [ ] Chọn "Add to Home Screen"
- [ ] Đặt tên app (nếu cần)
- [ ] Tap "Add"
- [ ] **VERIFY**: Icon xuất hiện trên home screen
- [ ] Tap icon để mở app
- [ ] **VERIFY**: App mở fullscreen (KHÔNG có address bar, KHÔNG có toolbar Safari)
- [ ] **VERIFY**: App KHÔNG có khoảng trống xanh ở dưới
- [ ] **VERIFY**: App phủ kín toàn bộ màn hình (kể cả phần dưới)

#### 2. **Viewport & Layout**
- [ ] **VERIFY**: Trang login KHÔNG scroll được (scroll bị khóa hoàn toàn)
- [ ] **VERIFY**: Logo ở giữa màn hình (vị trí cố định, không di chuyển)
- [ ] **VERIFY**: Bottom navigation bar (4 icons) nằm sát đáy màn hình
- [ ] **VERIFY**: KHÔNG có khoảng trống giữa bottom nav và đáy màn hình
- [ ] **VERIFY**: KHÔNG có "blue strip" (màn hình xanh) ở dưới
- [ ] **VERIFY**: App background phủ kín từ trên xuống dưới

#### 3. **Safe Area Handling**
- [ ] **VERIFY**: Nếu iPhone có notch, header có padding-top đúng (safe-area-inset-top)
- [ ] **VERIFY**: Bottom navigation KHÔNG có padding-bottom từ safe-area
- [ ] **VERIFY**: Content KHÔNG bị che bởi notch/home indicator
- [ ] **VERIFY**: Bottom nav KHÔNG bị che bởi home indicator (nếu có)

#### 4. **Orientation & Keyboard**
- [ ] Xoay ngang màn hình (landscape)
- [ ] **VERIFY**: App vẫn fullscreen (không có address bar)
- [ ] Xoay dọc lại (portrait)
- [ ] **VERIFY**: App vẫn fullscreen
- [ ] Tap vào input field (nếu có)
- [ ] **VERIFY**: Keyboard hiện lên, app resize đúng
- [ ] **VERIFY**: Bottom nav vẫn visible (không bị che bởi keyboard)
- [ ] Đóng keyboard
- [ ] **VERIFY**: App trở về fullscreen

#### 5. **Scroll Prevention**
- [ ] **VERIFY**: Không thể scroll trang login bằng cách vuốt lên/xuống
- [ ] **VERIFY**: Không có "rubber band effect" (iOS bounce scroll)
- [ ] **VERIFY**: Không có "pull to refresh" gesture
- [ ] **VERIFY**: Logo không di chuyển khi vuốt

### 🟡 IMPORTANT CHECKS (Nên pass)

#### 6. **Performance**
- [ ] App load nhanh (< 3 giây)
- [ ] Không có lag khi navigate
- [ ] Smooth animations

#### 7. **Visual Consistency**
- [ ] Màu sắc đúng với design
- [ ] Spacing giữa các elements đúng
- [ ] Font size đúng
- [ ] Icons hiển thị đúng size

### 🔵 NICE TO HAVE (Optional)

#### 8. **Edge Cases**
- [ ] Test với iPhone có notch (Pro models)
- [ ] Test với iPhone không có notch (SE, older models)
- [ ] Test với iOS version mới nhất
- [ ] Test sau khi restart iPhone
- [ ] Test khi có notification xuất hiện

---

## 🔍 DEBUGGING STEPS (Nếu vẫn không fullscreen)

### Bước 1: Check Console
1. Mở app từ home screen
2. Connect iPhone vào Mac
3. Mở Safari > Develop > [iPhone name] > [App name]
4. Check Console có error không
5. Check Network tab: `manifest.json` load đúng không?

### Bước 2: Check Viewport Meta
1. Trong Safari DevTools, View Source
2. Tìm `<meta name="viewport" ...>`
3. **VERIFY**: `viewport-fit=cover` có trong tag không?
4. **VERIFY**: `user-scalable=no` có trong tag không?

### Bước 3: Check CSS Applied
1. Trong Safari DevTools, Elements tab
2. Select `<html>` element
3. Check Computed styles:
   - `height` = `XXXpx` (phải = màn hình height)
   - `overflow` = `hidden`
   - `position` = `fixed`
   - `padding-bottom` = `0px`
4. Select `<body>` element
5. Check tương tự

### Bước 4: Check Manifest
1. Trong Safari DevTools, Application tab
2. Check Manifest:
   - `display` = `"standalone"` hoặc `"fullscreen"`
   - `display_override` có `"fullscreen"` không?
   - `start_url` = `"/"` hoặc `"/login"`
   - `scope` = `"/"`

### Bước 5: Hard Refresh
1. Xóa app khỏi home screen
2. Clear Safari cache
3. Rebuild và restart dev server
4. Add to home screen lại
5. Test lại

---

## ✅ SUCCESS CRITERIA

App được coi là **FULLSCREEN** khi:
1. ✅ Không có address bar Safari
2. ✅ Không có toolbar Safari
3. ✅ App phủ kín toàn bộ màn hình (từ trên xuống dưới)
4. ✅ KHÔNG có khoảng trống/màn hình xanh ở dưới
5. ✅ Bottom navigation nằm sát đáy màn hình
6. ✅ Trang login KHÔNG scroll được
7. ✅ Logo giữ nguyên vị trí giữa màn hình

---

## 📝 NOTES

- **iPhone 17 có thể có safe-area-inset-bottom mới**: iOS 19+ có thể có behavior khác với iOS 18
- **Test trên nhiều devices**: Nếu có thể, test trên iPhone 15, 16, 17 để so sánh
- **Document issues**: Nếu vẫn có vấn đề, chụp screenshot và note lại behavior cụ thể

---

## 🚀 NEXT STEPS SAU KHI FIX

1. Test trên iPhone 17 thật
2. Document kết quả (pass/fail từng check)
3. Nếu vẫn fail: Chụp screenshot và analyze sâu hơn
4. Consider: Có thể cần thêm JavaScript để force fullscreen programmatically
