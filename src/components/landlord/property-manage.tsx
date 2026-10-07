"use client"

import {
  BathIcon,
  BedDoubleIcon,
  ChevronLeftIcon,
  DoorOpenIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/use-auth"
import {
  useDeleteProperty,
  useDeleteRoom,
  useManagedProperty,
  useSetPropertyStatus,
  useToggleRoomAvailability,
} from "@/hooks/use-landlord"
import { isApiError } from "@/lib/api/errors"
import { formatAddress, formatMoney, pluralize } from "@/lib/format"
import { propertyTypeLabel, roomTypeLabel } from "@/lib/labels"
import type { PropertyDetail, PropertyRoom, PropertyStatus } from "@/types/models"

import { PropertyPhotosCard } from "./property-photos"
import { RoomDialog } from "./room-dialog"

const statusActions: Record<PropertyStatus, Array<{ to: PropertyStatus; label: string }>> = {
  DRAFT: [
    { to: "PUBLISHED", label: "Publish" },
    { to: "ARCHIVED", label: "Archive" },
  ],
  PUBLISHED: [
    { to: "DRAFT", label: "Unpublish" },
    { to: "ARCHIVED", label: "Archive" },
  ],
  ARCHIVED: [
    { to: "PUBLISHED", label: "Publish again" },
    { to: "DRAFT", label: "Move to drafts" },
  ],
}

function RoomsCard({ property }: { property: PropertyDetail }) {
  const toggle = useToggleRoomAvailability(property.id)
  const remove = useDeleteRoom(property.id)
  const [editing, setEditing] = useState<PropertyRoom | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<PropertyRoom | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rooms</CardTitle>
        <CardDescription>
          Renters request a specific room. Approving a request reserves that room.
        </CardDescription>
        <CardAction>
          <Button size="sm" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" />
            Add room
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {property.rooms.length === 0 ? (
          <EmptyState
            icon={DoorOpenIcon}
            title="No rooms yet"
            description="Add at least one room so renters can send requests."
            className="border-dashed bg-transparent"
            action={
              <Button size="sm" onClick={() => setCreating(true)}>
                <PlusIcon data-icon="inline-start" />
                Add the first room
              </Button>
            }
          />
        ) : (
          <ul className="divide-y rounded-lg border">
            {property.rooms.map((room) => (
              <li key={room.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {roomTypeLabel[room.roomType]} · Sleeps {room.capacity} ·{" "}
                    <span className="tabular-nums">{formatMoney(room.monthlyRent)}</span>/mo
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={room.available}
                    disabled={toggle.isPending && toggle.variables?.roomId === room.id}
                    onCheckedChange={(available) => toggle.mutate({ roomId: room.id, available })}
                    aria-label={`${room.name} open for requests`}
                  />
                  <span className={room.available ? "text-success" : "text-muted-foreground"}>
                    {room.available ? "Open" : "Closed"}
                  </span>
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${room.name}`}
                    onClick={() => setEditing(room)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Remove ${room.name}`}
                    onClick={() => setDeleting(room)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <RoomDialog propertyId={property.id} open={creating} onOpenChange={setCreating} />
      <RoomDialog
        propertyId={property.id}
        room={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Remove ${deleting?.name ?? "this room"}?`}
        description="Pending requests for this room are declined automatically. Rooms with an active booking can't be removed."
        confirmLabel="Remove room"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })
        }
      />
    </Card>
  )
}

export function PropertyManage({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const property = useManagedProperty(propertyId)
  const setStatus = useSetPropertyStatus()
  const remove = useDeleteProperty()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const back = (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link href="/landlord/properties">
        <ChevronLeftIcon data-icon="inline-start" />
        All properties
      </Link>
    </Button>
  )

  const notOwner = Boolean(property.data && user && property.data.ownerId !== user.id)
  if (property.isError || notOwner) {
    return (
      <div className="space-y-6">
        {back}
        {notOwner || (isApiError(property.error) && property.error.isNotFound) ? (
          <EmptyState
            title="Property not found"
            description="It may have been deleted, or it belongs to another account."
          />
        ) : (
          <ErrorState error={property.error} onRetry={() => void property.refetch()} />
        )}
      </div>
    )
  }

  if (!property.data) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading property">
        {back}
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const p = property.data
  const openRooms = p.rooms.filter((r) => r.available).length

  return (
    <div className="space-y-6">
      {back}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{p.title}</h1>
            <StatusBadge kind="property" status={p.status} />
          </div>
          <p className="text-sm text-muted-foreground">{formatAddress(p)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" asChild>
            <Link href={`/landlord/properties/${p.id}/edit`}>
              <PencilIcon data-icon="inline-start" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {p.status === "PUBLISHED" ? (
                <DropdownMenuItem asChild>
                  <Link href={`/properties/${p.id}`} target="_blank">
                    <ExternalLinkIcon />
                    View public listing
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {statusActions[p.status].map((action) => (
                <DropdownMenuItem
                  key={action.to}
                  onSelect={() => setStatus.mutate({ id: p.id, status: action.to })}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
                <Trash2Icon />
                Delete property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {p.status !== "PUBLISHED" ? (
        <Card size="sm" className="border-dashed">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {p.status === "DRAFT"
                ? "This home is a draft. Renters can't see it until you publish it."
                : "This home is archived and hidden from renters."}
              {p.rooms.length === 0 ? " Add a room before publishing." : ""}
            </p>
            <Button
              size="sm"
              disabled={setStatus.isPending}
              onClick={() => setStatus.mutate({ id: p.id, status: "PUBLISHED" })}
            >
              Publish now
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Type", value: propertyTypeLabel[p.propertyType] },
          { label: "Listed rent", value: `${formatMoney(p.monthlyRent)}/mo` },
          {
            label: "Bedrooms · baths",
            value: (
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <BedDoubleIcon className="size-4 text-muted-foreground" aria-hidden />
                  {p.bedrooms}
                </span>
                <span className="flex items-center gap-1">
                  <BathIcon className="size-4 text-muted-foreground" aria-hidden />
                  {p.bathrooms}
                </span>
              </span>
            ),
          },
          {
            label: "Rooms open",
            value: `${openRooms} of ${pluralize(p.rooms.length, "room")}`,
          },
        ].map((fact) => (
          <div key={fact.label} className="rounded-lg border bg-card p-3">
            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
            <dd className="mt-1 font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <PropertyPhotosCard property={p} />

      <RoomsCard property={p} />

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {p.description}
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this property?"
        description="Its rooms are removed and pending requests are declined. Properties with active bookings can't be deleted. Cancel those bookings first."
        confirmLabel="Delete property"
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(p.id, {
            onSuccess: () => router.push("/landlord/properties"),
            onSettled: () => setConfirmDelete(false),
          })
        }
      />
    </div>
  )
}
