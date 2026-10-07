import type { Role, User } from "@/types/models"

import { api } from "./client"

export type AuthResponse = { user: User; accessToken: string; refreshToken: string }

export type RegisterInput = {
  name: string
  email: string
  password: string
  phone?: string
  role: Extract<Role, "LANDLORD" | "TENANT">
}

export type ForgotPasswordResponse = {
  email: string
  expiresInSeconds: number
  emailSent: boolean
  deliveredTo?: string
  note?: string
  /** Only present when the backend runs with ALLOW_OTP_IN_RESPONSE=true (development). */
  otp?: string
}

export const authApi = {
  login: (input: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", input, { auth: false }),

  register: (input: RegisterInput) =>
    api.post<AuthResponse>("/auth/register", input, { auth: false }),

  forgotPassword: (email: string) =>
    api.post<ForgotPasswordResponse>("/auth/forgot-password", { email }, { auth: false }),

  resetPassword: (input: { email: string; otp: string; newPassword: string }) =>
    api.post<null>("/auth/reset-password", input, { auth: false }),
}
