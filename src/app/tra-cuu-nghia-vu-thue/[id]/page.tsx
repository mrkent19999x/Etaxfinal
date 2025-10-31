"use client"

import { DetailHeader } from "@/components/detail-header"
import { useBodyLock } from "@/hooks/use-body-lock"

interface ObligationDetail {
  paymentOrder: string
  accountId: string
  decisionNumber: string
  decisionDate: string
  taxAuthority: string
  chapter: string
  taxPeriod: string
  item: string
  administrativeArea: string
  deadline: string
  amount: string
  amountPaid: string
  obligationType: string
  referenceNumber: string
  status: string
}

// Mock data for obligation details
const obligationDetails: Record<string, ObligationDetail> = {
  "1": {
    paymentOrder: "1",
    accountId: "04057451314300001",
    decisionNumber: "857",
    decisionDate: "19/05/2025",
    taxAuthority: "Phương Cao Xanh - Thuế cơ số 1 tính Quảng Ninh",
    chapter: "857",
    taxPeriod: "00/CN/2025",
    item: "Thu từ đặt ở tại đô thị (1602)",
    administrativeArea: "Phương Cao Xanh (06658)",
    deadline: "31/10/2025",
    amount: "9,600 VND",
    amountPaid: "9,600 VND",
    obligationType: "Còn phải nộp",
    referenceNumber: "",
    status: "Các khoản phải nộp",
  },
  "2": {
    paymentOrder: "2",
    accountId: "04057451314300002",
    decisionNumber: "858",
    decisionDate: "20/05/2025",
    taxAuthority: "Phương Cao Xanh - Thuế cơ số 1 tính Quảng Ninh",
    chapter: "858",
    taxPeriod: "01/CN/2025",
    item: "Tiền chậm nộp (1603)",
    administrativeArea: "Phương Cao Xanh (06658)",
    deadline: "01/11/2025",
    amount: "5,200 VND",
    amountPaid: "5,200 VND",
    obligationType: "Còn phải nộp",
    referenceNumber: "",
    status: "Các khoản phải nộp",
  },
  "3": {
    paymentOrder: "3",
    accountId: "04057451314300003",
    decisionNumber: "859",
    decisionDate: "21/05/2025",
    taxAuthority: "Phương Cao Xanh - Thuế cơ số 1 tính Quảng Ninh",
    chapter: "859",
    taxPeriod: "02/CN/2025",
    item: "Khoản thu khác (1604)",
    administrativeArea: "Phương Cao Xanh (06658)",
    deadline: "02/11/2025",
    amount: "3,400 VND",
    amountPaid: "3,400 VND",
    obligationType: "Còn phải nộp",
    referenceNumber: "",
    status: "Các khoản phải nộp",
  },
}

export default function ObligationDetailPage({ params }: { params: { id: string } }) {
  useBodyLock(true)
  const detail = obligationDetails[params.id] || obligationDetails["1"]

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      <DetailHeader title="Thông tin chi tiết" />

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="mx-4 mt-6 bg-white rounded-lg p-6 shadow-sm space-y-4">
          <DetailRow label="Thứ tự thanh toán" value={detail.paymentOrder} />
          <DetailRow label="ID khoản phải nộp" value={detail.accountId} />
          <DetailRow label="Số quyết định/Số thông báo" value={detail.decisionNumber} />
          <DetailRow label="Ngày quyết định/Ngày thông báo" value={detail.decisionDate} />
          <DetailRow label="Tên cơ quan thu" value={detail.taxAuthority} />
          <DetailRow label="Chương" value={detail.chapter} />
          <DetailRow label="Kỳ thuế" value={detail.taxPeriod} />
          <DetailRow label="Tiêu mục" value={detail.item} />
          <DetailRow label="Địa bản hành chính" value={detail.administrativeArea} />
          <DetailRow label="Hạn nộp" value={detail.deadline} />
          <DetailRow label="Số tiền" value={detail.amount} />
          <DetailRow label="Số tiền đã nộp" value={detail.amountPaid} />
          <DetailRow label="Loại nghĩa vụ" value={detail.obligationType} />
          <DetailRow label="Số tham chiếu" value={detail.referenceNumber || "—"} />
          <DetailRow label="Trạng thái" value={detail.status} />
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0">
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className="text-gray-800 font-semibold text-sm text-right">{value}</p>
    </div>
  )
}
