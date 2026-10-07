const STORAGE_KEY = "nq:pending-payment"

/** The checkout this tab started; Stripe's return URL only carries the session id. */
export type PendingPayment = { paymentId: string; bookingId: string; startedAt: number }

export function savePendingPayment(payment: PendingPayment) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payment))
  } catch {
    // Storage can be unavailable (private mode); the success page falls back to the session id.
  }
}

/** The raw stored string. Stable between reads, so it can back `useSyncExternalStore`. */
export function pendingPaymentSnapshot(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function parsePendingPayment(raw: string | null): PendingPayment | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<PendingPayment>
    if (typeof value.paymentId !== "string" || typeof value.bookingId !== "string") return null
    return {
      paymentId: value.paymentId,
      bookingId: value.bookingId,
      startedAt: value.startedAt ?? 0,
    }
  } catch {
    return null
  }
}

export function readPendingPayment(): PendingPayment | null {
  return parsePendingPayment(pendingPaymentSnapshot())
}

export function clearPendingPayment() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore unavailable storage.
  }
}
