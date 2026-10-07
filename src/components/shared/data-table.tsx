import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type Column<T> = {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  /** Leave the column out of the stacked mobile card. */
  hideOnMobile?: boolean
}

/**
 * A table on desktop that collapses into stacked cards on small screens.
 * The first column becomes the card title; `actions` render in both layouts.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  actions,
  caption,
  className,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  actions?: (row: T) => ReactNode
  caption?: string
  className?: string
}) {
  const [primary, ...rest] = columns

  return (
    <div className={className}>
      <Card className="hidden py-0 md:flex">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((column) => (
                <TableHead key={column.id} className={cn("h-10 px-4", column.className)}>
                  {column.header}
                </TableHead>
              ))}
              {actions ? (
                <TableHead className="h-10 px-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={cn("px-4 py-3", column.className)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
                {actions ? (
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">{actions(row)}</div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ul className="flex flex-col gap-3 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={getRowId(row)}>
            <Card size="sm" className="gap-3 px-4">
              {primary ? <div className="min-w-0 font-medium">{primary.cell(row)}</div> : null}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {rest
                  .filter((column) => !column.hideOnMobile)
                  .map((column) => (
                    <div key={column.id} className="min-w-0">
                      <dt className="text-xs text-muted-foreground">{column.header}</dt>
                      <dd className="mt-0.5 min-w-0 break-words">{column.cell(row)}</dd>
                    </div>
                  ))}
              </dl>
              {actions ? (
                <div className="flex flex-wrap gap-2 border-t pt-3">{actions(row)}</div>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DataTableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Card className="hidden gap-0 py-0 md:flex">
        <div className="flex gap-4 border-b bg-muted/40 px-4 py-3">
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-4 border-b px-4 py-4 last:border-0">
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton key={c} className={cn("h-4 flex-1", c === 0 && "flex-[1.5]")} />
            ))}
          </div>
        ))}
      </Card>
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: Math.min(rows, 3) }, (_, i) => (
          <Card key={i} size="sm" className="gap-3 px-4">
            <Skeleton className="h-5 w-2/3" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
