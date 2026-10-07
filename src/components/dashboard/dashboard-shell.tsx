import type { ReactNode } from "react"

import { Logo } from "@/components/shared/logo"
import { roleHome } from "@/config/routes"
import { roleLabel } from "@/lib/labels"
import type { Role } from "@/types/models"

import { DashboardNav } from "./dashboard-nav"
import { DashboardTopbar } from "./dashboard-topbar"

/** Role-specific workspace chrome. Access is enforced by the proxy before this renders. */
export function DashboardShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/30 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Logo href={roleHome[role]} />
        </div>
        <p className="px-6 pt-4 text-xs font-medium tracking-wide text-primary uppercase">
          {roleLabel[role]} workspace
        </p>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <DashboardNav role={role} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <DashboardTopbar role={role} />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
