"use client"

import { ClipboardListIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusTabs } from "@/components/shared/status-tabs"
import { Button } from "@/components/ui/button"
import { useCancelRentalRequest, useMyRentalRequests } from "@/hooks/use-rentals"
import { formatDate, formatMoney, formatRelative } from "@/lib/format"
import type { RentalRequest } from "@/types/models"

type Filter = "all" | "PENDING" | "APPROVED" | "closed"

const matches: Record<Filter, (request: RentalRequest) => boolean> = {
  all: () => true,
  PENDING: (r) => r.status === "PENDING",
  APPROVED: (r) => r.status === "APPROVED",
  closed: (r) => r.status === "REJECTED" || r.status === "CANCELLED",
}

const columns: Column<RentalRequest>[] = [
  {
    id: "home",
    header: "Home",
    cell: (r) => (
      <div className="min-w-0">
        <Link href={`/properties/${r.property.id}`} className="font-medium hover:underline">
          {r.property.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {r.room.name} · {r.property.city}
        </p>
      </div>
    ),
  },
  {
    id: "dates",
    header: "Move-in",
    cell: (r) => (
      <span className="whitespace-nowrap">
        {formatDate(r.startDate)}
        {r.endDate ? ` – ${formatDate(r.endDate)}` : ""}
      </span>
    ),
  },
  {
    id: "rent",
    header: "Rent",
    cell: (r) => <span className="tabular-nums">{formatMoney(r.room.monthlyRent)}/mo</span>,
  },
  {
    id: "sent",
    header: "Sent",
    cell: (r) => <span className="text-muted-foreground">{formatRelative(r.createdAt)}</span>,
    hideOnMobile: true,
  },
  { id: "status", header: "Status", cell: (r) => <StatusBadge kind="request" status={r.status} /> },
]

export function TenantRequests() {
  const requests = useMyRentalRequests()
  const cancel = useCancelRentalRequest()
  const [filter, setFilter] = useState<Filter>("all")
  const [confirming, setConfirming] = useState<RentalRequest | null>(null)

  if (requests.isError) {
    return <ErrorState error={requests.error} onRetry={() => void requests.refetch()} />
  }
  if (!requests.data) return <DataTableSkeleton columns={5} />

  if (requests.data.length === 0) {
    return (
      <EmptyState
        icon={ClipboardListIcon}
        title="You haven't requested a room yet"
        description="Browse published homes and send a request for a room that fits. You'll see the landlord's answer here."
        action={
          <Button asChild>
            <Link href="/properties">Browse homes</Link>
          </Button>
        }
      />
    )
  }

  const count = (f: Filter) => requests.data.filter(matches[f]).length
  const rows = requests.data.filter(matches[filter])

  return (
    <div className="space-y-4">
      <StatusTabs
        label="Filter requests by status"
        value={filter}
        onValueChange={setFilter}
        tabs={[
          { value: "all", label: "All", count: count("all") },
          { value: "PENDING", label: "Pending", count: count("PENDING") },
          { value: "APPROVED", label: "Approved", count: count("APPROVED") },
          { value: "closed", label: "Declined or cancelled", count: count("closed") },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState title="Nothing here" description="No requests match this filter." />
      ) : (
        <DataTable
          caption="Your rental requests"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          actions={(r) => {
            if (r.status === "PENDING") {
              return (
                <Button variant="outline" size="sm" onClick={() => setConfirming(r)}>
                  Cancel request
                </Button>
              )
            }
            if (r.status === "APPROVED" && r.booking) {
              return (
                <Button
                  size="sm"
                  variant={r.booking.status === "PENDING_PAYMENT" ? "default" : "outline"}
                  asChild
                >
                  <Link href={`/dashboard/bookings/${r.booking.id}`}>
                    {r.booking.status === "PENDING_PAYMENT" ? "Pay to confirm" : "View booking"}
                  </Link>
                </Button>
              )
            }
            return null
          }}
        />
      )}

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Cancel this request?"
        description={
          confirming
            ? `The landlord of ${confirming.property.title} will no longer see your request for ${confirming.room.name}. You can send a new one later if the room is still free.`
            : undefined
        }
        confirmLabel="Cancel request"
        cancelLabel="Keep request"
        destructive
        onConfirm={() => {
          if (!confirming) return
          cancel.mutate(confirming.id)
          setConfirming(null)
        }}
      />
    </div>
  )
}
