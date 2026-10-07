"use client"

import { RouteError } from "@/components/shared/route-error"

export default function TenantError({
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
      title="This part of your dashboard didn't load"
      homeHref="/dashboard"
      homeLabel="Back to overview"
    />
  )
}
