"use client"

import { CreditCardIcon, HourglassIcon, ReceiptIcon, WalletIcon } from "lucide-react"
import Link from "next/link"

import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatCard, StatCardSkeleton, StatGrid } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { useMyPayments } from "@/hooks/use-rentals"
import { formatDateTime, formatMoney, shortId, toNumber } from "@/lib/format"
import { gatewayLabel } from "@/lib/labels"
import type { PaymentWithBooking } from "@/types/models"

const columns: Column<PaymentWithBooking>[] = [
  {
    id: "home",
    header: "Booking",
    cell: (p) => (
      <div className="min-w-0">
        <Link href={`/dashboard/bookings/${p.booking.id}`} className="font-medium hover:underline">
          {p.booking.property.title}
        </Link>
        <p className="text-sm text-muted-foreground">{p.booking.room.name}</p>
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    cell: (p) => (
      <span className="font-medium tabular-nums">{formatMoney(p.amount, p.currency)}</span>
    ),
  },
  { id: "method", header: "Method", cell: (p) => gatewayLabel[p.gateway], hideOnMobile: true },
  {
    id: "date",
    header: "Date",
    cell: (p) => <span className="whitespace-nowrap">{formatDateTime(p.createdAt)}</span>,
  },
  {
    id: "reference",
    header: "Reference",
    cell: (p) => <span className="font-mono text-xs">{shortId(p.id)}</span>,
    hideOnMobile: true,
  },
  { id: "status", header: "Status", cell: (p) => <StatusBadge kind="payment" status={p.status} /> },
]

export function TenantPayments() {
  const payments = useMyPayments()

  if (payments.isError) {
    return <ErrorState error={payments.error} onRetry={() => void payments.refetch()} />
  }
  if (!payments.data) {
    return (
      <div className="space-y-6">
        <StatGrid className="lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </StatGrid>
        <DataTableSkeleton columns={6} />
      </div>
    )
  }

  if (payments.data.length === 0) {
    return (
      <EmptyState
        icon={ReceiptIcon}
        title="No payments yet"
        description="Once a landlord approves your request, you can pay the first month from the booking page."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/bookings">View bookings</Link>
          </Button>
        }
      />
    )
  }

  const paid = payments.data.filter((p) => p.status === "PAID")
  const pending = payments.data.filter((p) => p.status === "PENDING")
  const totalPaid = paid.reduce((sum, p) => sum + toNumber(p.amount), 0)

  return (
    <div className="space-y-6">
      <StatGrid className="lg:grid-cols-3">
        <StatCard label="Total paid" value={formatMoney(totalPaid)} icon={WalletIcon} />
        <StatCard label="Successful payments" value={paid.length} icon={CreditCardIcon} />
        <StatCard
          label="In progress"
          value={pending.length}
          hint="Checkouts not finished yet"
          icon={HourglassIcon}
        />
      </StatGrid>
      <DataTable
        caption="Your payments"
        columns={columns}
        rows={payments.data}
        getRowId={(p) => p.id}
      />
    </div>
  )
}
