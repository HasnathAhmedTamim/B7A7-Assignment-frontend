"use client"

import { InfoIcon, LogInIcon } from "lucide-react"
import Link from "next/link"
import { create } from "zustand"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import type { PropertyRoom } from "@/types/models"

import { RequestRoomForm } from "./request-room-form"

type DialogState = {
  open: boolean
  roomId?: string
  openFor: (roomId?: string) => void
  setOpen: (open: boolean) => void
}

const useRequestDialog = create<DialogState>()((set) => ({
  open: false,
  openFor: (roomId) => set({ open: true, roomId }),
  setOpen: (open) => set({ open }),
}))

export function RequestRoomCard({
  propertyId,
  propertyTitle,
  rooms,
}: {
  propertyId: string
  propertyTitle: string
  rooms: PropertyRoom[]
}) {
  const { user, status } = useAuth()
  const { open, roomId, openFor, setOpen } = useRequestDialog()
  const availableRooms = rooms.filter((room) => room.available)

  if (status === "loading" && !user) return <Skeleton className="h-9 w-full" />

  if (availableRooms.length === 0) {
    return (
      <Alert>
        <InfoIcon />
        <AlertDescription>
          Every room here is currently taken. Check back later or browse similar homes.
        </AlertDescription>
      </Alert>
    )
  }

  if (!user) {
    return (
      <Button asChild size="lg" className="w-full">
        <Link href={`/login?next=${encodeURIComponent(`/properties/${propertyId}`)}`}>
          <LogInIcon data-icon="inline-start" />
          Sign in to request a room
        </Link>
      </Button>
    )
  }

  if (user.role !== "TENANT") {
    return (
      <Alert>
        <InfoIcon />
        <AlertDescription>
          Room requests are made from tenant accounts. You&apos;re signed in as{" "}
          {user.role === "ADMIN" ? "an admin" : "a landlord"}.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => openFor()}>
        Request a room
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request a room</DialogTitle>
            <DialogDescription>
              {propertyTitle}. The landlord will approve or decline your request.
            </DialogDescription>
          </DialogHeader>
          <RequestRoomForm
            key={roomId ?? "any"}
            propertyId={propertyId}
            rooms={availableRooms}
            defaultRoomId={roomId}
            onDone={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

/** Per-room shortcut that opens the request dialog preset to that room. */
export function RequestThisRoomButton({ roomId }: { roomId: string }) {
  const { user } = useAuth()
  const openFor = useRequestDialog((state) => state.openFor)
  if (user?.role !== "TENANT") return null
  return (
    <Button size="xs" variant="outline" onClick={() => openFor(roomId)}>
      Request
    </Button>
  )
}
