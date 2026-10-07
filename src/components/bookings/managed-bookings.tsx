"use client"

import { CalendarCheckIcon } from "lucide-react"
import Link from "next/link"

import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { SearchInput } from "@/components/shared/search-input"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusTabs } from "@/components/shared/status-tabs"
import { Button } from "@/components/ui/button"
import { useBookings } from "@/hooks/use-rentals"
import { enumParam, useUrlParams } from "@/hooks/use-url-params"
import { formatDate, formatMoney } from "@/lib/format"
import type { Booking } from "@/types/models"

type Viewer = "LANDLORD" | "ADMIN"
const FILTERS = ["all", "PENDING_PAYMENT", "CONFIRMED", "past"] as const
type Filter = (typeof FILTERS)[number]

const matches: Record<Filter, (b: Booking) => boolean> = {
  all: () => true,
  PENDING_PAYMENT: (b) => b.status === "PENDING_PAYMENT",
  CONFIRMED: (b) => b.status === "CONFIRMED",
  past: (b) => b.status === "CANCELLED" || b.status === "COMPLETED",
}

const detailBase: Record<Viewer, string> = {
  LANDLORD: "/landlord/bookings",
  ADMIN: "/admin/bookings",
}

function latestPayment(booking: Booking) {
  return [...booking.payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
}

function columnsFor(viewer: Viewer): Column<Booking>[] {
  return [
    {
      id: "tenant",
      header: "Tenant",
      cell: (b) => (
        <div className="min-w-0">
          <Link href={`${detailBase[viewer]}/${b.id}`} className="font-medium hover:underline">
            {b.tenant.name}
          </Link>
          <p className="truncate text-sm text-muted-foreground">{b.tenant.email}</p>
        </div>
      ),
    },
    {
      id: "home",
      header: "Room",
      cell: (b) => (
        <div className="min-w-0">
          <p>{b.property.title}</p>
          <p className="text-sm text-muted-foreground">
            {b.room.name} · {b.property.city}
          </p>
        </div>
      ),
    },
    {
      id: "stay",
      header: "Stay",
      cell: (b) => (
        <span className="whitespace-nowrap">
          {formatDate(b.startDate)} – {b.endDate ? formatDate(b.endDate) : "open-ended"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      id: "rent",
      header: "Rent",
      cell: (b) => <span className="tabular-nums">{formatMoney(b.rentAmount)}</span>,
    },
    {
      id: "payment",
      header: "Last payment",
      cell: (b) => {
        const payment = latestPayment(b)
        return payment ? (
          <StatusBadge kind="payment" status={payment.status} />
        ) : (
          <span className="text-sm text-muted-foreground">None yet</span>
        )
      },
      hideOnMobile: true,
    },
    {
      id: "status",
      header: "Booking",
      cell: (b) => <StatusBadge kind="booking" status={b.status} />,
    },
  ]
}

export function ManagedBookings({ viewer }: { viewer: Viewer }) {
  const bookings = useBookings()
  const { params, set } = useUrlParams()
  const filter = enumParam(params.get("status"), FILTERS) ?? "all"
  const search = params.get("search")?.trim() ?? ""

  if (bookings.isError) {
    return <ErrorState error={bookings.error} onRetry={() => void bookings.refetch()} />
  }
  if (!bookings.data) return <DataTableSkeleton columns={6} />

  if (bookings.data.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheckIcon}
        title="No bookings yet"
        description={
          viewer === "LANDLORD"
            ? "Approving a rental request creates a booking. It's confirmed once the tenant pays."
            : "Bookings appear here once landlords approve rental requests."
        }
        action={
          viewer === "LANDLORD" ? (
            <Button variant="outline" asChild>
              <Link href="/landlord/requests">Review requests</Link>
            </Button>
          ) : undefined
        }
      />
    )
  }

  const term = search.toLowerCase()
  const searched = term
    ? bookings.data.filter((b) =>
        [b.tenant.name, b.tenant.email, b.property.title, b.property.city, b.room.name].some((v) =>
          v.toLowerCase().includes(term),
        ),
      )
    : bookings.data
  const count = (f: Filter) => searched.filter(matches[f]).length
  const rows = searched.filter(matches[filter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <StatusTabs
          label="Filter bookings by status"
          value={filter}
          onValueChange={(value) => set({ status: value === "all" ? null : value })}
          tabs={[
            { value: "all", label: "All", count: count("all") },
            {
              value: "PENDING_PAYMENT",
              label: "Awaiting payment",
              count: count("PENDING_PAYMENT"),
            },
            { value: "CONFIRMED", label: "Confirmed", count: count("CONFIRMED") },
            { value: "past", label: "Past", count: count("past") },
          ]}
        />
        <SearchInput
          value={search}
          onChange={(value) => set({ search: value })}
          placeholder="Search tenant, home or room"
          label="Search bookings"
          className="lg:w-72"
          delay={150}
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Nothing here" description="No bookings match these filters." />
      ) : (
        <DataTable
          caption="Bookings"
          columns={columnsFor(viewer)}
          rows={rows}
          getRowId={(b) => b.id}
          actions={(b) => (
            <Button variant="outline" size="sm" asChild>
              <Link href={`${detailBase[viewer]}/${b.id}`}>Details</Link>
            </Button>
          )}
        />
      )}
    </div>
  )
}
