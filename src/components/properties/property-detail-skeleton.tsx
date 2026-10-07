import { Skeleton } from "@/components/ui/skeleton"

export function PropertyDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-busy="true">
      <div className="space-y-6">
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  )
}
