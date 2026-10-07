import { useEffect, useEffectEvent } from "react"

/**
 * Next keeps recently visited routes mounted but hidden, so a form locked after a
 * successful submit would still be locked (and filled in) when the user navigates back.
 * `reset` runs when the component is hidden and again when it is shown, because field
 * subscriptions are paused while hidden and only pick up a reset made once they resume.
 */
export function useResetOnHide(reset: () => void) {
  const run = useEffectEvent(reset)
  useEffect(() => {
    run()
    return () => run()
  }, [])
}
