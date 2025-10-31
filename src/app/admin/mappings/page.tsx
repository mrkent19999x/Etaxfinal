"use client"
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useRequireAdmin } from "@/hooks/use-admin-auth"
import {
  listUserAccounts,
  getMapping,
  saveMapping,
  type MappingRow,
  type Account,
} from "@/lib/data-store"

const TARGET_FIELDS = [
  { value: "taxCode", label: "Mã số thuế" },
  { value: "fullName", label: "Họ và tên" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Số điện thoại" },
  { value: "address", label: "Địa chỉ" },
  { value: "issuedDate", label: "Ngày cấp MST" },
] as const

function createRow(): MappingRow {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return {
    id,
    sourceField: "",
    targetField: "",
    required: false,
  }
}

export default function AdminMappingsPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [selectedMst, setSelectedMst] = useState<string>("")
  const [rows, setRows] = useState<MappingRow[]>([])
  const [statusMessage, setStatusMessage] = useState<string>("")

  useEffect(() => {
    if (!isAdmin) return
    const data = listUserAccounts()
    setAccounts(data)
    if (data.length > 0) {
      setSelectedAccountId((prev) => prev || data[0].id)
      setSelectedMst((prev) => prev || data[0].mstList[0] || "")
    }
  }, [isAdmin])

  useEffect(() => {
    if (!selectedMst) {
      setRows([])
      return
    }
    const mapping = getMapping(selectedMst)
    if (mapping.length > 0) {
      setRows(mapping)
    } else {
      setRows([
        { ...createRow(), targetField: "taxCode", required: true },
        { ...createRow(), targetField: "fullName", required: true },
      ])
    }
  }, [selectedMst])

  const currentAccount = useMemo(() => accounts.find((account) => account.id === selectedAccountId), [accounts, selectedAccountId])

  const handleAccountChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextAccountId = event.target.value
    setSelectedAccountId(nextAccountId)
    const account = accounts.find((item) => item.id === nextAccountId)
    setSelectedMst(account?.mstList?.[0] ?? "")
  }

  const handleMstChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMst(event.target.value)
  }

  const updateRow = (id: string, updates: Partial<MappingRow>) => {
    setRows((previous) => previous.map((row) => (row.id === id ? { ...row, ...updates } : row)))
  }

  const addRow = () => {
    setRows((previous) => [...previous, createRow()])
  }

  const removeRow = (id: string) => {
    setRows((previous) => (previous.length > 1 ? previous.filter((row) => row.id !== id) : previous))
  }

  const handleSave = () => {
    if (!selectedMst) {
      setStatusMessage("Chọn MST để lưu cấu hình")
      return
    }
    saveMapping(selectedMst, rows)
    setStatusMessage("Đã lưu cấu hình mapping")
    setTimeout(() => setStatusMessage(""), 3000)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-red-600" />
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Mapping MST</h2>
          <p className="text-gray-600">Quản lý cấu hình ghép cột dữ liệu cho từng người dùng.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-700">Chọn tài khoản người dùng</span>
            <select
              value={selectedAccountId}
              onChange={handleAccountChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.email})
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-700">Chọn MST</span>
            <select
              value={selectedMst}
              onChange={handleMstChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              {(currentAccount?.mstList ?? []).map((mst) => (
                <option key={mst} value={mst}>
                  {mst}
                </option>
              ))}
            </select>
          </label>
        </section>

        {selectedMst ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Cấu hình mapping cho MST {selectedMst}</h3>
              <div className="flex gap-3">
                <button
                  onClick={addRow}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600"
                >
                  Thêm dòng
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={row.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-gray-700">Cột {index + 1}</p>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      Xóa
                    </button>
                  </div>

                  <label className="mt-3 block space-y-1 text-sm text-gray-700">
                    <span>Tên cột trong nguồn dữ liệu</span>
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                      placeholder="Ví dụ: MST_NGUOIPHU"
                      value={row.sourceField}
                      onChange={(event) => updateRow(row.id, { sourceField: event.target.value })}
                    />
                  </label>

                  <label className="mt-3 block space-y-1 text-sm text-gray-700">
                    <span>Ghép sang trường hệ thống</span>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                      value={row.targetField}
                      onChange={(event) => updateRow(row.id, { targetField: event.target.value })}
                    >
                      <option value="">-- Chọn trường đích --</option>
                      {TARGET_FIELDS.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-3 flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={row.required}
                      onChange={(event) => updateRow(row.id, { required: event.target.checked })}
                    />
                    Bắt buộc nhập
                  </label>
                </div>
              ))}
            </div>

            {statusMessage && <p className="text-sm font-medium text-green-600">{statusMessage}</p>}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
            Chọn tài khoản có MST để cấu hình mapping.
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
/* eslint-enable react-hooks/set-state-in-effect */
