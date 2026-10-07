import "server-only"

import { serverEnv } from "@/config/env.server"
import type { ApiFailure, ApiSuccess } from "@/types/api"

export type BackendResult<T> =
  { ok: true; status: number; data: T } | { ok: false; status: number; message: string }

/** Server-to-server call to the backend API. Never throws; status 0 means unreachable. */
export async function backendFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; token?: string } = {},
): Promise<BackendResult<T>> {
  const headers = new Headers({ Accept: "application/json" })
  if (init.body !== undefined) headers.set("Content-Type", "application/json")
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`)

  try {
    const response = await fetch(`${serverEnv.apiBaseUrl}${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    })
    const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null

    if (response.ok && payload?.success) {
      return { ok: true, status: response.status, data: payload.data }
    }
    return {
      ok: false,
      status: response.status,
      message: payload?.message ?? "The service is temporarily unavailable.",
    }
  } catch {
    return { ok: false, status: 0, message: "The service is temporarily unavailable." }
  }
}
