"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormAlert } from "@/components/forms/form-alert"
import { SelectField, TextField } from "@/components/forms/form-fields"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { useSaveRoom } from "@/hooks/use-landlord"
import { getErrorMessage, isApiError } from "@/lib/api/errors"
import { applyServerErrors } from "@/lib/forms"
import { roomTypeLabel } from "@/lib/labels"
import {
  emptyRoomValues,
  roomFormSchema,
  toRoomFormValues,
  toRoomInput,
  type RoomFormValues,
} from "@/lib/validation/property"
import { ROOM_TYPES, type PropertyRoom } from "@/types/models"

const roomTypeOptions = ROOM_TYPES.map((value) => ({ value, label: roomTypeLabel[value] }))

function RoomForm({
  propertyId,
  room,
  onDone,
}: {
  propertyId: string
  room?: PropertyRoom
  onDone: () => void
}) {
  const save = useSaveRoom(propertyId)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: room ? toRoomFormValues(room) : emptyRoomValues,
    mode: "onTouched",
  })

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    save.mutate(
      { roomId: room?.id, input: toRoomInput(values) },
      {
        onSuccess: () => {
          toast.success(room ? "Room updated" : "Room added")
          onDone()
        },
        onError: (error) => {
          if (isApiError(error) && error.isConflict) {
            form.setError("available", { type: "server", message: getErrorMessage(error) })
            return
          }
          setFormError(
            applyServerErrors(error, form.setError, [
              "name",
              "roomType",
              "monthlyRent",
              "capacity",
              "available",
            ]),
          )
        },
      },
    )
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <FormAlert message={formError} />
      <FieldGroup className="gap-4">
        <TextField control={form.control} name="name" label="Room name" placeholder="Room A" />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="roomType"
            label="Room type"
            options={roomTypeOptions}
          />
          <TextField control={form.control} name="capacity" label="Sleeps" inputMode="numeric" />
        </div>
        <TextField
          control={form.control}
          name="monthlyRent"
          label="Monthly rent (BDT)"
          inputMode="decimal"
          placeholder="12000"
          description="This is what the tenant pays for the first month when booking."
        />
        <Controller
          control={form.control}
          name="available"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="room-available">Open for requests</FieldLabel>
                <FieldDescription>
                  {fieldState.error?.message ??
                    "Turn off to hide the room from renters, for example during repairs."}
                </FieldDescription>
              </FieldContent>
              <Switch
                id="room-available"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Spinner data-icon="inline-start" /> : null}
          {room ? "Save room" : "Add room"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function RoomDialog({
  propertyId,
  room,
  open,
  onOpenChange,
}: {
  propertyId: string
  room?: PropertyRoom
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{room ? `Edit ${room.name}` : "Add a room"}</DialogTitle>
          <DialogDescription>
            Renters request individual rooms, each with its own rent.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <RoomForm
            key={room?.id ?? "new"}
            propertyId={propertyId}
            room={room}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
