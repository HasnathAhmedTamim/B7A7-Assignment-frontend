import {
  BathIcon,
  BedDoubleIcon,
  CalendarIcon,
  ChevronLeftIcon,
  DoorOpenIcon,
  MapPinIcon,
  UserRoundIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { PropertyDetailSkeleton } from "@/components/properties/property-detail-skeleton"
import { RequestRoomCard, RequestThisRoomButton } from "@/components/properties/request-room-card"
import { PropertyVisual } from "@/components/shared/property-visual"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPublicProperty } from "@/lib/api/public"
import { formatAddress, formatDate, formatMoney, pluralize, toNumber } from "@/lib/format"
import { propertyTypeLabel, roomTypeLabel } from "@/lib/labels"
import { publicMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function loadProperty(id: string) {
  return UUID.test(id) ? getPublicProperty(id) : null
}

export async function generateMetadata({
  params,
}: PageProps<"/properties/[id]">): Promise<Metadata> {
  const { id } = await params
  const property = await loadProperty(id).catch(() => null)
  if (!property) return { title: "Home not found" }
  return publicMetadata({
    title: property.title,
    description: `${propertyTypeLabel[property.propertyType]} in ${property.city} for ${formatMoney(property.monthlyRent)} per month. ${property.description.slice(0, 120)}`,
    path: `/properties/${property.id}`,
  })
}

async function PropertyDetail({ params }: { params: PageProps<"/properties/[id]">["params"] }) {
  const { id } = await params
  const property = await loadProperty(id)
  if (!property) notFound()

  const availableRooms = property.rooms.filter((room) => room.available).length
  const pricedRooms =
    availableRooms > 0 ? property.rooms.filter((r) => r.available) : property.rooms
  const lowestRoomRent =
    pricedRooms.length > 0
      ? Math.min(...pricedRooms.map((room) => toNumber(room.monthlyRent)))
      : null
  const facts = [
    { icon: BedDoubleIcon, label: "Bedrooms", value: property.bedrooms },
    { icon: BathIcon, label: "Bathrooms", value: property.bathrooms },
    {
      icon: DoorOpenIcon,
      label: "Free rooms",
      value: `${availableRooms} of ${property.rooms.length}`,
    },
    { icon: CalendarIcon, label: "Listed", value: formatDate(property.createdAt) },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-8">
        <PropertyVisual
          type={property.propertyType}
          size="lg"
          className="aspect-[21/9] rounded-xl border"
        />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{propertyTypeLabel[property.propertyType]}</Badge>
            {availableRooms > 0 ? (
              <Badge variant="secondary" className="bg-success/12 text-success">
                {pluralize(availableRooms, "room")} available
              </Badge>
            ) : (
              <Badge variant="secondary">Fully booked</Badge>
            )}
          </div>
          <h1 className="text-3xl font-semibold">{property.title}</h1>
          <p className="flex items-start gap-1.5 text-muted-foreground">
            <MapPinIcon className="mt-1 size-4 shrink-0" aria-hidden />
            {formatAddress(property)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-lg border bg-card p-3">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <fact.icon className="size-3.5" aria-hidden />
                {fact.label}
              </dt>
              <dd className="mt-1 font-medium tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <section className="space-y-2" aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-lg font-semibold">
            About this home
          </h2>
          <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
            {property.description}
          </p>
        </section>

        <section className="space-y-3" aria-labelledby="rooms-heading">
          <h2 id="rooms-heading" className="text-lg font-semibold">
            Rooms
          </h2>
          {property.rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              The landlord hasn&apos;t added rooms yet.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border bg-card">
              {property.rooms.map((room) => (
                <li key={room.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {roomTypeLabel[room.roomType]} · Sleeps {room.capacity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums">{formatMoney(room.monthlyRent)}</p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
                    <Badge
                      variant="secondary"
                      className={cn(
                        room.available ? "bg-success/12 text-success" : "text-muted-foreground",
                      )}
                    >
                      {room.available ? "Available" : "Taken"}
                    </Badge>
                    {room.available ? <RequestThisRoomButton roomId={room.id} /> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardHeader>
            <p className="text-sm text-muted-foreground">
              {lowestRoomRent === null ? "Monthly rent" : "Rooms from"}
            </p>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {formatMoney(lowestRoomRent ?? property.monthlyRent)}
              <span className="text-sm font-normal text-muted-foreground"> / month</span>
            </CardTitle>
            {lowestRoomRent !== null ? (
              <p className="text-xs text-muted-foreground">
                Listed rent for the whole home: {formatMoney(property.monthlyRent)}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <RequestRoomCard
              propertyId={property.id}
              propertyTitle={property.title}
              rooms={property.rooms}
            />
            <p className="text-xs text-muted-foreground">
              No payment is taken now. You&apos;ll pay the first month by card after the landlord
              approves your request.
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <UserRoundIcon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Listed by</p>
              <p className="truncate font-medium">{property.owner.name}</p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

export default function PropertyPage({ params }: PageProps<"/properties/[id]">) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/properties">
          <ChevronLeftIcon data-icon="inline-start" />
          All homes
        </Link>
      </Button>
      <Suspense fallback={<PropertyDetailSkeleton />}>
        <PropertyDetail params={params} />
      </Suspense>
    </div>
  )
}
