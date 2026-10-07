"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { broadcastAuthChange } from "@/components/providers/auth-bootstrap"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { safeRedirectPath } from "@/config/routes"
import { endSession } from "@/lib/auth/session-client"

/** Signs out and returns to the login page, keeping the page the user was trying to reach. */
export function SwitchAccountButton({ next }: { next?: string | null }) {
  const router = useRouter()
  const target = safeRedirectPath(next ?? null)
  const switchAccount = useMutation({
    mutationFn: endSession,
    onSuccess: () => {
      broadcastAuthChange("signed-out")
      router.replace(target ? `/login?next=${encodeURIComponent(target)}` : "/login")
      router.refresh()
    },
  })

  return (
    <Button
      variant="outline"
      disabled={switchAccount.isPending}
      onClick={() => switchAccount.mutate()}
    >
      {switchAccount.isPending ? <Spinner data-icon="inline-start" /> : null}
      Sign in with a different account
    </Button>
  )
}
