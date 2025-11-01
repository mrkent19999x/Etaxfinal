#!/usr/bin/env node
/**
 * Get Firebase Client Config từ Firebase Console hoặc CLI
 * Usage: node tools/get-firebase-config.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Getting Firebase Client Config...\n');

// Thông tin đã biết
const projectId = 'anhbao-373f3';
const authDomain = `${projectId}.firebaseapp.com`;
const storageBucket = `${projectId}.appspot.com`;
const messagingSenderId = '599456783339'; // Từ project number
const appId = '1:599456783339:web:cd57a672317cfaf2d617ae'; // Từ firebase apps:list

console.log('✅ Đã có thông tin:');
console.log(`   Project ID: ${projectId}`);
console.log(`   Auth Domain: ${authDomain}`);
console.log(`   Storage Bucket: ${storageBucket}`);
console.log(`   Messaging Sender ID: ${messagingSenderId}`);
console.log(`   App ID: ${appId}`);
console.log('');

// apiKey cần lấy từ Firebase Console
console.log('⚠️  Cần lấy apiKey từ Firebase Console:');
console.log(`   1. Vào https://console.firebase.google.com/project/${projectId}/settings/general`);
console.log('   2. Scroll xuống phần "Your apps"');
console.log('   3. Click vào Web app (anh)');
console.log('   4. Copy giá trị "apiKey"');
console.log('');

// Tạo template config
const config = {
  projectId,
  authDomain,
  storageBucket,
  messagingSenderId,
  appId,
  apiKey: 'GET_FROM_CONSOLE' // Cần thay thế
};

console.log('📋 Template config:');
console.log(JSON.stringify(config, null, 2));
console.log('');

// Kiểm tra xem có thể lấy từ web app config không
try {
  // Thử lấy web app config detail
  const output = execSync(`firebase apps:sdkconfig WEB ${appId} --project ${projectId} 2>&1`, { encoding: 'utf8' });
  if (output && !output.includes('not found') && !output.includes('error')) {
    console.log('✅ Found SDK config from Firebase CLI:');
    console.log(output);
    
    // Parse JSON nếu có
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sdkConfig = JSON.parse(jsonMatch[0]);
        if (sdkConfig.apiKey) {
          config.apiKey = sdkConfig.apiKey;
          console.log(`\n✅ Got apiKey: ${config.apiKey.substring(0, 20)}...`);
        }
      }
    } catch (e) {
      // Không parse được, cần lấy manual
    }
  }
} catch (error) {
  console.log('ℹ️  Cannot get apiKey from CLI, need manual input');
}

if (config.apiKey === 'GET_FROM_CONSOLE') {
  console.log('\n💡 Option: Enter apiKey manually');
  console.log('   Or visit Firebase Console to get it');
} else {
  console.log('\n✅ All config ready!');
  console.log(JSON.stringify(config, null, 2));
}

// Export config cho script khác dùng
const configPath = path.join(__dirname, '../.firebase-client-config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
console.log(`\n💾 Saved config to: ${configPath}`);



