"use client"

import { ArrowRightIcon, BuildingIcon, CalendarCheckIcon, InboxIcon, UsersIcon } from "lucide-react"
import Link from "next/link"

import { LazyBarChart } from "@/components/charts/lazy-bar-chart"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard, StatCardSkeleton, StatGrid } from "@/components/shared/stat-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminStats, useAuditLogs } from "@/hooks/use-admin"
import { useBookings } from "@/hooks/use-rentals"
import { auditActionLabel } from "@/lib/audit"
import { monthlyTotals, paidPayments, sumAmounts } from "@/lib/earnings"
import { formatCompactMoney, formatMoney, formatRelative, pluralize } from "@/lib/format"

const header = (
  <PageHeader
    title="Platform overview"
    description="Users, listings and money moving through NestQuarter."
  />
)

export function AdminOverview() {
  const stats = useAdminStats()
  const bookings = useBookings()
  const activity = useAuditLogs({ page: 1, limit: 6 })

  const queries = [stats, bookings, activity]
  const failed = queries.find((q) => q.isError)
  if (failed) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          error={failed.error}
          title="We couldn't load the overview"
          onRetry={() => queries.forEach((q) => void q.refetch())}
        />
      </div>
    )
  }

  if (!stats.data || !bookings.data || !activity.data) {
    return (
      <div className="space-y-6">
        {header}
        <StatGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </StatGrid>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const s = stats.data
  const paid = paidPayments(bookings.data)
  const admins = Math.max(s.totalUsers - s.totalLandlords - s.totalTenants, 0)
  const unavailableRooms = s.totalRooms - s.availableRooms
  const awaitingPayment = bookings.data.filter((b) => b.status === "PENDING_PAYMENT").length

  return (
    <div className="space-y-6">
      {header}
      <StatGrid>
        <StatCard
          label="Users"
          value={s.totalUsers}
          hint={`${pluralize(s.totalLandlords, "landlord")} · ${pluralize(s.totalTenants, "tenant")}`}
          icon={UsersIcon}
        />
        <StatCard
          label="Properties"
          value={s.totalProperties}
          hint={`${pluralize(s.totalRooms, "room")}, ${s.availableRooms} open`}
          icon={BuildingIcon}
        />
        <StatCard
          label="Pending requests"
          value={s.pendingRequests}
          hint="Waiting for a landlord"
          icon={InboxIcon}
        />
        <StatCard
          label="Confirmed bookings"
          value={s.confirmedBookings}
          hint={`${pluralize(awaitingPayment, "booking")} awaiting payment`}
          icon={CalendarCheckIcon}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rent collected</CardTitle>
            <CardDescription>
              {formatMoney(sumAmounts(paid))} across{" "}
              {pluralize(s.paidPayments, "successful payment")}. Last 6 months.
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/payments">
                  Payments
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <LazyBarChart
              data={monthlyTotals(paid)}
              seriesLabel="Collected"
              formatValue={formatCompactMoney}
              className="aspect-auto h-64 w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users by role</CardTitle>
            <CardDescription>Includes blocked accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <LazyBarChart
              data={[
                { label: "Tenants", value: s.totalTenants },
                { label: "Landlords", value: s.totalLandlords },
                { label: "Admins", value: admins },
              ]}
              seriesLabel="Users"
              color="var(--chart-2)"
              className="aspect-auto h-64 w-full"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Room occupancy</CardTitle>
            <CardDescription>
              Rooms are unavailable while booked or when a landlord closes them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Unavailable</span>
                <span className="font-medium tabular-nums">
                  {unavailableRooms} of {s.totalRooms}
                </span>
              </div>
              <Progress
                value={s.totalRooms ? (unavailableRooms / s.totalRooms) * 100 : 0}
                aria-label="Share of rooms unavailable"
              />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/60 p-3">
                <dt className="text-muted-foreground">Open for requests</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{s.availableRooms}</dd>
              </div>
              <div className="rounded-lg bg-muted/60 p-3">
                <dt className="text-muted-foreground">Awaiting payment</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{awaitingPayment}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/audit-logs">
                  Audit log
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {activity.data.data.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="divide-y">
                {activity.data.data.map((log) => (
                  <li key={log.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{auditActionLabel(log.action)}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {log.user?.name ?? "System"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelative(log.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
