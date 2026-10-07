import type { LucideIcon } from "lucide-react"
import { Building2Icon, HomeIcon, HotelIcon, UsersIcon, WarehouseIcon } from "lucide-react"

import { propertyTypeLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { PropertyType } from "@/types/models"

const visuals: Record<PropertyType, { icon: LucideIcon; tone: string }> = {
  APARTMENT: { icon: Building2Icon, tone: "bg-chart-1/12 text-chart-1" },
  HOUSE: { icon: HomeIcon, tone: "bg-chart-2/15 text-[oklch(0.5_0.12_65)] dark:text-chart-2" },
  STUDIO: { icon: HotelIcon, tone: "bg-chart-3/12 text-chart-3" },
  SHARED: { icon: UsersIcon, tone: "bg-chart-4/12 text-chart-4" },
  OTHER: { icon: WarehouseIcon, tone: "bg-chart-5/15 text-chart-5" },
}

/**
 * Listings have no photos in the backend, so each property gets a consistent
 * type-based illustration instead of a stock image.
 */
export function PropertyVisual({
  type,
  className,
  size = "md",
}: {
  type: PropertyType
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const { icon: Icon, tone } = visuals[type]
  return (
    <div
      role="img"
      aria-label={`${propertyTypeLabel[type]} illustration`}
      className={cn("relative flex items-center justify-center overflow-hidden", tone, className)}
    >
      <svg aria-hidden className="absolute inset-0 size-full opacity-[0.07]">
        <defs>
          <pattern id={`grid-${type}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${type})`} />
      </svg>
      <Icon
        aria-hidden
        strokeWidth={1.25}
        className={cn(size === "sm" ? "size-6" : size === "lg" ? "size-16" : "size-10")}
      />
    </div>
  )
}
