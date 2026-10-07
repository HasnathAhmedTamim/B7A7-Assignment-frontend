import { NextResponse, type NextRequest } from "next/server"

import { backendFetch } from "@/lib/api/backend"
import {
  clearSessionCookies,
  forbiddenOrigin,
  isSameOrigin,
  noStoreHeaders,
} from "@/lib/auth/route-helpers"
import { REFRESH_COOKIE } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbiddenOrigin()

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (refreshToken) {
    // Revoke server-side; local cookies are cleared regardless of the outcome.
    await backendFetch("/auth/logout", { method: "POST", body: { refreshToken } })
  }

  const response = NextResponse.json({ success: true }, { headers: noStoreHeaders })
  clearSessionCookies(response)
  return response
}
