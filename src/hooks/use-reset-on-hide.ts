import { useEffect, useEffectEvent } from "react"

/**
 * Next keeps recently visited routes mounted but hidden, so a form locked after a
 * successful submit would still be locked when the user navigates back to it.
 * `onHide` runs whenever the component is hidden or unmounted.
 */
export function useResetOnHide(onHide: () => void) {
  const run = useEffectEvent(onHide)
  useEffect(() => () => run(), [])
}
