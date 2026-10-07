"use client"

import { RouteError } from "@/components/shared/route-error"

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      title="This part of the admin console didn't load"
      homeHref="/admin"
      homeLabel="Back to overview"
    />
  )
}
