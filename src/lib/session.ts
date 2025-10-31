import { cookies } from "next/headers"

export interface SessionData {
  uid: string
  email?: string
  mst?: string
  admin?: boolean
}

export async function requireSession(): Promise<SessionData> {
  const cookieStore = await cookies()
  const raw = cookieStore.get("etax_session")?.value
  if (!raw) {
    throw new Error("Chưa đăng nhập")
  }

  try {
    const data = JSON.parse(raw) as SessionData
    if (!data?.uid) {
      throw new Error("Session không hợp lệ")
    }
    return data
  } catch (error) {
    throw new Error("Session không hợp lệ")
  }
}

export async function requireAdminSession(): Promise<SessionData> {
  const session = await requireSession()
  if (!session.admin) {
    throw new Error("Không có quyền admin")
  }
  return session
}

export async function requireUserSession(): Promise<SessionData> {
  const session = await requireSession()
  if (!session.mst) {
    throw new Error("Không có quyền người dùng")
  }
  return session
}
