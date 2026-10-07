import type { ComponentType, ReactNode } from "react"

import { DetailList } from "@/components/shared/detail-list"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatMoney, shortId } from "@/lib/format"
import { gatewayLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"
import type { PaymentWithBooking, Role } from "@/types/models"

type Tone = "success" | "pending" | "danger" | "neutral"

const toneClass: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  pending: "bg-primary/10 text-primary",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
}

export const bookingHref = (viewer: Role, bookingId: string) =>
  viewer === "ADMIN" ? `/admin/bookings/${bookingId}` : `/dashboard/bookings/${bookingId}`

export const paymentsHref = (viewer: Role) =>
  viewer === "ADMIN" ? "/admin/payments" : "/dashboard/payments"

export function PaymentResultCard({
  tone,
  icon: Icon,
  title,
  description,
  children,
  actions,
}: {
  tone: Tone
  icon: ComponentType<{ className?: string }>
  title: string
  description: ReactNode
  children?: ReactNode
  actions?: ReactNode
}) {
  return (
    <Card className="w-full">
      <CardContent className="space-y-6 pt-2">
        <div className="space-y-3">
          <span
            aria-hidden
            className={cn("flex size-11 items-center justify-center rounded-full", toneClass[tone])}
          >
            <Icon className="size-5" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
      {actions ? (
        <CardFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {actions}
        </CardFooter>
      ) : null}
    </Card>
  )
}

export function PaymentSummary({ payment }: { payment: PaymentWithBooking }) {
  return (
    <DetailList
      className="rounded-lg border bg-muted/30 p-4"
      items={[
        { label: "Amount", value: formatMoney(payment.amount, payment.currency) },
        { label: "Method", value: gatewayLabel[payment.gateway] },
        { label: "Home", value: payment.booking.property.title },
        { label: "Room", value: payment.booking.room.name },
        { label: "Move-in", value: formatDate(payment.booking.startDate) },
        {
          label: "Reference",
          value: <span className="font-mono text-xs">{shortId(payment.id)}</span>,
        },
      ]}
    />
  )
}

export function PaymentResultSkeleton() {
  return (
    <Card className="w-full" aria-busy="true" aria-label="Loading payment">
      <CardContent className="space-y-6 pt-2">
        <Skeleton className="size-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-36 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}
