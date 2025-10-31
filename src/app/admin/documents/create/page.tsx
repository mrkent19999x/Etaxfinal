"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"

import { AdminLayout } from "@/components/admin/admin-layout"
import { useRequireAdmin } from "@/hooks/use-admin-auth"

const generateSchema = z.object({
  templateId: z.string().min(1),
  mst: z.string().min(1),
  reference: z.string().optional(),
  effectiveDate: z.string().optional(),
  payload: z.record(z.any()).optional(),
})

interface TemplateOption {
  id: string
  name: string
  description?: string
  fields?: any[]
}

interface GeneratedResult {
  reference: string
  fileUrl: string
  filePath: string
  documentId: string | null
  fileUrlExpiresAt: string
}

export default function AdminGenerateDocumentPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const router = useRouter()
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [form, setForm] = useState({ templateId: "", mst: "", reference: "", effectiveDate: "" })
  const [payloadText, setPayloadText] = useState("{\n  \"amount\": 9600\n}")
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedResult | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/admin/pdf/templates")
        if (!res.ok) throw new Error("Không thể tải templates")
        const data = await res.json()
        if (!cancelled) {
          setTemplates(data.templates ?? [])
          if (data.templates?.length) {
            setForm((prev) => ({ ...prev, templateId: prev.templateId || data.templates[0].id }))
          }
        }
      } catch (error: any) {
        console.error(error)
        if (!cancelled) setStatus(error?.message ?? "Không thể tải templates")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const parsePayload = () => {
    if (!payloadText.trim()) return undefined
    try {
      return JSON.parse(payloadText)
    } catch (error) {
      throw new Error("Payload JSON không hợp lệ")
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("")
    setResult(null)

    try {
      const payload = parsePayload()
      const parsed = generateSchema.safeParse({ ...form, payload })
      if (!parsed.success) {
        console.error(parsed.error)
        throw new Error("Dữ liệu không hợp lệ")
      }

      setLoading(true)
      const res = await fetch("/api/admin/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error ?? "Không thể tạo chứng từ")
      }

      const data = await res.json()
      setResult(data)
      setStatus("Đã tạo chứng từ thành công")
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message ?? "Không thể tạo chứng từ")
    } finally {
      setLoading(false)
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

  if (!isAdmin) {
    router.push("/login")
    return null
  }

  const selectedTemplate = templates.find((item) => item.id === form.templateId)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Tạo chứng từ PDF</h2>
            <p className="text-gray-600">Chọn template, nhập MST và dữ liệu để sinh chứng từ.</p>
          </div>
          <Link href="/admin" className="text-sm text-[color:var(--color-primary)] hover:underline">
            ← Quay lại Dashboard
          </Link>
        </div>

        {status ? <div className="rounded bg-blue-50 p-3 text-blue-700">{status}</div> : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <form className="space-y-4 rounded-lg bg-white p-6 shadow lg:col-span-2" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Template</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.templateId}
                  onChange={(e) => setForm((prev) => ({ ...prev, templateId: e.target.value }))}
                  required
                >
                  <option value="" disabled>
                    Chọn template
                  </option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mã số thuế</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.mst}
                  onChange={(e) => setForm((prev) => ({ ...prev, mst: e.target.value }))}
                  placeholder="Ví dụ: 8868112232-002"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Reference (tuỳ chọn)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.reference}
                  onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Effective date (ISO string)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  value={form.effectiveDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, effectiveDate: e.target.value }))}
                  placeholder="2025-06-07T10:00:00Z"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Payload (JSON)</label>
              <textarea
                rows={8}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Nội dung JSON sẽ được merge theo dataKey đã cấu hình trong template.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[color:var(--color-primary)] px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo chứng từ"}
            </button>
          </form>

          <div className="space-y-4 rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-800">Thông tin template</h3>
            {selectedTemplate ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-medium">{selectedTemplate.name}</p>
                <p className="text-gray-600">{selectedTemplate.description ?? "Không có mô tả"}</p>
                <p className="text-xs text-gray-500">{selectedTemplate.fields?.length ?? 0} fields</p>
                <div className="rounded bg-gray-50 p-3 text-xs text-gray-600">
                  <pre>{JSON.stringify(selectedTemplate.fields ?? [], null, 2)}</pre>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chọn template để xem cấu hình.</p>
            )}

            {result ? (
              <div className="rounded bg-green-50 p-3 text-sm text-green-700">
                <p className="font-semibold">Chứng từ đã tạo:</p>
                <p>Reference: {result.reference}</p>
                <p>Document ID: {result.documentId ?? "(N/A)"}</p>
                <p>Hết hạn link: {result.fileUrlExpiresAt}</p>
                <a
                  href={result.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[color:var(--color-primary)] hover:underline"
                >
                  Xem PDF
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
