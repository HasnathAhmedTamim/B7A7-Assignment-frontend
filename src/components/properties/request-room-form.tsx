"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addDays, isAfter, isBefore, parseISO, startOfDay } from "date-fns"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormAlert } from "@/components/forms/form-alert"
import { SelectField, TextareaField, TextField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { isApiError } from "@/lib/api/errors"
import { rentalRequestsApi } from "@/lib/api/resources"
import { formatMoney, toDateInputValue } from "@/lib/format"
import { applyServerErrors } from "@/lib/forms"
import { roomTypeLabel } from "@/lib/labels"
import { queryKeys } from "@/lib/query-keys"
import type { PropertyRoom } from "@/types/models"

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date")

const schema = z
  .object({
    roomId: z.string().min(1, "Choose a room"),
    startDate: dateString.refine(
      (value) => !isBefore(parseISO(value), startOfDay(new Date())),
      "Move-in date can't be in the past",
    ),
    endDate: z.string(),
    message: z.string().trim().max(1000, "Keep your message under 1000 characters"),
  })
  .refine(
    (values) => !values.endDate || isAfter(parseISO(values.endDate), parseISO(values.startDate)),
    { path: ["endDate"], message: "Move-out date must be after the move-in date" },
  )
type Values = z.infer<typeof schema>

export function RequestRoomForm({
  propertyId,
  rooms,
  defaultRoomId,
  onDone,
}: {
  propertyId: string
  rooms: PropertyRoom[]
  defaultRoomId?: string
  onDone: () => void
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const today = toDateInputValue(new Date())

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomId: defaultRoomId ?? (rooms.length === 1 ? rooms[0]!.id : ""),
      startDate: toDateInputValue(addDays(new Date(), 7)),
      endDate: "",
      message: "",
    },
  })
  const startDate = useWatch({ control: form.control, name: "startDate" })

  const create = useMutation({
    mutationFn: (values: Values) =>
      rentalRequestsApi.create({
        propertyId,
        roomId: values.roomId,
        startDate: values.startDate,
        ...(values.endDate ? { endDate: values.endDate } : {}),
        ...(values.message ? { message: values.message } : {}),
      }),
    meta: { suppressErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.rentalRequests.all })
      toast.success("Request sent. The landlord will review it soon.", {
        action: { label: "View requests", onClick: () => router.push("/dashboard/requests") },
      })
      onDone()
    },
    onError: (error) => {
      if (isApiError(error) && error.isConflict) {
        setFormError(error.message)
        router.refresh()
        return
      }
      setFormError(
        applyServerErrors(error, form.setError, ["roomId", "startDate", "endDate", "message"]),
      )
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    create.mutate(values)
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormAlert message={formError} />
      <FieldGroup className="gap-4">
        <SelectField
          control={form.control}
          name="roomId"
          label="Room"
          placeholder="Choose a room"
          options={rooms.map((room) => ({
            value: room.id,
            label: `${room.name} · ${roomTypeLabel[room.roomType]} · ${formatMoney(room.monthlyRent)}/mo`,
          }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="startDate"
            label="Move-in date"
            type="date"
            min={today}
          />
          <TextField
            control={form.control}
            name="endDate"
            label="Move-out date (optional)"
            type="date"
            min={startDate || today}
          />
        </div>
        <TextareaField
          control={form.control}
          name="message"
          label="Message to the landlord (optional)"
          placeholder="Introduce yourself: who's moving in, when, and anything the landlord should know."
          rows={4}
          maxLength={1000}
        />
      </FieldGroup>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={create.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? <Spinner data-icon="inline-start" /> : null}
          Send request
        </Button>
      </div>
    </form>
  )
}
