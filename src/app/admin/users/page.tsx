"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useRequireAdmin } from "@/hooks/use-admin-auth"
import { Plus, Edit, Trash2, Search } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  mstList?: string[]
  mst?: string
}

export default function AdminUsersPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    mstList: [] as string[],
    mstInput: ""
  })

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { getUsers } = await import("@/lib/admin-service")
      const data = await getUsers()
      setUsers(data.users)
    } catch (error) {
      console.error("Error loading users:", error)
      alert("Lỗi khi tải danh sách users: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      mstList: [],
      mstInput: ""
    })
    setShowModal(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user",
      mstList: user.mstList || [],
      mstInput: ""
    })
    setShowModal(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Bạn có chắc muốn xóa user này?")) return

    try {
      const { deleteUser } = await import("@/lib/admin-service")
      await deleteUser(userId)
      loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Lỗi khi xóa user: " + (error as Error).message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { createUser, updateUser } = await import("@/lib/admin-service")
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: formData.name,
          role: formData.role,
          mstList: formData.mstList,
        })
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          mstList: formData.mstList,
        })
      }
      setShowModal(false)
      loadUsers()
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Lỗi khi lưu user: " + (error as Error).message)
    }
  }

  const addMst = () => {
    if (formData.mstInput.trim()) {
      setFormData({
        ...formData,
        mstList: [...formData.mstList, formData.mstInput.trim()],
        mstInput: ""
      })
    }
  }

  const removeMst = (index: number) => {
    setFormData({
      ...formData,
      mstList: formData.mstList.filter((_, i) => i !== index)
    })
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
            <h2 className="text-2xl font-bold text-gray-800">Quản lý Users</h2>
            <p className="text-gray-600 mt-1">Tạo, sửa, xóa người dùng</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus size={20} />
            Tạo User Mới
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Đang tải...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Chưa có user nào</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MST List</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(user.mstList || []).slice(0, 2).map((mst, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {mst}
                          </span>
                        ))}
                        {user.mstList && user.mstList.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            +{user.mstList.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded ml-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                {editingUser ? "Sửa User" : "Tạo User Mới"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "user" })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Danh sách MST</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.mstInput}
                      onChange={(e) => setFormData({ ...formData, mstInput: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMst())}
                      placeholder="Nhập MST và Enter"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={addMst}
                      className="px-4 py-2 bg-gray-200 rounded-lg"
                    >
                      Thêm
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.mstList.map((mst, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 rounded text-sm flex items-center gap-2"
                      >
                        {mst}
                        <button
                          type="button"
                          onClick={() => removeMst(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {editingUser ? "Cập nhật" : "Tạo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

