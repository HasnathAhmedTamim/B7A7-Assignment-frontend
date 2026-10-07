"use client"

import {
  ArrowRightIcon,
  CalendarCheckIcon,
  ClipboardListIcon,
  CreditCardIcon,
  HourglassIcon,
  SearchIcon,
} from "lucide-react"
import Link from "next/link"

import { PayButton } from "@/components/payments/pay-button"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard, StatCardSkeleton, StatGrid } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { useBookings, useMyPayments, useMyRentalRequests } from "@/hooks/use-rentals"
import { formatDate, formatMoney, formatRelative, toNumber } from "@/lib/format"

export function TenantOverview() {
  const { user } = useAuth()
  const requests = useMyRentalRequests()
  const bookings = useBookings()
  const payments = useMyPayments()

  const firstName = user?.name.split(" ")[0]
  const header = (
    <PageHeader
      title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      description="Here's where your rentals stand."
      actions={
        <Button asChild>
          <Link href="/properties">
            <SearchIcon data-icon="inline-start" />
            Find a home
          </Link>
        </Button>
      }
    />
  )

  const failed = [requests, bookings, payments].find((query) => query.isError)
  if (failed) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          error={failed.error}
          title="We couldn't load your dashboard"
          onRetry={() => {
            void requests.refetch()
            void bookings.refetch()
            void payments.refetch()
          }}
        />
      </div>
    )
  }

  if (!requests.data || !bookings.data || !payments.data) {
    return (
      <div className="space-y-6">
        {header}
        <StatGrid>
          {Array.from({ length: 4 }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </StatGrid>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const pendingRequests = requests.data.filter((r) => r.status === "PENDING")
  const awaitingPayment = bookings.data.filter((b) => b.status === "PENDING_PAYMENT")
  const activeBookings = bookings.data.filter((b) => b.status === "CONFIRMED")
  const totalPaid = payments.data
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + toNumber(p.amount), 0)

  return (
    <div className="space-y-6">
      {header}

      <StatGrid>
        <StatCard
          label="Pending requests"
          value={pendingRequests.length}
          hint="Waiting for a landlord's reply"
          icon={HourglassIcon}
        />
        <StatCard
          label="Awaiting payment"
          value={awaitingPayment.length}
          hint="Approved, pay to confirm"
          icon={CreditCardIcon}
        />
        <StatCard
          label="Active bookings"
          value={activeBookings.length}
          hint="Paid and confirmed"
          icon={CalendarCheckIcon}
        />
        <StatCard label="Total paid" value={formatMoney(totalPaid)} hint="Across all bookings" />
      </StatGrid>

      {awaitingPayment.length > 0 ? (
        <Card className="border-warning/40">
          <CardHeader>
            <CardTitle>Needs your attention</CardTitle>
            <CardDescription>
              Your request was approved. Pay the first month to confirm the booking. Until then the
              landlord can still cancel it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y rounded-lg border">
              {awaitingPayment.map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{booking.property.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.room.name} · Move in {formatDate(booking.startDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/bookings/${booking.id}`}>Details</Link>
                    </Button>
                    <PayButton bookingId={booking.id} amount={booking.rentAmount} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent requests</CardTitle>
          {requests.data.length > 0 ? (
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/requests">
                  View all
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          {requests.data.length === 0 ? (
            <EmptyState
              icon={ClipboardListIcon}
              title="No requests yet"
              description="Find a home you like and request a room. The landlord's reply shows up here."
              action={
                <Button asChild>
                  <Link href="/properties">Browse homes</Link>
                </Button>
              }
              className="border-dashed bg-transparent"
            />
          ) : (
            <ul className="divide-y">
              {requests.data.slice(0, 5).map((request) => (
                <li key={request.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/properties/${request.property.id}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {request.property.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {request.room.name} · Requested {formatRelative(request.createdAt)}
                    </p>
                  </div>
                  <StatusBadge kind="request" status={request.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
