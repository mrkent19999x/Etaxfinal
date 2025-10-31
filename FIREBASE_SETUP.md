# Hướng dẫn setup Firebase

## Bước 1: Lấy thông tin Firebase Config

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn project của anh (hoặc tạo project mới)
3. Vào **Project Settings** (⚙️) > **General** > scroll xuống phần **Your apps**
4. Click vào biểu tượng **Web** (</>) để thêm web app (hoặc copy config nếu đã có)
5. Copy các giá trị:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Bước 2: Tạo file .env.local

Tạo file `.env.local` trong thư mục root (cạnh `package.json`) với nội dung:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
# Cách 1: Dùng file JSON service account (khuyến nghị cho local)
FIREBASE_SERVICE_ACCOUNT_PATH=./anhbao-373f3-firebase-adminsdk-fbsvc-6b02fed25c.json

# Cách 2: Hoặc dán JSON key trực tiếp (bỏ comment dưới)
# FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

**Lưu ý:** Thay `your_*` bằng giá trị thật từ Firebase Console.

## Bước 3: Setup Firebase Auth & Firestore

1. **Firebase Authentication:**
   - Vào **Authentication** > **Sign-in method**
   - Bật **Email/Password** provider

2. **Firestore Database:**
   - Vào **Firestore Database** > **Create database**
   - Chọn mode: **Start in test mode** (hoặc production với rules)
   - Chọn location: `asia-southeast1` (Singapore) hoặc gần nhất

3. **Firestore Security Rules:**
   - File `firestore.rules` đã có sẵn trong repo
   - Deploy rules: `firebase deploy --only firestore:rules`

## Bước 4: Cập nhật .firebaserc

Nếu project ID khác `etax-web-default`, sửa file `.firebaserc`:

```json
{
  "projects": {
    "default": "your-project-id-here"
  }
}
```

## Bước 5: Deploy lên Firebase Hosting

```bash
# Login Firebase (nếu chưa)
firebase login

# Deploy
npm run firebase:deploy
# hoặc
firebase deploy
```

## Lưu ý quan trọng:

- **KHÔNG commit** file `.env.local` hoặc file JSON service account vào git
- File `anhbao-373f3-firebase-adminsdk-*.json` đã được ignore trong `.gitignore`
- Trên Firebase Hosting, set env vars qua **Firebase Console** > **Project Settings** > **Environment Variables** (Functions/Hosting section)

