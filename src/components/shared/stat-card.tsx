import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: LucideIcon
  className?: string
}) {
  return (
    <Card className={cn("gap-3 px-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon ? (
          <span className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-3 px-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8 rounded-md" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-32" />
    </Card>
  )
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4", className)}>
      {children}
    </div>
  )
}
