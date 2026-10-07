"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormAlert } from "@/components/forms/form-alert"
import { TextField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { authApi } from "@/lib/api/auth"
import { applyServerErrors } from "@/lib/forms"
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation/auth"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const reset = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      authApi.resetPassword({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      }),
    meta: { suppressErrorToast: true },
    onSuccess: () => {
      toast.success("Password updated. Sign in with your new password.")
      router.replace("/login")
    },
    onError: (error) =>
      setFormError(applyServerErrors(error, form.setError, ["email", "otp", "newPassword"])),
  })

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    reset.mutate(values)
  })
  const busy = reset.isPending || reset.isSuccess

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code we emailed you and pick a new password.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormAlert message={formError} />
        <FieldGroup>
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            disabled={busy}
          />
          <TextField
            control={form.control}
            name="otp"
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            className="[&_input]:font-mono [&_input]:tracking-widest"
            disabled={busy}
          />
          <TextField
            control={form.control}
            name="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            description="At least 8 characters."
            disabled={busy}
          />
          <TextField
            control={form.control}
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            disabled={busy}
          />
        </FieldGroup>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? <Spinner data-icon="inline-start" /> : null}
          Update password
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get a code?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Send another
        </Link>
      </p>
    </div>
  )
}
