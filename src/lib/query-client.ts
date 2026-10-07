import { isServer, MutationCache, QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage, isApiError } from "@/lib/api/errors"

function makeQueryClient() {
  const client: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isApiError(error) && error.status >= 400 && error.status < 500) return false
          return failureCount < 2
        },
      },
      mutations: { retry: false },
    },
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.suppressErrorToast) return
        toast.error(getErrorMessage(error))
        // A 409 means our copy is stale: pull the server's current state.
        if (isApiError(error) && error.isConflict) {
          void client.invalidateQueries()
        }
      },
    }),
  })
  return client
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}
