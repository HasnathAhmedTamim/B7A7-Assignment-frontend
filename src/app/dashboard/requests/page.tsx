import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { TenantRequests } from "@/components/tenant/tenant-requests"

export const metadata: Metadata = { title: "My requests" }

export default function TenantRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My requests"
        description="Rooms you've asked to rent. Pending requests can be cancelled until the landlord replies."
      />
      <TenantRequests />
    </div>
  )
}
