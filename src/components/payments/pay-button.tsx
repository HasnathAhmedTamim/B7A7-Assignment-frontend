"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreditCardIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getErrorMessage, isApiError } from "@/lib/api/errors"
import { paymentsApi } from "@/lib/api/resources"
import { formatMoney } from "@/lib/format"
import { savePendingPayment } from "@/lib/payments/pending-payment"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

export function PayButton({
  bookingId,
  amount,
  size = "default",
  className,
}: {
  bookingId: string
  amount: string | number
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  const queryClient = useQueryClient()
  const [redirecting, setRedirecting] = useState(false)
  const inFlight = useRef(false)

  // Coming back from Stripe with the browser's back button restores this page from the
  // back/forward cache with the button still locked.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        inFlight.current = false
        setRedirecting(false)
      }
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  const initiate = useMutation({
    mutationFn: () => paymentsApi.initiate(bookingId),
    meta: { suppressErrorToast: true },
    onSuccess: ({ payment, checkoutUrl }) => {
      savePendingPayment({ paymentId: payment.id, bookingId, startedAt: Date.now() })
      setRedirecting(true)
      window.location.assign(checkoutUrl)
    },
    onError: (error) => {
      inFlight.current = false
      if (isApiError(error) && error.isConflict) {
        toast.info(getErrorMessage(error), {
          description: "We've refreshed the booking so you can see where it stands.",
        })
        void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all })
        void queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
        return
      }
      toast.error(getErrorMessage(error))
    },
  })

  const busy = initiate.isPending || redirecting

  return (
    <Button
      size={size}
      className={cn(className)}
      disabled={busy}
      aria-busy={busy}
      onClick={() => {
        if (inFlight.current) return
        inFlight.current = true
        initiate.mutate()
      }}
    >
      {busy ? <Spinner data-icon="inline-start" /> : <CreditCardIcon data-icon="inline-start" />}
      {redirecting
        ? "Opening checkout…"
        : initiate.isPending
          ? "Starting checkout…"
          : `Pay ${formatMoney(amount)}`}
    </Button>
  )
}
