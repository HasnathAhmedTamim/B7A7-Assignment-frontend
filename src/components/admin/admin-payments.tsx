"use client"

import { isSameMonth, parseISO } from "date-fns"
import {
  AlertTriangleIcon,
  CalendarIcon,
  CreditCardIcon,
  HourglassIcon,
  WalletIcon,
} from "lucide-react"
import Link from "next/link"

import { LazyBarChart } from "@/components/charts/lazy-bar-chart"
import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatCard, StatCardSkeleton, StatGrid } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusTabs } from "@/components/shared/status-tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBookings } from "@/hooks/use-rentals"
import { enumParam, useUrlParams } from "@/hooks/use-url-params"
import { bookingPayments, monthlyTotals, sumAmounts, type BookingPaymentRow } from "@/lib/earnings"
import { formatCompactMoney, formatDateTime, formatMoney, pluralize } from "@/lib/format"
import { gatewayLabel } from "@/lib/labels"
import type { PaymentStatus } from "@/types/models"

const FILTERS = ["all", "PAID", "PENDING", "unsuccessful"] as const
type Filter = (typeof FILTERS)[number]

const matches: Record<Filter, (status: PaymentStatus) => boolean> = {
  all: () => true,
  PAID: (s) => s === "PAID",
  PENDING: (s) => s === "PENDING",
  unsuccessful: (s) => s === "FAILED" || s === "CANCELLED" || s === "REFUNDED",
}

const columns: Column<BookingPaymentRow>[] = [
  {
    id: "tenant",
    header: "Tenant",
    cell: (p) => (
      <div className="min-w-0">
        <Link href={`/admin/bookings/${p.booking.id}`} className="font-medium hover:underline">
          {p.booking.tenant.name}
        </Link>
        <p className="truncate text-sm font-normal text-muted-foreground">
          {p.booking.tenant.email}
        </p>
      </div>
    ),
  },
  {
    id: "room",
    header: "Room",
    cell: (p) => (
      <div className="min-w-0">
        <p className="truncate">{p.booking.property.title}</p>
        <p className="text-sm text-muted-foreground">{p.booking.room.name}</p>
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    cell: (p) => <span className="font-medium tabular-nums">{formatMoney(p.amount)}</span>,
  },
  { id: "method", header: "Method", cell: (p) => gatewayLabel[p.gateway], hideOnMobile: true },
  {
    id: "date",
    header: "Started",
    cell: (p) => <span className="whitespace-nowrap">{formatDateTime(p.createdAt)}</span>,
    hideOnMobile: true,
  },
  { id: "status", header: "Status", cell: (p) => <StatusBadge kind="payment" status={p.status} /> },
]

export function AdminPayments() {
  const bookings = useBookings()
  const { params, set } = useUrlParams()
  const filter = enumParam(params.get("status"), FILTERS) ?? "all"

  if (bookings.isError) {
    return <ErrorState error={bookings.error} onRetry={() => void bookings.refetch()} />
  }
  if (!bookings.data) {
    return (
      <div className="space-y-6">
        <StatGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </StatGrid>
        <DataTableSkeleton columns={6} />
      </div>
    )
  }

  const payments = bookingPayments(bookings.data)
  const paid = payments.filter((p) => p.status === "PAID")
  const now = new Date()
  const thisMonth = paid.filter((p) => isSameMonth(parseISO(p.createdAt), now))
  const open = payments.filter((p) => p.status === "PENDING")
  const unsuccessful = payments.filter((p) => matches.unsuccessful(p.status))
  const count = (f: Filter) => payments.filter((p) => matches[f](p.status)).length
  const rows = payments.filter((p) => matches[filter](p.status))

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard
          label="Total collected"
          value={formatMoney(sumAmounts(paid))}
          hint={pluralize(paid.length, "successful payment")}
          icon={WalletIcon}
        />
        <StatCard
          label="This month"
          value={formatMoney(sumAmounts(thisMonth))}
          hint={pluralize(thisMonth.length, "payment")}
          icon={CalendarIcon}
        />
        <StatCard
          label="Open checkouts"
          value={open.length}
          hint="Started, not yet completed"
          icon={HourglassIcon}
        />
        <StatCard
          label="Unsuccessful"
          value={unsuccessful.length}
          hint="Failed, cancelled or refunded"
          icon={AlertTriangleIcon}
        />
      </StatGrid>

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title="No payments yet"
          description="Payments appear here when tenants pay for approved bookings."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Collected per month</CardTitle>
              <CardDescription>
                Successful card payments over the last 6 months, in BDT.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LazyBarChart
                data={monthlyTotals(paid, 6, now)}
                seriesLabel="Collected"
                formatValue={formatCompactMoney}
                className="aspect-auto h-64 w-full"
              />
            </CardContent>
          </Card>

          <section className="space-y-3" aria-labelledby="payments-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 id="payments-heading" className="text-lg font-semibold">
                All payment attempts
              </h2>
              <StatusTabs
                label="Filter payments by status"
                value={filter}
                onValueChange={(value) => set({ status: value === "all" ? null : value })}
                tabs={[
                  { value: "all", label: "All", count: count("all") },
                  { value: "PAID", label: "Paid", count: count("PAID") },
                  { value: "PENDING", label: "Pending", count: count("PENDING") },
                  { value: "unsuccessful", label: "Unsuccessful", count: count("unsuccessful") },
                ]}
              />
            </div>
            {rows.length === 0 ? (
              <EmptyState title="Nothing here" description="No payments match this filter." />
            ) : (
              <DataTable caption="Payments" columns={columns} rows={rows} getRowId={(p) => p.id} />
            )}
          </section>
        </>
      )}
    </div>
  )
}
