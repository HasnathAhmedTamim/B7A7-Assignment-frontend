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
