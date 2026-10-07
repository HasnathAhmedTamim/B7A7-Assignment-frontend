import type { Metadata } from "next"
import { Suspense } from "react"

import { BookingDetail, BookingDetailSkeleton } from "@/components/bookings/booking-detail"

export const metadata: Metadata = { title: "Booking" }

async function LandlordBooking({
  params,
}: {
  params: PageProps<"/landlord/bookings/[id]">["params"]
}) {
  const { id } = await params
  return <BookingDetail bookingId={id} viewer="LANDLORD" />
}

export default function LandlordBookingPage({ params }: PageProps<"/landlord/bookings/[id]">) {
  return (
    <Suspense fallback={<BookingDetailSkeleton />}>
      <LandlordBooking params={params} />
    </Suspense>
  )
}
