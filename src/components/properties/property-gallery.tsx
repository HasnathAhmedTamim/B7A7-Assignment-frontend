"use client"

import Image from "next/image"
import { useState } from "react"

import { PropertyVisual } from "@/components/shared/property-visual"
import { cn } from "@/lib/utils"
import type { Property } from "@/types/models"

export function PropertyGallery({
  property,
}: {
  property: Pick<Property, "title" | "propertyType" | "images">
}) {
  const { images, title } = property
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <PropertyVisual
        type={property.propertyType}
        size="lg"
        className="aspect-[21/9] rounded-xl border"
      />
    )
  }

  const index = Math.min(selected, images.length - 1)
  const current = images[index]

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
        {current ? (
          <Image
            key={current.id}
            src={current.url}
            alt={`${title}, photo ${index + 1} of ${images.length}`}
            fill
            sizes="(min-width: 1280px) 860px, (min-width: 1024px) 60vw, 100vw"
            priority={index === 0}
            className="object-cover"
          />
        ) : null}
        {images.length > 1 ? (
          <span className="absolute right-3 bottom-3 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium tabular-nums">
            {index + 1} / {images.length}
          </span>
        ) : null}
      </div>
      {images.length > 1 ? (
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1" aria-label="Photos">
          {images.map((image, i) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block h-16 w-24 overflow-hidden rounded-md outline-offset-2 transition-opacity focus-visible:outline-2 focus-visible:outline-ring sm:h-20 sm:w-28",
                  i === index ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image.url} alt="" fill sizes="112px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
