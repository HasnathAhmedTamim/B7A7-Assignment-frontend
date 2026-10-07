import type { LucideIcon } from "lucide-react"
import { InboxIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  headingLevel,
  className,
}: {
  icon?: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  /** Set when the empty state is the main content of a page, so it carries the page heading. */
  headingLevel?: 1 | 2
  className?: string
}) {
  return (
    <Empty className={cn("border bg-card py-12", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle {...(headingLevel ? { role: "heading", "aria-level": headingLevel } : {})}>
          {title}
        </EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}
