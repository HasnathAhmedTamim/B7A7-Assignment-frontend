"use client"

import { useTheme } from "next-themes"
import { useEffect, useEffectEvent, useRef, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { env } from "@/config/env"
import { cn } from "@/lib/utils"

type GoogleButtonOptions = {
  type: "standard"
  theme: "outline" | "filled_black"
  size: "large"
  text: "signin_with" | "signup_with" | "continue_with"
  shape: "rectangular"
  logo_alignment: "center"
  width: number
  locale: string
}

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (response: { credential: string }) => void
        ux_mode: "popup"
        auto_select: boolean
      }) => void
      renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

// Google Identity Services takes a single global callback, so it is initialized once and
// forwards credentials to whichever button is currently mounted.
let activeHandler: ((credential: string) => void) | null = null
let loading: Promise<GoogleIdentity> | null = null

function loadGoogleIdentity() {
  loading ??= new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client?hl=en"
    script.async = true
    script.onload = () => {
      const google = window.google
      if (!google) return reject(new Error("Google Identity Services did not load"))
      google.accounts.id.initialize({
        client_id: env.googleClientId,
        callback: (response) => activeHandler?.(response.credential),
        ux_mode: "popup",
        auto_select: false,
      })
      resolve(google)
    }
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new Error("Google Identity Services did not load"))
    }
    document.head.append(script)
  })
  return loading
}

/** Google's own "Sign in with Google" button; renders nothing when no client ID is configured. */
export function GoogleSignInButton({
  text = "continue_with",
  disabled,
  onCredential,
}: {
  text?: GoogleButtonOptions["text"]
  disabled?: boolean
  onCredential: (idToken: string) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading")
  const { resolvedTheme } = useTheme()
  const handleCredential = useEffectEvent(onCredential)

  useEffect(() => {
    const handler = (credential: string) => handleCredential(credential)
    activeHandler = handler
    return () => {
      if (activeHandler === handler) activeHandler = null
    }
  }, [])

  useEffect(() => {
    if (!env.googleClientId) return
    let cancelled = false
    loadGoogleIdentity().then(
      (google) => {
        const element = container.current
        if (cancelled || !element) return
        element.replaceChildren()
        google.accounts.id.renderButton(element, {
          type: "standard",
          theme: resolvedTheme === "dark" ? "filled_black" : "outline",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.min(Math.max(element.offsetWidth, 200), 400),
          locale: "en",
        })
        setStatus("ready")
      },
      () => {
        if (!cancelled) setStatus("unavailable")
      },
    )
    return () => {
      cancelled = true
    }
  }, [resolvedTheme, text])

  if (!env.googleClientId || status === "unavailable") return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="relative h-10">
        {status === "ready" ? null : <Skeleton className="absolute inset-0" />}
        <div
          ref={container}
          aria-disabled={disabled}
          className={cn(
            "flex h-10 justify-center [color-scheme:normal]",
            disabled && "pointer-events-none opacity-50",
          )}
        />
      </div>
    </div>
  )
}
