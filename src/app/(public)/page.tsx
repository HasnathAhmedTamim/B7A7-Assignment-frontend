import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BuildingIcon,
  CreditCardIcon,
  InboxIcon,
  SearchIcon,
  SendIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { connection } from "next/server"
import { Suspense } from "react"

import { HeroSearch } from "@/components/properties/hero-search"
import {
  PropertyCard,
  PropertyGrid,
  PropertyGridSkeleton,
} from "@/components/properties/property-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { getPublishedProperties } from "@/lib/api/public"
import { DEFAULT_FILTERS } from "@/lib/property-filters"

const tenantSteps = [
  {
    icon: SearchIcon,
    title: "Find a place",
    body: "Filter published homes by city, rent, size and room availability.",
  },
  {
    icon: SendIcon,
    title: "Request a room",
    body: "Pick a room and a move-in date. The landlord reviews your request.",
  },
  {
    icon: CreditCardIcon,
    title: "Pay and move in",
    body: "Once approved, pay the first month securely by card to confirm your booking.",
  },
]

const landlordPoints = [
  { icon: BuildingIcon, text: "List properties and rooms in minutes, publish when ready" },
  { icon: InboxIcon, text: "Approve or decline requests with the tenant's details in view" },
  { icon: BadgeCheckIcon, text: "Bookings confirm automatically when the tenant pays" },
]

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
}

async function LatestListings() {
  // Render per request so builds never depend on the backend being awake
  await connection()
  let result
  try {
    result = await getPublishedProperties({ ...DEFAULT_FILTERS, page: 1 })
  } catch {
    return (
      <EmptyState
        title="Listings are taking a moment to load"
        description="Our listing service is waking up. Browse all homes in a few seconds."
        action={
          <Button asChild variant="outline">
            <Link href="/properties">Browse homes</Link>
          </Button>
        }
      />
    )
  }

  const listings = result.data.slice(0, 6)
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={BuildingIcon}
        title="No homes listed yet"
        description="Landlords are adding properties. Check back soon."
      />
    )
  }
  return (
    <PropertyGrid>
      {listings.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </PropertyGrid>
  )
}

export default function HomePage() {
  return (
    <>
      <section className="border-b bg-sidebar">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-medium text-primary">Rooms and homes across Bangladesh</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">{siteConfig.tagline}</h1>
            <p className="text-lg text-muted-foreground">
              Browse verified listings, request a room in a couple of clicks, and pay your first
              month online once the landlord says yes.
            </p>
          </div>
          <HeroSearch />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Latest listings</h2>
            <p className="text-sm text-muted-foreground">Recently published homes and rooms.</p>
          </div>
          <Button variant="ghost" asChild className="shrink-0">
            <Link href="/properties">
              View all
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <Suspense fallback={<PropertyGridSkeleton />}>
          <LatestListings />
        </Suspense>
      </section>

      <section className="border-y bg-sidebar">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-14 sm:px-6">
          <div className="max-w-xl space-y-1">
            <h2 className="text-2xl font-semibold">Renting, in three steps</h2>
            <p className="text-sm text-muted-foreground">
              No agents and no back-and-forth over the phone.
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {tenantSteps.map((step, index) => (
              <li key={step.title} className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <step.icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="text-sm font-medium text-primary">For landlords</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Fill rooms without the paperwork</h2>
          <p className="text-muted-foreground">
            Keep every property, room, request and payment in one workspace built for small
            landlords.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="lg">
              <Link href="/register">List your property</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
        <ul className="space-y-3">
          {landlordPoints.map((point) => (
            <li key={point.text} className="flex items-start gap-3 rounded-xl border bg-card p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <point.icon className="size-4" aria-hidden />
              </span>
              <p className="pt-1.5 text-sm">{point.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
