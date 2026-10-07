import { ChevronDownIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { ContentPage } from "@/components/layout/content-page"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about requests, bookings, payments and listings.",
}

const groups = [
  {
    title: "For tenants",
    items: [
      {
        q: "Do I pay anything when I send a request?",
        a: "No. Sending a request is free. You only pay after the landlord approves it and a booking is created for you.",
      },
      {
        q: "Can I request more than one room?",
        a: "Yes, you can request rooms in different properties. You can't send a second pending request for the same room.",
      },
      {
        q: "Can I withdraw a request?",
        a: "Yes, while it's still pending. Open My requests in your dashboard and cancel it. Once the landlord has responded, the request can no longer be cancelled.",
      },
      {
        q: "When is my booking confirmed?",
        a: "As soon as your first month's payment succeeds. Until then the booking shows as awaiting payment.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        q: "Which currency am I charged in?",
        a: "All rents are listed and charged in Bangladeshi Taka (BDT). Your bank may show a conversion if your card is in another currency.",
      },
      {
        q: "How are card payments processed?",
        a: "Through Stripe Checkout. We never see or store your card number.",
      },
      {
        q: "My payment went through but the booking still says awaiting payment.",
        a: "Confirmation can take a few seconds while Stripe notifies us. Refresh the booking after a minute. If it still hasn't updated, contact support with your booking reference.",
      },
      {
        q: "What happens if a booking is cancelled after I've paid?",
        a: "Cancelling frees up the room. Refunds aren't automatic. Contact support and we'll arrange it with the landlord.",
      },
    ],
  },
  {
    title: "For landlords",
    items: [
      {
        q: "Who can see my property?",
        a: "Only published properties appear in search. Drafts and archived properties are visible to you and to admins only.",
      },
      {
        q: "What happens when I approve a request?",
        a: "The room is reserved and a booking is created for the tenant, who then pays the first month to confirm it.",
      },
      {
        q: "Can I remove a room or property with an active booking?",
        a: "No. Rooms and properties with bookings that are awaiting payment or confirmed are protected until those bookings end or are cancelled.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <ContentPage
      eyebrow="Help centre"
      title="Frequently asked questions"
      intro={
        <>
          Can&apos;t find what you need?{" "}
          <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
            Contact us
          </Link>
          .
        </>
      }
    >
      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.title} className="space-y-3" aria-labelledby={`faq-${group.title}`}>
            <h2 id={`faq-${group.title}`} className="text-lg font-semibold">
              {group.title}
            </h2>
            <div className="divide-y rounded-xl border bg-card">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group px-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
                    {item.q}
                    <ChevronDownIcon
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="pb-4 text-sm text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ContentPage>
  )
}
