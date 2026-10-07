"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import { handleSessionExpired, refreshAccessToken } from "@/lib/auth/session-client"
import { useAuthStore } from "@/stores/auth-store"
import type { SessionUser } from "@/types/models"

const AUTH_CHANNEL = "nq-auth"
const tabId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Math.random())

type AuthMessage = { type: "signed-in" | "signed-out"; tabId: string }

/** Seeds the auth store from the server session and restores the in-memory access token. */
export function AuthBootstrap({ user }: { user: SessionUser | null }) {
  useEffect(() => {
    const store = useAuthStore.getState()
    if (!user) {
      if (store.status === "loading") store.clear()
      return
    }
    if (store.accessToken && store.user?.id === user.id) return

    store.setUser(user)
    void refreshAccessToken().then((result) => {
      if (!result.ok && result.reason === "expired") handleSessionExpired("session-expired")
      if (!result.ok && result.reason === "network") {
        useAuthStore.setState({ status: "unauthenticated" })
        toast.error("We couldn't restore your session. Check your connection and reload.")
      }
    })
  }, [user])

  useEffect(() => {
    const onExpired = () => toast.info("Your session has expired. Please sign in again.")
    window.addEventListener("nq:session-expired", onExpired)

    let channel: BroadcastChannel | undefined
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(AUTH_CHANNEL)
      channel.onmessage = (event: MessageEvent<AuthMessage>) => {
        if (event.data.tabId !== tabId) window.location.reload()
      }
    }
    return () => {
      window.removeEventListener("nq:session-expired", onExpired)
      channel?.close()
    }
  }, [])

  return null
}

/** Tells other open tabs to reload so they pick up the new session state. */
export function broadcastAuthChange(type: AuthMessage["type"]) {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return
  const channel = new BroadcastChannel(AUTH_CHANNEL)
  channel.postMessage({ type, tabId } satisfies AuthMessage)
  channel.close()
}
