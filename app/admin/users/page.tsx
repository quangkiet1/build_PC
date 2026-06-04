'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Loader2, Users } from 'lucide-react'
import { useToast } from '@/app/providers/toast-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLocale, useTranslations } from 'next-intl'
import type { AppLocale } from '@/i18n/config'
import { toIntlLocale } from '@/lib/format'

interface User {
  id: string
  hoTen: string
  email: string
  vaiTro: string
  soDienThoai?: string | null
  diaChi?: string | null
  ngayTao: string
}

const roleOptions = ['KHACH_HANG', 'QUAN_TRI_VIEN'] as const

export default function AdminUsersPage() {
  const t = useTranslations('admin.users')
  const commonT = useTranslations('admin.common')
  const locale = useLocale() as AppLocale
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
      addToast(t('loadError'), 'error')
    } finally {
      setLoading(false)
    }
  }, [router, addToast, t])

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
        throw new Error(t('updateError'))
      }

      setUsers((current) => current.map((user) => user.id === userId ? data.user : user))
      addToast(t('updateSuccess'), 'success')
    } catch (error) {
      console.error('Error updating user role:', error)
      addToast(error instanceof Error ? error.message : t('userUpdateError'), 'error')
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

      if (!response.ok) {
        throw new Error(t('deleteError'))
      }

      setUsers((current) => current.filter((user) => user.id !== userToDelete.id))
      addToast(t('deleteSuccess'), 'success')
      setUserToDelete(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      addToast(error instanceof Error ? error.message : t('deleteError'), 'error')
    }
  }

  const filteredUsers = users.filter((user) =>
    user.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030304] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#FFD600]" />
          <p className="text-slate-400">{t('loading')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#030304] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-[#0F1115] p-2.5 text-slate-400 transition hover:border-[#F7931A]/40 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                <Users className="h-7 w-7 text-[#FFD600]" />
                {t('title')}
              </h1>
              <p className="mt-1 text-sm text-slate-400">{t('count', { count: users.length })}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0F1115] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50 focus:ring-1 focus:ring-[#F7931A]/20"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.name')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.email')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.role')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.registered')}</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">{commonT('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-500">
                      {t('empty')}
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
                          className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none transition focus:border-[#F7931A]/50"
                        >
                          {roleOptions.map((option) => (
                            <option key={option} value={option}>
                              {t(`roles.${option}`)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{new Date(user.ngayTao).toLocaleDateString(toIntlLocale(locale))}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-xs font-semibold text-rose-300 transition hover:border-rose-500/40 hover:text-white"
                        >
                          {commonT('delete')}
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
        title={t('confirmTitle')}
        description={t('confirmDescription')}
        confirmLabel={commonT('delete')}
        cancelLabel={commonT('cancel')}
        confirmVariant="destructive"
        onConfirm={deleteUser}
        onOpenChange={(open) => { if (!open) setUserToDelete(null) }}
      />
    </main>
  )
}
