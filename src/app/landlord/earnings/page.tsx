import type { Metadata } from "next"

import { LandlordEarnings } from "@/components/landlord/landlord-earnings"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Earnings" }

export default function LandlordEarningsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Earnings" description="Rent collected through card payments, in BDT." />
      <LandlordEarnings />
    </div>
  )
}
