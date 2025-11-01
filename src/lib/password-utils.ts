import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

/**
 * Hash một password plaintext thành hash string
 * @param password - Password plaintext cần hash
 * @returns Promise<string> - Password hash
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error("Password không được để trống")
  }
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * So sánh password plaintext với hash đã lưu
 * @param plainPassword - Password plaintext từ user input
 * @param hashedPassword - Password hash đã lưu trong database
 * @returns Promise<boolean> - True nếu password match
 */
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  if (!plainPassword || !hashedPassword) {
    return false
  }
  
  // Nếu hash không phải bcrypt format (có prefix $2a$ hoặc $2b$)
  // Có thể là old plaintext password, so sánh trực tiếp để backward compatibility
  if (!hashedPassword.startsWith("$2")) {
    console.warn("[password-utils] Password không được hash, đang so sánh plaintext (legacy)")
    return plainPassword === hashedPassword
  }
  
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Check xem một string có phải là bcrypt hash không
 * @param hash - String cần check
 * @returns boolean - True nếu là bcrypt hash
 */
export function isHashedPassword(hash: string): boolean {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")
}

