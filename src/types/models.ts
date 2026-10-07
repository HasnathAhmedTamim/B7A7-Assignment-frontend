export const ROLES = ["ADMIN", "LANDLORD", "TENANT"] as const
export type Role = (typeof ROLES)[number]

export const USER_STATUSES = ["ACTIVE", "BLOCKED"] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "STUDIO", "SHARED", "OTHER"] as const
export type PropertyType = (typeof PROPERTY_TYPES)[number]

export const PROPERTY_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number]

export const ROOM_TYPES = ["SINGLE", "DOUBLE", "SHARED", "MASTER", "OTHER"] as const
export type RoomType = (typeof ROOM_TYPES)[number]

export const RENTAL_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const
export type RentalRequestStatus = (typeof RENTAL_REQUEST_STATUSES)[number]

export const BOOKING_STATUSES = ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED", "COMPLETED"] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export type PaymentGateway = "STRIPE" | "BKASH"
export type AuthProvider = "CREDENTIAL" | "GOOGLE"

/** Prisma Decimal columns are serialized as strings. */
export type Decimal = string
/** ISO 8601 timestamp. */
export type DateString = string

export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  status: UserStatus
  authProvider: AuthProvider
  emailVerified: boolean
  profileImage: string | null
  createdAt: DateString
  updatedAt: DateString
}

export type AdminUser = Pick<
  User,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "role"
  | "status"
  | "authProvider"
  | "profileImage"
  | "createdAt"
>

export type Contact = {
  id: string
  name: string
  email: string
  phone: string | null
}

export type Property = {
  id: string
  ownerId: string
  title: string
  description: string
  address: string
  city: string
  location: string | null
  monthlyRent: Decimal
  propertyType: PropertyType
  bedrooms: number
  bathrooms: number
  status: PropertyStatus
  createdAt: DateString
  updatedAt: DateString
  owner: Contact
  /** `rooms` counts available, non-deleted rooms only. */
  _count: { rooms: number }
}

export type Room = {
  id: string
  propertyId: string
  name: string
  roomType: RoomType
  monthlyRent: Decimal
  capacity: number
  available: boolean
  createdAt: DateString
  updatedAt: DateString
}

export type PropertyRoom = Pick<
  Room,
  "id" | "name" | "roomType" | "monthlyRent" | "capacity" | "available"
>

export type PropertyDetail = Property & { rooms: PropertyRoom[] }

export type RentalRequest = {
  id: string
  tenantId: string
  propertyId: string
  roomId: string
  message: string | null
  startDate: DateString
  endDate: DateString | null
  status: RentalRequestStatus
  createdAt: DateString
  updatedAt: DateString
  property: {
    id: string
    title: string
    city: string
    ownerId: string
    monthlyRent: Decimal
  }
  room: { id: string; name: string; monthlyRent: Decimal; available: boolean }
  tenant: Contact
  booking: {
    id: string
    status: BookingStatus
    rentAmount: Decimal
    startDate: DateString
    endDate: DateString | null
  } | null
}

export type BookingPayment = {
  id: string
  status: PaymentStatus
  amount: Decimal
  gateway: PaymentGateway
  createdAt: DateString
}

export type Booking = {
  id: string
  tenantId: string
  propertyId: string
  roomId: string
  rentalRequestId: string
  startDate: DateString
  endDate: DateString | null
  rentAmount: Decimal
  status: BookingStatus
  createdAt: DateString
  updatedAt: DateString
  tenant: Contact
  property: { id: string; title: string; city: string; ownerId: string }
  room: { id: string; name: string; monthlyRent: Decimal }
  payments: BookingPayment[]
}

export type Payment = {
  id: string
  userId: string
  bookingId: string
  amount: Decimal
  currency: string
  gateway: PaymentGateway
  status: PaymentStatus
  gatewayPaymentId: string | null
  transactionId: string | null
  merchantReference: string | null
  createdAt: DateString
  updatedAt: DateString
}

export type PaymentWithBooking = Payment & {
  booking: {
    id: string
    tenantId: string
    status: BookingStatus
    rentAmount: Decimal
    startDate: DateString
    endDate: DateString | null
    property: { id: string; title: string; city: string; ownerId: string }
    room: { id: string; name: string }
  }
}

export type DashboardStats = {
  totalUsers: number
  totalLandlords: number
  totalTenants: number
  totalProperties: number
  totalRooms: number
  availableRooms: number
  pendingRequests: number
  confirmedBookings: number
  paidPayments: number
}

export type AuditLog = {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string | null
  metadata: unknown
  createdAt: DateString
  user: { id: string; name: string; email: string; role: Role } | null
}

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
}
