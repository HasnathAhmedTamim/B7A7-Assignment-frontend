import { SearchXIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { FiltersTransitionProvider, PendingResults } from "@/components/properties/filters-context"
import { FilterPanel } from "@/components/properties/filter-panel"
import {
  PropertyCard,
  PropertyGrid,
  PropertyGridSkeleton,
} from "@/components/properties/property-card"
import { PropertyToolbar } from "@/components/properties/property-toolbar"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getPublishedProperties } from "@/lib/api/public"
import { pluralize } from "@/lib/format"
import { publicMetadata } from "@/lib/metadata"
import { filtersToSearchParams, parsePropertyFilters } from "@/lib/property-filters"

export const metadata: Metadata = publicMetadata({
  title: "Browse homes",
  description:
    "Search published apartments, houses, studios and shared rooms by city, rent and size.",
  path: "/properties",
})

async function PropertyResults({
  searchParams,
}: {
  searchParams: PageProps<"/properties">["searchParams"]
}) {
  const filters = parsePropertyFilters(await searchParams)
  const { data, meta } = await getPublishedProperties(filters)

  if (data.length === 0) {
    const pastLastPage = meta.total > 0 && filters.page > meta.totalPages
    const firstPage = filtersToSearchParams({ ...filters, page: 1 }).toString()
    return (
      <EmptyState
        icon={SearchXIcon}
        title={pastLastPage ? "That page doesn't exist" : "No homes match your filters"}
        description={
          pastLastPage
            ? `There ${meta.totalPages === 1 ? "is" : "are"} only ${pluralize(meta.totalPages, "page")} of results.`
            : "Try a different city, widen the rent range or remove a filter."
        }
        action={
          <Button asChild variant="outline">
            <Link href={pastLastPage ? `/properties?${firstPage}` : "/properties"}>
              {pastLastPage ? "Go to the first page" : "Clear all filters"}
            </Link>
          </Button>
        }
      />
    )
  }

  const query = Object.fromEntries(filtersToSearchParams({ ...filters, page: 1 }))

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {pluralize(meta.total, "home")} found
      </p>
      <PropertyGrid>
        {data.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </PropertyGrid>
      <PaginationBar meta={meta} link={{ pathname: "/properties", query }} />
    </div>
  )
}

function ToolbarSkeleton() {
  return <Skeleton className="h-9 w-full" />
}

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Browse homes"
        description="Published apartments, houses, studios and shared rooms. Rents are monthly, in BDT."
      />
      <FiltersTransitionProvider>
        <Suspense fallback={<ToolbarSkeleton />}>
          <PropertyToolbar />
        </Suspense>
        <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="hidden lg:block" aria-label="Filters">
            <Card className="sticky top-20 px-4">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <FilterPanel />
              </Suspense>
            </Card>
          </aside>
          <PendingResults>
            <Suspense fallback={<PropertyGridSkeleton />}>
              <PropertyResults searchParams={searchParams} />
            </Suspense>
          </PendingResults>
        </div>
      </FiltersTransitionProvider>
    </div>
  )
}
