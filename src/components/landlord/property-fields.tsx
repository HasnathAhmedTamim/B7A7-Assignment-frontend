"use client"

import type { Control } from "react-hook-form"

import { SelectField, TextareaField, TextField } from "@/components/forms/form-fields"
import { FieldGroup } from "@/components/ui/field"
import { propertyStatusLabel, propertyTypeLabel } from "@/lib/labels"
import type { PropertyFormValues } from "@/lib/validation/property"
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "@/types/models"

type Props = { control: Control<PropertyFormValues> }

export const propertyTypeOptions = PROPERTY_TYPES.map((value) => ({
  value,
  label: propertyTypeLabel[value],
}))

export const propertyStatusOptions = PROPERTY_STATUSES.map((value) => ({
  value,
  label: propertyStatusLabel[value],
}))

export function BasicsFields({ control }: Props) {
  return (
    <FieldGroup className="gap-4">
      <TextField
        control={control}
        name="title"
        label="Listing title"
        placeholder="Bright 2-bed flat near Dhanmondi Lake"
        maxLength={200}
      />
      <SelectField
        control={control}
        name="propertyType"
        label="Property type"
        options={propertyTypeOptions}
      />
      <TextareaField
        control={control}
        name="description"
        label="Description"
        placeholder="What makes the home pleasant to live in? Mention light, furnishing, utilities, transport and house rules."
        rows={6}
        maxLength={5000}
      />
    </FieldGroup>
  )
}

export function LocationFields({ control }: Props) {
  return (
    <FieldGroup className="gap-4">
      <TextField
        control={control}
        name="address"
        label="Street address"
        placeholder="House 12, Road 5"
        autoComplete="street-address"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          control={control}
          name="location"
          label="Area (optional)"
          placeholder="Dhanmondi"
          description="Shown on listing cards and used in search."
        />
        <TextField
          control={control}
          name="city"
          label="City"
          placeholder="Dhaka"
          autoComplete="address-level2"
        />
      </div>
    </FieldGroup>
  )
}

export function DetailsFields({ control }: Props) {
  return (
    <FieldGroup className="gap-4">
      <TextField
        control={control}
        name="monthlyRent"
        label="Monthly rent for the whole home (BDT)"
        inputMode="decimal"
        placeholder="25000"
        description="Each room has its own rent too. Tenants pay the room's rent."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField control={control} name="bedrooms" label="Bedrooms" inputMode="numeric" />
        <TextField control={control} name="bathrooms" label="Bathrooms" inputMode="numeric" />
      </div>
    </FieldGroup>
  )
}

export function StatusField({ control }: Props) {
  return (
    <SelectField
      control={control}
      name="status"
      label="Visibility"
      options={propertyStatusOptions}
      description="Only published homes appear in search. Drafts and archived homes stay private."
    />
  )
}
