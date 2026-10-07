import "@tanstack/react-query"

import type { ApiError } from "@/lib/api/errors"

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError | Error
    mutationMeta: {
      /** The caller renders its own error UI (e.g. inline form errors). */
      suppressErrorToast?: boolean
    }
  }
}
