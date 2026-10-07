import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { backendFetch } from "@/lib/api/backend"
import {
  forbiddenOrigin,
  isSameOrigin,
  noStoreHeaders,
  setSessionCookies,
  toSessionUser,
} from "@/lib/auth/route-helpers"
import type { User } from "@/types/models"

const bodySchema = z.object({
  accessToken: z.string().min(10).max(4096),
  refreshToken: z.string().min(10).max(4096),
})

/**
 * Called right after the browser signs in against the backend.
 * Verifies the access token with the backend, then stores the refresh token in an httpOnly cookie.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbiddenOrigin()

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid session payload" }, { status: 400 })
  }

  const me = await backendFetch<User>("/users/me", { token: parsed.data.accessToken })
  if (!me.ok) {
    const status = me.status === 0 || me.status >= 500 ? 503 : me.status === 403 ? 403 : 401
    return NextResponse.json({ message: me.message }, { status, headers: noStoreHeaders })
  }

  const user = toSessionUser(me.data)
  const response = NextResponse.json({ user }, { headers: noStoreHeaders })
  await setSessionCookies(response, user, parsed.data.refreshToken)
  return response
}
