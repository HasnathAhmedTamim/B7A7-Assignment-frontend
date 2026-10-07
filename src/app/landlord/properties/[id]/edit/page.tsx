import type { Metadata } from "next"
import { Suspense } from "react"

import { PropertyEditPage } from "@/components/landlord/property-edit-form"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Edit property" }

async function EditProperty({
  params,
}: {
  params: PageProps<"/landlord/properties/[id]/edit">["params"]
}) {
  const { id } = await params
  return <PropertyEditPage propertyId={id} />
}

export default function EditPropertyPage({ params }: PageProps<"/landlord/properties/[id]/edit">) {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-3xl rounded-xl" />}>
      <EditProperty params={params} />
    </Suspense>
  )
}
