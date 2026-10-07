"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  RotateCcwIcon,
  SearchXIcon,
  Undo2Icon,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"

import { PayButton } from "@/components/payments/pay-button"
import {
  bookingHref,
  PaymentResultCard,
  PaymentSummary,
  paymentsHref,
} from "@/components/payments/payment-result"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/use-auth"
import { usePayment, useReturnedPayment } from "@/hooks/use-payments"
import { isApiError } from "@/lib/api/errors"
import { clearPendingPayment, readPendingPayment } from "@/lib/payments/pending-payment"
import { queryKeys } from "@/lib/query-keys"
import type { PaymentWithBooking, Role } from "@/types/models"

/** How long to wait for the gateway webhook before telling the tenant it's taking a while. */
const CONFIRMATION_TIMEOUT_MS = 60_000

export function PaymentConfirmation({
  paymentId,
  sessionId,
}: {
  paymentId?: string
  sessionId?: string
}) {
  const { user } = useAuth()
  const viewer: Role = user?.role ?? "TENANT"
  const queryClient = useQueryClient()
  const returned = useReturnedPayment({ paymentId, sessionId })
  const [timedOut, setTimedOut] = useState(false)
  const payment = usePayment(returned.state === "found" ? returned.paymentId : undefined, {
    poll: !timedOut,
  })
  const status = payment.data?.status

  useEffect(() => {
    if (status !== "PENDING" || timedOut) return
    const timer = setTimeout(() => setTimedOut(true), CONFIRMATION_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [status, timedOut])

  const settledId = status && status !== "PENDING" ? payment.data?.id : undefined
  useEffect(() => {
    if (!settledId) return
    if (readPendingPayment()?.paymentId === settledId) clearPendingPayment()
    void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.payments.mine })
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.all })
  }, [settledId, queryClient])

  if (returned.state === "missing") {
    return (
      <PaymentResultCard
        tone="neutral"
        icon={SearchXIcon}
        title="No checkout to confirm"
        description="We couldn't tell which payment this page is for. If you just paid, your booking updates on its own once the payment is confirmed."
        actions={
          <Button asChild>
            <Link href={paymentsHref(viewer)}>View payments</Link>
          </Button>
        }
      />
    )
  }

  if (payment.isError && !payment.data) {
    const missing =
      isApiError(payment.error) && (payment.error.isNotFound || payment.error.isForbidden)
    return missing ? (
      <PaymentResultCard
        tone="neutral"
        icon={SearchXIcon}
        title="Payment not found"
        description="This payment doesn't exist or belongs to another account."
        actions={
          <Button asChild>
            <Link href={paymentsHref(viewer)}>View payments</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState
        title="We couldn't check your payment"
        error={payment.error}
        onRetry={() => void payment.refetch()}
      />
    )
  }

  if (!payment.data) return <ConfirmingCard />

  const p = payment.data
  const bookingLink = (
    <Button variant="outline" asChild>
      <Link href={bookingHref(viewer, p.bookingId)}>View booking</Link>
    </Button>
  )

  if (p.status === "PENDING") {
    if (!timedOut) return <ConfirmingCard payment={p} />
    return (
      <PaymentResultCard
        tone="neutral"
        icon={ClockIcon}
        title="Still waiting for confirmation"
        description="The payment provider hasn't confirmed this payment yet. If you completed checkout, your booking updates automatically once it does, so there's no need to pay again."
        actions={
          <>
            {bookingLink}
            <Button
              onClick={() => {
                setTimedOut(false)
                void payment.refetch()
              }}
            >
              <RotateCcwIcon data-icon="inline-start" />
              Check again
            </Button>
          </>
        }
      >
        <PaymentSummary payment={p} />
      </PaymentResultCard>
    )
  }

  if (p.status === "PAID") {
    if (p.booking.status === "CANCELLED") {
      return (
        <PaymentResultCard
          tone="danger"
          icon={CircleAlertIcon}
          title="Payment received for a cancelled booking"
          description="The booking was cancelled before this payment arrived, so it couldn't be confirmed. It has been flagged for a refund; contact us if you have questions."
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact support</Link>
              </Button>
              <Button asChild>
                <Link href={paymentsHref(viewer)}>View payments</Link>
              </Button>
            </>
          }
        >
          <PaymentSummary payment={p} />
        </PaymentResultCard>
      )
    }
    return (
      <PaymentResultCard
        tone="success"
        icon={CircleCheckIcon}
        title="Payment confirmed"
        description={`Your booking for ${p.booking.room.name} at ${p.booking.property.title} is confirmed.`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={paymentsHref(viewer)}>View payments</Link>
            </Button>
            <Button asChild>
              <Link href={bookingHref(viewer, p.bookingId)}>View booking</Link>
            </Button>
          </>
        }
      >
        <PaymentSummary payment={p} />
      </PaymentResultCard>
    )
  }

  if (p.status === "REFUNDED") {
    return (
      <PaymentResultCard
        tone="neutral"
        icon={Undo2Icon}
        title="This payment was refunded"
        description="The money has been returned to the original payment method."
        actions={bookingLink}
      >
        <PaymentSummary payment={p} />
      </PaymentResultCard>
    )
  }

  return <UnsuccessfulPayment payment={p} viewer={viewer} bookingLink={bookingLink} />
}

function ConfirmingCard({ payment }: { payment?: PaymentWithBooking }) {
  return (
    <PaymentResultCard
      tone="pending"
      icon={Spinner}
      title="Confirming your payment…"
      description="We're waiting for the payment provider to confirm. This usually takes a few seconds, so please keep this page open."
    >
      {payment ? <PaymentSummary payment={payment} /> : null}
    </PaymentResultCard>
  )
}

function UnsuccessfulPayment({
  payment,
  viewer,
  bookingLink,
}: {
  payment: PaymentWithBooking
  viewer: Role
  bookingLink: ReactNode
}) {
  const booking = payment.booking
  const failed = payment.status === "FAILED"

  if (booking.status === "CONFIRMED") {
    return (
      <PaymentResultCard
        tone="success"
        icon={CircleCheckIcon}
        title="This booking is already paid"
        description="This checkout didn't go through, but another payment for the same booking did. You haven't been charged twice."
        actions={
          <Button asChild>
            <Link href={bookingHref(viewer, booking.id)}>View booking</Link>
          </Button>
        }
      />
    )
  }

  const canRetry = booking.status === "PENDING_PAYMENT"
  return (
    <PaymentResultCard
      tone="danger"
      icon={CircleXIcon}
      title={failed ? "Payment didn't go through" : "This checkout was closed"}
      description={
        failed
          ? "The payment was declined or couldn't be completed, so you haven't been charged."
          : "It expired or was replaced by a newer checkout before payment, so you haven't been charged for it."
      }
      actions={
        <>
          {bookingLink}
          {canRetry ? <PayButton bookingId={booking.id} amount={booking.rentAmount} /> : null}
        </>
      }
    >
      <PaymentSummary payment={payment} />
    </PaymentResultCard>
  )
}
