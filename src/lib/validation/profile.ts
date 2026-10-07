import { z } from "zod"

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Your name needs at least 2 characters")
    .max(100, "Keep your name under 100 characters"),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || (value.length >= 6 && value.length <= 20), {
      message: "Enter a phone number between 6 and 20 characters, or leave it empty",
    })
    .refine((value) => value === "" || /^\+?[\d\s()-]+$/.test(value), {
      message: "Use digits, spaces, dashes or a leading +",
    }),
})

export type ProfileValues = z.infer<typeof profileSchema>

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024
