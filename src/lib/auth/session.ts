import "server-only"

import { jwtVerify, SignJWT } from "jose"

import { serverEnv } from "@/config/env.server"
import { ROLES, type SessionUser } from "@/types/models"

export const SESSION_COOKIE = "nq_session"
export const REFRESH_COOKIE = "nq_rt"

/** Matches the backend's default refresh-token lifetime (JWT_REFRESH_EXPIRES_IN=7d). */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(serverEnv.sessionSecret)
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, serverEnv.sessionSecret, {
      algorithms: ["HS256"],
    })
    const role = payload.role
    if (
      typeof payload.sub !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof role !== "string" ||
      !(ROLES as readonly string[]).includes(role)
    ) {
      return null
    }
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: role as SessionUser["role"],
    }
  } catch {
    return null
  }
}

/** The session only counts while its refresh cookie exists; without it the access token can't be renewed. */
export function readSession(cookies: { get(name: string): { value: string } | undefined }) {
  if (!cookies.get(REFRESH_COOKIE)) return Promise.resolve(null)
  return verifySession(cookies.get(SESSION_COOKIE)?.value)
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: serverEnv.isProduction,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
}
