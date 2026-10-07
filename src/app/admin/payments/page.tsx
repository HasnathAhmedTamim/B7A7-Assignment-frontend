import type { Metadata } from "next"

import { AdminPayments } from "@/components/admin/admin-payments"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Payments" }

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Card payments across all bookings. Statuses update from Stripe automatically."
      />
      <AdminPayments />
    </div>
  )
}
