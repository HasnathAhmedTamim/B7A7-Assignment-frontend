import type { Metadata } from "next"

import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join as a tenant to find a home, or as a landlord to list your property.",
}

export default function RegisterPage() {
  return <RegisterForm />
}
