"use client"

import { MenuIcon } from "lucide-react"
import { useState } from "react"

import { UserMenu } from "@/components/layout/user-menu"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { roleHome } from "@/config/routes"
import { roleLabel } from "@/lib/labels"
import type { Role } from "@/types/models"

import { DashboardNav } from "./dashboard-nav"

export function DashboardTopbar({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="sr-only">{roleLabel[role]} navigation</SheetTitle>
            <Logo href={roleHome[role]} />
          </SheetHeader>
          <div className="overflow-y-auto px-3 py-4">
            <DashboardNav role={role} onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Logo href={roleHome[role]} className="lg:hidden" />

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <UserMenu showDashboardLink={false} />
      </div>
    </header>
  )
}
