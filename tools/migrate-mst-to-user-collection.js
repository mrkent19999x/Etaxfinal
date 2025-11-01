#!/usr/bin/env node

/**
 * Migration script để tạo mst_to_user collection từ existing users
 * 
 * Collection này sẽ map MST -> userId để optimize query login
 * 
 * Usage:
 *   node tools/migrate-mst-to-user-collection.js
 */

const admin = require("firebase-admin")
const fs = require("fs")
const path = require("path")

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

async function migrateMstToUser() {
  console.log("🔥 Starting mst_to_user collection migration...")
  
  const db = initFirebase()
  
  try {
    // Get all users với mstList
    const usersSnapshot = await db.collection("users").where("role", "==", "user").get()
    console.log(`📊 Found ${usersSnapshot.docs.length} users with role="user"`)
    
    let created = 0
    let skipped = 0
    let errors = 0
    const duplicates = []
    
    // Process each user
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      const userId = doc.id
      const mstList = userData.mstList || []
      
      if (!mstList || mstList.length === 0) {
        console.log(`⚠️  User ${userId} has no mstList, skipping`)
        skipped++
        continue
      }
      
      // For each MST in mstList, create mst_to_user document
      for (const mst of mstList) {
        if (!mst || typeof mst !== "string") {
          console.log(`⚠️  Invalid MST in user ${userId}: ${mst}`)
          continue
        }
        
        const mstDocRef = db.collection("mst_to_user").doc(mst.trim())
        
        try {
          const existingDoc = await mstDocRef.get()
          
          if (existingDoc.exists) {
            const existingData = existingDoc.data()
            if (existingData?.userId !== userId) {
              // Duplicate MST found
              duplicates.push(`MST ${mst} is used by both user ${userId} and ${existingData?.userId}`)
              console.log(`⚠️  Duplicate MST detected: ${mst} (users: ${userId}, ${existingData?.userId})`)
            }
            // Update to latest user (hoặc giữ nguyên, tùy policy)
            await mstDocRef.set({
              userId,
              mst: mst.trim(),
              updatedAt: new Date().toISOString(),
            }, { merge: true })
          } else {
            // Create new document
            await mstDocRef.set({
              userId,
              mst: mst.trim(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            created++
          }
        } catch (error) {
          console.error(`❌ Error creating mst_to_user for MST ${mst}:`, error.message)
          errors++
        }
      }
    }
    
    console.log("\n📈 Migration Summary:")
    console.log(`  ✓ Created/Updated: ${created}`)
    console.log(`  ⊘ Skipped: ${skipped}`)
    console.log(`  ❌ Errors: ${errors}`)
    
    if (duplicates.length > 0) {
      console.log("\n⚠️  DUPLICATE MSTs FOUND:")
      duplicates.forEach((dup) => console.log(`  - ${dup}`))
      console.log("\n💡 Cần resolve duplicates trước khi dùng mst_to_user collection")
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

async function main() {
  await migrateMstToUser()
  console.log("\n✅ Migration completed!")
  process.exit(0)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})

