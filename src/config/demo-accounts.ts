import type { Role } from "@/types/models"

export type DemoAccount = {
  role: Role
  label: string
  description: string
  email: string
  password: string
}

/**
 * Seeded development/evaluation accounts from the backend seed script.
 * These are the only place demo credentials live in the frontend.
 */
export const demoAccounts: readonly DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Admin",
    description: "Moderate users, listings and payments",
    email: "admin@housing.com",
    password: "ChangeMeAdmin123!",
  },
  {
    role: "LANDLORD",
    label: "Landlord",
    description: "Manage properties, rooms and requests",
    email: "landlord@housing.com",
    password: "Landlord123!",
  },
  {
    role: "TENANT",
    label: "Tenant",
    description: "Browse homes, request rooms and pay rent",
    email: "tenant@housing.com",
    password: "Tenant123!",
  },
]
