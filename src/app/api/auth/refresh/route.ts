import { NextResponse, type NextRequest } from "next/server"

import { backendFetch } from "@/lib/api/backend"
import {
  clearSessionCookies,
  forbiddenOrigin,
  isSameOrigin,
  noStoreHeaders,
  setSessionCookies,
  toSessionUser,
} from "@/lib/auth/route-helpers"
import { REFRESH_COOKIE } from "@/lib/auth/session"
import type { User } from "@/types/models"

type RefreshPayload = { user: User; accessToken: string; refreshToken: string }

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbiddenOrigin()

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) {
    const response = NextResponse.json(
      { code: "NO_SESSION", message: "Not signed in" },
      { status: 401, headers: noStoreHeaders },
    )
    clearSessionCookies(response)
    return response
  }

  const result = await backendFetch<RefreshPayload>("/auth/refresh-token", {
    method: "POST",
    body: { refreshToken },
  })

  if (!result.ok) {
    // Keep the session on transient failures so a backend cold start doesn't sign users out.
    if (result.status === 0 || result.status >= 500 || result.status === 429) {
      return NextResponse.json(
        { code: "UNAVAILABLE", message: result.message },
        { status: 503, headers: noStoreHeaders },
      )
    }
    const response = NextResponse.json(
      { code: "SESSION_EXPIRED", message: "Your session has expired. Please sign in again." },
      { status: 401, headers: noStoreHeaders },
    )
    clearSessionCookies(response)
    return response
  }

  const user = toSessionUser(result.data.user)
  const response = NextResponse.json(
    { accessToken: result.data.accessToken, user },
    { headers: noStoreHeaders },
  )
  await setSessionCookies(response, user, result.data.refreshToken)
  return response
}
