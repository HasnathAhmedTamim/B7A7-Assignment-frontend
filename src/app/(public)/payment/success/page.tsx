import type { Metadata } from "next"
import { Suspense } from "react"

import { PaymentConfirmation } from "@/components/payments/payment-confirmation"
import { PaymentResultSkeleton } from "@/components/payments/payment-result"
import { firstParam } from "@/lib/api/query-string"

export const metadata: Metadata = { title: "Payment" }

async function Confirmation({
  searchParams,
}: {
  searchParams: PageProps<"/payment/success">["searchParams"]
}) {
  const params = await searchParams
  return (
    <PaymentConfirmation
      paymentId={firstParam(params.paymentId)}
      sessionId={firstParam(params.session_id)}
    />
  )
}

export default function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  return (
    <Suspense fallback={<PaymentResultSkeleton />}>
      <Confirmation searchParams={searchParams} />
    </Suspense>
  )
}
