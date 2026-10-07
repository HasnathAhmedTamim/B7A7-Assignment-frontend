import type { Metadata } from "next"

import { RegisterForm } from "@/components/auth/register-form"
import { publicMetadata } from "@/lib/metadata"

export const metadata: Metadata = publicMetadata({
  title: "Create an account",
  description: "Join as a tenant to find a home, or as a landlord to list your property.",
  path: "/register",
})

export default function RegisterPage() {
  return <RegisterForm />
}
