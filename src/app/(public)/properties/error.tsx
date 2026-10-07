"use client"

import { RouteError } from "@/components/shared/route-error"

export default function PropertiesError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <RouteError error={error} retry={retry} title="We couldn't load homes right now" />
}
