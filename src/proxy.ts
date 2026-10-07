import { NextResponse, type NextRequest } from "next/server"

import {
  canAccess,
  guestOnlyRoutes,
  isProtectedPath,
  matchesPrefix,
  roleHome,
} from "@/config/routes"
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session"

/**
 * Optimistic route guard based on the signed session cookie.
 * The backend still authorizes every API call; this only keeps users out of screens they can't use.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  if (isProtectedPath(pathname)) {
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("next", `${pathname}${search}`)
      return NextResponse.redirect(url)
    }
    if (!canAccess(pathname, session.role)) {
      const url = new URL("/unauthorized", request.url)
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }
  }

  if (session && guestOnlyRoutes.some((route) => matchesPrefix(pathname, route))) {
    return NextResponse.redirect(new URL(roleHome[session.role], request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/landlord/:path*",
    "/dashboard/:path*",
    "/payment/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
}
