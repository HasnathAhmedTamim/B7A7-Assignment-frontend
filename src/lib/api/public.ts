import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { serverEnv } from "@/config/env.server"
import { filtersToApiQuery, type PropertyFilters } from "@/lib/property-filters"
import type { ApiFailure, ApiSuccess, Paginated } from "@/types/api"
import type { Property, PropertyDetail } from "@/types/models"

import { ApiError, fallbackMessage } from "./errors"
import { toSearchParams } from "./query-string"

export const PROPERTIES_TAG = "properties"
export const propertyTag = (id: string) => `property:${id}`

async function publicGet<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
) {
  const qs = toSearchParams(query).toString()
  let response: Response
  try {
    response = await fetch(`${serverEnv.apiBaseUrl}${path}${qs ? `?${qs}` : ""}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    })
  } catch {
    throw new ApiError(0, fallbackMessage(0))
  }
  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null
  if (!response.ok || !payload || payload.success === false) {
    throw new ApiError(
      response.status,
      (payload && payload.success === false && payload.message) || fallbackMessage(response.status),
    )
  }
  return payload
}

/**
 * Published listings. Cached remotely and shared across server instances,
 * because the backend rate-limits by IP and server fetches share egress IPs.
 */
export async function getPublishedProperties(
  filters: PropertyFilters,
): Promise<Paginated<Property>> {
  "use cache: remote"
  cacheTag(PROPERTIES_TAG)
  cacheLife("minutes")

  const result = await publicGet<Property[]>("/properties", filtersToApiQuery(filters))
  return {
    data: result.data,
    meta: result.meta ?? {
      page: 1,
      limit: result.data.length,
      total: result.data.length,
      totalPages: 1,
    },
  }
}

/** A published property with its rooms, or null when it doesn't exist or isn't public. */
export async function getPublicProperty(id: string): Promise<PropertyDetail | null> {
  "use cache: remote"
  cacheTag(PROPERTIES_TAG, propertyTag(id))
  cacheLife("minutes")

  try {
    return (await publicGet<PropertyDetail>(`/properties/${encodeURIComponent(id)}`)).data
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null
    throw error
  }
}
