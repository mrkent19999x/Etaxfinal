#!/usr/bin/env node

/**
 * Tạo user trực tiếp trong Firestore bằng Firebase Admin SDK
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account from file
const serviceAccountPath = path.resolve(process.cwd(), './config/anhbao-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Init Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function createUser() {
  const email = 'phuctran123@gmail.com';
  const password = '123456';
  const name = 'Phuc Tran';
  
  console.log('🔥 Creating Firebase User');
  console.log('==========================\n');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Name:', name);
  console.log('Role: admin\n');
  
  try {
    // Check if user exists in Firestore
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      console.log('✅ User already exists in Firestore:');
      console.log('   Doc ID:', userDoc.id);
      console.log('   Email:', userData.email);
      console.log('   Role:', userData.role);
      
      // Update password if needed
      if (userData.password !== password) {
        console.log('\n⚠️  Password mismatch. Updating password...');
        await db.collection('users').doc(userDoc.id).update({
          password: password,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('✅ Password updated');
      }
      
      // Check Firebase Auth user
      try {
        const firebaseUser = await auth.getUserByEmail(email.toLowerCase());
        console.log('\n✅ Firebase Auth user exists:');
        console.log('   UID:', firebaseUser.uid);
        console.log('   Email:', firebaseUser.email);
        
        // Update Firestore with uid if missing
        if (!userData.uid) {
          await db.collection('users').doc(userDoc.id).update({ uid: firebaseUser.uid });
          console.log('✅ Updated Firestore with UID');
        }
        
        // Ensure admin claim
        const customClaims = firebaseUser.customClaims || {};
        if (!customClaims.admin) {
          await auth.setCustomUserClaims(firebaseUser.uid, { admin: true });
          console.log('✅ Set admin custom claim');
        }
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log('\n⚠️  Firebase Auth user not found. Creating...');
          const newFirebaseUser = await auth.createUser({
            email: email.toLowerCase(),
            password: password,
            displayName: name,
          });
          await auth.setCustomUserClaims(newFirebaseUser.uid, { admin: true });
          await db.collection('users').doc(userDoc.id).update({ uid: newFirebaseUser.uid });
          console.log('✅ Created Firebase Auth user with UID:', newFirebaseUser.uid);
        } else {
          throw authError;
        }
      }
      
      return { created: false, exists: true, docId: userDoc.id };
    }
    
    // User doesn't exist, create it
    console.log('📝 Creating new user...\n');
    
    // First create Firebase Auth user
    let firebaseUid;
    try {
      const existingAuthUser = await auth.getUserByEmail(email.toLowerCase());
      firebaseUid = existingAuthUser.uid;
      console.log('✅ Firebase Auth user already exists:', firebaseUid);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        const newFirebaseUser = await auth.createUser({
          email: email.toLowerCase(),
          password: password,
          displayName: name,
        });
        firebaseUid = newFirebaseUser.uid;
        await auth.setCustomUserClaims(firebaseUid, { admin: true });
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
      role: 'admin',
      mstList: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const docRef = await db.collection('users').add(userDoc);
    console.log('✅ Created Firestore user document:', docRef.id);
    
    return { created: true, exists: false, docId: docRef.id, uid: firebaseUid };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    process.exit(1);
  }
}

async function main() {
  const result = await createUser();
  
  console.log('\n==========================');
  console.log('✅ Setup Complete!\n');
  console.log('📋 Test Login:');
  console.log('   Email: phuctran123@gmail.com');
  console.log('   Password: 123456\n');
  console.log('   URL: http://localhost:3000/admin/login\n');
}

main().catch(console.error);

