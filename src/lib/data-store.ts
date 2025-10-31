"use client"

type Role = "admin" | "user"

export interface Account {
  id: string
  name: string
  email: string
  password: string
  role: Role
  mstList: string[]
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface MstProfile {
  mst: string
  fullName: string
  email?: string
  phone?: string
  address?: string
}

export interface MappingRow {
  id: string
  sourceField: string
  targetField: string
  required: boolean
}

export interface StoredData {
  accounts: Account[]
  mstProfiles: Record<string, MstProfile>
  mappings: Record<string, MappingRow[]>
}

const DATA_KEY = "etax_data_store_v1"
const ADMIN_SESSION_KEY = "etax_admin_session"
const USER_SESSION_KEY = "etax_user_session"

const DEFAULT_DATA: StoredData = {
  accounts: [
    {
      id: "admin-1",
      name: "Quản trị viên",
      email: "admin@etax.local",
      password: "admin123",
      role: "admin",
      mstList: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "user-1",
      name: "Tử Xuân Chiến",
      email: "user1@etax.local",
      password: "123456",
      role: "user",
      mstList: ["00109202830"],
      phone: "0901 234 567",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  mstProfiles: {
    "00109202830": {
      mst: "00109202830",
      fullName: "TỬ XUÂN CHIẾN",
      email: "user1@etax.local",
      phone: "0901 234 567",
      address: "Số 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    },
  },
  mappings: {
    "00109202830": [
      { id: "map-1", sourceField: "MST", targetField: "taxCode", required: true },
      { id: "map-2", sourceField: "HO_TEN", targetField: "fullName", required: true },
      { id: "map-3", sourceField: "EMAIL", targetField: "email", required: false },
    ],
  },
}

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

function readData(): StoredData {
  if (typeof window === "undefined") {
    return DEFAULT_DATA
  }

  const raw = window.localStorage.getItem(DATA_KEY)
  if (!raw) {
    window.localStorage.setItem(DATA_KEY, JSON.stringify(DEFAULT_DATA))
    return DEFAULT_DATA
  }

  try {
    const parsed = JSON.parse(raw) as StoredData
    return {
      accounts: parsed.accounts ?? DEFAULT_DATA.accounts,
      mstProfiles: parsed.mstProfiles ?? DEFAULT_DATA.mstProfiles,
      mappings: parsed.mappings ?? DEFAULT_DATA.mappings,
    }
  } catch {
    window.localStorage.setItem(DATA_KEY, JSON.stringify(DEFAULT_DATA))
    return DEFAULT_DATA
  }
}

function writeData(data: StoredData) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

export async function listAccounts(): Promise<Account[]> {
  try {
    const res = await fetch("/api/admin/users")
    if (!res.ok) {
      // Fallback to local storage if API fails
      return readData().accounts
    }
    const data = await res.json()
    return (data.users || []).map((user: any) => ({
      id: user.id || "",
      name: user.name || "",
      email: user.email || "",
      password: "", // Never return password
      role: user.role || "user",
      mstList: user.mstList || [],
      phone: user.phone,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
    }))
  } catch {
    // Fallback to local storage
    return readData().accounts
  }
}

export async function createAccount(payload: Omit<Account, "id" | "createdAt" | "updatedAt">) {
  try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        name: payload.name,
        role: payload.role,
        mstList: payload.mstList,
        phone: payload.phone,
      }),
    })
    if (!res.ok) throw new Error("Failed to create account")
    const data = await res.json()
    return {
      id: data.userId || data.user?.id || generateId("acc"),
      ...payload,
      createdAt: data.user?.createdAt || new Date().toISOString(),
      updatedAt: data.user?.updatedAt || new Date().toISOString(),
    }
  } catch {
    // Fallback to local storage
    const data = readData()
    const now = new Date().toISOString()
    const account: Account = {
      ...payload,
      id: generateId("acc"),
      createdAt: now,
      updatedAt: now,
    }
    data.accounts = [...data.accounts, account]
    writeData(data)
    return account
  }
}

export async function updateAccount(id: string, updates: Partial<Omit<Account, "id" | "createdAt" | "updatedAt">>) {
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error("Failed to update account")
    return
  } catch {
    // Fallback to local storage
    const data = readData()
    data.accounts = data.accounts.map((account) =>
      account.id === id
        ? {
            ...account,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : account,
    )
    writeData(data)
  }
}

export async function deleteAccount(id: string) {
  try {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete account")
    return
  } catch {
    // Fallback to local storage
    const data = readData()
    data.accounts = data.accounts.filter((account) => account.id !== id)
    writeData(data)
  }
}

export async function loginAdmin(email: string, password: string) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Đăng nhập thất bại")
    }
    const data = await res.json()
    // Get full user data
    const meRes = await fetch("/api/auth/me")
    if (meRes.ok) {
      const meData = await meRes.json()
      return {
        id: meData.user.id,
        name: meData.user.name,
        email: meData.user.email,
        password: "",
        role: "admin" as const,
        mstList: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    return null
  } catch (error: any) {
    console.error("[loginAdmin]", error)
    // Fallback to local storage
    const account = readData().accounts.find(
      (item) => item.role === "admin" && item.email.toLowerCase() === email.toLowerCase() && item.password === password,
    )
    if (!account) {
      return null
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_SESSION_KEY, account.id)
    }
    return account
  }
}

