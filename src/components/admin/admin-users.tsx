"use client"

import { ChevronDownIcon, UsersIcon } from "lucide-react"
import { useState } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DataTable, DataTableSkeleton, type Column } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { PaginationBar } from "@/components/shared/pagination-bar"
import { SearchInput } from "@/components/shared/search-input"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatusTabs } from "@/components/shared/status-tabs"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { demoAccounts } from "@/config/demo-accounts"
import { useAdminUsers, useUpdateUser, type UserPatch } from "@/hooks/use-admin"
import { useAuth } from "@/hooks/use-auth"
import { enumParam, pageParam, useUrlParams } from "@/hooks/use-url-params"
import { formatDate } from "@/lib/format"
import { roleLabel } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { ROLES, USER_STATUSES, type AdminUser, type Role } from "@/types/models"

const PAGE_SIZE = 20
const demoEmails = new Set(demoAccounts.map((account) => account.email))

const roleDescription: Record<Role, string> = {
  TENANT: "They'll be able to request rooms and pay rent.",
  LANDLORD: "They'll be able to list properties and review rental requests.",
  ADMIN: "They'll get full access to moderate users, listings and payments.",
}

type Pending = { user: AdminUser; patch: UserPatch }

function confirmCopy({ user, patch }: Pending) {
  if ("role" in patch) {
    return {
      title: `Make ${user.name} ${patch.role === "ADMIN" ? "an" : "a"} ${roleLabel[patch.role].toLowerCase()}?`,
      description: `${roleDescription[patch.role]} The change is recorded in the audit log.`,
      confirmLabel: `Change to ${roleLabel[patch.role].toLowerCase()}`,
      destructive: false,
    }
  }
  return patch.status === "BLOCKED"
    ? {
        title: `Block ${user.name}?`,
        description:
          "They lose access straight away and can't sign in until you unblock them. Their listings, requests and bookings are kept.",
        confirmLabel: "Block user",
        destructive: true,
      }
    : {
        title: `Unblock ${user.name}?`,
        description: "They'll be able to sign in and use their account again.",
        confirmLabel: "Unblock user",
        destructive: false,
      }
}

function UserCell({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar name={user.name} image={user.profileImage} />
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-1.5 font-medium">
          <span className="truncate">{user.name}</span>
          {isSelf ? <Badge variant="outline">You</Badge> : null}
          {demoEmails.has(user.email) ? <Badge variant="outline">Demo</Badge> : null}
        </p>
        <p className="truncate text-sm font-normal text-muted-foreground">{user.email}</p>
      </div>
    </div>
  )
}

function UserActions({
  user,
  isSelf,
  onRequest,
}: {
  user: AdminUser
  isSelf: boolean
  onRequest: (pending: Pending) => void
}) {
  if (isSelf) return null
  const blocked = user.status === "BLOCKED"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Manage ${user.name}`}>
          Manage
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Change role</DropdownMenuLabel>
        {ROLES.filter((role) => role !== user.role).map((role) => (
          <DropdownMenuItem key={role} onSelect={() => onRequest({ user, patch: { role } })}>
            Make {roleLabel[role].toLowerCase()}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={blocked ? "default" : "destructive"}
          onSelect={() => onRequest({ user, patch: { status: blocked ? "ACTIVE" : "BLOCKED" } })}
        >
          {blocked ? "Unblock user" : "Block user"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type StatusFilter = "all" | (typeof USER_STATUSES)[number]

export function AdminUsers() {
  const { user: me } = useAuth()
  const { params, set, isPending } = useUrlParams()
  const page = pageParam(params.get("page"))
  const role = enumParam(params.get("role"), ROLES)
  const status = enumParam(params.get("status"), USER_STATUSES)
  const search = params.get("search")?.trim() ?? ""

  const users = useAdminUsers({
    page,
    limit: PAGE_SIZE,
    role,
    status,
    search: search || undefined,
  })
  const update = useUpdateUser()
  const [pending, setPending] = useState<Pending | null>(null)

  const columns: Column<AdminUser>[] = [
    {
      id: "user",
      header: "User",
      cell: (u) => <UserCell user={u} isSelf={u.id === me?.id} />,
    },
    { id: "role", header: "Role", cell: (u) => roleLabel[u.role] },
    { id: "status", header: "Status", cell: (u) => <StatusBadge kind="user" status={u.status} /> },
    {
      id: "phone",
      header: "Phone",
      cell: (u) => u.phone ?? <span className="text-muted-foreground">—</span>,
      hideOnMobile: true,
    },
    {
      id: "joined",
      header: "Joined",
      cell: (u) => <span className="whitespace-nowrap">{formatDate(u.createdAt)}</span>,
      hideOnMobile: true,
    },
  ]

  const filtered = Boolean(role || status || search)
  const data = users.data
  const copy = pending ? confirmCopy(pending) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <StatusTabs<StatusFilter>
          label="Filter users by status"
          value={status ?? "all"}
          onValueChange={(value) => set({ status: value === "all" ? null : value, page: null })}
          tabs={[
            { value: "all", label: "All" },
            { value: "ACTIVE", label: "Active" },
            { value: "BLOCKED", label: "Blocked" },
          ]}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={role ?? "all"}
            onValueChange={(value) => set({ role: value === "all" ? null : value, page: null })}
          >
            <SelectTrigger className="w-full sm:w-40" aria-label="Filter by role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {roleLabel[r]}s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput
            value={search}
            onChange={(value) => set({ search: value, page: null })}
            placeholder="Name, email or phone"
            label="Search users"
            className="sm:w-72"
          />
        </div>
      </div>

      {users.isError && !data ? (
        <ErrorState error={users.error} onRetry={() => void users.refetch()} />
      ) : !data ? (
        <DataTableSkeleton columns={5} rows={8} />
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={filtered ? "No users match" : page > 1 ? "This page is empty" : "No users yet"}
          description={filtered ? "Try a different search, role or status." : undefined}
          action={
            filtered || page > 1 ? (
              <Button
                variant="outline"
                onClick={() => set({ role: null, status: null, search: null, page: null })}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={cn(
            "space-y-4 transition-opacity",
            (isPending || users.isPlaceholderData) && "opacity-60",
          )}
        >
          <DataTable
            caption="Users"
            columns={columns}
            rows={data.data}
            getRowId={(u) => u.id}
            actions={(u) => (
              <UserActions user={u} isSelf={u.id === me?.id} onRequest={setPending} />
            )}
          />
          <PaginationBar
            meta={data.meta}
            onPageChange={(next) => set({ page: next > 1 ? next : null })}
          />
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={copy?.title ?? ""}
        description={copy?.description}
        confirmLabel={copy?.confirmLabel}
        destructive={copy?.destructive}
        onConfirm={() => {
          if (pending) update.mutate(pending)
          setPending(null)
        }}
      />
    </div>
  )
}
