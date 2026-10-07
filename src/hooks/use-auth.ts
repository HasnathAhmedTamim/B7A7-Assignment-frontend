"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { broadcastAuthChange } from "@/components/providers/auth-bootstrap"
import { roleHome, safeRedirectPath, canAccess } from "@/config/routes"
import { authApi, type AuthResponse, type RegisterInput } from "@/lib/api/auth"
import { endSession, establishSession } from "@/lib/auth/session-client"
import { useAuthStore } from "@/stores/auth-store"
import type { SessionUser } from "@/types/models"

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const hasToken = useAuthStore((state) => state.accessToken !== null)
  return {
    user,
    status,
    /** True once an access token is available, i.e. authenticated API calls can be made. */
    isReady: status === "authenticated" && hasToken,
    isAuthenticated: status === "authenticated",
  }
}

function destinationFor(user: SessionUser, next: string | null) {
  const safe = safeRedirectPath(next)
  return safe && canAccess(safe, user.role) ? safe : roleHome[user.role]
}

function useCompleteSignIn() {
  const router = useRouter()
  return async (result: AuthResponse, next: string | null) => {
    const user = await establishSession({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
    broadcastAuthChange("signed-in")
    router.replace(destinationFor(user, next))
    router.refresh()
    return user
  }
}

export function useSignIn(next: string | null) {
  const complete = useCompleteSignIn()
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) =>
      complete(await authApi.login(input), next),
    onSuccess: (user) => toast.success(`Welcome back, ${user.name.split(" ")[0]}`),
    meta: { suppressErrorToast: true },
  })
}

export function useRegister() {
  const complete = useCompleteSignIn()
  return useMutation({
    mutationFn: async (input: RegisterInput) => complete(await authApi.register(input), null),
    onSuccess: (user) => toast.success(`Welcome to the platform, ${user.name.split(" ")[0]}`),
    meta: { suppressErrorToast: true },
  })
}

export function useSignOut() {
  const router = useRouter()
  return useMutation({
    mutationFn: endSession,
    onSuccess: () => {
      broadcastAuthChange("signed-out")
      toast.success("You've been signed out")
      router.replace("/")
      router.refresh()
    },
  })
}
