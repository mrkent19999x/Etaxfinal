"use client"

import {
  createAccount,
  updateAccount,
  deleteAccount as removeAccount,
  listAccounts,
} from "@/lib/data-store"

export interface CreateUserData {
  email: string
  password: string
  name: string
  role?: "admin" | "user"
  mstList?: string[]
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  mstList: string[]
  phone?: string
  createdAt?: string
}

export async function createUser(data: CreateUserData): Promise<{ userId: string }> {
  const account = await createAccount({
    email: data.email,
    name: data.name,
    password: data.password,
    role: data.role ?? "user",
    mstList: data.mstList ?? [],
    phone: undefined,
  })

  return { userId: account.id }
}

export async function getUsers(): Promise<{ users: User[] }> {
  const accounts = await listAccounts()
  return {
    users: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      mstList: account.mstList ?? [],
      phone: account.phone,
      createdAt: account.createdAt,
    })),
  }
}

export async function updateUser(userId: string, data: Partial<CreateUserData>): Promise<void> {
  await updateAccount(userId, {
    name: data.name,
    role: data.role,
    mstList: data.mstList,
    password: data.password,
    email: data.email,
  })
}

export async function deleteUser(userId: string): Promise<void> {
  await removeAccount(userId)
}
