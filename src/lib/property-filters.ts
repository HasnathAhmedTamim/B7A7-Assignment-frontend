import { z } from "zod"

import { PROPERTY_TYPES, type PropertyType } from "@/types/models"

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { value: "rent-asc", label: "Rent: low to high", sortBy: "monthlyRent", sortOrder: "asc" },
  { value: "rent-desc", label: "Rent: high to low", sortBy: "monthlyRent", sortOrder: "desc" },
  { value: "title-asc", label: "Name: A to Z", sortBy: "title", sortOrder: "asc" },
  { value: "city-asc", label: "City: A to Z", sortBy: "city", sortOrder: "asc" },
] as const

export type SortBy = "createdAt" | "monthlyRent" | "title" | "city"
export type SortOrder = "asc" | "desc"

export type PropertyFilters = {
  search?: string
  city?: string
  location?: string
  minRent?: number
  maxRent?: number
  propertyType?: PropertyType
  bedrooms?: number
  bathrooms?: number
  available?: boolean
  sortBy: SortBy
  sortOrder: SortOrder
  page: number
}

export const PAGE_SIZE = 12

export const DEFAULT_FILTERS: PropertyFilters = { sortBy: "createdAt", sortOrder: "desc", page: 1 }

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined)

const positive = z.coerce.number().positive().max(100_000_000).optional().catch(undefined)
const count = z.coerce.number().int().min(0).max(50).optional().catch(undefined)

const schema = z.object({
  search: text(100),
  city: text(100),
  location: text(200),
  minRent: positive,
  maxRent: positive,
  propertyType: z.enum(PROPERTY_TYPES).optional().catch(undefined),
  bedrooms: count,
  bathrooms: count,
  available: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
    .catch(undefined),
  sortBy: z.enum(["createdAt", "monthlyRent", "title", "city"]).catch("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
})

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams

function firstValues(params: RawParams): Record<string, string | undefined> {
  if (params instanceof URLSearchParams) return Object.fromEntries(params.entries())
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  )
}

/** Reads listing filters from the URL, silently dropping anything invalid. */
export function parsePropertyFilters(params: RawParams): PropertyFilters {
  const parsed = schema.parse(firstValues(params))
  if (parsed.minRent && parsed.maxRent && parsed.minRent > parsed.maxRent) {
    ;[parsed.minRent, parsed.maxRent] = [parsed.maxRent, parsed.minRent]
  }
  return parsed
}

/** Serializes filters for the URL, omitting defaults and empty values. */
export function filtersToSearchParams(filters: Partial<PropertyFilters>): URLSearchParams {
  const params = new URLSearchParams()
  const entries: Array<[string, unknown]> = [
    ["search", filters.search],
    ["city", filters.city],
    ["location", filters.location],
    ["minRent", filters.minRent],
    ["maxRent", filters.maxRent],
    ["propertyType", filters.propertyType],
    ["bedrooms", filters.bedrooms],
    ["bathrooms", filters.bathrooms],
    ["available", filters.available],
    ["sortBy", filters.sortBy === DEFAULT_FILTERS.sortBy ? undefined : filters.sortBy],
    ["sortOrder", filters.sortOrder === DEFAULT_FILTERS.sortOrder ? undefined : filters.sortOrder],
    ["page", filters.page && filters.page > 1 ? filters.page : undefined],
  ]
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === "") continue
    params.set(key, String(value))
  }
  return params
}

/** Backend query for GET /properties. */
export function filtersToApiQuery(filters: PropertyFilters) {
  return {
    search: filters.search,
    city: filters.city,
    location: filters.location,
    minRent: filters.minRent,
    maxRent: filters.maxRent,
    propertyType: filters.propertyType,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    available: filters.available,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: PAGE_SIZE,
  }
}

export function activeFilterCount(filters: PropertyFilters) {
  return [
    filters.city,
    filters.location,
    filters.minRent,
    filters.maxRent,
    filters.propertyType,
    filters.bedrooms,
    filters.bathrooms,
    filters.available,
  ].filter((value) => value !== undefined).length
}

export function sortValue(filters: Pick<PropertyFilters, "sortBy" | "sortOrder">) {
  return (
    SORT_OPTIONS.find((o) => o.sortBy === filters.sortBy && o.sortOrder === filters.sortOrder)
      ?.value ?? "newest"
  )
}
