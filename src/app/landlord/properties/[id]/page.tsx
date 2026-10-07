import type { Metadata } from "next"
import { Suspense } from "react"

import { PropertyManage } from "@/components/landlord/property-manage"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Manage property" }

async function ManagedProperty({
  params,
}: {
  params: PageProps<"/landlord/properties/[id]">["params"]
}) {
  const { id } = await params
  return <PropertyManage propertyId={id} />
}

export default function ManagePropertyPage({ params }: PageProps<"/landlord/properties/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
      <ManagedProperty params={params} />
    </Suspense>
  )
}
