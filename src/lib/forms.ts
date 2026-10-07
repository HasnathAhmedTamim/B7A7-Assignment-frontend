import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import { getErrorMessage, isApiError } from "@/lib/api/errors"

/**
 * Copies backend validation errors onto matching form fields.
 * Returns a message for the form-level alert when nothing could be attached to a field.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: ReadonlyArray<Path<T>>,
): string | null {
  if (isApiError(error) && error.errors.length > 0) {
    let attached = false
    for (const issue of error.errors) {
      const field = fields.find((name) => name === issue.path)
      if (field) {
        setError(field, { type: "server", message: issue.message })
        attached = true
      }
    }
    if (attached) return null
  }
  return getErrorMessage(error)
}
