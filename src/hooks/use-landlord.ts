"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { refreshPublicListings } from "@/app/actions/listings"
import { useAuth } from "@/hooks/use-auth"
import {
  propertiesApi,
  rentalRequestsApi,
  roomsApi,
  type MyPropertiesQuery,
  type PropertyInput,
  type RoomInput,
} from "@/lib/api/resources"
import { queryKeys } from "@/lib/query-keys"
import type { Paginated } from "@/types/api"
import type { Property, PropertyDetail, PropertyStatus, RentalRequest } from "@/types/models"

/** Fire-and-forget: a failed cache refresh only delays the public pages by a few minutes. */
function refreshListings(propertyId?: string) {
  void refreshPublicListings(propertyId).catch(() => undefined)
}

export function useMyProperties(query: MyPropertiesQuery) {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.properties.mine(query),
    queryFn: () => propertiesApi.mine(query),
    enabled: isReady,
    placeholderData: keepPreviousData,
  })
}

export function useManagedProperty(propertyId: string) {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.properties.detail(propertyId),
    queryFn: () => propertiesApi.get(propertyId),
    enabled: isReady,
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PropertyInput) => propertiesApi.create(input),
    meta: { suppressErrorToast: true },
    onSuccess: (property) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
      if (property.status === "PUBLISHED") refreshListings(property.id)
    },
  })
}

export function useUpdateProperty(propertyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<PropertyInput>) => propertiesApi.update(propertyId, input),
    meta: { suppressErrorToast: true },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
      refreshListings(propertyId)
    },
  })
}

/** Status changes from list rows, applied optimistically to every cached page. */
export function useSetPropertyStatus() {
  const queryClient = useQueryClient()
  const listKey = ["properties", "mine"] as const
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PropertyStatus }) =>
      propertiesApi.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const snapshot = queryClient.getQueriesData<Paginated<Property>>({ queryKey: listKey })
      queryClient.setQueriesData<Paginated<Property>>({ queryKey: listKey }, (page) =>
        page ? { ...page, data: page.data.map((p) => (p.id === id ? { ...p, status } : p)) } : page,
      )
      queryClient.setQueryData<PropertyDetail>(queryKeys.properties.detail(id), (detail) =>
        detail ? { ...detail, status } : detail,
      )
      return { snapshot }
    },
    onError: (_error, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSuccess: (property) => {
      const verb: Record<PropertyStatus, string> = {
        PUBLISHED: "published. Renters can find it now",
        DRAFT: "moved to drafts. It's hidden from renters",
        ARCHIVED: "archived. It's hidden from renters",
      }
      toast.success(`"${property.title}" ${verb[property.status]}.`)
      refreshListings(property.id)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (propertyId: string) => propertiesApi.remove(propertyId),
    onSuccess: (_data, propertyId) => {
      toast.success("Property deleted. Its pending requests were declined automatically.")
      queryClient.removeQueries({ queryKey: queryKeys.properties.detail(propertyId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.rentalRequests.all })
      refreshListings(propertyId)
    },
  })
}

function useRoomMutationDefaults(propertyId: string) {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.rentalRequests.all })
    refreshListings(propertyId)
  }
}

export function useSaveRoom(propertyId: string) {
  const settle = useRoomMutationDefaults(propertyId)
  return useMutation({
    mutationFn: ({ roomId, input }: { roomId?: string; input: RoomInput }) =>
      roomId ? roomsApi.update(roomId, input) : roomsApi.create(propertyId, input),
    meta: { suppressErrorToast: true },
    onSuccess: settle,
  })
}

export function useToggleRoomAvailability(propertyId: string) {
  const queryClient = useQueryClient()
  const settle = useRoomMutationDefaults(propertyId)
  const detailKey = queryKeys.properties.detail(propertyId)
  return useMutation({
    mutationFn: ({ roomId, available }: { roomId: string; available: boolean }) =>
      roomsApi.update(roomId, { available }),
    onMutate: async ({ roomId, available }) => {
      await queryClient.cancelQueries({ queryKey: detailKey })
      const previous = queryClient.getQueryData<PropertyDetail>(detailKey)
      queryClient.setQueryData<PropertyDetail>(detailKey, (detail) =>
        detail
          ? {
              ...detail,
              rooms: detail.rooms.map((r) => (r.id === roomId ? { ...r, available } : r)),
            }
          : detail,
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(detailKey, context.previous)
    },
    onSettled: settle,
  })
}

export function useDeleteRoom(propertyId: string) {
  const settle = useRoomMutationDefaults(propertyId)
  return useMutation({
    mutationFn: (roomId: string) => roomsApi.remove(roomId),
    onSuccess: () => {
      toast.success("Room removed")
      settle()
    },
  })
}

type Decision = "approve" | "reject"

/** Approve or decline a received request, reflected in the list before the server answers. */
export function useDecideRentalRequest() {
  const queryClient = useQueryClient()
  const key = queryKeys.rentalRequests.received
  return useMutation({
    mutationFn: async ({ request, decision }: { request: RentalRequest; decision: Decision }) => {
      if (decision === "approve") await rentalRequestsApi.approve(request.id)
      else await rentalRequestsApi.reject(request.id)
    },
    onMutate: async ({ request, decision }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<RentalRequest[]>(key)
      const status = decision === "approve" ? "APPROVED" : "REJECTED"
      queryClient.setQueryData<RentalRequest[]>(key, (list) =>
        list?.map((r) => (r.id === request.id ? { ...r, status } : r)),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSuccess: (_data, { request, decision }) => {
      toast.success(
        decision === "approve"
          ? `Approved. ${request.tenant.name} can now pay to confirm ${request.room.name}.`
          : `Request from ${request.tenant.name} declined.`,
      )
      if (decision === "approve") refreshListings(request.property.id)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.rentalRequests.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
      ]),
  })
}
