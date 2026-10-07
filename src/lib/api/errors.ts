import type { ApiFieldError } from "@/types/api"

export class ApiError extends Error {
  readonly status: number
  readonly errors: ApiFieldError[]

  constructor(status: number, message: string, errors: ApiFieldError[] = []) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }

  get isNetworkError() {
    return this.status === 0
  }
  get isUnauthorized() {
    return this.status === 401
  }
  get isForbidden() {
    return this.status === 403
  }
  get isNotFound() {
    return this.status === 404
  }
  /** The resource changed state on the server (e.g. a request was already approved). */
  get isConflict() {
    return this.status === 409
  }
  get isRateLimited() {
    return this.status === 429
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  0: "We couldn't reach the server. Check your connection and try again.",
  400: "Some of the information you entered isn't valid.",
  401: "Please sign in to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "This item was updated elsewhere. We've refreshed the latest details.",
  413: "That file is too large.",
  429: "Too many attempts. Please wait a few minutes and try again.",
  500: "Something went wrong on our side. Please try again.",
  502: "The service is temporarily unavailable. Please try again.",
  503: "The service is temporarily unavailable. Please try again.",
}

export function fallbackMessage(status: number): string {
  return (
    FALLBACK_MESSAGES[status] ??
    (status >= 500 ? FALLBACK_MESSAGES[500]! : "Something went wrong. Please try again.")
  )
}

const STATUS_WORDS: Record<string, string> = {
  PENDING_PAYMENT: "awaiting payment",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
}

/** Conflict messages quote raw enum values ("status APPROVED"); show them as words. */
function humanizeStatuses(message: string) {
  return message.replace(/\b[A-Z][A-Z_]{3,}\b/g, (word) => STATUS_WORDS[word] ?? word)
}

/** A user-facing message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // 502 carries a curated message (e.g. payment gateway unavailable); other 5xx may leak internals.
    if (error.status === 0 || (error.status >= 500 && error.status !== 502)) {
      return fallbackMessage(error.status)
    }
    if (!error.message) return fallbackMessage(error.status)
    return error.isConflict ? humanizeStatuses(error.message) : error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallbackMessage(500)
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
