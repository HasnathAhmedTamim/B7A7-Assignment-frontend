function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.replace(/\/+$/, "")
}

// NEXT_PUBLIC_* values must be referenced literally so Next.js can inline them.
export const env = {
  apiBaseUrl: required("NEXT_PUBLIC_API_BASE_URL", process.env.NEXT_PUBLIC_API_BASE_URL),
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
  enableDemoLogin: process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN !== "false",
} as const
