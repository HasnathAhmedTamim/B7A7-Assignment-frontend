"use client"

import { skipToken, useQuery } from "@tanstack/react-query"
import { useState, useSyncExternalStore } from "react"

import { useAuth } from "@/hooks/use-auth"
import { useMyPayments } from "@/hooks/use-rentals"
import { paymentsApi } from "@/lib/api/resources"
import {
  parsePendingPayment,
  pendingPaymentSnapshot,
  type PendingPayment,
} from "@/lib/payments/pending-payment"
import { queryKeys } from "@/lib/query-keys"

const POLL_INTERVAL_MS = 2000

const subscribeToNothing = () => () => {}

/**
 * The checkout this tab started, captured once after hydration so clearing storage later
 * doesn't lose it. `undefined` until the browser value is known.
 */
export function usePendingPayment() {
  const raw = useSyncExternalStore(subscribeToNothing, pendingPaymentSnapshot, () => undefined)
  const [captured, setCaptured] = useState<PendingPayment | null>()
  if (raw !== undefined && captured === undefined) setCaptured(parsePendingPayment(raw))
  return captured
}

export type ReturnedPayment =
  { state: "resolving" } | { state: "missing" } | { state: "found"; paymentId: string }

/**
 * Works out which payment a gateway redirect refers to: an explicit `paymentId` (bKash),
 * the Stripe `session_id` matched against the tenant's payments, or the checkout this tab started.
 */
export function useReturnedPayment({
  paymentId,
  sessionId,
}: {
  paymentId?: string
  sessionId?: string
}): ReturnedPayment {
  const pending = usePendingPayment()
  const lookup = useMyPayments({ enabled: !paymentId && Boolean(sessionId) })

  if (paymentId) return { state: "found", paymentId }
  if (pending === undefined) return { state: "resolving" }

  if (sessionId) {
    const match = lookup.data?.find((payment) => payment.gatewayPaymentId === sessionId)
    if (match) return { state: "found", paymentId: match.id }
    if (!lookup.data && !lookup.isError) return { state: "resolving" }
  }

  return pending ? { state: "found", paymentId: pending.paymentId } : { state: "missing" }
}

/** A single payment; with `poll` it refetches every few seconds while the payment is pending. */
export function usePayment(paymentId: string | undefined, { poll = false } = {}) {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.payments.detail(paymentId ?? ""),
    queryFn: paymentId && isReady ? () => paymentsApi.get(paymentId) : skipToken,
    refetchInterval: (query) =>
      poll && query.state.data?.status === "PENDING" ? POLL_INTERVAL_MS : false,
  })
}
