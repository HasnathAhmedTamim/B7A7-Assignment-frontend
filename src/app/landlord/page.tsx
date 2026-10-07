import type { Metadata } from "next"

import { LandlordOverview } from "@/components/landlord/landlord-overview"

export const metadata: Metadata = { title: "Landlord overview" }

export default function LandlordOverviewPage() {
  return <LandlordOverview />
}
