import { ChevronLeftIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PropertyWizard } from "@/components/landlord/property-wizard"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Add property" }

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/landlord/properties">
          <ChevronLeftIcon data-icon="inline-start" />
          All properties
        </Link>
      </Button>
      <PageHeader
        title="Add a property"
        description="Four short steps. Your progress is saved in this tab if you need to step away."
      />
      <PropertyWizard />
    </div>
  )
}
