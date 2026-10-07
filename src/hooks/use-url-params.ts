"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

type ParamValue = string | number | null | undefined

/**
 * Reads and writes list filters in the URL so they survive reloads and can be shared.
 * Empty values are removed rather than sent as `?key=`. Use inside a Suspense boundary.
 */
export function useUrlParams() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const set = useCallback(
    (patch: Record<string, ParamValue>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch)) {
        const text = value === null || value === undefined ? "" : String(value).trim()
        if (text) params.set(key, text)
        else params.delete(key)
      }
      const qs = params.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [pathname, router, searchParams],
  )

  return { params: searchParams, set, isPending }
}

/** Parses a positive integer page number, defaulting to 1. */
export function pageParam(value: string | null) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

/** Returns the value only when it's one of the allowed options. */
export function enumParam<T extends string>(value: string | null, options: readonly T[]) {
  return value && (options as readonly string[]).includes(value) ? (value as T) : undefined
}
