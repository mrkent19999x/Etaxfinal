/**
 * Browser script để migrate passwords trong localStorage
 * 
 * Copy và paste script này vào browser console khi đang ở trang web
 * 
 * Script sẽ:
 * 1. Đọc data từ localStorage
 * 2. Hash các passwords chưa được hash
 * 3. Lưu lại vào localStorage
 */

// bcryptjs browser version (cần load từ CDN hoặc npm)
// Hoặc dùng Web Crypto API để hash (nhưng không giống bcrypt)

// Note: bcryptjs không chạy tốt trong browser, nên dùng approach khác:
// Option 1: Gọi API endpoint để hash password
// Option 2: Chỉ update Firestore, localStorage sẽ tự động sync

console.log("📝 LOCALSTORAGE PASSWORD MIGRATION")
console.log("⚠️  Note: bcryptjs không chạy tốt trong browser")
console.log("💡 Recommended approach:")
console.log("   1. Migrate Firestore passwords (run migrate-passwords-to-hash.js)")
console.log("   2. Clear localStorage để reset về DEFAULT_DATA")
console.log("   3. User login lại sẽ tự động hash password mới")

// Script để clear và reset localStorage
function resetLocalStorage() {
  const confirm = window.confirm(
    "Bạn có muốn reset localStorage về DEFAULT_DATA không?\n" +
    "Điều này sẽ xóa tất cả dữ liệu đã lưu trong localStorage."
  )
  
  if (!confirm) {
    console.log("❌ Cancelled")
    return
  }
  
  const DATA_KEY = "etax_data_store_v1"
  const ADMIN_SESSION_KEY = "etax_admin_session"
  const USER_SESSION_KEY = "etax_user_session"
  
  localStorage.removeItem(DATA_KEY)
  localStorage.removeItem(ADMIN_SESSION_KEY)
  localStorage.removeItem(USER_SESSION_KEY)
  
  console.log("✓ localStorage đã được reset")
  console.log("🔄 Reload trang để load DEFAULT_DATA mới")
  window.location.reload()
}

// Export function để dùng trong console
window.resetLocalStorage = resetLocalStorage

console.log("\n💡 Để reset localStorage, chạy: resetLocalStorage()")

