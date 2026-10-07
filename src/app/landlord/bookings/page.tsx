import type { Metadata } from "next"

import { ManagedBookings } from "@/components/bookings/managed-bookings"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Bookings" }

export default function LandlordBookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Approved requests across your properties and where each payment stands."
      />
      <ManagedBookings viewer="LANDLORD" />
    </div>
  )
}
