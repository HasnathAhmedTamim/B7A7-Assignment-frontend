"use client"

import { CircleCheckIcon, CircleSlashIcon, CircleXIcon } from "lucide-react"
import Link from "next/link"

import { PayButton } from "@/components/payments/pay-button"
import {
  bookingHref,
  PaymentResultCard,
  PaymentResultSkeleton,
  PaymentSummary,
} from "@/components/payments/payment-result"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { usePayment, usePendingPayment } from "@/hooks/use-payments"
import type { Role } from "@/types/models"

const bookingsHref = (viewer: Role) =>
  viewer === "ADMIN" ? "/admin/bookings" : "/dashboard/bookings"

/** Where the gateway sends the tenant after they back out of checkout or it fails (bKash). */
export function PaymentCancelled({ paymentId, outcome }: { paymentId?: string; outcome?: string }) {
  const { user } = useAuth()
  const viewer: Role = user?.role ?? "TENANT"
  const pending = usePendingPayment()
  const id = paymentId ?? pending?.paymentId
  const payment = usePayment(id)
  const failed = outcome === "failure"

  const title = failed ? "Payment didn't go through" : "Checkout cancelled"
  const notCharged = failed
    ? "The payment couldn't be completed, so you haven't been charged."
    : "You left checkout before paying, so you haven't been charged."

  if (!paymentId && pending === undefined) return <PaymentResultSkeleton />
  if (id && payment.isPending && !payment.isError) return <PaymentResultSkeleton />

  if (!payment.data) {
    return (
      <PaymentResultCard
        tone="neutral"
        icon={failed ? CircleXIcon : CircleSlashIcon}
        title={title}
        description={notCharged}
        actions={
          <Button asChild>
            <Link href={bookingsHref(viewer)}>View bookings</Link>
          </Button>
        }
      />
    )
  }

  const p = payment.data
  const booking = p.booking
  const viewBooking = (
    <Button variant="outline" asChild>
      <Link href={bookingHref(viewer, booking.id)}>View booking</Link>
    </Button>
  )

  if (booking.status === "CONFIRMED") {
    return (
      <PaymentResultCard
        tone="success"
        icon={CircleCheckIcon}
        title="This booking is already paid"
        description="Another checkout for this booking went through, so there's nothing left to pay."
        actions={
          <Button asChild>
            <Link href={bookingHref(viewer, booking.id)}>View booking</Link>
          </Button>
        }
      />
    )
  }

  if (booking.status !== "PENDING_PAYMENT") {
    return (
      <PaymentResultCard
        tone="neutral"
        icon={CircleSlashIcon}
        title={title}
        description={`${notCharged} This booking has since been cancelled, so it can't be paid anymore.`}
        actions={viewBooking}
      />
    )
  }

  return (
    <PaymentResultCard
      tone={failed ? "danger" : "neutral"}
      icon={failed ? CircleXIcon : CircleSlashIcon}
      title={title}
      description={`${notCharged} Your booking is still waiting for payment whenever you're ready.`}
      actions={
        <>
          {viewBooking}
          <PayButton bookingId={booking.id} amount={booking.rentAmount} />
        </>
      }
    >
      <PaymentSummary payment={p} />
    </PaymentResultCard>
  )
}
