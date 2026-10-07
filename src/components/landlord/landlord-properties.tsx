"use client"

import { BuildingIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react"
import Link from "next/link"

import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { SearchInput } from "@/components/shared/search-input"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusTabs } from "@/components/shared/status-tabs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMyProperties, useSetPropertyStatus } from "@/hooks/use-landlord"
import { enumParam, pageParam, useUrlParams } from "@/hooks/use-url-params"
import { formatMoney, formatRelative } from "@/lib/format"
import { propertyStatusLabel, propertyTypeLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { PROPERTY_STATUSES, type Property } from "@/types/models"

const PAGE_SIZE = 10

const columns: Column<Property>[] = [
  {
    id: "title",
    header: "Property",
    cell: (p) => (
      <div className="min-w-0">
        <Link href={`/landlord/properties/${p.id}`} className="font-medium hover:underline">
          {p.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {[p.location, p.city].filter(Boolean).join(", ")}
        </p>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    cell: (p) => propertyTypeLabel[p.propertyType],
    hideOnMobile: true,
  },
  {
    id: "rent",
    header: "Listed rent",
    cell: (p) => <span className="tabular-nums">{formatMoney(p.monthlyRent)}</span>,
  },
  {
    id: "rooms",
    header: "Open rooms",
    cell: (p) => <span className="tabular-nums">{p._count.rooms}</span>,
  },
  {
    id: "updated",
    header: "Updated",
    cell: (p) => <span className="text-muted-foreground">{formatRelative(p.updatedAt)}</span>,
    hideOnMobile: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (p) => <StatusBadge kind="property" status={p.status} />,
  },
]

function RowActions({ property }: { property: Property }) {
  const setStatus = useSetPropertyStatus()
  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/landlord/properties/${property.id}`}>Manage</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Change status of ${property.title}`}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Set visibility</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PROPERTY_STATUSES.map((status) => (
            <DropdownMenuItem
              key={status}
              disabled={status === property.status}
              onSelect={() => setStatus.mutate({ id: property.id, status })}
            >
              {propertyStatusLabel[status]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/landlord/properties/${property.id}/edit`}>Edit details</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

type StatusFilter = "all" | (typeof PROPERTY_STATUSES)[number]

export function LandlordProperties() {
  const { params, set, isPending } = useUrlParams()
  const page = pageParam(params.get("page"))
  const status = enumParam(params.get("status"), PROPERTY_STATUSES)
  const search = params.get("search")?.trim() ?? ""

  const properties = useMyProperties({
    page,
    limit: PAGE_SIZE,
    status,
    search: search || undefined,
  })

  const filtered = Boolean(status || search)
  const data = properties.data

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <StatusTabs<StatusFilter>
          label="Filter properties by status"
          value={status ?? "all"}
          onValueChange={(value) => set({ status: value === "all" ? null : value, page: null })}
          tabs={[
            { value: "all", label: "All" },
            ...PROPERTY_STATUSES.map((s) => ({ value: s, label: propertyStatusLabel[s] })),
          ]}
        />
        <SearchInput
          value={search}
          onChange={(value) => set({ search: value, page: null })}
          placeholder="Search by title or city"
          label="Search your properties"
          className="lg:w-72"
        />
      </div>

      {properties.isError && !data ? (
        <ErrorState error={properties.error} onRetry={() => void properties.refetch()} />
      ) : !data ? (
        <DataTableSkeleton columns={6} />
      ) : data.data.length === 0 ? (
        filtered ? (
          <EmptyState
            title="No properties match"
            description="Try another status or search term."
            action={
              <Button
                variant="outline"
                onClick={() => set({ status: null, search: null, page: null })}
              >
                Clear filters
              </Button>
            }
          />
        ) : page > 1 ? (
          <EmptyState
            title="This page is empty"
            action={
              <Button variant="outline" onClick={() => set({ page: null })}>
                Go to the first page
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BuildingIcon}
            title="List your first property"
            description="Add the home, then its rooms. Publish it when you're ready for requests."
            action={
              <Button asChild>
                <Link href="/landlord/properties/new">
                  <PlusIcon data-icon="inline-start" />
                  Add property
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <div
          className={cn(
            "space-y-4 transition-opacity",
            (isPending || properties.isPlaceholderData) && "opacity-60",
          )}
        >
          <DataTable
            caption="Your properties"
            columns={columns}
            rows={data.data}
            getRowId={(p) => p.id}
            actions={(p) => <RowActions property={p} />}
          />
          <PaginationBar
            meta={data.meta}
            onPageChange={(next) => set({ page: next > 1 ? next : null })}
          />
        </div>
      )}
    </div>
  )
}
