"use client"

import { ChevronLeftIcon, CircleCheckIcon, InfoIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { PayButton } from "@/components/payments/pay-button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DetailList } from "@/components/shared/detail-list"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBooking, useCancelBooking } from "@/hooks/use-rentals"
import { isApiError } from "@/lib/api/errors"
import { formatDate, formatDateTime, formatMoney, shortId } from "@/lib/format"
import { gatewayLabel } from "@/lib/labels"
import type { Booking, Role } from "@/types/models"

const backHref: Record<Role, string> = {
  TENANT: "/dashboard/bookings",
  LANDLORD: "/landlord/bookings",
  ADMIN: "/admin/bookings",
}

export function BookingDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading booking">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )
}

function cancelCopy(booking: Booking, viewer: Role) {
  const confirmed = booking.status === "CONFIRMED"
  if (viewer === "TENANT") {
    return confirmed
      ? "This booking is paid. Cancelling frees the room but doesn't refund you automatically. Contact the landlord or our support team about a refund."
      : "The room will be released to other renters and any unfinished checkout is closed."
  }
  return confirmed
    ? "The tenant has already paid. Cancelling frees the room but doesn't refund them automatically, so arrange the refund directly."
    : "The tenant won't be able to pay for this booking and the room becomes available again."
}

export function BookingDetail({ bookingId, viewer }: { bookingId: string; viewer: Role }) {
  const booking = useBooking(bookingId)
  const cancel = useCancelBooking()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const back = (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link href={backHref[viewer]}>
        <ChevronLeftIcon data-icon="inline-start" />
        All bookings
      </Link>
    </Button>
  )

  if (booking.isError && !booking.data) {
    const missing =
      isApiError(booking.error) && (booking.error.isNotFound || booking.error.isForbidden)
    return (
      <div className="space-y-6">
        {back}
        {missing ? (
          <EmptyState
            title="Booking not found"
            description="It may have been removed, or it belongs to another account."
          />
        ) : (
          <ErrorState error={booking.error} onRetry={() => void booking.refetch()} />
        )}
      </div>
    )
  }
  if (!booking.data) return <BookingDetailSkeleton />

  const b = booking.data
  const cancellable = b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED"
  const paid = b.payments.find((p) => p.status === "PAID")
  const payments = [...b.payments].sort((x, y) => y.createdAt.localeCompare(x.createdAt))

  return (
    <div className="space-y-6">
      {back}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">Booking {shortId(b.id)}</p>
          <h1 className="text-2xl font-semibold">{b.property.title}</h1>
          <p className="text-sm text-muted-foreground">
            {b.room.name} · {b.property.city}
          </p>
        </div>
        <StatusBadge kind="booking" status={b.status} className="self-start" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking details</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailList
                items={[
                  {
                    label: "Home",
                    value: (
                      <Link href={`/properties/${b.property.id}`} className="hover:underline">
                        {b.property.title}
                      </Link>
                    ),
                  },
                  { label: "Room", value: b.room.name },
                  { label: "Move-in", value: formatDate(b.startDate) },
                  { label: "Move-out", value: b.endDate ? formatDate(b.endDate) : "Open-ended" },
                  { label: "Monthly rent", value: formatMoney(b.rentAmount) },
                  { label: "Booked on", value: formatDateTime(b.createdAt) },
                  {
                    label: "Tenant",
                    value: (
                      <>
                        {b.tenant.name}
                        <span className="block text-muted-foreground">{b.tenant.email}</span>
                        {b.tenant.phone ? (
                          <span className="block text-muted-foreground">{b.tenant.phone}</span>
                        ) : null}
                      </>
                    ),
                    hidden: viewer === "TENANT",
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
              <CardDescription>
                Every checkout attempt for this booking, newest first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payment attempts yet.</p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {payments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium tabular-nums">{formatMoney(payment.amount)}</p>
                        <p className="text-muted-foreground">
                          {gatewayLabel[payment.gateway]} · {formatDateTime(payment.createdAt)}
                        </p>
                      </div>
                      <StatusBadge kind="payment" status={payment.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {b.status === "PENDING_PAYMENT" ? (
            <Card className="border-warning/40">
              <CardHeader>
                <CardTitle>
                  {viewer === "TENANT" ? "Pay to confirm" : "Waiting for the tenant's payment"}
                </CardTitle>
                <CardDescription>
                  {viewer === "TENANT"
                    ? "The landlord approved your request. Pay the first month by card to lock in the room."
                    : "The booking confirms automatically once the tenant pays the first month."}
                </CardDescription>
              </CardHeader>
              {viewer === "TENANT" ? (
                <CardContent className="space-y-2">
                  <PayButton bookingId={b.id} amount={b.rentAmount} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll be taken to Stripe&apos;s secure checkout. Test mode: use card 4242
                    4242 4242 4242.
                  </p>
                </CardContent>
              ) : null}
            </Card>
          ) : null}

          {b.status === "CONFIRMED" ? (
            <Alert>
              <CircleCheckIcon className="text-success" />
              <AlertTitle>Booking confirmed</AlertTitle>
              <AlertDescription>
                {paid
                  ? `First month paid ${formatDate(paid.createdAt)} (${formatMoney(paid.amount)}).`
                  : "The first month has been paid."}
              </AlertDescription>
            </Alert>
          ) : null}

          {b.status === "CANCELLED" ? (
            <Alert>
              <InfoIcon />
              <AlertTitle>Booking cancelled</AlertTitle>
              <AlertDescription>
                The room has been released. Any open checkout for it was closed.
              </AlertDescription>
            </Alert>
          ) : null}

          {cancellable ? (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              disabled={cancel.isPending}
            >
              Cancel booking
            </Button>
          ) : null}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel this booking?"
        description={cancelCopy(b, viewer)}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        destructive
        pending={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(b.id, {
            onSettled: () => setConfirmOpen(false),
          })
        }
      />
    </div>
  )
}
