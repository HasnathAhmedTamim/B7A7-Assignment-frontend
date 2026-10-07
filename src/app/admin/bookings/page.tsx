import type { Metadata } from "next"

import { ManagedBookings } from "@/components/bookings/managed-bookings"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Bookings" }

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Every booking on the platform and where its payment stands."
      />
      <ManagedBookings viewer="ADMIN" />
    </div>
  )
}
