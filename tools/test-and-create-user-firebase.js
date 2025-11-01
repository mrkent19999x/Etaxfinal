#!/usr/bin/env node

/**
 * Test Firebase Login và Tạo User nếu chưa có
 */

const admin = require('firebase-admin');

// Check env vars
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

let serviceAccount = null;

if (serviceAccountBase64) {
  try {
    const decoded = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
  } catch (error) {
    console.error('❌ Failed to decode FIREBASE_SERVICE_ACCOUNT_BASE64:', error.message);
    process.exit(1);
  }
} else if (serviceAccountKey) {
  try {
    const raw = serviceAccountKey.replace(/^['"]|['"]$/g, '');
    serviceAccount = JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/\\n/g, '\n');
    serviceAccount = JSON.parse(cleaned);
  }
} else if (serviceAccountPath) {
  const fs = require('fs');
  const path = require('path');
  const fullPath = path.resolve(process.cwd(), serviceAccountPath);
  serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

if (!serviceAccount) {
  console.error('❌ Firebase Service Account not found in env vars');
  console.log('   Need: FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_PATH');
  process.exit(1);
}

// Init Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkAndCreateUser() {
  const email = 'phuctran123@gmail.com';
  const password = '123456';
  
  console.log('🔍 Checking user in Firestore:', email);
  
  try {
    // Check if user exists
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      console.log('✅ User found:', {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      });
      
      // Verify password match
      if (userData.password === password) {
        console.log('✅ Password matches');
        return { exists: true, valid: true, docId: userDoc.id };
      } else {
        console.log('⚠️  Password mismatch. Updating...');
        await db.collection('users').doc(userDoc.id).update({
          password: password,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('✅ Password updated');
        return { exists: true, valid: true, docId: userDoc.id, updated: true };
      }
    }
    
    // User not found, create it
    console.log('❌ User not found. Creating...');
    
    const newUser = {
      email: email.toLowerCase(),
      password: password,
      role: 'admin',
      name: 'Phuc Tran',
      mstList: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const docRef = await db.collection('users').add(newUser);
    console.log('✅ User created:', {
      id: docRef.id,
      email: newUser.email,
      role: newUser.role,
    });
    
    return { exists: false, created: true, docId: docRef.id };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🔥 Firebase User Setup & Test');
  console.log('============================\n');
  
  const result = await checkAndCreateUser();
  
  console.log('\n📋 Result:', result);
  console.log('\n✅ Ready to test login!');
  console.log('   Email: phuctran123@gmail.com');
  console.log('   Password: 123456');
}

main().catch(console.error);

