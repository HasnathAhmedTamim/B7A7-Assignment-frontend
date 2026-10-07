import type { Metadata } from "next"
import { Suspense } from "react"

import { PaymentCancelled } from "@/components/payments/payment-cancelled"
import { PaymentResultSkeleton } from "@/components/payments/payment-result"
import { firstParam } from "@/lib/api/query-string"

export const metadata: Metadata = { title: "Checkout cancelled" }

async function Cancelled({
  searchParams,
}: {
  searchParams: PageProps<"/payment/cancel">["searchParams"]
}) {
  const params = await searchParams
  return (
    <PaymentCancelled
      paymentId={firstParam(params.paymentId)}
      outcome={firstParam(params.status)}
    />
  )
}

export default function PaymentCancelPage({ searchParams }: PageProps<"/payment/cancel">) {
  return (
    <Suspense fallback={<PaymentResultSkeleton />}>
      <Cancelled searchParams={searchParams} />
    </Suspense>
  )
}
