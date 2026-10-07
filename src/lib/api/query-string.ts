export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue>

/** Builds a query string, dropping empty values so the backend never sees `?city=`. */
export function toSearchParams(query: QueryParams = {}): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    const text = String(value).trim()
    if (text === "") continue
    params.set(key, text)
  }
  return params
}

/** First value of a Next.js search param, which is an array when the key repeats. */
export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
