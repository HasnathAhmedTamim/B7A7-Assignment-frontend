import "server-only"

import { cookies } from "next/headers"

import { SESSION_COOKIE, verifySession } from "./session"

/** Reads the signed session cookie. Request-time only: call it inside a Suspense boundary. */
export async function getSession() {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}
