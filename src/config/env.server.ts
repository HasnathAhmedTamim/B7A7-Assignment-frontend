import "server-only"

import { env } from "./env"

function sessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long")
  }
  return new TextEncoder().encode(secret)
}

export const serverEnv = {
  apiBaseUrl: (process.env.API_BASE_URL ?? env.apiBaseUrl).replace(/\/+$/, ""),
  get sessionSecret() {
    return sessionSecret()
  },
  isProduction: process.env.NODE_ENV === "production",
} as const
