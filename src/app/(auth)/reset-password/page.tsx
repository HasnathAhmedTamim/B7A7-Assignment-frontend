import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { RemountOnHide } from "@/components/shared/remount-on-hide"

export const metadata: Metadata = { title: "Reset password" }

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton fields={4} />}>
      <RemountOnHide>
        <ResetPasswordForm />
      </RemountOnHide>
    </Suspense>
  )
}
