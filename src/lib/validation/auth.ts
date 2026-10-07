import { z } from "zod"

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .max(254, "That email address is too long")
  .email("Enter a valid email address, like name@example.com")

const newPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use 128 characters or fewer")

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name (at least 2 characters)")
      .max(100, "Keep your name under 100 characters"),
    email,
    phone: z
      .string()
      .trim()
      .refine((value) => value === "" || (value.length >= 6 && value.length <= 20), {
        message: "Enter a phone number between 6 and 20 characters, or leave it blank",
      }),
    role: z.enum(["TENANT", "LANDLORD"], { error: "Choose how you'll use the platform" }),
    password: newPassword,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
export type RegisterValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    email,
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
    newPassword,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
