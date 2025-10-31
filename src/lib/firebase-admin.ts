import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getStorage, type Storage } from "firebase-admin/storage"
import { readFileSync } from "fs"
import { resolve } from "path"

type Bucket = ReturnType<Storage["bucket"]>

let adminApp: App | undefined
let adminAuth: Auth | undefined
let adminDb: Firestore | undefined
let adminStorage: Storage | undefined
let adminBucket: Bucket | undefined

if (typeof window === "undefined") {
  if (getApps().length === 0) {
    let serviceAccount: any = undefined
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const path = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      serviceAccount = JSON.parse(readFileSync(path, "utf8"))
    }

    if (!serviceAccount) {
      console.warn(
        "[Firebase Admin] Service account not configured. Using Application Default Credentials (ADC) if available."
      )
      adminApp = initializeApp()
    } else {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      })
    }
  } else {
    adminApp = getApps()[0]
  }

  adminAuth = getAuth(adminApp)
  adminDb = getFirestore(adminApp)
  adminStorage = getStorage(adminApp)

  if (adminStorage) {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET
    adminBucket = bucketName ? adminStorage.bucket(bucketName) : adminStorage.bucket()
  }
}

export { adminApp, adminAuth, adminDb, adminStorage, adminBucket }
