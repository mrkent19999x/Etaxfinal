#!/usr/bin/env node
/* Format Firebase service account JSON to single line for Vercel environment variable.
   Usage: node tools/format-service-account.js [path_to_json_file]
   Default: config/anhbao-service-account.json
*/

const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2] || path.join(__dirname, '../config/anhbao-service-account.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ File not found: ${jsonPath}`);
  process.exit(1);
}

try {
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const parsed = JSON.parse(jsonContent);
  
  // Minify JSON to single line
  const minified = JSON.stringify(parsed);
  
  console.log('\n📋 Copy giá trị này vào Vercel Environment Variable:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(minified);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ Variable name: FIREBASE_SERVICE_ACCOUNT_KEY');
  console.log('✅ Paste toàn bộ dòng JSON trên vào Vercel dashboard.\n');
} catch (error) {
  console.error('❌ Lỗi khi đọc/parse JSON:', error.message);
  process.exit(1);
}

