import { env } from "@/config/env"
import { handleSessionExpired, refreshAccessToken } from "@/lib/auth/session-client"
import { useAuthStore } from "@/stores/auth-store"
import type { ApiFailure, ApiSuccess, Paginated } from "@/types/api"

import { ApiError, fallbackMessage } from "./errors"
import { toSearchParams, type QueryParams } from "./query-string"

export type { QueryParams } from "./query-string"

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  query?: QueryParams
  /** Attach the access token and renew it on 401. Defaults to true. */
  auth?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string, query?: QueryParams) {
  const qs = toSearchParams(query).toString()
  return `${env.apiBaseUrl}${path}${qs ? `?${qs}` : ""}`
}

async function send(path: string, options: RequestOptions, token: string | null) {
  const headers = new Headers({ Accept: "application/json" })
  let body: BodyInit | undefined
  if (options.body instanceof FormData) {
    body = options.body
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json")
    body = JSON.stringify(options.body)
  }
  if (token) headers.set("Authorization", `Bearer ${token}`)

  try {
    return await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body,
      signal: options.signal,
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError(0, fallbackMessage(0))
  }
}

async function parse<T>(response: Response): Promise<ApiSuccess<T>> {
  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null

  if (!response.ok || !payload || payload.success === false) {
    const failure = payload && payload.success === false ? payload : null
    throw new ApiError(
      response.status,
      failure?.message || fallbackMessage(response.status),
      failure?.errors ?? [],
    )
  }
  return payload
}

async function currentToken(): Promise<string | null> {
  const { accessToken, status } = useAuthStore.getState()
  if (accessToken) return accessToken
  // The session is still being restored after a page load; wait for it instead of failing.
  if (status === "loading") {
    const result = await refreshAccessToken()
    return result.ok ? result.accessToken : null
  }
  return null
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiSuccess<T>> {
  const useAuth = options.auth ?? true
  const token = useAuth ? await currentToken() : null
  let response = await send(path, options, token)

  if (useAuth && response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed.ok) {
      response = await send(path, options, refreshed.accessToken)
    } else if (refreshed.reason !== "network") {
      handleSessionExpired("session-expired")
    }
  }

  if (useAuth && response.status === 403) {
    const error = await parse<T>(response.clone()).catch((e: unknown) => e)
    if (error instanceof ApiError && /blocked/i.test(error.message)) {
      handleSessionExpired("blocked")
    }
  }

  return parse<T>(response)
}

export const api = {
  get: async <T>(path: string, query?: QueryParams, options?: Omit<RequestOptions, "query">) =>
    (await request<T>(path, { ...options, query })).data,

  getPage: async <T>(
    path: string,
    query?: QueryParams,
    options?: Omit<RequestOptions, "query">,
  ): Promise<Paginated<T>> => {
    const result = await request<T[]>(path, { ...options, query })
    return {
      data: result.data,
      meta: result.meta ?? {
        page: 1,
        limit: result.data.length,
        total: result.data.length,
        totalPages: 1,
      },
    }
  },

  post: async <T>(path: string, body?: unknown, options?: RequestOptions) =>
    (await request<T>(path, { ...options, method: "POST", body })).data,

  patch: async <T>(path: string, body?: unknown, options?: RequestOptions) =>
    (await request<T>(path, { ...options, method: "PATCH", body })).data,

  delete: async <T>(path: string, options?: RequestOptions) =>
    (await request<T>(path, { ...options, method: "DELETE" })).data,
}
