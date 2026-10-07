"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { FormAlert } from "@/components/forms/form-alert"
import { TextField } from "@/components/forms/form-fields"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import type { DemoAccount } from "@/config/demo-accounts"
import { useSignIn } from "@/hooks/use-auth"
import { getErrorMessage, isApiError } from "@/lib/api/errors"
import { loginSchema, type LoginValues } from "@/lib/validation/auth"

import { DemoLogin } from "./demo-login"

const reasonMessages: Record<string, string> = {
  "session-expired": "Your session has expired. Please sign in again.",
  blocked: "This account has been blocked. Contact support if you think this is a mistake.",
}

function loginErrorMessage(error: unknown) {
  if (isApiError(error) && error.status === 401) return "That email and password don't match."
  return getErrorMessage(error)
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next")
  const reason = searchParams.get("reason")
  const [demoEmail, setDemoEmail] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })
  const signIn = useSignIn(next)

  const onSubmit = form.handleSubmit((values) => {
    setDemoEmail(null)
    signIn.mutate(values)
  })

  const onDemo = (account: DemoAccount) => {
    setDemoEmail(account.email)
    form.reset({ email: account.email, password: account.password })
    signIn.mutate({ email: account.email, password: account.password })
  }

  const busy = signIn.isPending || signIn.isSuccess

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Sign in to manage your rentals.
        </p>
      </div>

      {reason && reasonMessages[reason] ? (
        <Alert>
          <InfoIcon />
          <AlertDescription>{reasonMessages[reason]}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormAlert message={signIn.isError ? loginErrorMessage(signIn.error) : null} />
        <FieldGroup>
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={busy}
          />
          <TextField
            control={form.control}
            name="password"
            label="Password"
            description={
              <Link href="/forgot-password" className="underline-offset-4 hover:text-primary hover:underline">
                Forgot your password?
              </Link>
            }
            type="password"
            autoComplete="current-password"
            disabled={busy}
          />
        </FieldGroup>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy && !demoEmail ? <Spinner data-icon="inline-start" /> : null}
          Sign in
        </Button>
      </form>

      <DemoLogin onSelect={onDemo} pendingEmail={busy ? demoEmail : null} disabled={busy} />

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
