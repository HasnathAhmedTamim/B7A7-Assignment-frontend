import type { QueryParams } from "@/lib/api/query-string"

export const queryKeys = {
  me: ["me"] as const,

  properties: {
    all: ["properties"] as const,
    list: (params: QueryParams) => ["properties", "list", params] as const,
    mine: (params: QueryParams) => ["properties", "mine", params] as const,
    detail: (id: string) => ["properties", "detail", id] as const,
    rooms: (propertyId: string) => ["properties", "rooms", propertyId] as const,
  },

  rentalRequests: {
    all: ["rental-requests"] as const,
    mine: ["rental-requests", "mine"] as const,
    received: ["rental-requests", "received"] as const,
  },

  bookings: {
    all: ["bookings"] as const,
    mine: ["bookings", "mine"] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
  },

  payments: {
    all: ["payments"] as const,
    mine: ["payments", "mine"] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
  },

  admin: {
    all: ["admin"] as const,
    stats: ["admin", "stats"] as const,
    users: (params: QueryParams) => ["admin", "users", params] as const,
    auditLogs: (params: QueryParams) => ["admin", "audit-logs", params] as const,
  },
}
