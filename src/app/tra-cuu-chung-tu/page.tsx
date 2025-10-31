"use client"

import { DetailHeader } from "@/components/detail-header"
import { Calendar } from "lucide-react"
import { useState } from "react"
import { ProtectedView } from "@/components/protected-view"

interface TaxDocument {
  id: number
  maThamChieu: string
  soTien: string
  ngayNop: string
  trangThai: string
}

export default function TraCuuChungTuPage() {
  const [referenceCode, setReferenceCode] = useState("")
  const [fromDate, setFromDate] = useState("10/10/2025")
  const [toDate, setToDate] = useState("10/10/2025")
  const [searched, setSearched] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<TaxDocument | null>(null)

  const mockResults: TaxDocument[] = [
    {
      id: 1,
      maThamChieu: "110202500044818128",
      soTien: "9,600",
      ngayNop: "11/10/2025 12:36:52",
      trangThai: "Thành công - NH/TGTT đã trừ tiền thành công",
    },
  ]

  const handleSearch = () => {
    setSearched(true)
    if (!referenceCode) {
      setHasResults(true)
    } else {
      setHasResults(false)
    }
  }

  const handlePrintClick = (doc: TaxDocument) => {
    setSelectedDocument(doc)
    setShowPrintModal(true)
  }

  const handleConfirmPrint = () => {
    setShowPrintModal(false)
    setShowPdfViewer(true)
  }

  return (
    <ProtectedView>
      <div className="h-full bg-gray-800 flex flex-col">
        <DetailHeader title="Tra cứu chứng từ" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-4 py-6 space-y-6">
            {/* Reference Code */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Mã tham chiếu</label>
              <input
                type="text"
                placeholder="Nhập mã tham chiếu"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] placeholder-gray-400"
              />
            </div>

            {/* From Date */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Từ ngày <span className="text-[color:var(--color-primary)]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-700 pointer-events-none" />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Đến ngày <span className="text-[color:var(--color-primary)]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                />
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-700 pointer-events-none" />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full bg-[color:var(--color-primary)] hover:opacity-90 text-white font-medium py-3 rounded-full transition-colors"
            >
              Tra cứu
            </button>

            {/* No Data Message */}
            {searched && !hasResults && (
              <div className="text-center py-8">
                <p className="text-[color:var(--color-primary)] font-medium">Không tìm thấy dữ liệu</p>
              </div>
            )}

            {/* Results Table */}
            {searched && hasResults && (
              <div className="space-y-4">
                <table className="w-full border-collapse" style={{ fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif" }}>
                  <thead>
                    <tr>
                      <th className="w-[25%] text-left font-semibold text-[14px] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] text-[#333333]" style={{ fontWeight: 600, letterSpacing: '0.2px', padding: '8px 12px' }}>
                        Mã tham chiếu
                      </th>
                      <th className="w-[15%] text-right font-semibold text-[14px] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] text-[#333333]" style={{ fontWeight: 600, letterSpacing: '0.2px', padding: '8px 12px' }}>
                        Số tiền
                      </th>
                      <th className="w-[20%] text-center font-semibold text-[14px] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] text-[#333333]" style={{ fontWeight: 600, letterSpacing: '0.2px', padding: '8px 12px' }}>
                        Ngày nộp
                      </th>
                      <th className="w-[30%] text-left font-semibold text-[14px] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] text-[#333333]" style={{ fontWeight: 600, letterSpacing: '0.2px', padding: '8px 12px' }}>
                        Trạng thái
                      </th>
                      <th className="w-[10%] text-center font-semibold text-[14px] border border-[color:var(--color-border-weak)] bg-[color:var(--color-surface-muted)] text-[#333333]" style={{ fontWeight: 600, letterSpacing: '0.2px', padding: '8px 12px' }}>
                        In chứng từ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResults.map((result) => (
                      <tr key={result.id} className="hover:bg-[#f0f8ff] transition-colors duration-200" style={{ minHeight: '40px' }}>
                        {/* Cột 1: Mã tham chiếu - 3 dòng (110202, 50044, 818128) */}
                        <td className="text-left text-[14px] border border-[color:var(--color-border-weak)] bg-white text-black align-middle" style={{ 
                          padding: '8px 12px', 
                          whiteSpace: 'normal', 
                          lineHeight: '1.4', 
                          wordBreak: 'break-word',
                          letterSpacing: '0.2px',
                          fontWeight: 400
                        }}>
                          {result.maThamChieu.slice(0, 6)}
                          <br />
                          {result.maThamChieu.slice(6, 11)}
                          <br />
                          {result.maThamChieu.slice(11)}
                        </td>
                        
                        {/* Cột 2: Số tiền - căn phải */}
                        <td className="text-right text-[14px] border border-[color:var(--color-border-weak)] bg-white text-black align-middle" style={{ 
                          padding: '8px 12px',
                          letterSpacing: '0.2px',
                          fontWeight: 400
                        }}>
                          {result.soTien}
                        </td>
                        
                        {/* Cột 3: Ngày nộp - căn giữa */}
                        <td className="text-center text-[14px] border border-[color:var(--color-border-weak)] bg-white text-black align-middle" style={{ 
                          padding: '8px 12px',
                          letterSpacing: '0.2px',
                          fontWeight: 400
                        }}>
                          {result.ngayNop}
                        </td>
                        
                        {/* Cột 4: Trạng thái - wrap tự động */}
                        <td className="text-left text-[14px] border border-[color:var(--color-border-weak)] bg-white text-black align-middle" style={{ 
                          padding: '8px 12px', 
                          whiteSpace: 'normal', 
                          lineHeight: '1.4', 
                          wordBreak: 'break-word',
                          letterSpacing: '0.2px',
                          fontWeight: 400
                        }}>
                          {result.trangThai}
                        </td>
                        
                        {/* Cột 5: In chứng từ - Radio button */}
                        <td className="text-center border border-[color:var(--color-border-weak)] bg-white align-middle" style={{ padding: '8px 12px' }}>
                          <button
                            onClick={() => handlePrintClick(result)}
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#e60000] hover:opacity-80 transition-opacity"
                            style={{ 
                              width: '16px', 
                              height: '16px',
                              border: '2px solid #e60000',
                              borderRadius: '50%',
                              position: 'relative'
                            }}
                          >
                            <span 
                              className="absolute rounded-full"
                              style={{
                                top: '3px',
                                left: '3px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#e60000',
                                borderRadius: '50%'
                              }}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Print Button */}
                <button
                  onClick={() => handlePrintClick(mockResults[0])}
                  className="w-full bg-[color:var(--color-primary)] hover:opacity-90 text-white font-medium py-3 rounded-full transition-colors"
                >
                  In chứng từ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-2xl p-6 space-y-4 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-800">Xác nhận in chứng từ</h3>
            <p className="text-gray-600">Bạn có muốn in chứng từ này không?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 px-4 py-3 border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmPrint}
                className="flex-1 px-4 py-3 bg-[color:var(--color-primary)] text-white font-medium rounded-lg hover:opacity-90 transition-colors"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {showPdfViewer && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* PDF Header */}
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-300">
            <div className="flex-1 text-center">
              <p className="text-gray-800 font-semibold text-sm truncate">{selectedDocument?.maThamChieu}</p>
            </div>
            <button onClick={() => setShowPdfViewer(false)} className="text-blue-600 font-medium text-sm">
              Done
            </button>
          </div>

          {/* PDF Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-200 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl shadow-lg p-8 space-y-6 text-sm">
              {/* PDF Document Simulation */}
              <div className="space-y-4">
                <div className="text-center font-bold text-lg mb-6">GIẤY NỘP TIỀN VÀO NGÂN SÁCH NHÀ NƯỚC</div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold">Người nộp tiền:</p>
                    <p>Hoàng Đức Dũng</p>
                  </div>
                  <div>
                    <p className="font-semibold">Địa chỉ:</p>
                    <p>225, Phương Cao Xanh</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Chi tiết nộp tiền:</p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-1">Nội dung</th>
                        <th className="text-right py-2 px-1">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-1">Thuế thu nhập cá nhân</td>
                        <td className="text-right py-2 px-1">9,600</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-1 font-semibold">Tổng cộng</td>
                        <td className="text-right py-2 px-1 font-semibold">9,600</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t pt-4 text-xs">
                  <p className="font-semibold mb-2">Xác nhận:</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Ngân hàng TMCP Kỹ thương Việt Nam</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Cục Thuế</span>
                  </div>
                </div>

                <div className="border-t pt-4 text-xs text-gray-600">
                  <p>11/10/2025 12:40:28</p>
                </div>
              </div>

              {/* Page 2 Simulation */}
              <div className="border-t-4 border-gray-300 pt-6 space-y-4">
                <div className="text-center font-bold text-lg mb-6">GIẤY NỘP TIỀN VÀO NGÂN SÁCH NHÀ NƯỚC (Trang 2)</div>
                <p className="text-gray-600">Nội dung trang 2 của chứng từ...</p>
              </div>

              {/* Page 3 Simulation */}
              <div className="border-t-4 border-gray-300 pt-6 space-y-4">
                <div className="text-center font-bold text-lg mb-6">GIẤY NỘP TIỀN VÀO NGÂN SÁCH NHÀ NƯỚC (Trang 3)</div>
                <p className="text-gray-600">Nội dung trang 3 của chứng từ...</p>
              </div>
            </div>
          </div>

          {/* PDF Footer */}
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-t border-gray-300">
            <button className="text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </ProtectedView>
  )
}
