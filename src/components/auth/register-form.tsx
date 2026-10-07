"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRoundIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { FormAlert } from "@/components/forms/form-alert"
import { TextField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { useRegister } from "@/hooks/use-auth"
import { isApiError } from "@/lib/api/errors"
import { applyServerErrors } from "@/lib/forms"
import { registerSchema, type RegisterValues } from "@/lib/validation/auth"

const roleOptions = [
  {
    value: "TENANT" as const,
    title: "I'm looking for a place",
    description: "Browse homes, request rooms and pay rent",
    icon: UserIcon,
  },
  {
    value: "LANDLORD" as const,
    title: "I'm renting out property",
    description: "List properties, manage rooms and requests",
    icon: KeyRoundIcon,
  },
]

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "TENANT",
      password: "",
      confirmPassword: "",
    },
  })
  const register = useRegister()

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    register.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        ...(values.phone ? { phone: values.phone } : {}),
      },
      {
        onError: (error) => {
          if (isApiError(error) && error.isConflict) {
            form.setError("email", {
              message: "An account with this email already exists. Try signing in instead.",
            })
            return
          }
          setFormError(
            applyServerErrors(error, form.setError, ["name", "email", "phone", "password", "role"]),
          )
        },
      },
    )
  })

  const busy = register.isPending || register.isSuccess

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">It takes less than a minute.</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormAlert message={formError} />
        <FieldGroup>
          <Controller
            control={form.control}
            name="role"
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label">How will you use the platform?</FieldLegend>
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-2 sm:grid-cols-2"
                  disabled={busy}
                >
                  {roleOptions.map((option) => (
                    <FieldLabel key={option.value} htmlFor={`role-${option.value}`}>
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>
                            <option.icon className="size-4 text-primary" aria-hidden />
                            {option.title}
                          </FieldTitle>
                          <FieldDescription className="text-xs">{option.description}</FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value={option.value} id={`role-${option.value}`} />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
                {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
              </FieldSet>
            )}
          />
          <TextField
            control={form.control}
            name="name"
            label="Full name"
            autoComplete="name"
            disabled={busy}
          />
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
            name="phone"
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="+8801XXXXXXXXX"
            disabled={busy}
          />
          <TextField
            control={form.control}
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            description="At least 8 characters."
            disabled={busy}
          />
          <TextField
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            disabled={busy}
          />
        </FieldGroup>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? <Spinner data-icon="inline-start" /> : null}
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
