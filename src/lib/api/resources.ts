import type { Paginated } from "@/types/api"
import type {
  AdminUser,
  AuditLog,
  Booking,
  DashboardStats,
  Payment,
  PaymentGateway,
  PaymentWithBooking,
  Property,
  PropertyDetail,
  PropertyStatus,
  PropertyType,
  RentalRequest,
  Role,
  Room,
  RoomType,
  User,
  UserStatus,
} from "@/types/models"

import { api } from "./client"
import type { QueryParams } from "./query-string"

const id = (value: string) => encodeURIComponent(value)

export type PropertyInput = {
  title: string
  description: string
  address: string
  city: string
  location?: string
  monthlyRent: number
  propertyType: PropertyType
  bedrooms: number
  bathrooms: number
  status: PropertyStatus
}

export type RoomInput = {
  name: string
  roomType: RoomType
  monthlyRent: number
  capacity: number
  available: boolean
}

export type MyPropertiesQuery = {
  page?: number
  limit?: number
  search?: string
  status?: PropertyStatus
  sortBy?: "createdAt" | "monthlyRent" | "title" | "city"
  sortOrder?: "asc" | "desc"
}

export const propertiesApi = {
  list: (query: QueryParams) => api.getPage<Property>("/properties", query),
  /** Properties owned by the signed-in landlord, in every status. */
  mine: (query: MyPropertiesQuery) => api.getPage<Property>("/properties/my", query),
  get: (propertyId: string) => api.get<PropertyDetail>(`/properties/${id(propertyId)}`),
  create: (input: PropertyInput) => api.post<Property>("/properties", input),
  update: (propertyId: string, input: Partial<PropertyInput>) =>
    api.patch<Property>(`/properties/${id(propertyId)}`, input),
  remove: (propertyId: string) => api.delete<null>(`/properties/${id(propertyId)}`),
}

export const roomsApi = {
  list: (propertyId: string) => api.get<Room[]>(`/properties/${id(propertyId)}/rooms`),
  create: (propertyId: string, input: RoomInput) =>
    api.post<Room>(`/properties/${id(propertyId)}/rooms`, input),
  update: (roomId: string, input: Partial<RoomInput>) =>
    api.patch<Room>(`/rooms/${id(roomId)}`, input),
  remove: (roomId: string) => api.delete<null>(`/rooms/${id(roomId)}`),
}

export type RentalRequestInput = {
  propertyId: string
  roomId: string
  startDate: string
  endDate?: string
  message?: string
}

export const rentalRequestsApi = {
  create: (input: RentalRequestInput) => api.post<RentalRequest>("/rental-requests", input),
  mine: () => api.get<RentalRequest[]>("/rental-requests/my"),
  received: () => api.get<RentalRequest[]>("/rental-requests/received"),
  /** Reserves the room and creates a booking awaiting the tenant's payment. */
  approve: (requestId: string) =>
    api.patch<{
      request: Omit<RentalRequest, "property" | "room" | "tenant" | "booking">
      booking: { id: string }
    }>(`/rental-requests/${id(requestId)}/approve`),
  reject: (requestId: string) =>
    api.patch<RentalRequest>(`/rental-requests/${id(requestId)}/reject`),
  cancel: (requestId: string) =>
    api.patch<RentalRequest>(`/rental-requests/${id(requestId)}/cancel`),
}

export const bookingsApi = {
  /** Role-scoped: a tenant's own, a landlord's properties', or all for admins. */
  mine: () => api.get<Booking[]>("/bookings/my"),
  get: (bookingId: string) => api.get<Booking>(`/bookings/${id(bookingId)}`),
  cancel: (bookingId: string) => api.patch<Booking>(`/bookings/${id(bookingId)}/cancel`),
}

export const paymentsApi = {
  initiate: (bookingId: string, gateway: PaymentGateway = "STRIPE") =>
    api.post<{ payment: Payment; checkoutUrl: string }>("/payments/initiate", {
      bookingId,
      gateway,
    }),
  mine: () => api.get<PaymentWithBooking[]>("/payments/my"),
  get: (paymentId: string) => api.get<PaymentWithBooking>(`/payments/${id(paymentId)}`),
}

export const usersApi = {
  me: () => api.get<User>("/users/me"),
  updateMe: (input: { name?: string; phone?: string | null }) =>
    api.patch<User>("/users/me", input),
  uploadProfileImage: (file: File, onUploadProgress?: (percent: number) => void) => {
    const body = new FormData()
    body.append("profileImage", file)
    return api.patch<User>("/users/profile-image", body, { onUploadProgress })
  },
}

export type AdminUsersQuery = {
  search?: string
  role?: Role
  status?: UserStatus
  page?: number
  limit?: number
}

export const adminApi = {
  stats: () => api.get<DashboardStats>("/admin/dashboard-stats"),
  users: (query: AdminUsersQuery) => api.getPage<AdminUser>("/admin/users", query),
  setUserStatus: (userId: string, status: UserStatus) =>
    api.patch<AdminUser>(`/admin/users/${id(userId)}/status`, { status }),
  setUserRole: (userId: string, role: Role) =>
    api.patch<AdminUser>(`/admin/users/${id(userId)}/role`, { role }),
  auditLogs: (query: { page?: number; limit?: number }) =>
    api.getPage<AuditLog>("/admin/audit-logs", query),
}

export type { Paginated }
