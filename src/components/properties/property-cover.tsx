import Image from "next/image"

import { PropertyVisual } from "@/components/shared/property-visual"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/models"

/** The property's first photo, or its type illustration when it has none. */
export function PropertyCover({
  property,
  sizes,
  alt,
  className,
  imageClassName,
  priority,
}: {
  property: Pick<Property, "propertyType" | "images">
  sizes: string
  alt: string
  className?: string
  imageClassName?: string
  priority?: boolean
}) {
  const cover = property.images[0]
  if (!cover) return <PropertyVisual type={property.propertyType} className={className} />
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={cover.url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  )
}
