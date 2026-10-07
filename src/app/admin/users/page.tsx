import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminUsers } from "@/components/admin/admin-users"
import { DataTableSkeleton } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Users" }

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Find accounts, change roles and block access. Every change is recorded in the audit log."
      />
      <Suspense fallback={<DataTableSkeleton columns={5} rows={8} />}>
        <AdminUsers />
      </Suspense>
    </div>
  )
}
