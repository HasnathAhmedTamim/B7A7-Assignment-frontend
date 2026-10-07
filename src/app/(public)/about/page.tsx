import { HandshakeIcon, ReceiptIcon, ShieldCheckIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { ContentPage } from "@/components/layout/content-page"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "About",
  description: `Why we built ${siteConfig.name} and how it keeps renting fair for tenants and landlords.`,
}

const principles = [
  {
    icon: ReceiptIcon,
    title: "Clear prices",
    body: "Every listing shows its monthly rent, and each room has its own price. What you see is what you pay for the first month.",
  },
  {
    icon: HandshakeIcon,
    title: "Direct, accountable decisions",
    body: "Tenants request specific rooms and landlords approve or decline them. Both sides can see where every request stands.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Safe payments",
    body: "Card payments run through Stripe. A booking is only confirmed once the payment succeeds, never before.",
  },
]

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About us"
      title="Renting should be simple for both sides"
      intro={`${siteConfig.name} connects people looking for a room or home with landlords who want reliable tenants, without brokers in the middle.`}
    >
      <div className="space-y-12">
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <div key={item.title} className="rounded-xl border bg-card p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <item.icon className="size-4" aria-hidden />
              </span>
              <h2 className="mt-4 font-medium">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">
            Built for how renting really works here
          </h2>
          <p>
            Most rentals in Bangladesh still move through phone calls, notice boards and word of
            mouth. Landlords juggle messages from dozens of people and tenants never know whether a
            room is still free.
          </p>
          <p>
            We keep it structured: landlords publish properties and rooms, tenants send requests for
            a specific room and move-in date, and an approved request becomes a booking that&apos;s
            confirmed by the first month&apos;s payment. Admins keep the marketplace healthy by
            moderating accounts and listings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/properties">Browse homes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Get in touch</Link>
          </Button>
        </div>
      </div>
    </ContentPage>
  )
}
