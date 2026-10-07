"use client"

import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { isApiError } from "@/lib/api/errors"

/** Body for `error.tsx` boundaries. Server error messages are redacted in production, so copy stays generic. */
export function RouteError({
  error,
  retry,
  title = "We couldn't load this page",
  homeHref = "/",
  homeLabel = "Go home",
}: {
  error: Error & { digest?: string }
  retry: () => void
  title?: string
  homeHref?: string
  homeLabel?: string
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const offline = isApiError(error) && error.isNetworkError

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-6" aria-hidden />
      </span>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {offline
            ? "We couldn't reach the server. Check your connection and try again."
            : "Something went wrong while loading this page. It's usually temporary, so please try again."}
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => retry()}>
          <RotateCcwIcon data-icon="inline-start" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  )
}
