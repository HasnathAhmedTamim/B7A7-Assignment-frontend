import type { AuditLog } from "@/types/models"

const actionLabels: Record<string, string> = {
  USER_REGISTERED: "Signed up",
  USER_REGISTERED_GOOGLE: "Signed up with Google",
  USER_LOGIN: "Signed in",
  USER_LOGIN_GOOGLE: "Signed in with Google",
  USER_LOGOUT: "Signed out",
  FORGOT_PASSWORD_OTP_SENT: "Requested a password reset",
  PASSWORD_RESET: "Reset their password",
  PROFILE_IMAGE_UPDATED: "Updated their profile photo",
  ADMIN_USER_STATUS_UPDATED: "Changed a user's status",
  ADMIN_USER_ROLE_UPDATED: "Changed a user's role",
  PROPERTY_CREATED: "Created a property",
  PROPERTY_UPDATED: "Updated a property",
  PROPERTY_DELETED: "Deleted a property",
  ROOM_CREATED: "Added a room",
  ROOM_UPDATED: "Updated a room",
  ROOM_DELETED: "Removed a room",
  RENTAL_REQUEST_CREATED: "Sent a rental request",
  RENTAL_REQUEST_APPROVED: "Approved a rental request",
  RENTAL_REQUEST_REJECTED: "Declined a rental request",
  RENTAL_REQUEST_CANCELLED: "Cancelled a rental request",
  BOOKING_CREATED: "Booking created",
  BOOKING_CANCELLED: "Cancelled a booking",
  PAYMENT_INITIATED: "Started a payment",
  PAYMENT_PAID: "Payment succeeded",
  PAYMENT_REQUIRES_REFUND: "Payment needs a manual refund",
}

/** "SOME_NEW_ACTION" → "Some new action" for actions added after this list. */
function sentenceCase(value: string) {
  const text = value.toLowerCase().replace(/_/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function auditActionLabel(action: string) {
  return actionLabels[action] ?? sentenceCase(action)
}

/** Flat `key: value` pairs from a log's metadata, skipping nested objects. */
export function auditDetails(log: AuditLog): Array<[string, string]> {
  if (!log.metadata || typeof log.metadata !== "object" || Array.isArray(log.metadata)) return []
  return Object.entries(log.metadata as Record<string, unknown>)
    .filter(([, value]) => value !== null && ["string", "number", "boolean"].includes(typeof value))
    .map(([key, value]) => {
      const text = String(value)
      return [
        sentenceCase(key.replace(/([a-z])([A-Z])/g, "$1_$2")),
        /^[A-Z][A-Z_]+$/.test(text) ? sentenceCase(text) : text,
      ]
    })
}
