"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { z } from "zod"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useRequireAdmin } from "@/hooks/use-admin-auth"

const fieldSchema = z.object({
  id: z.string().optional(),
  screenId: z.string().min(1),
  fieldId: z.string().min(1),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  type: z.enum(["text", "number", "date", "currency", "select", "textarea"]).default("text"),
  options: z.array(z.record(z.any())).optional(),
  validation: z.record(z.any()).optional(),
  style: z.record(z.any()).optional(),
  order: z.coerce.number().optional(),
})

const initialForm = {
  screenId: "",
  fieldId: "",
  label: "",
  placeholder: "",
  type: "text" as const,
  options: "[]",
  validation: "{}",
  style: "{}",
  order: 0,
}

type FormData = {
  id?: string
  screenId: string
  fieldId: string
  label: string
  placeholder: string
  type: "text" | "number" | "date" | "currency" | "select" | "textarea"
  options: string
  validation: string
  style: string
  order: number
}

export default function AdminFieldDefinitionPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [definitions, setDefinitions] = useState<any[]>([])
  const [form, setForm] = useState<FormData>(initialForm)
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [filterScreen, setFilterScreen] = useState<string>("")

  const isEdit = useMemo(() => Boolean(form?.id), [form?.id])

  const loadDefinitions = async (screenId?: string) => {
    try {
      const query = new URLSearchParams()
      if (screenId) query.set("screenId", screenId)
      const res = await fetch(`/api/admin/field-definitions?${query.toString()}`)
      if (!res.ok) throw new Error("Không thể tải field definitions")
      const data = await res.json()
      setDefinitions(data.definitions ?? [])
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message ?? "Không thể tải field definitions")
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    loadDefinitions()
  }, [isAdmin])

  const resetForm = () => {
    setForm(initialForm)
    setStatus("")
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("")
    setLoading(true)
    try {
      const payload = {
        ...form,
        options: form.options ? JSON.parse(form.options || "[]") : undefined,
        validation: form.validation ? JSON.parse(form.validation || "{}") : undefined,
        style: form.style ? JSON.parse(form.style || "{}") : undefined,
        order: Number(form.order ?? 0),
      }

      const parsed = fieldSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error("Dữ liệu không hợp lệ")
      }

      const res = await fetch(parsed.data.id ? `/api/admin/field-definitions/${parsed.data.id}` : "/api/admin/field-definitions", {
        method: parsed.data.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error ?? "Không thể lưu")
      }

      const saved = await res.json()
      setStatus("Đã lưu field definition")
      setDefinitions((prev) => {
        if (parsed.data.id) {
          return prev.map((item) => (item.id === saved.id ? saved : item))
        }
        return [saved, ...prev]
      })
      resetForm()
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message ?? "Không thể lưu field definition")
    } finally {
      setLoading(false)
    }
  }

  const editDefinition = (definition: any) => {
    setForm({
      id: definition.id,
      screenId: definition.screenId,
      fieldId: definition.fieldId,
      label: definition.label ?? "",
      placeholder: definition.placeholder ?? "",
      type: definition.type ?? "text",
      options: JSON.stringify(definition.options ?? [], null, 2),
      validation: JSON.stringify(definition.validation ?? {}, null, 2),
      style: JSON.stringify(definition.style ?? {}, null, 2),
      order: definition.order ?? 0,
    })
  }

  const deleteDefinition = async (id: string) => {
    if (!confirm("Xóa field này?")) return
    try {
      const res = await fetch(`/api/admin/field-definitions/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Không thể xóa")
      setDefinitions((prev) => prev.filter((item) => item.id !== id))
      if (form.id === id) resetForm()
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message ?? "Không thể xóa field definition")
    }
  }

  const handleFilterChange = (screen: string) => {
    setFilterScreen(screen)
    loadDefinitions(screen || undefined)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[color:var(--color-primary)]"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Field Definitions</h2>
            <p className="text-gray-600">Quản lý metadata cho các form.</p>
          </div>
          <Link href="/admin" className="text-sm text-[color:var(--color-primary)] hover:underline">
            ← Quay lại Dashboard
          </Link>
        </div>

        {status ? <div className="rounded bg-blue-50 p-3 text-blue-700">{status}</div> : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form className="space-y-4 rounded-lg bg-white p-6 shadow lg:col-span-2" onSubmit={submitForm}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Screen ID</label>
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.screenId}
                  onChange={(e) => setForm((prev) => ({ ...prev, screenId: e.target.value }))}
                  placeholder="Ví dụ: tra-cuu-chung-tu"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Field ID</label>
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.fieldId}
                  onChange={(e) => setForm((prev) => ({ ...prev, fieldId: e.target.value }))}
                  placeholder="Ví dụ: referenceCode"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Label</label>
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.label}
                  onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Placeholder</label>
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.placeholder}
                  onChange={(e) => setForm((prev) => ({ ...prev, placeholder: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as FormData["type"] }))}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="currency">Currency</option>
                  <option value="select">Select</option>
                  <option value="textarea">Textarea</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.order}
                  onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Options (JSON)</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                value={form.options}
                onChange={(e) => setForm((prev) => ({ ...prev, options: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Validation (JSON)</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                value={form.validation}
                onChange={(e) => setForm((prev) => ({ ...prev, validation: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Style (JSON)</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                value={form.style}
                onChange={(e) => setForm((prev) => ({ ...prev, style: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[color:var(--color-primary)] px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
              >
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                Làm mới
              </button>
            </div>
          </form>

          <div className="space-y-4 rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Danh sách</h3>
              <input
                className="w-40 rounded border border-gray-300 px-2 py-1 text-sm"
                placeholder="Filter theo screen"
                value={filterScreen}
                onChange={(e) => handleFilterChange(e.target.value)}
              />
            </div>

            <div className="max-h-[500px] space-y-3 overflow-y-auto text-sm text-gray-700">
              {definitions.length === 0 ? (
                <p className="text-gray-500">Chưa có field definition.</p>
              ) : (
                definitions.map((definition) => (
                  <div key={definition.id} className="space-y-2 rounded border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{definition.screenId} · {definition.fieldId}</p>
                        <p className="text-xs text-gray-500">{definition.label ?? "Không label"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs">
                        <button className="text-[color:var(--color-primary)] hover:underline" onClick={() => editDefinition(definition)}>
                          Sửa
                        </button>
                        <button className="text-red-500 hover:underline" onClick={() => deleteDefinition(definition.id)}>
                          Xóa
                        </button>
                      </div>
                    </div>
                    <div className="rounded bg-gray-50 p-2 text-xs text-gray-600">
                      <p>Type: {definition.type}</p>
                      <p>Order: {definition.order ?? 0}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
