import { format, isSameMonth, parseISO, startOfMonth, subMonths } from "date-fns"

import { toNumber } from "@/lib/format"
import type { Booking, BookingPayment } from "@/types/models"

export type PaidPayment = BookingPayment & { booking: Booking }

/** Successful payments across bookings, newest first. Landlords see payments through bookings. */
export function paidPayments(bookings: Booking[]): PaidPayment[] {
  return bookings
    .flatMap((booking) =>
      booking.payments.filter((p) => p.status === "PAID").map((p) => ({ ...p, booking })),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function sumAmounts(items: Array<{ amount: string | number }>) {
  return items.reduce((sum, item) => sum + toNumber(item.amount), 0)
}

/** Totals per calendar month for the last `months` months, oldest first. */
export function monthlyTotals(
  items: Array<{ createdAt: string; amount: string | number }>,
  months = 6,
  now = new Date(),
) {
  return Array.from({ length: months }, (_, index) => {
    const month = startOfMonth(subMonths(now, months - 1 - index))
    const value = items
      .filter((item) => isSameMonth(parseISO(item.createdAt), month))
      .reduce((sum, item) => sum + toNumber(item.amount), 0)
    return { label: format(month, "MMM"), value }
  })
}
