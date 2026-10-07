"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { SelectField, TextField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { propertyTypeLabel } from "@/lib/labels"
import type { PropertyFilters } from "@/lib/property-filters"
import { PROPERTY_TYPES, type PropertyType } from "@/types/models"

import { useFilters } from "./filters-context"

const ANY = "any"

const rent = z
  .string()
  .trim()
  .refine((value) => value === "" || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0), {
    message: "Enter an amount greater than 0",
  })

const schema = z
  .object({
    city: z.string().trim().max(100, "Keep the city under 100 characters"),
    location: z.string().trim().max(200, "Keep the area under 200 characters"),
    minRent: rent,
    maxRent: rent,
    propertyType: z.union([z.literal(ANY), z.enum(PROPERTY_TYPES)]),
    bedrooms: z.string(),
    bathrooms: z.string(),
    available: z.boolean(),
  })
  .refine(
    (values) =>
      !values.minRent || !values.maxRent || Number(values.minRent) <= Number(values.maxRent),
    { path: ["maxRent"], message: "Max rent should be at least the min rent" },
  )
type Values = z.infer<typeof schema>

function toValues(filters: PropertyFilters): Values {
  return {
    city: filters.city ?? "",
    location: filters.location ?? "",
    minRent: filters.minRent?.toString() ?? "",
    maxRent: filters.maxRent?.toString() ?? "",
    propertyType: filters.propertyType ?? ANY,
    bedrooms: filters.bedrooms?.toString() ?? ANY,
    bathrooms: filters.bathrooms?.toString() ?? ANY,
    available: filters.available ?? false,
  }
}

const countOptions = (max: number) => [
  { value: ANY, label: "Any" },
  ...Array.from({ length: max }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
]

const typeOptions: Array<{ value: PropertyType | typeof ANY; label: string }> = [
  { value: ANY, label: "Any type" },
  ...PROPERTY_TYPES.map((type) => ({ value: type, label: propertyTypeLabel[type] })),
]

export function FilterPanel({ onApplied }: { onApplied?: () => void }) {
  const { filters, update, reset, isPending } = useFilters()
  const id = useId()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(filters) })

  // Keep the form in sync when the URL changes from elsewhere (chips, back button, reset).
  useEffect(() => {
    form.reset(toValues(filters))
  }, [filters, form])

  const onSubmit = form.handleSubmit((values) => {
    update({
      city: values.city || undefined,
      location: values.location || undefined,
      minRent: values.minRent ? Number(values.minRent) : undefined,
      maxRent: values.maxRent ? Number(values.maxRent) : undefined,
      propertyType: values.propertyType === ANY ? undefined : values.propertyType,
      bedrooms: values.bedrooms === ANY ? undefined : Number(values.bedrooms),
      bathrooms: values.bathrooms === ANY ? undefined : Number(values.bathrooms),
      available: values.available ? true : undefined,
    })
    onApplied?.()
  })

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Filter homes" className="space-y-5">
      <FieldGroup className="gap-4">
        <TextField control={form.control} name="city" label="City" placeholder="e.g. Dhaka" />
        <TextField control={form.control} name="location" label="Area" placeholder="e.g. Gulshan" />

        <Field
          data-invalid={Boolean(form.formState.errors.minRent || form.formState.errors.maxRent)}
        >
          <FieldLabel htmlFor={`${id}-min-rent`}>Monthly rent (BDT)</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id={`${id}-min-rent`}
              inputMode="decimal"
              placeholder="Min"
              aria-label="Minimum rent"
              aria-invalid={Boolean(form.formState.errors.minRent)}
              {...form.register("minRent")}
            />
            <Input
              inputMode="decimal"
              placeholder="Max"
              aria-label="Maximum rent"
              aria-invalid={Boolean(form.formState.errors.maxRent)}
              {...form.register("maxRent")}
            />
          </div>
          <FieldError errors={[form.formState.errors.minRent, form.formState.errors.maxRent]} />
        </Field>

        <SelectField
          control={form.control}
          name="propertyType"
          label="Property type"
          options={typeOptions}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            control={form.control}
            name="bedrooms"
            label="Bedrooms"
            options={countOptions(5)}
          />
          <SelectField
            control={form.control}
            name="bathrooms"
            label="Bathrooms"
            options={countOptions(4)}
          />
        </div>

        <Controller
          control={form.control}
          name="available"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id={`${id}-available`}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor={`${id}-available`} className="font-normal">
                Only homes with free rooms
              </FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isPending}>
          Apply filters
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => {
            reset()
            onApplied?.()
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  )
}
