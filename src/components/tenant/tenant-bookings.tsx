"use client"

import { CalendarCheckIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { PayButton } from "@/components/payments/pay-button"
import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusTabs } from "@/components/shared/status-tabs"
import { Button } from "@/components/ui/button"
import { useBookings } from "@/hooks/use-rentals"
import { formatDate, formatMoney } from "@/lib/format"
import type { Booking } from "@/types/models"

type Filter = "all" | "PENDING_PAYMENT" | "CONFIRMED" | "past"

const matches: Record<Filter, (booking: Booking) => boolean> = {
  all: () => true,
  PENDING_PAYMENT: (b) => b.status === "PENDING_PAYMENT",
  CONFIRMED: (b) => b.status === "CONFIRMED",
  past: (b) => b.status === "CANCELLED" || b.status === "COMPLETED",
}

const columns: Column<Booking>[] = [
  {
    id: "home",
    header: "Home",
    cell: (b) => (
      <div className="min-w-0">
        <Link href={`/dashboard/bookings/${b.id}`} className="font-medium hover:underline">
          {b.property.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {b.room.name} · {b.property.city}
        </p>
      </div>
    ),
  },
  {
    id: "dates",
    header: "Stay",
    cell: (b) => (
      <span className="whitespace-nowrap">
        {formatDate(b.startDate)} – {b.endDate ? formatDate(b.endDate) : "open-ended"}
      </span>
    ),
  },
  {
    id: "rent",
    header: "Monthly rent",
    cell: (b) => <span className="tabular-nums">{formatMoney(b.rentAmount)}</span>,
  },
  { id: "status", header: "Status", cell: (b) => <StatusBadge kind="booking" status={b.status} /> },
]

export function TenantBookings() {
  const bookings = useBookings()
  const [filter, setFilter] = useState<Filter>("all")

  if (bookings.isError) {
    return <ErrorState error={bookings.error} onRetry={() => void bookings.refetch()} />
  }
  if (!bookings.data) return <DataTableSkeleton columns={4} />

  if (bookings.data.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheckIcon}
        title="No bookings yet"
        description="When a landlord approves one of your requests, the booking appears here so you can pay and confirm it."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/requests">View my requests</Link>
          </Button>
        }
      />
    )
  }

  const count = (f: Filter) => bookings.data.filter(matches[f]).length
  const rows = bookings.data.filter(matches[filter])

  return (
    <div className="space-y-4">
      <StatusTabs
        label="Filter bookings by status"
        value={filter}
        onValueChange={setFilter}
        tabs={[
          { value: "all", label: "All", count: count("all") },
          { value: "PENDING_PAYMENT", label: "Awaiting payment", count: count("PENDING_PAYMENT") },
          { value: "CONFIRMED", label: "Confirmed", count: count("CONFIRMED") },
          { value: "past", label: "Past", count: count("past") },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState title="Nothing here" description="No bookings match this filter." />
      ) : (
        <DataTable
          caption="Your bookings"
          columns={columns}
          rows={rows}
          getRowId={(b) => b.id}
          actions={(b) => (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/bookings/${b.id}`}>Details</Link>
              </Button>
              {b.status === "PENDING_PAYMENT" ? (
                <PayButton bookingId={b.id} amount={b.rentAmount} size="sm" />
              ) : null}
            </>
          )}
        />
      )}
    </div>
  )
}
