#!/usr/bin/env node
/* Export Firebase env vars for Vercel in .env format
   Usage: node tools/export-vercel-env.js
   Output: Tạo file .env.vercel trong thư mục root
*/

const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../config/anhbao-service-account.json');
const outputPath = path.join(__dirname, '../.env.vercel');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ File not found: ${serviceAccountPath}`);
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const minified = JSON.stringify(serviceAccount);
  
  // Tạo nội dung file .env.vercel
  const envContent = [
    `# Firebase Environment Variables for Vercel`,
    `# File này được tạo tự động bởi: node tools/export-vercel-env.js`,
    `#`,
    `# CÁCH DÙNG:`,
    `# 1. Mở file này và thay các dòng có chữ "THAY_BANG_GIA_TRI_THAT" bằng giá trị từ Firebase Console`,
    `# 2. Copy TOÀN BỘ nội dung file này (Ctrl+A, Ctrl+C)`,
    `# 3. Vào Vercel → Settings → Environment Variables`,
    `# 4. Scroll xuống phần "Import .env"`,
    `# 5. Paste toàn bộ vào textarea và click "Import"`,
    `# 6. Kiểm tra tất cả biến đã được thêm`,
    `# 7. Chọn Environment cho từng biến (Production, Preview, Development)`,
    `# 8. Click Save`,
    ``,
    `# ============================================`,
    `# FIREBASE ADMIN SDK (Backend)`,
    `# ============================================`,
    `FIREBASE_SERVICE_ACCOUNT_KEY=${minified}`,
    `FIREBASE_STORAGE_BUCKET=anhbao-373f3.appspot.com`,
    ``,
    `# ============================================`,
    `# FIREBASE CLIENT CONFIG (Frontend)`,
    `# ============================================`,
    `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=anhbao-373f3.firebaseapp.com`,
    `NEXT_PUBLIC_FIREBASE_PROJECT_ID=anhbao-373f3`,
    `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=anhbao-373f3.appspot.com`,
    ``,
    `# ============================================`,
    `# CÁC BIẾN SAU CẦN LẤY TỪ FIREBASE CONSOLE:`,
    `# 1. Vào https://console.firebase.google.com`,
    `# 2. Chọn project: anhbao-373f3`,
    `# 3. Vào ⚙️ Project Settings → General`,
    `# 4. Scroll xuống phần "Your apps"`,
    `# 5. Click vào biểu tượng Web (</>)`,
    `# 6. Copy các giá trị: apiKey, messagingSenderId, appId`,
    `# ============================================`,
    `NEXT_PUBLIC_FIREBASE_API_KEY=THAY_BANG_GIA_TRI_THAT`,
    `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=THAY_BANG_GIA_TRI_THAT`,
    `NEXT_PUBLIC_FIREBASE_APP_ID=THAY_BANG_GIA_TRI_THAT`,
    ``,
  ].join('\n');
  
  // Ghi file
  fs.writeFileSync(outputPath, envContent, 'utf8');
  
  console.log('\n✅ ĐÃ TẠO FILE .env.vercel THÀNH CÔNG!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 File location: ${outputPath}`);
  console.log('\n📋 CÁC BƯỚC TIẾP THEO:');
  console.log('   1️⃣  Mở file .env.vercel vừa tạo');
  console.log('   2️⃣  Tìm 3 dòng có chữ "THAY_BANG_GIA_TRI_THAT"');
  console.log('   3️⃣  Lấy giá trị từ Firebase Console (hướng dẫn trong file)');
  console.log('   4️⃣  Thay "THAY_BANG_GIA_TRI_THAT" bằng giá trị thật');
  console.log('   5️⃣  Copy TOÀN BỘ file (Ctrl+A, Ctrl+C)');
  console.log('   6️⃣  Paste vào Vercel → Settings → Environment Variables → Import .env');
  console.log('   7️⃣  Click Import → Chọn Environment → Save\n');
  
  // In ra console để anh biết file đã được tạo
  console.log('📄 Nội dung file (5 dòng đầu):');
  const lines = envContent.split('\n');
  lines.slice(0, 10).forEach((line, i) => {
    if (line.includes('THAY_BANG_GIA_TRI_THAT')) {
      console.log(`   ${i + 1}. ${line.substring(0, 60)}... ⚠️  CẦN THAY`);
    } else {
      console.log(`   ${i + 1}. ${line.substring(0, 80)}`);
    }
  });
  console.log('   ... (xem file .env.vercel để biết đầy đủ)\n');
  
} catch (error) {
  console.error('❌ Lỗi:', error.message);
  process.exit(1);
}

