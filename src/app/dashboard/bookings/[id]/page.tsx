import type { Metadata } from "next"
import { Suspense } from "react"

import { BookingDetail, BookingDetailSkeleton } from "@/components/bookings/booking-detail"

export const metadata: Metadata = { title: "Booking" }

async function TenantBooking({
  params,
}: {
  params: PageProps<"/dashboard/bookings/[id]">["params"]
}) {
  const { id } = await params
  return <BookingDetail bookingId={id} viewer="TENANT" />
}

export default function TenantBookingPage({ params }: PageProps<"/dashboard/bookings/[id]">) {
  return (
    <Suspense fallback={<BookingDetailSkeleton />}>
      <TenantBooking params={params} />
    </Suspense>
  )
}
