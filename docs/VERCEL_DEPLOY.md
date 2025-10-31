# Hướng dẫn Deploy lên Vercel

## Tổng quan

Hướng dẫn này sẽ giúp anh deploy Next.js app lên Vercel với cấu hình Firebase đầy đủ.

**Lợi ích của Vercel:**
- Hỗ trợ Next.js 16 SSR tốt hơn Firebase Hosting
- Free tier đủ dùng cho project này
- Không cần upgrade plan như Firebase Blaze
- Auto deploy từ GitHub
- Setup đơn giản

---

## Bước 1: Chuẩn bị Service Account JSON

Chạy script để format service account JSON thành 1 dòng:

```bash
node tools/format-service-account.js
```

Script sẽ in ra JSON minified trên 1 dòng. **Copy toàn bộ dòng đó** (từ `{` đến `}`) để dùng ở bước sau.

**Lưu ý:** Copy đầy đủ, không bỏ sót ký tự nào.

---

## Bước 2: Tạo Project trên Vercel

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)

2. Click **Add New** → **Project**

3. Import từ GitHub:
   - Chọn repository: `mrkent19999x/Etaxfinal` (hoặc repo của anh)
   - Framework Preset: **Next.js** (Vercel sẽ tự detect)
   - Root Directory: `.` (để trống hoặc nhập `.`)

4. Click **Deploy** (chưa cần thêm env vars ngay, sẽ thêm sau)

---

## Bước 3: Thêm Environment Variables

Sau khi project được tạo, vào **Settings** → **Environment Variables**

### Danh sách biến cần thêm:

#### 1. Firebase Admin SDK

**Variable:** `FIREBASE_SERVICE_ACCOUNT_KEY`

**Value:** Dán toàn bộ JSON từ Bước 1 (1 dòng, không xuống dòng)

```
{"type":"service_account","project_id":"anhbao-373f3",...}
```

**Lưu ý:** 
- Phải là JSON hợp lệ trên 1 dòng
- Không có line breaks
- Đảm bảo copy đầy đủ từ `{` đến `}`

---

**Variable:** `FIREBASE_STORAGE_BUCKET`

**Value:** 
```
anhbao-373f3.appspot.com
```

**Mục đích:** Storage bucket cho Firebase Admin SDK (upload PDF, etc.)

---

#### 2. Firebase Client Config

**Variable:** `NEXT_PUBLIC_FIREBASE_API_KEY`

**Value:** Lấy từ Firebase Console → Project Settings → General → Your apps → Web app → `apiKey`

**Ví dụ:**
```
AIzaSyCQ7R-GyZjSY_iPQ1iooF_uFOa35gViM18
```

---

**Variable:** `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`

**Value:**
```
anhbao-373f3.firebaseapp.com
```

---

**Variable:** `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

**Value:**
```
anhbao-373f3
```

---

**Variable:** `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

**Value:**
```
anhbao-373f3.appspot.com
```

---

**Variable:** `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

**Value:** Lấy từ Firebase Console → Project Settings → General → Your apps → Web app → `messagingSenderId`

**Ví dụ:**
```
599456783339
```

---

**Variable:** `NEXT_PUBLIC_FIREBASE_APP_ID`

**Value:** Lấy từ Firebase Console → Project Settings → General → Your apps → Web app → `appId`

**Ví dụ:**
```
1:599456783339:web:cd57a672317cfaf2d617ae
```

---

### Cách thêm từng biến:

1. Click **Add New** trong Environment Variables
2. **Key:** Nhập tên biến (ví dụ: `FIREBASE_SERVICE_ACCOUNT_KEY`)
3. **Value:** Paste giá trị
4. **Environment:** Chọn cả 3:
   - ☑ Production
   - ☑ Preview  
   - ☑ Development
5. Click **Save**

**Lặp lại cho tất cả 7 biến ở trên.**

---

## Bước 4: Redeploy để áp dụng Environment Variables

Sau khi thêm xong tất cả env vars:

1. Vào tab **Deployments**
2. Click vào deployment mới nhất
3. Click **Redeploy** (hoặc vào **Settings** → **General** → trigger redeploy)

Vercel sẽ build lại với env vars mới.

---

## Bước 5: Kiểm tra Deploy

### Kiểm tra build logs:

1. Vào tab **Deployments**
2. Click vào deployment đang chạy
3. Xem **Build Logs** để đảm bảo:
   - ✓ Build thành công
   - ✓ Không có lỗi environment variables
   - ✓ TypeScript compilation OK

### Kiểm tra ứng dụng:

Sau khi deploy xong, click vào **Visit** để mở URL production.

---

## Bước 6: Test các Route Quan Trọng

Kiểm tra các chức năng chính sau khi deploy:

### 1. Admin Authentication
**URL:** `https://your-app.vercel.app/admin/login`

