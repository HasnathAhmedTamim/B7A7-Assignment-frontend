"use client"

import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

export function ErrorState({
  error,
  title = "Something went wrong",
  onRetry,
  className,
}: {
  error?: unknown
  title?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <Empty role="alert" className={cn("border border-destructive/20 bg-card py-12", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
          <AlertTriangleIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcwIcon data-icon="inline-start" />
            Try again
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
