import type { Metadata } from "next"
import { Suspense } from "react"

import { ManagedBookings } from "@/components/bookings/managed-bookings"
import { DataTableSkeleton } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Bookings" }

export default function LandlordBookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Approved requests across your properties and where each payment stands."
      />
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <ManagedBookings viewer="LANDLORD" />
      </Suspense>
    </div>
  )
}
