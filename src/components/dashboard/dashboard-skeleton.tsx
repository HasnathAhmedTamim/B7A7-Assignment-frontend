import { DataTableSkeleton } from "@/components/shared/data-table"
import { StatCardSkeleton, StatGrid } from "@/components/shared/stat-card"
import { Skeleton } from "@/components/ui/skeleton"

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  )
}

export function DashboardPageSkeleton({ stats = false }: { stats?: boolean }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <PageHeaderSkeleton />
      {stats ? (
        <StatGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </StatGrid>
      ) : null}
      <DataTableSkeleton />
    </div>
  )
}
