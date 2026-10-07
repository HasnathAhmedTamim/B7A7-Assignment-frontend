"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useAuth } from "@/hooks/use-auth"
import { adminApi, propertiesApi, type AdminUsersQuery } from "@/lib/api/resources"
import { roleLabel } from "@/lib/labels"
import { queryKeys } from "@/lib/query-keys"
import type { Paginated } from "@/types/api"
import type { AdminUser, PropertyStatus, Role, UserStatus } from "@/types/models"

export function useAdminStats() {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: adminApi.stats,
    enabled: isReady,
  })
}

export function useAdminUsers(query: AdminUsersQuery) {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.admin.users(query),
    queryFn: () => adminApi.users(query),
    enabled: isReady,
    placeholderData: keepPreviousData,
  })
}

export type ModerationQuery = {
  status: PropertyStatus
  search?: string
  page: number
  limit: number
}

/** Every property in one status. Admins may list drafts and archived homes through `/properties`. */
export function useModerationProperties(query: ModerationQuery) {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.properties.moderation(query),
    queryFn: () => propertiesApi.list(query),
    enabled: isReady,
    placeholderData: keepPreviousData,
  })
}

export function useAuditLogs(query: { page: number; limit: number }) {
  const { isReady } = useAuth()
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(query),
    queryFn: () => adminApi.auditLogs(query),
    enabled: isReady,
    placeholderData: keepPreviousData,
  })
}

export type UserPatch = { status: UserStatus } | { role: Role }

function successMessage(user: AdminUser, patch: UserPatch) {
  if ("role" in patch) {
    const article = patch.role === "ADMIN" ? "an" : "a"
    return `${user.name} is now ${article} ${roleLabel[patch.role].toLowerCase()}.`
  }
  return patch.status === "BLOCKED"
    ? `${user.name} is blocked and can no longer sign in.`
    : `${user.name} can sign in again.`
}

/** Changes a user's status or role, reflected in every cached users page before the server answers. */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const listKey = ["admin", "users"] as const
  return useMutation({
    mutationFn: async ({ user, patch }: { user: AdminUser; patch: UserPatch }) => {
      if ("role" in patch) await adminApi.setUserRole(user.id, patch.role)
      else await adminApi.setUserStatus(user.id, patch.status)
    },
    onMutate: async ({ user, patch }) => {
      await queryClient.cancelQueries({ queryKey: listKey })
      const snapshot = queryClient.getQueriesData<Paginated<AdminUser>>({ queryKey: listKey })
      queryClient.setQueriesData<Paginated<AdminUser>>({ queryKey: listKey }, (page) =>
        page
          ? { ...page, data: page.data.map((u) => (u.id === user.id ? { ...u, ...patch } : u)) }
          : page,
      )
      return { snapshot }
    },
    onError: (_error, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSuccess: (_data, { user, patch }) => {
      toast.success(successMessage(user, patch))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }),
  })
}
