#!/usr/bin/env node

/**
 * Tạo user với MST trong Firestore để test user login
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(process.cwd(), './config/anhbao-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function createUserWithMst() {
  const email = 'user1@etax.local';
  const password = '123456';
  const name = 'Tử Xuân Chiến';
  const mst = '00109202830';
  
  console.log('🔥 Creating User with MST');
  console.log('==========================\n');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Name:', name);
  console.log('MST:', mst);
  console.log('Role: user\n');
  
  try {
    // Check if user exists
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      console.log('✅ User already exists:');
      console.log('   Doc ID:', userDoc.id);
      console.log('   Email:', userData.email);
      console.log('   Role:', userData.role);
      console.log('   MST List:', userData.mstList);
      
      // Update if needed
      if (!userData.mstList?.includes(mst)) {
        console.log('\n⚠️  MST not in list. Updating...');
        await db.collection('users').doc(userDoc.id).update({
          mstList: [...(userData.mstList || []), mst],
          password: password,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('✅ Updated with MST:', mst);
      }
      
      return { exists: true, docId: userDoc.id };
    }
    
    // Create new user
    console.log('📝 Creating new user...\n');
    
    // Create Firebase Auth user
    const mstEmail = `${mst}@mst.local`;
    let firebaseUid;
    try {
      const existingAuthUser = await auth.getUserByEmail(mstEmail);
      firebaseUid = existingAuthUser.uid;
      console.log('✅ Firebase Auth user exists:', firebaseUid);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        const newFirebaseUser = await auth.createUser({
          email: mstEmail,
          password: password,
          displayName: name,
        });
        firebaseUid = newFirebaseUser.uid;
        console.log('✅ Created Firebase Auth user:', firebaseUid);
      } else {
        throw authError;
      }
    }
    
    // Create Firestore document
    const userDoc = {
      uid: firebaseUid,
      email: email.toLowerCase(),
      password: password,
      name: name,
      role: 'user',
      mstList: [mst],
      phone: '0901 234 567',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const docRef = await db.collection('users').add(userDoc);
    console.log('✅ Created Firestore user document:', docRef.id);
    
    return { created: true, docId: docRef.id, uid: firebaseUid };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    process.exit(1);
  }
}

async function main() {
  const result = await createUserWithMst();
  
  console.log('\n==========================');
  console.log('✅ Setup Complete!\n');
  console.log('📋 Test Login:');
  console.log('   MST: 00109202830');
  console.log('   Password: 123456\n');
  console.log('   URL: http://localhost:3000/login\n');
}

main().catch(console.error);

