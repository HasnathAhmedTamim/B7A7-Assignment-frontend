"use client"

import { isSameMonth, parseISO } from "date-fns"
import { BanknoteIcon, CalendarIcon, HourglassIcon, WalletIcon } from "lucide-react"
import Link from "next/link"

import { LazyBarChart } from "@/components/charts/lazy-bar-chart"
import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatCard, StatCardSkeleton, StatGrid } from "@/components/shared/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBookings } from "@/hooks/use-rentals"
import { monthlyTotals, paidPayments, sumAmounts, type PaidPayment } from "@/lib/earnings"
import { formatCompactMoney, formatDateTime, formatMoney, pluralize, toNumber } from "@/lib/format"
import { gatewayLabel } from "@/lib/labels"

const paymentColumns: Column<PaidPayment>[] = [
  {
    id: "tenant",
    header: "Tenant",
    cell: (p) => (
      <Link href={`/landlord/bookings/${p.booking.id}`} className="font-medium hover:underline">
        {p.booking.tenant.name}
      </Link>
    ),
  },
  {
    id: "room",
    header: "Room",
    cell: (p) => (
      <span>
        {p.booking.property.title}
        <span className="block text-sm text-muted-foreground">{p.booking.room.name}</span>
      </span>
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
    header: "Paid on",
    cell: (p) => <span className="whitespace-nowrap">{formatDateTime(p.createdAt)}</span>,
  },
]

export function LandlordEarnings() {
  const bookings = useBookings()

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
        <DataTableSkeleton columns={5} />
      </div>
    )
  }

  const payments = paidPayments(bookings.data)
  const now = new Date()
  const thisMonth = payments.filter((p) => isSameMonth(parseISO(p.createdAt), now))
  const awaiting = bookings.data.filter((b) => b.status === "PENDING_PAYMENT")
  const awaitingTotal = awaiting.reduce((sum, b) => sum + toNumber(b.rentAmount), 0)

  const byProperty = Object.values(
    payments.reduce<Record<string, { id: string; title: string; total: number; count: number }>>(
      (acc, p) => {
        const key = p.booking.property.id
        const entry = (acc[key] ??= {
          id: key,
          title: p.booking.property.title,
          total: 0,
          count: 0,
        })
        entry.total += toNumber(p.amount)
        entry.count += 1
        return acc
      },
      {},
    ),
  ).sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard
          label="Total collected"
          value={formatMoney(sumAmounts(payments))}
          hint={pluralize(payments.length, "successful payment")}
          icon={WalletIcon}
        />
        <StatCard
          label="This month"
          value={formatMoney(sumAmounts(thisMonth))}
          hint={pluralize(thisMonth.length, "payment")}
          icon={CalendarIcon}
        />
        <StatCard
          label="Awaiting payment"
          value={formatMoney(awaitingTotal)}
          hint={pluralize(awaiting.length, "approved booking")}
          icon={HourglassIcon}
        />
        <StatCard
          label="Active bookings"
          value={bookings.data.filter((b) => b.status === "CONFIRMED").length}
          hint="Paid and confirmed"
          icon={BanknoteIcon}
        />
      </StatGrid>

      {payments.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="No payments yet"
          description="When a tenant pays for an approved booking, the money shows up here."
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>Collected per month</CardTitle>
                <CardDescription>Successful card payments over the last 6 months.</CardDescription>
              </CardHeader>
              <CardContent>
                <LazyBarChart
                  data={monthlyTotals(payments, 6, now)}
                  seriesLabel="Collected"
                  formatValue={formatCompactMoney}
                  className="aspect-[2/1] w-full"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>By property</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {byProperty.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <Link
                        href={`/landlord/properties/${entry.id}`}
                        className="min-w-0 truncate hover:underline"
                      >
                        {entry.title}
                      </Link>
                      <span className="shrink-0 font-medium tabular-nums">
                        {formatMoney(entry.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <section className="space-y-3" aria-labelledby="payments-heading">
            <h2 id="payments-heading" className="text-lg font-semibold">
              Payments received
            </h2>
            <DataTable
              caption="Payments received"
              columns={paymentColumns}
              rows={payments}
              getRowId={(p) => p.id}
            />
          </section>
        </>
      )}
    </div>
  )
}
