import { isProtectedPath } from "@/config/routes"
import { getQueryClient } from "@/lib/query-client"
import { useAuthStore } from "@/stores/auth-store"
import type { SessionUser } from "@/types/models"

export type AuthTokens = { accessToken: string; refreshToken: string }

export type RefreshResult =
  { ok: true; accessToken: string } | { ok: false; reason: "no-session" | "expired" | "network" }

type RefreshResponse = { accessToken: string; user: SessionUser }

let inflight: Promise<RefreshResult> | null = null

/**
 * Exchanges the httpOnly refresh cookie for a new access token.
 * The backend revokes a refresh token once it is used, so concurrent refreshes must not race:
 * calls are shared within a tab and serialized across tabs with the Web Locks API.
 */
export function refreshAccessToken(): Promise<RefreshResult> {
  inflight ??= runExclusive(performRefresh).finally(() => {
    inflight = null
  })
  return inflight
}

function runExclusive<T>(task: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return navigator.locks.request("nq-auth-refresh", task) as Promise<T>
  }
  return task()
}

async function performRefresh(): Promise<RefreshResult> {
  let response: Response
  try {
    response = await fetch("/api/auth/refresh", { method: "POST", cache: "no-store" })
  } catch {
    return { ok: false, reason: "network" }
  }

  if (!response.ok) {
    if (response.status >= 500) return { ok: false, reason: "network" }
    const body = (await response.json().catch(() => null)) as { code?: string } | null
    useAuthStore.getState().clear()
    return { ok: false, reason: body?.code === "NO_SESSION" ? "no-session" : "expired" }
  }

  const body = (await response.json()) as RefreshResponse
  useAuthStore.getState().setSession(body.accessToken, body.user)
  return { ok: true, accessToken: body.accessToken }
}

/** Stores the refresh token in an httpOnly cookie and returns the verified user. */
export async function establishSession(tokens: AuthTokens): Promise<SessionUser> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tokens),
    cache: "no-store",
  })
  const body = (await response.json().catch(() => null)) as
    { user: SessionUser; message?: string } | { message?: string } | null
  if (!response.ok || !body || !("user" in body)) {
    throw new Error(body?.message ?? "We couldn't sign you in. Please try again.")
  }
  useAuthStore.getState().setSession(tokens.accessToken, body.user)
  return body.user
}

export async function endSession() {
  await fetch("/api/auth/logout", { method: "POST", cache: "no-store" }).catch(() => undefined)
  useAuthStore.getState().clear()
  getQueryClient().clear()
}

let expiring = false

/** Called when the session can no longer be renewed (expired, revoked or account blocked). */
export function handleSessionExpired(reason: "session-expired" | "blocked" = "session-expired") {
  if (expiring || typeof window === "undefined") return
  expiring = true

  useAuthStore.getState().clear()
  getQueryClient().clear()
  void fetch("/api/auth/logout", { method: "POST", cache: "no-store" })
    .catch(() => undefined)
    .finally(() => {
      const { pathname, search } = window.location
      if (isProtectedPath(pathname) || reason === "blocked") {
        const next = encodeURIComponent(`${pathname}${search}`)
        // A full load guarantees no in-memory data from the old session survives.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`/login?reason=${reason}&next=${next}`)
      } else {
        expiring = false
        window.dispatchEvent(new CustomEvent("nq:session-expired", { detail: reason }))
      }
    })
}
