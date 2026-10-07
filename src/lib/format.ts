import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns"

import { siteConfig } from "@/config/site"

const moneyFormatters = new Map<string, Intl.NumberFormat>()

function moneyFormatter(currency: string) {
  const key = currency.toUpperCase()
  let formatter = moneyFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(siteConfig.locale, {
      style: "currency",
      currency: key,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })
    moneyFormatters.set(key, formatter)
  }
  return formatter
}

/** Formats a backend Decimal (serialized as a string) or number as currency. */
export function formatMoney(
  value: string | number | null | undefined,
  currency: string = siteConfig.currency,
) {
  const amount = typeof value === "string" ? Number(value) : value
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—"
  return moneyFormatter(currency).format(amount)
}

const compactMoney = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  currencyDisplay: "narrowSymbol",
  notation: "compact",
  maximumFractionDigits: 1,
})

/** Short currency for chart axes, e.g. ৳12K. */
export function formatCompactMoney(value: number) {
  return compactMoney.format(value)
}

export function toNumber(value: string | number | null | undefined) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function toDate(value: string | Date | null | undefined) {
  if (!value) return null
  const date = typeof value === "string" ? parseISO(value) : value
  return isValid(date) ? date : null
}

export function formatDate(value: string | Date | null | undefined, pattern = "d MMM yyyy") {
  const date = toDate(value)
  return date ? format(date, pattern) : "—"
}

export function formatDateTime(value: string | Date | null | undefined) {
  return formatDate(value, "d MMM yyyy, h:mm a")
}

export function formatRelative(value: string | Date | null | undefined) {
  const date = toDate(value)
  return date ? formatDistanceToNowStrict(date, { addSuffix: true }) : "—"
}

/** `yyyy-MM-dd` for date inputs and API payloads, in local time. */
export function toDateInputValue(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function initials(name: string | null | undefined) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase() || "?"
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Joins address parts, skipping any already contained in an earlier part. */
export function formatAddress(place: { address: string; location: string | null; city: string }) {
  const parts: string[] = []
  for (const part of [place.address, place.location, place.city]) {
    const value = part?.trim()
    if (!value) continue
    if (parts.some((existing) => existing.toLowerCase().includes(value.toLowerCase()))) continue
    parts.push(value)
  }
  return parts.join(", ")
}

export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase()
}
