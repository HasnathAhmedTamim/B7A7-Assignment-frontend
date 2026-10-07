import "server-only"

import { NextResponse, type NextRequest } from "next/server"

import type { SessionUser } from "@/types/models"

import { cookieOptions, REFRESH_COOKIE, SESSION_COOKIE, signSession } from "./session"

/** Rejects cross-site POSTs to the auth endpoints (defense in depth on top of SameSite=Lax). */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site"
  return origin === request.nextUrl.origin
}

export function forbiddenOrigin() {
  return NextResponse.json({ message: "Cross-site request rejected" }, { status: 403 })
}

export async function setSessionCookies(
  response: NextResponse,
  user: SessionUser,
  refreshToken: string,
) {
  response.cookies.set(REFRESH_COOKIE, refreshToken, cookieOptions)
  response.cookies.set(SESSION_COOKIE, await signSession(user), cookieOptions)
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 })
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 })
}

export function toSessionUser(user: {
  id: string
  name: string
  email: string
  role: SessionUser["role"]
}): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export const noStoreHeaders = { "Cache-Control": "no-store" }
