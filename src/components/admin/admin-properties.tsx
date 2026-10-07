"use client"

import { BuildingIcon, ChevronDownIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
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
import { useModerationProperties } from "@/hooks/use-admin"
import { useDeleteProperty, useSetPropertyStatus } from "@/hooks/use-landlord"
import { enumParam, pageParam, useUrlParams } from "@/hooks/use-url-params"
import { formatAddress, formatDate, formatMoney } from "@/lib/format"
import { propertyStatusLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { PROPERTY_STATUSES, type Property, type PropertyStatus } from "@/types/models"

const PAGE_SIZE = 10
const tabOrder: PropertyStatus[] = ["PUBLISHED", "DRAFT", "ARCHIVED"]

const statusAction: Record<PropertyStatus, string> = {
  PUBLISHED: "Publish",
  DRAFT: "Move to drafts",
  ARCHIVED: "Archive",
}

const emptyCopy: Record<PropertyStatus, string> = {
  PUBLISHED: "No homes are live right now.",
  DRAFT: "No landlord has an unpublished draft.",
  ARCHIVED: "Nothing has been archived.",
}

const columns: Column<Property>[] = [
  {
    id: "title",
    header: "Property",
    cell: (p) => (
      <div className="min-w-0">
        {p.status === "PUBLISHED" ? (
          <Link href={`/properties/${p.id}`} className="font-medium hover:underline">
            {p.title}
          </Link>
        ) : (
          <span className="font-medium">{p.title}</span>
        )}
        <p className="truncate text-sm font-normal text-muted-foreground">{formatAddress(p)}</p>
      </div>
    ),
  },
  {
    id: "owner",
    header: "Landlord",
    cell: (p) => (
      <div className="min-w-0">
        <p className="truncate">{p.owner.name}</p>
        <p className="truncate text-sm text-muted-foreground">{p.owner.email}</p>
      </div>
    ),
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
    hideOnMobile: true,
  },
  {
    id: "created",
    header: "Listed",
    cell: (p) => <span className="whitespace-nowrap">{formatDate(p.createdAt)}</span>,
    hideOnMobile: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (p) => <StatusBadge kind="property" status={p.status} />,
  },
]

function RowActions({
  property,
  onDelete,
}: {
  property: Property
  onDelete: (property: Property) => void
}) {
  const setStatus = useSetPropertyStatus()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Moderate ${property.title}`}>
          Moderate
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {property.status === "PUBLISHED" ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/properties/${property.id}`}>
                <ExternalLinkIcon />
                View listing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuLabel>Visibility</DropdownMenuLabel>
        {PROPERTY_STATUSES.filter((s) => s !== property.status).map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={() => setStatus.mutate({ id: property.id, status })}
          >
            {statusAction[status]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(property)}>
          Delete property
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AdminProperties() {
  const { params, set, isPending } = useUrlParams()
  const page = pageParam(params.get("page"))
  const status = enumParam(params.get("status"), PROPERTY_STATUSES) ?? "PUBLISHED"
  const search = params.get("search")?.trim() ?? ""

  const properties = useModerationProperties({
    status,
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  })
  const remove = useDeleteProperty()
  const [deleting, setDeleting] = useState<Property | null>(null)
  const data = properties.data

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <StatusTabs<PropertyStatus>
          label="Filter properties by status"
          value={status}
          onValueChange={(value) =>
            set({ status: value === "PUBLISHED" ? null : value, page: null })
          }
          tabs={tabOrder.map((s) => ({ value: s, label: propertyStatusLabel[s] }))}
        />
        <SearchInput
          value={search}
          onChange={(value) => set({ search: value, page: null })}
          placeholder="Title, description, city or address"
          label="Search properties"
          className="lg:w-80"
        />
      </div>

      {properties.isError && !data ? (
        <ErrorState error={properties.error} onRetry={() => void properties.refetch()} />
      ) : !data ? (
        <DataTableSkeleton columns={6} />
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={BuildingIcon}
          title={search ? "No properties match" : page > 1 ? "This page is empty" : "Nothing here"}
          description={search ? "Try a different search term." : emptyCopy[status]}
          action={
            search || page > 1 ? (
              <Button variant="outline" onClick={() => set({ search: null, page: null })}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={cn(
            "space-y-4 transition-opacity",
            (isPending || properties.isPlaceholderData) && "opacity-60",
          )}
        >
          <DataTable
            caption={`${propertyStatusLabel[status]} properties`}
            columns={columns}
            rows={data.data}
            getRowId={(p) => p.id}
            actions={(p) => <RowActions property={p} onDelete={setDeleting} />}
          />
          <PaginationBar
            meta={data.meta}
            onPageChange={(next) => set({ page: next > 1 ? next : null })}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.title ?? ""}"?`}
        description="The listing and its rooms are removed and pending requests are declined. Homes with an active booking can't be deleted until the booking is cancelled."
        confirmLabel="Delete property"
        destructive
        pending={remove.isPending}
        onConfirm={() => {
          if (!deleting) return
          remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })
        }}
      />
    </div>
  )
}
