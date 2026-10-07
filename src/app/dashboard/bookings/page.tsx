import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { TenantBookings } from "@/components/tenant/tenant-bookings"

export const metadata: Metadata = { title: "My bookings" }

export default function TenantBookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My bookings"
        description="Approved requests become bookings. Pay the first month to confirm one."
      />
      <TenantBookings />
    </div>
  )
}
