import type {
  BookingStatus,
  PaymentGateway,
  PaymentStatus,
  PropertyStatus,
  PropertyType,
  RentalRequestStatus,
  Role,
  RoomType,
  UserStatus,
} from "@/types/models"

export const propertyTypeLabel: Record<PropertyType, string> = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  STUDIO: "Studio",
  SHARED: "Shared living",
  OTHER: "Other",
}

export const roomTypeLabel: Record<RoomType, string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  SHARED: "Shared",
  MASTER: "Master",
  OTHER: "Other",
}

export const propertyStatusLabel: Record<PropertyStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
}

export const requestStatusLabel: Record<RentalRequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
}

export const bookingStatusLabel: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
}

export const userStatusLabel: Record<UserStatus, string> = {
  ACTIVE: "Active",
  BLOCKED: "Blocked",
}

export const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  LANDLORD: "Landlord",
  TENANT: "Tenant",
}

export const gatewayLabel: Record<PaymentGateway, string> = {
  STRIPE: "Card (Stripe)",
  BKASH: "bKash",
}
