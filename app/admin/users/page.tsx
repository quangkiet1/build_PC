'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Loader2, Users } from 'lucide-react'
import { useToast } from '@/app/providers/toast-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface User {
  id: string
  hoTen: string
  email: string
  vaiTro: string
  soDienThoai?: string | null
  diaChi?: string | null
  ngayTao: string
}

const roleOptions = [
  { value: 'KHACH_HANG', label: 'Khách hàng' },
  { value: 'QUAN_TRI_VIEN', label: 'Quản trị viên' },
]

export default function AdminUsersPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users', { credentials: 'include' })
      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/users')
        return
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      addToast('Không thể tải danh sách người dùng', 'error')
    } finally {
      setLoading(false)
    }
  }, [router, addToast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateRole = async (userId: string, vaiTro: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vaiTro }),
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/users')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi cập nhật vai trò')
      }

      setUsers((current) => current.map((user) => user.id === userId ? data.user : user))
      addToast('Cập nhật vai trò thành công', 'success')
    } catch (error) {
      console.error('Error updating user role:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi cập nhật người dùng', 'error')
    }
  }

  const deleteUser = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/users')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi xóa người dùng')
      }

      setUsers((current) => current.filter((user) => user.id !== userToDelete.id))
      addToast('Xóa người dùng thành công', 'success')
      setUserToDelete(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi xóa người dùng', 'error')
    }
  }

  const filteredUsers = users.filter((user) =>
    user.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07080d] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Đang tải người dùng...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#07080d] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-800 bg-[#0f1117] p-2.5 text-slate-400 transition hover:border-indigo-500/40 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                <Users className="h-7 w-7 text-indigo-400" />
                Quản lý Người dùng
              </h1>
              <p className="mt-1 text-sm text-slate-400">{users.length} tài khoản đã đăng ký.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#0f1117] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Tên</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Vai trò</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Đăng ký</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-500">
                      Không tìm thấy tài khoản phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#141a26] transition">
                      <td className="px-5 py-4 text-sm text-white">{user.hoTen}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">{user.email}</td>
                      <td className="px-5 py-4 text-sm text-white">
                        <select
                          value={user.vaiTro}
                          onChange={(event) => updateRole(user.id, event.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500/50"
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{new Date(user.ngayTao).toLocaleDateString('vi-VN')}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-xs font-semibold text-rose-300 transition hover:border-rose-500/40 hover:text-white"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Xác nhận xóa người dùng"
        description="Hành động này sẽ xóa tài khoản và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmVariant="destructive"
        onConfirm={deleteUser}
        onOpenChange={(open) => { if (!open) setUserToDelete(null) }}
      />
    </main>
  )
}
