import { PropertyGridSkeleton } from "@/components/properties/property-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertiesLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6"
      aria-busy="true"
      aria-label="Loading homes"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-9 w-full" />
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Skeleton className="hidden h-96 w-full rounded-xl lg:block" />
        <PropertyGridSkeleton />
      </div>
    </div>
  )
}
