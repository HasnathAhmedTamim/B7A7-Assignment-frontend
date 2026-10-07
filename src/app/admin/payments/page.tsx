import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminPayments } from "@/components/admin/admin-payments"
import { DataTableSkeleton } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Payments" }

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Card payments across all bookings. Statuses update from Stripe automatically."
      />
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <AdminPayments />
      </Suspense>
    </div>
  )
}
