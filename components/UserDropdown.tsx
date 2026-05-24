'use client'

import { ChevronDown, KeyRound, LogOut, Package, Settings, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserDropdown() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const t = useTranslations('userMenu')

  if (!user) return null

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 text-left transition hover:border-[#F7931A]/40 hover:bg-[#F7931A]/10 focus:outline-none">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-sm font-bold text-white shadow-[0_8px_30px_rgba(247,147,26,0.28)]">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block max-w-[9rem] truncate text-sm font-semibold text-white">{user.name}</span>
            <span className="block max-w-[9rem] truncate text-xs text-slate-400">{user.email}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500 transition group-data-[state=open]:rotate-180 group-hover:text-slate-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t('account')}</DropdownMenuLabel>
        <div className="px-3 pb-2 text-sm text-slate-400">
          <div className="font-medium text-white">{user.name}</div>
          <div className="truncate">{user.email}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="h-4 w-4" />
          {t('profile')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/orders')}>
          <Package className="h-4 w-4" />
          {t('orders')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/account/codes')}>
          <KeyRound className="h-4 w-4" />
          Ma cua toi
        </DropdownMenuItem>
        {user.role === 'QUAN_TRI_VIEN' && (
          <DropdownMenuItem onClick={() => router.push('/admin')}>
            <Settings className="h-4 w-4" />
            {t('admin')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logout()} className="text-rose-300 focus:text-rose-200">
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
