"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { z } from "zod"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useRequireAdmin } from "@/hooks/use-admin-auth"

const contentSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1),
  title: z.string().optional(),
  body: z.string().optional(),
  style: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

const initialForm = { key: "", title: "", body: "", style: "{}", metadata: "{}" }

type FormData = {
  id?: string
  key: string
  title: string
  body: string
  style: string
  metadata: string
}

export default function AdminContentPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [blocks, setBlocks] = useState<any[]>([])
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("")

  const isEdit = useMemo(() => Boolean(form?.id), [form?.id])

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/admin/content-blocks")
        if (!res.ok) throw new Error("Không thể tải nội dung")
        const data = await res.json()
        if (!cancelled) setBlocks(data.blocks ?? [])
      } catch (error: any) {
        console.error(error)
        if (!cancelled) setStatus(error?.message ?? "Không thể tải content blocks")
      }
    })()
    return () => {
      cancelled = true
    }
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
      let parsedStyle: Record<string, any> | undefined
      let parsedMetadata: Record<string, any> | undefined
      if (form.style) {
        parsedStyle = JSON.parse(form.style || "{}")
      }
      if (form.metadata) {
        parsedMetadata = JSON.parse(form.metadata || "{}")
      }

      const payload = {
        id: form.id,
        key: form.key,
        title: form.title || undefined,
        body: form.body || undefined,
        style: parsedStyle,
        metadata: parsedMetadata,
      }

      const parsed = contentSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error("Dữ liệu không hợp lệ")
      }

      const res = await fetch(parsed.data.id ? `/api/admin/content-blocks/${parsed.data.id}` : "/api/admin/content-blocks", {
        method: parsed.data.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error ?? "Không thể lưu")
      }

      const saved = await res.json()
      setStatus("Đã lưu content block")
      setBlocks((prev) => {
        if (parsed.data.id) {
          return prev.map((item) => (item.id === saved.id ? saved : item))
        }
        return [saved, ...prev]
      })
      resetForm()
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message ?? "Không thể lưu content block")
    } finally {
      setLoading(false)
    }
  }

  const editBlock = (block: any) => {
    setForm({
      id: block.id,
      key: block.key,
      title: block.title ?? "",
      body: block.body ?? "",
      style: JSON.stringify(block.style ?? {}, null, 2),
      metadata: JSON.stringify(block.metadata ?? {}, null, 2),
    })
  }

  const deleteBlock = async (id: string) => {
    if (!confirm("Xóa content block này?")) return
    try {
      const res = await fetch(`/api/admin/content-blocks/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Không thể xóa")
      setBlocks((prev) => prev.filter((item) => item.id !== id))
      if (form.id === id) resetForm()
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message ?? "Không thể xóa content block")
    }
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
            <h2 className="text-2xl font-bold text-gray-800">Content Blocks</h2>
            <p className="text-gray-600">Quản lý nội dung hiển thị (title, body, style).</p>
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
                <label className="text-sm font-medium text-gray-700">Key</label>
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.key}
                  onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Body</label>
              <textarea
                rows={6}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
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
            <div>
              <label className="text-sm font-medium text-gray-700">Metadata (JSON)</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                value={form.metadata}
                onChange={(e) => setForm((prev) => ({ ...prev, metadata: e.target.value }))}
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

          <div className="space-y-3 rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-800">Danh sách</h3>
            <div className="max-h-[500px] space-y-3 overflow-y-auto">
              {blocks.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có content block.</p>
              ) : (
                blocks.map((block) => (
                  <div key={block.id} className="rounded border border-gray-200 p-4 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{block.key}</p>
                        <p className="text-xs text-gray-500">{block.title ?? "Không có tiêu đề"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs">
                        <button
                          className="text-[color:var(--color-primary)] hover:underline"
                          onClick={() => editBlock(block)}
                        >
                          Sửa
                        </button>
                        <button className="text-red-500 hover:underline" onClick={() => deleteBlock(block.id)}>
                          Xóa
                        </button>
                      </div>
                    </div>
                    {block.body ? <p className="mt-2 text-gray-600">{block.body.slice(0, 100)}...</p> : null}
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
