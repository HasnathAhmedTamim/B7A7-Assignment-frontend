"use client"

import { LayoutDashboardIcon, LogOutIcon, UserCogIcon } from "lucide-react"
import Link from "next/link"

import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { profileHref } from "@/config/nav"
import { roleHome } from "@/config/routes"
import { useAuth, useSignOut } from "@/hooks/use-auth"
import { roleLabel } from "@/lib/labels"

export function UserMenu({ showDashboardLink = true }: { showDashboardLink?: boolean }) {
  const { user, status } = useAuth()
  const signOut = useSignOut()

  if (status === "loading" && !user) {
    return <Skeleton className="size-8 rounded-full" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/register">Get started</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
          <UserAvatar name={user.name} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs font-medium text-primary">{roleLabel[user.role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {showDashboardLink ? (
            <DropdownMenuItem asChild>
              <Link href={roleHome[user.role]}>
                <LayoutDashboardIcon />
                Dashboard
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href={profileHref[user.role]}>
              <UserCogIcon />
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signOut.isPending}
          onSelect={(event) => {
            event.preventDefault()
            signOut.mutate()
          }}
        >
          {signOut.isPending ? <Spinner /> : <LogOutIcon />}
          {signOut.isPending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
