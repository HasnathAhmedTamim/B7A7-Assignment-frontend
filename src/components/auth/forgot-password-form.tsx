"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { MailCheckIcon } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"

import { FormAlert } from "@/components/forms/form-alert"
import { TextField } from "@/components/forms/form-fields"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { authApi } from "@/lib/api/auth"
import { getErrorMessage, isApiError } from "@/lib/api/errors"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation/auth"

function forgotErrorMessage(error: unknown) {
  if (isApiError(error) && error.isNotFound) return "We couldn't find an account with that email."
  return getErrorMessage(error)
}

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })
  const request = useMutation({
    mutationFn: (values: ForgotPasswordValues) => authApi.forgotPassword(values.email),
    meta: { suppressErrorToast: true },
  })

  const onSubmit = form.handleSubmit((values) => request.mutate(values))
  const result = request.data
  const resetHref = result
    ? `/reset-password?email=${encodeURIComponent(result.email)}`
    : "/reset-password"

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the email you signed up with and we&apos;ll send you a 6-digit code.
        </p>
      </div>

      {result ? (
        <div className="space-y-4">
          <Alert>
            <MailCheckIcon />
            <AlertTitle>Check your inbox</AlertTitle>
            <AlertDescription>
              {result.emailSent
                ? `We sent a code to ${result.deliveredTo ?? result.email}. It expires in ${Math.round(result.expiresInSeconds / 60)} minutes.`
                : "We couldn't deliver the email, so a development code was issued instead."}
              {result.otp ? (
                <span className="mt-2 block font-mono text-base tracking-widest text-foreground">
                  {result.otp}
                </span>
              ) : null}
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full" size="lg">
            <Link href={resetHref}>Enter the code</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormAlert message={request.isError ? forgotErrorMessage(request.error) : null} />
          <FieldGroup>
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={request.isPending}
            />
          </FieldGroup>
          <Button type="submit" className="w-full" size="lg" disabled={request.isPending}>
            {request.isPending ? <Spinner data-icon="inline-start" /> : null}
            Send code
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
