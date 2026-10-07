"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"

import { FormAlert } from "@/components/forms/form-alert"
import { DetailList } from "@/components/shared/detail-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useCreateProperty } from "@/hooks/use-landlord"
import { formatMoney } from "@/lib/format"
import { applyServerErrors } from "@/lib/forms"
import { propertyTypeLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"
import {
  propertyBasicsSchema,
  propertyDetailsSchema,
  propertyFormSchema,
  propertyLocationSchema,
  toPropertyInput,
  type PropertyFormValues,
} from "@/lib/validation/property"
import { usePropertyDraft, WIZARD_STEPS } from "@/stores/property-draft-store"
import type { PropertyStatus } from "@/types/models"

import { BasicsFields, DetailsFields, LocationFields } from "./property-fields"

const stepFields: FieldPath<PropertyFormValues>[][] = [
  Object.keys(propertyBasicsSchema.shape) as FieldPath<PropertyFormValues>[],
  Object.keys(propertyLocationSchema.shape) as FieldPath<PropertyFormValues>[],
  Object.keys(propertyDetailsSchema.shape) as FieldPath<PropertyFormValues>[],
  [],
]

const stepCopy = [
  { title: "The basics", description: "What renters see first in search results." },
  { title: "Where it is", description: "Renters filter by city and area." },
  { title: "Size and rent", description: "You'll add individual rooms and their rent next." },
  {
    title: "Review and save",
    description: "Check the details. You can publish now or keep it as a draft.",
  },
]

function Stepper({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
      {WIZARD_STEPS.map((label, index) => {
        const done = index < step
        const current = index === step
        return (
          <li key={label} aria-current={current ? "step" : undefined} className="space-y-2">
            <span
              className={cn("block h-1 rounded-full bg-muted", (done || current) && "bg-primary")}
            />
            <span
              className={cn(
                "flex items-center gap-1 text-xs text-muted-foreground",
                current && "font-medium text-foreground",
              )}
            >
              {done ? <CheckIcon className="size-3 text-primary" aria-hidden /> : null}
              <span className="hidden sm:inline">{index + 1}. </span>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function WizardForm() {
  const router = useRouter()
  const { step, values, setStep, saveValues, reset } = usePropertyDraft()
  const create = useCreateProperty()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: values,
    mode: "onTouched",
  })

  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values: next }) => saveValues(next as PropertyFormValues),
      }),
    [form, saveValues],
  )

  // The save buttons replace "Continue" in the same spot; ignore a double-click carrying over.
  const reviewOpenedAt = useRef(0)

  const goNext = async () => {
    const fields = stepFields[step] ?? []
    if (!(await form.trigger(fields, { shouldFocus: true }))) return
    if (step + 1 === WIZARD_STEPS.length - 1) reviewOpenedAt.current = performance.now()
    setStep(step + 1)
  }

  const submit = (status: PropertyStatus) => {
    if (performance.now() - reviewOpenedAt.current < 600) return
    return form.handleSubmit(
      (data) => {
        setFormError(null)
        create.mutate(toPropertyInput({ ...data, status }), {
          onSuccess: (property) => {
            reset()
            toast.success(
              status === "PUBLISHED"
                ? "Property published. Add photos and rooms so renters can request them."
                : "Draft saved. Add photos and rooms, then publish when you're ready.",
            )
            router.push(`/landlord/properties/${property.id}`)
          },
          onError: (error) => {
            const message = applyServerErrors(error, form.setError, [
              ...stepFields.flat(),
              "status",
            ])
            setFormError(message)
            const firstInvalid = stepFields.findIndex((fields) =>
              fields.some((field) => form.getFieldState(field).invalid),
            )
            if (firstInvalid >= 0) setStep(firstInvalid)
          },
        })
      },
      () => {
        const firstInvalid = stepFields.findIndex((fields) =>
          fields.some((field) => form.getFieldState(field).invalid),
        )
        if (firstInvalid >= 0) setStep(firstInvalid)
      },
    )()
  }

  const current = form.getValues()
  const copy = stepCopy[step] ?? stepCopy[0]!

  return (
    <div className="space-y-6">
      <Stepper step={step} />
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (step < WIZARD_STEPS.length - 1) void goNext()
            }}
          >
            <FormAlert message={formError} />
            {step === 0 ? <BasicsFields control={form.control} /> : null}
            {step === 1 ? <LocationFields control={form.control} /> : null}
            {step === 2 ? <DetailsFields control={form.control} /> : null}
            {step === 3 ? (
              <DetailList
                items={[
                  { label: "Title", value: current.title },
                  { label: "Type", value: propertyTypeLabel[current.propertyType] },
                  {
                    label: "Address",
                    value: [current.address, current.location, current.city]
                      .filter(Boolean)
                      .join(", "),
                  },
                  { label: "Monthly rent", value: formatMoney(current.monthlyRent) },
                  { label: "Bedrooms", value: current.bedrooms },
                  { label: "Bathrooms", value: current.bathrooms },
                  {
                    label: "Description",
                    value: <span className="whitespace-pre-line">{current.description}</span>,
                  },
                ]}
              />
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  disabled={create.isPending}
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    reset()
                    form.reset(usePropertyDraft.getState().values)
                  }}
                >
                  Clear form
                </Button>
              )}
              <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
                {step < WIZARD_STEPS.length - 1 ? (
                  <Button type="submit">
                    Continue
                    <ChevronRightIcon data-icon="inline-end" />
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={create.isPending}
                      onClick={() => void submit("DRAFT")}
                    >
                      Save as draft
                    </Button>
                    <Button
                      type="button"
                      disabled={create.isPending}
                      onClick={() => void submit("PUBLISHED")}
                    >
                      {create.isPending ? <Spinner data-icon="inline-start" /> : null}
                      Publish now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function PropertyWizard() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    void Promise.resolve(usePropertyDraft.persist.rehydrate()).then(() => setHydrated(true))
  }, [])

  if (!hydrated) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading form">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }
  return <WizardForm />
}
