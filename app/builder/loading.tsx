import { Skeleton } from '@/components/Skeleton'

export default function BuilderLoading() {
  return (
    <div className="min-h-screen bg-[#050609] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}