"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"

import { dashboardNav, type NavItem } from "@/config/nav"
import { cn } from "@/lib/utils"
import type { Role } from "@/types/models"

type Props = { role: Role; onNavigate?: () => void }

function isActive(pathname: string | null, item: NavItem) {
  if (!pathname) return false
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function NavList({ role, onNavigate, pathname }: Props & { pathname: string | null }) {
  return (
    <div className="flex flex-col gap-5">
      {dashboardNav[role].map((section, index) => (
        <div key={section.title ?? index} className="flex flex-col gap-0.5">
          {section.title ? (
            <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">{section.title}</p>
          ) : null}
          {section.items.map((item) => {
            const active = isActive(pathname, item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                )}
              >
                <item.icon
                  className={cn("size-4 shrink-0", active ? "text-primary" : "opacity-70")}
                  aria-hidden
                />
                {item.title}
              </Link>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function ActiveNavList(props: Props) {
  return <NavList {...props} pathname={usePathname()} />
}

export function DashboardNav(props: Props) {
  return (
    <nav aria-label="Dashboard">
      <Suspense fallback={<NavList {...props} pathname={null} />}>
        <ActiveNavList {...props} />
      </Suspense>
    </nav>
  )
}