export async function getAdminSession() {
  if (typeof window === "undefined") return null
  try {
    const res = await fetch("/api/auth/me")
    if (!res.ok) return null
    const data = await res.json()
    if (data.user?.role !== "admin") return null
    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      password: "",
      role: "admin" as const,
      mstList: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch {
    // Fallback to local storage
    const adminId = window.localStorage.getItem(ADMIN_SESSION_KEY)
    if (!adminId) return null
    return readData().accounts.find((account) => account.id === adminId && account.role === "admin") || null
  }
}

export async function logoutAdmin() {
  if (typeof window === "undefined") return
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } catch {
    // Fallback
  }
  window.localStorage.removeItem(ADMIN_SESSION_KEY)
}

export interface UserSession {
  accountId: string
  mst: string
}

export async function loginUserByMst(mst: string, password: string): Promise<UserSession | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mst, password }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Đăng nhập thất bại")
    }
    const data = await res.json()
    return {
      accountId: data.user.id,
      mst: data.user.mst,
    }
  } catch (error: any) {
    console.error("[loginUserByMst]", error)
    // Fallback to local storage
    const normalizedMst = mst.trim()
    const account = readData().accounts.find(
      (item) =>
        item.role === "user" &&
        item.password === password &&
        item.mstList?.some((value) => value === normalizedMst),
    )

    if (!account) return null

    const session: UserSession = {
      accountId: account.id,
      mst: normalizedMst,
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session))
    }

    return session
  }
}

export async function getUserSession(): Promise<(Account & { mst: string }) | null> {
  if (typeof window === "undefined") return null
  try {
    const res = await fetch("/api/auth/me")
    if (!res.ok) return null
    const data = await res.json()
    if (data.user?.role !== "user") return null
    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email || "",
      password: "",
      role: "user" as const,
      mstList: data.user.mstList || [],
      mst: data.user.mst || "",
      phone: data.user.phone,
      createdAt: data.user.createdAt || new Date().toISOString(),
      updatedAt: data.user.updatedAt || new Date().toISOString(),
    }
  } catch {
    // Fallback to local storage
    const raw = window.localStorage.getItem(USER_SESSION_KEY)
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw) as UserSession
      const account = readData().accounts.find((item) => item.id === parsed.accountId && item.role === "user")
      if (!account) return null
      return { ...account, mst: parsed.mst }
    } catch {
      window.localStorage.removeItem(USER_SESSION_KEY)
      return null
    }
  }
}

export async function logoutUser() {
  if (typeof window === "undefined") return
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } catch {
    // Fallback
  }
  window.localStorage.removeItem(USER_SESSION_KEY)
}

export async function getProfile(mst: string): Promise<MstProfile | null> {
  try {
    const res = await fetch(`/api/profiles/${mst}`)
    if (!res.ok) {
      // Fallback to local storage
      const data = readData()
      return data.mstProfiles[mst] ?? null
    }
    const data = await res.json()
    return data.profile || null
  } catch {
    // Fallback to local storage
    const data = readData()
    return data.mstProfiles[mst] ?? null
  }
}

export async function upsertProfile(profile: MstProfile) {
  try {
    const res = await fetch(`/api/profiles/${profile.mst}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
    if (!res.ok) throw new Error("Failed to save profile")
    return
  } catch {
    // Fallback to local storage
    const data = readData()
    data.mstProfiles = {
      ...data.mstProfiles,
      [profile.mst]: profile,
    }
    writeData(data)
  }
}

export async function getMapping(mst: string): Promise<MappingRow[]> {
  try {
    const res = await fetch(`/api/mappings/${mst}`)
    if (!res.ok) {
      // Fallback to local storage
      const data = readData()
      return data.mappings[mst] ?? []
    }
    const data = await res.json()
    return data.mappings || []
  } catch {
    // Fallback to local storage
    const data = readData()
    return data.mappings[mst] ?? []
  }
}

export async function saveMapping(mst: string, rows: MappingRow[]) {
  try {
    const res = await fetch(`/api/mappings/${mst}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    })
    if (!res.ok) throw new Error("Failed to save mapping")
    return
  } catch {
    // Fallback to local storage
    const data = readData()
    data.mappings = {
      ...data.mappings,
      [mst]: rows,
    }
    writeData(data)
  }
}

export async function listUserAccounts(): Promise<Account[]> {
  try {
    const accounts = await listAccounts()
    return accounts.filter((account) => account.role === "user")
  } catch {
    return readData().accounts.filter((account) => account.role === "user")
  }
}

export async function listAdminAccounts(): Promise<Account[]> {
  try {
    const accounts = await listAccounts()
    return accounts.filter((account) => account.role === "admin")
  } catch {
    return readData().accounts.filter((account) => account.role === "admin")
  }
}

export function resetStore() {
  if (typeof window === "undefined") return
  window.localStorage.setItem(DATA_KEY, JSON.stringify(DEFAULT_DATA))
  window.localStorage.removeItem(USER_SESSION_KEY)
  window.localStorage.removeItem(ADMIN_SESSION_KEY)
}
