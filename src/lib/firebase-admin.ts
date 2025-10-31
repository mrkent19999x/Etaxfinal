import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

let adminApp: App | undefined
let adminAuth: Auth | undefined
let adminDb: Firestore | undefined

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
}

export { adminApp, adminAuth, adminDb }
