import { PropertyDetailSkeleton } from "@/components/properties/property-detail-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertyLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <Skeleton className="h-8 w-28" />
      <PropertyDetailSkeleton />
    </div>
  )
}
