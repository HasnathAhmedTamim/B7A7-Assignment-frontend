import { after, NextResponse, type NextRequest } from "next/server"

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
    // Revoke server-side once the response is sent, so a slow or sleeping backend
    // never delays sign-out; the cookies below are cleared regardless of the outcome.
    after(() => backendFetch("/auth/logout", { method: "POST", body: { refreshToken } }))
  }

  const response = NextResponse.json({ success: true }, { headers: noStoreHeaders })
  clearSessionCookies(response)
  return response
}
