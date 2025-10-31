# Hướng dẫn kiểm thử & deploy

## 1. Thiết lập Firebase

1. Lấy service account JSON (ví dụ `anhbao-373f3-firebase-adminsdk-*.json`).
2. Đặt file ở máy local (không commit). Ví dụ: `config/anhbao-service-account.json`.
3. Tạo file `.env.local` dựa trên `.env.example`:

```bash
cp .env.example .env.local
```

Sau đó sửa `.env.local`:

```env
# dùng 1 trong 2 biến bên dưới
FIREBASE_SERVICE_ACCOUNT_KEY={...Nội dung JSON...}
# FIREBASE_SERVICE_ACCOUNT_PATH=./config/anhbao-service-account.json
FIREBASE_STORAGE_BUCKET=anhbao-373f3.appspot.com
```

4. Đảm bảo đã đăng nhập Firebase CLI:

```bash
firebase login
```

5. Kiểm tra project hiện tại (đã chỉnh `.firebaserc` → `anhbao-373f3`):

```bash
firebase projects:list
firebase use
```

## 2. Chạy kiểm thử tự động

### Cài đặt

```bash
npm install
```

### Chạy dev + smoke test

```bash
npm run test:e2e:dev
```

Lệnh trên sẽ bật server dev, mở Puppeteer kiểm tra các luồng chính, ảnh chụp lưu tại thư mục `evidence/`.

## 3. Quy trình QA thủ công (gợi ý)

1. Đăng nhập admin tại `/admin/login`.
2. Vào `/admin/templates` → upload PDF blank → khai báo field.
3. Vào `/admin/documents/create` → tạo chứng từ → kiểm tra link PDF.
4. Đăng nhập user → `/tra-cuu-chung-tu` và `/thong-bao` hiển thị dữ liệu thật.
5. Vào `/admin/content`, `/admin/field-definitions` để chỉnh wording/metadata nếu cần.

## 4. Deploy Firebase Hosting

```bash
npm run build
firebase deploy
```

Ghi chú:
- `.firebaserc` đã trỏ tới project `anhbao-373f3`.
- `firebase deploy` sẽ chạy `npm run build` trước khi deploy Hosting.
