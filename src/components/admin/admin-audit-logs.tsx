"use client"

import { HistoryIcon } from "lucide-react"
import Link from "next/link"

import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { Button } from "@/components/ui/button"
import { useAuditLogs } from "@/hooks/use-admin"
import { pageParam, useUrlParams } from "@/hooks/use-url-params"
import { auditActionLabel, auditDetails } from "@/lib/audit"
import { formatDateTime, formatRelative } from "@/lib/format"
import { roleLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { AuditLog } from "@/types/models"

const PAGE_SIZE = 25

function EntityCell({ log }: { log: AuditLog }) {
  if (!log.entityId) return <span className="text-muted-foreground">{log.entity}</span>
  const shortId = log.entityId.slice(0, 8).toUpperCase()
  if (log.entity === "Booking") {
    return (
      <Link href={`/admin/bookings/${log.entityId}`} className="hover:underline">
        Booking {shortId}
      </Link>
    )
  }
  return (
    <span>
      {log.entity} <span className="font-mono text-xs text-muted-foreground">{shortId}</span>
    </span>
  )
}

const columns: Column<AuditLog>[] = [
  {
    id: "action",
    header: "Event",
    cell: (log) => (
      <div className="min-w-0">
        <p className="font-medium">{auditActionLabel(log.action)}</p>
        <p className="text-sm font-normal text-muted-foreground">
          {log.user ? `${log.user.name} · ${roleLabel[log.user.role]}` : "System"}
        </p>
      </div>
    ),
  },
  { id: "entity", header: "Record", cell: (log) => <EntityCell log={log} /> },
  {
    id: "details",
    header: "Details",
    cell: (log) => {
      const details = auditDetails(log)
      if (details.length === 0) return <span className="text-muted-foreground">—</span>
      return (
        <dl className="flex flex-wrap gap-1.5">
          {details.map(([key, value]) => (
            <div key={key} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
              <dt className="inline text-muted-foreground">{key}: </dt>
              <dd className="inline font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )
    },
    hideOnMobile: true,
  },
  {
    id: "when",
    header: "When",
    cell: (log) => (
      <time
        dateTime={log.createdAt}
        title={formatDateTime(log.createdAt)}
        className="whitespace-nowrap"
      >
        {formatRelative(log.createdAt)}
      </time>
    ),
  },
]

export function AdminAuditLogs() {
  const { params, set, isPending } = useUrlParams()
  const page = pageParam(params.get("page"))
  const logs = useAuditLogs({ page, limit: PAGE_SIZE })
  const data = logs.data

  if (logs.isError && !data) {
    return <ErrorState error={logs.error} onRetry={() => void logs.refetch()} />
  }
  if (!data) return <DataTableSkeleton columns={4} rows={10} />

  if (data.data.length === 0) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title={page > 1 ? "This page is empty" : "No activity yet"}
        description={
          page > 1 ? undefined : "Sign-ins, listing changes and payments are recorded here."
        }
        action={
          page > 1 ? (
            <Button variant="outline" onClick={() => set({ page: null })}>
              Go to the latest activity
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div
      className={cn(
        "space-y-4 transition-opacity",
        (isPending || logs.isPlaceholderData) && "opacity-60",
      )}
    >
      <DataTable
        caption="Audit log"
        columns={columns}
        rows={data.data}
        getRowId={(log) => log.id}
      />
      <PaginationBar
        meta={data.meta}
        onPageChange={(next) => set({ page: next > 1 ? next : null })}
      />
    </div>
  )
}
