import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { emptyPropertyValues, type PropertyFormValues } from "@/lib/validation/property"

export const WIZARD_STEPS = ["Basics", "Location", "Details", "Review"] as const

type PropertyDraftState = {
  step: number
  values: PropertyFormValues
  setStep: (step: number) => void
  saveValues: (values: PropertyFormValues) => void
  reset: () => void
}

/**
 * The in-progress "new property" wizard. Kept in sessionStorage so a reload doesn't lose work,
 * without leaking a draft to another account that signs in on the same browser later.
 */
export const usePropertyDraft = create<PropertyDraftState>()(
  persist(
    (set) => ({
      step: 0,
      values: emptyPropertyValues,
      setStep: (step) => set({ step: Math.max(0, Math.min(step, WIZARD_STEPS.length - 1)) }),
      saveValues: (values) => set({ values }),
      reset: () => set({ step: 0, values: emptyPropertyValues }),
    }),
    {
      name: "nq:property-draft",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      merge: (persisted, current) => {
        const saved = persisted as Partial<PropertyDraftState> | undefined
        return {
          ...current,
          step: typeof saved?.step === "number" ? saved.step : current.step,
          values: { ...emptyPropertyValues, ...saved?.values },
        }
      },
    },
  ),
)