**Kiểm tra:**
- [ ] Trang login hiển thị
- [ ] Có thể đăng nhập với tài khoản admin
- [ ] Sau khi login, redirect đúng

---

### 2. PDF Template Management
**URL:** `https://your-app.vercel.app/admin/templates`

**Kiểm tra:**
- [ ] Trang templates load được
- [ ] Có thể upload PDF template
- [ ] Có thể khai báo fields cho template

---

### 3. PDF Document Generation
**URL:** `https://your-app.vercel.app/admin/documents/create`

**Kiểm tra:**
- [ ] Trang tạo document hiển thị
- [ ] Có thể chọn template
- [ ] Có thể điền form data
- [ ] Generate PDF thành công
- [ ] Link PDF hiển thị và download được

---

### 4. User Document Lookup
**URL:** `https://your-app.vercel.app/tra-cuu-chung-tu`

**Kiểm tra:**
- [ ] Trang load được (cần đăng nhập user)
- [ ] Hiển thị danh sách documents từ Firestore
- [ ] Có thể xem chi tiết document

---

### 5. Notifications
**URL:** `https://your-app.vercel.app/thong-bao`

**Kiểm tra:**
- [ ] Trang notifications load được
- [ ] Hiển thị danh sách notifications từ Firestore
- [ ] Có thể xem chi tiết notification

---

## Troubleshooting

### Lỗi: "Firebase Admin chưa được khởi tạo"

**Nguyên nhân:** `FIREBASE_SERVICE_ACCOUNT_KEY` không đúng format hoặc thiếu.

**Cách fix:**
1. Kiểm tra lại giá trị trong Vercel Environment Variables
2. Đảm bảo JSON là 1 dòng, không có line breaks
3. Chạy lại script `node tools/format-service-account.js` để lấy JSON đúng
4. Redeploy

---

### Lỗi: "Cannot read property of undefined" ở client-side

**Nguyên nhân:** Thiếu biến `NEXT_PUBLIC_FIREBASE_*`

**Cách fix:**
1. Kiểm tra đã thêm đủ 6 biến `NEXT_PUBLIC_FIREBASE_*` chưa
2. Đảm bảo giá trị đúng từ Firebase Console
3. Redeploy

---

### Lỗi: "Module not found" hoặc build failed

**Nguyên nhân:** Có thể thiếu dependencies hoặc lỗi TypeScript

**Cách fix:**
1. Check build logs trong Vercel
2. Chạy `npm run build` local để xem lỗi cụ thể
3. Fix lỗi và push lại code

---

### Build thành công nhưng app không hoạt động

**Nguyên nhân:** Có thể do env vars chưa được apply đúng environment

**Cách fix:**
1. Kiểm tra env vars đã check cả 3 environments (Production/Preview/Development) chưa
2. Redeploy deployment mới nhất

---

## Checklist Cuối Cùng

Sau khi deploy, đảm bảo:

- [ ] Tất cả 7 environment variables đã được thêm
- [ ] Build logs không có lỗi
- [ ] `/admin/login` hoạt động
- [ ] `/admin/templates` có thể upload template
- [ ] `/admin/documents/create` generate PDF được
- [ ] `/tra-cuu-chung-tu` hiển thị documents
- [ ] `/thong-bao` hiển thị notifications

---

## Lưu ý Quan Trọng

1. **Service Account JSON:** Không commit file JSON vào GitHub. Chỉ dùng script để format và paste vào Vercel.

2. **Environment Variables:** Tất cả biến `NEXT_PUBLIC_*` sẽ được expose ra client-side. Không đặt thông tin nhạy cảm vào đó.

3. **Auto Deploy:** Sau khi setup xong, mỗi khi push code lên GitHub → Vercel sẽ tự động deploy.

4. **Custom Domain:** Có thể thêm custom domain trong Vercel Settings → Domains (nếu cần).

---

## Hỗ trợ

Nếu gặp vấn đề, check:
- Build logs trong Vercel Dashboard
- Console logs trong browser (F12)
- Firebase Console để xem Firestore/Storage có data chưa

---

**Chúc anh deploy thành công! 🚀**

