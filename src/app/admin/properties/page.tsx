import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminProperties } from "@/components/admin/admin-properties"
import { DataTableSkeleton } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Properties" }

export default function AdminPropertiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Every listing on the platform. Unpublish or remove homes that break the rules."
      />
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <AdminProperties />
      </Suspense>
    </div>
  )
}
