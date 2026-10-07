"use client"

import { Fragment, useEffect, useState } from "react"

/**
 * Next keeps recently visited routes mounted but hidden, so a form that locked itself
 * after a successful submit would still be locked, and filled in, when the user comes
 * back. Remounting on hide makes every return start from a fresh form.
 */
export function RemountOnHide({ children }: { children: React.ReactNode }) {
  const [generation, setGeneration] = useState(0)
  useEffect(() => () => setGeneration((value) => value + 1), [])
  return <Fragment key={generation}>{children}</Fragment>
}
