"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus, Upload, FileText, Trash2, Edit3 } from "lucide-react"
import { z } from "zod"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useRequireAdmin } from "@/hooks/use-admin-auth"

const fieldSchema = z.object({
  key: z.string().min(1),
  dataKey: z.string().min(1),
  label: z.string().optional(),
  fieldName: z.string().optional(),
  type: z.enum(["text", "date", "currency", "number", "checkbox"]).default("text"),
  page: z.coerce.number().int().min(1).optional(),
  x: z.coerce.number().optional(),
  y: z.coerce.number().optional(),
  fontSize: z.coerce.number().optional(),
})

const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  pages: z.coerce.number().int().min(1),
  isAcroForm: z.boolean().default(false),
  storagePath: z.string().optional(),
  fields: z.array(fieldSchema).default([]),
  defaults: z.record(z.any()).default({}),
})

const emptyField = { key: "", dataKey: "", type: "text" as const }

export default function AdminTemplatesPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [templates, setTemplates] = useState<any[]>([])
  const [form, setForm] = useState<any>({ name: "", pages: 1, fields: [emptyField], isAcroForm: false })
  const [fileBase64, setFileBase64] = useState<string>()
  const [fileName, setFileName] = useState<string>()
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const isEdit = useMemo(() => Boolean(form?.id), [form?.id])

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/admin/pdf/templates")
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (!cancelled) setTemplates(data.templates ?? [])
      } catch (error: any) {
        console.error(error)
        if (!cancelled) setStatus("Không thể tải danh sách template")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const resetForm = () => {
    setForm({ name: "", pages: 1, fields: [emptyField], isAcroForm: false })
    setFileBase64(undefined)
    setFileName(undefined)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === "string") {
        setFileBase64(result)
        setFileName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFieldChange = (index: number, key: string, value: any) => {
    setForm((prev: any) => {
      const fields = [...(prev.fields ?? [])]
      fields[index] = { ...fields[index], [key]: value }
      return { ...prev, fields }
    })
  }

  const addField = () => {
    setForm((prev: any) => ({ ...prev, fields: [...(prev.fields ?? []), { ...emptyField }] }))
  }

  const removeField = (index: number) => {
    setForm((prev: any) => ({ ...prev, fields: prev.fields.filter((_: any, i: number) => i !== index) }))
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("")
    setLoading(true)
    try {
      const parsed = templateSchema.safeParse({ ...form, fields: form.fields ?? [] })
      if (!parsed.success) {
        console.error(parsed.error)
        throw new Error("Dữ liệu không hợp lệ")
      }

      const payload = { ...parsed.data, fileBase64, fileName }
      const endpoint = parsed.data.id ? `/api/admin/pdf/templates/${parsed.data.id}` : "/api/admin/pdf/templates"
      const method = parsed.data.id ? "PATCH" : "POST"

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error ?? "Không thể lưu")
      }

      const saved = await res.json()
      setTemplates((prev) => {
        if (parsed.data.id) {
          return prev.map((item) => (item.id === saved.id ? saved : item))
        }
        return [saved, ...prev]
      })
      setStatus("Đã lưu template")
      resetForm()
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message ?? "Không thể lưu template")
    } finally {
      setLoading(false)
    }
  }

  const editTemplate = (template: any) => {
    setForm({
      id: template.id,
      name: template.name,
      description: template.description ?? "",
      pages: template.pages ?? 1,
      isAcroForm: template.isAcroForm ?? false,
      storagePath: template.storagePath,
      defaults: template.defaults ?? {},
      fields: (template.fields ?? []).length > 0 ? template.fields : [emptyField],
    })
    setFileBase64(undefined)
    setFileName(undefined)
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm("Xóa template này?")) return
    try {
      const res = await fetch(`/api/admin/pdf/templates/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Không thể xóa")
      setTemplates((prev) => prev.filter((item) => item.id !== id))
      if (form.id === id) resetForm()
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message ?? "Không thể xóa template")
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
            <h2 className="text-2xl font-bold text-gray-800">PDF Templates</h2>
            <p className="text-gray-600">Tạo và quản lý mẫu chứng từ PDF</p>
          </div>
          <Link href="/admin" className="text-sm text-[color:var(--color-primary)] hover:underline">
            ← Quay lại Dashboard
          </Link>
        </div>

        {status ? (
          <div className="rounded bg-red-50 p-3 text-red-700">{status}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form className="space-y-4 rounded-lg bg-white p-6 shadow lg:col-span-2" onSubmit={submitForm}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Tên template</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.name}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Số trang</label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.pages}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, pages: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.description ?? ""}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isAcroForm ?? false}
                  onChange={(e) => setForm((prev: any) => ({ ...prev, isAcroForm: e.target.checked }))}
                />
                PDF có sẵn field AcroForm
              </label>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Upload PDF template</label>
                <input type="file" accept="application/pdf" className="mt-1" onChange={handleFileChange} />
                {fileName ? <p className="mt-1 text-sm text-gray-500">Đã chọn: {fileName}</p> : null}
                {!fileBase64 && !form.storagePath ? (
                  <p className="mt-1 text-xs text-gray-500">Chưa có file template. Chọn file để upload.</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Fields</h3>
                <button
                  type="button"
                  onClick={addField}
                  className="flex items-center gap-1 text-sm text-[color:var(--color-primary)] hover:underline"
                >
                  <Plus size={16} /> Thêm field
                </button>
              </div>

              <div className="space-y-3">
                {form.fields?.map((field: any, index: number) => (
                  <div key={index} className="space-y-3 rounded border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <strong className="text-sm text-gray-700">Field {index + 1}</strong>
                      {form.fields.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <div>
                        <label className="text-xs text-gray-600">Key hiển thị</label>
                        <input
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                          value={field.key}
                          onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Data key</label>
                        <input
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                          value={field.dataKey}
                          onChange={(e) => handleFieldChange(index, "dataKey", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Field AcroForm</label>
                        <input
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                          value={field.fieldName ?? ""}
                          onChange={(e) => handleFieldChange(index, "fieldName", e.target.value)}
                          placeholder="VD: MST_FIELD"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Loại</label>
                        <select
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                          value={field.type ?? "text"}
                          onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                        >
                          <option value="text">Text</option>
                          <option value="date">Date</option>
                          <option value="currency">Currency</option>
                          <option value="number">Number</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <div>
                        <label className="text-xs text-gray-600">Trang</label>
                        <input
                          type="number"
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                          value={field.page ?? ""}
                          onChange={(e) => handleFieldChange(index, "page", e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">X</label>
                        <input
                          type="number"
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                          value={field.x ?? ""}
                          onChange={(e) => handleFieldChange(index, "x", e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Y</label>
                        <input
                          type="number"
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                          value={field.y ?? ""}
                          onChange={(e) => handleFieldChange(index, "y", e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Font size</label>
                        <input
                          type="number"
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
                          value={field.fontSize ?? ""}
                          onChange={(e) => handleFieldChange(index, "fontSize", e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Defaults (JSON)</label>
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={JSON.stringify(form.defaults ?? {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const json = JSON.parse(e.target.value || "{}")
                      setForm((prev: any) => ({ ...prev, defaults: json }))
                    } catch {
                      // bỏ qua
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[color:var(--color-primary)] px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
              >
                {isEdit ? "Cập nhật template" : "Tạo template"}
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
              <h3 className="text-lg font-semibold text-gray-800">Danh sách template</h3>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[color:var(--color-primary)] hover:underline">
                <Upload size={16} />
                Upload file
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="max-h-[500px] space-y-3 overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có template nào.</p>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="space-y-2 rounded border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <FileText size={18} /> {template.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">{template.description ?? "Không có mô tả"}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {template.pages ?? 1} trang · {template.fields?.length ?? 0} fields · isAcroForm: {template.isAcroForm ? "true" : "false"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          className="flex items-center gap-1 text-xs text-[color:var(--color-primary)] hover:underline"
                          onClick={() => editTemplate(template)}
                        >
                          <Edit3 size={14} /> Sửa
                        </button>
                        <button
                          className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                    <div className="rounded bg-gray-50 p-2 text-xs text-gray-600">
                      <p>Storage: {template.storagePath}</p>
                      <p>Fields: {(template.fields ?? []).map((f: any) => f.key).join(", ")}</p>
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
