import { PlusIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { LandlordProperties } from "@/components/landlord/landlord-properties"
import { DataTableSkeleton } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Properties" }

export default function LandlordPropertiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Every home you manage, including drafts and archived listings."
        actions={
          <Button asChild>
            <Link href="/landlord/properties/new">
              <PlusIcon data-icon="inline-start" />
              Add property
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<DataTableSkeleton columns={6} />}>
        <LandlordProperties />
      </Suspense>
    </div>
  )
}
