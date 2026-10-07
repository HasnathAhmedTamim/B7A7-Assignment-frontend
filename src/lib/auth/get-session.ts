import "server-only"

import { io } from "next/cache"
import { cookies } from "next/headers"

import { readSession } from "./session"

/** Reads the signed session cookie. Request-time only: call it inside a Suspense boundary. */
export async function getSession() {
  const store = await cookies()
  // Verifying the JWT reads the clock to check expiry.
  await io()
  return readSession(store)
}
