import { Badge } from "@/components/ui/badge"
import {
  bookingStatusLabel,
  paymentStatusLabel,
  propertyStatusLabel,
  requestStatusLabel,
  userStatusLabel,
} from "@/lib/labels"
import { cn } from "@/lib/utils"
import type {
  BookingStatus,
  PaymentStatus,
  PropertyStatus,
  RentalRequestStatus,
  UserStatus,
} from "@/types/models"

type Tone = "neutral" | "success" | "warning" | "danger" | "info"

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/12 text-success dark:bg-success/20",
  warning: "bg-warning/18 text-warning-foreground dark:bg-warning/20 dark:text-warning",
  danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  info: "bg-info/12 text-info dark:bg-info/20",
}

const dotClass: Record<Tone, string> = {
  neutral: "bg-muted-foreground/60",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
}

type StatusMap = {
  request: RentalRequestStatus
  booking: BookingStatus
  payment: PaymentStatus
  property: PropertyStatus
  user: UserStatus
}

const config: { [K in keyof StatusMap]: Record<StatusMap[K], { label: string; tone: Tone }> } = {
  request: {
    PENDING: { label: requestStatusLabel.PENDING, tone: "warning" },
    APPROVED: { label: requestStatusLabel.APPROVED, tone: "success" },
    REJECTED: { label: requestStatusLabel.REJECTED, tone: "danger" },
    CANCELLED: { label: requestStatusLabel.CANCELLED, tone: "neutral" },
  },
  booking: {
    PENDING_PAYMENT: { label: bookingStatusLabel.PENDING_PAYMENT, tone: "warning" },
    CONFIRMED: { label: bookingStatusLabel.CONFIRMED, tone: "success" },
    CANCELLED: { label: bookingStatusLabel.CANCELLED, tone: "neutral" },
    COMPLETED: { label: bookingStatusLabel.COMPLETED, tone: "info" },
  },
  payment: {
    PENDING: { label: paymentStatusLabel.PENDING, tone: "warning" },
    PAID: { label: paymentStatusLabel.PAID, tone: "success" },
    FAILED: { label: paymentStatusLabel.FAILED, tone: "danger" },
    CANCELLED: { label: paymentStatusLabel.CANCELLED, tone: "neutral" },
    REFUNDED: { label: paymentStatusLabel.REFUNDED, tone: "info" },
  },
  property: {
    DRAFT: { label: propertyStatusLabel.DRAFT, tone: "neutral" },
    PUBLISHED: { label: propertyStatusLabel.PUBLISHED, tone: "success" },
    ARCHIVED: { label: propertyStatusLabel.ARCHIVED, tone: "warning" },
  },
  user: {
    ACTIVE: { label: userStatusLabel.ACTIVE, tone: "success" },
    BLOCKED: { label: userStatusLabel.BLOCKED, tone: "danger" },
  },
}

export function StatusBadge<K extends keyof StatusMap>({
  kind,
  status,
  className,
}: {
  kind: K
  status: StatusMap[K]
  className?: string
}) {
  const { label, tone } = config[kind][status]
  return (
    <Badge variant="secondary" className={cn("gap-1.5 rounded-md", toneClass[tone], className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", dotClass[tone])} />
      {label}
    </Badge>
  )
}
