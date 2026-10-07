"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, type FieldPath } from "react-hook-form"
import { toast } from "sonner"

import { FormAlert } from "@/components/forms/form-alert"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/use-auth"
import { useManagedProperty, useUpdateProperty } from "@/hooks/use-landlord"
import { isApiError } from "@/lib/api/errors"
import { applyServerErrors } from "@/lib/forms"
import {
  propertyFormSchema,
  toPropertyFormValues,
  toPropertyInput,
  type PropertyFormValues,
} from "@/lib/validation/property"
import type { Property } from "@/types/models"

import { BasicsFields, DetailsFields, LocationFields, StatusField } from "./property-fields"

const fields = Object.keys(propertyFormSchema.shape) as FieldPath<PropertyFormValues>[]

function EditForm({ property }: { property: Property }) {
  const router = useRouter()
  const update = useUpdateProperty(property.id)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: toPropertyFormValues(property),
    mode: "onTouched",
  })
  const manageHref = `/landlord/properties/${property.id}`

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null)
    const input = toPropertyInput(values)
    const dirty = form.formState.dirtyFields
    const changes = Object.fromEntries(
      Object.entries(input).filter(([key]) => dirty[key as keyof PropertyFormValues]),
    )
    if (Object.keys(changes).length === 0) {
      router.push(manageHref)
      return
    }
    update.mutate(changes, {
      onSuccess: () => {
        toast.success("Changes saved")
        router.push(manageHref)
      },
      onError: (error) => setFormError(applyServerErrors(error, form.setError, fields)),
    })
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6">
      <FormAlert message={formError} />
      <Card>
        <CardHeader>
          <CardTitle>The basics</CardTitle>
        </CardHeader>
        <CardContent>
          <BasicsFields control={form.control} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationFields control={form.control} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Size and rent</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailsFields control={form.control} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>Archive a home to hide it without deleting its history.</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusField control={form.control} />
        </CardContent>
      </Card>
      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="button" variant="ghost" asChild>
          <Link href={manageHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={update.isPending || !form.formState.isDirty}>
          {update.isPending ? <Spinner data-icon="inline-start" /> : null}
          Save changes
        </Button>
      </div>
    </form>
  )
}

export function PropertyEditPage({ propertyId }: { propertyId: string }) {
  const property = useManagedProperty(propertyId)
  const { user } = useAuth()
  const notOwner = Boolean(property.data && user && property.data.ownerId !== user.id)

  const back = (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link href={`/landlord/properties/${propertyId}`}>
        <ChevronLeftIcon data-icon="inline-start" />
        Back to property
      </Link>
    </Button>
  )

  if (property.isError || notOwner) {
    return (
      <div className="space-y-6">
        {back}
        {notOwner || (isApiError(property.error) && property.error.isNotFound) ? (
          <EmptyState title="Property not found" description="It may have been deleted." />
        ) : (
          <ErrorState error={property.error} onRetry={() => void property.refetch()} />
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {back}
      <PageHeader
        title="Edit property"
        description={property.data ? property.data.title : "Update the listing details."}
      />
      {property.data ? (
        <EditForm key={property.data.updatedAt} property={property.data} />
      ) : (
        <div className="space-y-6" aria-busy="true" aria-label="Loading property">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}
    </div>
  )
}
