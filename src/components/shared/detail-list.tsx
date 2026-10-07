import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function DetailList({
  items,
  className,
}: {
  items: Array<{ label: string; value: ReactNode; hidden?: boolean }>
  className?: string
}) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4 sm:grid-cols-2", className)}>
      {items
        .filter((item) => !item.hidden)
        .map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm break-words">{item.value}</dd>
          </div>
        ))}
    </dl>
  )
}
