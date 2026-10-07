"use client"

import { RouteError } from "@/components/shared/route-error"

export default function AuthError({
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
      title="This page didn't load"
      homeHref="/"
      homeLabel="Back to home"
    />
  )
}
