# 🎯 HƯỚNG DẪN SỬ DỤNG CHO ANH NGHĨA

## 📚 GIẢI THÍCH ĐƠN GIẢN: FIREBASE VS VERCEL

### 🏢 Firebase (Database + Authentication)
**Vai trò:** Lưu trữ dữ liệu

Ví dụ như:
- Tủ hồ sơ trong văn phòng
- Lưu: Users, MST, Passwords, Profiles...
- Firebase = Nơi lưu dữ liệu

**Cần làm:**
1. Tạo tài khoản Firebase tại: https://console.firebase.google.com
2. Tạo project mới (hoặc dùng project hiện tại)
3. Copy Service Account Key (file JSON) vào file `.env.local`

---

### 🌐 Vercel (Hosting Website)
**Vai trò:** Chạy website của anh

Ví dụ như:
- Nhà kho chứa code
- Khi người dùng truy cập → Vercel chạy code → Code đọc/ghi dữ liệu từ Firebase

**Cần làm:**
1. Đẩy code lên GitHub
2. Kết nối GitHub với Vercel
3. Vercel tự động deploy

---

## 🔄 LUỒNG HOẠT ĐỘNG

```
1. Anh truy cập website (hosted trên Vercel)
   ↓
2. Website đọc/ghi dữ liệu từ Firebase
   ↓
3. Dữ liệu hiển thị cho anh
```

**Tóm lại:**
- **Firebase** = Kho dữ liệu (database)
- **Vercel** = Nơi chạy website
- Website trên Vercel ↔ Đọc/ghi dữ liệu vào Firebase

---

## 🚀 CÁCH SỬ DỤNG HỆ THỐNG

### Bước 1: Đăng nhập Admin
1. Mở trình duyệt, truy cập: `https://your-domain.vercel.app/admin/login`
2. Nhập:
   - Email: `admin@etax.local`
   - Password: `admin123`
3. Click "Đăng nhập"

---

### Bước 2: Tạo User Mới với MST

1. Sau khi đăng nhập admin → Click menu "Quản lý Users"
2. Click nút "Tạo User Mới"
3. Điền form:
   - **Tên:** Tên người dùng (ví dụ: "Nguyễn Văn A")
   - **Email:** (Để trống cho user, hệ thống tự tạo email fake)
   - **Mật khẩu:** Mật khẩu cho user (ví dụ: "123456")
   - **Role:** Chọn "User"
   - **Danh sách MST:** 
     - Nhập MST (ví dụ: "00109202830")
     - Nhấn Enter hoặc click "Thêm"
     - Có thể thêm nhiều MST cho 1 user
4. Click "Tạo"

**Sau khi tạo:**
- User có thể đăng nhập bằng MST + password
- Profile tự động được tạo theo MST
- Dữ liệu được lưu vào Firebase

---

### Bước 3: User Đăng Nhập

1. User truy cập: `https://your-domain.vercel.app/login`
2. Nhập:
   - **MST:** MST đã được admin tạo (ví dụ: "00109202830")
   - **Password:** Mật khẩu admin đã set
3. Click "Đăng nhập"

**Kết quả:**
- User đăng nhập thành công
- Thông tin profile theo MST được load tự động

---

## 📝 SYNC NỘI DUNG THEO MST

Khi admin tạo user với MST:
1. ✅ User được tạo trong Firebase
2. ✅ MST được map vào `mst_to_user` collection
3. ✅ Profile tự động được tạo trong `profiles` collection

**Khi admin cập nhật profile theo MST:**
- API: `PUT /api/profiles/{mst}`
- Dữ liệu sync trực tiếp với MST đã tạo

---

## 🔧 DEPLOY LÊN VERCEL

### Cách 1: Tự động (Khuyến nghị)

1. **Đẩy code lên GitHub:**
   ```bash
   git add .
   git commit -m "Ready to deploy"
   git push origin main
   ```

2. **Kết nối với Vercel:**
   - Vào: https://vercel.com
   - Đăng nhập bằng GitHub
   - Click "New Project"
   - Chọn repo của anh
   - Vercel tự động detect Next.js

3. **Thêm Environment Variables:**
   - Vào Project Settings → Environment Variables
   - Thêm các biến từ `.env.local`:
     - `FIREBASE_SERVICE_ACCOUNT_BASE64` (hoặc KEY)
     - `FIREBASE_STORAGE_BUCKET`
     - `COOKIE_SECRET`
     - `UPSTASH_REDIS_REST_URL` (nếu dùng rate limit)
     - `UPSTASH_REDIS_REST_TOKEN`

4. **Deploy:**
   - Click "Deploy"
   - Vercel tự động build và deploy
   - Xong! Website chạy tại: `https://your-project.vercel.app`

---

### Cách 2: Deploy thủ công

```bash
# Build project
npm run build

# Deploy lên Vercel
npx vercel

# Hoặc nếu đã có Vercel CLI
vercel --prod
```

---

## 🗄️ DEPLOY LÊN FIREBASE

**Lưu ý:** Firebase ở đây chỉ để **lưu dữ liệu** (Firestore), không phải để host website.

**Đã cấu hình sẵn:**
- Firestore Database đã được setup
- Firebase Authentication đã được cấu hình
- Service Account đã được thêm vào env

**Không cần deploy gì thêm!** Firebase chỉ cần:
1. Project đã tạo
2. Firestore Database đã được enable
3. Service Account Key đã được thêm vào env

---

## ✅ CHECKLIST TRƯỚC KHI SỬ DỤNG

- [ ] Firebase project đã tạo
- [ ] Firestore Database đã enable
- [ ] Firebase Authentication đã enable (Email/Password)
- [ ] Service Account Key đã được thêm vào `.env.local` (local) và Vercel Environment Variables (production)
- [ ] Code đã được push lên GitHub
- [ ] Vercel project đã được kết nối với GitHub repo
- [ ] Environment Variables đã được thêm vào Vercel
- [ ] Website đã deploy thành công trên Vercel

---

## 🆘 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "Firebase Admin chưa được khởi tạo"
**Nguyên nhân:** Thiếu Service Account Key

**Giải pháp:**
1. Kiểm tra file `.env.local` có đủ biến `FIREBASE_SERVICE_ACCOUNT_*`
2. Kiểm tra Vercel Environment Variables đã thêm chưa

---

### Lỗi: "Email đã tồn tại"
**Nguyên nhân:** User với email này đã được tạo

**Giải pháp:**
- Đổi email khác
- Hoặc tìm user cũ để edit

---

### Lỗi: "MST đã được sử dụng"
**Nguyên nhân:** MST này đã được gán cho user khác

**Giải pháp:**
- Dùng MST khác
- Hoặc xóa user cũ có MST này

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. Console log trong browser (F12)
2. Vercel Deployment Logs
3. Firebase Console → Firestore → Xem data có được tạo không

---

**Tóm lại:**
- Firebase = Kho dữ liệu (không cần deploy)
- Vercel = Nơi chạy website (cần deploy)
- Admin tạo user với MST → User login bằng MST + password
- Profile tự động sync theo MST
