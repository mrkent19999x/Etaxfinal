"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { DetailHeader } from "@/components/detail-header"
import { ProtectedView } from "@/components/protected-view"

interface DocumentRecord {
  id: string
  reference: string
  fileUrl: string
  filePath?: string
  effectiveDate: string
  createdAt: string
  status?: string
  payload?: Record<string, any>
}

interface FieldDefinition {
  fieldId: string
  label?: string
  placeholder?: string
  type?: string
  style?: Record<string, any>
}

export default function TraCuuChungTuPage() {
  const [referenceCode, setReferenceCode] = useState("")
  const [fromDate, setFromDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [toDate, setToDate] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [error, setError] = useState<string>("")
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null)
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([])

  const hasSearched = useMemo(() => loading || documents.length > 0 || !!error, [loading, documents.length, error])

  const fetchDocuments = async () => {
    setLoading(true)
    setError("")
    try {
      const query = new URLSearchParams()
      if (referenceCode.trim()) query.set("reference", referenceCode.trim())
      if (fromDate) query.set("fromDate", new Date(fromDate).toISOString())
      if (toDate) query.set("toDate", new Date(toDate).toISOString())

      const res = await fetch(`/api/documents?${query.toString()}`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error ?? "Không thể tải chứng từ")
      }
      const data = await res.json()
      setDocuments(data.documents ?? [])
    } catch (err: any) {
      console.error(err)
      setError(err?.message ?? "Không thể tải chứng từ")
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/field-definitions/tra-cuu-chung-tu")
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setFieldDefinitions(data.definitions ?? [])
        }
      } catch (error) {
        console.warn("Không thể tải field definitions", error)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const getField = (fieldId: string) => fieldDefinitions.find((field) => field.fieldId === fieldId)

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    fetchDocuments().catch(console.error)
  }

  const handleOpenPdf = (doc: DocumentRecord) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank", "noopener")
    } else {
      setSelectedDocument(doc)
    }
  }

  return (
    <ProtectedView>
      <div className="flex h-full flex-col bg-gray-100">
        <DetailHeader title="Tra cứu chứng từ" />
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="space-y-6 px-4 py-6">
            <form className="space-y-4" onSubmit={handleSearch}>
              <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {getField("reference")?.label ?? "Mã tham chiếu"}
              </label>
              <input
                type="text"
                placeholder={getField("reference")?.placeholder ?? "Nhập mã tham chiếu"}
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] placeholder-gray-400"
              />
            </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {getField("fromDate")?.label ?? (
                      <>
                        Từ ngày <span className="text-[color:var(--color-primary)]">*</span>
                      </>
                    )}
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {getField("toDate")?.label ?? (
                      <>
                        Đến ngày <span className="text-[color:var(--color-primary)]">*</span>
                      </>
                    )}
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[color:var(--color-primary)] py-3 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Đang tra cứu..." : "Tra cứu"}
              </button>
            </form>

            {error ? (
              <div className="rounded bg-red-50 p-4 text-red-700">{error}</div>
            ) : null}

            {hasSearched && !loading && documents.length === 0 && !error ? (
              <div className="py-8 text-center">
                <p className="font-medium text-[color:var(--color-primary)]">Không tìm thấy dữ liệu</p>
              </div>
            ) : null}

            {documents.length > 0 ? (
              <div className="space-y-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="w-[25%] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-left font-semibold text-gray-700">Mã tham chiếu</th>
                      <th className="w-[20%] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-left font-semibold text-gray-700">Ngày</th>
                      <th className="w-[20%] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-right font-semibold text-gray-700">Số tiền</th>
                      <th className="w-[25%] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-left font-semibold text-gray-700">Trạng thái</th>
                      <th className="w-[10%] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] px-3 py-2 text-center font-semibold text-gray-700">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="border border-[color:var(--color-border-weak)] px-3 py-2 font-medium text-gray-800">{doc.reference}</td>
                        <td className="border border-[color:var(--color-border-weak)] px-3 py-2 text-gray-700">
                          {doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleString("vi-VN") : ""}
                        </td>
                        <td className="border border-[color:var(--color-border-weak)] px-3 py-2 text-right text-gray-700">
                          {doc.payload?.amount ? Number(doc.payload.amount).toLocaleString("vi-VN") : "-"}
                        </td>
                        <td className="border border-[color:var(--color-border-weak)] px-3 py-2 text-gray-700">
                          {doc.status ?? "Đã tạo"}
                        </td>
                        <td className="border border-[color:var(--color-border-weak)] px-3 py-2 text-center">
                          <button
                            onClick={() => handleOpenPdf(doc)}
                            className="text-[color:var(--color-primary)] hover:underline"
                          >
                            In chứng từ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {selectedDocument && !selectedDocument.fileUrl ? (
              <div className="rounded bg-yellow-50 p-3 text-sm text-yellow-800">
                <p>Chứng từ này chưa có file PDF. Vui lòng liên hệ quản trị viên.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ProtectedView>
  )
}
