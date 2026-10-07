"use client"

import { useId, type ComponentProps, type ReactNode } from "react"
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type BaseProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: ReactNode
  description?: ReactNode
  className?: string
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...inputProps
}: BaseProps<T> & Omit<ComponentProps<typeof Input>, "name" | "value" | "defaultValue">) {
  const id = useId()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            {...inputProps}
            {...field}
            id={id}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
          />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
        </Field>
      )}
    />
  )
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  ...textareaProps
}: BaseProps<T> & Omit<ComponentProps<typeof Textarea>, "name" | "value" | "defaultValue">) {
  const id = useId()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Textarea
            {...textareaProps}
            {...field}
            id={id}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
          />
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
        </Field>
      )}
    />
  )
}

export function SelectField<T extends FieldValues, V extends string>({
  control,
  name,
  label,
  description,
  className,
  options,
  placeholder = "Select an option",
  disabled,
}: BaseProps<T> & {
  options: ReadonlyArray<{ value: V; label: string }>
  placeholder?: string
  disabled?: boolean
}) {
  const id = useId()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select
            name={field.name}
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
              ref={field.ref}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
        </Field>
      )}
    />
  )
}
