#!/usr/bin/env node

/**
 * Tạo user trong Firestore qua API (cần admin session hoặc fallback)
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function createUserViaAdminAPI(email, password, name, role = 'admin') {
  console.log('📋 Creating user via Admin API...');
  console.log('   Email:', email);
  console.log('   Role:', role);
  
  // Step 1: Login as admin using fallback (admin@etax.local)
  console.log('\n1️⃣ Logging in as default admin (fallback)...');
  
  try {
    // Try to create session via client-side logic
    // Since we're in Node.js, we'll use a workaround: call API directly
    
    // First check if user exists
    const checkRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@etax.local',
        password: 'admin123',
      }),
    });
    
    const checkData = await checkRes.json();
    console.log('   Check result:', checkData);
    
    if (checkRes.status === 503) {
      console.log('⚠️  Firebase not configured. User will use localStorage fallback.');
      console.log('\n✅ Solution:');
      console.log('   1. Login via browser at http://localhost:3000/admin/login');
      console.log('   2. Use: admin@etax.local / admin123 (fallback)');
      console.log('   3. Go to /admin/users and create new user via UI');
      console.log('   4. Or configure Firebase service account in .env.local');
      return false;
    }
    
    // Try to get admin session cookies
    if (checkRes.ok && checkData.success) {
      console.log('✅ Admin login successful');
      
      // Create user via API
      const createRes = await fetch(`${BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': checkRes.headers.get('set-cookie') || '',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          mstList: [],
        }),
      });
      
      const createData = await createRes.json();
      
      if (createRes.ok) {
        console.log('✅ User created successfully:', createData);
        return true;
      } else {
        console.log('❌ Failed to create user:', createData);
        return false;
      }
    } else {
      console.log('❌ Admin login failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  const email = 'phuctran123@gmail.com';
  const password = '123456';
  const name = 'Phuc Tran';
  
  console.log('🔥 Create Firebase User');
  console.log('========================\n');
  
  const success = await createUserViaAdminAPI(email, password, name, 'admin');
  
  if (success) {
    console.log('\n✅ User created! Now test login:');
    console.log(`   curl -X POST ${BASE_URL}/api/auth/login \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"email":"${email}","password":"${password}"}'`);
  } else {
    console.log('\n📝 Manual Steps:');
    console.log('   1. Open browser: http://localhost:3000/admin/login');
    console.log('   2. Login with: admin@etax.local / admin123');
    console.log('   3. Navigate to: /admin/users');
    console.log('   4. Create user with:');
    console.log(`      Email: ${email}`);
    console.log(`      Password: ${password}`);
    console.log(`      Name: ${name}`);
    console.log(`      Role: admin`);
  }
}

main().catch(console.error);

