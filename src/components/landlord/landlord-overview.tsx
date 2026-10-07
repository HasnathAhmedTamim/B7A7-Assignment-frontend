"use client"

import {
  ArrowRightIcon,
  BuildingIcon,
  HourglassIcon,
  InboxIcon,
  PlusIcon,
  WalletIcon,
} from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard, StatCardSkeleton, StatGrid } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useMyProperties } from "@/hooks/use-landlord"
import { useBookings, useReceivedRentalRequests } from "@/hooks/use-rentals"
import { paidPayments, sumAmounts } from "@/lib/earnings"
import { formatDate, formatMoney, formatRelative } from "@/lib/format"

export function LandlordOverview() {
  const { user } = useAuth()
  const all = useMyProperties({ limit: 1 })
  const published = useMyProperties({ limit: 1, status: "PUBLISHED" })
  const requests = useReceivedRentalRequests()
  const bookings = useBookings()

  const header = (
    <PageHeader
      title={user ? `Hello, ${user.name.split(" ")[0]}` : "Overview"}
      description="Your homes, requests and payments at a glance."
      actions={
        <Button asChild>
          <Link href="/landlord/properties/new">
            <PlusIcon data-icon="inline-start" />
            Add property
          </Link>
        </Button>
      }
    />
  )

  const queries = [all, published, requests, bookings]
  const failed = queries.find((q) => q.isError)
  if (failed) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          error={failed.error}
          title="We couldn't load your overview"
          onRetry={() => queries.forEach((q) => void q.refetch())}
        />
      </div>
    )
  }

  if (!all.data || !published.data || !requests.data || !bookings.data) {
    return (
      <div className="space-y-6">
        {header}
        <StatGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </StatGrid>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  const pending = requests.data.filter((r) => r.status === "PENDING")
  const awaiting = bookings.data.filter((b) => b.status === "PENDING_PAYMENT")
  const collected = sumAmounts(paidPayments(bookings.data))

  if (all.data.meta.total === 0) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon={BuildingIcon}
          title="Let's list your first home"
          description="Add the property and its rooms, then publish it. Requests from renters will appear here."
          action={
            <Button asChild>
              <Link href="/landlord/properties/new">
                <PlusIcon data-icon="inline-start" />
                Add property
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {header}
      <StatGrid>
        <StatCard
          label="Properties"
          value={all.data.meta.total}
          hint={`${published.data.meta.total} published`}
          icon={BuildingIcon}
        />
        <StatCard
          label="Requests to review"
          value={pending.length}
          hint="Waiting for your decision"
          icon={InboxIcon}
        />
        <StatCard
          label="Awaiting payment"
          value={awaiting.length}
          hint="Approved, tenant hasn't paid"
          icon={HourglassIcon}
        />
        <StatCard
          label="Collected"
          value={formatMoney(collected)}
          hint="All successful payments"
          icon={WalletIcon}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requests to review</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/landlord/requests">
                  All requests
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                You&apos;re all caught up. New requests will show up here.
              </p>
            ) : (
              <ul className="divide-y">
                {pending.slice(0, 5).map((request) => (
                  <li key={request.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{request.tenant.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {request.room.name}, {request.property.title} · from{" "}
                        {formatDate(request.startDate)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelative(request.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent bookings</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/landlord/bookings">
                  All bookings
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {bookings.data.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Approved requests become bookings.
              </p>
            ) : (
              <ul className="divide-y">
                {bookings.data.slice(0, 5).map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/landlord/bookings/${booking.id}`}
                        className="block truncate font-medium hover:underline"
                      >
                        {booking.tenant.name}
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">
                        {booking.room.name}, {booking.property.title}
                      </p>
                    </div>
                    <StatusBadge kind="booking" status={booking.status} />
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
