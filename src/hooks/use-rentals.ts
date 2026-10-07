"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { refreshPublicListings } from "@/app/actions/listings"
import { useAuth } from "@/hooks/use-auth"
import { bookingsApi, paymentsApi, rentalRequestsApi } from "@/lib/api/resources"
import { queryKeys } from "@/lib/query-keys"
import type { Booking, BookingStatus, RentalRequest, RentalRequestStatus } from "@/types/models"

/** Requests the signed-in tenant has sent. */
export function useMyRentalRequests() {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.rentalRequests.mine,
    queryFn: () => rentalRequestsApi.mine(),
    enabled: isReady,
  })
}

/** Requests received for the signed-in landlord's properties. */
export function useReceivedRentalRequests() {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.rentalRequests.received,
    queryFn: () => rentalRequestsApi.received(),
    enabled: isReady,
  })
}

/** Role-scoped: a tenant's own, a landlord's properties', or every booking for admins. */
export function useBookings() {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.bookings.mine,
    queryFn: () => bookingsApi.mine(),
    enabled: isReady,
  })
}

export function useBooking(bookingId: string) {
  const { isReady } = useAuth()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => bookingsApi.get(bookingId),
    enabled: isReady,
    initialData: () =>
      queryClient
        .getQueryData<Booking[]>(queryKeys.bookings.mine)
        ?.find((booking) => booking.id === bookingId),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.bookings.mine)?.dataUpdatedAt,
  })
}

export function useMyPayments() {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.payments.mine,
    queryFn: () => paymentsApi.mine(),
    enabled: isReady,
  })
}

type ListSnapshot<T> = Array<[readonly unknown[], T[] | undefined]>

function useOptimisticStatus<T extends { id: string; status: S }, S extends string>(
  listKey: readonly unknown[],
) {
  const queryClient = useQueryClient()
  return {
    async apply(id: string, status: S): Promise<ListSnapshot<T>> {
      await queryClient.cancelQueries({ queryKey: listKey })
      const snapshot = queryClient.getQueriesData<T[]>({ queryKey: listKey })
      queryClient.setQueriesData<T[]>({ queryKey: listKey }, (list) =>
        list?.map((item) => (item.id === id ? { ...item, status } : item)),
      )
      return snapshot
    },
    rollback(snapshot: ListSnapshot<T> | undefined) {
      snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
  }
}

export function useCancelRentalRequest() {
  const queryClient = useQueryClient()
  const optimistic = useOptimisticStatus<RentalRequest, RentalRequestStatus>(
    queryKeys.rentalRequests.mine,
  )
  return useMutation({
    mutationFn: (requestId: string) => rentalRequestsApi.cancel(requestId),
    onMutate: (requestId) => optimistic.apply(requestId, "CANCELLED"),
    onError: (_error, _id, snapshot) => optimistic.rollback(snapshot),
    onSuccess: () => toast.success("Request cancelled"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.rentalRequests.all }),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  const optimistic = useOptimisticStatus<Booking, BookingStatus>(queryKeys.bookings.mine)
  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancel(bookingId),
    onMutate: async (bookingId) => {
      const detailKey = queryKeys.bookings.detail(bookingId)
      await queryClient.cancelQueries({ queryKey: detailKey })
      const detail = queryClient.getQueryData<Booking>(detailKey)
      if (detail) queryClient.setQueryData<Booking>(detailKey, { ...detail, status: "CANCELLED" })
      return { list: await optimistic.apply(bookingId, "CANCELLED"), detail }
    },
    onError: (_error, bookingId, context) => {
      optimistic.rollback(context?.list)
      if (context?.detail)
        queryClient.setQueryData(queryKeys.bookings.detail(bookingId), context.detail)
    },
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.bookings.detail(booking.id), booking)
      toast.success("Booking cancelled. The room is open to other renters again.")
      void refreshPublicListings(booking.property.id).catch(() => undefined)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.rentalRequests.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
      ]),
  })
}
