"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CameraIcon } from "lucide-react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormAlert } from "@/components/forms/form-alert"
import { TextField } from "@/components/forms/form-fields"
import { DetailList } from "@/components/shared/detail-list"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/use-auth"
import { usersApi } from "@/lib/api/resources"
import { formatDate } from "@/lib/format"
import { applyServerErrors } from "@/lib/forms"
import { roleLabel } from "@/lib/labels"
import { queryKeys } from "@/lib/query-keys"
import { MAX_AVATAR_BYTES, profileSchema, type ProfileValues } from "@/lib/validation/profile"
import { useAuthStore } from "@/stores/auth-store"
import type { User } from "@/types/models"

function useMe() {
  const { isReady } = useAuth()
  return useQuery({ queryKey: queryKeys.me, queryFn: () => usersApi.me(), enabled: isReady })
}

function syncSessionUser(user: User) {
  const store = useAuthStore.getState()
  if (store.user) store.setUser({ ...store.user, name: user.name })
}

function AvatarCard({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useMutation({
    mutationFn: (file: File) => usersApi.uploadProfileImage(file),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.me, updated)
      toast.success("Profile photo updated")
    },
  })

  const onFile = (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file, such as a JPG or PNG.")
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("That image is larger than 5 MB. Choose a smaller one.")
      return
    }
    upload.mutate(file)
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="relative">
          <UserAvatar name={user.name} image={user.profileImage} className="size-20 text-lg" />
          {upload.isPending ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
              <Spinner />
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-lg font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          <CameraIcon data-icon="inline-start" />
          {user.profileImage ? "Change photo" : "Upload photo"}
        </Button>
      </CardContent>
    </Card>
  )
}

function DetailsForm({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? "" },
  })

  const save = useMutation({
    mutationFn: (values: ProfileValues) =>
      usersApi.updateMe({ name: values.name, phone: values.phone || null }),
    meta: { suppressErrorToast: true },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.me, updated)
      syncSessionUser(updated)
      form.reset({ name: updated.name, phone: updated.phone ?? "" })
      toast.success("Profile saved")
    },
    onError: (error) => setFormError(applyServerErrors(error, form.setError, ["name", "phone"])),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
        <CardDescription>
          Landlords see your name and phone number when you send a request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="space-y-5"
          onSubmit={form.handleSubmit((values) => {
            setFormError(null)
            save.mutate(values)
          })}
        >
          <FormAlert message={formError} />
          <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
            <TextField control={form.control} name="name" label="Full name" autoComplete="name" />
            <TextField
              control={form.control}
              name="phone"
              label="Phone (optional)"
              type="tel"
              autoComplete="tel"
              placeholder="+880 1XXX-XXXXXX"
            />
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={!form.formState.isDirty || save.isPending}
              onClick={() => {
                setFormError(null)
                form.reset()
              }}
            >
              Discard
            </Button>
            <Button type="submit" disabled={!form.formState.isDirty || save.isPending}>
              {save.isPending ? <Spinner data-icon="inline-start" /> : null}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function ProfileSettings() {
  const me = useMe()

  if (me.isError) {
    return (
      <ErrorState
        error={me.error}
        title="We couldn't load your profile"
        onRetry={() => void me.refetch()}
      />
    )
  }
  if (!me.data) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const user = me.data
  return (
    <div className="space-y-6">
      <AvatarCard user={user} />
      <DetailsForm key={user.updatedAt} user={user} />
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailList
            items={[
              { label: "Email", value: user.email },
              { label: "Account type", value: roleLabel[user.role] },
              { label: "Status", value: <StatusBadge kind="user" status={user.status} /> },
              { label: "Member since", value: formatDate(user.createdAt) },
            ]}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Need to change your email or account type? Contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
