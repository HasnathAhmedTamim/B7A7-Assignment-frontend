import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { LoginForm } from "@/components/auth/login-form"
import { publicMetadata } from "@/lib/metadata"

export const metadata: Metadata = publicMetadata({
  title: "Sign in",
  description: "Sign in to manage your rental requests, bookings and properties.",
  path: "/login",
})

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
