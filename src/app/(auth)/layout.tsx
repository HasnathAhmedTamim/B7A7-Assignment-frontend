import { CheckCircle2Icon } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { siteConfig } from "@/config/site"

const highlights = [
  "Browse published homes with transparent monthly rent",
  "Request a room and hear back from the landlord directly",
  "Pay securely with Stripe once your booking is approved",
]

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_minmax(0,32rem)] xl:grid-cols-[1fr_minmax(0,36rem)]">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Logo />
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </main>
        <p className="text-center text-xs text-muted-foreground lg:text-left">
          © {siteConfig.name}. Built for renters and landlords in Bangladesh.
        </p>
      </div>

      <aside className="relative hidden overflow-hidden border-l bg-sidebar lg:flex lg:flex-col lg:justify-center lg:px-12">
        <svg aria-hidden className="absolute inset-0 size-full text-primary opacity-[0.06]">
          <defs>
            <pattern id="auth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
        <div className="relative max-w-md space-y-6">
          <p className="text-sm font-medium text-primary">{siteConfig.name}</p>
          <h2 className="text-3xl font-semibold">{siteConfig.tagline}</h2>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
