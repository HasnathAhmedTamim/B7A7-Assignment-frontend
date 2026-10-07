import type { Metadata } from "next"
import { Suspense } from "react"

import { BookingDetail, BookingDetailSkeleton } from "@/components/bookings/booking-detail"

export const metadata: Metadata = { title: "Booking" }

async function AdminBooking({ params }: { params: PageProps<"/admin/bookings/[id]">["params"] }) {
  const { id } = await params
  return <BookingDetail bookingId={id} viewer="ADMIN" />
}

export default function AdminBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  return (
    <Suspense fallback={<BookingDetailSkeleton />}>
      <AdminBooking params={params} />
    </Suspense>
  )
}
