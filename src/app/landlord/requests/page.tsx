import type { Metadata } from "next"
import { Suspense } from "react"

import { LandlordRequests } from "@/components/landlord/landlord-requests"
import { DataTableSkeleton } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Rental requests" }

export default function LandlordRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rental requests"
        description="Approving a request reserves the room and asks the tenant to pay the first month."
      />
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <LandlordRequests />
      </Suspense>
    </div>
  )
}
