#!/usr/bin/env node

/**
 * Migration script để hash existing passwords trong Firestore và localStorage
 * 
 * Usage:
 *   node tools/migrate-passwords-to-hash.js [--firestore] [--localstorage]
 * 
 * Nếu không có flag, sẽ migrate cả hai
 */

const admin = require("firebase-admin")
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")

// Import password utils (Node.js compatible version)
async function hashPassword(password) {
  if (!password || password.trim().length === 0) {
    throw new Error("Password không được để trống")
  }
  return bcrypt.hash(password, 10)
}

async function isHashedPassword(hash) {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")
}

// Initialize Firebase Admin
function initFirebase() {
  if (admin.apps.length === 0) {
    let serviceAccount = undefined

    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
        serviceAccount = JSON.parse(decoded)
      } catch (error) {
        console.error("[Firebase Admin] Failed to decode FIREBASE_SERVICE_ACCOUNT_BASE64", error)
      }
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/^['"]|['"]$/g, "")
      try {
        serviceAccount = JSON.parse(raw)
      } catch {
        const cleaned = raw.replace(/\\n/g, "\n")
        serviceAccount = JSON.parse(cleaned)
      }
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))
    }

    if (serviceAccount && typeof serviceAccount.private_key === "string") {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n")
    }

    if (!serviceAccount) {
      console.warn("[Firebase Admin] Service account not configured. Using Application Default Credentials if available.")
      admin.initializeApp()
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    }
  }
  return admin.firestore()
}

async function migrateFirestore() {
  console.log("🔥 Starting Firestore password migration...")
  
  const db = initFirebase()
  
  try {
    const usersSnapshot = await db.collection("users").get()
    console.log(`📊 Found ${usersSnapshot.docs.length} users in Firestore`)
    
    let migrated = 0
    let skipped = 0
    let errors = 0
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      
      if (!userData.password) {
        console.log(`⚠️  User ${doc.id} has no password field, skipping`)
        skipped++
        continue
      }
      
      // Check if already hashed
      if (await isHashedPassword(userData.password)) {
        console.log(`✓ User ${doc.id} (${userData.email}) already hashed, skipping`)
        skipped++
        continue
      }
      
      try {
        const hashedPassword = await hashPassword(userData.password)
        await db.collection("users").doc(doc.id).update({
          password: hashedPassword,
          updatedAt: new Date().toISOString(),
        })
        console.log(`✓ Migrated password for user ${doc.id} (${userData.email})`)
        migrated++
      } catch (error) {
        console.error(`❌ Error migrating user ${doc.id}:`, error.message)
        errors++
      }
    }
    
    console.log("\n📈 Migration Summary:")
    console.log(`  ✓ Migrated: ${migrated}`)
    console.log(`  ⊘ Skipped: ${skipped}`)
    console.log(`  ❌ Errors: ${errors}`)
    
  } catch (error) {
    console.error("❌ Firestore migration failed:", error)
    process.exit(1)
  }
}

async function migrateLocalStorage() {
  console.log("💾 Starting localStorage password migration...")
  
  const dataStorePath = path.join(process.cwd(), "src", "lib", "data-store.ts")
  
  if (!fs.existsSync(dataStorePath)) {
    console.log("⚠️  data-store.ts not found, skipping localStorage migration")
    return
  }
  
  // Read DEFAULT_DATA from file
  const content = fs.readFileSync(dataStorePath, "utf8")
  
  // Note: Đây là file TypeScript, không thể execute trực tiếp
  // User cần manually update DEFAULT_DATA hoặc run script khác
  console.log("\n⚠️  LOCALSTORAGE MIGRATION:")
  console.log("  For localStorage fallback, passwords in DEFAULT_DATA should be hashed manually")
  console.log("  Or use the browser console to migrate localStorage data")
  console.log("  See: tools/migrate-localstorage-passwords-browser.js")
}

async function main() {
  const args = process.argv.slice(2)
  const migrateFirestoreFlag = args.includes("--firestore")
  const migrateLocalStorageFlag = args.includes("--localstorage")
  
  if (migrateFirestoreFlag || args.length === 0) {
    await migrateFirestore()
  }
  
  if (migrateLocalStorageFlag || args.length === 0) {
    await migrateLocalStorage()
  }
  
  console.log("\n✅ Migration completed!")
  process.exit(0)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})

