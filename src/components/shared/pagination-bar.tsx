"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PaginationMeta } from "@/types/api"

type Props = {
  meta: PaginationMeta
  className?: string
} & (
  | { link: { pathname: string; query: Record<string, string> }; onPageChange?: never }
  | { onPageChange: (page: number) => void; link?: never }
)

function hrefFor(link: { pathname: string; query: Record<string, string> }, page: number) {
  const params = new URLSearchParams(link.query)
  if (page > 1) params.set("page", String(page))
  else params.delete("page")
  const qs = params.toString()
  return qs ? `${link.pathname}?${qs}` : link.pathname
}

function pageWindow(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: Array<number | "gap"> = []
  sorted.forEach((page, index) => {
    const prev = sorted[index - 1]
    if (prev !== undefined && page - prev > 1) result.push("gap")
    result.push(page)
  })
  return result
}

export function PaginationBar({ meta, className, link, onPageChange }: Props) {
  const { page, totalPages, total, limit } = meta
  if (totalPages <= 1) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  const control = (
    target: number,
    children: React.ReactNode,
    props: { label: string; active?: boolean },
  ) => {
    const disabled = target < 1 || target > totalPages
    const common = {
      variant: props.active ? ("outline" as const) : ("ghost" as const),
      size: typeof children === "number" ? ("icon" as const) : ("default" as const),
      "aria-label": props.label,
      "aria-current": props.active ? ("page" as const) : undefined,
    }
    if (disabled) {
      return (
        <Button {...common} disabled>
          {children}
        </Button>
      )
    }
    if (link) {
      return (
        <Button {...common} asChild>
          <Link href={hrefFor(link, target)}>{children}</Link>
        </Button>
      )
    }
    return (
      <Button {...common} onClick={() => onPageChange?.(target)}>
        {children}
      </Button>
    )
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-3 text-sm sm:flex-row",
        className,
      )}
    >
      <p className="text-muted-foreground tabular-nums">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        {control(
          page - 1,
          <>
            <ChevronLeftIcon data-icon="inline-start" />
            <span className="hidden sm:inline">Previous</span>
          </>,
          { label: "Previous page" },
        )}
        <span className="hidden items-center gap-1 sm:flex">
          {pageWindow(page, totalPages).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <span key={item}>
                {control(item, item, { label: `Page ${item}`, active: item === page })}
              </span>
            ),
          )}
        </span>
        <span className="px-2 text-muted-foreground tabular-nums sm:hidden">
          {page} / {totalPages}
        </span>
        {control(
          page + 1,
          <>
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon data-icon="inline-end" />
          </>,
          { label: "Next page" },
        )}
      </div>
    </nav>
  )
}
