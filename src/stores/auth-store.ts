import { create } from "zustand"

import type { SessionUser } from "@/types/models"

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthState = {
  /** Short-lived backend access token. Kept in memory only, never persisted. */
  accessToken: string | null
  user: SessionUser | null
  status: AuthStatus
  setSession: (accessToken: string, user: SessionUser) => void
  setUser: (user: SessionUser | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  status: "loading",
  setSession: (accessToken, user) =>
    set({ accessToken, user, status: "authenticated" }),
  setUser: (user) =>
    set((state) => ({
      user,
      status: user ? state.status : "unauthenticated",
    })),
  clear: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
}))
