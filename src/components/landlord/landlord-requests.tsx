"use client"

import { InboxIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusTabs } from "@/components/shared/status-tabs"
import { Button } from "@/components/ui/button"
import { useDecideRentalRequest } from "@/hooks/use-landlord"
import { useReceivedRentalRequests } from "@/hooks/use-rentals"
import { enumParam, useUrlParams } from "@/hooks/use-url-params"
import { formatDate, formatMoney, formatRelative } from "@/lib/format"
import type { RentalRequest } from "@/types/models"

const FILTERS = ["PENDING", "APPROVED", "closed", "all"] as const
type Filter = (typeof FILTERS)[number]

const matches: Record<Filter, (r: RentalRequest) => boolean> = {
  PENDING: (r) => r.status === "PENDING",
  APPROVED: (r) => r.status === "APPROVED",
  closed: (r) => r.status === "REJECTED" || r.status === "CANCELLED",
  all: () => true,
}

const columns: Column<RentalRequest>[] = [
  {
    id: "tenant",
    header: "Tenant",
    cell: (r) => (
      <div className="min-w-0">
        <p className="font-medium">{r.tenant.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          <a href={`mailto:${r.tenant.email}`} className="hover:underline">
            {r.tenant.email}
          </a>
          {r.tenant.phone ? ` · ${r.tenant.phone}` : ""}
        </p>
      </div>
    ),
  },
  {
    id: "home",
    header: "Room",
    cell: (r) => (
      <div className="min-w-0">
        <Link href={`/landlord/properties/${r.property.id}`} className="hover:underline">
          {r.property.title}
        </Link>
        <p className="text-sm text-muted-foreground">
          {r.room.name} · {formatMoney(r.room.monthlyRent)}/mo
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
    id: "message",
    header: "Message",
    cell: (r) =>
      r.message ? (
        <p className="line-clamp-2 max-w-64 text-sm text-muted-foreground" title={r.message}>
          {r.message}
        </p>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
    hideOnMobile: true,
  },
  {
    id: "received",
    header: "Received",
    cell: (r) => <span className="text-muted-foreground">{formatRelative(r.createdAt)}</span>,
    hideOnMobile: true,
  },
  { id: "status", header: "Status", cell: (r) => <StatusBadge kind="request" status={r.status} /> },
]

type Pending = { request: RentalRequest; decision: "approve" | "reject" }

export function LandlordRequests() {
  const requests = useReceivedRentalRequests()
  const decide = useDecideRentalRequest()
  const { params, set } = useUrlParams()
  const filter = enumParam(params.get("status"), FILTERS) ?? "PENDING"
  const [confirming, setConfirming] = useState<Pending | null>(null)

  if (requests.isError) {
    return <ErrorState error={requests.error} onRetry={() => void requests.refetch()} />
  }
  if (!requests.data) return <DataTableSkeleton columns={6} />

  if (requests.data.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="No requests yet"
        description="When renters request a room in one of your published homes, it shows up here."
        action={
          <Button variant="outline" asChild>
            <Link href="/landlord/properties">Manage properties</Link>
          </Button>
        }
      />
    )
  }

  const count = (f: Filter) => requests.data.filter(matches[f]).length
  const rows = requests.data.filter(matches[filter])
  const target = confirming?.request

  return (
    <div className="space-y-4">
      <StatusTabs
        label="Filter requests by status"
        value={filter}
        onValueChange={(value) => set({ status: value === "PENDING" ? null : value })}
        tabs={[
          { value: "PENDING", label: "Needs review", count: count("PENDING") },
          { value: "APPROVED", label: "Approved", count: count("APPROVED") },
          { value: "closed", label: "Declined or cancelled", count: count("closed") },
          { value: "all", label: "All", count: count("all") },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState
          title={filter === "PENDING" ? "You're all caught up" : "Nothing here"}
          description={
            filter === "PENDING"
              ? "There are no requests waiting for your decision."
              : "No requests match this filter."
          }
        />
      ) : (
        <DataTable
          caption="Rental requests for your properties"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          actions={(r) => {
            if (r.status === "PENDING") {
              return (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirming({ request: r, decision: "reject" })}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    disabled={!r.room.available}
                    title={r.room.available ? undefined : "This room is already reserved"}
                    onClick={() => setConfirming({ request: r, decision: "approve" })}
                  >
                    Approve
                  </Button>
                </>
              )
            }
            if (r.status === "APPROVED" && r.booking) {
              return (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/landlord/bookings/${r.booking.id}`}>View booking</Link>
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
        title={
          confirming?.decision === "approve"
            ? `Approve ${target?.tenant.name ?? "this tenant"}?`
            : `Decline ${target?.tenant.name ?? "this tenant"}'s request?`
        }
        description={
          target
            ? confirming?.decision === "approve"
              ? `${target.room.name} at ${target.property.title} will be reserved and a booking is created at ${formatMoney(target.room.monthlyRent)}/month. The tenant confirms it by paying the first month. Other pending requests for this room stay open, so decline them separately.`
              : `${target.tenant.name} will see that the request was declined. The room stays open to others.`
            : undefined
        }
        confirmLabel={
          confirming?.decision === "approve" ? "Approve and reserve" : "Decline request"
        }
        destructive={confirming?.decision === "reject"}
        onConfirm={() => {
          if (!confirming) return
          decide.mutate(confirming)
          setConfirming(null)
        }}
      >
        {target?.message ? (
          <blockquote className="rounded-md border-l-2 bg-muted/50 px-3 py-2 text-sm whitespace-pre-line text-muted-foreground">
            {target.message}
          </blockquote>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}
