"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createContext, use, useCallback, useMemo, useTransition, type ReactNode } from "react"

import {
  filtersToSearchParams,
  parsePropertyFilters,
  type PropertyFilters,
} from "@/lib/property-filters"
import { cn } from "@/lib/utils"

type FiltersTransition = {
  isPending: boolean
  startTransition: (callback: () => void) => void
}

const FiltersTransitionContext = createContext<FiltersTransition | null>(null)

export function FiltersTransitionProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition()
  const value = useMemo(() => ({ isPending, startTransition }), [isPending])
  return <FiltersTransitionContext value={value}>{children}</FiltersTransitionContext>
}

function useFiltersTransition() {
  const context = use(FiltersTransitionContext)
  if (!context) throw new Error("useFilters must be used inside FiltersTransitionProvider")
  return context
}

/** Listing filters backed by the URL, so results are shareable and survive reloads. */
export function useFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isPending, startTransition } = useFiltersTransition()
  const filters = useMemo(() => parsePropertyFilters(searchParams), [searchParams])

  const update = useCallback(
    (patch: Partial<PropertyFilters>, options: { keepPage?: boolean } = {}) => {
      const next = { ...filters, ...patch, ...(options.keepPage ? {} : { page: 1 }) }
      const qs = filtersToSearchParams(next).toString()
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      })
    },
    [filters, pathname, router, startTransition],
  )

  const reset = useCallback(() => {
    const qs = filtersToSearchParams({ search: filters.search }).toString()
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
  }, [filters.search, pathname, router, startTransition])

  return { filters, update, reset, isPending }
}

export function PendingResults({ children }: { children: ReactNode }) {
  const { isPending } = useFiltersTransition()
  return (
    <div
      aria-busy={isPending}
      className={cn("min-w-0 transition-opacity", isPending && "pointer-events-none opacity-60")}
    >
      {children}
    </div>
  )
}
