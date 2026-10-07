"use client"

import { RouteError } from "@/components/shared/route-error"

export default function LandlordError({
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
      title="This part of your workspace didn't load"
      homeHref="/landlord"
      homeLabel="Back to overview"
    />
  )
}
