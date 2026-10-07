import { BathIcon, BedDoubleIcon, DoorOpenIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"

import { PropertyCover } from "@/components/properties/property-cover"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney, pluralize } from "@/lib/format"
import { propertyTypeLabel } from "@/lib/labels"
import type { Property } from "@/types/models"

export function PropertyCard({ property }: { property: Property }) {
  const availableRooms = property._count.rooms
  return (
    <Card className="group/property relative gap-0 py-0 transition-shadow hover:shadow-md">
      <PropertyCover
        property={property}
        alt=""
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/9]"
        imageClassName="transition-transform duration-300 group-hover/property:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {propertyTypeLabel[property.propertyType]}
            </p>
            <h3 className="mt-0.5 line-clamp-1 font-medium">
              <Link
                href={`/properties/${property.id}`}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                {property.title}
              </Link>
            </h3>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {property.location ? `${property.location}, ` : ""}
            {property.city}
          </span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDoubleIcon className="size-3.5" aria-hidden />
            {pluralize(property.bedrooms, "bed")}
          </span>
          <span className="flex items-center gap-1.5">
            <BathIcon className="size-3.5" aria-hidden />
            {pluralize(property.bathrooms, "bath")}
          </span>
          <span className="flex items-center gap-1.5">
            <DoorOpenIcon className="size-3.5" aria-hidden />
            {availableRooms > 0 ? `${pluralize(availableRooms, "room")} free` : "Fully booked"}
          </span>
        </div>
        <div className="mt-auto flex items-baseline gap-1 border-t pt-3">
          <span className="text-lg font-semibold tabular-nums">
            {formatMoney(property.monthlyRent)}
          </span>
          <span className="text-sm text-muted-foreground">/ month</span>
        </div>
      </div>
    </Card>
  )
}

export function PropertyCardSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-28" />
      </div>
    </Card>
  )
}

export function PropertyGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <PropertyGrid>
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </PropertyGrid>
  )
}
