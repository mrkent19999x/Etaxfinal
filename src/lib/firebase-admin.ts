import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { getStorage, type Storage, type Bucket } from "firebase-admin/storage"

let adminApp: App | undefined
let adminAuth: Auth | undefined
let adminDb: Firestore | undefined
let adminStorage: Storage | undefined
let adminBucket: Bucket | undefined

if (typeof window === "undefined") {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        ? require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : undefined

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
