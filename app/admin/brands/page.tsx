import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/server-user'
import { AdminBrandsClient } from './brand-management-client'

export default async function AdminBrandsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/?auth=required&next=/admin/brands')
  }

  if (user.vaiTro !== 'QUAN_TRI_VIEN') {
    redirect('/?auth=forbidden&next=/admin/brands')
  }

  return <AdminBrandsClient />
}
