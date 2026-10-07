import type { Metadata } from "next"
import Link from "next/link"

import { ContentPage } from "@/components/layout/content-page"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "How it works",
  description:
    "From finding a room to paying the first month: how renting works for tenants and landlords.",
}

const tenantSteps = [
  ["Create a tenant account", "Sign up in under a minute. You only need an email and password."],
  [
    "Find a home",
    "Filter published listings by city, area, rent, property type, bedrooms and free rooms.",
  ],
  [
    "Request a room",
    "Choose a room, a move-in date and optionally a move-out date. Add a note for the landlord.",
  ],
  [
    "Wait for approval",
    "Track the request from your dashboard. You can cancel it while it's still pending.",
  ],
  [
    "Pay the first month",
    "When approved, your booking is created. Pay securely by card through Stripe.",
  ],
  ["Booking confirmed", "Once the payment clears, the booking is confirmed and the room is yours."],
] as const

const landlordSteps = [
  ["Create a landlord account", 'Choose "I\'m renting out property" when you sign up.'],
  [
    "Add a property",
    "Describe it, set the rent and start as a draft. Publish when it's ready to show.",
  ],
  [
    "Add rooms",
    "Each room has its own type, capacity and rent, and can be marked available or not.",
  ],
  [
    "Review requests",
    "See who's asking for which room and when. Approving one reserves the room, so you can decline the rest.",
  ],
  [
    "Get paid",
    "Approved requests become bookings. They confirm automatically when the tenant pays.",
  ],
] as const

function Steps({ steps }: { steps: ReadonlyArray<readonly [string, string]> }) {
  return (
    <ol className="relative space-y-6 border-l pl-6">
      {steps.map(([title, body], index) => (
        <li key={title} className="relative">
          <span className="absolute top-0 -left-[2.07rem] flex size-6 items-center justify-center rounded-full border bg-background text-xs font-medium tabular-nums">
            {index + 1}
          </span>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </li>
      ))}
    </ol>
  )
}

export default function HowItWorksPage() {
  return (
    <ContentPage
      eyebrow="How it works"
      title="One clear path from search to move-in"
      intro="Every step is visible to both tenant and landlord, so nobody has to chase anyone."
    >
      <div className="grid gap-12 md:grid-cols-2">
        <section className="space-y-6" aria-labelledby="tenants-heading">
          <h2 id="tenants-heading" className="text-xl font-semibold">
            For tenants
          </h2>
          <Steps steps={tenantSteps} />
          <Button asChild>
            <Link href="/properties">Start browsing</Link>
          </Button>
        </section>
        <section className="space-y-6" aria-labelledby="landlords-heading">
          <h2 id="landlords-heading" className="text-xl font-semibold">
            For landlords
          </h2>
          <Steps steps={landlordSteps} />
          <Button asChild variant="outline">
            <Link href="/register">List a property</Link>
          </Button>
        </section>
      </div>
    </ContentPage>
  )
}
