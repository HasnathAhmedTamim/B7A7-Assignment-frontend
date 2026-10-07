"use client"

import { ShieldCheckIcon, KeyRoundIcon, UserIcon, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { demoAccounts, type DemoAccount } from "@/config/demo-accounts"
import { env } from "@/config/env"
import type { Role } from "@/types/models"

const icons: Record<Role, LucideIcon> = {
  ADMIN: ShieldCheckIcon,
  LANDLORD: KeyRoundIcon,
  TENANT: UserIcon,
}

export function DemoLogin({
  onSelect,
  pendingEmail,
  disabled,
}: {
  onSelect: (account: DemoAccount) => void
  pendingEmail: string | null
  disabled: boolean
}) {
  if (!env.enableDemoLogin) return null

  return (
    <section aria-labelledby="demo-login-heading" className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <h2 id="demo-login-heading" className="text-xs font-medium text-muted-foreground">
          Or explore with a demo account
        </h2>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2">
        {demoAccounts.map((account) => {
          const Icon = icons[account.role]
          const pending = pendingEmail === account.email
          return (
            <Button
              key={account.role}
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 px-3 py-2.5 text-left"
              disabled={disabled}
              onClick={() => onSelect(account)}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                {pending ? <Spinner /> : <Icon className="size-4" aria-hidden />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">Login as {account.label}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {account.description}
                </span>
              </span>
            </Button>
          )
        })}
      </div>
    </section>
  )
}
