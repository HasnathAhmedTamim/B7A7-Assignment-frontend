import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { TenantPayments } from "@/components/tenant/tenant-payments"

export const metadata: Metadata = { title: "Payments" }

export default function TenantPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Card payments for your bookings, including unfinished checkouts."
      />
      <TenantPayments />
    </div>
  )
}
