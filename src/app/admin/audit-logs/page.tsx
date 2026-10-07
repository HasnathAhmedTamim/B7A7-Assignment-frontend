import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminAuditLogs } from "@/components/admin/admin-audit-logs"
import { DataTableSkeleton } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Audit log" }

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="A record of sign-ins, listing changes, bookings, payments and admin actions, newest first."
      />
      <Suspense fallback={<DataTableSkeleton columns={4} rows={10} />}>
        <AdminAuditLogs />
      </Suspense>
    </div>
  )
}
